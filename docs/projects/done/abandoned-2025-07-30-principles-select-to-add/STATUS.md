# Project Status: Rename --select to --add for Principles

**Status**: 🌱 Shaping → Betting → Building → Cool-down

## Current Phase: Shaping ✅ → Building 🚀

Appetite: 1 hour Progress: Ready to build

## Problem

The principles command uses `--select` while all other commands use `--add`, creating inconsistency in the CLI
interface.

## Planned Changes

1. **CLI Updates** (cli.ts)
   - Change `--select` to `--add` in argument parsing
   - Update help text

2. **Command Updates** (principles.ts)
   - Update option interface from `select` to `add`
   - Update all references in the code
   - Update help examples

3. **Documentation Updates**
   - README.md - Update all examples
   - Principle documentation files - Update "Learn More" sections
   - Test files - Update test commands

4. **Backward Compatibility** (optional)
   - Add alias for `--select` with deprecation warning

## Files to Update

- [ ] `/cli.ts` - Argument parsing
- [ ] `/src/commands/principles.ts` - Main command logic and help
- [ ] `/README.md` - Documentation examples
- [ ] `/docs/principles/**/*.md` - Learn More sections (18 files)
- [ ] `/tests/principles-test.ts` - Test commands
- [ ] `/docs/projects/active/active-2025-07-28-principles-guidance-system/` - Project docs

## Implementation Plan

1. Start with CLI and command files
2. Run tests to ensure functionality
3. Update all documentation
4. Final testing in fresh project
