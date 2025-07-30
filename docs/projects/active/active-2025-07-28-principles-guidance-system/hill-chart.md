# Hill Chart: Principles Guidance System

## Current Status: Beginning of Building Phase

```
                    FIGURING OUT                    |                    DONE
                          ▲                         |
    Problem Space         |         Solution Space  |    Shipping
         ↓                |              ↓          |        ↓
    ___________________ __|___ _____________________|_______________
   /                    \     /                     |               \
  /                      \   /                      |                \
 /                        \ /                       |                 \
/                          V                        |                  \
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLI Implementation          ●
Data Structure             ●
Principle Content         ●
Agent Integration        ●
Documentation           ●
Testing & Polish       ●
```

## Scopes and Their Position

### 1. CLI Implementation 🔴

**Position**: Starting - base of hill **Status**: Not started **Confidence**: High - similar to existing commands

Key unknowns resolved:

- Command structure matches existing patterns
- Interactive selection can use existing prompts library

Remaining work:

- Implement all subcommands
- Add proper error handling
- Create help documentation

### 2. Data Structure & Storage 🔴

**Position**: Starting - base of hill **Status**: Not started **Confidence**: High - clear requirements

Key unknowns resolved:

- YAML format defined in pitch
- Storage location determined
- Schema design complete

Remaining work:

- Create TypeScript interfaces
- Implement loader
- Add validation

### 3. Principle Content Creation 🟡

**Position**: Starting - base of hill **Status**: Not started **Confidence**: Medium - needs thoughtful writing

Key unknowns:

- Exact format for guidance examples
- Balance between prescriptive and flexible
- How much detail for each principle

Remaining work:

- Write all principle files
- Create consistent structure
- Add practical examples

### 4. Agent Integration 🟡

**Position**: Starting - base of hill **Status**: Not started **Confidence**: Medium - needs experimentation

Key unknowns:

- Best way to inject principle context
- How to make guidance non-intrusive
- Balancing multiple principles

Remaining work:

- Update orchestrator
- Modify specialist agents
- Test guidance quality

### 5. Documentation & Templates 🔴

**Position**: Starting - base of hill **Status**: Not started **Confidence**: High - straightforward

Key unknowns resolved:

- Documentation structure clear
- Template needs identified

Remaining work:

- Write all guides
- Update existing docs
- Create templates

### 6. Testing & Polish 🔴

**Position**: Starting - base of hill **Status**: Not started **Confidence**: High - standard process

Key unknowns resolved:

- Testing approach clear
- Performance requirements understood

Remaining work:

- Write comprehensive tests
- Performance optimization
- Final polish

## Progress Tracking

### Week 1 Target Positions

- CLI Implementation: Over the hill (●━━━━━)
- Data Structure: Over the hill (●━━━━━)
- Principle Content: Starting climb (━●━━━━)

### Week 2 Target Positions

- CLI Implementation: Descending (━━━●━━)
- Data Structure: Descending (━━━●━━)
- Principle Content: Near top (━━●━━━)

### Week 3 Target Positions

- CLI Implementation: Near done (━━━━●━)
- Data Structure: Near done (━━━━●━)
- Principle Content: Over the hill (━━━●━━)
- Agent Integration: Climbing (━●━━━━)

### Week 4 Target Positions

- CLI Implementation: Done (━━━━━●)
- Data Structure: Done (━━━━━●)
- Principle Content: Descending (━━━━●━)
- Agent Integration: Over the hill (━━━●━━)
- Documentation: Starting (●━━━━━)

### Week 5 Target Positions

- Principle Content: Done (━━━━━●)
- Agent Integration: Near done (━━━━●━)
- Documentation: Over the hill (━━━●━━)
- Testing & Polish: Climbing (━●━━━━)

### Week 6 Target Positions

- All scopes: Done (━━━━━●)

## Key Milestones

1. **End of Week 1**: Basic CLI working, can list and show principles
2. **End of Week 2**: Can select principles, first 5 principles documented
3. **End of Week 3**: Half of principles done, agent integration started
4. **End of Week 4**: All principles documented, agents principle-aware
5. **End of Week 5**: Full documentation, testing underway
6. **End of Week 6**: Ship ready, all tests passing

## Risks and Mitigations

### 🟡 Medium Risk: Principle Content Quality

- **Risk**: Principles might be too vague or too prescriptive
- **Mitigation**: Review each principle with test users early
- **Indicator**: Difficulty writing clear guidance

### 🟡 Medium Risk: Agent Integration Complexity

- **Risk**: Making agents principle-aware might be complex
- **Mitigation**: Start simple, iterate based on testing
- **Indicator**: Agents giving conflicting or confusing guidance

### 🟢 Low Risk: Technical Implementation

- **Risk**: CLI or data structure issues
- **Mitigation**: Following established patterns
- **Indicator**: Any deviation from existing command structure

## Notes

- This hill chart will be updated weekly during building phase
- Dots will move right as unknowns are resolved and work progresses
- Color coding: 🔴 High confidence, 🟡 Medium confidence, 🟢 Resolved
