# Aichaku in Action - Real Examples

This document shows how different teams use different methodologies with Aichaku, all working harmoniously with Claude Code.

## Example Organization: TechStartup Inc.

### Product Team - Shape Up
**Folder**: `.claude/output/active-202501-new-feature/`
- Building major features with 6-week cycles
- Fixed time, variable scope approach
- See: `/done-202501-aichaku-creation/` for complete example

### Mobile Team - Scrum  
**Folder**: `.claude/output/active-202501-mobile-app/`
- 2-week sprints for predictable delivery
- Daily standups and regular ceremonies
- See: `sprint-4-plan.md` for sprint planning example

### DevOps Team - Kanban
**Folder**: `.claude/output/active-202501-website-bugfix/`
- Continuous flow for bugs and incidents
- WIP limits prevent overload
- See: `kanban-board.md` for board visualization

### Innovation Lab - Lean
**Folder**: `.claude/output/active-202501-marketplace-mvp/`
- Rapid experimentation with MVPs
- Build-measure-learn cycles
- See: `experiment-plan.md` for hypothesis testing

### Platform Team - XP
**Folder**: `.claude/output/active-202501-api-refactor/`
- Test-driven development
- Pair programming sessions
- See: `tdd-session.md` for pairing example

## How They Work Together

### Morning Standup Conversation
```
DevOps: "3 bugs in progress, 2 hitting review bottleneck"
Mobile: "Sprint day 5, on track for 39 points"
Product: "Week 2 of cycle, authentication shipped"
Platform: "Refactoring auth API, 100% test coverage"
Innovation: "MVP launched yesterday, 12% conversion!"
```

### Claude Code Adapts Automatically
```
User: "I need to fix a critical bug"
Claude: [Detects urgency → Kanban mode]
       "Let's add it to the expedite lane..."

User: "Time to plan next sprint"  
Claude: [Detects Scrum context → Planning mode]
       "Current velocity is 45 points..."

User: "Let's shape the payment feature"
Claude: [Detects Shape Up → Shaping mode]
       "What's the core problem with payments?"
```

## Benefits of Multi-Methodology

1. **Right tool for the job** - Each team uses what works best
2. **Natural boundaries** - Different folders prevent confusion
3. **Easy collaboration** - Standard outputs enable sharing
4. **Flexible switching** - Teams can experiment with methods

## Output Structure Example

```
.claude/output/
├── active-202501-website-bugfix/    (Kanban - DevOps)
│   └── kanban-board.md
├── active-202501-mobile-app/        (Scrum - Mobile)  
│   └── sprint-4-plan.md
├── active-202501-marketplace-mvp/   (Lean - Innovation)
│   └── experiment-plan.md
├── active-202501-api-refactor/      (XP - Platform)
│   └── tdd-session.md
└── done-202501-aichaku-creation/    (Shape Up - Product)
    ├── pitch.md
    ├── cycle-plan.md
    ├── execution-report.md
    ├── change-summary.md
    ├── change-summary.pdf
    └── retrospective.md
```

## Getting Started

1. **Install Aichaku**: `aichaku install`
2. **Start naturally**: "I need to build..."
3. **Let Claude detect**: Context → Mode → Methodology
4. **Work normally**: Focus on work, not process

## Remember

- No methodology is "better" - use what fits
- Start simple, evolve based on needs
- Mix methods where it makes sense
- The goal is shipping value, not following rules

---

*These examples are from real usage of Aichaku. Your experience will adapt to your specific context and needs.*