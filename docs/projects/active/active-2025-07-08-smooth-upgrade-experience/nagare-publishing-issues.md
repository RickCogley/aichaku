# Summary of Publishing Problems with Nagare/JSR

## Core Issue
The JSR publish workflow fails almost every time during releases because formatting and type checking issues are discovered AFTER the tag is created and pushed.

## Specific Problems Encountered

### 1. Timing Issue
- Nagare creates and pushes the tag immediately after updating version files
- GitHub Actions then runs on that tagged commit
- If formatting/linting fails in CI, the tag already points to a "bad" commit

### 2. Formatting Inconsistencies
- Files that passed local checks failed in CI
- `deno.json` and `CHANGELOG.md` repeatedly had formatting issues (missing newlines)
- Had to run `deno fmt` multiple times and recreate tags

### 3. Type Checking Failures
- Version comparison code that worked locally failed in CI
- TypeScript literal type issues weren't caught before tagging
- Example: `VERSION === "0.7.0"` failed when VERSION was typed as literal `"0.8.0"`

### 4. Recovery Process is Painful
- Must delete tag locally: `git tag -d v0.8.0`
- Must delete tag remotely: `git push origin :refs/tags/v0.8.0`
- Fix issues, commit, push
- Recreate tag and push again
- Manually trigger JSR publish workflow

## Root Causes

1. **No Pre-flight Validation**: Nagare doesn't run the EXACT same checks that CI will run before creating the tag
2. **Different Environments**: Local Deno version might format differently than CI Deno version
3. **Tag-First Approach**: Creating the tag before validating the release is ready

## Suggested Improvements for Nagare

### 1. Pre-tag Validation Phase
```bash
# Before creating tag, run:
deno fmt --check
deno lint
deno check **/*.ts
deno test
# Only proceed if ALL pass
```

### 2. Atomic Release Process
- Create tag locally but don't push yet
- Run all CI checks locally in Docker/same environment
- Only push tag if everything passes

### 3. Better Error Recovery
- Detect CI failures and offer to automatically clean up failed releases
- Provide command to delete and retry: `nagare release:retry`

### 4. Format on Commit
- Auto-run `deno fmt` on all changed files before committing
- Never commit unformatted code

### 5. CI Environment Parity
- Document exact Deno version used in CI
- Provide Docker image or command to run checks in identical environment

## Example of What Happened

```bash
# 1. Nagare creates release
✅ Updated version.ts, CHANGELOG.md, etc.
✅ Created tag v0.8.0
✅ Pushed to GitHub

# 2. CI runs and fails
❌ Format check failed (missing newlines)
❌ Tag already exists pointing to bad commit

# 3. Manual recovery needed
$ git tag -d v0.8.0
$ git push origin :refs/tags/v0.8.0
$ deno fmt
$ git commit -m "fix: formatting"
$ git push
$ git tag v0.8.0
$ git push origin v0.8.0
$ gh workflow run "Publish to JSR" --ref v0.8.0
```

This happened 3 times in a row for different issues, making what should be a simple release into a 30+ minute debugging session.

## Specific Examples from Today's Aichaku Release

### Release v0.7.0
1. Initial release failed - formatting issues in `nagare.config.ts`
2. Fixed formatting, released
3. JSR publish failed - formatting issues in `deno.json` and `CHANGELOG.md`
4. Had to delete tag, fix formatting, recreate tag

### Release v0.8.0
1. Initial release succeeded in creating tag
2. JSR publish failed - formatting issues in `deno.json` and `CHANGELOG.md` (again)
3. Fixed formatting, but then type errors appeared
4. Fixed type errors: `VERSION === "0.7.0"` when VERSION was literal type `"0.8.0"`
5. Had to delete and recreate tag 3 times total

## Impact
- What should be a 2-minute release process becomes 30+ minutes
- Risk of pushing broken releases
- Confusion about which tag is "good"
- Manual intervention required every time