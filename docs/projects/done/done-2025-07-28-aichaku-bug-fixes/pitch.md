# Aichaku Critical Bug Fixes

## Problem

Multiple critical bugs are preventing users from effectively using Aichaku v0.36.1:

1. **Methodology Management Issues**
   - `aichaku methodologies --add` incorrectly places entries under `project.methodology` instead of
     `methodologies.selected`
   - Only supports single methodology selection (should support multiple)
   - Config structure is inconsistent

2. **Command Naming Confusion**
   - `aichaku help` exists but should alias to `aichaku learn`
   - README documentation shows old `help` command instead of new `learn`
   - `aichaku learn --compare` is broken

3. **MCP Server Commands Broken**
   - `aichaku mcp --config` reports "not installed" even when it is
   - `aichaku mcp --tools` duplicates `--status` functionality
   - General MCP functionality is "pretty broken"

## Appetite

2-3 days - These are critical bugs affecting core functionality that users expect to work.

## Solution

### 1. Fix Methodology Configuration Structure

The config file should have a clear structure:

```json
{
  "methodologies": {
    "selected": ["shape-up", "kanban", "scrum"] // Multiple allowed
  }
  // Remove legacy "project.methodology" field
}
```

**Tasks:**

- Fix `methodologies --add` to update correct path
- Support multiple methodology selection
- Remove legacy `project.methodology` field
- Update all commands to read from `methodologies.selected`

### 2. Unify Help/Learn Commands

Make the transition smooth while being clear about the future:

**Tasks:**

- Make `help` command alias to `learn` with deprecation notice
- Fix `learn --compare` functionality
- Update all documentation to use `learn`
- Add clear migration message when using `help`

### 3. Fix MCP Server Commands

Each MCP command should have distinct, working functionality:

**Tasks:**

- Fix `--config` to properly check installation status
- Make `--tools` show actual available tools (not duplicate status)
- Add proper error messages and guidance
- Implement missing functionality

### 4. Interactive Testing Session

After implementing fixes, conduct a guided testing session:

- Walk through each command
- User provides screenshots of actual output
- Fix any remaining issues based on real feedback

## Rabbit Holes

- Don't redesign the entire config structure - just fix the immediate issues
- Don't remove `help` command entirely - maintain backwards compatibility
- Don't try to fix all MCP issues at once - focus on the reported bugs

## Nice-to-haves

- Migration command to fix existing broken configs
- Better error messages that guide users to solutions
- Validation to prevent invalid config states
