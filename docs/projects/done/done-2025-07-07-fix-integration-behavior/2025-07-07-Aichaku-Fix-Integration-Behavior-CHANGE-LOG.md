# Change Log: Aichaku v0.6.0 - Fix Integration Behavior

**Date**: 2025-07-07

## Summary

Major enhancement to Aichaku that transforms it from passive documentation into
an active behavioral system. This fundamental change makes Claude Code
automatically follow methodology patterns without any manual intervention,
creating a truly "magical" developer experience.

## Problem Addressed

- Keywords like "shape up" had no effect
- Documents created in wrong locations
- Too much manual effort required
- Integration was passive, not directive

## Changes Made

### 1. Updated `src/commands/integrate.ts`

- Replaced passive CLAUDE.md content with imperative "YOU MUST" directives
- Added specific file paths for all methodology guides
- Included automatic behavior rules and error recovery
- Added git automation instructions

### 2. Enhanced `src/commands/init.ts`

- Pre-creates `.claude/output/` directory with README
- Creates `.aichaku-behavior` quick reference file
- Creates `RULES-REMINDER.md` for behavioral reinforcement
- Added helper functions: `getOutputReadmeContent()`, `getBehaviorContent()`,
  `getRulesReminderContent()`

### 3. Updated `cli.ts`

- Enhanced success messages to set clear expectations
- Added examples of natural language triggers
- Emphasized automatic document creation

## Technical Details

- All changes are backward compatible
- No breaking changes to existing API
- Code passes all quality checks (fmt, lint, type check)
- Tested with fresh installation

## Expected Impact

You experience:

- Automatic document creation in correct locations
- Natural language triggers working immediately
- No manual directory creation needed
- "Magical" experience where things just work

## Version Justification (v0.6.0)

This is a minor version bump (not a patch) because:

- **Fundamental behavior change**: From passive to active system
- **New features**: Pre-created directories, behavioral files, enhanced
  integration
- **User experience transformation**: Completely changes how you interact with
  Aichaku
- **Backward compatible**: Existing installations continue to work

## Files Modified

- `src/commands/integrate.ts` - New directive CLAUDE.md content
- `src/commands/init.ts` - Pre-create output structure
- `cli.ts` - Enhanced success messages

## Test Results

✅ Local installation test successful ✅ All behavioral files created correctly
✅ CLAUDE.md integration includes directives ✅ Output directory pre-created
with guidance
