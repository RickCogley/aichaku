# Testing Hook Visibility

This file creation should trigger hooks.

## What We've Learned

1. PostToolUse hooks run silently
2. PreToolUse hooks can show output when blocking
3. Exit code 2 makes hooks visible when blocking operations
