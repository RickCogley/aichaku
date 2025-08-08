# Git Hooks Integration - Implementation Plan

## Repository Structure

### Source Location (in aichaku repo)

```
docs/
├── core/
│   ├── githook-templates/      # Git hook templates
│   │   ├── hooks.d/
│   │   │   ├── 05-type-check
│   │   │   ├── 06-no-any
│   │   │   ├── 07-docs-check
│   │   │   ├── 10-format-code
│   │   │   ├── 15-lint-typescript
│   │   │   ├── 20-lint-markdown
│   │   │   ├── 30-run-tests
│   │   │   └── 40-security-check
│   │   ├── pre-commit          # Main orchestrator
│   │   └── README.md          # Hook documentation
│   ├── agent-templates/
│   ├── methodology-templates/
│   └── ...
```

### Deployment Location (after `aichaku init`)

```
~/.claude/aichaku/
├── githooks/                   # Deployed git hooks
│   ├── hooks.d/
│   │   └── [all hook files]
│   └── pre-commit
├── docs/
├── methodologies/
└── ...
```

### Project Installation (after `aichaku githooks --install`)

```
<project-root>/
├── .aichaku-githooks/          # DEFAULT: Always use namespaced folder
│   ├── hooks.d/
│   │   └── [selected hooks]
│   └── pre-commit
└── .git/
    └── config                  # User must manually update if desired
```

## File Flow

1. **Development** → Hooks live in `docs/core/githook-templates/`
2. **Package** → Published to JSR with aichaku
3. **Install** → Copied to `~/.claude/aichaku/githooks/` during `aichaku init`
4. **Deploy** → Linked/copied to project `.aichaku-githooks/` via `aichaku githooks`

## Implementation Steps

### Phase 1: Repository Setup

```bash
# 1. Create template directory structure
mkdir -p docs/core/githook-templates/hooks.d

# 2. Move existing hooks from .githooks/
cp -r .githooks/hooks.d/* docs/core/githook-templates/hooks.d/
cp .githooks/pre-commit docs/core/githook-templates/

# 3. Add to version control
git add docs/core/githook-templates/
```

### Phase 2: Installation Logic

```typescript
// src/utils/githook-manager.ts
export class GitHookManager {
  private readonly sourceDir = "docs/core/githook-templates";
  private readonly installDir = "~/.claude/aichaku/githooks";

  async installToGlobal(): Promise<void> {
    // Copy from sourceDir to installDir during init
    await copyDirectory(
      join(getAichakuRoot(), this.sourceDir),
      expandPath(this.installDir),
    );
  }

  async deployToProject(projectPath: string, options: DeployOptions): Promise<void> {
    // ALWAYS use .aichaku-githooks for safety
    const targetDir = join(projectPath, ".aichaku-githooks");
    const selectedHooks = await this.selectHooks(options);

    // Copy selected hooks from installDir to project
    for (const hook of selectedHooks) {
      await copyFile(
        join(expandPath(this.installDir), "hooks.d", hook),
        join(targetDir, "hooks.d", hook),
      );
    }

    // Check existing git config but DON'T change it
    const existingHooksPath = await this.getGitHooksPath(projectPath);

    // Inform user about activation
    this.displayActivationInstructions(projectPath, targetDir, existingHooksPath);
  }
}
```

### Phase 3: Command Implementation

```typescript
// src/commands/githooks.ts
export async function githooks(options: GitHooksOptions): Promise<void> {
  const manager = new GitHookManager();

  if (options.install) {
    await manager.deployToProject(options.projectPath, {
      preset: options.preset,
      enabled: options.enable,
      disabled: options.disable,
    });
  }

  if (options.list) {
    await manager.listAvailable();
  }

  if (options.show) {
    await manager.showCurrent(options.projectPath);
  }
}
```

## Storage Rationale

### Why `docs/core/githook-templates/`?

1. **Consistency**: Matches existing pattern:
   - `docs/core/agent-templates/`
   - `docs/core/methodology-templates/`
   - `docs/core/githook-templates/` (new)

2. **Documentation**: Lives with other documentation/templates
   - Easy to find and understand
   - Can include README with hook descriptions

3. **Publishing**: Gets included in JSR package naturally
   - Part of `docs/` which is already published
   - No special handling needed

4. **Versioning**: Hooks evolve with the library
   - Updates delivered through normal aichaku upgrades
   - Can track changes in git history

## Conflict Handling

For existing users who already have hooks:

1. **Detect**: Check for existing `.githooks/`, `.git/hooks/`, or custom `core.hooksPath`
2. **Install Safely**: ALWAYS install to `.aichaku-githooks/`
3. **Inform**: Tell user about existing hooks and how to activate aichaku's
4. **Never Override**: Don't change git config if hooks already exist

Example output:

```
⚠️  Found existing hooks in: .githooks/
✅ Installed aichaku hooks to: .aichaku-githooks/

To activate aichaku hooks:
  cd /path/to/project
  git config core.hooksPath .aichaku-githooks
```

## Configuration Storage

Hook preferences stored in `.claude/aichaku/aichaku.json`:

```json
{
  "githooks": {
    "installed": true,
    "path": ".aichaku-githooks",
    "selected": ["05", "10", "15", "20", "30"],
    "preset": "standard",
    "activated": false,
    "existingHooks": ".githooks",
    "instructions": "cd /path/to/project && git config core.hooksPath .aichaku-githooks"
  }
}
```

## File Permissions

Critical: Preserve executable permissions

```typescript
async function copyHook(source: string, dest: string): Promise<void> {
  await Deno.copyFile(source, dest);
  // Preserve executable permission
  await Deno.chmod(dest, 0o755);
}
```

## Testing Strategy

1. **Unit Tests**: Hook manager logic
2. **Integration Tests**: Full installation flow
3. **Platform Tests**: macOS, Linux, Windows (Git Bash)
4. **Regression Tests**: Ensure existing projects not broken

## Success Metrics

- [ ] Hooks copied from templates to global location
- [ ] Hooks deployed to `.aichaku-githooks/` with correct permissions
- [ ] Git config NOT changed if hooks already exist
- [ ] Existing hooks detected and user informed
- [ ] Clear activation instructions provided
- [ ] Clear messaging about MCP requirements for security hook
