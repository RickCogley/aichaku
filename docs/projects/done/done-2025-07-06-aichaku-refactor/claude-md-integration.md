# CLAUDE.md Integration Feature

## Problem

When installing Aichaku globally, users need to manually add the methodology section to each project's CLAUDE.md file.

## Solution Options

### Option 1: Add to `aichaku init` command

When running `aichaku init` in a project (without --global), it could:

1. Check if CLAUDE.md exists
2. If yes, append the methodology section
3. If no, create CLAUDE.md with the methodology section

### Option 2: New command `aichaku integrate`

A dedicated command that:

```bash
# Add Aichaku reference to current project's CLAUDE.md
aichaku integrate

# Add to specific project
aichaku integrate --project /path/to/project
```

### Option 3: Interactive prompt

During `aichaku init`:

```
Aichaku is installed globally. Would you like to:
1. Add Aichaku reference to this project's CLAUDE.md? [Y/n]
```

## Recommended Approach

I recommend **Option 2** - a dedicated `integrate` command because:

- Explicit and clear intent
- Can be run anytime, not just during init
- Respects existing CLAUDE.md content
- Can handle different scenarios (append vs create)

## Implementation Plan

1. Create `src/commands/integrate.ts`
2. Logic:
   - Check for existing CLAUDE.md
   - If exists: Check if methodology section exists, append if not
   - If not exists: Create with standard template
3. Add command to CLI

## Template to Insert

```markdown
## Methodologies

This project uses the globally installed Aichaku adaptive methodology system. Claude Code will automatically blend
methodologies based on natural language:

- Say "sprint" for Scrum practices
- Say "shape" for Shape Up principles
- Say "kanban board" for flow visualization
- Say "MVP" for Lean approaches

The methodologies are installed globally in ~/.claude/methodologies/ and will adapt to how you naturally talk about
work.
```

## Usage

```bash
# In any project directory
aichaku integrate

# Output:
✅ Added Aichaku methodology reference to CLAUDE.md
```

This keeps the concerns separated and gives users control over when and where to integrate Aichaku references.
