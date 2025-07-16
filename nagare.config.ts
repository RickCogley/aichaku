import type { NagareConfig } from "@rick/nagare/types";
import { TemplateFormat } from "@rick/nagare/types";

export default {
  project: {
    name: "Aichaku",
    description:
      "AI-optimized project methodology installer for Claude Code - brings affection (愛着) to your development workflow",
    repository: "https://github.com/RickCogley/aichaku",
    homepage: "https://github.com/RickCogley/aichaku",
    license: "MIT",
    author: "Rick Cogley",
  },

  versionFile: {
    path: "./version.ts",
    template: TemplateFormat.TYPESCRIPT,
  },

  updateFiles: [
    {
      path: "./deno.json",
      updateFn: (content: string, data: { version: string }) => {
        // Parse the JSON to safely update only the top-level version
        try {
          const config = JSON.parse(content);
          config.version = data.version;
          return JSON.stringify(config, null, 2);
        } catch (_error) {
          // Fallback to regex if JSON parsing fails
          return content.replace(
            /^(\s*"version":\s*)"[^"]+"/m,
            `$1"${data.version}"`,
          );
        }
      },
    },
    {
      path: "./README.md",
      // Using built-in handler for standard badge format
    },
    {
      path: "./mod.ts",
      patterns: {
        version: /(\| Version \| )([^\s]+)( \|)/,
      },
      updateFn: (content: string, data: { version: string }) => {
        return content.replace(
          /(\| Version \| )([^\s]+)( \|)/,
          `$1${data.version}$3`,
        );
      },
    },
  ],

  releaseNotes: {
    includeCommitHashes: true,
    maxDescriptionLength: 120,
  },

  github: {
    owner: "RickCogley",
    repo: "aichaku",
    createRelease: true,
  },

  options: {
    tagPrefix: "v",
    gitRemote: "origin",
  },

  release: {
    // Verify package appears on JSR after release
    verifyJsrPublish: true,

    // Auto-fix configuration for CI/CD errors
    autoFix: {
      basic: true, // Enable deterministic fixes
      ai: {
        enabled: true, // Enable AI-powered fixes
        provider: "claude-code",
        // Choose thinking level based on your plan:
        // - "think": Basic analysis (lowest token usage)
        // - "megathink": Deeper analysis (medium token usage)
        // - "ultrathink": Deepest analysis (highest token usage)
        thinkingLevel: "ultrathink", // You have the max plan
        maxAttempts: 5,
      },
      types: [
        "lint",
        "format",
        "security-scan",
        "type-check",
        "version-conflict",
      ],
    },

    // Progress visualization
    progress: {
      enabled: true,
      style: "detailed",
      showElapsedTime: true,
    },

    // GitHub Actions monitoring
    monitoring: {
      workflowFile: ".github/workflows/publish.yml",
      pollInterval: 10000, // 10 seconds
      timeout: 600000, // 10 minutes
    },
  },

  docs: {
    enabled: false, // Temporarily disabled due to Nagare dependency issue
    outputDir: "./docs/api",
    includePrivate: false,
  },

  hooks: {
    preRelease: [
      async () => {
        console.log("🔍 Running format check...");
        const fmtCheck = new Deno.Command("deno", {
          args: ["fmt", "--check"],
        });
        const fmtResult = await fmtCheck.output();
        if (!fmtResult.success) {
          throw new Error("Format check failed");
        }

        console.log("🔍 Running linter...");
        const lintCmd = new Deno.Command("deno", {
          args: ["lint"],
        });
        const lintResult = await lintCmd.output();
        if (!lintResult.success) {
          throw new Error("Lint check failed");
        }

        console.log("🔍 Running type check...");
        const checkCmd = new Deno.Command("deno", {
          args: [
            "check",
            "cli.ts",
            "mod.ts",
            "src/commands/cleanup.ts",
            "src/commands/content-fetcher.ts",
            "src/commands/docs-lint.ts",
            "src/commands/docs-standard.ts",
            "src/commands/github.ts",
            "src/commands/help.ts",
            "src/commands/hooks.ts",
            "src/commands/init.ts",
            "src/commands/integrate.ts",
            "src/commands/learn.ts",
            "src/commands/mcp-daemon.ts",
            "src/commands/mcp.ts",
            "src/commands/migrate.ts",
            "src/commands/review.ts",
            "src/commands/standards.ts",
            "src/commands/uninstall.ts",
            "src/commands/upgrade-fix.ts",
            "src/commands/upgrade.ts",
            "src/installer.ts",
            "src/linters/*.ts",
            "src/migration/folder-migration.ts",
            "src/paths.ts",
            "src/types.ts",
            "src/updater.ts",
            "src/utils/branded-messages.ts",
            "src/utils/dynamic-content-discovery.ts",
            "src/utils/feedback.ts",
            "src/utils/logger.ts",
            "src/utils/mcp-client.ts",
            "src/utils/mcp-http-client.ts",
            "src/utils/mcp-socket-client.ts",
            "src/utils/mcp-tcp-client.ts",
            "src/utils/path-security.ts",
            "src/utils/project-paths.ts",
            "src/utils/terminal-formatter.ts",
            "src/utils/ui.ts",
            "src/utils/version-checker.ts",
            "src/utils/yaml-config-reader.ts",
            "mcp/*/src/**/*.ts",
            "nagare.config.ts",
            "nagare-launcher.ts",
            "version.ts",
          ],
        });
        const checkResult = await checkCmd.output();
        if (!checkResult.success) {
          const errorText = new TextDecoder().decode(checkResult.stderr);
          console.error("Type check stderr:", errorText);
          throw new Error(`Type check failed: ${errorText}`);
        }

        // TODO: Re-enable tests when we have test coverage // DevSkim: ignore DS176209 - Legitimate TODO for test coverage
        // console.log("🧪 Running tests...");
        // const testCmd = new Deno.Command("deno", {
        //   args: ["test", "--allow-read", "--allow-write", "--allow-env"],
        // });
        // const testResult = await testCmd.output();
        // if (!testResult.success) {
        //   throw new Error("Tests failed");
        // }

        console.log("✅ All pre-release checks passed");
      },
    ],
    postRelease: [
      async () => {
        console.log("🔨 Building and uploading binaries...");

        // Run package-and-upload script which handles everything
        const packageCmd = new Deno.Command("deno", {
          args: ["run", "-A", "./scripts/package-and-upload.ts"],
          stdout: "inherit",
          stderr: "inherit",
        });

        const packageResult = await packageCmd.output();
        if (!packageResult.success) {
          console.error(
            "⚠️  Binary packaging/upload failed - continuing anyway",
          );
          // Don't throw - this is post-release, so the release already succeeded
        } else {
          console.log("✅ Binaries packaged and uploaded to GitHub release");
        }
      },
    ],
  },
} satisfies NagareConfig;
