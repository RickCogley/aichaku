# Migration Guide: From Complex to Simple

## What's Changing

### OLD: Complex Persona System

- 12+ persona files
- Role-playing approach
- Verbose documentation
- Confusing overlaps

### NEW: Three Simple Modes

- Planning Mode
- Execution Mode
- Improvement Mode
- Natural language activation

## File Structure Changes

### Before

```
methodologies/
├── shape-up/
│   ├── personas/
│   │   ├── shaper.md (200+ lines)
│   │   ├── bettor.md (150+ lines)
│   │   ├── builder.md (175+ lines)
│   │   └── ai-executor.md (225+ lines)
│   ├── methods/
│   │   ├── shapeup.md
│   │   └── shapeup-ai.md (redundant)
│   └── templates/ (unchanged)
├── scrum/
│   ├── personas/ (4 files, 600+ lines)
│   └── ...
└── [repeat for each methodology]
```

### After

```
methodologies/
├── core/
│   ├── PLANNING-MODE.md (Handles all planning)
│   ├── EXECUTION-MODE.md (Handles all building)
│   └── IMPROVEMENT-MODE.md (Handles all reviewing)
├── shape-up/
│   ├── SHAPE-UP-SIMPLE.md (50 lines of rules)
│   └── templates/ (unchanged)
├── scrum/
│   ├── SCRUM-SIMPLE.md (50 lines of rules)
│   └── templates/ (unchanged)
└── README-SIMPLE.md (User-friendly guide)
```

## Behavioral Changes

### Planning Example

**OLD**:

```
User: "Let's shape a new feature"
Claude: *Loads Shaper persona*
"You are now a Shaper following the Shape Up methodology. 
Shaping is a closed-door, creative process where..."
[Lengthy explanation before getting to work]
```

**NEW**:

```
User: "Let's shape a new feature"
Claude: [Planning Mode + Shape Up rules]
"Feature shaping checklist:
□ Problem defined? 
□ Appetite (2 or 6 weeks)?
□ Solution roughed out?
Let's start: What problem are we solving?"
```

### Execution Example

**OLD**:

```
User: "Start building"
Claude: *Loads Builder/Developer/AI Executor persona*
*Reads through role description*
*Applies methodology-specific rules*
```

**NEW**:

```
User: "Start building"  
Claude: [Execution Mode + detected methodology]
"Starting build with [methodology] constraints:
- [Specific constraints]
First task: [Immediate action]"
```

## How Modes Replace Personas

| Old Personas                                  | New Mode         | Key Difference                        |
| --------------------------------------------- | ---------------- | ------------------------------------- |
| Shaper, Product Owner, Lean Entrepreneur      | Planning Mode    | One mode, different rules             |
| Developer, Builder, Team Member, XP Developer | Execution Mode   | Focus on constraints, not identity    |
| Scrum Master, Flow Manager, Facilitator       | Improvement Mode | Measure and improve, don't facilitate |

## Advantages for Users

1. **Faster Response**: No persona loading
2. **Natural Language**: Just describe what you need
3. **Less Confusion**: Three modes vs twelve personas
4. **Easy Mixing**: Combine methodologies naturally
5. **Context Aware**: Adapts to team size and urgency

## Implementation Timeline

### Phase 1: Parallel Systems

- Keep old system working
- New system in `/core` and `-SIMPLE.md` files
- Test with users

### Phase 2: Default to Simple

- Make simple system primary
- Old system still accessible
- Update documentation

### Phase 3: Archive Complex

- Move old files to `/archive`
- Simple system only
- Clean, maintainable

## For Library Users

### If you liked personas

The modes still guide Claude's behavior, just without the role-playing overhead.

### If personas confused you

The new system responds to what you want to do, not what role Claude should
play.

### If you mix methodologies

The new system makes this natural - modes adapt to any methodology.

## Quick Test

Try these commands with both systems:

1. "I need to plan a new feature"
2. "Let's start building"
3. "How are we doing?"

Notice how the simple system:

- Responds faster
- Asks better questions
- Provides clearer next steps
- Avoids lengthy explanations

## Remember

The goal is to make Claude Code's methodology support invisible but effective.
Users should focus on their work, not on managing Claude's personas.
