# Migration Strategy for Other Repositories Using Aichaku

## Overview

When Aichaku changes from `/references` to `/docs`, existing repositories using
Aichaku will need a migration strategy to avoid broken links and documentation
issues.

## The Challenge

Repositories using Aichaku may have:

1. Links to Aichaku documentation (e.g.,
   `/references/tutorials/getting-started.md`)

2. Automated documentation generation expecting certain paths

3. CI/CD pipelines that reference documentation locations

4. Custom scripts or tools that expect the old structure

## Migration Strategy

### Option 1: Backward Compatibility with Symlinks (Recommended)

**In Aichaku repository:**

````bash
# Create a symlink for backward compatibility
ln -s docs references

# Add to .gitignore
echo "references" >> .gitignore
```text

**Benefits:**

- Existing repos continue to work without changes

- Gives time for gradual migration

- No breaking changes

**Drawbacks:**

- Maintains legacy structure

- May confuse new users

### Option 2: Version-Locked Migration

**For repositories using Aichaku:**

1. **Before upgrading Aichaku:**

   ```bash
   # Document current version
   aichaku --version > .aichaku-version

   # Create migration checklist
   grep -r "/references" . > references-migration-checklist.txt
````

2. **Stay on current version until ready:**

   ```json
   // In import map or package.json
   {
     "imports": {
       "@aichaku/aichaku": "jsr:@rick/aichaku@0.5.0" // Lock to pre-migration version
     }
   }
   ```

3. **Prepare for migration:**

   ```bash
   # Create a migration script
   cat > migrate-aichaku-docs.sh << 'EOF'
   #!/bin/bash
   # Update all references in documentation
   find . -name "*.md" -type f -exec sed -i '' 's|/references/|/docs/|g' {} +

   # Update CI/CD configs
   find .github -name "*.yml" -type f -exec sed -i '' 's|/references/|/docs/|g' {} +

   # Update scripts
   find scripts -name "*.sh" -type f -exec sed -i '' 's|/references/|/docs/|g' {} +
   EOF

   chmod +x migrate-aichaku-docs.sh
   ```

4. **Execute migration:**

   ```bash
   # Run migration
   ./migrate-aichaku-docs.sh

   # Test thoroughly
   npm test

   # Upgrade Aichaku
   deno install -A -n aichaku jsr:@rick/aichaku@latest
   ```

### Option 3: Automated Migration Tool

**Create in Aichaku:**

`````typescript
// src/commands/migrate-docs.ts
export async function migrateDocsCommand(options: MigrateDocsOptions) {
  // 1. Scan for /references paths
  const files = await findFilesWithReferences(options.path);

  // 2. Create backup
  await createBackup(files);

  // 3. Update paths
  for (const file of files) {
    await updateReferencePaths(file);
  }

  // 4. Verify
  await verifyMigration(options.path);
}
```text

**Usage:**

```bash
# In other repos
aichaku migrate-docs --dry-run
aichaku migrate-docs --apply
```text

## Communication Plan

### 1. Pre-Release Announcement

**In Aichaku CHANGELOG:**

```markdown
## Upcoming Breaking Change in v0.6.0

The documentation directory will move from `/references` to `/docs` for better
convention alignment.

**Action Required:**

- Review your links to Aichaku documentation

- Use `aichaku migrate-docs` tool (available in v0.5.5)

- Or lock to v0.5.x until ready to migrate
```text

### 2. Migration Guide

Create `/docs/how-to/migrate-from-references.md`:

````markdown
# Migrating from /references to /docs

## Quick Migration

Run this in your repository:

```bash
aichaku migrate-docs --apply
```text
````text

## Manual Migration

1. Update documentation links:

   ```bash
   find . -name "*.md" -exec sed -i 's|/references/|/docs/|g' {} +
`````

2. Update CI/CD: [specific examples]

3. Test thoroughly:

   ```bash
   aichaku docs-lint
   ```

`````text
### 3. Deprecation Period

**v0.5.5**: Add deprecation warning
```typescript
if (existsSync("references")) {
  console.warn("⚠️  /references is deprecated. Please migrate to /docs");
  console.warn("   Run: aichaku migrate-docs");
}
````text

**v0.6.0**: Remove /references, keep symlink **v0.7.0**: Remove symlink

## Recommended Approach

1. **Immediate**: Add symlink in Aichaku for backward compatibility

2. **Next Release**: Include migration tool and documentation

3. **Following Release**: Deprecation warnings

4. **Future Release**: Remove legacy support

This gives users:

- No immediate breaking changes

- Tools to migrate easily

- Clear timeline

- Graceful degradation

## For the Aichaku Team

### Release Checklist

- [ ] Add backward compatibility symlink

- [ ] Create migration tool command

- [ ] Write migration guide

- [ ] Update CHANGELOG with breaking change notice

- [ ] Create GitHub issue template for migration help

- [ ] Consider creating a migration GitHub Action

### Testing Migration

Before release:

1. Test on internal projects first

2. Create test repository with old structure

3. Run migration tool

4. Verify all links work

5. Check CI/CD compatibility

## Summary

The migration from `/references` to `/docs` can be smooth if we:

1. Provide backward compatibility initially

2. Give users tools to migrate

3. Communicate clearly and early

4. Support users through the transition

This approach minimizes disruption while moving to a better, more conventional
structure.
`````
