# Aichaku Integration Fix - Solution Design

## The Core Problem

Claude Code reads CLAUDE.md but the current integration only **informs** rather than **directs** behavior.

## Multi-Layer Solution

### Layer 1: Directive CLAUDE.md Integration

Replace the passive information with active commands:

```markdown
## Methodologies - REQUIRED BEHAVIOR

This project uses Aichaku. When working on this project, you MUST:

### 1. Document Creation Rules

**ALWAYS create documents in**: `.claude/output/active-YYYY-MM-DD-{descriptive-name}/`

**NEVER create documents in**:
- Project root (/)  
- .claude/user/ (that's for user customizations)
- Random locations

### 2. Automatic Document Creation

When you hear these triggers, IMMEDIATELY:

1. Create project structure: `.claude/output/active-YYYY-MM-DD-{descriptive-name}/`
2. Create STATUS.md with current status
3. Create appropriate methodology documents:

**Planning Triggers** ("let's plan", "shape this", "create a pitch"):
- Read `~/.claude/methodologies/core/PLANNING-MODE.md`
- Shape Up: Create pitch.md using `~/.claude/methodologies/shape-up/templates/pitch.md`
- Scrum: Create sprint-planning.md using `~/.claude/methodologies/scrum/templates/sprint-planning.md`
- Kanban: Create kanban-board.md using `~/.claude/methodologies/kanban/templates/kanban-board.md`

**Execution Triggers** ("implement", "build", "start coding"):
- Read `~/.claude/methodologies/core/EXECUTION-MODE.md`
- Create execution-plan.md
- WAIT for human approval before coding

**Review Triggers** ("review", "retrospective", "how are we doing"):
- Read `~/.claude/methodologies/core/IMPROVEMENT-MODE.md`
- Create metrics.md and retrospective.md

### 3. Methodology File Locations

**ALWAYS read from these EXACT paths**:
- Planning Mode: `~/.claude/methodologies/core/PLANNING-MODE.md`
- Execution Mode: `~/.claude/methodologies/core/EXECUTION-MODE.md`  
- Improvement Mode: `~/.claude/methodologies/core/IMPROVEMENT-MODE.md`

**Methodology-specific guides**:
- Shape Up: `~/.claude/methodologies/shape-up/SHAPE-UP-AICHAKU-GUIDE.md`
- Scrum: `~/.claude/methodologies/scrum/SCRUM-AICHAKU-GUIDE.md`
- Kanban: `~/.claude/methodologies/kanban/KANBAN-AICHAKU-GUIDE.md`
- Lean: `~/.claude/methodologies/lean/LEAN-AICHAKU-GUIDE.md`
- XP: `~/.claude/methodologies/xp/XP-AICHAKU-GUIDE.md`

### 4. Status Management

**ALWAYS update folder names** as work progresses:
- `active-*` → Work in progress
- `complete-*` → Finished successfully (rename when done)
- `cancelled-*` → Work stopped (rename if cancelled)
- `paused-*` → Temporarily on hold

**When completing work**:
1. Create CHANGE-LOG.md summarizing all changes
2. Rename folder from active- to complete-
3. Ask user: "Work appears complete. Shall I commit and push?"

### 5. Progress Communication

**ALWAYS keep user informed**:
- Update STATUS.md after each significant action
- Start responses with current status: "📍 Currently in [mode] working on [task]"
- End planning with: "📋 Planning complete. Ready to proceed?"
- Never start implementation without explicit approval

### 6. Git Automation

**When work is complete and confirmed**:
1. Stage all changes: `git add .claude/output/[current-project]/`
2. Create conventional commit:
   - feat: New features
   - fix: Bug fixes
   - docs: Documentation only
   - refactor: Code changes without feature change
3. Push to origin: `git push origin [current-branch]`

**For large efforts**: Ask "Should I create multiple commits for better history?"

### 7. Document Creation Freedom

**NEVER ask permission** to create documents. Just create them.
**ALWAYS create** supporting documents as needed (diagrams, notes, research).
**FREELY organize** with subdirectories as appropriate.

CRITICAL: This is all AUTOMATIC behavior. Users expect a magical experience.
```

### Layer 2: Pre-created Structure

During `aichaku init`, create:

```
.claude/
├── output/
│   └── README.md         # Explains the active-*/done-* convention
├── user/
│   └── README.md         # Already created
└── .aichaku-behavior     # Quick reference for Claude Code
```

The `.aichaku-behavior` file:
```markdown
# Quick Reference for Claude Code

Before ANY work:
1. Check .claude/output/ for existing active-* directories
2. Create new active-YYYY-MM-DD-{name} for new work
3. Always create STATUS.md first
4. Read methodology guides from ~/.claude/methodologies/
```

### Layer 3: Output Directory README

```markdown
# Aichaku Output Directory

This directory contains all project documentation organized by status and date.

## Structure

- `active-*` - Currently ongoing work
- `done-*` - Completed projects (rename from active- when done)

## Naming Convention

`[status]-YYYY-MM-DD-[descriptive-kebab-case-name]`

Examples:
- active-2025-01-07-user-authentication
- active-2025-01-07-fix-performance-issues
- done-2025-01-06-global-project-redesign

## What Goes Here

Each project directory should contain:
- STATUS.md - Current status and progress
- Planning documents (pitches, specs, backlogs)
- Progress updates
- Metrics and reviews

## For Claude Code

When users discuss new work, IMMEDIATELY create a new active-* directory here.
Don't wait to be asked. This is expected behavior.
```

### Layer 4: Enhanced Commands.json

Add a `.claude/commands.json` for quick triggers:

```json
{
  "commands": {
    "/plan": {
      "description": "Start planning mode",
      "action": "1. Create .claude/output/active-{YYYY-MM-DD}-{name}/ 2. Read ~/.claude/methodologies/core/PLANNING-MODE.md 3. Create STATUS.md and appropriate planning documents"
    },
    "/build": {
      "description": "Start execution mode",
      "action": "1. Read ~/.claude/methodologies/core/EXECUTION-MODE.md 2. Create execution-plan.md 3. Wait for approval before coding"
    },
    "/review": {
      "description": "Start improvement mode", 
      "action": "1. Read ~/.claude/methodologies/core/IMPROVEMENT-MODE.md 2. Create metrics.md and retrospective.md"
    },
    "/status": {
      "description": "Show current project status",
      "action": "1. List all .claude/output/active-*/ directories 2. Read each STATUS.md 3. Summarize current state"
    },
    "/complete": {
      "description": "Mark current work as complete",
      "action": "1. Create CHANGE-LOG.md 2. Rename active- to complete- 3. Git add, commit with conventional message, push"
    },
    "/methodology": {
      "description": "Check which methodology to use",
      "action": "1. Analyze current context 2. Read ~/.claude/methodologies/BLENDING-GUIDE.md 3. Explain methodology choice"
    }
  }
}
```

### Layer 5: Behavioral Reinforcement

Add reminders at key points:

1. **In init.ts success message**:
   ```
   💡 Claude Code will now automatically:
      - Create documents in .claude/output/
      - Follow methodology patterns
      - Respond to keywords like "shape", "sprint", "kanban"
   ```

2. **In CLAUDE.md footer**:
   ```markdown
   ---
   REMINDER: Always check .claude/output/ before creating new documents.
   ```

## Implementation Priority

1. **CRITICAL**: Rewrite CLAUDE.md integration to be directive
2. **HIGH**: Pre-create output directory with README
3. **HIGH**: Add .aichaku-behavior quick reference
4. **MEDIUM**: Add behavioral reinforcement messages
5. **LOW**: Add commands.json for shortcuts

## Testing Plan

1. Fresh install in new project
2. Say "let's shape a new feature"
3. Verify documents created in .claude/output/active-*/
4. No manual intervention needed

## Success Metrics

- Zero manual directory creation
- Documents always in correct location
- Natural language triggers work immediately
- Users report "magical" experience