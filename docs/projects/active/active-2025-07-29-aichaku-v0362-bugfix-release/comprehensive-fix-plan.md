# Aichaku v0.36.2 Comprehensive Bug Fix Plan

## Overview

This plan addresses all bugs discovered during systematic testing of v0.36.1. The fixes will be released together as
v0.36.2.

## Fix Sequence (Logical Order)

### Phase 1: Core Configuration Fixes

These must be fixed first as other commands depend on correct config structure.

#### 1.1 Fix ConfigManager Methodology Handling

**Files**: `src/utils/config-manager.ts`

- Remove the broken `setMethodology()` method
- Add proper `setMethodologies()` and `getMethodologies()` methods
- Support multiple methodologies in array format
- Remove legacy `project.methodology` field migration

#### 1.2 Update Config Structure

**Files**: `src/utils/config-manager.ts`, related commands

- Ensure consistent config schema:
  ```json
  {
    "version": "0.36.2",
    "methodologies": {
      "selected": ["shape-up", "scrum"],
      "default": "shape-up"
    },
    "standards": {
      "selected": ["owasp-web", "tdd"]
    }
  }
  ```
- Remove `standards.version` field
- Add migration to clean up existing configs

### Phase 2: Command Configuration Fixes

Fix all commands that read/write configuration.

#### 2.1 Fix Methodologies Command

**Files**: `src/commands/methodologies.ts`

- Update to use new `setMethodologies()` method
- Fix `--show` to read from `methodologies.selected`
- Fix `--add` to append to array (not replace)
- Fix `--remove` to work with array
- Handle multiple methodology support

#### 2.2 Fix Standards Command

**Files**: `src/commands/standards.ts`

- Fix "Failed to parse project configuration" error
- Ensure proper error handling
- Remove standards.version when writing

#### 2.3 Fix Init Command

**Files**: `src/commands/init.ts`

- Add interactive methodology selection prompt
- Use proper inquirer/select for multi-choice
- Save selections to correct location

### Phase 3: MCP Command Fixes

#### 3.1 Fix MCP --config

**Files**: `src/commands/mcp.ts`

- Update path checking to look for new multi-server structure
- Check for both `aichaku-code-reviewer` and `github-operations`
- Generate correct config for both servers

#### 3.2 Fix MCP --tools

**Files**: `src/commands/mcp.ts`, `src/utils/mcp/multi-server-manager.ts`

- Create proper tool listing functionality
- Show actual MCP tools instead of status
- List tools for each installed server

### Phase 4: Learn/Help Command Fixes

#### 4.1 Fix Help → Learn Forwarding

**Files**: `cli.ts`

- Add deprecation notice to help command
- Forward all arguments to learn command
- Maintain backward compatibility

#### 4.2 Fix Learn --list

**Files**: `src/commands/learn.ts`

- Add methodology codes to output
- Format: "📚 Scrum (scrum) - Description..."

#### 4.3 Fix Learn --compare

**Files**: `src/commands/learn.ts`

- Fix empty comparison table
- Ensure methodology data loads correctly
- Add proper table population

### Phase 5: UI/UX Consistency

#### 5.1 Apply Consistent Branding

**Files**: All command files

- Use GitHub command's branding as template:
  - Header: `█ 🪴 Aichaku [Command] - [Description]`
  - Sections: `◆ [Section Name]`
  - Examples: `▶ [Category]`
- Update all help outputs
- Ensure color consistency

#### 5.2 Fix Error Messages

**Files**: Various commands

- Replace confusing "Failed to parse" with clear messages
- Add helpful context when errors occur
- Ensure errors don't appear for successful operations

### Phase 6: Cleanup

#### 6.1 Remove docs-standard Command

**Files**: `cli.ts`, `src/commands/docs-standard.ts`

- Remove command registration
- Delete command file
- Update help text references

#### 6.2 Add Comprehensive Tests

**Files**: New test files

- Add integration tests for all commands
- Test config reading/writing
- Test multi-methodology support
- Test error scenarios

## Implementation Strategy

1. Create feature branch: `fix/v0.36.2-comprehensive-bugfixes`
2. Fix in phases to maintain working state
3. Test each phase before moving to next
4. Run full test suite before release
5. Update version to 0.36.2
6. Create detailed release notes

## Success Criteria

- [ ] All commands work without errors
- [ ] Config structure is consistent
- [ ] Multi-methodology support works
- [ ] All help outputs have consistent branding
- [ ] No confusing error messages
- [ ] All tests pass
- [ ] Clean release with proper changelog

## Estimated Time: 4-6 hours

## Next Step

Use the orchestrator agent to coordinate implementation of this plan across all the specialized agents.
