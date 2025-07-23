# Hook Visibility Test

The issue is that Claude Code only shows hook output when they block operations.

## Current Behavior

- PostToolUse hooks: Run silently
- PreToolUse hooks with exit 0: Run silently
- PreToolUse hooks with exit 2: Show output when blocking

## Solution Options

1. **Accept silent operation** - Hooks work but provide no feedback
2. **Occasional blocking messages** - Show feedback sometimes by blocking
3. **Alternative feedback method** - Use file system or other means

The MCP HTTP/SSE server connection tracking works because it's part of the
command output, not a hook.
