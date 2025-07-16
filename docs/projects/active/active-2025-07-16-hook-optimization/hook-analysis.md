# Hook Optimization Analysis

## Problem

API usage cutoff likely due to excessive hook invocations.

## Analysis Results

### Hook Invocation Frequency

Based on log analysis from `/tmp/aichaku-hooks.log`:

1. **aichaku-feedback**: 1,719 calls ⚠️ CRITICAL
   - Runs on EVERY tool use (matcher: ".*")
   - Provides minimal value (just logs "Hook system active ✓")
   - Primary culprit for API overuse

2. **commit-validator**: 480 calls
   - Runs on every Bash command
   - Useful for git commits but fires on ALL bash commands

3. **status-updater**: 360 calls
   - Runs on Write/Edit/MultiEdit operations
   - Shows project activity reminders

4. **markdown-review**: 360 calls
   - Runs on Write/Edit/MultiEdit operations
   - Calls MCP integration

5. **jsdoc-checker**: 360 calls
   - Runs on Write/Edit/MultiEdit operations
   - Provides JSDoc suggestions

6. **docs-review**: 360 calls
   - Runs on Write/Edit/MultiEdit operations
   - Document quality checks

7. **path-validator**: 147 calls
   - Validates Aichaku file structure
   - Less frequent, more targeted

8. **conversation-summary**: 24 calls
   - PreCompact hook
   - Creates checkpoint summaries

## Recommendations

### Immediate Actions

1. **DISABLE aichaku-feedback** - This is the primary issue, providing minimal
   value for 1,719 API calls
2. **REFINE commit-validator** - Should only run on actual git commands, not all
   bash commands
3. **CONSOLIDATE PostToolUse hooks** - Combine docs-review, jsdoc-checker, and
   markdown-review into one

### Hook Configuration Changes

Current problematic configuration:

```json
{
  "matcher": ".*",
  "hooks": [{
    "type": "command",
    "command": "deno run ... aichaku-feedback"
  }]
}
```

Should be removed entirely or significantly restricted.

## Impact

- aichaku-feedback alone accounts for ~70% of all hook calls
- Removing it should drastically reduce API usage
- Other hooks provide actual value and can be optimized rather than removed
