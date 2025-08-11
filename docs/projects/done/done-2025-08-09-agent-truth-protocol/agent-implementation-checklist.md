# Agent Truth Protocol Implementation Checklist

## Overview

All agents must be updated to implement the Truth Protocol. This checklist tracks implementation status for each agent.

## Implementation Requirements

Each agent needs:

1. ✅ Extend TruthfulAgent base class (once created)
2. ✅ Verify all file operations before claiming success
3. ✅ Use guided testing for behavioral verification
4. ✅ Update response patterns to use verification language
5. ✅ Add verification logging/metrics

## Agent Implementation Status

### Core Agents (Priority 1 - File Operations Heavy)

- [ ] **aichaku-documenter** - Creates many documentation files
  - Creates docs in various formats
  - Needs: File creation verification, content validation
  - Risk: HIGH - Primary file creator

- [ ] **aichaku-orchestrator** - Coordinates other agents
  - Routes work to specialists
  - Needs: Response validation, claim verification
  - Risk: CRITICAL - Can propagate lies from sub-agents

- [ ] **aichaku-code-explorer** - Analyzes codebase
  - Reads and reports on files
  - Needs: Existence verification for reported files
  - Risk: MEDIUM - Makes claims about file contents

- [ ] **aichaku-test-expert** - Creates and manages tests
  - Creates test files, modifies existing tests
  - Needs: File operations verification, test result validation
  - Risk: HIGH - Creates test files

### Language/Framework Experts (Priority 2 - Moderate File Operations)

- [ ] **aichaku-TypeScript-expert** - TypeScript specialist
  - Creates/modifies TS files
  - Needs: File operations, type checking verification
  - Risk: HIGH - Modifies code files

- [ ] **aichaku-deno-expert** - Deno runtime specialist
  - Creates Deno configs, scripts
  - Needs: File operations, Deno command verification
  - Risk: HIGH - Creates config files

- [ ] **aichaku-react-expert** - React specialist
  - Creates components, modifies React code
  - Needs: Component file verification
  - Risk: MEDIUM - Creates component files

- [ ] **aichaku-python-expert** - Python specialist
  - Creates Python files, configs
  - Needs: File operations verification
  - Risk: MEDIUM - Creates Python files

- [ ] **aichaku-golang-expert** - Go language specialist
  - Creates Go files, modules
  - Needs: File operations, go.mod verification
  - Risk: MEDIUM - Creates Go files

- [ ] **aichaku-vento-expert** - Vento template specialist
  - Creates/modifies templates
  - Needs: Template file verification
  - Risk: MEDIUM - Creates template files

- [ ] **aichaku-lume-expert** - Lume SSG specialist
  - Creates Lume configs, pages
  - Needs: File operations verification
  - Risk: MEDIUM - Creates config/page files

- [ ] **aichaku-postgres-expert** - PostgreSQL specialist
  - Creates SQL files, migrations
  - Needs: File operations verification
  - Risk: MEDIUM - Creates SQL files

- [ ] **aichaku-tailwind-expert** - Tailwind CSS specialist
  - Modifies CSS/config files
  - Needs: File operations verification
  - Risk: LOW - Mostly modifies existing files

### Architecture/Design Agents (Priority 3 - Advisory Focus)

- [ ] **aichaku-api-architect** - API design specialist
  - Creates API specs, documentation
  - Needs: Spec file verification
  - Risk: MEDIUM - Creates specification files

- [ ] **aichaku-principle-coach** - Software principles guide
  - Provides guidance, may create example files
  - Needs: Example file verification
  - Risk: LOW - Mostly advisory

- [ ] **aichaku-methodology-coach** - Methodology specialist
  - Creates methodology docs
  - Needs: Document verification
  - Risk: LOW - Creates planning docs

- [ ] **aichaku-security-reviewer** - Security specialist
  - Reviews code, creates security reports
  - Needs: Report file verification
  - Risk: MEDIUM - Creates security reports

### Test/Development Agents (Priority 4)

- [ ] **test-model-agent** - Test agent for model specs
  - Testing purposes
  - Needs: Basic verification
  - Risk: LOW - Test agent

## Verification Patterns by Agent Type

### File Creation Heavy Agents

```typescript
// documenter, test-expert, typescript-expert, etc.
class ConcreteAgent extends TruthfulAgent {
  async createDocument(path: string, content: string) {
    const result = await this.createFile(path, content);
    if (!result.verified) {
      throw new Error(`Failed to create ${path}: ${result.error}`);
    }
    return `Created and verified: ${path} (${result.size} bytes)`;
  }
}
```

### Advisory/Analysis Agents

```typescript
// principle-coach, methodology-coach, security-reviewer
class AdvisoryAgent extends TruthfulAgent {
  async provideGuidance(topic: string) {
    // Less file operations, more guided testing
    return {
      guidance: "...",
      verification: "Please confirm this addresses your needs",
    };
  }
}
```

### Orchestration Agents

```typescript
// orchestrator
class Orchestrator extends TruthfulAgent {
  async routeWork(task: Task) {
    const agentResponse = await agent.execute(task);
    const verified = await this.verifyAgentClaims(agentResponse);
    if (!verified.success) {
      return `Agent claimed: ${agentResponse}, but verification failed: ${verified.error}`;
    }
    return verified.response;
  }
}
```

## Implementation Order

### Phase 1: Critical Path (Week 1)

1. **orchestrator** - Prevent lie propagation
2. **documenter** - Heavy file creator
3. **test-expert** - Test file creation
4. **TypeScript-expert** - Code file modification

### Phase 2: Code Modifiers (Week 1-2)

5. **deno-expert** - Config files
6. **react-expert** - Component files
7. **python-expert** - Python files
8. **golang-expert** - Go files
9. **vento-expert** - Template files

### Phase 3: Support Agents (Week 2)

10. **code-explorer** - File analysis
11. **api-architect** - Spec files
12. **security-reviewer** - Report files
13. **lume-expert** - SSG files
14. **postgres-expert** - SQL files

### Phase 4: Advisory Agents (Week 2-3)

15. **principle-coach** - Mostly guidance
16. **methodology-coach** - Planning docs
17. **tailwind-expert** - CSS modifications
18. **test-model-agent** - Test purposes

## Testing Requirements

Each agent needs tests for:

- [ ] File creation verification
- [ ] File modification verification
- [ ] Directory operations verification
- [ ] Failed operation reporting
- [ ] Guided testing prompts
- [ ] Claim extraction and validation

## Progress Tracking

```
Total Agents: 18
Implemented: 0/18 (0%)
In Progress: 0
Remaining: 18

Critical (Priority 1): 0/4
High (Priority 2): 0/9
Medium (Priority 3): 0/4
Low (Priority 4): 0/1
```

## Notes

- Start with orchestrator to prevent cascading lies
- Test heavily on documenter (most file operations)
- Some agents (principle-coach, methodology-coach) need minimal changes
- All agents must use the new verification language patterns
- Consider creating agent-specific verification utilities
