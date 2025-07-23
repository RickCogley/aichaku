# Progress Indicator Examples

## Shape Up Examples

### Week 1 - Shaping Phase

````text
┌─ Shape Up: Authentication System ────────────────┐
│                                                  │
│  Shaping     Building         Cool-down         │
│  [█▄▄▄]      [        ]       [        ]       │
│  Day 3/7     Not Started      Not Started       │
│                                                  │
│  📍 You are here: Shaping (43% complete)        │
│                                                  │
│  Appetite: 6 weeks | Elapsed: 3 days           │
│  Status: ON TRACK ✅                             │
└──────────────────────────────────────────────────┘
```text

### Week 3 - Building Phase

```text
┌─ Shape Up: Authentication System ────────────────┐
│                                                  │
│  Shaping     Building         Cool-down         │
│  [████]      [████▄▄▄▄▄▄▄▄]   [        ]       │
│  Complete    Week 2 of 4      Not Started       │
│                                                  │
│  📍 You are here: Building (Day 7/28)           │
│                                                  │
│  Appetite: 6 weeks | Elapsed: 2.5 weeks        │
│  Status: ON TRACK ✅                             │
└──────────────────────────────────────────────────┘
```text

### Week 5 - At Risk

```text
┌─ Shape Up: Authentication System ────────────────┐
│                                                  │
│  Shaping     Building         Cool-down         │
│  [████]      [███████████▄]   [        ]       │
│  Complete    Week 4 of 4      Not Started       │
│                                                  │
│  📍 You are here: Building (Day 25/28)          │
│                                                  │
│  Appetite: 6 weeks | Elapsed: 5 weeks          │
│  Status: AT RISK ⚠️  (3 days remaining)         │
└──────────────────────────────────────────────────┘
```text

### Week 6 - Cool-down

```text
┌─ Shape Up: Authentication System ────────────────┐
│                                                  │
│  Shaping     Building         Cool-down         │
│  [████]      [████████████]   [██▄▄▄▄▄▄]       │
│  Complete    Complete         Day 3 of 7        │
│                                                  │
│  📍 You are here: Cool-down (43% complete)      │
│                                                  │
│  Appetite: 6 weeks | Elapsed: 5.5 weeks        │
│  Status: SHIPPING 🚀                             │
└──────────────────────────────────────────────────┘
```text

## Scrum Sprint Examples

### Sprint Day 1 - Planning

```text
┌─ Sprint 15: User Dashboard ──────────────────────┐
│                                                  │
│  Planning Day                                    │
│  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                           │
│  ↑                                               │
│  📍 Sprint Planning in progress                  │
│                                                  │
│  Capacity: 40 points                             │
│  Committed: 0 points (planning...)               │
│                                                  │
│  Next: Complete planning by 12:00 PM            │
└──────────────────────────────────────────────────┘
```text

### Sprint Day 5 - Mid Sprint

```text
┌─ Sprint 15: User Dashboard ──────────────────────┐
│                                                  │
│  M  T  W  T  F  M  T  W  T  F                   │
│  ✓  ✓  ✓  ✓  ◐  ○  ○  ○  ○  ○                  │
│                 ↑                                │
│            📍 Day 5                              │
│                                                  │
│  Burndown Chart:                                 │
│  40 ┤████                                       │
│  30 ┤   ████                                    │
│  20 ┤      ████▄▄▄ (actual)                     │
│  10 ┤           ▄▄▄▄▄▄ (ideal)                 │
│   0 └────────────────────────                   │
│                                                  │
│  Velocity: 18/40 points (45%)                   │
│  Status: ON TRACK ✅                             │
└──────────────────────────────────────────────────┘
```text

### Sprint Day 10 - Sprint Review

```text
┌─ Sprint 15: User Dashboard ──────────────────────┐
│                                                  │
│  M  T  W  T  F  M  T  W  T  F                   │
│  ✓  ✓  ✓  ✓  ✓  ✓  ✓  ✓  ✓  ✓                  │
│                                 ↑                │
│                           📍 Sprint Review       │
│                                                  │
│  Completed: 35/40 points (87.5%)                │
│  Demo Items: 8 stories                          │
│                                                  │
│  Sprint Velocity: 35 (↑5 from average)          │
│  Team Happiness: 😊😊😊😊😐                        │
│                                                  │
│  Next: Sprint 16 Planning Monday 9:00 AM        │
└──────────────────────────────────────────────────┘
```text

## Kanban Flow Examples

### Normal Flow

```text
┌─ Kanban Board ───────────────────────────────────┐
│                                                  │
│  Backlog   Ready    Doing    Review   Done      │
│    (∞)     (3/5)    (2/3)    (1/2)    (152)    │
│                                                  │
│  Flow Indicators:                                │
│  ←──────────────── 3.2 days ──────────────→     │
│                                                  │
│     8        ●●●      ●●       ●                │
│              📍 Your item: #234 (1.5 days)      │
│                                                  │
│  Throughput: ████████████ 12/week (↑2)          │
│  Cycle Time: ███████ 3.2 days (↓0.5)            │
│  WIP Health: ✅ Within limits                    │
└──────────────────────────────────────────────────┘
```text

### Bottleneck Detected

```text
┌─ Kanban Board ───────────────────────────────────┐
│                                                  │
│  Backlog   Ready    Doing    Review   Done      │
│    (∞)     (5/5)    (3/3)    (2/2)    (165)    │
│              ⚠️       ⚠️       🔴                │
│                                                  │
│  ⚠️  BOTTLENECK: Review queue full              │
│                                                  │
│     15      ●●●●●    ●●●      ●●               │
│                                                  │
│  Cycle Time: ████████████ 5.8 days (↑2.6) 📈    │
│  Action: Clear review queue before pulling new   │
└──────────────────────────────────────────────────┘
```text

### WIP Limit Violation

```text
┌─ Kanban Board ───────────────────────────────────┐
│                                                  │
│  Backlog   Ready    Doing    Review   Done      │
│    (∞)     (4/5)    (4/3)❌   (1/2)    (178)   │
│                                                  │
│  ❌ WIP LIMIT EXCEEDED: Doing (4/3)             │
│                                                  │
│  Policy: Finish current work before starting    │
│  Violation Duration: 2 hours                     │
│                                                  │
│  Team Focus: Complete task #456 or #457         │
└──────────────────────────────────────────────────┘
```text

## Lean MVP Examples

### Build Phase

```text
┌─ Lean MVP: Payment Integration ──────────────────┐
│                                                  │
│  Hypothesis: Users will upgrade for API access  │
│                                                  │
│     Build          Measure         Learn         │
│  ┌─────────┐    ┌──────────┐   ┌─────────┐    │
│  │ ███▄▄▄▄ │ →  │          │ → │         │    │
│  └─────────┘    └──────────┘   └─────────┘    │
│      60%            0%             0%            │
│                                                  │
│  📍 Building: Payment gateway integration        │
│                                                  │
│  Time: Day 3/5 | Budget: $1,200/$2,000         │
│  Status: ON TRACK ✅                             │
└──────────────────────────────────────────────────┘
```text

### Measure Phase

```text
┌─ Lean MVP: Payment Integration ──────────────────┐
│                                                  │
│  Hypothesis: Users will upgrade for API access  │
│                                                  │
│     Build          Measure         Learn         │
│  ┌─────────┐    ┌──────────┐   ┌─────────┐    │
│  │ ███████ │ →  │ ██▄▄▄▄▄▄ │ → │         │    │
│  └─────────┘    └──────────┘   └─────────┘    │
│     100%            35%            0%            │
│                                                  │
│  📍 Measuring: A/B test with 500 users          │
│                                                  │
│  Metrics:                                        │
│  • Conversion: 2.3% (target: 5%)               │
│  • Revenue: $450 (target: $1000)               │
│  • Time to convert: 3.5 days                    │
└──────────────────────────────────────────────────┘
```text

### Learn Phase

```text
┌─ Lean MVP: Payment Integration ──────────────────┐
│                                                  │
│  Hypothesis: ❌ INVALIDATED                      │
│                                                  │
│     Build          Measure         Learn         │
│  ┌─────────┐    ┌──────────┐   ┌─────────┐    │
│  │ ███████ │ →  │ █████████ │ → │ ███▄▄▄▄ │    │
│  └─────────┘    └──────────┘   └─────────┘    │
│     100%           100%            60%           │
│                                                  │
│  📍 Learning: Analyzing user feedback           │
│                                                  │
│  Key Insights:                                   │
│  • Price point too high for value               │
│  • Users want team features first               │
│  • API access not primary need                  │
│                                                  │
│  Next Pivot: Team collaboration features        │
└──────────────────────────────────────────────────┘
```text

## XP Iteration Examples

### Test-Driven Development

```text
┌─ XP Iteration 8: Authentication ─────────────────┐
│                                                  │
│  TDD Cycle      🔴 Red → 🟢 Green → ♻️ Refactor │
│                                                  │
│  Current Test: user*can*reset_password          │
│  Status: 🔴 RED - Writing failing test          │
│                                                  │
│  Test Progress:                                  │
│  ████████████████▄▄▄▄▄▄ 18/25 tests            │
│                                                  │
│  Coverage: 92% ↑ | Complexity: 3.2 ↓           │
│                                                  │
│  📍 Pair: @alice (Driver) & @bob (Navigator)    │
│  Session: 45 min | Rotations: 3                 │
└──────────────────────────────────────────────────┘
```text

### Daily Progress

```text
┌─ XP Iteration 8 ─────────────────────────────────┐
│                                                  │
│  Day 3 of 5 | Wednesday                         │
│                                                  │
│  Stories Progress:                               │
│  ✅ #101 Login functionality                     │
│  ✅ #102 Password reset                          │
│  ✅ #103 Session management                      │
│  ⚙️  #104 Two-factor auth (in progress)         │
│  ○  #105 Social login                           │
│  ○  #106 Remember me                            │
│                                                  │
│  Practices:            Today    Week            │
│  Pair Programming      ████     ████████        │
│  TDD                   ████     ███████         │
│  Refactoring          ██       █████           │
│  Integration          █████     ████████        │
│                                                  │
│  Velocity: On track for 5/6 stories             │
└──────────────────────────────────────────────────┘
```text

## Compact Mode Examples

### All Methodologies - One Line

```text
Shape Up  [S:✓|B:████░░░░|C:     ] Week 3/6 58%
Scrum     [Day 6/10] ██████░░░░ 23/40pts Sprint 15
Kanban    [B:12|R:5*|D:2|V:1|✓:47] CT:3.2d Normal
Lean MVP  [Build:75%→Measure:0%→Learn:0%] Day 3/5
XP Iter 8 [Stories:5/8|TDD:🟢|Pair:@alice] Day 3/5
```text

### Terminal Animation Examples

```text
# Building animation
Shape Up  [S:✓|B:████████▓▓▓▓|C:     ] Building...
Shape Up  [S:✓|B:████████████▓|C:     ] Building...
Shape Up  [S:✓|B:█████████████|C:     ] Complete!

# Kanban flow animation
Kanban    [B:12|R:5|D:2→|V:1|✓:47] Item moving...
Kanban    [B:12|R:5|D:1|V:2→|✓:47] Item moving...
Kanban    [B:12|R:5|D:1|V:1|✓:48✓] Item complete!

# Sprint daily progress
Scrum     [Day 5/10] █████░░░░░ ☀️ Morning standup
Scrum     [Day 5/10] █████▄░░░░ ⚡ Sprint active
Scrum     [Day 5/10] ██████░░░░ 🌙 Day complete
```text

## STATUS.md Embedded Examples

### Shape Up STATUS.md

```markdown
<!-- AICHAKU:PROGRESS:START -->

Methodology: Shape Up Phase: Building Progress: 58% Week: 3.5 of 6 Status:
on-track

Visual: [Shaping:✓][Building:████████░░░░][Cool-down: ] 📍 Building Phase - Week
3.5/6 - ON TRACK ✅

<!-- AICHAKU:PROGRESS:END -->
```text

### Scrum STATUS.md

```markdown
<!-- AICHAKU:PROGRESS:START -->

Methodology: Scrum Sprint: 15 Day: 6 of 10 Points: 23 of 40 Status: on-track

Visual: Sprint 15 [██████░░░░░░░░] Day 6/10 Burndown: ▂▃▄▅▆▇ (57% complete)
Velocity: 23/40 points - ON TRACK ✅

<!-- AICHAKU:PROGRESS:END -->
```text

### Kanban STATUS.md

```markdown
<!-- AICHAKU:PROGRESS:START -->

Methodology: Kanban WIP: 8 of 10 Cycle Time: 3.2 days Throughput: 12 items/week
Status: normal

Visual: [Backlog:12|Ready:5|Doing:2*|Review:1|Done:47] Flow: Normal | CT: 3.2d
(↓0.5) | TP: 12/wk (↑2)

<!-- AICHAKU:PROGRESS:END -->
```text
````
