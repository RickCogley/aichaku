# Hook System Dogfooding Test Plan

## Current Hook Configuration

We've installed 4 essential hooks to test during our development:

### 1. **path-validator** (PreToolUse: Write|MultiEdit)

- **Purpose**: Ensure files go in correct `docs/projects/active/YYYY-MM-DD-*`
  structure

- **Test**: Try creating a file in wrong location

- **Expected**: Warning message and blocked operation

### 2. **status-updater** (PostToolUse: Write|Edit|MultiEdit)

- **Purpose**: Remind to update STATUS.md when project files change

- **Test**: Edit any file in our active project directory

- **Expected**: Gentle reminder about updating STATUS.md

### 3. **commit-validator** (PreToolUse: Bash)

- **Purpose**: Ensure conventional commit format

- **Test**: Try a git commit command

- **Expected**: Guidance on conventional commit format

### 4. **conversation-summary** (Stop & PreCompact)

- **Purpose**: Auto-save session summaries

- **Test**: End session or hit context limits

- **Expected**: Summary saved to checkpoints

## Test Scenarios

### Scenario 1: Path Validation Test

````bash
# This should trigger path-validator
# Try creating a file outside the project structure
```text

### Scenario 2: Status Update Reminder

```bash
# This should trigger status-updater
# Edit any file in docs/projects/active/2025-01-13-*
```text

### Scenario 3: Commit Validation

```bash
# This should trigger commit-validator
git commit -m "bad commit message"
# Expected: Guidance on conventional commits
```text

### Scenario 4: JSDoc Coverage Check

Let me also check our JSDoc coverage while we're testing:

## Current Documentation Status

From our quick analysis:

- **385 JSDoc blocks** across 44 files

- Good coverage in `types.ts` with proper `@public`, `@param`, `@returns` tags

- Some files like `init.ts` have partial JSDoc coverage

## JSDoc Hook Idea

A **jsdoc-checker** hook could:

- Trigger on TypeScript file edits

- Check for missing function/class documentation

- Remind about Deno-specific JSDoc tags (`@public`, `@module`)

- Validate documentation completeness

**Deno JSDoc Differences:**

- Uses `@public` instead of `@export`

- Supports `@module` for file-level docs

- Built-in `deno doc` generation

- Different from TSDoc or standard JSDoc

Should we add this as a 5th hook to test?

## Success Criteria

1. **Path validator works**: Catches files in wrong locations

2. **Status updater helps**: Reminds us to update STATUS.md

3. **Commit validator guides**: Shows conventional commit format

4. **No performance issues**: Hooks run quickly and don't disrupt workflow

5. **Error handling works**: Failed hooks don't break Claude Code

## Hook Performance Expectations

- Each hook should complete in < 200ms

- Failed hooks should exit gracefully

- Debug logging should be visible in `/tmp/aichaku-hooks.log`

Let's start testing these hooks by actually using them during our continued
development!
````
