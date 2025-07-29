# Aichaku v0.36.1 Verification Checklist

## Features to Test

### 1. Methodology Selection (During Init)

- [ ] Run `aichaku init` - does it show methodology selection prompt?
- [ ] Can you select multiple methodologies with space?
- [ ] Are selected methodologies saved to correct location?
- [ ] Does `aichaku methodologies --show` display them correctly?

### 2. Methodology Management Commands

- [ ] `aichaku methodologies --list` - shows available methodologies?
- [ ] `aichaku methodologies --add <name>` - adds correctly?
- [ ] `aichaku methodologies --remove <name>` - removes correctly?
- [ ] `aichaku methodologies --show` - displays current selection?

### 3. Merge-Docs Command

- [ ] `aichaku merge-docs` - does it run?
- [ ] Does it create docs/merged/ directory?
- [ ] Are the merged guides created properly?
- [ ] Do they only include selected methodologies?

### 4. Learn Command (formerly Help)

- [ ] `aichaku learn` - shows help?
- [ ] `aichaku learn --list` - lists methodologies?
- [ ] `aichaku learn --compare` - shows comparison?
- [ ] `aichaku learn shape-up` - shows specific methodology?
- [ ] `aichaku help` - still works? Shows deprecation?

### 5. MCP Server Commands

- [ ] `aichaku mcp --install` - installs servers?
- [ ] `aichaku mcp --status` - shows server status?
- [ ] `aichaku mcp --config` - shows configuration help?
- [ ] `aichaku mcp --tools` - lists available tools?
- [ ] `aichaku mcp --start-server` - starts HTTP server?
- [ ] `aichaku mcp --server-status` - checks HTTP server?

### 6. Standards Commands

- [ ] `aichaku standards --list` - shows all standards?
- [ ] `aichaku standards --add <name>` - adds standard?
- [ ] `aichaku standards --show` - shows selected standards?
- [ ] `aichaku standards --search <term>` - searches properly?

### 7. Integration Command

- [ ] `aichaku integrate` - updates CLAUDE.md?
- [ ] Does it include only selected methodologies?
- [ ] Is the context size actually reduced?

### 8. Upgrade Command

- [ ] `aichaku upgrade` - preserves methodology selection?
- [ ] `aichaku upgrade --global` - updates global files?

### 9. Agent System (via CLAUDE.md)

- [ ] Are agent definitions included in CLAUDE.md?
- [ ] Do they reference selected methodologies?
- [ ] Are technology experts listed?

## Questions to Answer

1. **Config File Structure**: What's the correct structure for methodologies?
2. **Multiple Methodologies**: Should users be able to select multiple?
3. **Default Behavior**: What happens if no methodology is selected?
4. **Backwards Compatibility**: How to handle old configs?
5. **Error Messages**: Are they helpful when things go wrong?

## Let's Test Each One

Please run these commands and share the output/screenshots so I can identify all bugs:

```bash
# 1. Check current state
aichaku --version
aichaku methodologies --show
cat .claude/aichaku/aichaku.json

# 2. Test methodology management
aichaku methodologies --list
aichaku methodologies --add scrum
aichaku methodologies --show

# 3. Test merge-docs
aichaku merge-docs
ls -la docs/merged/

# 4. Test learn/help
aichaku learn --list
aichaku learn --compare
aichaku help

# 5. Test MCP
aichaku mcp --status
aichaku mcp --config
aichaku mcp --tools

# 6. Test standards
aichaku standards --list
aichaku standards --show
```
