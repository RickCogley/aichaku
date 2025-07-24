# Core Concepts

This document explains the fundamental concepts behind Aichaku and how they work together to support development teams.

## Understanding Aichaku

Aichaku (愛着) is a Japanese word meaning "attachment" or "affection" - the emotional connection that develops through
continued use and care. In software development, this represents the relationship between teams and their work, enhanced
by thoughtful tooling.

## The fundamental design principle

Aichaku recognizes that teams need two different types of resources:

### All methodologies available

Like having a complete toolkit, every project gets all methodologies:

- **Shape Up** for product-focused teams
- **Scrum** for iterative development
- **Kanban** for continuous flow
- **Lean** for experimentation
- **XP** for engineering practices
- **Scrumban** for hybrid approaches

Why? Because real teams adapt. A Shape Up team might need Scrum's retrospectives during difficult cycles. A Scrum team
might adopt Kanban's WIP limits for bug fixes. Having all methodologies available removes friction from these natural
adaptations.

### Selected standards enforced

Like choosing the right soil for your garden, standards are carefully selected:

- **NIST-CSF** for security governance
- **TDD** for quality assurance
- **Test Pyramid** for testing structure
- **SOLID** for design principles
- **Conventional Commits** for clear history

Why selected? Because too many standards create confusion. Better to master five essential standards than struggle with
fifty. These standards work across all methodologies - OWASP practices apply whether you're in a sprint or a Shape Up
cycle.

## The three modes

Instead of complex workflows, Aichaku recognizes three natural modes of work:

### Planning mode 🎯

**Triggered by**: "Let's plan", "shape", "sprint", "pitch", "design"

**Purpose**: Structure thoughts and create actionable plans

**What happens**:

1. Claude enters discussion mode
2. Asks clarifying questions
3. Helps refine ideas
4. Waits for explicit readiness
5. Creates planning documents

**Example**:

```text
You: "I need to shape a solution for our authentication system"
Claude: "🪴 Aichaku: I see you're thinking about shaping a solution. Let me help..."
[Discussion ensues]
You: "Let's create a project for this"
Claude: [Creates project with pitch.md, STATUS.md, etc.]
```

### Execution mode 🚀

**Triggered by**: "Let's build", "implement", "code", "develop"

**Purpose**: Track active work and maintain momentum

**What happens**:

1. Status updates to "Building" or "In Progress"
2. Task tracking becomes active
3. Focus shifts to implementation
4. Progress updates frequently

**Example**:

```text
You: "Time to start building this feature"
Claude: "🪴 Aichaku: Switching to execution mode. Updating status..."
```

### Improvement mode 📊

**Triggered by**: "retrospective", "review", "analyze", "metrics"

**Purpose**: Reflect on work and capture learnings

**What happens**:

1. Generate retrospective documents
2. Analyze metrics and outcomes
3. Capture lessons learned
4. Plan improvements

**Example**:

```text
You: "Let's do a retrospective on this sprint"
Claude: "🪴 Aichaku: Creating sprint retrospective. Let's reflect on what worked..."
```

## The two-phase approach

Aichaku respects user autonomy through a two-phase approach:

### Phase 1: Discussion

When methodology keywords are detected:

- Claude acknowledges the context
- Enters exploratory conversation
- Asks clarifying questions
- Helps shape ideas
- **No files created yet**

This respects that users might just be thinking out loud, not ready to formalize.

### Phase 2: Creation

Only when users explicitly signal:

- "Create a project for this"
- "I'm ready to start"
- "Set up the documentation"

Then Claude immediately:

- Creates project directory
- Generates STATUS.md
- Creates methodology documents
- **No confirmation needed**

This eliminates the annoying "Would you like me to..." prompts while ensuring user control.

## Document structure

### Every project has STATUS.md

The STATUS.md file provides:

- Current phase with visual indicator
- Progress tracking
- Key blockers and concerns
- Next actions

Example:

```markdown
# Project Status

🪴 Aichaku: Shape Up Progress

[Shaping] → [**Betting**] → [Building] → [Cool-down] ▲

Week 2/6 ████████░░░░░░░░░░ 33% 🌿

## Current Focus

Finalizing the pitch for betting table

## Blockers

- Need security team input on authentication approach

## Next Actions

- Complete solution outline
- Schedule betting table meeting
```

### Methodology-specific documents

Each methodology provides its essential documents:

**Shape Up**:

- `pitch.md` - Problem and solution shaped
- `cycle-plan.md` - Six-week execution plan
- `hill-chart.md` - Progress visualization

**Scrum**:

- `sprint-planning.md` - Sprint goals and items
- `user-story.md` - Story templates
- `retrospective.md` - Team reflection

**Kanban**:

- `kanban-board.md` - Board state
- `flow-metrics.md` - Cycle time, throughput

## Visual language

Aichaku uses consistent visual indicators:

### Growth phases

- 🌱 **New** - Just started, finding direction
- 🌿 **Active** - Growing, making progress
- 🌳 **Mature** - Ready for review or completion
- 🍃 **Complete** - Done, lessons captured

### Mode indicators

- 🎯 Planning mode
- 🚀 Execution mode
- 📊 Improvement mode

### Methodology icons

- 🔨 Shape Up (building)
- 🏃 Scrum (sprinting)
- 📍 Kanban (flow)
- 🧪 Lean (experimenting)

## Key principles

### Methodology inclusive

All methodologies are supported equally. Teams can:

- Start with one methodology
- Borrow practices from others
- Switch methodologies mid-project
- Blend approaches freely

### Standards selective

Only chosen standards are enforced. This provides:

- Focused guidance
- Consistent quality
- Reduced cognitive load
- Clear expectations

### Natural language

No commands to memorize. Just:

- Describe what you want
- Use normal language
- Let Claude understand context

### Progressive disclosure

Complexity appears only when needed:

- Start with basics
- Add features as you learn
- Never overwhelming

### Document-driven

All work produces artifacts:

- Plans become documents
- Progress tracked in files
- Decisions recorded permanently
- Knowledge preserved

## How teams actually work

Aichaku's design reflects real-world patterns:

### The startup journey

1. Begin with Lean experiments (MVP, metrics)
2. Adopt Scrum as team grows (sprints, ceremonies)
3. Transition to Shape Up at scale (cycles, betting)
4. Keep TDD and SOLID throughout

### The enterprise blend

- Scrum for feature development
- Kanban for maintenance
- Shape Up for innovation projects
- Consistent security standards

### The agency adaptation

- Different methodologies per client
- Consistent coding standards
- Flexible team arrangements
- Unified quality practices

## Why this works

### Flexibility where needed

Teams need freedom to adapt their process:

- Market conditions change
- Team composition evolves
- Project requirements shift
- Learning improves practices

### Consistency where it matters

Quality standards must remain stable:

- Security doesn't depend on methodology
- Testing practices transcend process
- Code principles stay constant
- Documentation standards persist

### Natural collaboration

The approach enhances human-AI partnership:

- Claude understands context
- Users express intent naturally
- Structure guides without constraining
- Flexibility enables creativity

## Common misconceptions

### "One methodology is enough"

Reality: Teams constantly borrow practices. Even "pure Scrum" teams often use:

- Kanban boards for visualization
- XP practices for engineering
- Lean metrics for validation

### "More standards are better"

Reality: Too many standards create paralysis. Focus on mastering essentials:

- Security (NIST-CSF)
- Quality (TDD)
- Design (SOLID)
- Process (Conventional Commits)

### "Structure limits creativity"

Reality: Structure enables creativity by:

- Reducing decision fatigue
- Providing clear boundaries
- Enabling focus on work
- Preserving knowledge

## The philosophy in action

Consider this scenario:

```text
You: "We need to handle authentication for our new app"
Claude: "🪴 Aichaku: I see you're thinking about authentication. What type of app is this?"
You: "It's a B2B SaaS platform with enterprise customers"
Claude: "That suggests strong security requirements. Are you considering SSO, MFA, or both?"
You: "Both, plus audit trails for compliance"
Claude: "Good thinking. Should we explore the technical approach or start with user stories?"
You: "Let's create a project to properly shape this"
Claude: "🪴 Aichaku: Creating project: authentication-system-design

Setting up Shape Up documentation with security focus..."
```

Notice how:

- Natural conversation flows
- No commands needed
- Context builds gradually
- Creation happens explicitly
- Structure appears when ready

## Foundation Quality Principles

Aichaku is built on enterprise-grade quality standards that ensure reliability and maintainability:

### Configuration-as-Code Architecture 🏗️

**Principle**: Single source of truth for all configurations

- All hardcoded lists eliminated in favor of dedicated configuration files
- Methodology fallbacks, defaults, and templates centrally managed
- Changes require only configuration updates, not code modifications
- Maintainable and auditable configuration management

### Consistent User Experience 🎨

**Principle**: Unified branding and messaging across all commands

- All user-facing output uses `🪴 Aichaku:` branding consistently
- Brand.\* functions ensure coherent visual identity
- Clear, actionable feedback for all operations
- Professional CLI interface standards

### Senior Engineer Standards ⚡

**Principle**: Code quality through automated verification

- Pre-flight checks: format, lint, type-check, test (all must pass)
- Zero tolerance for TypeScript errors or linting violations
- Comprehensive test coverage with 100% pass rate
- Clean git history with logical commit groupings

### Help System Compliance ✅

**Principle**: Predictable CLI behavior patterns

- All commands respect `--help` flag without execution
- Consistent help text formatting and information architecture
- Command discovery through standard CLI conventions
- User confidence through reliable interface patterns

### Visual Guidance Framework 🔧

**Principle**: Contextual feedback for user understanding

- "What did I do and where" explanations for all operations
- "What's next" structured guidance with actionable steps
- Visual diagrams for spatial awareness (directory trees, process flows)
- Enhanced user confidence through clear communication

These foundation principles ensure Aichaku provides enterprise-ready tooling with consistent quality across all
features.

## Summary

Aichaku's core concepts work together to create a development environment that's both flexible and consistent:

1. **All methodologies** provide process flexibility
2. **Selected standards** ensure quality consistency
3. **Three modes** match natural work patterns
4. **Two phases** respect user autonomy
5. **Visual language** enables quick comprehension
6. **Document artifacts** preserve knowledge

The result is a system that enhances how teams work with AI, providing structure that enables rather than constrains,
and flexibility that empowers rather than confuses.
