# Progress Indicator Design for Aichaku

## Overview

This document designs an optimal progress indicator system for Aichaku that works effectively in Claude Code's environment, supporting all methodologies with clear visual feedback.

## Design Principles

1. **ASCII-First**: Use ASCII art for maximum compatibility
2. **Emoji Enhancement**: Optional emoji for richer display when supported
3. **Methodology-Aware**: Different styles for different workflows
4. **STATUS.md Integration**: Seamless updates to tracking files
5. **Clear "You Are Here"**: Obvious current phase indication

## Core Progress Bar Design

### ASCII Progress Bar Components

```
Basic structure:
[===========-------] 65% Complete

With phases:
[Plan|====Execute====|--Review--] Phase 2 of 3

With time:
[████████░░░░░░░░] Week 4 of 6

Detailed view:
┌─ Shape Up Cycle ─────────────────────┐
│ Shaping    Building    Cool-down     │
│ [DONE]     [>>>>>>>]   [         ]   │
│            Week 3/6                  │
└──────────────────────────────────────┘
```

## Methodology-Specific Progress Indicators

### Shape Up Progress

```typescript
// 6-week cycle with phases
const shapeUpProgress = {
  ascii: `
┌─ Shape Up: Feature Authentication ───────────────┐
│                                                  │
│  Shaping     Building         Cool-down         │
│  [████]      [████████░░░░]   [        ]       │
│  Complete    Week 3 of 4      Not Started       │
│                                                  │
│  📍 You are here: Building (Day 15/28)          │
│                                                  │
│  Appetite: 6 weeks | Elapsed: 3.5 weeks        │
│  Status: ON TRACK ✅                             │
└──────────────────────────────────────────────────┘`,

  compact: `Shape Up [Shaping✓|Building>>>|Cool-down ] 58% (Week 3.5/6)`,
  
  minimal: `[████████████░░░░░░░░] Building - Week 3.5/6`
};
```

### Scrum Sprint Progress

```typescript
// 2-week sprint with daily tracking
const scrumProgress = {
  ascii: `
┌─ Sprint 15: User Dashboard ──────────────────────┐
│                                                  │
│  Day: 1 2 3 4 5 6 7 8 9 10                      │
│       ✓ ✓ ✓ ✓ ✓ ◐ ○ ○ ○ ○                       │
│                 ↑                                │
│            📍 Day 6                              │
│                                                  │
│  Velocity: 23/40 points                          │
│  Burndown: ▂▃▄▅▆▇█ (57% complete)              │
│                                                  │
│  Next: Daily Standup @ 9:30 AM                  │
└──────────────────────────────────────────────────┘`,

  compact: `Sprint 15 [Day 6/10] ████████░░░░ 23/40 pts`,
  
  minimal: `[██████░░░░] Day 6/10 - 57% complete`
};
```

### Kanban Flow Progress

```typescript
// Continuous flow with WIP limits
const kanbanProgress = {
  ascii: `
┌─ Kanban Board ───────────────────────────────────┐
│                                                  │
│  Backlog   Ready    Doing    Review   Done      │
│    (∞)     (5/5)    (2/3)    (1/2)    (47)     │
│     12       ●●       ●●       ●        ✓✓      │
│            ●●●●●              		          │
│                      📍                          │
│                 You: Task #234                   │
│                                                  │
│  Cycle Time: 3.2 days (↓ 0.5 from last week)   │
│  Throughput: 12 items/week                      │
└──────────────────────────────────────────────────┘`,

  compact: `Kanban [12|5*|2|1|47] WIP: 8/10, CT: 3.2d`,
  
  minimal: `[Ready:5|Doing:2*|Review:1] Flow: Normal`
};
```

### Lean MVP Progress

```typescript
// Build-Measure-Learn cycle
const leanProgress = {
  ascii: `
┌─ Lean MVP: Payment Flow ─────────────────────────┐
│                                                  │
│    Build         Measure        Learn           │
│  ┌────────┐    ┌─────────┐   ┌────────┐       │
│  │ ████░░ │ -> │         │ -> │        │       │
│  └────────┘    └─────────┘   └────────┘       │
│      75%           0%            0%             │
│       📍                                        │
│                                                  │
│  Hypothesis: Users will pay for premium         │
│  Progress: Building payment integration          │
│  Time Budget: 3/5 days used                     │
└──────────────────────────────────────────────────┘`,

  compact: `MVP Cycle [Build:75%|Measure:0%|Learn:0%] Day 3/5`,
  
  minimal: `[B:████░░|M:░░░░░░|L:░░░░░░] Building`
};
```

### XP Iteration Progress

```typescript
// 1-week iteration with practices
const xpProgress = {
  ascii: `
┌─ XP Iteration 8 ─────────────────────────────────┐
│                                                  │
│  Stories: ████████░░░░░░ 5/8 complete           │
│                                                  │
│  Practices Today:                                │
│  ✅ Morning Standup                              │
│  ✅ Pair Programming (3h)                        │
│  ⏳ TDD (Red-Green-Refactor)                    │
│  ○  Code Review                                 │
│  ○  Integration                                 │
│                                                  │
│  📍 Current: Implementing user story #45         │
│     Partner: @alice                              │
│     Tests: 12 ✅ 2 ❌                            │
└──────────────────────────────────────────────────┘`,

  compact: `XP Iter 8 [5/8 stories] TDD:12✅2❌ Pair:@alice`,
  
  minimal: `[████████░░░░░░] Story 5/8 - TDD Active`
};
```

## Progress Indicator API

```typescript
interface ProgressIndicator {
  // Core display methods
  show(style: 'ascii' | 'compact' | 'minimal'): string;
  update(progress: ProgressData): void;
  
  // STATUS.md integration
  writeToStatus(filePath: string): void;
  parseFromStatus(filePath: string): ProgressData;
  
  // Interactive features (where supported)
  animate(options?: AnimationOptions): void;
  showMilestone(message: string): void;
}

interface ProgressData {
  methodology: 'shape-up' | 'scrum' | 'kanban' | 'lean' | 'xp';
  phase: string;
  percentage: number;
  currentUnit: number;
  totalUnits: number;
  unitType: 'days' | 'weeks' | 'points' | 'stories';
  status: 'on-track' | 'at-risk' | 'blocked';
  metadata?: Record<string, any>;
}
```

## STATUS.md Integration Format

```markdown
# Status: [Project Name]

**Status**: ACTIVE - [Phase]
**Started**: [Date]
**Methodology**: Shape Up

## Progress Indicator
<!-- AICHAKU:PROGRESS:START -->
```
Shape Up Cycle: Feature Authentication
[Shaping:✓][Building:████░░░░][Cool-down:      ]
Week 3.5 of 6 | 58% Complete | ON TRACK
```
<!-- AICHAKU:PROGRESS:END -->

## Current Phase
📍 EXECUTION MODE - Building phase, Week 3

## Details
[Rest of STATUS.md content...]
```

## CLI Display Examples

### Full Dashboard View
```bash
$ aichaku status

╔══════════════════════════════════════════════════╗
║           Aichaku Project Status                 ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Active Projects: 3                              ║
║                                                  ║
║  1. feature-auth (Shape Up)                      ║
║     [████████████░░░░░░] Week 3.5/6             ║
║                                                  ║
║  2. sprint-15 (Scrum)                           ║
║     [██████░░░░░░░░░░░] Day 6/10               ║
║                                                  ║
║  3. support-queue (Kanban)                      ║
║     [Ready:5|Doing:2*|Review:1] Flow: Normal   ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

### Inline Progress Updates
```bash
$ aichaku progress
Shape Up [Building ████████░░░░] Week 3.5/6 - Creating auth service...
```

## Animation Concepts (for terminal support)

```typescript
// Spinner variations per methodology
const spinners = {
  'shape-up': ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  'scrum': ['◐', '◓', '◑', '◒'],
  'kanban': ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'],
  'lean': ['?', '!', '→', '✓'],
  'xp': ['🔴', '🟢', '♻️']  // Red, Green, Refactor
};

// Progress animations
const animations = {
  'wave': '░▒▓█▓▒░',
  'blocks': '▁▂▃▄▅▆▇█',
  'dots': '⣾⣽⣻⢿⡿⣟⣯⣷'
};
```

## Color Coding (ANSI)

```typescript
const colors = {
  'on-track': '\x1b[32m',    // Green
  'at-risk': '\x1b[33m',     // Yellow
  'blocked': '\x1b[31m',     // Red
  'complete': '\x1b[36m',    // Cyan
  'current': '\x1b[1m'       // Bold
};
```

## Implementation Priority

1. **Phase 1**: Basic ASCII progress bars
   - Simple percentage display
   - Methodology detection
   - STATUS.md integration

2. **Phase 2**: Methodology-specific layouts
   - Custom progress for each method
   - Phase indicators
   - Time tracking

3. **Phase 3**: Enhanced features
   - Color support detection
   - Animation options
   - Compact/minimal modes
   - Dashboard view

## Benefits Over External Libraries

While libraries like `ora` or `cli-progress` offer features, our custom solution provides:

1. **Zero Dependencies**: Maintains Aichaku's security stance
2. **Methodology-Aware**: Tailored to each workflow's needs
3. **STATUS.md Native**: Direct integration with our tracking
4. **Claude Code Optimized**: Works perfectly in AI environment
5. **Customizable**: Each methodology can have unique indicators

## Usage Examples

```bash
# Show current progress
$ aichaku progress
[████████░░░░░░░░] Building - Week 3.5/6

# Update progress
$ aichaku progress update --phase building --week 4
[██████████░░░░░░] Building - Week 4/6 ✓ Updated

# Show all active projects
$ aichaku status --all
3 active projects across Shape Up, Scrum, and Kanban

# Generate STATUS.md with progress
$ aichaku status generate
✓ Updated STATUS.md with current progress indicators
```

## Next Steps

1. Implement core progress calculation engine
2. Create ASCII art templates for each methodology
3. Build STATUS.md parser/writer
4. Add CLI commands for progress tracking
5. Test across different terminal environments
6. Document usage in methodology guides