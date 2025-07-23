# Shape Up: Folder Reorganization to ~/.claude/aichaku

**Status**: 🌱 New\
**Appetite**: 2 days\
**Problem**: Aichaku files are mixed with other Claude-related files in
~/.claude/

## Problem

Currently, Aichaku uses the `~/.claude/` directory directly:

````text
~/.claude/
├── methodologies/    # Aichaku files
├── standards/        # Aichaku files
├── user/            # Aichaku files
├── output/          # Aichaku files
└── [other tools]    # Potential conflicts
```text

This creates several issues:

1. **Namespace conflicts** with other Claude tools

2. **Unclear ownership** of directories

3. **Difficult uninstall** - which files belong to Aichaku?

4. **Poor organization** for users with multiple AI tools

5. **Confusing separation** between system and user content

## Solution

Reorganize all Aichaku files under `~/.claude/aichaku/`:

### New Global Structure

```text
~/.claude/
└── aichaku/                    # All Aichaku files contained here
    ├── methodologies/          # Core methodology files
    ├── standards/              # Standards library
    │   ├── architecture/
    │   ├── development/
    │   ├── documentation/
    │   ├── security/
    │   ├── testing/
    ├── user/                   # User customizations
    │   └── standards/          # User's custom standards
    ├── output/                 # Global output directory
    └── config/                 # Global Aichaku config (future)
```text

### New Project Structure

```text
[project]/
└── .claude/
    └── aichaku/                # All Aichaku project files
        ├── .aichaku-project    # Project config
        ├── .aichaku-standards.json
        ├── .aichaku-doc-standards.json
        ├── output/             # Project output
        │   ├── active-*/
        │   └── done-*/
        └── hooks/              # Project-specific hooks
```text

## Benefits

1. **Clear Namespace**: No conflicts with other ~/.claude tools

2. **Easy Discovery**: All Aichaku files in one place

3. **Clean Uninstall**: Simply remove ~/.claude/aichaku

4. **Better Organization**: Logical hierarchy with system/user separation

5. **Future-Proof**: Room for growth without cluttering ~/.claude

6. **Clear Ownership**: System content vs user customizations clearly separated

## Implementation Plan

### Phase 1: Update Path Constants (Day 1 Morning)

Create central path configuration:

```typescript
// src/paths.ts
export const AICHAKU_PATHS = {
  // Global paths
  globalRoot: () => join(Deno.env.get("HOME") || "", ".claude", "aichaku"),
  methodologies: () => join(AICHAKU_PATHS.globalRoot(), "methodologies"),
  standards: () => join(AICHAKU_PATHS.globalRoot(), "standards"),
  userCustom: () => join(AICHAKU_PATHS.globalRoot(), "user", "standards"),
  globalOutput: () => join(AICHAKU_PATHS.globalRoot(), "output"),

  // Project paths
  projectRoot: (projectPath: string) => join(projectPath, ".claude", "aichaku"),
  projectOutput: (projectPath: string) =>
    join(AICHAKU_PATHS.projectRoot(projectPath), "output"),
  projectConfig: (projectPath: string) =>
    join(AICHAKU_PATHS.projectRoot(projectPath), ".aichaku-project"),

  // Legacy paths (for migration)
  legacyGlobalRoot: () => join(Deno.env.get("HOME") || "", ".claude"),
  legacyProjectRoot: (projectPath: string) => join(projectPath, ".claude"),
};
```text

### Phase 2: Migration Logic (Day 1 Afternoon)

Create migration utility:

```typescript
// src/migration/folder-migration.ts
export async function migrateToNewStructure(): Promise<void> {
  const legacy = AICHAKU_PATHS.legacyGlobalRoot();
  const newRoot = AICHAKU_PATHS.globalRoot();

  // Check if migration needed
  if (!(await exists(legacy)) || (await exists(newRoot))) {
    return;
  }

  console.log("🪴 Aichaku: Migrating to new folder structure...");

  // Create new structure
  await ensureDir(newRoot);

  // Migrate each directory
  const dirsToMigrate = ["methodologies", "standards", "user", "output"];
  for (const dir of dirsToMigrate) {
    const oldPath = join(legacy, dir);
    const newPath = join(newRoot, dir);

    if (await exists(oldPath)) {
      await Deno.rename(oldPath, newPath);
      console.log(`  ✓ Migrated ${dir}/`);
    }
  }

  console.log("✅ Migration complete!");
}
```text

### Phase 3: Update All File References (Day 2 Morning)

Files to update:

1. `installer.ts` - Installation paths

2. `init.ts` - Initialization paths

3. `integrate.ts` - Standards/methodology loading

4. `standards.ts` - Standards management

5. `docs-standard.ts` - Doc standards paths

6. `mcp.ts` - MCP server paths

7. `hooks.ts` - Hook file paths

8. MCP server files - All path references

9. Documentation - Update all path examples

### Phase 4: Testing & Documentation (Day 2 Afternoon)

1. Test migration on fresh install

2. Test migration on existing install

3. Test all commands work with new paths

4. Update README.md

5. Update CLAUDE.md examples

6. Create migration guide

## Migration Strategy

### For New Users

- Install directly to new structure

- No migration needed

### For Existing Users

- Auto-detect old structure on first run

- Prompt user: "Migrate to new folder structure? (recommended)"

- Perform migration automatically

- Keep backup of old structure for 30 days

### Backward Compatibility

- Check both paths during transition period

- Prefer new path if both exist

- Remove legacy support in v2.0

## Rabbit Holes

### Not Doing

- Not moving CLAUDE.md location (stays in project root)

- Not changing output folder naming (active-*, done-*)

- Not adding complex configuration files

- Not breaking existing integrations

### Constraints

- Must maintain backward compatibility for 1 major version

- Migration must be automatic and safe

- No data loss during migration

- Clear communication to users

## Success Criteria

1. ✅ All Aichaku files under ~/.claude/aichaku/

2. ✅ Automatic migration for existing users

3. ✅ All commands work with new structure

4. ✅ Documentation updated

5. ✅ No breaking changes for end users

## Dependencies

- None - this is internal reorganization

## Nice to Have

- Migration rollback command

- Health check command to verify structure

- Cleanup command to remove legacy folders

## Visual

```mermaid
graph TD
    A[Check Structure] -->|Legacy Found| B[Prompt Migration]
    A -->|New Structure| C[Continue Normal]
    B -->|Yes| D[Migrate Folders]
    B -->|No| E[Use Legacy Paths]
    D --> F[Update Config]
    F --> C
    E --> G[Show Migration Reminder]
    G --> C
```text

This reorganization will make Aichaku more professional and easier to manage
alongside other Claude-related tools.
````
