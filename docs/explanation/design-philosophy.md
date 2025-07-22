# Aichaku Design Philosophy

This document explains the thinking behind Aichaku's design decisions and why
certain trade-offs were made.

## The core insight

Software teams face a fundamental challenge: they need flexibility in how they
work, but consistency in what they produce. This creates tension between:

- **Process flexibility**: Teams must adapt their workflow to changing
  circumstances
- **Quality consistency**: Code standards can't vary from sprint to sprint

Aichaku resolves this tension by treating methodologies and standards as
fundamentally different resources.

## Methodologies as toolkits

Think of methodologies like different styles of cooking:

- **French cuisine** (Shape Up): Careful preparation, precise timing, elegant
  presentation
- **Stir-fry** (Kanban): Continuous flow, quick adjustments, immediate serving
- **Baking** (Scrum): Fixed time boxes, specific ingredients, predictable
  results

Just as a chef might use techniques from multiple cuisines in one meal,
development teams blend methodologies. A team might use Shape Up's pitches with
Scrum's daily standups and Kanban's WIP limits.

This is why Aichaku provides all methodologies upfront - you can't predict which
techniques you'll need until you're in the kitchen.

## Standards as ingredients

While cooking techniques vary, food safety standards remain constant. You
always:

- Wash your hands
- Keep ingredients at safe temperatures
- Avoid cross-contamination
- Check expiration dates

Similarly, coding standards provide consistent quality regardless of
methodology:

- OWASP security practices apply whether you're in a sprint or a cycle
- TDD works with any planning approach
- SOLID principles transcend process boundaries

This is why standards are selectively integrated - you choose your quality
ingredients once and use them throughout.

## Design principles

### 1. Natural over formal

**Traditional approach**: Learn command syntax, memorize flags, follow rigid
workflows

**Aichaku approach**: Express intent naturally, let the system understand
context

Example:

```text
Traditional: aichaku create project --type=shape-up --name=auth --template=pitch
Aichaku: "I need to shape a solution for authentication"
```

The natural approach reduces cognitive load and makes the tool disappear into
the workflow.

### 2. Progressive disclosure

**Start simple**: Basic usage requires no configuration or command memorization

**Add complexity gradually**: Advanced features reveal themselves when needed

**Never overwhelming**: Context-appropriate suggestions, not information dumps

This mirrors how humans learn - start with fundamentals, add nuance through
experience.

### 3. Flexibility through structure

**Paradox**: Too much flexibility creates chaos; too much structure creates
rigidity

**Resolution**: Provide flexible methodologies within structured organization

The `.claude/output/` structure is rigid, but what goes inside is completely
flexible. Like a garden with defined beds but diverse plants.

### 4. Explicit transitions

**Problem**: Implicit mode changes confuse users and AI alike

**Solution**: Clear phase transitions with visual indicators

When moving from planning to execution, both user and Claude see:

- Status update in STATUS.md
- Visual indicator change (🌱 → 🌿)
- Appropriate document templates

### 5. Documentation as artifact

**Traditional**: Documentation separate from work

**Aichaku**: Documentation IS the work

Every Aichaku interaction produces tangible artifacts:

- Plans become pitch.md
- Progress lives in STATUS.md
- Decisions recorded in documents

This ensures knowledge persistence across time and team members.

## The garden metaphor

Aichaku uses gardening metaphors thoughtfully:

### Why gardens?

Gardens represent:

- **Organic growth**: Projects evolve naturally, not mechanically
- **Careful tending**: Success requires attention, not just process
- **Seasonal cycles**: Different phases need different care
- **Diversity**: Many approaches can coexist harmoniously

### Why NOT gardens?

We avoid overdoing the metaphor:

- No "planting seeds of ideas"
- No "harvesting results"
- No "cross-pollinating concepts"

The metaphor provides visual indicators and mental models, not purple prose.

## Trade-off decisions

### All methodologies vs. selected methodologies

**Option A**: Let users choose which methodologies to install

**Option B**: Install all methodologies always

**We chose B because**:

- Teams rarely know which methodologies they'll need
- Disk space is cheap (300KB total)
- Friction prevents experimentation
- Offline work requires local copies

**Downside**: More files in every project

**Mitigation**: Clear .gitignore patterns

### File system vs. database

**Option A**: Store configuration and state in a database

**Option B**: Use the file system as the database

**We chose B because**:

- Complete transparency
- Git versioning works naturally
- No corruption issues
- Zero dependencies
- Claude can read/write directly

**Downside**: No complex queries

**Mitigation**: Simple, predictable structure

### Injection vs. reference

**Option A**: Standards reference external files

**Option B**: Standards injected into CLAUDE.md

**We chose B because**:

- Single file for Claude to read
- Faster performance
- Users can customize
- Clear what's active

**Downside**: Larger CLAUDE.md files

**Mitigation**: Only selected standards injected

## Anti-patterns we avoid

### 1. Configuration complexity

**Anti-pattern**: Dozens of options, complex YAML files, decision paralysis

**Our approach**: Sensible defaults, minimal configuration, progressive options

### 2. Rigid methodology enforcement

**Anti-pattern**: "You must follow Scrum exactly as prescribed"

**Our approach**: Mix and match freely, adapt to your needs

### 3. Hidden magic

**Anti-pattern**: Unclear what the tool is doing behind the scenes

**Our approach**: Visible file operations, clear status updates

### 4. Network dependencies

**Anti-pattern**: Requires internet for basic operations

**Our approach**: Everything works offline, no external dependencies

### 5. Vendor lock-in

**Anti-pattern**: Proprietary formats, closed ecosystems

**Our approach**: Plain text files, open standards, portable data

## Future philosophy

As Aichaku evolves, these principles will guide decisions:

### What we'll always do

- Keep the core simple
- Respect user autonomy
- Work offline first
- Use open standards
- Maintain transparency

### What we'll never do

- Require accounts or registration
- Track user behavior
- Break backward compatibility
- Hide functionality behind paywalls
- Complicate the basic workflow

### What we might do

- Add optional enhancements (like MCP)
- Support new methodologies
- Provide team features
- Enable plugin systems
- Offer cloud sync (optional)

## The philosophy in practice

Consider a real scenario: A startup beginning with Lean experiments, growing
into Scrum, then maturing to Shape Up.

**Without Aichaku**: Each transition requires:

- Learning new tools
- Migrating data
- Retraining team
- Lost context

**With Aichaku**: Transitions are natural:

- All methodologies already available
- Same file structure throughout
- Historical work preserved
- Mix approaches as needed

The startup's OWASP security standards and TDD practices remain constant
throughout, providing stability during process evolution.

## Why this matters

Software development is fundamentally about managing complexity. Aichaku's
philosophy reduces complexity through:

1. **Clear conceptual models**: Methodologies vs. standards
2. **Predictable behavior**: No surprises or magic
3. **Natural workflows**: Work how you think
4. **Progressive learning**: Complexity when needed
5. **Flexible structure**: Freedom within boundaries

## Summary

Aichaku's design philosophy can be summarized as:

> Provide complete flexibility for how teams work (methodologies) while
> maintaining consistency in what they produce (standards), through natural
> interfaces and transparent operations.

Every design decision flows from this principle. When faced with choices, we
ask:

- Does this respect the methodology/standards distinction?
- Does this feel natural to use?
- Does this work offline?
- Does this increase transparency?
- Does this preserve flexibility?

The result is a tool that enhances human-AI collaboration without getting in the
way - structure that enables rather than constrains.
