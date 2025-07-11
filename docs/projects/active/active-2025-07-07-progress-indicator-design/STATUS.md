# Status: Progress Indicator Design

**Status**: ACTIVE - Design Phase  
**Started**: 2025-01-07
**Target**: Feature for v0.7.0

## Current Phase
📐 PLANNING MODE - Designing optimal progress indicators

## Progress
- [x] Research requirements and constraints
- [x] Design ASCII-first progress indicators
- [x] Create methodology-specific examples
- [x] Document implementation strategy
- [ ] Review with team
- [ ] Prototype core engine
- [ ] Implement renderers
- [ ] Integrate with CLI

## Key Decisions
1. **ASCII-first design** for Claude Code compatibility
2. **Per-methodology indicators** reflecting unique workflows
3. **STATUS.md integration** via comment markers
4. **Three display modes**: ascii, compact, minimal
5. **No external dependencies** maintaining security stance

## Design Highlights

### Shape Up Progress
- 6-week cycles with three phases
- Clear "You are here" indicator
- Appetite tracking

### Scrum Progress  
- Sprint burndown visualization
- Daily progress dots
- Velocity tracking

### Kanban Progress
- WIP limit indicators
- Flow metrics (cycle time, throughput)
- Bottleneck detection

### Lean MVP Progress
- Build-Measure-Learn cycle
- Hypothesis validation tracking
- Time/budget indicators

### XP Progress
- TDD cycle visualization (Red-Green-Refactor)
- Pair programming tracking
- Practice adoption metrics

## Next Steps
1. Get feedback on design approach
2. Prototype Shape Up renderer first
3. Build STATUS.md parser/injector
4. Create progress CLI command
5. Test in real projects

## Documents
- `progress-indicator-design.md` - Complete design specification
- `progress-examples.md` - Visual examples for all methodologies
- `implementation-guide.md` - Step-by-step implementation plan