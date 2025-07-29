# Aichaku Bug Fixes - Status

## Status: 🔴 Planning

**Phase**: Shaping **Started**: 2025-07-28 **Appetite**: 2-3 days

## Current Issues

### 🐛 Methodology Configuration

- [ ] `methodologies --add` writes to wrong location (`project.methodology`)
- [ ] Only single methodology supported (should be multiple)
- [ ] Config structure inconsistent

### 🐛 Command Naming

- [ ] `help` vs `learn` confusion
- [ ] Documentation shows old command
- [ ] `learn --compare` broken

### 🐛 MCP Server

- [ ] `mcp --config` reports "not installed"
- [ ] `mcp --tools` duplicates `--status`
- [ ] General functionality issues

## Next Steps

1. Review and fix methodology configuration logic
2. Implement help→learn aliasing
3. Debug MCP server commands
4. Interactive testing session with user feedback

## Hill Chart

```
Figuring things out | Making it happen
-------------------|-------------------
         ▲         |
  (We are here)    |
```
