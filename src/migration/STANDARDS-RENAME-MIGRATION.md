# Standards File Rename Migration

## Overview

This document describes the migration handling for the `.aichaku-standards.json` → `standards.json` file rename that was
implemented in the folder migration tool.

## Changes Made

### 1. Updated Migration Mappings

Added the standards file rename to both global and project migration mappings:

- **Global**: `~/.claude/.aichaku-standards.json` → `~/.claude/aichaku/standards.json`
- **Project**: `.claude/.aichaku-standards.json` → `.claude/aichaku/standards.json`

### 2. Special Handling for Rename

The migration tool now:

- Detects when a file is being renamed (not just moved)
- Shows "rename" instead of "migrate" in dry-run output
- Logs "Renamed: .aichaku-standards.json -> standards.json" instead of showing the full paths

### 3. Migration Detection

The `checkProjectMigration()` function now checks for both:

- `.aichaku-project` file
- `.aichaku-standards.json` file

Migration is triggered if either file exists and the new structure doesn't.

### 4. User Communication

When showing the migration plan, users now see:

```
- .aichaku-standards.json → standards.json (if exists)
```

This clearly indicates the file will be renamed during migration.

## Testing

Added comprehensive tests to verify:

1. Standards file is properly renamed during migration
2. File contents are preserved exactly
3. Old file is removed after successful migration
4. Dry run shows the rename action correctly
5. Migration is triggered when standards file exists

## Implementation Details

The rename is handled as a standard file migration with special logging. The actual copy operation remains the same,
ensuring data integrity.

## Backward Compatibility

- Migration is optional - if the file doesn't exist, migration continues without error
- Users who already migrated won't be affected
- The new filename follows the established pattern (no leading dot for non-hidden config files)
