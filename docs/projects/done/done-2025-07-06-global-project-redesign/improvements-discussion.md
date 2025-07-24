# Aichaku Improvements Discussion

## Issues Found During Testing

### 1. Global vs Project Installation Confusion

**Problem**: When Aichaku is installed globally, running `aichaku init` in a
project still copies all methodologies locally.

- Creates unnecessary duplication
- Forces users to add `.claude/` to `.gitignore` in every project
- Updates to global methodologies don't propagate to projects
- Confusing UX - why copy files if they're already global?

**Proposed Solution**:

- Global install: Methodologies live only in `~/.claude/`
- Project init: Only creates a `.aichaku-project` marker file
- Claude Code reads from global when available, falls back to project
- No need to gitignore methodology files

### 2. Redundant Messaging in Commands

**Problem**: Commands print the same information multiple times

- `aichaku integrate`: 3 variations of "updated CLAUDE.md"
- `aichaku upgrade --check`: Shows "upgraded successfully" when only checking
- `aichaku upgrade`: Shows "upgraded successfully" even when already up to date
- `aichaku uninstall --dry-run`: Shows "uninstalled successfully" on dry run

**Specific Issues**:

- Success messages appear even when no action was taken
- Check operations shouldn't say "upgraded"
- Dry runs shouldn't say "successfully completed action"

**Proposed Solution**:

- Keep progress messages (real-time feedback)
- Show success only when action actually happened
- Different messages for check vs action
- Clear dry run output without success claims

### 3. Missing "project" Qualifier

**Problem**: Messages say "CLAUDE.md" instead of "project CLAUDE.md"

- Not clear whether it's updating project or global file

**Proposed Solution**:

- Add "project" or "global" qualifier to all file references

### 4. Init Command Missing Helpful Next Steps

**Problem**: After init, users don't know about:

- `aichaku integrate` command
- `--help` for more options
- GitHub repo for docs

**Already Fixed in uncommitted changes**

## Design Philosophy Questions

1. **Should project-level init exist at all if global is installed?**
   - Maybe just have `aichaku integrate` for projects?
   - Or `aichaku init` in a project just creates a marker file?

2. **How should methodology updates work?**
   - If using global, updates should just work
   - If project-specific, need explicit upgrade

3. **What's the minimal project footprint?**
   - Just a marker file?
   - Just additions to CLAUDE.md?
   - No .claude directory at all?

## Next Steps for Testing

Still need to test:

- [ ] `aichaku upgrade --check`
- [ ] `aichaku upgrade`
- [ ] `aichaku uninstall --dry-run`

## Summary of Improvements Needed

1. **Rethink global vs project architecture**
2. **Fix redundant messaging across all commands**
3. **Add project/global qualifiers to messages**
4. **Improve init output** (already have changes)
5. **Consider simplifying project initialization**
6. **Emphasize folder structure in methodology files**
   - Add "ALWAYS START WITH STRUCTURE" section to all core files
   - Make active-YYYY-MM-DD-name pattern automatic
   - Ensure natural language triggers folder creation
7. **Improve uninstall command**
   - Search for Aichaku references in CLAUDE.md
   - Show line numbers where found
   - Suggest manual removal without auto-modifying
