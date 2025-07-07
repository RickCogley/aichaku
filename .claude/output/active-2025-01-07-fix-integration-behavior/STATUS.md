# Fix Aichaku Integration Behavior

## Project Status

**Started**: 2025-01-07
**Type**: Bug Fix / Enhancement
**Priority**: High

## Problem Statement

Aichaku 0.5.0 isn't working as expected because Claude Code doesn't automatically follow the methodology patterns. Users report:
- Keywords like "shape up" have no effect
- Documents created in wrong locations (project root, .claude/user)
- Too much manual effort required
- Integration feels passive, not magical

## Root Cause Analysis

1. **CLAUDE.md integration is informational, not directive**
   - Says "this project uses Aichaku" 
   - Doesn't tell Claude Code what to DO

2. **No pre-created structure to guide behavior**
   - Output directory doesn't exist
   - No clear path for document creation

3. **Instructions buried in methodology files**
   - Critical directives hidden deep in docs
   - Claude Code doesn't know to read them

4. **No behavioral reinforcement**
   - Single mention in CLAUDE.md
   - No reminders or triggers

## Solution Approach

### Phase 1: Make CLAUDE.md Directive
- Rewrite integration to use imperative commands
- Add explicit "YOU MUST" behaviors
- Include concrete examples

### Phase 2: Pre-create Structure
- Create .claude/output/ during init
- Add README explaining conventions
- Create example structure

### Phase 3: Add Behavioral Hooks
- Multiple touchpoints for reinforcement
- Context-aware triggers
- Clear error recovery paths

## Tasks

- [x] Analyze current integration approach
- [x] Identify why it's not working
- [x] Design directive CLAUDE.md content
- [x] Create comprehensive solution design
- [x] Design behavioral hook system
- [x] Create implementation examples
- [ ] Implement structure pre-creation
- [ ] Add behavioral reinforcement
- [ ] Test with fresh install

## Design Documents Created

- MAGICAL-INTEGRATION-DESIGN.md - Complete solution architecture
- CLAUDE-MD-REWRITE.md - New imperative integration section
- IMPLEMENTATION-EXAMPLES.md - Code examples for all components
- EXECUTIVE-SUMMARY.md - Action plan and success metrics

## Success Criteria

- Users say "shape this" and documents appear in correct location
- No manual directory creation needed
- Feels magical and automatic

## Updates

### 2025-01-07T08:30:00Z
- Completed comprehensive solution design
- Created imperative CLAUDE.md rewrite with "YOU MUST" language
- Designed 5-layer behavioral modification system
- Provided concrete implementation examples
- Ready for implementation phase