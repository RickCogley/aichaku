# Shape: Help System Final Improvements

## Problem

1. Branding is missing from lean, xp, and scrumban help pages
2. No visual diagrams to make methodologies clearer
3. Potential confusion between `aichaku help` and `aichaku --help`

## Appetite

Small batch - 1 hour

## Solution

### 1. Complete Branding

Add the Aichaku header to all methodology help pages:

```
🎯 Methodology Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support
```

### 2. Add ASCII Diagrams

Simple, clear diagrams for each methodology:

**Shape Up Cycle:**

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Shaping   │→ │   Betting   │→ │   Building  │
│  (ongoing)  │  │  (1 week)   │  │  (6 weeks)  │
└─────────────┘  └─────────────┘  └─────────────┘
                                   ↓
┌─────────────┐                   ┌─────────────┐
│  Cool-down  │←──────────────────│   Ship It!  │
│  (2 weeks)  │                   │             │
└─────────────┘                   └─────────────┘
```

**Scrum Flow:**

```
Product Backlog → Sprint Planning → Sprint Backlog
       ↑                                  ↓
   Retrospective ← Review ← Daily Scrum ← Development
```

**Kanban Board:**

```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ Backlog │  To Do  │  Doing  │ Testing │  Done   │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ Story A │ Story C │ Story E │ Story G │ Story I │
│ Story B │ Story D │  [WIP:2]│ Story H │ Story J │
│   ...   │  [WIP:3]│ Story F │  [WIP:1]│   ...   │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 3. Clarify Help vs --help

In the default `aichaku help` output:

```
💡 Looking for CLI commands?
   Run 'aichaku --help' to see all available commands and options

   This help focuses on methodology guidance.
```

## Rabbit Holes

- Don't make diagrams too complex
- Keep ASCII art simple and readable
- Don't duplicate full CLI help

## No-gos

- No Unicode box drawing (compatibility issues)
- No colored output (terminal compatibility)
- No interactive diagrams
