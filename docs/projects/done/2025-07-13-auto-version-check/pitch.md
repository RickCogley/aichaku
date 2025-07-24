# Automatic Version Checking for Aichaku

## Problem

Users are confused when upgrading Aichaku because there are two separate
components that can have different versions:

- The CLI tool (the `aichaku` command)
- The global files (methodologies and config in `~/.claude/aichaku/`)

Currently, users can upgrade the CLI to v0.27.0 but still have v0.25.0 global
files, leading to version mismatches and confusion. The system doesn't tell them
about this mismatch.

## Appetite

2 weeks - This is a quality-of-life improvement that will prevent user
confusion.

## Solution

Add automatic version checking when the CLI starts:

1. **On every CLI command**, check if global files version matches CLI version
2. **If mismatch detected**, show a friendly warning:

   ```
   ⚠️  Version mismatch detected:
   CLI version: v0.27.0
   Global files: v0.25.0

   Run 'aichaku upgrade --global' to sync versions
   ```

3. **Optional**: Add a `--check-versions` flag to see all version info
4. **Future**: Consider auto-upgrading with user confirmation

## Rabbit Holes

- **Don't** try to auto-upgrade without user consent - this could break
  workflows
- **Don't** check versions on every single file operation - just on CLI startup
- **Don't** make it blocking - just show a warning

## No-gos

- We will NOT automatically modify user files without permission
- We will NOT prevent CLI from running if versions mismatch
- We will NOT add complex version compatibility matrices

## Nice-to-haves

- Color-coded warnings (yellow for mismatch, green when synced)
- Remember if user has dismissed the warning for this session
- Add version info to `aichaku status` command (if we add one)
