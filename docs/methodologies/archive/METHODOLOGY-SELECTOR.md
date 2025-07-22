# Methodology Selection Protocol

## PRIMARY DETECTION

ANALYZE user input for methodology indicators:

```
IF explicit*methodology*mentioned:
  USE specified methodology
ELSE:
  PROCEED to context analysis
```

## CONTEXT ANALYSIS

### Work Type Detection

```
IF contains(["bug", "issue", "fix", "support", "incident"]):
  IF volume > 5 per week:
    RECOMMEND: Kanban
    REASON: "Continuous flow better for high-volume fixes"
  ELSE:
    RECOMMEND: Current methodology + Kanban board
    REASON: "Visual tracking without process change"

ELIF contains(["feature", "new", "capability", "build"]):
  IF timeline_mentioned:
    IF timeline <= 2 weeks:
      RECOMMEND: Shape Up (Small Batch)
    ELIF timeline <= 1 month:
      RECOMMEND: Scrum (2-week sprints)
    ELSE:
      RECOMMEND: Shape Up (Big Batch)
  ELSE:
    ASK: "What's your timeline for this feature?"

ELIF contains(["MVP", "experiment", "validate", "startup"]):
  RECOMMEND: Lean
  REASON: "Build-measure-learn cycle ideal for validation"

ELIF contains(["quality", "testing", "refactor", "technical debt"]):
  RECOMMEND: XP practices + current methodology
  REASON: "Layer engineering practices onto existing flow"
```

### Team Context Detection

```
team*size = detect*team_size()

IF team_size == 1:
  EXCLUDE: [Scrum]  # Too much ceremony
  PREFER: [Kanban, Shape Up, Lean]

ELIF team_size <= 3:
  SUITABLE: [All methodologies]
  OPTIMIZE: Reduce ceremonies

ELIF team_size <= 9:
  IDEAL: [Scrum, Shape Up]
  GOOD: [Kanban, Scrumban]

ELSE:  # team_size > 9
  RECOMMEND: "Consider splitting into smaller teams"
  IF must*stay*together:
    USE: Scaled versions (SAFe, LeSS)
```

### Project Stage Detection

```
IF contains(["starting", "new project", "greenfield"]):
  Stage = "inception"
  RECOMMEND: Shape Up for initial shaping, then choose execution method

ELIF contains(["maintaining", "established", "legacy"]):
  Stage = "maintenance"
  RECOMMEND: Kanban with XP practices

ELIF contains(["scaling", "growing", "expanding team"]):
  Stage = "growth"
  RECOMMEND: Scrum or Scrumban for predictability

ELIF contains(["optimizing", "improving flow", "reducing waste"]):
  Stage = "optimization"
  RECOMMEND: Lean principles + current methodology
```

## METHODOLOGY MIXING PATTERNS

### Common Combinations

```
PRIMARY: Shape Up
ADD: XP practices during build phase
USE: "Shape features, build with TDD"

PRIMARY: Scrum
ADD: Kanban for bug tracking
USE: "Sprint for features, flow for fixes"

PRIMARY: Kanban
ADD: XP practices for quality
USE: "Flow with engineering excellence"

PRIMARY: Lean
ADD: Shape Up for feature definition
USE: "Experiment with shaped bets"
```

### Transition Patterns

```
FROM Scrum TO Kanban:
  SUGGEST: Scrumban as transition
  TIMELINE: 2-3 months

FROM Nothing TO Agile:
  START: Kanban (least disruptive)
  EVOLVE: Based on pain points

FROM Waterfall TO Agile:
  START: Scrum (familiar structure)
  GRADUALLY: Reduce documentation
```

## INTELLIGENT RECOMMENDATIONS

### 🤔 When User is Unsure

"Based on what you've told me, I notice:

- Work type: [detected type]
- Team size: [detected size]
- Key needs: [extracted needs]

I recommend **[Methodology]** because:

- [Specific reason 1]
- [Specific reason 2]

Would you like to: A) Try this methodology now B) Learn more about it first C)
Explore alternatives"

### 🎯 Multi-Methodology Proposal

"Your project has different types of work. Consider:

**For feature development**: Shape Up

- Fixed time, variable scope
- Clear pitches before building

**For bug fixes**: Kanban board

- Continuous flow
- WIP limits prevent overload

**For quality**: XP practices

- TDD for new code
- Pair programming for complex parts

Shall I set up this hybrid approach?"

### ⚡ Quick Start Options

"Want to get started quickly? Choose:

A) **Minimal Process** → Kanban Just visualize and limit WIP

B) **Structured Sprints** → Scrum 2-week cycles with ceremonies

C) **Feature Focused** → Shape Up Shape, bet, build in cycles

D) **Quality First** → XP TDD and pairing from day one"

## CONTEXTUAL ADAPTATION

### Client Work Indicators

- "Contract", "client", "deliverable", "milestone"
- PREFER: Scrum or Scrumban for visibility
- ADD: Regular demos and reports

### Internal Product Indicators

- "Product", "users", "features", "roadmap"
- PREFER: Shape Up or Lean
- ADD: User feedback loops

### Platform/Infrastructure Indicators

- "Platform", "infrastructure", "DevOps", "reliability"
- PREFER: Kanban + XP
- ADD: Strong automation focus

### Innovation/R&D Indicators

- "Research", "prototype", "explore", "innovative"
- PREFER: Lean with Shape Up shaping
- ADD: Experiment tracking

## OUTPUT

AFTER methodology selection:

```
SELECTED: [Methodology]
RATIONALE: [Why this fits]
QUICK START:
  1. [First action]
  2. [Second action]
  3. [Third action]
LEARN MORE: /[methodology] help
```

## REMEMBER

- No methodology is permanent
- Start simple, evolve based on pain
- Mix methodologies where sensible
- Team buy-in matters more than "perfect" choice
- Measure and adjust based on outcomes
