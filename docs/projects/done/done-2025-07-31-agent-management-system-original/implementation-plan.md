# Agent Management System - Implementation Plan

## Phase 1: Fix Existing Issues & Optimize Context (Day 1 Morning)

### 1.1 Fix YAML Indentation in Templates

- [ ] Fix all delegation sections in agent templates
- [ ] Remove @ prefixes from agent names in templates
- [ ] Ensure consistent structure across all templates

### 1.2 Create Test Expert Template

- [ ] Create `/docs/core/agent-templates/test-expert/base.md`
- [ ] Follow existing template structure
- [ ] Include proper delegations to other agents

### 1.3 Implement Focused Context Injection

- [ ] Add AGENT_STANDARD_MAPPING to agent-generator.ts
- [ ] Add AGENT_METHODOLOGY_MAPPING to agent-generator.ts
- [ ] Update generateStandardsYaml() to filter by agent type
- [ ] Update generateMethodologyYaml() to filter by agent type
- [ ] Test context reduction for each agent type

### 1.4 Update Agent Validation Test

- [ ] Modify to check templates in `/docs/core/agent-templates/`
- [ ] Validate YAML before generation
- [ ] Check for required fields

## Phase 2: Build Configuration System (Day 1 Afternoon)

### 2.1 Create Agent Metadata

- [ ] Create `/docs/core/agent-templates/agents.yaml`
- [ ] Define default vs optional agents
- [ ] Include metadata (tags, descriptions)

### 2.2 Create Agent Loader

- [ ] Build `AgentLoader` class (similar to StandardLoader)
- [ ] Load from templates directory
- [ ] Parse agents.yaml for metadata

### 2.3 Create Agent Formatter

- [ ] Build `AgentFormatter` for display
- [ ] Format list view (grouped by default/optional)
- [ ] Format details view

## Phase 3: Implement Agents Command (Day 2 Morning)

### 3.1 Create AgentsCommand

- [ ] Extend BaseCommand
- [ ] Implement operations:
  - `--list`: Show all available agents
  - `--show`: Show installed agents
  - `--add`: Install optional agents
  - `--remove`: Remove optional agents

### 3.2 Agent Installation Logic

- [ ] Copy template to `.claude/agents/aichaku-{id}.md`
- [ ] Validate YAML during copy
- [ ] Prevent removal of default agents

### 3.3 Register with CommandExecutor

- [ ] Add to command executor
- [ ] Update CLI help text
- [ ] Add to parseArgs configuration

## Phase 4: Update Integrate Command (Day 2 Afternoon)

### 4.1 Auto-install Default Agents

- [ ] Read default agents from agents.yaml
- [ ] Install during `aichaku integrate`
- [ ] Skip if already installed

### 4.2 Update Integration Messages

- [ ] Show which agents were installed
- [ ] Mention optional agents available

## Phase 5: Testing & Documentation (Day 3)

### 5.1 Write Tests

- [ ] Unit tests for AgentLoader
- [ ] Unit tests for AgentsCommand
- [ ] Integration tests for full flow

### 5.2 Update Documentation

- [ ] Add agents command to README
- [ ] Document agent template structure
- [ ] Create agent development guide
- [ ] Document priority system: "Order matters - first listed takes precedence"
- [ ] Add examples showing how selection order affects agent behavior
- [ ] Document conflict resolution strategies (exclusive vs complement)

### 5.3 Final Validation

- [ ] Run all agent validation tests
- [ ] Test install/remove flows
- [ ] Verify integrate command works

## Success Metrics

- Zero YAML parsing errors in templates
- All default agents auto-install
- Easy optional agent management
- Consistent agent naming (aichaku-{name})
- No manual file operations needed

## Risk Mitigation

- **Risk**: Breaking existing agents
  - **Mitigation**: Fix templates in place, test thoroughly

- **Risk**: Complex dependency management
  - **Mitigation**: Keep it simple, no dependencies

- **Risk**: User confusion
  - **Mitigation**: Clear help text, good error messages
