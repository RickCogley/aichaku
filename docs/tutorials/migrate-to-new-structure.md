# Migrating to Aichaku's New Folder Structure

## Overview

Starting with Aichaku v0.20.0, we've reorganized the folder structure to provide better separation between Aichaku's core files and your custom content. This migration guide will walk you through updating your existing setup to the new structure.

### Why Migrate?

The new structure provides:
- **Clear ownership**: Aichaku files live in `aichaku/` subdirectories
- **Better organization**: Custom standards have a dedicated location
- **Easier updates**: Core files can be updated without affecting your customizations
- **Cleaner root**: The `~/.claude/` directory stays organized for multiple tools

### What's Changing

**Before (v0.19.0 and earlier):**
```
~/.claude/
├── methodologies/         # Aichaku's methodologies
├── standards/            # Aichaku's standards
│   └── custom/          # Your custom standards
├── scripts/             # Various scripts
└── user/               # Your customizations

project/.claude/
├── .aichaku-standards.json  # Standards config
└── output/                  # Your work
```

**After (v0.20.0+):**
```
~/.claude/
└── aichaku/             # All Aichaku files
    ├── methodologies/   # Core methodologies
    ├── standards/       # Core standards
    ├── user/           # Your customizations
    │   └── standards/  # Your custom standards
    └── cache/          # Internal cache

project/.claude/
├── aichaku/            # Aichaku project files
│   ├── standards.json  # Standards config (renamed)
│   └── output/        # Methodology outputs
├── output/            # Your work (stays here)
├── user/              # Your content (stays here)
└── CLAUDE.md          # AI instructions (stays here)
```

## Pre-Migration Checklist

Before you begin, make sure you:

- [ ] Back up your current `~/.claude/` directory
- [ ] Note any custom standards in `~/.claude/docs/standards/custom/`
- [ ] Commit any uncommitted work in your projects
- [ ] Update Aichaku to the latest version

### Creating a Backup

```bash
# Create a timestamped backup
cp -r ~/.claude ~/.claude-backup-$(date +%Y%m%d-%H%M%S)

# Verify backup was created
ls -la ~/.claude-backup-*
```

## Step 1: Check Migration Status

First, update to the latest version of Aichaku and check if migration is needed:

```bash
# Install latest Aichaku
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Check version
aichaku --version

# Check if migration is needed
aichaku migrate --dry-run
```

The dry run will show you:
- What files will be moved
- What backups will be created
- Any potential issues

Example output:
```
🪴 Aichaku Migration Analysis

Global migration needed:
  ✓ Will move: ~/.claude/methodologies/ → ~/.claude/aichaku/methodologies/
  ✓ Will move: ~/.claude/docs/standards/ → ~/.claude/aichaku/docs/standards/
  ✓ Will move: custom standards → ~/.claude/aichaku/user/docs/standards/
  ✓ Will create backup: ~/.claude-backup-20250711-143022

No issues detected. Ready to migrate.
```

## Step 2: Perform Global Migration

Once you're ready, run the global migration:

```bash
# Migrate global Aichaku files
aichaku migrate --global
```

This command will:
1. Create a backup of your current `~/.claude/` directory
2. Move core Aichaku files to `~/.claude/aichaku/`
3. Move custom standards to the new location
4. Update internal references

Example output:
```
🪴 Aichaku Global Migration

Creating backup... ✓
  Backup saved to: ~/.claude-backup-20250711-143022

Moving core files... ✓
  Moved: methodologies/ → aichaku/methodologies/
  Moved: standards/ → aichaku/docs/standards/

Moving custom standards... ✓
  Found 3 custom standards
  Moved to: aichaku/user/docs/standards/

Migration complete! ✓
```

## Step 3: Migrate Your Projects

For each project using Aichaku, navigate to the project directory and run:

```bash
cd /path/to/your/project

# Check what will be migrated
aichaku migrate --project . --dry-run

# Perform the migration
aichaku migrate --project .
```

This will:
- Move `.claude/.aichaku-standards.json` → `.claude/aichaku/standards.json`
- Update any path references in the configuration
- Create the new directory structure

Example for multiple projects:
```bash
# Quick way to migrate multiple projects
for project in ~/projects/*; do
  if [ -f "$project/.claude/.aichaku-standards.json" ]; then
    echo "Migrating: $project"
    cd "$project"
    aichaku migrate --project .
  fi
done
```

## Step 4: Migrate Custom Standards Only

If you've already partially migrated or only need to move custom standards:

```bash
# Migrate just custom standards
aichaku migrate --custom-standards-only
```

This is useful if:
- You manually moved some files
- You're upgrading from a partial migration
- You only use custom standards

The command will check both old locations:
- `~/.claude/docs/standards/custom/*`
- `~/.claude/aichaku/docs/standards/custom/*`

And consolidate them in the new location:
- `~/.claude/aichaku/user/docs/standards/`

## Step 5: Verify Migration

After migration, verify everything is in the right place:

```bash
# List all standards (including custom)
aichaku standards --list --categories

# Check directory structure
tree ~/.claude/aichaku/ -L 3

# Verify a specific project
cd /path/to/project
aichaku standards --show
```

Expected output:
```
🪴 Aichaku Standards

Core Standards:
  ✓ OWASP-TOP-10
  ✓ ISO-27001
  ✓ NIST-CSF

Custom Standards:
  ✓ my-company-guidelines
  ✓ project-conventions
  ✓ team-standards

Project Standards (./project-name):
  - OWASP-TOP-10 (core)
  - my-company-guidelines (custom)
```

## Step 6: Update Your Workflow

### Creating Custom Standards (New Way)

The old manual method:
```bash
# ❌ Don't use this anymore
mkdir -p ~/.claude/docs/standards/custom
echo "# My Standard" > ~/.claude/docs/standards/custom/my-standard.md
```

The new recommended method:
```bash
# ✅ Use this instead
aichaku standards --create-custom "My Standard Name"

# Or create from a template
aichaku standards --create-custom "API Guidelines" --template rest-api
```

### Adding Custom Standards to Projects

When adding custom standards to a project, use the `custom:` prefix:

```bash
# ❌ Old way (might not work)
aichaku standards --add my-standard

# ✅ New way (use this)
aichaku standards --add custom:my-standard

# Add multiple standards
aichaku standards --add OWASP-TOP-10,custom:my-standard,ISO-27001
```

### Listing Standards

View all available standards with categories:

```bash
# Show all standards grouped by type
aichaku standards --list --categories

# Search for specific standards
aichaku standards --search "security"
```

## Troubleshooting

### Issue: Migration says "already migrated" but files are in old location

This can happen if migration was partially completed.

**Solution:** Force migration with backup:
```bash
aichaku migrate --force --backup
```

**Manual verification:**
```bash
# Check both locations
ls -la ~/.claude/methodologies/        # Old
ls -la ~/.claude/aichaku/methodologies/ # New
```

### Issue: Custom standards not showing up

Custom standards might be in the wrong location.

**Check all possible locations:**
```bash
# New location (correct)
ls -la ~/.claude/aichaku/user/docs/standards/

# Old locations (need migration)
ls -la ~/.claude/docs/standards/custom/
ls -la ~/.claude/aichaku/docs/standards/custom/
```

**Manual fix if needed:**
```bash
# Create destination if it doesn't exist
mkdir -p ~/.claude/aichaku/user/docs/standards/

# Move from old locations
mv ~/.claude/docs/standards/custom/* ~/.claude/aichaku/user/docs/standards/ 2>/dev/null
mv ~/.claude/aichaku/docs/standards/custom/* ~/.claude/aichaku/user/docs/standards/ 2>/dev/null
```

### Issue: Project standards file not found

The standards configuration file has been renamed and moved.

**Check both locations:**
```bash
# Old location and name
ls -la .claude/.aichaku-standards.json

# New location and name
ls -la .claude/aichaku/standards.json
```

**Manual fix:**
```bash
# Create new structure
mkdir -p .claude/aichaku

# Move and rename
mv .claude/.aichaku-standards.json .claude/aichaku/standards.json
```

### Issue: Permission denied during migration

**Solution:** Check and fix permissions:
```bash
# Check permissions
ls -la ~/.claude/

# Fix permissions if needed
chmod -R u+rwX ~/.claude/
```

## Rollback (If Needed)

If something goes wrong, you can rollback to your backup:

```bash
# List available backups
ls -la ~/.claude-backup-*

# Choose the appropriate backup
BACKUP_DIR=~/.claude-backup-20250711-143022

# Rollback using Aichaku
aichaku migrate --rollback $BACKUP_DIR
```

**Manual rollback:**
```bash
# Remove new structure
rm -rf ~/.claude/aichaku

# Restore from backup
cp -r ~/.claude-backup-20250711-143022/* ~/.claude/
```

## What Stays the Same

These important locations don't change:

| Location | Purpose | Why it stays |
|----------|---------|--------------|
| `.claude/output/` | Your work documents | User-created content |
| `.claude/user/` | Your customizations | User-owned directory |
| `.claude/CLAUDE.md` | AI instructions | Top-level config |
| `.claude/settings.local.json` | Claude Code settings | Tool-specific |

## Post-Migration Checklist

After completing migration:

- [ ] Verify all standards are accessible
- [ ] Test creating a new project with methodologies
- [ ] Check that custom standards work correctly
- [ ] Update any personal scripts that reference old paths
- [ ] Remove old backup directories once verified

### Updating Scripts

If you have scripts that reference the old structure:

```bash
# Old path references to update
~/.claude/methodologies/    → ~/.claude/aichaku/methodologies/
~/.claude/docs/standards/        → ~/.claude/aichaku/docs/standards/
~/.claude/docs/standards/custom/ → ~/.claude/aichaku/user/docs/standards/

# Project files to update
.claude/.aichaku-standards.json → .claude/aichaku/standards.json
```

## Next Steps

Now that you've migrated:

1. **Learn about custom standards**: See [Managing Custom Standards](/docs/how-to/manage-custom-standards.md)
2. **Explore new features**: Check [What's New](/docs/reference/changelog.md)
3. **Share with your team**: Use this guide to help others migrate

## Getting Help

If you encounter issues not covered here:

- Check the [Troubleshooting Guide](/docs/reference/troubleshooting.md)
- Search [GitHub Issues](https://github.com/RickCogley/aichaku/issues)
- Open a new issue with:
  - Your Aichaku version (`aichaku --version`)
  - Error messages
  - Directory structure (`ls -la ~/.claude/`)

## Summary

The migration process is designed to be safe and reversible:

1. **Always creates backups** before making changes
2. **Preserves your work** in `.claude/output/` and `.claude/user/`
3. **Updates automatically** when you run commands
4. **Can be rolled back** if needed

Remember: This is a one-time migration. Once completed, Aichaku will use the new structure going forward, providing better organization and easier maintenance.