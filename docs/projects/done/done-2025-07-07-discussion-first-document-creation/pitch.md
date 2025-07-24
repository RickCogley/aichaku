# Discussion-First Document Creation

## Problem

Aichaku's current directives make Claude Code too eager to create project folders immediately when methodology keywords
are detected. This leads to:

1. **Premature folder creation** - Folders created before the effort is properly named or defined
2. **Multiple duplicate folders** - CC creates multiple folders due to uncertainty about naming
3. **Output clutter** - Unnecessary folders accumulate in the output directory
4. **Lost discussion context** - Important exploratory discussion happens after folder creation instead of before

## Solution

Implement a **discussion-first approach** with clear checkpoints before document creation:

### Phase 1: Discussion Mode (DEFAULT)

When methodology keywords are detected:

- Acknowledge the methodology context
- Engage in discussion to understand the problem/goal
- Help shape and refine the idea
- DO NOT create any folders yet

### Phase 2: Readiness Checkpoint

Look for explicit signals that user is ready to formalize:

- "Let's create a project for this"
- "I'm ready to start"
- "Please set up the project"
- "Create the documentation"
- Direct request to create specific documents

### Phase 3: Named Project Creation

Once user signals readiness:

- Confirm project name based on discussion
- Create single, well-named folder
- Generate all standard documents

## Implementation Details

### Update CLAUDE.md Integration

Add new section before current "AUTOMATIC Document Creation":

```markdown
## 🎯 MANDATORY: Discussion-First Approach

### Phase 1: Discussion Mode (DEFAULT)

When methodology keywords are detected, YOU MUST: ✅ Acknowledge: "I see you're thinking about [methodology context]" ✅
Ask clarifying questions ✅ Help shape and refine the idea ❌ DO NOT create any project folders ❌ DO NOT create any
documents

### Phase 2: Wait for Explicit Readiness

Only proceed to create documents when user says:

- "Let's create a project for this"
- "I'm ready to start"
- "Set up the project"
- "Create the documentation"
- Any direct request for project creation

### Phase 3: Create Named Project

When user is ready: ✅ Confirm name: "Based on our discussion, I'll name this project: [descriptive-name]" ✅ Create ONE
folder with clear name ✅ Generate all standard documents
```

### Modify Current Section 2

Change "CRITICAL: NO ASKING, JUST CREATE" to:

```markdown
### 2. CRITICAL: DISCUSSION FIRST, THEN CREATE

**During Discussion Phase:** ❌ NEVER say: "Would you like me to create..." ✅ ALWAYS say: "I understand you're
exploring [topic]. Let me help you think through this..."

**When User Signals Readiness:** ✅ IMMEDIATELY create without asking permission ✅ Say: "Creating project:
[descriptive-name]" ❌ NEVER ask for confirmation once signaled
```

## Benefits

1. **Better project definition** - Ideas are refined before formalization
2. **Clear naming** - Projects have descriptive names from the start
3. **No duplicates** - Single folder per effort
4. **Natural workflow** - Matches how people actually work
5. **Clean output** - Only intentional projects get folders

## Success Criteria

- Claude Code engages in helpful discussion when keywords detected
- No folders created until explicit user readiness
- All projects have clear, descriptive names
- Zero duplicate or poorly-named folders
- Users feel in control of when formalization happens
