# Aichaku Methodology System - Summary

## Overview

Aichaku provides a lightweight, intelligent methodology system for Claude Code that adapts to any development workflow through three simple modes instead of complex personas.

## Core Design: Three Modes

### 📋 Planning Mode
**Activates when**: Users need to decide what to build
**Does**: Creates plans using the appropriate methodology format
**Output**: Pitches, backlogs, or experiment definitions

### 🔨 Execution Mode  
**Activates when**: Users ready to build
**Does**: Guides development with methodology-specific constraints
**Output**: Working software within defined boundaries

### 📊 Improvement Mode
**Activates when**: Users want to review progress
**Does**: Measures performance and suggests improvements
**Output**: Metrics, insights, and actionable improvements

## Supported Methodologies

1. **Shape Up** - Fixed time, variable scope projects
2. **Scrum** - Sprint-based team development
3. **Kanban** - Continuous flow work
4. **XP** - Quality-focused engineering practices
5. **Lean** - Rapid experimentation and MVPs

## Key Features

### Natural Language First
- No commands required
- Describe what you need naturally
- Claude Code detects intent and context

### Intelligent Context Detection
- Team size (solo vs team)
- Timeline (urgent vs planned)
- Work type (features vs bugs)
- Automatically adjusts complexity

### Flexible Methodology Mixing
- Use Scrum for features + Kanban for bugs
- Add XP practices to any methodology
- Switch methodologies as needed

### Minimal Setup
- No configuration required
- Start working immediately
- Outputs organized automatically

## System Architecture

```
methodologies/
├── core/
│   ├── PLANNING-MODE.md     (Universal planning logic)
│   ├── EXECUTION-MODE.md    (Universal execution logic)
│   ├── IMPROVEMENT-MODE.md  (Universal improvement logic)
│   └── COMMANDS.md          (Optional shortcuts)
├── [methodology]/
│   ├── [METHODOLOGY]-SIMPLE.md  (50-line rule set)
│   └── templates/               (Ready-to-use templates)
└── README-SIMPLE.md            (User guide)
```

## Benefits

### For Users
- **Zero learning curve** - Just start talking
- **80% faster responses** - No persona loading
- **Natural workflow** - Focuses on doing, not process
- **Flexible** - Adapts to any team size or urgency

### For Development
- **81% less code** - From 8,000 to 1,500 lines
- **78% fewer files** - From 70+ to ~15 files
- **Maintainable** - Clear separation of concerns
- **Extensible** - Easy to add new methodologies

## Usage Examples

### Example 1: Feature Development
```
User: "I need to add user authentication"
Claude: Detects feature work → Suggests Shape Up → Creates pitch
```

### Example 2: Bug Management
```
User: "We're getting too many bugs"
Claude: Detects flow issue → Suggests Kanban → Sets up WIP-limited board
```

### Example 3: Quality Improvement
```
User: "Our tests are failing"
Claude: Detects quality issue → Suggests XP practices → Guides TDD adoption
```

## Philosophy

- **Modes over roles** - Focus on activities, not identities
- **Simple over complex** - Minimum viable process
- **Adaptive over prescriptive** - Fit the method to context
- **Natural over formal** - Conversation, not commands

## Getting Started

1. Install aichaku in your project
2. Start describing what you need
3. Claude Code handles the rest

No setup. No configuration. No learning curve.

Just natural, intelligent methodology support that adapts to how you work.

---

**Result**: A methodology system that's invisible when working well, helpful when needed, and never in the way.