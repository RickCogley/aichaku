# Methodology Help Command - Feature Pitch

## Problem

Users want to understand what each methodology offers before choosing or using
them. Currently, they need to:

- Search online for methodology information
- Read through multiple files in `.claude/methodologies/`
- Ask Claude Code directly (but lose context)

There's no quick, built-in way to learn about a methodology's strengths,
weaknesses, and use cases.

## Appetite

Small batch - 2-3 days of work. This is a nice-to-have feature that enhances the
user experience but isn't critical for core functionality.

## Solution

Add a `help` command that provides concise, practical information about each
methodology:

```bash
# Show help for specific methodology
aichaku help kanban
aichaku help scrum
aichaku help shape-up

# List all available methodologies
aichaku help --list

# Show comparison table
aichaku help --compare
```

### Command Structure

```
aichaku help [methodology] [options]

Options:
  --list      List all available methodologies
  --compare   Show comparison table
  --verbose   Show extended information
```

### Content Structure

Each methodology help should include:

1. **Overview** (2-3 sentences)
2. **Key Concepts** (bullet points)
3. **Best For** (use cases)
4. **Not Ideal For** (anti-patterns)
5. **How Aichaku Implements It**
6. **Quick Start** (example commands/phrases)
7. **Learn More** (with AI prompt suggestion)

### Example Output

```
$ aichaku help kanban

📊 Kanban - Visual Flow Management

OVERVIEW:
Kanban focuses on visualizing work, limiting work in progress, and
maximizing flow. It's a pull-based system that helps teams deliver
continuously without fixed iterations.

KEY CONCEPTS:
• Visual board with columns (To Do, In Progress, Done)
• Work In Progress (WIP) limits
• Continuous flow vs. time-boxed iterations
• Pull system - take work when ready

BEST FOR:
• Continuous delivery environments
• Support/maintenance teams
• Teams with varying work sizes
• When priorities change frequently

NOT IDEAL FOR:
• Fixed deadline projects
• Teams needing predictable velocity
• Heavy upfront planning requirements

HOW AICHAKU IMPLEMENTS IT:
• Generates visual board representations
• Tracks WIP limits in execution mode
• Focuses on flow metrics vs. velocity
• Integrates with other methodologies seamlessly

QUICK START:
Say: "Show me our kanban board"
     "What's our WIP limit?"
     "Move task X to in progress"

💡 LEARN MORE:
For deeper insights, ask Claude Code:
"Tell me more about Kanban flow metrics and how to optimize them"
```

### Implementation Approach

1. **Embedded Help Content**
   - Store help content as structured data in the codebase
   - Keep it concise but comprehensive
   - Version with the methodologies

2. **Help Module Structure**

   ```
   src/commands/help/
   ├── help.ts           # Main command
   ├── content/
   │   ├── kanban.ts
   │   ├── scrum.ts
   │   ├── shape-up.ts
   │   ├── lean.ts
   │   ├── xp.ts
   │   └── scrumban.ts
   └── types.ts
   ```

3. **Integration Points**
   - Add to CLI command structure
   - Include in `--help` output
   - Reference in error messages ("Try: aichaku help scrum")

## Rabbit Holes

### Not Doing

- Interactive tutorials
- Video content or external links
- Methodology certification tracking
- Deep theoretical content
- Methodology configuration/customization

### Keeping It Simple

- Plain text output only
- Self-contained content (no network requests)
- Focus on practical usage over theory
- Consistent format across all methodologies

## No-Gos

- Don't make it a full documentation system
- Don't duplicate the extensive guides in methodologies folder
- Don't add complexity to the core workflow
- Don't require network access

## Nice-to-Haves (if time permits)

1. **Comparison Table**

   ```
   $ aichaku help --compare

   ┌─────────────┬───────────┬──────────┬──────────┐
   │ Methodology │ Iteration │ Planning │ Best For │
   ├─────────────┼───────────┼──────────┼──────────┤
   │ Scrum       │ Sprints   │ Heavy    │ Teams    │
   │ Kanban      │ Flow      │ Light    │ Support  │
   │ Shape Up    │ 6 weeks   │ Shaping  │ Features │
   └─────────────┴───────────┴──────────┴──────────┘
   ```

2. **Search/Filter**

   ```
   $ aichaku help --find "continuous"
   Found in: Kanban, XP, Scrumban
   ```

3. **Examples Repository**
   - Link to real-world usage examples
   - Show command combinations

## Success Criteria

1. Users can quickly understand what each methodology offers
2. Clear guidance on when to use each approach
3. Seamless integration with existing commands
4. Helps users make informed choices
5. Encourages exploration of Aichaku's capabilities

## Future Expansion

This sets up for potential future features:

- Methodology recommendations based on project type
- Integration with `aichaku init` to suggest methodologies
- Team onboarding workflows
- Methodology switching guides
