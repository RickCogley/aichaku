# Aichaku Feedback Hook

The `aichaku-feedback` hook provides visual confirmation that the Aichaku hook system is active and working. It runs as
a PreToolUse hook and shows brief, non-intrusive feedback about what Aichaku will monitor or check.

## Purpose

This hook addresses the "yes, the system is working" feedback that was missing. It provides immediate visual
confirmation when you interact with files or run commands, ensuring you know that Aichaku's automation is active.

## Installation

### Using the Aichaku CLI (Recommended)

```bash
# Install just the feedback hook globally
aichaku hooks --install aichaku-feedback --global

# Or install it as part of the essential hooks set
aichaku hooks --install essential --global
```

### Manual Installation

If you prefer to add it manually via Claude Code's `/hooks` command:

1. Use `/hooks` in Claude Code
2. Select "PreToolUse" as the hook type
3. Add this configuration:
   ```json
   {
     "name": "Aichaku Feedback",
     "matcher": ".*",
     "hooks": [
       {
         "type": "command",
         "command": "deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts aichaku-feedback"
       }
     ]
   }
   ```

## What You'll See

### For Files

When you work with files, you'll see messages like:

- `🪴 Aichaku: Monitoring [filename]`
- `📁 Project file - will track progress` (for files in `/docs/projects/active/`)
- `📖 Markdown - will review standards` (for .md files)
- `📚 Code - will check JSDoc` (for TypeScript/JavaScript files)
- `🔒 Code - will check security` (for Python, Java, Go, etc.)
- `⚙️ Workflow - will validate actions` (for GitHub Actions files)
- `🧪 Test file - will check coverage` (for test files)
- `🔐 Config - extra security checks` (for .env and config files)

### For Commands

When you run commands, you'll see:

- `📝 Will check conventional format` (for git commit)
- `🚀 Will track CI/CD workflows` (for git push)
- `🔍 Will check security advisories` (for npm install/yarn add)
- `🧪 Will track test results` (for test commands)

### Generic Confirmation

For other operations:

- `🪴 Aichaku: Hook system active ✓`

## Key Features

1. **Non-blocking**: Always exits with code 0 to avoid disrupting your workflow
2. **Brief**: Shows just enough information to confirm hooks are working
3. **Context-aware**: Different messages based on file type or command
4. **Visual**: Uses console.error() to ensure messages appear in Claude Code's output

## Troubleshooting

If you don't see feedback after installing:

1. **Restart Claude Code** - Hooks require a restart to take effect
2. **Verify installation**:
   ```bash
   aichaku hooks --show
   ```
3. **Check the hook is executable**:
   ```bash
   ls -la ~/.claude/aichaku/hooks/aichaku-hooks.ts
   ```
4. **Look for errors**:
   ```bash
   tail -f /tmp/aichaku-hooks.log
   ```

## Customization

The feedback messages are defined in the `aichakuFeedback` function in `~/.claude/aichaku/hooks/aichaku-hooks.ts`. You
can customize them by editing this file.

## Performance

The feedback hook is designed to be extremely lightweight:

- Minimal processing (just pattern matching)
- Quick exit (always exits with 0)
- No file I/O except debug logging
- No external dependencies

This ensures it won't slow down your Claude Code experience while providing the confirmation you need.
