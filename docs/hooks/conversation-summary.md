# Conversation Summary Hook

The `conversation-summary` hook automatically creates structured checkpoint
summaries of your Claude Code conversations. It runs as both a Stop and
PreCompact hook, ensuring you have persistent records of your work sessions
without manual intervention.

## Purpose

This hook solves the problem of losing context when conversations are compacted
or ended. It automatically:

- Reads conversation transcripts
- Generates structured summaries using Claude CLI
- Saves checkpoint files with timestamps
- Provides deterministic, automatic documentation

## How It Works

### Trigger Events

The hook runs automatically on:

- **Stop**: When you end a Claude Code session
- **PreCompact**: When Claude Code compacts long conversations

### Process Flow

1. Hook receives conversation transcript path from Claude Code
2. Reads the full conversation content
3. Creates a structured prompt for Claude CLI
4. Generates summary via `claude --print` with stdin
5. Saves summary to timestamped checkpoint file
6. Provides user feedback with file location

## Output Format

Checkpoint files are saved as:

```
/docs/checkpoints/checkpoint-YYYY-MM-DD-HHMMSS.md
```

### Content Structure

Each checkpoint includes:

```markdown
# Checkpoint Summary - YYYY-MM-DD

## Session Overview

Brief summary of what was accomplished

## Key Technical Decisions

Important choices made and rationale

## Files Modified

List of files created/modified with brief descriptions

## Problems Solved

Issues resolved during this session

## Next Steps

Immediate follow-up tasks or improvements needed
```

## Installation

### Automatic (Recommended)

The conversation-summary hook is installed automatically with Aichaku and
configured in your global Claude Code settings at `~/.claude/settings.json`.

### Manual Verification

Check if it's installed:

```bash
# View current hook configuration
grep -A 10 -B 10 "conversation-summary" ~/.claude/settings.json
```

You should see entries for both Stop and PreCompact hooks:

```json
"Stop": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "deno run --allow-read --allow-write --allow-env --allow-run ~/.claude/aichaku/hooks/aichaku-hooks.ts conversation-summary"
      }
    ]
  }
],
"PreCompact": [
  {
    "hooks": [
      {
        "type": "command", 
        "command": "deno run --allow-read --allow-write --allow-env --allow-run ~/.claude/aichaku/hooks/aichaku-hooks.ts conversation-summary"
      }
    ]
  }
]
```

## What You'll See

### Success Messages

When the hook works correctly:

```
🪴 Aichaku: ✅ Checkpoint summary created automatically
   📄 Saved to: docs/checkpoints/checkpoint-2025-07-14-125047.md
```

### Error Messages

If something goes wrong:

```
🪴 Aichaku: ⚠️ Could not create automatic summary
   💡 Use /checkpoint command to create manual summary
```

## Requirements

The hook requires these Deno permissions:

- `--allow-read` - Read conversation transcripts
- `--allow-write` - Write checkpoint files
- `--allow-env` - Access environment variables
- `--allow-run` - Execute Claude CLI command

## Troubleshooting

### No Checkpoint Files Created

1. **Check hook installation**:
   ```bash
   grep "conversation-summary" ~/.claude/settings.json
   ```

2. **Verify checkpoint directory exists**:
   ```bash
   ls -la docs/checkpoints/
   ```

3. **Check for hook errors**:
   ```bash
   tail -f /tmp/aichaku-hooks.log
   ```

4. **Test manually**:
   ```bash
   echo '{"transcript_path": "/some/test/file.md"}' | \
   deno run --allow-read --allow-write --allow-env --allow-run \
   ~/.claude/aichaku/hooks/aichaku-hooks.ts conversation-summary
   ```

### Claude CLI Not Found

If you see "command not found" errors:

1. Ensure Claude CLI is installed and in PATH
2. Test: `claude --version`
3. Restart your terminal/Claude Code

### Permission Errors

If you see permission-related errors:

1. Check the hook command includes all required `--allow-*` flags
2. Ensure the aichaku-hooks.ts file is readable
3. Verify the checkpoints directory is writable

## Benefits

### Automatic Documentation

- No manual effort required
- Consistent format across all sessions
- Timestamped for easy reference

### Context Preservation

- Maintains record of technical decisions
- Documents problem-solving approaches
- Tracks file modifications

### Project Continuity

- Easy to resume work from where you left off
- Helps onboard team members
- Provides audit trail for complex projects

## Performance

The hook is designed to be efficient:

- Uses Claude CLI via stdin to avoid argument length limits
- Minimal file I/O
- Runs asynchronously after conversation ends
- Handles large transcripts gracefully

## Security Considerations

- Hook only reads conversation transcripts (no sensitive system access)
- Checkpoint files contain only conversation content you've already seen
- Uses secure temporary file handling
- Respects Deno's permission model

This hook ensures you never lose important context from your development
sessions, providing automatic documentation that helps maintain project
continuity and knowledge preservation.
