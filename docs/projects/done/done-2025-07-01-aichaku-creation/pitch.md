# Aichaku Methodology System - Pitch

**Date**: 2025-01-04\
**Shaper**: Rick Cogley with Claude Code

## 1. Problem

**The Problem**: Claude Code users struggle with complex methodology
documentation. Current systems require learning dozens of personas, commands,
and concepts before getting value. Teams waste time figuring out which
methodology to use and how to apply it correctly.

**When it happens**:

- Starting new projects
- Switching between different work types (features vs bugs)
- Trying to adopt agile practices
- Working with Claude Code for the first time

**Who it affects**: All Claude Code users, especially:

- Solo developers who need lightweight process
- Teams wanting to adopt agile practices
- Organizations using multiple methodologies

**Current workaround**: Users either:

- Skip methodologies entirely (chaos)
- Force-fit one methodology for everything (inefficient)
- Create their own ad-hoc processes (inconsistent)

**Why now**: Claude Code adoption is growing rapidly. Users need intuitive
methodology support that enhances rather than hinders their workflow.

## 2. Appetite

⏱️ **Big Batch** (6 weeks)

This is a 6-week project because:

- Requires fundamental rethinking of how methodologies work
- Needs careful design to be truly simple
- Must support 5+ different methodologies
- Includes documentation and examples

## 3. Solution

### Approach

Replace complex persona-based system with three simple modes that adapt to any
methodology:

```
User Intent → Mode Detection → Methodology Rules → Action
```

### Elements

**Three Universal Modes**:

1. **Planning Mode** - What to build
2. **Execution Mode** - Build it
3. **Improvement Mode** - Get better

**Smart Detection**:

- Natural language triggers
- Context awareness (team size, urgency)
- Automatic methodology selection
- Seamless mixing

**Simplified Structure**:

```
methodologies/
├── core/           (3 mode files)
├── [method]/       (1 simple rules file + templates)
└── README.md       (User guide)
```

### Key Flows

1. **New User Flow**:
   - User describes need → System detects context → Suggests approach →
     Immediate value

2. **Methodology Switching**:
   - Natural language request → Mode continues → Rules change → No confusion

3. **Mixed Usage**:
   - Different work types → Different rules → Same modes → Consistent experience

## 4. Rabbit Holes

### ⚠️ Over-Engineering

**Risk**: Making modes too complex **Patch**: Keep each mode under 200 lines,
focus on actions not theory

### ⚠️ Backward Compatibility

**Risk**: Breaking existing Shape Up installations **Patch**: Archive old
system, clear migration path

### ⚠️ Natural Language Parsing

**Risk**: Complex NLP for trigger detection **Patch**: Simple keyword matching
is sufficient

### ⚠️ Feature Creep

**Risk**: Adding "nice to have" features **Patch**: Strict focus on core value -
making methodologies invisible

## 5. No-gos

We are **NOT**:

- ❌ Building a complex configuration system
- ❌ Supporting custom methodologies (yet)
- ❌ Creating a UI or web interface
- ❌ Implementing analytics or tracking
- ❌ Making it work outside Claude Code

These are out of scope because:

- Configuration adds complexity without value
- Custom methodologies can come later
- CLI/conversation interface is sufficient
- Privacy is important to users
- Focus is Claude Code integration

---

## Success Criteria

- Users can start working in <1 minute
- 80% reduction in documentation size
- Natural language "just works"
- Methodologies feel invisible
- Easy to mix approaches
