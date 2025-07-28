# Comprehensive Sub-Agent System Plan

## Overview

Build a complete sub-agent ecosystem for aichaku that provides specialized expertise while solving context bloat through
focused, methodology-aware agents. The system includes general orchestration, specialized agents, and seamless
communication patterns.

## Agent Categories

### 1. **Orchestration Layer**

**aichaku-orchestrator** (General Purpose)

- Coordinates all agent activities across the system
- Routes tasks to appropriate specialists
- Monitors project lifecycle events
- Manages agent handoffs and communication
- Not limited to documentation - handles all workflows

### 2. **Core Specialist Agents**

**aichaku-security-reviewer**

- Security compliance (OWASP, NIST-CSF)
- Code vulnerability analysis
- InfoSec annotations
- Security-first architecture guidance

**aichaku-documenter**

- Documentation generation during development
- Standards-compliant artifact creation
- Project documentation merge workflows
- Version control and change tracking

**aichaku-methodology-coach**

- Adaptive methodology guidance
- Creates methodology-specific artifacts
- Ensures methodology compliance
- Adapts to selected methodologies

### 3. **Development Specialist Agents**

#### Core Development Agents

**aichaku-code-archaeologist**

- Explore and understand any codebase
- Uncover architecture patterns and dependencies
- Document hidden knowledge in legacy code
- Create onboarding documentation

**aichaku-code-reviewer**

- Language-agnostic code quality review
- Security vulnerability detection
- Performance bottleneck identification
- Educational feedback for team growth

**aichaku-performance-optimizer**

- Performance profiling and analysis
- Optimization strategy recommendations
- Memory usage optimization
- Scalability improvements

#### Universal Development Agents

**aichaku-api-architect**

- API design patterns (REST, GraphQL, gRPC)
- OpenAPI/Swagger documentation
- Contract-first development
- Microservices communication patterns

**aichaku-backend-developer**

- Server-side architecture
- Database design and optimization
- Authentication/authorization systems
- Message queue implementations

**aichaku-frontend-developer**

- UI/UX implementation
- State management patterns
- Component architecture
- Accessibility compliance

#### Technology-Specific Experts

**aichaku-deno-expert**

- Deno-specific patterns and idioms
- Permission system guidance
- Module management
- Fresh framework expertise

**aichaku-typescript-expert**

- Advanced TypeScript patterns
- Type system mastery
- Generic programming
- Compiler configuration

**aichaku-bash-expert**

- Shell scripting best practices
- System automation
- DevOps tooling
- Cross-platform compatibility

## System Architecture

### Agent Communication Pattern

```yaml
# Delegation chains based on sample agents
orchestrator:
  can_delegate_to:
    - documenter
    - security-reviewer
    - methodology-coach
    - any_specialist

documenter:
  can_delegate_to:
    - user (for review)
    - orchestrator (for completion)

security-reviewer:
  can_delegate_to:
    - orchestrator (findings complete)
    - documenter (security docs needed)

methodology-coach:
  can_delegate_to:
    - documenter (artifact creation)
    - orchestrator (workflow guidance)
```

### Context Management

```yaml
# Each agent loads only what it needs
base_context:
  - aichaku core directives
  - agent communication protocols

agent_specific_context:
  security-reviewer:
    - selected security standards (OWASP, NIST-CSF)
    - security patterns for active methodology

  documenter:
    - selected documentation standards
    - methodology templates
    - existing doc structure

  methodology-coach:
    - active methodology guides
    - methodology-specific workflows
    - project lifecycle patterns
```

## Agent Generation System

### Template Structure

```
docs/core/agent-templates/
├── {agent-name}/
│   └── base.md                    # Core agent definition
```

### YAML Injection Process

1. Read selected standards/methodologies from aichaku.json
2. Extract relevant sections (summary + rules)
3. Inject into agent templates
4. Generate agents with "aichaku-" prefix

### User Customization

```
.claude/aichaku/user/
├── agents/                        # User agent overrides
└── templates/                     # User documentation templates
```

## Methodology-Aware Features

### Dynamic Context Loading

- Agents load only active methodology content
- Standards loaded based on project selection
- Reduces context from ~12,000 to ~4,000 tokens

### Adaptive Behavior

- Methodology coach adapts guidance to selected approach
- Security reviewer focuses on methodology-specific patterns
- Documenter uses appropriate templates

## Implementation Phases

### Phase 1: Core Infrastructure ✓ (Mostly Complete)

- [x] Agent file structure design
- [x] Basic agent templates created
- [x] `aichaku methodologies` command built
- [x] Agent generation logic implemented

### Phase 2: Agent Enhancement (Current)

- [ ] Add delegation patterns to all agents
- [ ] Implement orchestrator as general coordinator
- [ ] Enhance documenter with merge capabilities
- [ ] Add methodology-specific behavior

### Phase 3: System Integration

- [ ] Modify install process for methodology selection
- [ ] Update integrate command for agent generation
- [ ] Implement agent communication protocols
- [ ] Add development logging system

### Phase 4: Advanced Features

- [ ] Additional specialist agents
- [ ] Agent state management
- [ ] Performance optimization
- [ ] User customization options

## Key Design Principles

1. **General Purpose Orchestration**: Orchestrator handles all workflows, not just documentation
2. **Specialized Expertise**: Each agent excels in its domain
3. **Minimal Context**: Load only what's needed for the task
4. **Clear Communication**: Explicit delegation patterns
5. **User Control**: No autonomous actions without approval
6. **Extensibility**: Easy to add new agents

## Real Development Use Cases

### Complete Feature Development

```
User: "Build a user authentication system with OAuth2"
→ orchestrator: Coordinates the full development cycle
  → api-architect: Designs auth API endpoints
  → backend-developer: Implements OAuth2 flow
  → security-reviewer: Reviews implementation
  → frontend-developer: Creates login UI
  → documenter: Generates API docs
  → methodology-coach: Updates Shape Up hill chart
```

### Legacy Code Understanding

```
User: "I inherited this codebase and need to understand it"
→ code-archaeologist: Explores and maps the codebase
  → documenter: Creates architecture documentation
  → code-reviewer: Identifies technical debt
  → orchestrator: Plans modernization approach
```

### Performance Optimization

```
User: "The application is running slowly"
→ performance-optimizer: Profiles and analyzes
  → code-reviewer: Reviews problematic areas
  → backend-developer: Implements optimizations
  → documenter: Records performance improvements
```

### Technology Migration

```
User: "Migrate from Node.js to Deno"
→ orchestrator: Plans migration strategy
  → deno-expert: Provides Deno patterns
  → typescript-expert: Updates type definitions
  → code-archaeologist: Maps dependencies
  → bash-expert: Updates deployment scripts
```

### Methodology-Driven Development

```
User: "Start a new Shape Up cycle"
→ methodology-coach: Creates cycle artifacts
  → orchestrator: Sets up development workflow
  → api-architect: Shapes API design
  → documenter: Maintains pitch document
  → code-reviewer: Ensures quality standards
```

## Success Metrics

- **Context Efficiency**: 60%+ reduction in loaded context
- **Task Routing**: Correct agent selection 95%+ of time
- **Communication Clarity**: Clear handoffs between agents
- **User Satisfaction**: Reduced cognitive load
- **Extensibility**: Easy to add new agents/capabilities

## Expanded Ecosystem Benefits

### Development Support

1. **Complete Development Support**: Agents cover the entire software development lifecycle
2. **Technology Expertise**: Specific agents for technologies users actually use
3. **Methodology Integration**: Development agents work within chosen methodologies
4. **Learning & Growth**: Code-reviewer provides educational feedback
5. **Legacy Code Support**: Code-archaeologist helps with inherited projects

### Agent Synergies

- **Methodology + Development**: Shape Up coach coordinates with api-architect for shaping
- **Security + Development**: Security-reviewer works with backend-developer on auth
- **Documentation + Code**: Documenter captures decisions from all development agents
- **Performance + Review**: Performance-optimizer findings feed into code-reviewer

### Scalability Path

1. **Start Small**: Core 4 agents (orchestrator, security, methodology, documenter)
2. **Add As Needed**: Development agents based on project requirements
3. **Technology Specific**: Add experts for user's tech stack
4. **Custom Agents**: Users can create project-specific agents

## Implementation Priority

### Phase 1: Foundation (Current)

- [x] Core agent architecture
- [ ] Orchestrator implementation
- [ ] Basic delegation patterns

### Phase 2: Core Development Agents

- [ ] Code-archaeologist (high demand for legacy code)
- [ ] Code-reviewer (universal need)
- [ ] API-architect (modern development)

### Phase 3: Technology Experts

- [ ] Based on user survey/requests
- [ ] Start with most popular (TypeScript, Python, etc.)
- [ ] Add based on aichaku user demographics

### Phase 4: Advanced Features

- [ ] Agent learning/memory
- [ ] Cross-project knowledge sharing
- [ ] Team collaboration features

## Next Steps

1. Complete orchestrator implementation as general coordinator
2. Add delegation patterns to existing agents
3. Test multi-agent workflows with development scenarios
4. Implement documentation merge capabilities
5. Create code-archaeologist as first development agent
6. Survey users for most needed technology experts

This expanded system transforms aichaku from a methodology tool into a complete development assistant platform,
supporting everything users need to build software successfully within their chosen methodologies.
