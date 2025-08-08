# Git Hooks Detection Improvement

## Problem

The `aichaku githooks` command doesn't recognize existing git hook installations. It only looks for a hardcoded
`.aichaku-githooks` directory, ignoring what's actually configured in `git config core.hooksPath`. This creates
confusion when users have already set up hooks in directories like `.githooks` or any other custom location.

## Appetite

Small batch - 1-2 hours of work

## Solution

Make the GitHookManager check the actual git configuration to detect existing installations:

1. **Dynamic Detection**: Query `git config --get core.hooksPath` to find the configured hooks directory
2. **Flexible Recognition**: Accept any configured hooks path as a valid installation
3. **Smart Conflict Detection**: Only flag actual conflicts, not existing valid installations

### Key Changes

1. Add `getConfiguredHooksPath()` method to check git config
2. Update `isInstalled()` to use the actual configured path
3. Modify `checkConflicts()` to recognize existing installations vs actual conflicts
4. Fix `setGitHooksPath()` to preserve the user's chosen directory name

## Rabbit Holes

- **Don't** try to auto-migrate between different hook directory names
- **Don't** enforce a specific directory name convention
- **Don't** modify hooks that are working correctly

## No-gos

- Breaking existing installations
- Forcing users to use `.aichaku-githooks` specifically
- Removing or overwriting existing hook configurations without --force

## Success Criteria

1. ✅ `aichaku githooks` correctly detects existing installations in any directory
2. ✅ Respects the user's chosen hooks directory path
3. ✅ Only reports true conflicts, not existing valid setups
4. ✅ Allows updating/syncing hooks in the existing directory structure
