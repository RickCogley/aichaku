# Shape Up Pitch: Fix Upgrade Process and Messaging

## Problem

The `aichaku upgrade --global` command has two critical issues:

1. **Files aren't actually updated**: When upgrading (e.g., from v0.47.0 to v0.47.1), the command reports "files
   verified/updated" but doesn't actually overwrite existing files with new versions. Users must use `--force` to get
   the actual updates, which shouldn't be necessary.

2. **Confusing messaging**: The current output shows a "version mismatch" warning that suggests running the same command
   the user just ran. The wording doesn't clearly indicate that an upgrade is happening.

### Current Pain Points

- Users run `aichaku upgrade --global` expecting updates but don't get them
- The Truth Protocol and other improvements aren't delivered without `--force`
- Message says "verified/updated" without clarity on what actually happened
- The version mismatch warning is circular and confusing
- File counts are shown twice (in progress messages and summary)

## Appetite

**Small Batch** - 2-3 hours of focused work

This is a critical bug fix that affects all users trying to stay current with Aichaku improvements.

## Solution

### 1. Force Overwrite by Default

Change the upgrade logic to ALWAYS overwrite files when versions differ:

```typescript
// When metadata.version !== VERSION, always overwrite
const forceOverwrite = metadata.version !== VERSION || options.force;

await fetchCore(paths.global.core, VERSION, {
  silent: options.silent,
  overwrite: forceOverwrite, // Force when upgrading
});
```

### 2. Improve Messaging

Replace confusing "version mismatch" with clear "upgrade available":

**Before:**

```
⚠️  Version mismatch detected:
   CLI version:    v0.47.0
   Global files:   v0.46.1
   
   Run 'aichaku upgrade --global' to update global files to match CLI.
```

**After:**

```
⚠️  Upgrade available:
   Global files:   v0.46.1
   CLI version:    v0.47.0

🪴 Aichaku: Seeding global files from v0.46.1 to v0.47.0 to match CLI…
```

### 3. Use Real Tree Output

Replace the hardcoded file structure with Deno's `walk` function for a consistent cross-platform tree display:

```typescript
// Use Deno's walk function for consistent tree display across all platforms
import { walk } from "jsr:@std/fs/walk";
await displayCustomTree(targetPath);
// Shows actual directory structure with file counts and important subdirectories
```

### 4. Clarify File Operations

Change ambiguous "verified/updated" to be specific:

- "X files updated" when overwriting
- "X files verified" when checking without changes
- Track and report both separately

## Rabbit Holes to Avoid

- Don't try to check latest version from JSR/GitHub (separate issue)
- Don't refactor the entire fetch system
- Don't add progress bars or fancy UI
- Don't try to replicate exact tree command ASCII art (our solution is better)

## No-Gos

- Breaking existing `--force` flag behavior
- Changing the fundamental upgrade workflow
- Adding new dependencies

## Nice-to-Haves (if time permits)

- Add `--dry-run` to preview what would be updated
- Show diff summary of what changed
- Better error messages when network fails

## Success Criteria

1. Running `aichaku upgrade --global` actually updates all files when versions differ
2. Clear messaging that doesn't suggest re-running the same command
3. Real tree output showing actual file structure
4. Users get Truth Protocol and other updates without needing `--force`
