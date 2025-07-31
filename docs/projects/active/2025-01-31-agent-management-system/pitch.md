# Agent Management System - Pitch

## Problem

Currently, users must manually copy agent files from templates to enable them, leading to:

- Manual file copying errors
- Inconsistent agent naming (@ symbols, wrong prefixes)
- No clear distinction between default and optional agents
- YAML validation errors in agent templates
- No easy way to manage which agents are active

## Appetite

2-3 days - This is a focused enhancement to improve developer experience

## Solution

### 1. New `aichaku agents` Command

Create a new command following our shared infrastructure pattern:

```bash
# List all agents (default + optional)
aichaku agents --list

# Show currently installed agents
aichaku agents --show

# Add optional agents
aichaku agents --add typescript-expert,deno-expert

# Remove agents (only optional ones)
aichaku agents --remove golang-expert

# Show details about a specific agent
aichaku agents --show typescript-expert
```

### 2. Configuration as Code

Add metadata to each agent template's YAML frontmatter:

```yaml
---
name: deno-expert  # No prefix in template
description: Deno runtime and ecosystem specialist
type: optional  # or 'default' for core agents
tags: ["runtime", "javascript", "typescript"]
color: green
---
```

### 3. Integration Updates

- `aichaku integrate` automatically installs all default agents
- Agents are generated with proper `aichaku-` prefix
- YAML validation happens at template level

### 4. Agent Template Structure

Each agent template needs:

- Proper YAML frontmatter (no @ symbols in names)
- Fixed indentation in delegations
- Consistent structure

## Rabbit Holes

### NOT doing:

- Complex agent dependency management
- Agent versioning
- Agent marketplace/registry
- Custom agent creation UI

### Keeping it simple:

- Copy templates to `.claude/agents/` with proper naming
- Basic add/remove operations
- Configuration in single YAML file

## No-Gos

- Don't hard-code agent lists
- Don't allow removal of core agents (orchestrator)
- Don't create complex installation logic
- Don't modify agent behavior, just manage files

## Technical Approach

1. **Fix existing templates first**
   - Fix YAML indentation in delegations
   - Remove name prefixes (aichaku-@aichaku-)
   - Add `type: default|optional` metadata
2. **Create test-expert template** with proper metadata
3. **Optimize agent context injection**
   - Add AGENT_STANDARD_MAPPING to filter standards per agent
   - Add AGENT_METHODOLOGY_MAPPING to filter methodologies per agent
   - Reduce unnecessary context in specialized agents
4. **Implement AgentsCommand** using BaseCommand
5. **Update integrate command** to install all `type: default` agents
6. **Update validation tests** to check templates directly

## Success Criteria

- All agent templates have valid YAML
- `aichaku agents` command works like other config commands
- Default agents auto-install on integrate
- Optional agents easily installable
- No manual file copying needed
- All agents pass validation tests
