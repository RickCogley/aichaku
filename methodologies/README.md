# Simple Agile Methodologies for Claude Code

A lightweight, mode-based system that helps Claude Code adapt to any development methodology without complex personas or verbose documentation.

## Quick Start

Just describe what you want to do. Claude Code automatically:
- Detects your intent (planning, building, or improving)
- Identifies the best methodology
- Applies the right constraints
- Guides you to success

**No complex commands. No personas. Just natural conversation.**

## The Three Modes

### 📋 Planning Mode
*"What should we build?" / "Let's plan" / "Define this feature"*

Helps you decide what to build based on your methodology:
- **Shape Up**: Create rough pitches with fixed appetite
- **Scrum**: Build sprint backlogs within capacity  
- **Kanban**: Order work by priority
- **Lean**: Define minimum viable experiments

### 🔨 Execution Mode
*"Let's build" / "Start coding" / "Implement this"*

Guides development with methodology constraints:
- **Shape Up**: Fixed time, variable scope
- **Scrum**: Sprint boundaries, daily updates
- **Kanban**: WIP limits, continuous flow
- **XP**: Test-first, quality focus

### 📊 Improvement Mode
*"How are we doing?" / "Retrospective" / "Show metrics"*

Measures and improves your process:
- Track methodology-specific metrics
- Identify bottlenecks and issues
- Suggest concrete improvements
- Keep what works, fix what doesn't

## Available Methodologies

### Shape Up
**When**: You need to define features with fixed timelines
**Key concept**: 6-week cycles, appetite not estimates
```
"Let's shape a new feature" → Pitch document with 2 or 6 week appetite
```

### Scrum
**When**: You want predictable delivery with regular rhythm
**Key concept**: Sprints with ceremonies and roles
```
"Plan next sprint" → Sprint backlog based on velocity
```

### Kanban  
**When**: You have continuous flow work with varying priorities
**Key concept**: Visualize work, limit WIP, optimize flow
```
"Show our kanban board" → Current state with WIP limits
```

### XP (Extreme Programming)
**When**: Code quality is critical
**Key concept**: Technical practices like TDD and pairing
```
"Let's TDD this feature" → Red-green-refactor cycles
```

### Lean
**When**: You need to validate ideas quickly
**Key concept**: Build-measure-learn with MVPs
```
"Define an MVP" → Minimum experiment to test hypothesis
```

## Smart Context Detection

Claude Code automatically adjusts based on:

**Team Size**
- Solo: Simplified process, fewer ceremonies
- Small team: Balanced approach
- Large team: Full methodology

**Work Type**
- Features: Shape Up or Scrum
- Bugs: Kanban
- Experiments: Lean
- Quality: Add XP practices

**Urgency**
- Urgent: Kanban flow
- Planned: Sprint or cycle
- Exploratory: Lean MVP

## Examples

### Example 1: Feature Development
```
You: "I need to add user authentication"
Claude: Detects feature work, checks context, suggests Shape Up with 2-week appetite
Output: Pitch document with rough solution
```

### Example 2: Bug Management
```
You: "We're getting lots of bug reports"
Claude: Detects support work, suggests Kanban board
Output: WIP-limited board setup for bug flow
```

### Example 3: Quality Improvement
```
You: "Our code quality is slipping"
Claude: Suggests adding XP practices to current methodology
Output: TDD introduction plan, pairing schedule
```

## Mix and Match

Methodologies aren't exclusive. Common combinations:

- **Scrum + Kanban**: Sprints for features, flow for bugs
- **Shape Up + XP**: Shape pitches, build with TDD
- **Lean + Kanban**: Experiments in continuous flow
- **Any + XP**: Add quality practices to any method

## Getting Started

1. **Just start talking**: Describe your situation naturally
2. **Answer simple questions**: Team size? Timeline? Work type?
3. **Get working quickly**: Minimal setup, maximum value
4. **Evolve as needed**: Start simple, add complexity if helpful

## Output Structure

All outputs saved to:
```
.claude/output/
  └── active-YYYYMM-projectname/
      ├── plans/
      ├── progress/
      └── metrics/
```

## Commands (Optional)

Natural language works best, but shortcuts available:
- `/plan` - Activate planning mode
- `/build` - Start execution mode
- `/review` - Check improvements
- `/help [methodology]` - Learn more

## Philosophy

- **Modes over roles**: Focus on what you're doing, not who you are
- **Simple over complex**: Start minimal, add only what helps
- **Adaptive over prescriptive**: Fit the method to your context
- **Progress over process**: Deliver value, not follow rules

## Remember

The best methodology is the one that helps you ship quality software sustainably. This system adapts to you, not the other way around.

---

Ready? Just tell Claude Code what you want to build.