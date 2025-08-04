# Simple Agile Methodologies for Claude Code

A lightweight, mode-based system that helps Claude Code work within your selected development methodology without
complex personas or verbose documentation.

## Quick Start

Aichaku users select their methodology through `aichaku methodologies --set [methodology]`. Claude Code then:

- Responds based on your selected methodology
- Works within the methodology when you mention its concepts (planning, building, or improving)
- Applies the constraints of your chosen approach
- Guides you within your selected framework

**You select the methodology. Claude Code works within your choice.**

## The Three Modes

### 📋 Planning Mode

_"What should we build?" / "Let's plan" / "Define this feature"_

Helps you decide what to build based on your methodology:

- **Shape Up**: Create rough pitches with fixed appetite
- **Scrum**: Build sprint backlogs within capacity
- **Kanban**: Order work by priority
- **Lean**: Define minimum viable experiments

### 🔨 Execution Mode

_"Let's build" / "Start coding" / "Implement this"_

Guides development with methodology constraints:

- **Shape Up**: Fixed time, variable scope
- **Scrum**: Sprint boundaries, daily updates
- **Kanban**: WIP limits, continuous flow
- **XP**: Test-first, quality focus

### 📊 Improvement Mode

_"How are we doing?" / "Retrospective" / "Show metrics"_

Measures and improves your process:

- Track methodology-specific metrics
- Identify bottlenecks and issues
- Suggest concrete improvements
- Keep what works, fix what doesn't

## Available Methodologies

### Shape Up

**When**: You need to define features with fixed timelines **Key concept**: 6-week cycles, appetite not estimates

```text
"Let's shape a new feature" → Pitch document with 2 or 6 week appetite
```

### Scrum

**When**: You want predictable delivery with regular rhythm **Key concept**: Sprints with ceremonies and roles

```text
"Plan next sprint" → Sprint backlog based on velocity
```

### Kanban

**When**: You have continuous flow work with varying priorities **Key concept**: Visualize work, limit WIP, optimize
flow

```text
"Show our kanban board" → Current state with WIP limits
```

### XP (Extreme Programming)

**When**: Code quality is critical **Key concept**: Technical practices like TDD and pairing

```text
"Let's TDD this feature" → Red-green-refactor cycles
```

### Lean

**When**: You need to validate ideas quickly **Key concept**: Build-measure-learn with MVPs

```text
"Define an MVP" → Minimum experiment to test hypothesis
```

## Methodology-Aware Response

Claude Code responds within your selected methodology based on:

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

```text
You: "I need to add user authentication"
Claude: Responds based on your selected methodology (e.g., Shape Up with 2-week appetite)
Output: Pitch document with rough solution
```

### Example 2: Bug Management

```text
You: "We're getting lots of bug reports"
Claude: Works within your selected methodology (if Kanban, uses board approach)
Output: WIP-limited board setup for bug flow
```

### Example 3: Quality Improvement

```text
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

```text
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

The best methodology is the one that helps you ship quality software sustainably. This system adapts to you, not the
other way around.

---

Ready? Just tell Claude Code what you want to build.
