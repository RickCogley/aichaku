# Aichaku Folder Migration Module

This module handles the migration from the old `~/.claude/` structure to the new `~/.claude/aichaku/` structure, ensuring aichaku files are properly organized while preserving user data.

## Overview

The migration module safely moves aichaku-specific files from the old location to the new structured location while preserving all user data and configurations.

### What Gets Migrated

**Global Migration (`~/.claude/` → `~/.claude/aichaku/`)**:
- `methodologies/` → `~/.claude/aichaku/methodologies/`
- `standards/` → `~/.claude/aichaku/standards/`
- `scripts/` → `~/.claude/aichaku/scripts/`
- `commands.json` → `~/.claude/aichaku/commands.json`
- `.aichaku-project` → `~/.claude/aichaku/.aichaku-project`

**Project Migration (`project/.claude/` → `project/.claude/aichaku/`)**:
- `.aichaku-project` → `project/.claude/aichaku/.aichaku-project`
- `methodologies/` → `project/.claude/aichaku/methodologies/` (if exists)
- `standards/` → `project/.claude/aichaku/standards/` (if exists)

### What Stays in Place

These files remain in their original locations:
- `~/.claude/output/` - User work and documents
- `~/.claude/user/` - User customizations
- `~/.claude/CLAUDE.md` - User instructions
- `~/.claude/settings.local.json` - User settings
- `project/.claude/output/` - Project work
- `project/.claude/CLAUDE.md` - Project instructions
- `project/.claude/settings.local.json` - Project settings

## Usage

### CLI Usage

```bash
# Preview migration (dry run)
aichaku migrate --dry-run

# Migrate global files
aichaku migrate --global

# Migrate project files
aichaku migrate --project /path/to/project

# Migrate both global and project
aichaku migrate --global --project .

# Force migration even if target exists
aichaku migrate --force

# Skip backup creation
aichaku migrate --no-backup

# Verbose output
aichaku migrate --verbose

# Skip confirmation prompts
aichaku migrate --yes
```

### Programmatic Usage

```typescript
import { FolderMigration } from "./src/migration/folder-migration.ts";

const migration = new FolderMigration();

// Check if migration is needed
const needed = await migration.isMigrationNeeded();

if (needed) {
  // Perform global migration
  const result = await migration.migrateGlobal({
    dryRun: false,
    backup: true,
    force: false,
    verbose: true,
  });

  if (result.success) {
    console.log(`Migrated ${result.itemsMigrated} items`);
  } else {
    console.error(`Migration failed: ${result.errors}`);
  }
}
```

## Safety Features

1. **Idempotent**: Can be run multiple times safely
2. **Backup Creation**: Automatically creates backups before migration
3. **Rollback Support**: Can restore from backups if needed
4. **Dry Run Mode**: Preview changes without making them
5. **Verification**: Checks migration success after completion
6. **Error Handling**: Graceful error handling with detailed messages

## Migration Process

1. **Detection**: Check if old structure exists and new doesn't
2. **Backup**: Create timestamped backup if requested
3. **Migration**: Copy files to new structure
4. **Verification**: Ensure migration was successful
5. **Cleanup**: Remove old files after successful migration

## Error Handling

The migration module handles various error conditions:
- **Missing source files**: Skips optional files, errors on required ones
- **Target exists**: Skips or overwrites based on force flag
- **Permission errors**: Reports clear error messages
- **Partial failures**: Continues with remaining files, reports all errors

## Testing

Run the comprehensive test suite:

```bash
deno test src/migration/folder-migration.test.ts --allow-read --allow-write --allow-env
```

The tests cover:
- Migration detection
- Dry run mode
- Actual file migration
- Backup creation
- Rollback functionality
- Error conditions
- Verification process

## Architecture

The migration module follows a layered architecture:

1. **FolderMigration Class**: Core migration logic
2. **CLI Command**: User interface for migration
3. **Configuration**: Flexible options for different scenarios
4. **Logging**: Comprehensive logging and progress reporting
5. **Testing**: Extensive test coverage for reliability

## Security Considerations

- **Path Validation**: All paths are validated to prevent directory traversal
- **Permission Checks**: Verifies read/write permissions before migration
- **Backup Creation**: Protects against data loss
- **Atomic Operations**: Migration is as atomic as possible
- **Error Reporting**: No sensitive path information in error messages