# Aichaku Path Analysis: References to .claude and HOME directories

## Summary of Path Usage

The Aichaku codebase currently uses the following directory structure:

### Global Installation Paths

- `~/.claude/` - Global Aichaku installation directory
  - `~/.claude/methodologies/` - All methodology files
  - `~/.claude/docs/standards/` - All standards files (security, architecture, development, etc.)
  - `~/.claude/user/` - Global user customizations
  - `~/.claude/output/` - Global output directory
  - `~/.claude/.aichaku.json` - Global metadata file

### Project-Level Paths

- `./.claude/` - Project-specific Aichaku directory
  - `./.claude/user/` - Project customizations
  - `./.claude/output/` - Project output directory
  - `./.claude/.aichaku-project` - Project marker file
  - `./.claude/.aichaku-standards.json` - Selected standards configuration
  - `./.claude/.aichaku-doc-standards.json` - Selected documentation standards

## Files with Path References

### 1. **src/installer.ts**

- Line 5-7: `const HOME_DIR = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";`
- Line 7: `const GLOBAL*CLAUDE*DIR = join(HOME_DIR, ".claude");`
- Uses: Global installation path for methodologies

### 2. **src/commands/init.ts**

- Line 34: `const home = Deno.env.get("HOME") || "";`
- Line 36: `const globalPath = join(home, ".claude");`
- Line 39: `const targetPath = isGlobal ? globalPath : join(projectPath, ".claude");`
- Uses: Both global and project-level .claude directories

### 3. **src/commands/integrate.ts**

- Line 72: `const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";`
- Line 111-117: Path construction for standards: `join(home, ".claude", "standards", category, \`${standardId}.md\`)`
- Line 220-226: Path construction for documentation standards
- Line 366: References `~/.claude/methodologies/` in methodology section text
- Uses: Reading standards from global installation

### 4. **src/commands/standards.ts**

- Line 594: `const configPath = join(base, ".claude", ".aichaku-standards.json");`
- Uses: Project-level standards configuration

### 5. **src/commands/mcp.ts**

- References MCP server configuration in Claude Desktop settings
- Line 64-98: Shows example Claude Desktop configuration with paths

### 6. **src/commands/hooks.ts**

- References project .claude directory for hooks functionality

### 7. **mcp-server/src/standards-manager.ts**

- Line 132: `const homedir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";`
- Line 134: `join(homedir, ".claude", "standards")`
- Uses: Loading standards for MCP server

### 8. **mcp-server/src/methodology-manager.ts**

- Line 19: `const configPath = join(projectPath, ".claude", ".aichaku-standards.json");`
- Line 48-50: References `.claude/output/active-*/` for methodology detection
- Uses: Project-level methodology detection

### 9. **mcp-server/src/server.ts**

- Line 445-469: `getProjectPath` function looks for .claude directory
- Uses: Finding project root

### 10. **init.ts** (installer script)

- Line 224-227: Displays methodology path based on OS
- Uses: Showing where files are installed

### 11. **CLAUDE.md**

- Multiple references to `.claude/output/` directory structure
- References to `~/.claude/methodologies/` for reading guides
- Uses: Documentation and instructions for Claude Code

### 12. **README.md**

- References global installation at `~/.claude/`
- References project structure with `.claude/` directory

## Impact of Moving to .claude/aichaku

If we move everything under `.claude/aichaku/`, the following changes would be needed:

### Global Paths

- Change: `~/.claude/` → `~/.claude/aichaku/`
- Change: `~/.claude/methodologies/` → `~/.claude/aichaku/methodologies/`
- Change: `~/.claude/docs/standards/` → `~/.claude/aichaku/docs/standards/`
- Change: `~/.claude/user/` → `~/.claude/aichaku/user/`
- Change: `~/.claude/output/` → `~/.claude/aichaku/output/`

### Project Paths

- Change: `./.claude/` → `./.claude/aichaku/`
- Change: `./.claude/output/` → `./.claude/aichaku/output/`
- Change: `./.claude/user/` → `./.claude/aichaku/user/`

### Files to Update

1. **src/installer.ts** - Update GLOBAL*CLAUDE*DIR construction
2. **src/commands/init.ts** - Update globalPath and targetPath construction
3. **src/commands/integrate.ts** - Update standards path construction
4. **src/commands/standards.ts** - Update config path construction
5. **src/commands/mcp.ts** - Update documentation examples
6. **src/commands/hooks.ts** - Update project paths
7. **mcp-server/src/standards-manager.ts** - Update standards loading paths
8. **mcp-server/src/methodology-manager.ts** - Update project detection paths
9. **mcp-server/src/server.ts** - Update project root detection
10. **init.ts** - Update displayed paths
11. **CLAUDE.md** - Update all path references in documentation
12. **README.md** - Update installation path references
13. **All test files** - Update expected paths

### Migration Considerations

- Need migration logic to move existing installations
- Update all documentation
- Consider backward compatibility for existing projects
- Update any hardcoded paths in templates or examples
