# Git Hooks Conflict Resolution Strategy

## The Problem

Git only supports ONE `core.hooksPath` setting at a time. If a project already has:

- `.githooks/` directory with existing hooks
- Custom `core.hooksPath` pointing elsewhere
- `.git/hooks/` with local hooks

We CANNOT safely merge or override without potentially breaking their workflow.

## The Safe Solution

### Default Behavior: Always Use `.aichaku-githooks/`

```typescript
export class GitHookManager {
  private readonly DEFAULT_HOOKS_DIR = ".aichaku-githooks";

  async deployToProject(projectPath: string): Promise<void> {
    const existingHooksPath = await this.checkExistingHooks(projectPath);
    const targetDir = join(projectPath, this.DEFAULT_HOOKS_DIR);

    // Always install to .aichaku-githooks/
    await this.installHooks(targetDir);

    // Check git config
    const currentHooksPath = await this.getGitHooksPath(projectPath);

    if (currentHooksPath) {
      // Don't change it! Just inform the user
      console.log(`
⚠️  Git hooks installed to: ${targetDir}
📍 Current git hooks path: ${currentHooksPath}

To use aichaku's hooks:
  cd ${projectPath}
  git config core.hooksPath ${this.DEFAULT_HOOKS_DIR}

To keep both, you can manually merge hooks from:
  ${targetDir} → ${currentHooksPath}
      `);
    } else {
      // No custom path set, safe to configure
      console.log(`
✅ Git hooks installed to: ${targetDir}

To activate them:
  cd ${projectPath}
  git config core.hooksPath ${this.DEFAULT_HOOKS_DIR}
      `);
    }
  }
}
```

## Detection Logic

```typescript
async checkExistingHooks(projectPath: string): Promise<HookStatus> {
  const checks = {
    gitHooksPath: await this.getGitConfig("core.hooksPath"),
    hasGitHooks: await exists(join(projectPath, ".git/hooks")),
    hasGithooks: await exists(join(projectPath, ".githooks")),
    hasAichakuHooks: await exists(join(projectPath, ".aichaku-githooks")),
  };
  
  if (checks.gitHooksPath) {
    return {
      status: "custom",
      path: checks.gitHooksPath,
      message: "Project uses custom hooks path"
    };
  }
  
  if (checks.hasGithooks) {
    return {
      status: "githooks",
      path: ".githooks",
      message: "Project has .githooks/ directory"
    };
  }
  
  if (checks.hasGitHooks) {
    return {
      status: "default",
      path: ".git/hooks",
      message: "Project uses default git hooks"
    };
  }
  
  return {
    status: "none",
    path: null,
    message: "No existing hooks detected"
  };
}
```

## User Flows

### Scenario 1: Fresh Project (No Hooks)

```bash
$ aichaku githooks --install
✅ Git hooks installed to: .aichaku-githooks/

To activate them:
  cd /path/to/your/project
  git config core.hooksPath .aichaku-githooks
```

### Scenario 2: Project with `.githooks/`

```bash
$ aichaku githooks --install
⚠️  Git hooks installed to: .aichaku-githooks/
📍 Found existing hooks in: .githooks/

Options:
1. Use aichaku hooks:
   cd /path/to/your/project
   git config core.hooksPath .aichaku-githooks

2. Keep existing hooks:
   No action needed

3. Merge both (manual):
   Copy desired hooks from .aichaku-githooks/ to .githooks/
```

### Scenario 3: Project with Custom Path

```bash
$ aichaku githooks --install
⚠️  Git hooks installed to: .aichaku-githooks/
📍 Current git hooks path: .custom/my-hooks

To switch to aichaku hooks:
  cd /path/to/your/project
  git config core.hooksPath .aichaku-githooks

To keep current setup:
  Copy desired hooks from .aichaku-githooks/ to .custom/my-hooks/
```

## Advanced: Hook Merging Helper

For users who want to merge hooks:

```bash
$ aichaku githooks --merge
Found hooks in multiple locations:
  • .githooks/pre-commit (existing)
  • .aichaku-githooks/pre-commit (aichaku)

Would you like to:
1. View differences
2. Create merged version (.githooks/pre-commit.merged)
3. Skip

> 2
✅ Created .githooks/pre-commit.merged
   Review and rename to 'pre-commit' when ready
```

## The Key Principles

1. **Never Break Existing Setups**: Don't change `core.hooksPath` if it's set
2. **Always Use Namespace**: Default to `.aichaku-githooks/` to avoid conflicts
3. **Inform, Don't Force**: Tell users what to do, let them decide
4. **Provide Escape Hatches**: Manual merge options for advanced users

## Configuration File

Store user's choice in `.claude/aichaku/aichaku.json`:

```json
{
  "githooks": {
    "installed": true,
    "installPath": ".aichaku-githooks",
    "status": "installed_not_active",
    "existingHooks": ".githooks",
    "instructions": "Run: git config core.hooksPath .aichaku-githooks"
  }
}
```

## Why This Approach?

- **Safe**: Never breaks existing workflows
- **Clear**: Users know exactly what's happening
- **Flexible**: Supports all scenarios
- **Reversible**: Easy to undo or change
- **Respectful**: Acknowledges existing setups

## Future Enhancement

Could provide a "hook orchestrator" that calls multiple hook directories:

```bash
#!/bin/bash
# .git/hooks/pre-commit (manual setup)

# Run all pre-commit hooks
for dir in .githooks .aichaku-githooks .custom-hooks; do
  if [ -f "$dir/pre-commit" ]; then
    "$dir/pre-commit" || exit $?
  fi
done
```

But this is advanced and requires manual setup by the user.
