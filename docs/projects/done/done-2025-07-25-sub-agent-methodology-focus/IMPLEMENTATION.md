# Sub-Agent System Implementation Guide

## Overview

This consolidated implementation guide combines all actionable items from the three planning documents, providing a
single source of truth for implementing the aichaku sub-agent system.

## Core Agent Specifications

### 1. aichaku-orchestrator (NEW)

**Purpose**: General workflow coordinator for all aichaku activities\
**Tools**: All tools (omit tools line) **Key Features**:

- Routes tasks to appropriate specialists
- Monitors project lifecycle events
- Manages agent handoffs and communication
- NOT limited to documentation - handles all workflows

**Implementation**: Use pure YAML structure (no XML tags)

```yaml
---
name: aichaku-orchestrator
description: General workflow coordinator for all aichaku projects
color: yellow  # ANSI color closest to aichaku orange brand
# tools: omit this line for "all tools" access
methodology_aware: true
examples:
  - context: User starts a new development project
    user: "I need to build a user authentication system"
    assistant: "I'll use the aichaku-orchestrator to coordinate this development effort"
    commentary: Complex development tasks require coordination across multiple specialized agents
  - context: Project reaches completion
    user: "This project is complete"
    assistant: "Let me use the aichaku-orchestrator to handle the project completion workflow"
    commentary: Project lifecycle events trigger documentation merges and artifact archival
delegations:
  - trigger: Security review needed
    target: aichaku-security-reviewer
    handoff: "Review {component} for security vulnerabilities"
  - trigger: Documentation needed
    target: aichaku-documenter
    handoff: "Generate {type} documentation for {project}"
  - trigger: Methodology guidance needed
    target: aichaku-methodology-coach
    handoff: "Provide {methodology} guidance for {situation}"
---
```

### 2. aichaku-documenter (ENHANCED)

**Purpose**: Documentation generation and merge specialist\
**Tools**: Read, Write, Edit, MultiEdit\
**Key Features**:

- Generate docs during development
- Merge project docs to central documentation
- Version control with frontmatter
- Template hierarchy management

### 3. aichaku-methodology-coach (EXISTING - ENHANCE)

**Purpose**: Adaptive methodology guidance\
**Enhancement**: YAML injection from selected methodologies

### 4. aichaku-security-reviewer (EXISTING - ENHANCE)

**Purpose**: Security compliance (OWASP, NIST-CSF)\
**Enhancement**: YAML injection from selected security standards

### 5. aichaku-code-explorer (NEW)

**Purpose**: Codebase discovery and pattern recognition **Tools**: Read, Grep, Glob, Bash **Key Features**:

- Explores project structure automatically
- Identifies APIs, patterns, and technologies
- Recommends specialized agents based on findings
- Always present to scout the codebase

### 6. aichaku-api-architect (NEW)

**Purpose**: API design and documentation specialist **Tools**: Read, Write, Edit **Key Features**:

- Documents all API types (REST, GraphQL, gRPC)
- Generates OpenAPI/Swagger specifications
- Ensures API best practices
- Always present since APIs are fundamental

## Template System Implementation

### Template Hierarchy (CRITICAL - from documentation-agent-plan.md)

```yaml
template_resolution:
  1. user_overrides: ".claude/aichaku/user/templates/{name}.md"
  2. methodology_specific: "docs/methodologies/{methodology}/templates/"
  3. documentation_standard: "docs/standards/documentation/templates/"
  4. built_in_defaults: "Basic templates for missing types"
```

### Missing Template Handling

1. Agent detects missing template type
2. Generates appropriate template based on standard
3. Saves to user templates directory
4. Notifies user of creation

## Version Control Strategy (from documentation-agent-plan.md)

### Document Versioning Format

```markdown
---
version: "2025-07-27 added authentication endpoints"
author: "From git commit metadata"
---

# Document content...

## Change Control

- **Version 2025-07-27**: added authentication endpoints
- **Version 2025-07-26**: initial API documentation
```

### Version Format Rules

- Format: `YYYY-MM-DD-NN description`
- NN: Serial number for multiple updates per day
- Description: Brief change summary

## Documentation Lifecycle Workflow

### During Development

```
docs/projects/active/{project-name}/
├── architecture-decisions.md    # From doc standard template
├── api-reference.md            # From doc standard template
├── security-review.md          # From methodology template
├── implementation-guide.md     # From methodology template
└── {other-artifacts}.md        # As needed
```

### At Project Completion

1. **Trigger Detection**
   - User: "This project is complete"
   - STATUS.md marked complete
   - Orchestrator detects signal

2. **Documentation Review**
   - Documenter scans existing central docs
   - Analyzes project artifacts
   - Proposes merge strategy

3. **User Approval**
   - Present merge plan to user
   - Allow edits/rejection
   - No automatic destructive actions

4. **Merge Execution**
   - Execute approved merges
   - Update version tracking
   - Maintain change control

5. **Auto-generation**
   - Run `deno doc` if applicable
   - Update API references
   - Refresh navigation

## Agent Communication Patterns

### Delegation Format (Pure YAML - No XML)

Use clean YAML structure in agent frontmatter:

```yaml
delegations:
  - trigger: Project complete
    target: aichaku-documenter
    handoff: "Generate and merge docs for: {project-name}"
examples:
  - context: User needs feature development
    user: "Build an authentication system"
    assistant: "I'll coordinate this with the orchestrator"
    commentary: Shows when this agent should be used
```

**Note**: Avoid XML tags in YAML. Use pure YAML arrays and objects for cleaner, more maintainable agent definitions.

### Context Management

Each agent loads only what it needs:

- Base context: ~2000 tokens (core directives)
- Per methodology: ~1500 tokens (only active)
- Per standard: ~800 tokens (only selected)
- Total typical: ~4000 tokens vs current ~12000

## YAML Injection Process

### For Methodology-Aware Agents

1. Read selected standards/methodologies from .claude/aichaku/aichaku.json
2. Extract relevant sections (summary + critical rules)
3. Inject into agent templates during generation
4. Generate agents with "aichaku-" prefix
5. Install to project's .claude/agents/ directory

### Injection Points

- Security standards → security-reviewer
- Documentation standards → documenter
- Active methodologies → methodology-coach
- All standards → orchestrator (for routing)

## Implementation Phases

### Phase 1: Core Infrastructure (IMMEDIATE)

- [ ] Create aichaku-orchestrator agent with delegation patterns
- [ ] Enhance aichaku-documenter with merge capabilities
- [ ] Add delegation frontmatter to existing agents
- [ ] Test basic agent invocation and routing

### Phase 2: Template Infrastructure

- [ ] Audit existing templates in docs/methodologies/*/templates/
- [ ] Audit existing templates in docs/standards/documentation/templates/
- [ ] Identify missing documentation templates
- [ ] Create user override directory structure
- [ ] Implement template resolution logic

### Phase 3: Integration Logic

- [ ] Build merge strategy logic in documenter
- [ ] Implement version tracking system (frontmatter + Change Control)
- [ ] Add conflict detection and user prompts
- [ ] Create documentation lifecycle automation

### Phase 4: Commands & Tools

- [ ] Implement /merge-docs slash command (if possible)
- [ ] Add manual trigger: `aichaku merge-docs --project={name}`
- [ ] Create status checking commands
- [ ] Build template management commands

### Phase 5: Development Agents (FUTURE)

- [ ] aichaku-code-archaeologist (first priority)
- [ ] aichaku-code-reviewer
- [ ] aichaku-api-architect
- [ ] Technology-specific experts based on user needs

## Technical Implementation Details

### Agent File Structure

```
.claude/agents/               # Local to each project
├── aichaku-orchestrator.md   # color: yellow (aichaku brand)
├── aichaku-security-reviewer.md  # color: red
├── aichaku-methodology-coach.md  # color: green
├── aichaku-documenter.md     # color: blue
├── aichaku-code-explorer.md  # color: magenta
└── aichaku-api-architect.md  # color: cyan
```

**Note**: Agents are installed to the project's `.claude/agents/` folder, NOT the home directory. This ensures aichaku
agents only affect the current project.

### Configuration Structure

```typescript
interface AichakuConfig {
  version: string;
  installedAt: string;
  installationType: "global" | "local";
  lastUpgrade: string;

  // Standards at top level
  standards: {
    version: string;
    selected: string[];
    customStandards?: Record<string, unknown>;
  };

  // Methodologies as sibling to standards
  methodologies: {
    selected: string[]; // Currently active methodologies (usually just one)
    default?: string; // Default for new projects
  };

  // Future: agent configuration
  agents?: {
    enabled: string[];
    customizations?: Record<string, unknown>;
  };
}
```

### Agent Generation Call (already implemented)

```typescript
// In integrate.ts
const agentResult = await generateMethodologyAwareAgents({
  selectedMethodologies: selectedMethodology ? [selectedMethodology] : [],
  selectedStandards: allSelectedStandards,
  outputPath: join(Deno.cwd(), ".claude", "agents"), // Local project directory
  agentPrefix: "aichaku-",
});
```

### Configuration Location

All settings stored in `.claude/aichaku/aichaku.json`:

```json
{
  "version": "0.35.7",
  "installedAt": "2025-07-17T05:45:12.083Z",
  "installationType": "local",
  "lastUpgrade": "2025-07-20T05:15:48.702Z",
  "standards": {
    "version": "0.31.3",
    "selected": ["nist-csf", "tdd", "..."],
    "customStandards": {}
  },
  "methodologies": {
    "selected": ["shape-up"]
  }
}
```

- No separate `active-methodologies.yaml` file needed
- Methodologies and standards are sibling nodes

## Key Principles (MUST FOLLOW)

1. **Simplicity First**: No complex state tracking or locking mechanisms
2. **User Control**: Never auto-delete or auto-merge without approval
3. **Template Reuse**: Use existing docs/ infrastructure
4. **Quality Focus**: All docs must pass markdownlint checks
5. **Clear Communication**: Simple delegation patterns only
6. **Extensibility**: Easy to add new agents later

## Success Criteria

- [ ] Context reduced from ~12,000 to ~4,000 tokens
- [ ] Professional documentation generated during development
- [ ] Seamless merge of project docs to central documentation
- [ ] Version tracking provides clear audit trail
- [ ] Selected standards and methodologies properly followed
- [ ] User maintains full control over all operations
- [ ] System integrates with existing quality infrastructure

## Next Immediate Steps

1. **Create aichaku-orchestrator.md** in .claude/agents/ (project local)
2. **Enhance existing agents** with delegation patterns and colors
3. **Test multi-agent workflow** with a simple scenario
4. **Implement documenter merge logic**
5. **Create first documentation merge test**

## Important Notes

- Agent files use "aichaku-" prefix for namespacing
- Agents installed to PROJECT's .claude/agents/ (not home directory)
- Each agent needs a color field (ANSI colors: red, green, yellow, blue, magenta, cyan)
  - Note: Yellow is closest to aichaku's orange brand color
- Omit tools line for "all tools" access
- Configuration in .claude/aichaku/aichaku.json (not active-methodologies.yaml)
- Agents work behind-the-scenes (no direct user interaction)
- Delegation patterns in frontmatter drive communication
- User can override any template or agent behavior
- Start with MVP, expand based on actual usage
