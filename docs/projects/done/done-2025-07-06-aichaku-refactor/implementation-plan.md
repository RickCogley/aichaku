# Implementation Plan: Aichaku Adaptive Refactor

## Status: ACTIVE - PLANNING MODE

## Date: 2025-07-06

## Objective

Transform Aichaku from a "methodology selector" to a true adaptive system with simple init/upgrade/uninstall lifecycle.

## Technical Tasks

### Phase 1: CLI Refactor (2 hours)

1. **Refactor CLI command structure**
   - [ ] Change from `aichaku <methodology>` to `aichaku <command>`
   - [ ] Implement `init` command
   - [ ] Implement `upgrade` command
   - [ ] Implement `uninstall` command
   - [ ] Add `--global` flag support
   - [ ] Add `--dry-run` flag support

2. **Update installer.ts**
   - [ ] Rename to `init.ts` or keep as installer with new behavior
   - [ ] Always install all methodologies
   - [ ] Create user/ directory structure
   - [ ] Generate .aichaku.json metadata file

### Phase 2: Upgrade System (1.5 hours)

1. **Create updater.ts implementation**
   - [ ] Read .aichaku.json for current version
   - [ ] Check for new version (compare with mod.ts VERSION)
   - [ ] Backup user/ directory
   - [ ] Update methodologies/ only
   - [ ] Preserve user/ completely
   - [ ] Update .aichaku.json

2. **Create uninstaller.ts**
   - [ ] Confirm before deletion
   - [ ] Remove .claude/ directory
   - [ ] Clean exit with success message

### Phase 3: User Customization & Adaptive Behavior (1.5 hours)

1. **Create user/ structure**

   ```
   user/
   ├── README.md          # How to customize
   ├── prompts/
   │   └── .gitkeep
   ├── templates/
   │   └── .gitkeep
   └── methods/
       └── .gitkeep
   ```

2. **Create user documentation**
   - [ ] user/README.md with examples
   - [ ] How prompts override/extend
   - [ ] How templates work
   - [ ] How methods enhance

3. **Enhance methodology files for blending**
   - [ ] Add vocabulary mappings to each methodology
   - [ ] Add blending instructions
   - [ ] Include cross-methodology examples
   - [ ] Note: Future may add strict mode configuration

### Phase 4: Documentation Update (1.5 hours)

1. **Update README.md**
   - [ ] New installation instructions
   - [ ] Remove methodology selection
   - [ ] Emphasize adaptive nature
   - [ ] Add upgrade instructions

2. **Update mod.ts**
   - [ ] Align with new CLI commands
   - [ ] Update examples
   - [ ] Version to 0.3.0

3. **Update CLAUDE.md**
   - [ ] New development commands
   - [ ] User customization info

## Testing Plan

1. **Test init command**
   - [ ] Fresh installation
   - [ ] Global installation
   - [ ] Existing .claude/ handling

2. **Test upgrade command**
   - [ ] Version detection
   - [ ] User/ preservation
   - [ ] Metadata update

3. **Test uninstall command**
   - [ ] Clean removal
   - [ ] Confirmation prompt

## Success Criteria

- [ ] Single `aichaku init` installs everything
- [ ] User customizations survive upgrades
- [ ] Documentation is consistent
- [ ] Commands are intuitive
- [ ] Adaptive nature is clear

## Rollback Plan

If issues arise:

1. Git revert to v0.2.2
2. Document lessons learned
3. Re-approach with adjustments

## Notes

- This aligns with original vision
- Simplifies user experience
- Enables future enhancements
- Maintains backward compatibility via migration
