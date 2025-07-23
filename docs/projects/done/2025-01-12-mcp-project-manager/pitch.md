# MCP Project Documentation Manager

## Problem

Currently, project documentation management in Aichaku has several pain points:

1. **Inconsistent Placement**: Documents sometimes get saved to wrong locations
   due to human interpretation of CLAUDE.md directives

2. **Redundant Naming**: Folders like `active-2025-01-12-project-name` inside
   `active/` directory are redundant

3. **Incomplete Lifecycle**: Many "active" projects are actually complete but
   missing final documentation and haven't been moved to `done/`

4. **Manual Processes**: Moving projects, creating change logs, and maintaining
   status is all manual

This leads to:

- Messy project organization

- Difficulty finding relevant documentation

- Incomplete project histories

- Uncertainty about actual project status

## Appetite

3-4 days of focused work to create MCP tools and migrate existing structure

## Solution

### 1. Simplified Naming Convention

Remove redundant prefixes:

````text
Before: docs/projects/active/active-2025-01-12-project-name/
After:  docs/projects/active/2025-01-12-project-name/
```text

### 2. MCP Tools for Project Management

Create specialized MCP tools that enforce consistency:

```typescript
// Core tools
-create_project - // Creates new project with correct structure
  update_status - // Updates project STATUS.md with progress
  complete_project - // Generates CHANGE-LOG.md and moves to done/
  list_projects - // Shows active/done projects with status
  save_checkpoint; // Saves session checkpoint with proper naming
```text

### 3. Key Features

**create_project**:

- Automatically uses today's date

- Creates STATUS.md with correct template

- Adds methodology-specific files

- Returns project path for reference

**complete_project**:

- Generates comprehensive CHANGE-LOG.md from:

  - Git commits in project timeframe

  - STATUS.md updates

  - Files created/modified

- Moves from active/ to done/

- Updates any indices

**save_checkpoint**:

- Creates checkpoint with descriptive name

- Links to active projects

- Maintains consistent format

### 4. Migration Script

One-time script to:

- Remove redundant prefixes from all folders

- Identify truly complete projects

- Generate missing CHANGE-LOG.md files

- Move completed projects to done/

## Rabbit Holes

**NOT doing**:

- Complex project dependency tracking

- Automated git operations

- Project templates beyond basic Aichaku methodologies

- Web UI or complex visualization

**Keeping it simple**:

- Text-based STATUS.md remains source of truth

- Git commits remain separate from project docs

- Focus on consistency over features

## No-gos

- Don't break existing @ autocomplete paths

- Don't lose any existing documentation

- Don't make it harder to browse via GitHub Pages

- Don't require changes to CLAUDE.md methodology rules

## Next Steps

1. Create basic MCP tool structure

2. Implement core tools (create, complete, list)

3. Test with a few projects

4. Run migration on all existing projects

5. Update CLAUDE.md with new patterns

6. Document the tools in MCP-TOOLS.md

This will bring precision to project documentation and make the workflow more
reliable.
````
