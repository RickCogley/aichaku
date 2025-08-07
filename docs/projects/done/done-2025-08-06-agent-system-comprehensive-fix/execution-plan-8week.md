# Execution Plan: Agent System Build (8 Weeks)

## Hill Chart Progress

```
[Figuring things out] ──────────▲────────── [Getting it done]
                          ↑
                    We are here
```

## Weeks 1-2: Foundation & Type System

### Week 1: TypeScript Architecture

- [ ] Create `src/types/agent.ts` with comprehensive type definitions
- [ ] Design and implement BaseCommand pattern
- [ ] Create agent interface hierarchy
- [ ] Set up error types and validation types
- [ ] Document type system architecture

### Week 2: Path Discovery & Loading Infrastructure

- [ ] Integrate `dynamic-content-discovery.ts` with agent system
- [ ] Create fallback path resolution strategy
- [ ] Build YAML frontmatter parser with validation
- [ ] Implement security: YAML schema validation
- [ ] Test path discovery across installation types

## Weeks 3-4: Core Implementation

### Week 3: Agent Loader Development

- [ ] Build `AgentLoader` class from scratch
- [ ] Implement ID normalization (all with `aichaku-` prefix)
- [ ] Create agent discovery mechanism
- [ ] Add agent validation and sanitization
- [ ] Implement secure file reading with permissions

### Week 4: Command System

- [ ] Create `AgentsCommand` using BaseCommand pattern
- [ ] Implement all command operations (list, add, remove, show)
- [ ] Add fuzzy search with Fuse.js
- [ ] Build `AgentFormatter` for clean output
- [ ] Add user feedback for all operations

## Weeks 5-6: Integration & User Experience

### Week 5: Init/Upgrade Integration

- [ ] **Add explicit feedback during init**: "Installing default agents..."
- [ ] **Add explicit feedback during upgrade**: "Updating agents..."
- [ ] Show which agents are being installed/updated
- [ ] Integrate agent installation into init workflow
- [ ] Update upgrade command to handle agents

### Week 6: Integrate Command Fix

- [ ] Fix `aichaku integrate` to copy agent files to `.claude/agents/`
- [ ] Update CLAUDE.md generation to include agent content
- [ ] Add validation for successful integration
- [ ] Implement rollback on failure
- [ ] Test cross-repository integration

## Weeks 7-8: Security, Testing & Polish

### Week 7: Security Hardening

- [ ] Implement agent ID validation (`/^aichaku-[a-z0-9-]+$/`)
- [ ] Add YAML schema validation before parsing
- [ ] Set restrictive file permissions (0o600)
- [ ] Add audit logging for agent operations
- [ ] Implement rate limiting for operations

### Week 8: Testing & Documentation

- [ ] Write comprehensive unit tests
- [ ] Create integration test suite
- [ ] Test migration from broken installations
- [ ] Update all documentation
- [ ] Create troubleshooting guide
- [ ] Final QC and release preparation

## Key Deliverables by Phase

### Phase 1 (Weeks 1-2): Foundation

- ✅ Complete TypeScript type system
- ✅ Path discovery integrated
- ✅ Security validation framework

### Phase 2 (Weeks 3-4): Core Features

- ✅ Agent loader fully functional
- ✅ All commands working
- ✅ Clean formatted output

### Phase 3 (Weeks 5-6): Integration

- ✅ Init/upgrade show agent feedback
- ✅ Integration copies files correctly
- ✅ Cross-repository support

### Phase 4 (Weeks 7-8): Production Ready

- ✅ Security hardened
- ✅ Fully tested
- ✅ Documentation complete

## User Feedback Requirements

### Init Command

```
🪴 Aichaku: Installing in ~/.claude/aichaku
Installing default agents:
  ✓ aichaku-orchestrator - General workflow coordinator
  ✓ aichaku-documenter - Documentation specialist  
  ✓ aichaku-security-reviewer - Security compliance
✅ Installation complete with 3 default agents
```

### Upgrade Command

```
🪴 Aichaku: Upgrading from v0.44.1 to v0.45.0
Updating agents:
  ✓ aichaku-orchestrator (v1.0 → v1.1)
  ✓ aichaku-documenter (unchanged)
  ✓ aichaku-security-reviewer (new)
✅ Upgrade complete with 3 default agents
```

### Integrate Command

```
🪴 Aichaku: Integrating with CLAUDE.md
Copying agents to .claude/agents/:
  ✓ aichaku-orchestrator
  ✓ aichaku-documenter
  ✓ aichaku-deno-expert (optional)
✅ Integration complete with 3 agents
```

## Risk Mitigation

### High Risk Areas

1. **Building from scratch**: No existing implementation to reference
   - Mitigation: Start with minimal viable implementation
   - Fallback: Phased release (basic → advanced features)

2. **Security vulnerabilities**: YAML injection, path traversal
   - Mitigation: Security review at each phase
   - Fallback: Disable agent system if vulnerability found

3. **Breaking existing installations**: Migration failures
   - Mitigation: Comprehensive migration testing
   - Fallback: Manual migration script

## Definition of Done

- [ ] All agents use `aichaku-` namespace prefix
- [ ] User feedback shows during init/upgrade/integrate
- [ ] Commands work with fuzzy matching
- [ ] Output is clean and deduplicated
- [ ] Integration copies files to `.claude/agents/`
- [ ] Security validation implemented
- [ ] File permissions restrictive (0o600)
- [ ] All tests passing (unit + integration)
- [ ] Documentation explains namespacing
- [ ] Migration from broken state tested

## Notes

This is **new development**, not a fix. The agent system must be built from scratch with proper:

- TypeScript type safety
- Security hardening
- User feedback
- Cross-repository support
- Comprehensive testing
