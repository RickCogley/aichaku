# Execution Plan: Release Automation Enhancement

## Technical Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Release CLI Command                        │
│                  (deno task release)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                  Release Orchestrator                         │
│              (State Machine & Coordination)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        │                 │                 │                 │
┌───────┴────────┐ ┌──────┴──────┐ ┌───────┴────────┐ ┌──────┴──────┐
│   Validation   │ │  Registry   │ │      Git       │ │   Binary    │
│   Framework    │ │ Publishers  │ │   Operations   │ │  Manager    │
└────────────────┘ └─────────────┘ └────────────────┘ └─────────────┘
```

### Directory Structure

```
scripts/
└── release/
    ├── mod.ts                    # Main entry point
    ├── release.config.ts         # Configuration schema
    ├── orchestrator/
    │   ├── mod.ts               # Release orchestrator
    │   ├── state-machine.ts     # State management
    │   └── types.ts             # Shared types
    ├── validation/
    │   ├── mod.ts               # Validation framework
    │   ├── type-checker.ts      # Deno type checking
    │   ├── git-validator.ts     # Git state checks
    │   ├── version-checker.ts   # Version consistency
    │   ├── registry-checker.ts  # Registry readiness
    │   └── test-runner.ts       # Test execution
    ├── publishers/
    │   ├── mod.ts               # Publisher interface
    │   ├── npm-publisher.ts     # NPM publishing
    │   ├── jsr-publisher.ts     # JSR publishing
    │   └── retry-logic.ts       # Retry utilities
    ├── git/
    │   ├── mod.ts               # Git operations
    │   ├── tag-manager.ts       # Tag creation/pushing
    │   └── state-checker.ts     # Working tree status
    ├── binary/
    │   ├── mod.ts               # Binary management
    │   ├── builder.ts           # Multi-platform builds
    │   ├── github-release.ts    # GitHub release API
    │   └── checksum.ts          # Integrity verification
    └── utils/
        ├── logger.ts            # Logging with progress
        ├── error-handler.ts     # Error recovery
        └── cli-ui.ts            # Terminal UI helpers
```

## Implementation Details

### 1. Configuration Schema (release.config.ts)

```typescript
export interface ReleaseConfig {
  registries: {
    npm: {
      enabled: boolean;
      registry?: string;
      token?: string;
    };
    jsr: {
      enabled: boolean;
      token?: string;
    };
  };

  binaries: {
    enabled: boolean;
    platforms: Platform[];
    uploadToGitHub: boolean;
    checksums: boolean;
  };

  validation: {
    typeCheck: boolean;
    tests: boolean;
    lint: boolean;
    security: boolean;
    coverage?: number;
  };

  git: {
    tagPrefix: string;
    pushTags: boolean;
    requireCleanTree: boolean;
    defaultBranch: string;
  };

  dryRun?: boolean;
  resumeFrom?: ReleasePhase;
}

export const defaultConfig: ReleaseConfig = {
  registries: {
    npm: { enabled: true },
    jsr: { enabled: true },
  },
  binaries: {
    enabled: true,
    platforms: ["darwin-x64", "darwin-arm64", "linux-x64", "windows-x64"],
    uploadToGitHub: true,
    checksums: true,
  },
  validation: {
    typeCheck: true,
    tests: true,
    lint: true,
    security: true,
    coverage: 80,
  },
  git: {
    tagPrefix: "v",
    pushTags: true,
    requireCleanTree: true,
    defaultBranch: "main",
  },
};
```

### 2. State Machine Design

```typescript
enum ReleasePhase {
  INIT = "init",
  VALIDATING = "validating",
  BUILDING = "building",
  PUBLISHING*NPM = "publishing*npm",
  PUBLISHING*JSR = "publishing*jsr",
  TAGGING = "tagging",
  UPLOADING*BINARIES = "uploading*binaries",
  COMPLETED = "completed",
  FAILED = "failed",
  ROLLED*BACK = "rolled*back",
}

interface ReleaseState {
  phase: ReleasePhase;
  version: string;
  startTime: Date;
  completedPhases: ReleasePhase[];
  errors: ReleaseError[];
  artifacts: {
    npmPublished: boolean;
    jsrPublished: boolean;
    tagCreated: boolean;
    tagPushed: boolean;
    binariesBuilt: string[];
    binariesUploaded: boolean;
  };
}
```

### 3. Validation Framework

```typescript
// Type checking with proper Deno context
export class TypeChecker implements Validator {
  async validate(): Promise<ValidationResult> {
    const result = await runCommand([
      "deno",
      "check",
      "--unstable",
      "**/*.ts",
      "**/*.tsx",
    ]);

    if (result.code !== 0) {
      // Parse errors and provide actionable fixes
      const errors = parseTypeErrors(result.stderr);
      return {
        success: false,
        errors: errors.map((e) => ({
          file: e.file,
          line: e.line,
          message: e.message,
          suggestion: getSuggestion(e),
        })),
      };
    }

    return { success: true };
  }
}
```

### 4. Registry Publishers with Retry

```typescript
export class NpmPublisher implements Publisher {
  async publish(version: string, config: PublishConfig): Promise<void> {
    await this.validateAuth();

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Publishing to NPM (attempt ${attempt}/${maxRetries})...`);

        await runCommand([
          "npm",
          "publish",
          "--access",
          "public",
          ...(config.dryRun ? ["--dry-run"] : []),
        ]);

        logger.success("NPM publish successful!");
        return;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          logger.warn(`Attempt ${attempt} failed, retrying in 5s...`);
          await delay(5000);
        }
      }
    }

    throw new PublishError("NPM publish failed after all retries", lastError);
  }
}
```

### 5. Git Operations

```typescript
export class GitManager {
  async createAndPushTag(version: string, prefix: string): Promise<void> {
    const tag = `${prefix}${version}`;

    // Create annotated tag
    await runCommand(["git", "tag", "-a", tag, "-m", `Release ${version}`]);

    // Push tag to remote
    await runCommand(["git", "push", "origin", tag]);

    logger.success(`Tag ${tag} created and pushed`);
  }

  async validateCleanTree(): Promise<void> {
    const status = await runCommand(["git", "status", "--porcelain"]);
    if (status.stdout.trim()) {
      throw new ValidationError(
        "Working tree is not clean. Commit or stash changes before release.",
      );
    }
  }
}
```

### 6. Binary Builder Integration

```typescript
export class BinaryBuilder {
  async buildForPlatforms(platforms: Platform[]): Promise<BuildResult[]> {
    const results: BuildResult[] = [];

    for (const platform of platforms) {
      logger.info(`Building for ${platform}...`);

      const [os, arch] = platform.split("-");
      const outputPath = `./dist/aichaku-${os}-${arch}`;

      await runCommand([
        "deno",
        "compile",
        "--allow-all",
        "--target",
        platform,
        "--output",
        outputPath,
        "./cli.ts",
      ]);

      const checksum = await generateChecksum(outputPath);
      results.push({
        platform,
        path: outputPath,
        checksum,
        size: await getFileSize(outputPath),
      });
    }

    return results;
  }
}
```

### 7. Error Recovery System

```typescript
export class ReleaseErrorHandler {
  async handleError(
    error: Error,
    state: ReleaseState,
    config: ReleaseConfig,
  ): Promise<RecoveryAction> {
    logger.error(`Release failed in phase: ${state.phase}`);
    logger.error(error.message);

    // Determine recovery action based on phase and error type
    if (
      state.phase === ReleasePhase.PUBLISHING_NPM &&
      state.artifacts.npmPublished
    ) {
      return {
        action: "continue",
        message: "NPM already published, continuing with JSR...",
      };
    }

    if (config.resumeFrom) {
      return {
        action: "resume",
        fromPhase: config.resumeFrom,
        message: `Resuming from ${config.resumeFrom} phase...`,
      };
    }

    // Offer rollback for critical failures
    if (state.artifacts.npmPublished || state.artifacts.jsrPublished) {
      const shouldRollback = await confirm("Rollback published packages?");
      if (shouldRollback) {
        return { action: "rollback" };
      }
    }

    return { action: "abort" };
  }
}
```

### 8. CLI Entry Point

```typescript
// scripts/release/mod.ts
export async function main() {
  const args = parseArgs(Deno.args);
  const config = await loadConfig(args);

  const orchestrator = new ReleaseOrchestrator(config);
  const ui = new ReleaseUI();

  orchestrator.on("phase:start", (phase) => {
    ui.updateProgress(phase);
  });

  orchestrator.on("phase:complete", (phase) => {
    ui.markComplete(phase);
  });

  try {
    await orchestrator.run();
    ui.showSuccess("Release completed successfully!");
  } catch (error) {
    ui.showError(error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
```

### 9. Progress UI

```typescript
export class ReleaseUI {
  private spinner = new Spinner();
  private phases = [
    "Validation",
    "Building",
    "Publishing NPM",
    "Publishing JSR",
    "Git Tagging",
    "Uploading Binaries",
  ];

  updateProgress(phase: ReleasePhase) {
    this.spinner.start(
      `${this.getPhaseEmoji(phase)} ${this.getPhaseText(phase)}`,
    );
  }

  markComplete(phase: ReleasePhase) {
    this.spinner.succeed(`✅ ${this.getPhaseText(phase)} completed`);
  }

  showSuccess(message: string) {
    console.log(chalk.green.bold(`\n🎉 ${message}`));
    this.showSummary();
  }

  private showSummary() {
    console.log("\n📊 Release Summary:");
    console.log("  • NPM: ✅ Published");
    console.log("  • JSR: ✅ Published");
    console.log("  • Git: ✅ Tagged and pushed");
    console.log("  • Binaries: ✅ 4 platforms uploaded");
    console.log("  • Duration: 2m 34s");
  }
}
```

## Integration Points

### Deno.json Updates

```json
{
  "tasks": {
    "release": "deno run -A scripts/release/mod.ts",
    "release:dry": "deno run -A scripts/release/mod.ts --dry-run",
    "release:npm-only": "deno run -A scripts/release/mod.ts --registries=npm",
    "release:no-binaries": "deno run -A scripts/release/mod.ts --no-binaries"
  }
}
```

### Environment Variables

```bash
# .env.release
NPM*TOKEN=npm*xxx
JSR*TOKEN=jsr*xxx
GITHUB_TOKEN=ghp*xxx
```

## Testing Strategy

1. **Unit Tests**: Each component tested in isolation
2. **Integration Tests**: Full release flow with mocked registries
3. **Dry Run Mode**: Safe testing of complete process
4. **Platform Testing**: CI matrix for all target platforms

## Migration Path

1. Keep existing scripts functional during development
2. Add new `release` task alongside existing ones
3. Gradual migration with feature flags
4. Deprecate old scripts after validation period

## Success Criteria

- [ ] Single command releases without manual intervention
- [ ] All validations complete in <30 seconds
- [ ] Clear error messages with actionable fixes
- [ ] Successful recovery from transient failures
- [ ] Binary uploads integrated with version release
- [ ] Complete rollback capability for failed releases
