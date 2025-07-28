# Aichaku Architecture

This document explains the architectural design of Aichaku, focusing on the "why" behind key decisions.

## The fundamental distinction

Aichaku's architecture reflects a core insight about software development: teams need different types of guidance for
different aspects of their work.

### Methodologies are holistic workflows

When you adopt Shape Up, you're not just using a planning template - you're embracing an entire philosophy about how to
build software. You need:

- The shaping process to define work
- The betting table to prioritize
- The six-week cycles to execute
- The cool-down periods to reflect

This is why Aichaku copies entire methodology directories. You can't do "half of Shape Up" any more than you can bake
half a cake.

### Standards are modular guidelines

In contrast, coding standards are independent modules. You can:

- Use OWASP security practices without adopting a security methodology
- Apply TDD without following XP
- Write conventional commits in any workflow

This is why standards are selectively integrated - you pick what applies to your context.

## Architectural layers

### User interface layer

Aichaku provides two primary interfaces:

**CLI interface**: Direct commands for setup and configuration

- Simple, memorable commands (`init`, `integrate`, `standards`)
- Consistent flags across commands
- Clear error messages that guide users

**Claude interface**: Natural language through methodology detection

- No commands to memorize
- Context-aware responses
- Progressive disclosure of complexity

### Command layer

Commands reflect the methodology/standards distinction:

**Bulk operations** (methodologies):

- `init`: Copies complete methodology packages
- `integrate`: Injects behavioral rules into CLAUDE.md

**Selective operations** (standards):

- `standards --add`: Cherry-picks specific standards
- `standards --remove`: Removes individual standards

This separation makes the conceptual model clear through the interface.

### Core services layer

Three essential services power Aichaku:

**Installer service**: Handles bulk copying of methodologies

- Validates source and destination paths
- Preserves directory structure
- Manages file permissions

**Injector service**: Manages selective standard integration

- Parses CLAUDE.md safely
- Preserves user customizations
- Updates standard content blocks

**Lister service**: Discovers available resources

- Scans methodology directories
- Categorizes standards
- Provides metadata

### Data layer

The file system serves as Aichaku's database:

**Why files instead of a database?**

1. **Transparency**: Users can see and edit everything
2. **Version control**: Git tracks all changes naturally
3. **Portability**: No dependencies or migration issues
4. **Claude compatibility**: Direct file access for the AI

**Directory structure as schema**:

```text
.claude/
├── methodologies/    # Bulk resources (complete packages)
├── standards/        # Selective resources (individual files)
└── output/          # User work (generated content)
```

## Integration architecture

### Claude integration philosophy

Aichaku enhances Claude through structure, not restriction:

1. **Persistent memory**: Projects live in predictable locations
2. **Visual language**: Consistent emoji indicators
3. **Natural triggers**: Keyword detection for modes
4. **Progressive enhancement**: Complexity only when needed
5. **Focused expertise**: Sub-agents provide specialized knowledge

### Sub-Agent Architecture

Aichaku employs specialized sub-agents to manage context and provide focused expertise:

**Core Agents**:

- **Orchestrator**: General workflow coordinator
- **Security Reviewer**: OWASP and security best practices
- **Documenter**: Documentation generation and lifecycle
- **Methodology Coach**: Adaptive methodology guidance
- **Code Explorer**: Codebase discovery and analysis
- **API Architect**: API design and documentation

**Technology Experts**:

- Language specialists (TypeScript, Python, Go, etc.)
- Framework experts (React, Deno, Tailwind, etc.)
- Tool specialists (PostgreSQL, Lume, Vento, etc.)

**Context Management**:

- Each agent maintains focused context (~4K tokens vs 12K)
- Agents delegate to each other for specialized tasks
- Orchestrator coordinates multi-agent workflows
- Methodology-aware loading reduces irrelevant context

### The two-phase approach

**Phase 1: Discussion**

- Triggered by methodology keywords
- No file creation
- Exploratory conversation
- Idea refinement

**Phase 2: Creation**

- Explicit user signal required
- Immediate file generation
- No confirmation prompts
- Clear status reporting

This respects user autonomy while providing structure.

### MCP server architecture

The Model Context Protocol server provides real-time analysis:

```text
Claude <-> MCP Server <-> Review Engine
                      <-> Standards Manager
                      <-> Methodology Manager
```

This optional enhancement layer adds:

- Live security scanning
- Standards compliance checking
- Methodology adherence validation

## Security architecture

### Principle of least privilege

Every operation requests only necessary permissions:

- Read: Only from Aichaku directories
- Write: Only to designated output paths
- Execute: Only for git operations
- Network: Never required

### Defense in depth

Multiple security layers protect users:

1. **Input validation**: All paths sanitized
2. **Path containment**: No directory traversal
3. **Safe defaults**: Conservative permissions
4. **Explicit operations**: No automatic execution

### Offline by design

Aichaku requires no network access:

- All resources bundled
- No telemetry or tracking
- No external dependencies
- Complete airgap compatibility

## Performance architecture

### Optimization strategies

**Lazy loading**: Resources loaded only when needed

- Methodologies scanned on demand
- Standards read during integration
- Templates cached after first use

**Efficient operations**:

- Batch file operations when possible
- Stream large files instead of loading
- Async I/O for non-blocking operations

**Memory management**:

- Clear caches between operations
- Limit concurrent file handles
- Stream output for large results

## Agent architecture

### Agent Template System

Agents are defined through structured templates that specify:

```yaml
name: aichaku-{agent-name}
description: Agent's specialized focus
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
methodology_aware: true|false
examples:
  - context: When to use this agent
    user: "Example user question"
    assistant: "How the agent responds"
delegations:
  - trigger: When to hand off
    target: Which agent to delegate to
```

### Agent Coordination

**Orchestrator Pattern**: The orchestrator agent serves as a general coordinator, routing tasks to appropriate
specialists based on the work context.

**Delegation Flow**:

1. User request analyzed by current agent
2. Agent identifies need for specialized knowledge
3. Delegation to target agent with context
4. Results flow back through chain

**Context Isolation**: Each agent maintains its own context window, preventing contamination and allowing focused
expertise.

### Agent Benefits

**Performance**: 70% reduction in context usage enables longer sessions **Expertise**: Deep, focused knowledge in
specific domains **Scalability**: New agents added without affecting existing ones **Flexibility**: Agents composed for
complex workflows

## Extension architecture

### Adding methodologies

New methodologies follow a simple pattern:

1. Create directory in `/methodologies/`
2. Add `[METHODOLOGY]-AICHAKU-GUIDE.md`
3. Include `/templates/` subdirectory
4. Provide mode-specific templates

The system automatically discovers and integrates new methodologies.

### Adding standards

Standards are even simpler:

1. Choose appropriate category directory
2. Create Markdown file with standard content
3. Follow the established template format

No registration or configuration needed.

### Adding agents

New agents follow the template pattern:

1. Create directory in `/core/agent-templates/`
2. Add `base.md` with YAML frontmatter
3. Include 10+ idiomatic code examples
4. Define delegation patterns

Agents are automatically available to Claude Code.

### Future plugin system

The architecture supports future extensions:

```typescript
interface AichakuPlugin {
  name: string;
  version: string;
  methodologies?: MethodologyDefinition[];
  standards?: StandardDefinition[];
  commands?: CommandDefinition[];
  hooks?: HookDefinition[];
}
```

This would enable:

- Third-party methodologies
- Custom commands
- Workflow automation
- Tool integrations

## Design decisions

### Why copy all methodologies?

**The problem**: Teams need flexibility to adapt their process, but setting up new methodologies creates friction.

**The solution**: Copy all methodologies during initialization.

**Trade-offs**:

- ✅ Zero friction to try new approaches
- ✅ Works completely offline
- ✅ Supports methodology mixing
- ❌ Uses more disk space (~300KB)
- ❌ Creates more files in repositories

**Why it's worth it**: The flexibility gained far outweighs the minimal disk usage. Teams can experiment freely without
setup overhead.

### Why inject standards into CLAUDE.md?

**The problem**: Claude needs consistent access to coding standards, but reading multiple files impacts performance.

**The solution**: Selected standards are injected directly into CLAUDE.md.

**Trade-offs**:

- ✅ Single file for Claude to read
- ✅ Fast performance
- ✅ User can customize injected content
- ❌ Larger CLAUDE.md files
- ❌ Potential sync issues with source

**Why it's worth it**: Performance and customization benefits outweigh the maintenance considerations.

### Why enforce directory structure?

**The problem**: Flexible paths create complexity for automation and Claude integration.

**The solution**: Enforce the `.claude/` directory convention.

**Trade-offs**:

- ✅ Predictable file locations
- ✅ Reliable automation
- ✅ Clear project boundaries
- ❌ Less flexibility
- ❌ May conflict with some workflows

**Why it's worth it**: Consistency enables powerful automation and reduces cognitive load.

## Architectural principles

### Simplicity over features

Every feature must justify its complexity:

- Three modes instead of complex state machines
- File system instead of databases
- Copying instead of linking
- Keywords instead of commands

### Explicit over implicit

Users should understand what's happening:

- Clear phase transitions
- Visible file operations
- Obvious status indicators
- No hidden behavior

### Flexibility through structure

Structure enables rather than constrains:

- All methodologies available
- Standards mixed freely
- Templates customizable
- Workflows adaptable

### Human-centric design

Optimize for human understanding:

- Natural language interfaces
- Visual progress indicators
- Predictable organization
- Clear error messages

## Future architectural considerations

### Potential optimizations

**Symlinks for methodologies**: Reduce disk usage by linking to global cache

- Saves space in projects
- Complicates Windows support
- May break with some tools

**Incremental standard updates**: Update only changed standards

- Reduces update time
- Adds complexity
- Requires version tracking

**Lazy methodology loading**: Fetch methodologies on first use

- Minimal initial footprint
- Requires network access
- Complicates offline use

### Scaling considerations

The current architecture scales well for:

- Hundreds of projects
- Dozens of standards
- Multiple methodologies
- Large teams

Potential bottlenecks at scale:

- File system operations with thousands of projects
- CLAUDE.md size with many standards
- Discovery performance with many methodologies

These can be addressed if needed without architectural changes.

## Summary

Aichaku's architecture embodies its core philosophy: provide complete methodologies for flexible workflows while
maintaining focused standards for code quality. Every architectural decision supports this distinction, creating a
system that's both powerful and simple to understand.

The file-based approach may seem primitive compared to modern databases, but it provides transparency, portability, and
compatibility that more complex systems struggle to match. Sometimes the simple solution is the right solution.
