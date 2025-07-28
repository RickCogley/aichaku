# How to Use the Agent System

The aichaku agent system provides specialized expertise through focused sub-agents that work together to assist with
complex development tasks.

## Understanding Agents

Aichaku includes two types of agents:

### Core Agents

These handle cross-functional concerns:

- **Orchestrator** - General workflow coordinator
- **Security Reviewer** - OWASP and security compliance
- **Documenter** - Documentation generation and maintenance
- **Methodology Coach** - Adaptive methodology guidance
- **Code Explorer** - Codebase discovery and analysis
- **API Architect** - API design and documentation

### Technology Experts

These provide language and framework expertise:

- **TypeScript Expert** - Type systems, generics, decorators
- **Python Expert** - Async patterns, testing, data science
- **Go Expert** - Concurrency, performance, channels
- **React Expert** - Hooks, server components, Next.js
- **Deno Expert** - Runtime features, permissions, KV store
- **Tailwind Expert** - Utility CSS, responsive design
- **Vento Expert** - Template engine patterns
- **Lume Expert** - Static site generation
- **PostgreSQL Expert** - Query optimization, schemas

## How Agents Work

### Automatic Invocation

Claude Code automatically invokes appropriate agents based on:

1. **Task Context** - What you're trying to accomplish
2. **Technology Stack** - Languages and frameworks in use
3. **Methodology** - Your selected development approach

### Agent Coordination

Agents coordinate through delegation:

```yaml
# Example: TypeScript expert delegates to API architect
delegations:
  - trigger: API design needed
    target: aichaku-api-architect
    handoff: "Design TypeScript API for {requirements}"
```

### Context Management

Each agent maintains focused context:

- **Before**: 12,000+ tokens loading everything
- **After**: ~4,000 tokens per agent
- **Result**: Longer sessions without context exhaustion

## Practical Examples

### Example 1: Building a TypeScript API

```
User: "I need to build a REST API with TypeScript"

Claude invokes:
1. Orchestrator → coordinates the workflow
2. TypeScript Expert → type-safe patterns
3. API Architect → RESTful design
4. Security Reviewer → OWASP compliance
```

### Example 2: React Performance Issue

```
User: "My React app is rendering slowly"

Claude invokes:
1. React Expert → identifies performance patterns
2. Code Explorer → analyzes component structure
3. Documenter → updates performance notes
```

### Example 3: Database Optimization

```
User: "How do I optimize this PostgreSQL query?"

Claude invokes:
1. PostgreSQL Expert → query analysis
2. Code Explorer → finds related queries
3. Documenter → creates optimization guide
```

## Working with Agents

### Let Agents Guide You

Agents proactively offer guidance:

```typescript
// TypeScript Expert notices:
"I see you're using 'any' types. Let me suggest type-safe alternatives...";

// Security Reviewer alerts:
"This SQL query needs parameterization to prevent injection...";
```

### Request Specific Expertise

You can explicitly request agent help:

- "Review this for security issues" → Security Reviewer
- "Help me document this API" → API Architect + Documenter
- "Optimize this for production" → Technology Expert

### Agent Collaboration

Agents work together seamlessly:

1. **Code Explorer** finds relevant files
2. **Technology Expert** suggests improvements
3. **Security Reviewer** validates changes
4. **Documenter** updates documentation

## Tips for Effective Agent Use

### 1. Be Specific About Goals

```
❌ "Help me with this code"
✅ "Help me optimize this React component for performance"
```

### 2. Mention Technologies

```
❌ "I need to build an API"
✅ "I need to build a REST API with Deno and PostgreSQL"
```

### 3. State Your Methodology

```
❌ "Let's plan this feature"
✅ "Let's shape this feature using Shape Up methodology"
```

### 4. Ask for Reviews

```
"Review this implementation for security issues"
"Check if this follows TypeScript best practices"
"Validate this API design"
```

## Agent Capabilities

### Code Examples

Each technology expert includes ~10 idiomatic examples:

```typescript
// TypeScript Expert provides:
class TypedEventEmitter<T extends EventMap> {
  private listeners: {
    [K in keyof T]?: Array<(data: T[K]) => void>;
  } = {};

  emit<K extends keyof T>(event: K, data: T[K]): void {
    // Type-safe event emission
  }
}
```

### Pattern Recognition

Agents recognize anti-patterns:

```python
# Python Expert identifies:
"Using mutable default arguments is dangerous. 
Here's the safe pattern..."

def process(items=None):
    if items is None:
        items = []
```

### Cross-Domain Knowledge

Agents understand interactions:

```go
// Go Expert + PostgreSQL Expert:
"For this concurrent database access pattern,
use connection pooling with these settings..."
```

## Extending the Agent System

### Adding Custom Agents

Create new agents by:

1. Creating `/docs/core/agent-templates/your-expert/base.md`
2. Adding YAML frontmatter configuration
3. Including 10+ code examples
4. Defining delegation patterns

### Agent Template Structure

```yaml
---
name: aichaku-your-expert
description: Your expert's focus area
color: blue
tools: ["Read", "Write", "Edit", "Bash"]
methodology_aware: false
technology_focus: your-tech
examples:
  - context: When to use
    user: "Example question"
    assistant: "Agent response"
delegations:
  - trigger: Delegation condition
    target: target-agent
---

# Your Expert Content
```

## Common Agent Workflows

### Full Stack Development

1. **Orchestrator** coordinates overall flow
2. **Technology Experts** for each layer
3. **API Architect** for integration
4. **Security Reviewer** for validation
5. **Documenter** for maintenance

### Bug Investigation

1. **Code Explorer** locates relevant code
2. **Technology Expert** analyzes issue
3. **Security Reviewer** checks implications
4. **Methodology Coach** suggests fix approach

### Performance Optimization

1. **Technology Expert** identifies bottlenecks
2. **Code Explorer** finds similar patterns
3. **Documenter** records optimizations

## Summary

The agent system transforms how you work with Claude Code:

- **Focused Expertise**: Each agent specializes deeply
- **Better Context**: 70% reduction in token usage
- **Seamless Coordination**: Agents work together
- **Proactive Guidance**: Agents anticipate needs
- **Extensible System**: Add your own experts

Let the agents handle the complexity while you focus on building great software!
