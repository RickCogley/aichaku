# How to Manage Agents in Aichaku

Aichaku provides specialized AI agents that focus on specific aspects of software development. This guide shows you how
to manage these agents effectively.

## Understanding Agent Types

### Default Agents

Always included when you run `aichaku integrate`:

- **aichaku-orchestrator** - General workflow coordinator
- **aichaku-api-architect** - API design and documentation
- **aichaku-security-reviewer** - Security analysis (OWASP, NIST)
- **aichaku-test-expert** - Testing strategies and coverage
- **aichaku-documenter** - Documentation generation
- **aichaku-code-explorer** - Codebase discovery
- **aichaku-methodology-coach** - Methodology guidance
- **aichaku-principle-coach** - Software principles education

### Optional Agents

Technology-specific agents you can add:

- **aichaku-TypeScript-expert** - TypeScript patterns
- **aichaku-deno-expert** - Deno runtime specialist
- **aichaku-python-expert** - Python best practices
- **aichaku-golang-expert** - Go language patterns
- **aichaku-react-expert** - React ecosystem
- **aichaku-tailwind-expert** - Tailwind CSS
- **aichaku-postgres-expert** - PostgreSQL database
- **aichaku-lume-expert** - Lume static site generator
- **aichaku-vento-expert** - Vento template engine

## Managing Agents

### List Available Agents

```bash
# Show all agents with their status
aichaku agents --list

# Example output:
# Available Agents:
# 
# Default Agents (always included):
#   aichaku-orchestrator     - General workflow coordinator
#   aichaku-api-architect    - API design specialist
#   ...
# 
# Optional Agents:
#   aichaku-typescript-expert [SELECTED] - TypeScript specialist
#   aichaku-python-expert               - Python specialist
#   ...
```

### Add Agents

```bash
# Add a single agent
aichaku agents --add typescript-expert

# Add multiple agents
aichaku agents --add typescript-expert deno-expert react-expert

# Note: You can omit the 'aichaku-' prefix
```

### Remove Agents

```bash
# Remove a single agent
aichaku agents --remove python-expert

# Remove multiple agents
aichaku agents --remove golang-expert postgres-expert
```

## Selection Priority

When adding multiple agents, the order matters for priority:

```bash
# TypeScript expert gets priority for type-related questions
aichaku agents --add typescript-expert deno-expert

# Deno expert gets priority for runtime questions
aichaku agents --add deno-expert typescript-expert
```

See [Understanding Selection Priority](./understand-selection-priority.md) for more details.

## How Agents Work

### Focused Context

Each agent has its own focused context window containing only relevant:

- Standards (e.g., test-expert gets testing standards)
- Methodologies (e.g., methodology-coach gets all methodologies)
- Principles (e.g., principle-coach gets software principles)

### Agent Delegation

Agents can delegate to each other:

- Code-explorer finds APIs → delegates to api-architect
- Security issues found → delegates to security-reviewer
- Documentation needed → delegates to documenter

### Integration with Claude

After running `aichaku integrate`, agents become available in your CLAUDE.md file and can be invoked by Claude when
needed.

## Best Practices

### 1. Select Relevant Agents

Only add agents for technologies you're actually using:

```bash
# For a TypeScript/React project
aichaku agents --add typescript-expert react-expert

# For a Python/PostgreSQL project
aichaku agents --add python-expert postgres-expert
```

### 2. Let Default Agents Handle General Tasks

Don't add technology-specific agents unless needed. The default agents handle:

- General architecture decisions (orchestrator)
- Security reviews (security-reviewer)
- Testing strategies (test-expert)
- Documentation (documenter)

### 3. Review Agent Delegations

Agents automatically delegate to appropriate specialists. You don't need to manually coordinate them.

## Troubleshooting

### Agent Not Available

If an agent isn't working:

1. Check if it's selected: `aichaku agents --list`
2. Run integration: `aichaku integrate`
3. Verify in CLAUDE.md that agents are listed

### Conflicting Advice

If agents give conflicting advice:

1. Check priority order with `--list`
2. Reorder if needed by removing and re-adding
3. The orchestrator helps resolve conflicts

## Advanced Usage

### Project-Specific Agents

You can create custom agents for your project in `.claude/aichaku/agents/`:

```yaml
# .claude/aichaku/agents/domain-expert.yaml
name: aichaku-domain-expert
type: optional
description: Domain-specific expert for our e-commerce platform
# ... agent definition
```

### Agent Context Requirements

Agents specify their context needs in their templates:

```yaml
# In agent template
context_requirements:
  standards:
    - testing/tdd.yaml
    - testing/test-pyramid.yaml
  principles:
    - software-development/fail-fast.yaml
```

## Related Commands

- `aichaku integrate` - Activate selected agents in your project
- `aichaku standards --list` - View selected standards
- `aichaku methodologies --list` - View selected methodologies
- `aichaku config` - View complete configuration

## See Also

- [Getting Started](../tutorials/getting-started.md)
- [Understanding Selection Priority](./understand-selection-priority.md)
- [Agent Architecture](../explanation/agent-architecture.md)
