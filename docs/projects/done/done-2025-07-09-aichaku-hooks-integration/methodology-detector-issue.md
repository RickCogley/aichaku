# Methodology Detector Hook Issue

## Problem Description

The `methodology-detector` hook in `/src/commands/hooks.ts` sets an environment variable `AICHAKU_MODE=planning` but
this variable is never used anywhere in the codebase.

## Current Implementation

```typescript
"methodology-detector": {
  name: "Aichaku Methodology Detector",
  description: "Sets environment variables based on detected methodology",
  type: "onSessionStart",
  command:
    `export AICHAKU_MODE=planning; echo "🪴 Aichaku: Methodology support activated"`,
}
```

## Analysis

- The hook exports `AICHAKU_MODE=planning` on session start
- Grep search shows no usage of `AICHAKU_MODE` anywhere in the codebase
- The hook effectively only displays a message with no functional impact

## Potential Solutions

### Option 1: Remove the Unused Variable

Simply update the hook to only show the message:

```typescript
command: `echo "🪴 Aichaku: Methodology support activated"`;
```

### Option 2: Implement the Intended Functionality

The original intent seems to be detecting and setting the current methodology mode. This could:

- Detect methodology from project files (shape-up, scrum, kanban, etc.)
- Set appropriate mode (planning, building, reviewing, etc.)
- Make this available to other hooks or commands

### Option 3: Enhanced Implementation

Create a more sophisticated methodology detection system:

1. Scan for methodology-specific files (pitch.md, sprint-planning.md, etc.)
2. Read STATUS.md to determine current phase
3. Set multiple environment variables:
   - `AICHAKU_METHODOLOGY` (shape-up, scrum, kanban, lean)
   - `AICHAKU_PHASE` (planning, executing, reviewing)
   - `AICHAKU_PROJECT` (current project name)

### Option 4: Remove the Hook Entirely

If there's no clear use case, remove it from the basic hooks set.

## Recommendation

Implement Option 3 - Enhanced Implementation. This would make the hook actually useful by:

- Providing context to Claude about the current methodology
- Enabling other hooks to behave differently based on methodology
- Supporting the adaptive nature of Aichaku

## Implementation Notes

- The environment variable would need to be set in a way that persists for the session
- Consider how this interacts with Claude Code's session management
- May need to store state in a file rather than environment variable

---

*Issue discovered: 2025-01-13* *Related to: Hook system implementation*
