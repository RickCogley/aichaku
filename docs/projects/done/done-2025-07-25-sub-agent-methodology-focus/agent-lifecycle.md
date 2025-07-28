# Agent Lifecycle Documentation

## Overview

Aichaku agents are specialized Claude Code assistants that are automatically generated for each project based on
selected methodologies and standards.

## When Agents Are Created

Agents are generated during the `aichaku integrate` command:

```bash
aichaku integrate
```

This command:

1. Reads agent templates from `docs/core/agent-templates/`
2. Injects YAML sections based on your project's selected methodologies and standards
3. Generates agents in your project's `.claude/agents/` directory
4. Prompts you to restart Claude Code to load the new agents

## The Six Core Agents

Every aichaku project receives these six agents:

### 1. aichaku-orchestrator

- **Purpose**: General workflow coordinator
- **Color**: Yellow (aichaku brand)
- **Always Present**: Yes
- **Delegates To**: All other agents

### 2. aichaku-security-reviewer

- **Purpose**: Security compliance and vulnerability detection
- **Color**: Red
- **Always Present**: Yes
- **Receives**: Security-specific standards (OWASP, NIST-CSF)

### 3. aichaku-documenter

- **Purpose**: Documentation generation and merge workflows
- **Color**: Blue
- **Always Present**: Yes
- **Receives**: Documentation standards (diataxis, microsoft-style)

### 4. aichaku-methodology-coach

- **Purpose**: Creates methodology artifacts and ensures compliance
- **Color**: Green
- **Always Present**: Yes
- **Receives**: Active methodology content (Shape Up, Scrum, etc.)

### 5. aichaku-code-explorer

- **Purpose**: Discovers codebase patterns and recommends specialized agents
- **Color**: Magenta
- **Always Present**: Yes
- **Delegates To**: Orchestrator with findings

### 6. aichaku-api-architect

- **Purpose**: API design and documentation for all interface types
- **Color**: Cyan
- **Always Present**: Yes
- **Receives**: API-related standards (OpenAPI, GraphQL, etc.)

## Agent Update Cycle

```
Project Setup → aichaku integrate → Agents Generated
     ↓                                      ↓
Standards Change                    Use in Claude Code
     ↓                                      ↓
aichaku integrate → Agents Updated → Restart Claude Code
```

## Key Characteristics

- **Project-Local**: Agents live in `.claude/agents/` (not global)
- **Methodology-Aware**: Only load content for selected methodologies
- **Standards-Focused**: Inject only selected standards
- **Behind-the-Scenes**: Work through Claude Code, no direct user interaction
- **Not Documentation**: Agents are tools, never merged into docs/

## Template Structure

Each agent has:

```
docs/core/agent-templates/
├── {agent-name}/
│   ├── base.md                    # Core agent definition
│   ├── methodologies/            # Methodology-specific additions
│   │   ├── scrum.md
│   │   └── shape-up.md
│   └── standards/               # Standards-specific additions
│       ├── owasp-web.md
│       └── tdd.md
```

## Regeneration

To update agents after changing methodologies or standards:

```bash
aichaku integrate
# Then restart Claude Code
```

Agents are regenerated in place, preserving the project-specific context while updating the dynamic sections.
