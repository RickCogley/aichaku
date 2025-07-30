# Pitch: Rename --select to --add for Principles Command

## Problem

The principles command currently uses `--select` to choose principles for a project, while all other similar commands
use `--add`:

- `aichaku standards --add OWASP,TDD`
- `aichaku methodologies --add shape-up,scrum` (during init)
- `aichaku principles --select dry,kiss` ❌ Inconsistent!

This inconsistency creates confusion and breaks the established pattern.

## Appetite

1 hour - This is a straightforward refactoring that improves consistency.

## Solution

Rename all instances of `--select` to `--add` in the principles command to match the existing pattern:

- `aichaku principles --add dry,kiss` ✅ Consistent!

## Rabbit Holes

- Don't change the underlying functionality - just the flag name
- Keep backward compatibility in mind (though this is a new feature)
- Ensure all documentation is updated

## No-gos

- Don't change other flags like `--remove`, `--clear`, `--current`
- Don't change how principles are stored or processed
- Don't modify other commands

## Scope

### Must Have

1. Update CLI argument parsing to use `--add` instead of `--select`
2. Update all help text and examples
3. Update README documentation
4. Update any test files that reference `--select`
5. Update principle documentation files that show examples

### Nice to Have

- Add deprecation warning if someone uses `--select` (for graceful transition)

## Success Criteria

- All commands use consistent `--add` pattern
- Documentation is fully updated
- Tests pass with new flag name
- User experience is more intuitive
