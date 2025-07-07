# Visual Examples for Aichaku UX

## 1. Visual Identity Examples

### Basic Usage
```
🪴 Aichaku: Welcome! I see you want to cultivate a new feature.
🪴 Aichaku: Planting project: payment-integration-redesign
🪴 Aichaku: Your project is growing in .claude/output/active-2025-07-07-payment-integration-redesign/
```

### With Status Indicators
```
🪴 Aichaku: ✅ Project planted successfully
🪴 Aichaku: ⚠️ This soil already has a project. Use --force to replant
🪴 Aichaku: ❌ Error: Need global garden first (run init --global)
🪴 Aichaku: ℹ️ Tip: Use 'aichaku status' to see your garden
```

## 2. Progress Indicator Examples

### Shape Up Cycle
```
Shape Up - User Auth Redesign
[Shaping:████████][Betting:░░░░░░░░][Building:░░░░░░░░][Cool-down:░░░░░░░░]
📍 Shaping Phase - Day 2/2 - COMPLETE ✅

Compact: [S:✓][Bet:░][Bld:░][CD:░] Day 2/14
Minimal: ████░░░░░░░░░░░░ 14%
```

### Scrum Sprint
```
Sprint 15 - Payment Gateway
[Planning:✓][Execution:████████░░░░░░░░][Review:░░][Retro:░░]
📍 Day 6/10 - ON TRACK ✅ - 24/40 points complete

Compact: Sprint 15 [Day 6/10] ██████░░░░ 60%
Minimal: S15:D6 ██████░░░░
```

### Kanban Flow
```
Kanban Board - Infrastructure Team
┌─────────┬────────┬────────┬────────┬──────┐
│Backlog  │Ready   │Doing   │Review  │Done  │
├─────────┼────────┼────────┼────────┼──────┤
│   12    │   5*   │   2    │   1    │  47  │
└─────────┴────────┴────────┴────────┴──────┘
* WIP limit warning - Flow: 3.2 days average

Compact: [B:12|R:5*|D:2|R:1|✓:47] CT:3.2d
Minimal: →12→5*→2→1→47✓
```

### Lean MVP
```
MVP Cycle 1 - Mobile App Prototype
┌─────────────┬──────────────┬─────────────┐
│   BUILD     │   MEASURE    │   LEARN     │
│ ████████    │ ░░░░░░░░     │ ░░░░░░░░    │
│   75%       │   0%         │   0%        │
└─────────────┴──────────────┴─────────────┘
📍 Building Phase - Day 3/5 - ON TRACK ✅

Compact: [Build:75%→Measure:0%→Learn:0%] Day 3/5
Minimal: B:75% M:0% L:0%
```

### XP Iteration
```
XP Week 3 - API Refactoring
[Stories:████████░░░░][Tests:████████████][Integration:████░░░░░░░░]
│ 5/8 complete      │ TDD: 🟢 Pass    │ CI: 🟡 Running  │
│ Pair: @alice      │ Coverage: 87%   │ Build: #142     │

Compact: [S:5/8|T:🟢|P:@alice] W3D3
Minimal: 5/8✓ TDD:✅ CI:🔄
```

## 3. Startup Reminder Examples

### First Contact
```
╭─────────────────────────────────────────────────╮
│ 🪴 Aichaku v0.6.0 - Growing Your Methodologies  │
├─────────────────────────────────────────────────┤
│ Ready to nurture:                               │
│ • Shape Up (say "shape")                        │
│ • Scrum (say "sprint")                          │
│ • Kanban (say "kanban board")                   │
│ • Lean (say "MVP")                              │
│                                                 │
│ 🌱 Your garden: .claude/output/                 │
╰─────────────────────────────────────────────────╯
```

### With Active Projects
```
🪴 Aichaku Garden - 3 projects growing:
  • payment-gateway (🌿 Sprint 15, Day 6/10)
  • auth-redesign (🌱 Shaping, Day 2/2) ⚠️ 
  • mobile-mvp (🌳 Building, 75%)
💡 Say "tend auth-redesign" or "show garden"
```

### Contextual Tips
```
🪴 Aichaku: You mentioned "sprint planning"
   Ready to plant Scrum documents when you are.
   Just say "create project" to start growing!
```

### Minimal Reminder
```
🪴 Aichaku ready (3 growing) - "help" to learn more
```

## 4. Combined Example: Full Project Lifecycle

### 1. Initial Discussion
```
User: I want to redesign our payment flow
🪴 Aichaku: I see you want to redesign the payment flow. Let's nurture this idea...
```

### 2. Ready Signal
```
User: Let's create a project for this
🪴 Aichaku: Planting project: payment-flow-redesign
           Growing with Shape Up methodology based on our discussion
```

### 3. During Work
```
🪴 Aichaku: Project Growth Update
[🌱 Shaping:████████][🌿 Betting:████░░░░][🌳 Building:░░░░░░░░][🍃 Cool-down:░░░░░░░░]
📍 🌿 Betting Phase - Day 3/14 - HEALTHY GROWTH ✅
```

### 4. Completion
```
🪴 Aichaku: Project Harvest Complete! 
           Transplanting payment-flow-redesign to done-2025-07-21/
           Growth time: 14 days | Methodology: Shape Up
```

## 5. Error States with Visual Identity

```
🪴 Aichaku: ❌ Cannot plant project
           Reason: No garden established
           Fix: Run 'aichaku init --global' first

🪴 Aichaku: ⚠️ Project seeds unclear
           Detected topics: auth, payment, user
           Please specify: "plant auth-payment project"

🪴 Aichaku: 🔄 Changing growth method
           From: Scrum → To: Shape Up
           Reason: "6-week cycle" detected
```

## 6. Dashboard View

```
🪴 Aichaku Garden - 2025-07-07
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Growing Projects (3):
  
1. payment-gateway     🌿 [Sprint 6/10] ██████░░░░ 60%
2. auth-redesign       🌱 [Shaping 2/2] ████████ 100% ⚠️
3. mobile-mvp          🌳 [Build 75%]   ███████░░░ 75%

Harvested Today (1):
  🍃 database-migration [Grew for: 5 days]

💡 Next: auth-redesign ready for next phase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```