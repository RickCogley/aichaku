# Conversation Summary Hooks Design

## Overview

Implement hooks that automatically create conversation summaries at two critical
points:

- **Stop**: When user pauses/stops a conversation
- **PreCompact**: Before Claude compacts context due to length limits

## The Problem

- Conversations can lose important context when compacted
- Manual checkpoint creation is often forgotten
- Need deterministic way to preserve conversation state

## Proposed Solution

### Hook Script: summarize-conversation.ts

The existing script accepts:

- Session ID
- Transcript path
- Hook event name (Stop or PreCompact)

### Script Location Options

#### Option 1: Global Aichaku Directory (Recommended)

```
~/.claude/aichaku/hooks/summarize-conversation.ts
```

**Pros:**

- Consistent with Aichaku's new directory structure
- Easy to manage and update
- Clear ownership (Aichaku manages it)

#### Option 2: Deno Bin Directory

```
~/.deno/bin/aichaku-hooks/summarize-conversation.ts
```

**Pros:**

- Close to installed binaries **Cons:**
- Mixing data with executables
- Harder to find and manage

#### Option 3: Separate Hooks Directory

```
~/.aichaku/hooks/summarize-conversation.ts
```

**Pros:**

- Clean separation **Cons:**
- Yet another directory to manage

### Implementation Plan

1. **Create hooks directory during Aichaku install**
   ```bash
   mkdir -p ~/.claude/aichaku/hooks
   ```

2. **Install script with proper permissions**
   ```bash
   cp summarize-conversation.ts ~/.claude/aichaku/hooks/
   chmod +x ~/.claude/aichaku/hooks/summarize-conversation.ts
   ```

3. **Add to Aichaku hooks command**
   ```bash
   # New hook template
   "conversation-summary": {
     name: "Conversation Summary",
     description: "Auto-save summaries on Stop and PreCompact",
     hooks: [
       {
         type: "Stop",
         command: "deno run --allow-read --allow-run ~/.claude/aichaku/hooks/summarize-conversation.ts"
       },
       {
         type: "PreCompact", 
         command: "deno run --allow-read --allow-run ~/.claude/aichaku/hooks/summarize-conversation.ts"
       }
     ]
   }
   ```

4. **Update hooks installation**
   ```bash
   aichaku hooks --install conversation-summary
   ```

## Technical Considerations

### Claude Code Hook Format

Based on the example-hooks-for-stop-and-precompact.md, the format should be:

```json
{
  "hooks": {
    "Stop": [
      {
        "name": "Save Conversation Summary",
        "hooks": [
          {
            "type": "command",
            "command": "deno run --allow-read --allow-run ~/.claude/aichaku/hooks/summarize-conversation.ts"
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "name": "Pre-Compact Summary",
        "hooks": [
          {
            "type": "command",
            "command": "deno run --allow-read --allow-run ~/.claude/aichaku/hooks/summarize-conversation.ts"
          }
        ]
      }
    ]
  }
}
```

### Script Improvements Needed

1. **Handle both Stop and PreCompact events**
   - Different summary prefixes
   - Different output locations?

2. **Error handling**
   - What if Claude CLI isn't available?
   - What if output directory doesn't exist?

3. **Configuration**
   - Allow customizing output directory
   - Allow customizing summary format

## Integration with Aichaku

### New Command Option

```bash
# Install conversation summary hooks
aichaku hooks --install conversation-summary

# Configure summary location
aichaku hooks --config summary-dir ./docs/checkpoints
```

### Hook Categories Update

Add to HOOK_CATEGORIES:

```typescript
productivity: {
  name: "Productivity",
  description: "Workflow enhancement hooks",
  hooks: ["conversation-summary", "progress-tracker", "status-updater"]
}
```

## Next Steps

1. Decide on script location (recommend ~/.claude/aichaku/hooks/)
2. Update summarize-conversation.ts for better error handling
3. Add to hooks command as new template
4. Test with actual Stop and PreCompact events
5. Document in user guide

## Questions to Resolve

1. Should summaries go to project-specific or global location?
2. How to handle multiple active projects?
3. Should we use Claude CLI or internal API for summaries?
4. What format for summary filenames?

---

_Design created: 2025-01-13_
