# How Agent Customization Works

Aichaku's agent system dynamically generates custom Claude Code agents based on your project's methodology and standards
selections. This document explains how this customization works.

## Overview

When you run `aichaku integrate`, the system:

1. Reads your selected methodology from `aichaku.json`
2. Reads your selected standards from `aichaku.json`
3. Generates custom agents in `.claude/agents/` directory
4. Each agent inherits capabilities specific to your choices

## Agent Types

Aichaku generates these specialized agents:

- **orchestrator** - General workflow coordinator that routes work appropriately
- **security-reviewer** - InfoSec specialist for OWASP and security standards
- **methodology-coach** - Provides guidance based on your selected methodology
- **documenter** - Creates documentation aligned with your chosen standards
- **code-explorer** - Discovers patterns and recommends appropriate agents
- **api-architect** - Designs APIs following your selected patterns

## How Customization Works

### 1. Base Templates

Each agent starts from a base template in `/docs/core/agent-templates/[agent-type]/base.md` that defines:

- Core capabilities and tools
- Basic behavior patterns
- Cross-functional delegations

### 2. Methodology Injection

Your selected methodology (e.g., Shape Up, Scrum) is dynamically injected into:

- The methodology-coach agent for specific guidance
- Other agents for methodology-aware suggestions

Example: If you select Shape Up, the methodology-coach will understand 6-week cycles, betting tables, and hill charts.

### 3. Standards Injection

Your selected development standards are injected into relevant agents:

- **security standards** → security-reviewer agent
- **testing standards** → all agents that write tests
- **architecture standards** → api-architect and code-explorer

### 4. Dynamic YAML Sections

Each generated agent includes:

````yaml
## Selected Standards
<!-- AUTO-GENERATED from docs/standards/ -->
```yaml
standards:
  security:
    owasp-web:
      summary: { ... }
````

## Active Methodology

<!-- AUTO-GENERATED from docs/methodologies/ -->

```yaml
methodology:
  shape-up:
    summary: { ... }
```

## When Agents Update

Agents are regenerated when:

- You run `aichaku integrate` after changing selections
- You run `aichaku methodologies select` and choose a new methodology
- You run `aichaku standards select` and change standards

## Agent Behavior

The customized agents:

- Provide methodology-specific advice (e.g., Shape Up pitch templates)
- Apply your selected standards automatically (e.g., TDD patterns)
- Delegate to each other based on expertise
- Maintain consistency across your project

## Example Customization Flow

1. **Select Shape Up methodology:**
   ```bash
   aichaku methodologies select shape-up
   ```

2. **Select TDD and OWASP standards:**
   ```bash
   aichaku standards select
   # Choose: tdd, owasp-web
   ```

3. **Generate customized agents:**
   ```bash
   aichaku integrate
   ```

4. **Result:** Your agents now:
   - Understand Shape Up concepts (6-week cycles, betting, etc.)
   - Apply TDD practices (write tests first)
   - Check for OWASP security issues

## Viewing Generated Agents

Check your customized agents:

```bash
ls .claude/agents/
```

Each agent file shows:

- YAML frontmatter with configuration
- Base capabilities
- Injected standards (if applicable)
- Injected methodology (if applicable)

## Important Notes

- Agents require Claude Code restart after generation
- Don't manually edit generated agents (changes will be overwritten)
- Agents work together - the orchestrator routes tasks appropriately
- Each agent has specific expertise based on your selections
