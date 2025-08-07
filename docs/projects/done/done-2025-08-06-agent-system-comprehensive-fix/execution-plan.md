# Execution Plan: Agent System Comprehensive Fix

## Hill Chart Progress

```
[Figuring things out] ──────────▲────────── [Getting it done]
                          ↑
                    We are here
```

## 8-Week Implementation Plan

### Weeks 1-2: Foundation & Architecture

### Day 1-2: Agent Template Discovery

- [ ] Map actual agent template locations in codebase
- [ ] Document current vs expected directory structure
- [ ] Create path resolution strategy with fallbacks
- [ ] Test path discovery across different installation types
- [ ] **Verify current init/upgrade feedback shows default agent installation**
  - [ ] Run `aichaku init --global` and check output
  - [ ] Run `aichaku upgrade --global` and check output
  - [ ] Ensure users see "Installing default agents..." message

### Day 3-4: ID Generation Fix

- [ ] Implement YAML frontmatter parsing for agent IDs
- [ ] Apply namespacing strategy:
  - Default agents: Keep `aichaku-` prefix (e.g., `aichaku-orchestrator`)
  - Optional agents: Simple kebab-case (e.g., `deno-expert`)
- [ ] Create ID normalization for migration (e.g., "Aichaku Deno Expert" → "deno-expert")
- [ ] Add backwards compatibility mapping for old ID formats

### Day 5: Agent Categorization

- [ ] Implement default vs optional agent detection
- [ ] Add category metadata to agent structure
- [ ] Create agent manifest file format
- [ ] Test loading with new categorization

## Week 2: Fix Commands & Display

### Day 1-2: Command Refactoring

- [ ] Fix `agents --list` to show categorized output
- [ ] Fix `agents --add` to accept simple IDs
- [ ] Fix `agents --remove` to prevent default removal
- [ ] Fix `agents --show` to display clean current state

### Day 3-4: Search & Formatting

- [ ] Implement fuzzy search for agent names
- [ ] Add deduplication logic for search results
- [ ] Create clean, structured formatter output
- [ ] Remove redundant name/description displays

### Day 5: Error Handling

- [ ] Add validation for all agent operations
- [ ] Implement helpful error messages
- [ ] Add recovery suggestions for common issues
- [ ] Test edge cases and error scenarios

## Week 3: Fix Integration System

### Day 1-2: File Operations

- [ ] Fix agent file copying during `integrate`
- [ ] Add transaction-like operations with rollback
- [ ] Implement file validation before/after copy
- [ ] Add progress indicators for operations

### Day 3-4: Configuration Management

- [ ] Update aichaku.json agent structure
- [ ] Implement agent manifest tracking
- [ ] Add configuration migration logic
- [ ] Test configuration updates

### Day 5: Integration Testing

- [ ] Test fresh installation flow
- [ ] Test upgrade from broken state
- [ ] Test agent add/remove cycles
- [ ] Verify CLAUDE.md generation

## Week 4: Testing & Polish

### Day 1-2: Comprehensive Testing

- [ ] Unit tests for all agent operations
- [ ] Integration tests for full workflows
- [ ] Test migration from current broken state
- [ ] Performance testing for large agent sets

### Day 3-4: Documentation

- [ ] Update command help text
- [ ] Create migration guide
- [ ] Document new agent ID standards
- [ ] Add troubleshooting guide

### Day 5: Release Preparation

- [ ] Final testing on clean system
- [ ] Prepare release notes
- [ ] Create rollback plan
- [ ] Deploy and monitor

## Key Deliverables by Week

### Week 1 Deliverables

- ✅ Agent templates loading correctly
- ✅ Proper ID generation working
- ✅ Agents categorized as default/optional

### Week 2 Deliverables

- ✅ All commands working with simple IDs
- ✅ Clean, readable output
- ✅ Effective search functionality

### Week 3 Deliverables

- ✅ Integration copies files correctly
- ✅ Configuration properly tracked
- ✅ Smooth upgrade path

### Week 4 Deliverables

- ✅ All tests passing
- ✅ Documentation complete
- ✅ Ready for release

## Risk Mitigation

### High Risk Areas

1. **Breaking existing installations**
   - Mitigation: Extensive backward compatibility testing
   - Fallback: Provide manual migration script

2. **Path resolution failures**
   - Mitigation: Multiple fallback paths
   - Fallback: Clear error messages with manual fix instructions

3. **Configuration corruption**
   - Mitigation: Backup before changes
   - Fallback: Configuration recovery command

## Definition of Done

- [ ] Agent IDs follow namespacing strategy:
  - [ ] Default agents use `aichaku-` prefix
  - [ ] Optional agents use simple kebab-case
- [ ] Commands work with simple names (e.g., `--add deno`)
- [ ] Output is clean and categorized
- [ ] Search returns useful, deduplicated results
- [ ] Integration copies agent files to `.claude/agents/`
- [ ] No manual file operations required
- [ ] Existing installations continue working
- [ ] All tests passing
- [ ] Documentation explains namespacing

## Notes

This plan fixes the fundamental issues identified:

1. Wrong IDs (Week 1)
2. Messy output (Week 2)
3. Integration failure (Week 3)
4. Poor UX (Week 2 & 4)

The phased approach ensures we can validate each fix before moving forward, reducing risk of cascading failures.
