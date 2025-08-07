# How to Manage and Use Agents in Aichaku

Aichaku provides specialized AI agents that focus on specific aspects of software development. This guide shows you how
to manage, customize, and effectively use these agents.

## Understanding the Agent System

Aichaku's agent system transforms how you work with Claude Code by providing focused expertise through specialized
sub-agents that maintain their own context windows and coordinate seamlessly.

### Benefits

- **Focused Expertise**: Each agent specializes deeply in its domain
- **Better Context Management**: 70% reduction in token usage (from 12K+ to ~4K per agent)
- **Seamless Coordination**: Agents delegate to each other automatically
- **Proactive Guidance**: Agents anticipate needs and offer suggestions
- **Extensible System**: Add your own custom experts

## Agent Types

### Default Agents (Always Included)

These core agents handle cross-functional concerns and are always available:

- **aichaku-orchestrator** - General workflow coordinator that routes work
- **aichaku-api-architect** - API design and documentation specialist
- **aichaku-security-reviewer** - Security analysis (OWASP, NIST compliance)
- **aichaku-test-expert** - Testing strategies and coverage
- **aichaku-documenter** - Documentation generation and lifecycle
- **aichaku-code-explorer** - Codebase discovery and analysis
- **aichaku-methodology-coach** - Adaptive methodology guidance
- **aichaku-principle-coach** - Software principles education

### Optional Technology Experts

Add these based on your project's technology stack:

#### Language Experts

- **aichaku-TypeScript-expert** - TypeScript patterns, generics, decorators
- **aichaku-python-expert** - Python async patterns, testing, data science
- **aichaku-golang-expert** - Go concurrency, performance, channels

#### Framework Experts

- **aichaku-react-expert** - React hooks, server components, Next.js
- **aichaku-deno-expert** - Deno runtime, permissions, KV store
- **aichaku-tailwind-expert** - Tailwind utility CSS, responsive design

#### Tool Experts

- **aichaku-postgres-expert** - PostgreSQL query optimization, schemas
- **aichaku-lume-expert** - Lume static site generator
- **aichaku-vento-expert** - Vento template engine patterns

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

### Selection Priority

The order of agent selection matters for priority:

```bash
# TypeScript expert gets priority for type-related questions
aichaku agents --add typescript-expert deno-expert

# Deno expert gets priority for runtime questions
aichaku agents --add deno-expert typescript-expert
```

## How Agents Work

### Agent Template Flow

Understanding how agents move from source to your project is crucial:

#### First Time Installation

1. **Install CLI from JSR**
   ```bash
   deno install -g -A -n aichaku jsr:@rick/aichaku/cli
   ```
   - Downloads CLI code from JSR registry
   - Creates executable binary (e.g., `/usr/local/bin/aichaku`)

2. **Initialize Global Installation**
   ```bash
   aichaku init --global
   ```
   - Downloads agent templates from GitHub
   - Stores in `~/.claude/aichaku/docs/core/agent-templates/`
   - These are SOURCE templates (never modified)
   - Shows: "🤖 Installed 20 Aichaku agents"

3. **Initialize Project**
   ```bash
   cd /path/to/project
   aichaku init
   ```
   - Creates `.claude/aichaku/` project structure
   - Does NOT copy agents yet
   - Creates `aichaku.json` configuration

4. **Generate Agents**
   ```bash
   aichaku integrate
   ```
   - Reads templates from `~/.claude/aichaku/docs/core/agent-templates/`
   - Enriches with your selected methodologies/standards/principles
   - Writes customized agents to `project/.claude/agents/aichaku-*.md`

#### Upgrade Flow

1. **Update CLI**
   ```bash
   # Clear cache and reinstall
   deno cache --reload jsr:@rick/aichaku/cli
   deno install -g -A -n aichaku --force jsr:@rick/aichaku/cli
   ```

2. **Update Global Templates**
   ```bash
   aichaku upgrade --global
   ```
   - Downloads latest templates from GitHub
   - Updates `~/.claude/aichaku/docs/core/agent-templates/`
   - Shows: "🤖 Updated 20 Aichaku agents"

3. **Update Project & Regenerate**
   ```bash
   cd /path/to/project
   aichaku upgrade        # Updates project config
   aichaku integrate      # Regenerates agents with latest templates
   ```

#### Key Directories

**Global Installation** (source templates):

```
~/.claude/aichaku/
└── docs/
    └── core/
        └── agent-templates/        # SOURCE templates
            ├── deno-expert/
            │   └── base.md         # Template with YAML frontmatter
            ├── test-expert/
            │   └── base.md
            └── ...
```

**Project Structure** (generated agents):

```
project/
└── .claude/
    ├── agents/                     # GENERATED agents (customized)
    │   ├── aichaku-deno-expert.md
    │   ├── aichaku-test-expert.md
    │   └── ...
    └── aichaku/
        └── aichaku.json            # Project configuration
```

### Automatic Invocation

Claude Code automatically invokes appropriate agents based on:

1. **Task Context** - What you're trying to accomplish
2. **Technology Stack** - Languages and frameworks in use
3. **Selected Methodology** - Your chosen development approach
4. **Keywords** - Specific terms that trigger agent expertise

### Agent Coordination

Agents coordinate through delegation patterns:

```yaml
# Example: TypeScript expert delegates to API architect
delegations:
  - trigger: API design needed
    target: aichaku-api-architect
    handoff: "Design TypeScript API for {requirements}"
```

### Dynamic Customization

When you run `aichaku integrate`, the system performs intelligent context injection:

1. **Load Template**: Reads from `~/.claude/aichaku/docs/core/agent-templates/{agent}/base.md`
2. **Extract Metadata**: Parses YAML frontmatter for agent configuration
3. **Inject Context**: Adds sections based on your selections:
   - Selected methodologies (e.g., Shape Up concepts)
   - Selected standards (e.g., TDD practices, OWASP checks)
   - Selected principles (e.g., DRY, KISS guidelines)
4. **Generate Output**: Writes to `project/.claude/agents/aichaku-{agent}.md`

**Important Notes:**

- Templates are **never modified** - they remain clean references
- Agents are **completely regenerated** each time you run `integrate`
- Context injection is **dynamic** - different projects get different agent configurations
- All agents use `aichaku-` prefix to prevent collisions with custom agents

Example customization flow:

```bash
# 1. Select Shape Up methodology
aichaku methodologies select shape-up

# 2. Select TDD and OWASP standards
aichaku standards select
# Choose: tdd, owasp-web

# 3. Generate customized agents
aichaku integrate

# Result: Your agents now understand Shape Up concepts,
# apply TDD practices, and check for OWASP security issues
```

## Practical Usage Examples

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

### 4. Request Reviews

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

Agents recognize anti-patterns and suggest improvements:

```python
# Python Expert identifies:
"Using mutable default arguments is dangerous. 
Here's the safe pattern..."

def process(items=None):
    if items is None:
        items = []
```

### Proactive Guidance

Agents offer suggestions without being asked:

```typescript
// TypeScript Expert notices:
"I see you're using 'any' types. Let me suggest type-safe alternatives...";

// Security Reviewer alerts:
"This SQL query needs parameterization to prevent injection...";
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

## Best Practices

### 1. Select Only Relevant Agents

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

### 3. Trust Agent Delegation

Agents automatically delegate to appropriate specialists. You don't need to manually coordinate them.

## Advanced Usage

### Creating Custom Agents

You can create project-specific agents:

1. Create `/docs/core/agent-templates/your-expert/base.md`
2. Add YAML frontmatter configuration
3. Include 10+ code examples
4. Define delegation patterns

```yaml
---
name: aichaku-domain-expert
description: Domain-specific expert for our e-commerce platform
color: blue
tools: ["Read", "Write", "Edit", "Bash"]
methodology_aware: false
technology_focus: e-commerce
examples:
  - context: When to use
    user: "Example question"
    assistant: "Agent response"
delegations:
  - trigger: Payment processing needed
    target: aichaku-security-reviewer
---

# Your Expert Content
```

### Viewing Generated Agents

Check your customized agents after integration:

```bash
ls .claude/agents/

# Each file shows:
# - YAML frontmatter with configuration
# - Base capabilities
# - Injected standards (if applicable)
# - Injected methodology (if applicable)
```

## Troubleshooting

### Verifying Agent Installation

Check that agents are properly installed:

```bash
# Verify global templates exist
ls ~/.claude/aichaku/docs/core/agent-templates/
# Should show: deno-expert, test-expert, etc.

# Verify project agents after integrate
ls .claude/agents/
# Should show: aichaku-deno-expert.md, aichaku-test-expert.md, etc.

# View a source template (unmodified)
cat ~/.claude/aichaku/docs/core/agent-templates/deno-expert/base.md

# View a generated agent (customized with your selections)
cat .claude/agents/aichaku-deno-expert.md
```

### Agent Not Available

If an agent isn't working:

1. Check if it's selected: `aichaku agents --list`
2. Run integration: `aichaku integrate`
3. Restart Claude Code to load new agents
4. Verify in CLAUDE.md that agents are listed

### Conflicting Advice

If agents give conflicting advice:

1. Check priority order with `--list`
2. Reorder if needed by removing and re-adding
3. The orchestrator helps resolve conflicts

## Related Commands

- `aichaku integrate` - Activate selected agents in your project
- `aichaku standards --list` - View selected standards
- `aichaku methodologies --list` - View selected methodologies
- `aichaku config` - View complete configuration

## See Also

- [Getting Started](../tutorials/getting-started.md)
- [Understanding Selection Priority](./understand-selection-priority.md)
- [Agent Architecture](../explanation/agent-architecture.md)
