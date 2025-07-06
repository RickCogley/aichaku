# Simplified Methodology System

## Core Insight

Instead of complex personas and elaborate documentation, use simple behavioral
modes that adapt to context.

## The Three Modes

### 1. PLANNING MODE

**Activated by**: "plan", "shape", "prioritize", "what should we build"

```markdown
PLANNING_MODE: INPUT: User needs/problems OUTPUT: Structured work items

IF methodology == "Shape Up": OUTPUT: Pitch document CONSTRAINTS: 2 or 6 week
appetite

ELIF methodology == "Scrum": OUTPUT: Sprint backlog CONSTRAINTS: Team velocity

ELIF methodology == "Kanban": OUTPUT: Prioritized queue CONSTRAINTS:
Just-in-time

ELIF methodology == "Lean": OUTPUT: MVP definition CONSTRAINTS: Minimum to learn
```

### 2. EXECUTION MODE

**Activated by**: "build", "implement", "code", "let's do this"

```markdown
EXECUTION_MODE: INPUT: Defined work items OUTPUT: Working software

COMMON_RULES: - Complete before starting new - Report blockers immediately -
Maintain quality standards

METHODOLOGY_CONSTRAINTS: Scrum: Respect sprint boundary Kanban: Respect WIP
limits XP: Test first, pair when needed Shape Up: Stop at appetite limit
```

### 3. IMPROVEMENT MODE

**Activated by**: "review", "retrospective", "how are we doing", "metrics"

```markdown
IMPROVEMENT_MODE: INPUT: Work history OUTPUT: Process improvements

MEASURE: Scrum: Velocity, commitment rate Kanban: Cycle time, flow efficiency
Shape Up: Shipped vs planned Lean: Validated learning

SUGGEST: Specific improvements based on data
```

## Radical Simplification Example

### OLD: Complex Persona Switch

```
User: "Let's plan the next sprint"

Claude: *Loads Scrum Product Owner persona*
*Reads through role description*
*Applies backlog management principles*
*Considers stakeholder management*
*Thinks about INVEST criteria*

"As the Product Owner, I'll help you prepare for sprint planning..."
```

### NEW: Simple Mode Activation

```
User: "Let's plan the next sprint"

Claude: 
DETECTED: Planning request + "sprint" = Scrum Planning Mode

Sprint Planning Checklist:
□ Team capacity: ___ story points
□ Priority items ready: Yes/No
□ Dependencies cleared: Yes/No

Top backlog items:
1. [Drag highest priority here]
2. [Next priority]
3. [Continue until capacity]

Quick decisions needed:
- Include tech debt items? Y/N
- Any fixed commitments? Y/N
```

## The Entire System in One Page

```markdown
# Claude Code Methodology System

## MODE DETECTION

- Planning words → PLANNING MODE
- Action words → EXECUTION MODE
- Review words → IMPROVEMENT MODE

## METHODOLOGY DETECTION

- Sprint/Scrum words → rules = scrum_rules
- Flow/WIP/Kanban words → rules = kanban_rules
- Shape/Appetite words → rules = shapeup_rules
- Test/Pair/Refactor → add xp_practices
- MVP/Experiment → rules = lean_rules

## CONTEXT DETECTION

- team_size = count(participants)
- urgency = detect_timeline()
- type = feature|bug|experiment

## EXECUTION

Apply MODE with METHODOLOGY filtered by CONTEXT

## OUTPUTS

All outputs → .claude/output/[status]-[date]-[project]/ Format → Markdown
templates Style → Direct and actionable
```

## Benefits of Radical Simplification

### 1. Faster Response

No persona loading, just mode + rules

### 2. Easier to Understand

Three modes vs twelve personas

### 3. Natural Mixing

Easy to add XP to Scrum, or Kanban to anything

### 4. Context Sensitive

Automatically adjusts complexity

### 5. Predictable Behavior

MODE + METHODOLOGY + CONTEXT = BEHAVIOR

## Migration Path

### Phase 1: Keep existing structure, add mode detection

Personas become implementation details

### Phase 2: Consolidate personas into modes

Three files instead of twelve

### Phase 3: Move to pure behavioral rules

No personas, just adaptable modes

### Phase 4: Single configuration file

Everything in one smart document

## Example: Complete Interaction

```
User: "We need to fix some bugs and add a small feature"

Claude:
DETECTED: Mixed work (bugs + feature)
SUGGESTED: Kanban for bugs, Shape Up for feature

Quick Setup:
1. Bug board with WIP limit: 2
2. Feature shaping session

What would you like to start with?
A) Set up bug flow
B) Shape the feature  
C) See both in parallel
```

No personas loaded, no complex role playing, just pragmatic assistance based on
detected needs.

## The Ultimate Goal

Make methodology support so natural that users don't even think about it. They
just describe their work, and Claude Code automatically applies the right
constraints and guidance.

Instead of: "I am now a Scrum Master facilitating your sprint planning
ceremony..."

We get: "Sprint planning: Let's fill your capacity of 40 points. Top items..."

That's the difference between documentation and intelligent assistance.
