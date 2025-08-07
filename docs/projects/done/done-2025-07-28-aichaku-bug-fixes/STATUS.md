# Aichaku Bug Fixes - Status

## Status: 🍃 COMPLETE

**Phase**: Cool-down ✓ **Started**: 2025-07-28 **Completed**: 2025-07-29 **Appetite**: 2-3 days (delivered in 2 days)

## Fixed Issues

### ✅ Methodology Configuration

- [x] `methodologies --add` writes to wrong location (`project.methodology`)
- [x] Only single methodology supported (should be multiple)
- [x] Config structure inconsistent

### ✅ Command Naming

- [x] `help` vs `learn` confusion
- [x] Documentation shows old command
- [x] `learn --compare` broken

### ✅ MCP Server

- [x] `mcp --config` reports "not installed"
- [x] `mcp --tools` duplicates `--status`
- [x] General functionality issues

## Resolution Summary

All bugs were fixed in v0.36.2 release on 2025-07-29:

- **Commit d77c888**: Complete v0.36.2 bug fixes with consistent help formatting
- **Commit e449697**: Complete remaining v0.36.2 bugfixes
- **Commit 7caa1a5**: Complete Phase 3-6 of v0.36.2 bugfixes
- **Commit 65f892c**: Complete Phase 1 and partial Phase 2 of v0.36.2 bugfixes

Key improvements:

- Init command now prompts for methodology selection
- Compare command shows actual YAML data
- MCP commands work correctly
- Consistent formatting across all commands
- Config structure cleaned up (removed project node)
