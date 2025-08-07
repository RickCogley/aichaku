# Metadata Consolidation Migration Plan

## Overview

This document outlines the plan to migrate from 6+ metadata files to a single `aichaku.json` configuration file,
following modern tooling patterns.

## Current State (6+ files)

```
.claude/aichaku/
├── .aichaku-project      (legacy marker)
├── .aichaku.json         (version tracking)
├── aichaku.config.json   (referenced but UNUSED!)
├── aichaku-standards.json (dev standards - already renamed)
├── doc-standards.json    (doc standards)
└── standards.json        (leftover from rename)
```

## Target State (1 file)

```
.claude/aichaku/
└── aichaku.json         (all configuration and metadata)
```

## Implementation Phases

### Phase 1: Add Backward Compatibility (v0.29.1)

- Update all commands to read from either new or old format
- Add `ConfigManager` class that abstracts the differences
- No changes to existing projects yet
- Add migration detection logic

### Phase 2: Auto-Migration on Upgrade (v0.30.0)

- When running `aichaku upgrade`, automatically consolidate metadata
- Keep old files as `.backup` for one version
- Show clear migration messages to users
- Add `--skip-migration` flag for users who need more time

### Phase 3: Deprecation Warnings (v0.31.0)

- Show warnings when legacy files are detected
- Provide `aichaku migrate-config` command for manual migration
- Update all documentation to show new format

### Phase 4: Remove Legacy Support (v1.0.0)

- Remove backward compatibility code
- Legacy file detection only shows migration instructions
- Clean, simple codebase with single config format

## Migration Algorithm

```typescript
1. Check if aichaku.json exists
   - If yes: already migrated, done
   - If no: continue

2. Create new aichaku.json structure

3. Load and merge each legacy file:
   - .aichaku.json → project section
   - standards.json → standards.development
   - doc-standards.json → standards.documentation
   - aichaku.config.json → config section
   - .aichaku-project → markers.isAichakuProject

4. Detect methodology from project structure

5. Write consolidated aichaku.json

6. Backup old files as .backup

7. After verification, remove old files
```

## Benefits for Users

1. **Simplicity**: One file to understand instead of 6+
2. **Discoverability**: Easy to find all settings
3. **Git-friendly**: Single file changes instead of multiple
4. **Modern**: Follows patterns users know from other tools
5. **Extensible**: Easy to add new sections without new files

## Benefits for Development

1. **Simpler code**: One schema, one parser
2. **Faster operations**: Single file read instead of 6+
3. **Easier testing**: One configuration to mock
4. **Better validation**: Single schema validation
5. **Cleaner migrations**: Version field enables smooth upgrades

## Example Consolidated File

```json
{
  "version": "2.0.0",
  "project": {
    "created": "2025-01-14T10:00:00Z",
    "installedVersion": "0.29.0",
    "lastUpdated": "2025-01-14T12:00:00Z",
    "methodology": "shape-up",
    "type": "project"
  },
  "standards": {
    "development": ["owasp-web", "tdd", "15-factor"],
    "documentation": ["diataxis", "google-style"],
    "custom": {}
  },
  "config": {
    "outputPath": "docs/projects",
    "enableHooks": true,
    "autoCommit": false,
    "gitIntegration": true
  },
  "markers": {
    "isAichakuProject": true,
    "migrationVersion": "2.0.0"
  }
}
```

## Command Updates Needed

1. **init**: Create single aichaku.json instead of multiple files
2. **upgrade**: Detect and migrate legacy files
3. **cleanup**: Remove migration code once complete
4. **standards**: Read/write to standards section
5. **integrate**: Read from consolidated config

## Testing Strategy

1. **Unit tests**: Test migration function with various file combinations
2. **Integration tests**: Test commands with both old and new formats
3. **Migration tests**: Ensure data preservation during consolidation
4. **Regression tests**: Verify backward compatibility in Phase 1

## Rollback Plan

If issues arise:

1. The .backup files allow manual restoration
2. Version detection allows old CLI versions to work
3. Migration can be disabled via environment variable

## Communication Plan

1. **Release notes**: Clear explanation of benefits
2. **Migration guide**: Step-by-step instructions
3. **Troubleshooting**: Common issues and solutions
4. **Video demo**: Show the simplification in action

## Success Metrics

- 90%+ of projects successfully auto-migrate
- 50% reduction in config-related issues
- 75% faster config operations
- Positive user feedback on simplification
