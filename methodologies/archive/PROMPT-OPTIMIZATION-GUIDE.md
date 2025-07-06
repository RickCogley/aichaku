# Methodology Prompt Optimization Guide

## Core Principles

### 1. All Methods Are AI-Optimized by Default
- Remove separate "AI" versions
- Every methodology assumes Claude Code execution
- Human collaboration points explicitly marked

### 2. Context-Aware Execution
Every methodology detects and adapts to:
- **Individual vs Team** mode
- **Project phase** 
- **Available information**
- **Decision authority**

### 3. Directive Over Descriptive
Transform from:
```
"You are a Shaper who explores problems..."
```
To:
```
WHEN shaping:
1. EXTRACT problem statement
2. IF missing context: ASK "[specific question]"
3. GENERATE solution approach
```

## Optimized Structure Template

```markdown
# [Methodology Name]

## CONTEXT DETECTION
```
IF user_count == 1:
  MODE = "individual"
  SKIP = ["stakeholder alignment", "team ceremonies"]
  ACCELERATE = ["decision making", "implementation"]
ELSE:
  MODE = "team"
  REQUIRE = ["explicit roles", "coordination points"]
  ADD = ["communication checkpoints"]
```

## ACTIVATION TRIGGERS
WHEN user says: [keywords/commands]
THEN activate: [specific protocol]

## EXECUTION PROTOCOLS

### [Phase Name] PROTOCOL
PRECONDITION: [what must be true]
HUMAN_DECISION: [where human input required]

1. ACTION: [specific directive]
   IF [condition]: ASK "[question]"
   ELSE: PROCEED to step 2

2. GENERATE: [specific output]
   SAVE TO: [exact location]
   FORMAT: [exact structure]

### HUMAN INTERACTION POINTS
🤔 PAUSE HERE:
- Present options: [A, B, C]
- Explain implications
- Wait for decision
- DO NOT proceed without confirmation

### ERROR HANDLING
IF blocked:
- STOP immediately
- REPORT: "🚫 [Issue]"
- SUGGEST: [next action]
```

## Specific Improvements Needed

### 1. Shape Up
- Merge shapeup.md and shapeup-ai.md
- Add individual/team mode detection
- Mark betting table as team-only decision point
- Clarify when to prompt for human input

### 2. Scrum
- Detect team size for ceremony adaptation
- Individual mode = simplified ceremonies
- Add prompts for role clarification
- Explicit standup format based on team size

### 3. Kanban
- Auto-calculate WIP limits based on team size
- Individual mode = personal kanban
- Team mode = shared board visualization
- Prompt for bottleneck decisions

### 4. XP
- Pair programming adaptation for remote/solo
- TDD prompts more directive
- Individual mode = self-review patterns
- Team mode = pairing assignments

### 5. Lean
- Startup vs enterprise context detection
- Individual = rapid experimentation
- Team = coordinated experiments
- Explicit MVP scoping prompts

## Human Prompting Strategy

### When to Prompt Humans

1. **Strategic Decisions**
```
🤔 "This decision will impact the next 6 weeks. Please choose:
   A) [Option with implications]
   B) [Option with implications]
   Your choice will determine [specific outcomes]"
```

2. **Missing Context**
```
❓ "To proceed effectively, I need to know:
   - [Specific question 1]
   - [Specific question 2]
   This helps me [reason for needing info]"
```

3. **Risk Points**
```
⚠️ "I've identified a critical risk:
   [Specific risk]
   Should I:
   A) Proceed with mitigation: [approach]
   B) Pause for team discussion
   C) Document and continue"
```

4. **Phase Transitions**
```
🔄 "Ready to move from [phase] to [phase].
   This means:
   - [What changes]
   - [What's committed]
   Continue? (y/n)"
```

## Context Detection Patterns

### Individual Indicators
- "I", "my", "me"
- No team mentions
- Quick decisions
- Personal projects

### Team Indicators  
- "We", "our", "team"
- Multiple names mentioned
- "Stakeholders", "meeting"
- Coordination language

### Project Scale Detection
- "MVP", "prototype" → Lean/lightweight
- "Enterprise", "compliance" → Full process
- "Startup", "experiment" → Rapid iteration
- "Client", "contract" → Formal structure

## Implementation Priority

1. **Phase 1**: Restructure Shape Up (it's the most complex)
2. **Phase 2**: Update Scrum/Kanban (most commonly used)
3. **Phase 3**: Optimize XP/Lean (specialized use)
4. **Phase 4**: Create meta-prompt for methodology selection

## Success Metrics

A well-optimized prompt should:
- Reduce back-and-forth clarifications by 50%
- Make individual/team mode obvious
- Never proceed past decision points without confirmation
- Generate consistent outputs in correct locations
- Adapt complexity to context automatically