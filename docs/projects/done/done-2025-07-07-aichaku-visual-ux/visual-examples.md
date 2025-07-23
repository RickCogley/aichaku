# Visual Examples for Aichaku UX

## 1. Visual Identity Examples

### Basic Usage

````text
🪴 Aichaku: Welcome! I see you want to plan a new feature.
🪴 Aichaku: Creating project: payment-integration-redesign
🪴 Aichaku: Documents created in .claude/output/active-2025-07-07-payment-integration-redesign/
```text

### With Status Indicators

```text
🪴 Aichaku: ✅ Project initialized successfully
🪴 Aichaku: ⚠️ Existing project detected. Use --force to override
🪴 Aichaku: ❌ Error: Global installation required first
🪴 Aichaku: ℹ️ Tip: Use 'aichaku status' to see all projects
```text

## 2. Progress Indicator Examples

### Shape Up Cycle

```text
Shape Up - User Auth Redesign
[Shaping] → [**Betting**] → [Building] → [Cool-down]
              ▲
Progress: ████████░░░░░░░░░░░░░░░░ Week 2/6
Status: Betting Phase 🌿

Compact: [S:✓][**Bet**][Bld:░][CD:░] Week 2/6
Minimal: ████░░░░░░░░░░░░ 33%
```text

### Scrum Sprint

```text
Sprint 15 - Payment Gateway
Day 6/10 ████████░░░░░░ 60% - 24/40 points complete
✅ Planning | 🔄 Daily x6 | ⏳ Review (Day 9) | ⏳ Retro (Day 10)
Status: ON TRACK 🌿

Compact: Sprint 15 [Day 6/10] ██████░░░░ 60%
Minimal: S15:D6 ██████░░░░
```text

### Kanban Flow

```text
Kanban Board - Infrastructure Team
[Backlog] → [Ready] → [**Doing**] → [Review] → [Done]
                          ▲
┌─────────┬────────┬────────┬────────┬──────┐
│   12    │   5*   │   2    │   1    │  47  │
└─────────┴────────┴────────┴────────┴──────┘

* WIP limit warning - Cycle time: 3.2 days

Compact: [B:12|R:5*|**D:2**|R:1|✓:47] CT:3.2d
Minimal: →12→5*→**2**→1→47✓
```text

### Lean MVP

```text
MVP Cycle 1 - Mobile App Prototype
[**Build**] → [Measure] → [Learn]
     ▲
Progress: ████████░░░░ 75% complete
Timeline: Day 3/5 🌿

Compact: [**B:75%**]→[M:0%]→[L:0%] D3/5
Minimal: **B:75%** M:0% L:0%
```text

### XP Iteration

```text
XP Week 3 - API Refactoring
[Stories:████████░░░░][Tests:████████████][Integration:████░░░░░░░░]
│ 5/8 complete      │ TDD: 🟢 Pass    │ CI: 🟡 Running  │
│ Pair: @alice      │ Coverage: 87%   │ Build: #142     │

Compact: [S:5/8|T:🟢|P:@alice] W3D3
Minimal: 5/8✓ TDD:✅ CI:🔄
```text

## 3. Startup Reminder Examples

### First Contact

```text
╭─────────────────────────────────────────────────╮
│ 🪴 Aichaku v0.6.0 - Methodology Support Active  │
├─────────────────────────────────────────────────┤
│ Ready to help with:                             │
│ • Shape Up (say "shape")                        │
│ • Scrum (say "sprint")                          │
│ • Kanban (say "kanban board")                   │
│ • Lean (say "MVP")                              │
│                                                 │
│ 📁 Documents: .claude/output/                   │
╰─────────────────────────────────────────────────╯
```text

### With Active Projects

```text
🪴 Aichaku Status - 3 active projects:

  • payment-gateway (Sprint 15, Day 6/10) 🌿
  • auth-redesign (Shaping, Day 2/2) 🌱 ⚠️
  • mobile-mvp (Building, 75%) 🌳
💡 Say "continue auth-redesign" or "show all projects"
```text

### Contextual Tips

```text
🪴 Aichaku: You mentioned "sprint planning"
   Ready to create Scrum documents when you are.
   Just say "create project" when ready!
```text

### Minimal Reminder

```text
🪴 Aichaku ready (3 active) - "help" for more
```text

## 4. Combined Example: Full Project Lifecycle

### 1. Initial Discussion

```text
User: I want to redesign our payment flow
🪴 Aichaku: I see you want to redesign the payment flow. Let's explore this...
```text

### 2. Ready Signal

```text
User: Let's create a project for this
🪴 Aichaku: Creating project: payment-flow-redesign
           Using Shape Up methodology based on our discussion
```text

### 3. During Work

```text
🪴 Aichaku: Project Status Update
[Shaping] → [**Betting**] → [Building] → [Cool-down]
               ▲
Progress: ████████████░░░░░░░░░░░░ Week 2/6
Status: Betting Phase 🌿 - ON TRACK ✅
```text

### 4. Completion

```text
🪴 Aichaku: Project Complete!
           Moving payment-flow-redesign to done-2025-07-21/
           Total time: 14 days | Methodology: Shape Up
```text

## 5. Error States with Visual Identity

```text
🪴 Aichaku: ❌ Cannot create project
           Reason: No global installation found
           Fix: Run 'aichaku init --global' first

🪴 Aichaku: ⚠️ Project name unclear
           Detected topics: auth, payment, user
           Please specify: "create auth-payment project"

🪴 Aichaku: 🔄 Switching methodology
           From: Scrum → To: Shape Up
           Reason: "6-week cycle" keyword detected
```text

## 6. Dashboard View

```text
🪴 Aichaku Dashboard - 2025-07-07
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active Projects (3):

1. payment-gateway     [Sprint 6/10] ██████░░░░ 60% 🌿

2. auth-redesign       [Shaping 2/2] ████████ 100% 🌱 ⚠️

3. mobile-mvp          [Build 75%]   ███████░░░ 75% 🌳

Completed Today (1):

  ✓ database-migration [Duration: 5 days]

💡 Next: Complete auth-redesign shaping phase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```text
````
