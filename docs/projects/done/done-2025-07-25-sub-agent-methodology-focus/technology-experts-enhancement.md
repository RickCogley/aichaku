# Technology Expert Templates Enhancement

**Date**: 2025-07-28\
**Type**: Post-completion enhancement\
**Parent Project**: Sub-Agent Methodology Focus

## Overview

After completing the core sub-agent system, we enhanced aichaku with technology-specific expert agent templates. These
templates provide specialized knowledge for various programming languages, frameworks, and tools.

## Implementation Details

### Template Structure

Each technology expert follows this consistent structure:

```yaml
---
name: aichaku-{technology}-expert
description: {Technology} specialist for {key competencies}
color: {appropriate color}
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
methodology_aware: false
technology_focus: {technology}
examples:
  - context: {scenario}
    user: "{user question}"
    assistant: "{response using expert}"
    commentary: {why this expert is needed}
delegations:
  - trigger: {when to delegate}
    target: {other expert}
    handoff: "{delegation message}"
---

# Aichaku {Technology} Expert

{Expert introduction and core competencies}

## Idiomatic Code Examples

{10+ comprehensive code examples demonstrating key patterns}
```

### Technology Experts Created

1. **TypeScript Expert** (`typescript-expert/base.md`)
   - Type-safe event emitters
   - Advanced generics and conditional types
   - Decorator patterns
   - API route type safety

2. **Python Expert** (`python-expert/base.md`)
   - Async/await patterns
   - Dataclasses and type hints
   - Testing with pytest
   - Context managers

3. **Go Expert** (`golang-expert/base.md`)
   - Worker pool patterns
   - Custom error types
   - Interface design
   - Concurrency with channels

4. **React Expert** (`react-expert/base.md`)
   - Custom hooks
   - Server components
   - Testing utilities
   - Next.js patterns

5. **Deno Expert** (`deno-expert/base.md`)
   - Permission management
   - HTTP server with middleware
   - KV store patterns
   - FFI integration

6. **Tailwind Expert** (`tailwind-expert/base.md`)
   - Complete configuration
   - Responsive components
   - Dark mode implementation
   - Custom plugins

7. **Vento Expert** (`vento-expert/base.md`)
   - Template syntax and inheritance
   - Components and macros
   - Data pipelines
   - Integration with Lume

8. **Lume Expert** (`lume-expert/base.md`)
   - Site configuration
   - Plugin development
   - Multilingual setup
   - Asset optimization

9. **PostgreSQL Expert** (`postgres-expert/base.md`)
   - Query optimization
   - Schema design
   - Performance tuning
   - Advanced features

### Key Features

1. **Comprehensive Examples**: Each template includes ~10 real-world code examples
2. **Real Project Patterns**: Examples drawn from actual projects (blog.esolia.pro, Nagare)
3. **Delegation Patterns**: Experts know when to hand off to other specialists
4. **Consistent Format**: All templates follow the same structure for easy expansion

### Integration Points

Technology experts integrate with:

- Orchestrator for task coordination
- Documenter for technical documentation
- Security reviewer for security patterns
- API architect for service design

### Usage

Users can leverage these experts through Claude Code by referencing them:

- "I need help with TypeScript generics" → TypeScript expert
- "How do I optimize my Tailwind bundle?" → Tailwind expert
- "I want to build a Deno server" → Deno expert

### Future Expansion

The template system is designed for easy expansion. Additional technology experts can be added by:

1. Creating a new directory under `/docs/core/agent-templates/`
2. Following the established `base.md` structure
3. Including 10+ idiomatic code examples
4. Defining appropriate delegations

## Impact

This enhancement significantly expands aichaku's capability to provide specialized, technology-specific guidance while
maintaining the context-aware, methodology-driven approach of the core system.
