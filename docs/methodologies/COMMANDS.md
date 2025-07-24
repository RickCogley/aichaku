# Unified Command System

## Natural Language First

Claude Code responds best to natural descriptions:

- "I need to build user authentication"
- "Let's plan the next sprint"
- "How are we doing this week?"

## Optional Command Shortcuts

### Mode Commands

#### /plan [methodology]

Activate planning mode with optional methodology

```bash
/plan - Auto-detect best methodology
/plan shape-up - Use Shape Up specifically
/plan scrum - Sprint planning
```

#### /build

Start execution with current plan

```bash
/build - Continue from existing plan
/build task-name - Jump to specific task
```

#### /review

Check metrics and improvements

```bash
/review - Current period metrics
/review week - Last week's data
/review sprint - Sprint metrics
```

### Methodology Shortcuts

#### /shape

Quick Shape Up shaping session

```bash
/shape feature-name
→ Creates pitch with 2/6 week appetite
```

#### /sprint

Scrum sprint operations

```bash
/sprint plan - Plan next sprint
/sprint status - Current progress
/sprint review - Prep for review
```

#### /kanban

Kanban board operations

```bash
/kanban - Show current board
/kanban metrics - Flow metrics
/kanban wip - Check WIP limits
```

#### /tdd

Start TDD cycle

```bash
/tdd feature-name
→ Guides through red-green-refactor
```

#### /mvp

Define lean MVP

```bash
/mvp idea
→ Creates minimal experiment plan
```

### Quick Actions

#### /status

Universal status check

```text
Shows:
- Active methodology
- Current mode
- Recent progress
- Next actions
```

#### /switch [methodology]

Change active methodology

```bash
/switch kanban - Move to Kanban
/switch scrum - Move to Scrum
Warns about work in progress
```

#### /help [topic]

Get specific help

```bash
/help - General guidance
/help shape-up - Methodology details
/help planning - Mode explanation
```

## Smart Defaults

Even with commands, Claude Code:

- Detects context (team size, urgency)
- Suggests best approach
- Adapts complexity
- Remembers preferences

## Examples

### Natural Language

```text
You: "We have too many bugs"
Claude: *Detects problem*
        *Suggests Kanban for bug flow*
        *Creates WIP-limited board*
```

### With Commands

```text
You: "/kanban"
Claude: *Shows current board state*
        *Highlights bottlenecks*
        *Suggests improvements*
```

### Mixed Approach

```text
You: "Let's plan"
Claude: "What type of work?"
You: "/sprint plan"
Claude: *Sprint planning mode*
```

## Command Design Principles

1. **Optional**: Natural language always works
2. **Shortcuts**: Save typing, not required
3. **Consistent**: Similar patterns across methodologies
4. **Contextual**: Commands adapt to situation
5. **Helpful**: Always suggest next action

## Remember

Commands are shortcuts, not requirements. Describe what you need naturally, and Claude Code will help. Use commands when
you know exactly what you want.
