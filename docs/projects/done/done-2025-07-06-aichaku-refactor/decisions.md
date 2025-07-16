# Design Decisions: Aichaku Adaptive Refactor

## Status: ACTIVE - PLANNING MODE

## Date: 2025-07-06

## Key Decisions Made

### 1. Single Installation Approach

**Decision**: Use `aichaku init` to install all methodologies at once
**Rationale**:

- Files are tiny (few KB total)
- System adapts based on context anyway
- Removes decision paralysis
- Aligns with "adaptive" positioning

### 2. User Customization Architecture

**Decision**: Separate `user/` directory that's never touched by upgrades
**Rationale**:

- Clear separation of concerns
- Easy to backup/restore
- Simple mental model
- No complex merging needed

### 3. Metadata Tracking

**Decision**: Use `.aichaku.json` for installation metadata **Format**:

```json
{
  "version": "0.3.0",
  "installedAt": "2025-07-06T10:00:00Z",
  "installationType": "local|global",
  "lastUpgrade": "2025-07-06T11:00:00Z"
}
```

**Rationale**:

- Enables version checking for upgrades
- Tracks installation type
- Simple JSON format

### 4. Command Structure

**Decision**: Verb-based commands instead of noun-based

- `aichaku init` (not `aichaku install`)
- `aichaku upgrade` (not `aichaku update`)
- `aichaku uninstall` (not `aichaku remove`) **Rationale**:
- Clearer action-oriented interface
- Matches common CLI patterns
- No ambiguity about what happens

### 5. Upgrade Strategy

**Decision**: Full replacement of `methodologies/` + preserve `user/`
**Rationale**:

- Simple and predictable
- No merge conflicts
- User work always safe
- Easy to implement and understand

### 6. Backward Compatibility

**Decision**: Detect old installations and offer migration **Approach**:

- Check for .claude/ without .aichaku.json
- Offer to migrate to new structure
- Preserve any user modifications **Rationale**: Don't break existing users

### 7. Error Messages

**Decision**: Friendly, actionable error messages **Examples**:

- "Aichaku is already initialized here. Use 'aichaku upgrade' to update."
- "No Aichaku installation found. Run 'aichaku init' first."
- "User customizations detected in user/. These will be preserved during
  upgrade." **Rationale**: Guide users to success

### 8. Methodology Flexibility

**Decision**: Default to adaptive mode, add strict mode later if needed
**Approach**:

- Start with full blending enabled
- Monitor actual usage patterns
- Add configuration options based on real needs
- Respect that organizations may have "set in stone" requirements **Rationale**:
- Reduce methodology friction first
- Add constraints only if users request them
- Real usage will show what's needed

## Deferred Decisions

1. **Methodology Versioning**: Each methodology could have its own version
   (DEFER - adds complexity)
2. **Partial Updates**: Update only changed files (DEFER - premature
   optimization)
3. **Rollback Feature**: Keep previous versions (DEFER - can add later if
   needed)
4. **Config File**: .aichaku.yml for preferences (DEFER - YAGNI)

## Rejected Approaches

1. **In-place File Marking**: Using comments like `# USER CUSTOMIZATION START`
   (too fragile)
2. **Git Submodules**: For methodology management (too complex for users)
3. **Symlink Strategy**: Link to global install (platform compatibility issues)
4. **Methodology Selection**: Keep current approach (doesn't match adaptive
   vision)
