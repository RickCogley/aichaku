# Fix Needed: Documentation Standards in help --all

## Issue

The `aichaku help --all` command does not currently show documentation standards, even though they have been implemented
with:

- `aichaku docs-standard` command
- Multiple documentation standards available (Diátaxis, Google Style, etc.)

## Expected Behavior

When running `aichaku help --all`, the output should include a section for documentation standards similar to how it
shows other standards.

## Implementation Location

The fix needs to be made in the help command implementation, likely in:

- `src/commands/help.ts` - Update the `--all` flag handler to include documentation standards

## Related Commands

- `aichaku docs-standard --list` - Shows available documentation standards
- `aichaku docs-standard --add diataxis-google` - Adds documentation standards to project

## Priority

Medium - This is a documentation/discoverability issue that affects users trying to understand all available features.

---

*Added: 2025-01-13*
