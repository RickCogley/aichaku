# aichaku (愛着)

> Adaptive methodology support for Claude Code that blends approaches based on how you naturally work

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Documentation](https://img.shields.io/badge/API_docs-deno.dev-blue)](https://aichaku.esolia.deno.net/)

## 🚀 Quick Start (for the impatient)

Don't want to read the docs? Just run this:

```bash
# Install Aichaku globally from JSR
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Set up everything
aichaku init --global    # One-time global setup
cd your-project
aichaku init            # Add to your project
aichaku integrate       # Tell Claude about it

# Start using with Claude!
# Say: "I need to plan a new feature"
# Claude will use Aichaku automatically
```

That's it! Aichaku is now helping Claude understand your development workflow. Read on for details, or jump to
[full documentation](https://github.com/RickCogley/aichaku/tree/main/docs).

## What is aichaku?

Aichaku (愛着 - "affection/attachment") provides adaptive methodology support for Claude Code. Install once globally,
use everywhere. Rather than forcing you to choose a single methodology, aichaku provides all of them and helps Claude
Code blend approaches based on your natural language. Say "sprint" and get Scrum practices; mention "shaping" and get
Shape Up principles - all seamlessly integrated.

## 🆕 What's New in v0.39.0+

### 🌸 Development Principles System

**Timeless philosophies for thoughtful development** - 18 built-in principles across 4 categories that guide thinking
without being prescriptive:

- Select principles that resonate with your development philosophy
- Principles work alongside methodologies and standards
- Interactive learning with `aichaku learn`
- Agent awareness - all specialists consider your selected principles
- Compatibility checking to avoid conflicting approaches

## 🆕 What's New in v0.36.0+

### 🤖 Sub-Agent System

**Revolutionary context management** - Specialized agents that maintain their own focused context windows, enabling long
development sessions without losing continuity:

- **Security Reviewer** - OWASP Top 10 and NIST-CSF compliance checking
- **API Architect** - RESTful, GraphQL, and gRPC API design
- **Documenter** - Automated documentation generation and maintenance
- **Code Explorer** - Codebase discovery and architecture analysis
- **Methodology Coach** - Adaptive guidance based on your chosen methodologies
- **Orchestrator** - General workflow coordinator that routes tasks to appropriate specialists

### 💻 Technology Expert Agents

**Language-specific expertise** with 10+ idiomatic code examples each:

- **TypeScript Expert** - Advanced TypeScript patterns and best practices
- **Python Expert** - Pythonic code with type hints and modern patterns
- **Go Expert** - Idiomatic Go with proper error handling and concurrency
- **React Expert** - Modern React patterns, hooks, and performance optimization
- **Deno Expert** - Deno-specific APIs and security model
- **Tailwind Expert** - Utility-first CSS with component patterns
- **PostgreSQL Expert** - Advanced SQL, performance tuning, and best practices
- **Lume Expert** - Static site generation with Deno
- **Vento Expert** - Template engine patterns and optimizations

### 🎯 Methodology Selection & Merging

**Choose your methodologies** and Aichaku intelligently merges their guidance:

```bash
# During init, select which methodologies to use:
aichaku init
? Select methodologies to use (space to select, enter to confirm)
❯ ◉ shape-up    - Fixed time, variable scope
  ◯ scrum       - Sprint-based iterative development
  ◉ kanban      - Visual workflow management
  ◯ xp          - Extreme Programming practices
```

- **Smart Merging** - Selected methodologies are intelligently combined in your CLAUDE.md
- **Context-Aware** - Agents load methodology-specific guidance dynamically
- **Reduced Context** - Only includes what you actually use (70% reduction: 12K→4K tokens)

## 📚 Documentation & Resources

### 🎯 Interactive Methodology Guides (with Mermaid Diagrams)

- [**Shape Up Guide**](https://github.com/RickCogley/aichaku/blob/main/docs/methodologies/shape-up/shape-up.md) - 6-week
  cycles with interactive workflow diagrams
- [**Scrum Guide**](https://github.com/RickCogley/aichaku/blob/main/docs/methodologies/scrum/scrum.md) - Sprint planning
  with visual process flows
- [**Kanban Guide**](https://github.com/RickCogley/aichaku/blob/main/docs/methodologies/kanban/kanban.md) - Flow
  visualization and WIP limits

### 📖 Complete Documentation

- [**Full Documentation Hub**](https://github.com/RickCogley/aichaku/tree/main/docs) - Comprehensive guides, tutorials,
  and reference materials
- [**API Documentation**](https://aichaku.esolia.deno.net/) - Complete TypeScript API reference
- [**How-to Guides**](https://github.com/RickCogley/aichaku/tree/main/docs/how-to) - Task-specific instructions and
  workflows
- [**Reference Materials**](https://github.com/RickCogley/aichaku/tree/main/docs/reference) - Technical specifications
  and options

### 🔗 Quick Links

📦 **[JSR Package](https://jsr.io/@rick/aichaku)** | 🐙 **[GitHub Repository](https://github.com/RickCogley/aichaku)**

**✨ Key Features:**

- 🌍 **Global install, works everywhere** - One-time setup, all projects benefit
- 📝 **Automatic session summaries** - Never lose context with automatic checkpoint creation
- 🎯 **Adaptive blending** - Methodologies adapt to your language
- 🔄 **All methodologies included** - Shape Up, Scrum, Kanban, XP, Lean, Scrumban
- 🧠 **Context-aware** - AI responds to your terminology and needs
- 📁 **Clean projects** - No methodology file duplication
- 🚀 **Simple lifecycle** - Just init, integrate, upgrade, and uninstall

## Installation Details

### Recommended: One-line installer

```bash
# Install and initialize everything with one command:
deno run -A https://rickcogley.github.io/aichaku/init.ts
```

This single command will:

- Install the Aichaku CLI globally
- Set up global methodologies
- Optionally initialize your current project

### Alternative: Manual installation

```bash
# If you prefer explicit steps:
deno install -g --allow-read --allow-write --allow-env --allow-net --allow-run -n aichaku jsr:@rick/aichaku/cli
aichaku init --global
aichaku init
```

## 🔧 YAML Configuration System

**The Revolutionary Core of Aichaku:** Aichaku transforms how Claude Code directives are created and maintained through
a groundbreaking YAML-based "configuration as code" approach.

### The Problem with Traditional Approaches

- **Massive files**: Traditional CLAUDE.md files can exceed 50KB of repetitive content
- **Difficult maintenance**: Changes require updating multiple large files
- **No modularity**: Everything hardcoded in monolithic Markdown files
- **Version drift**: Different projects with different versions of the same guidance

### Aichaku's Solution: 96% Size Reduction

```yaml
# Instead of 50KB+ of hardcoded markdown, you get modular YAML:
aichaku:
  version: "0.29.0"
  source: "configuration-as-code"

behavioral_directives:
  discussion_first:
    phases:
      - name: "DISCUSSION MODE"
        triggers: ["shape", "sprint", "kanban", "mvp"]
        actions:
          required:
            - "Acknowledge methodology context"
            - "Ask clarifying questions"
          forbidden:
            - "DO NOT create documents yet"
```

### How the Magic Works

1. **Modular YAML Files**: Core behaviors, methodologies, and standards defined in separate, focused YAML files
2. **Dynamic Assembly**: When you run `aichaku integrate`, the system reads multiple YAML sources and assembles a
   complete configuration
3. **Smart Merging**: Base configuration + methodology-specific + project overrides = perfectly tailored guidance
4. **Single Source of Truth**: Update one YAML file, and all projects benefit from improvements

### Configuration Hierarchy

```
~/.claude/aichaku/config/
├── core.yaml              # Base Aichaku behaviors
├── methodologies/
│   ├── shape-up.yaml       # Shape Up specific guidance
│   ├── scrum.yaml          # Scrum specific guidance
│   ├── kanban.yaml         # Kanban specific guidance
│   └── common.yaml         # Cross-methodology patterns
└── standards/
    ├── security.yaml       # OWASP, NIST security standards
    └── development.yaml    # TDD, Clean Architecture, etc.
```

**Project Overrides** (optional):

```
your-project/.claude/aichaku/
├── overrides.yaml          # Project-specific customizations
└── local-standards.yaml    # Additional standards for this project
```

### Real-World Impact

**Before Aichaku:**

- ❌ 50KB+ CLAUDE.md files
- ❌ Copy-paste methodology content between projects
- ❌ Manual updates across multiple files
- ❌ Inconsistent guidance between projects

**After Aichaku:**

- ✅ ~2KB dynamically generated directives
- ✅ Methodology content shared from global installation
- ✅ One-command updates across all projects
- ✅ Consistent, version-controlled guidance

### Customization Made Simple

Want to customize for your organization? Create project-specific overrides:

```yaml
# .claude/aichaku/overrides.yaml
aichaku:
  project_name: "My Custom Project"

directives:
  visual_identity:
    prefix: "🚀 MyProject:" # Custom prefix instead of Aichaku

  methodology_detection:
    custom_method:
      triggers: ["our-process", "company-way"]
      documents: ["company-process.md"]
```

Run `aichaku integrate --force` and your CLAUDE.md is regenerated with your customizations merged seamlessly.

### The Technical Architecture

The YAML system enables unprecedented flexibility:

- **Version Control**: All configurations are versioned and tracked
- **Inheritance**: Projects inherit from global, override selectively
- **Validation**: YAML schemas ensure configuration correctness
- **Modularity**: Mix and match methodologies, standards, and behaviors
- **Maintenance**: Update once, deploy everywhere

This isn't just a configuration system—it's a paradigm shift that makes Claude Code directives maintainable, consistent,
and powerful.

[Learn more about YAML configuration →](https://github.com/RickCogley/aichaku/blob/main/docs/how-to/configure-yaml-directives.md)

## How It Works

Aichaku uses a simple **3-mode system** that adapts to your context:

### 📋 Planning Mode

When you say "let's plan" or "what should we build", Claude Code helps you define work using the best methodology for
your context.

### 🔨 Execution Mode

When you say "let's build" or "start coding", Claude Code guides development with appropriate constraints (sprints, WIP
limits, etc).

### 📊 Improvement Mode

When you say "how are we doing" or "retrospective", Claude Code measures progress and suggests concrete improvements.

## Usage Examples

### Adaptive Blending

```text
You: "Let's plan our next sprint, but I want to shape this feature properly"
Claude: [Blends Scrum structure with Shape Up shaping]
        "I'll help you shape the feature first, then fit it into your sprint.
         Let's start with the problem definition and appetite..."
```

### Natural Language Detection

```text
You: "We need a kanban board for tracking our 6-week cycle"
Claude: [Detects Kanban + Shape Up terminology]
        "I'll create a Kanban board structured around your Shape Up cycle.
         We'll use swimlanes for different bets and track progress visually."
```

### Team Vocabulary

```text
You: "Time for our daily standup to check the backlog"
Claude: [Recognizes Scrum ceremony + general terms]
        "Let's run through the standup format:
         - What did you complete yesterday?
         - What will you work on today?
         - Any blockers?"
```

## Included Methodologies

| Methodology  | Best For            | Key Concept                |
| ------------ | ------------------- | -------------------------- |
| **Shape Up** | Feature development | Fixed time, variable scope |
| **Scrum**    | Team coordination   | Sprints and ceremonies     |
| **Kanban**   | Continuous flow     | WIP limits and pull        |
| **XP**       | Code quality        | TDD and pairing            |
| **Lean**     | Validation          | Build-measure-learn        |
| **Scrumban** | Hybrid teams        | Sprint planning + flow     |

## Lifecycle Commands

### Help System

```bash
# Learn about a specific methodology
aichaku help shape-up
aichaku help scrum

# List all available methodologies
aichaku help --list

# Compare methodologies side-by-side
aichaku help --compare
```

### Initialize

```bash
# First time: Install global methodologies
aichaku init --global

# Per project: Create minimal setup
aichaku init
# → Creates .claude/user/ for customizations
# → Prompts to add Aichaku to CLAUDE.md
# → No methodology files copied!

# Preview what would happen
aichaku init --dry-run
```

### Upgrading

**⚠️ Important**: Aichaku has TWO components that need separate upgrades:

1. **The CLI tool** (`aichaku` command) - The executable in your PATH
2. **The global files** (`~/.claude/aichaku/`) - Methodologies and configuration

#### Complete Upgrade Process

```bash
# Step 1: Upgrade the CLI tool
deno cache --reload jsr:@rick/aichaku/cli && deno install -g -A -n aichaku --force jsr:@rick/aichaku/cli

# Step 2: Verify CLI version
aichaku --version

# Step 3: Upgrade global files to match CLI version
aichaku upgrade --global

# Step 4: Upgrade each project
cd your-project
aichaku upgrade
```

#### Understanding Version Mismatches

You might see different versions in different places:

```bash
# CLI version (the tool itself)
aichaku --version  # e.g., v0.27.0

# Global installation version (methodologies & config)
cat ~/.claude/aichaku/config.json  # might show v0.25.0

# Project version (what the project expects)
cat .claude/aichaku/aichaku.config.json  # might show different versions
```

This happens because:

- The CLI tool can be upgraded independently
- Global files need a separate upgrade command
- Projects track which versions they were created with

#### Quick Upgrade (Everything)

```bash
# One-liner to upgrade both CLI and global files
deno cache --reload jsr:@rick/aichaku/cli && deno install -g -A -n aichaku --force jsr:@rick/aichaku/cli && aichaku upgrade --global
```

#### Upgrade Details

**CLI Tool Upgrade:**

- Updates the `aichaku` command itself
- Gets new features and bug fixes
- Required before upgrading global files

**Global Files Upgrade (`aichaku upgrade --global`):**

- Updates methodologies in `~/.claude/aichaku/`
- Updates global configuration
- Downloads new methodology content
- Preserves your customizations

**Project Upgrade (`aichaku upgrade`):**

- Updates project's CLAUDE.md
- Syncs with latest methodology references
- Updates project configuration

### Uninstall

```bash
# Remove from current project
aichaku uninstall

# Remove global installation
aichaku uninstall --global
```

### Cleanup Legacy Files

```bash
# Remove old Aichaku files from legacy locations
aichaku cleanup

# Preview what would be removed
aichaku cleanup --dry-run
```

This removes old files from `~/.claude/` after upgrading to the new structure.

### Integrate

```bash
# Add Aichaku reference to current project's CLAUDE.md
aichaku integrate

# Preview what would be added
aichaku integrate --dry-run

# Force add even if already present
aichaku integrate --force
```

### Merge Documentation (v0.36.0+)

```bash
# Merge selected methodologies into comprehensive documentation
aichaku merge-docs

# Creates unified guides that blend your chosen methodologies:
# - docs/merged/planning-guide.md
# - docs/merged/execution-guide.md
# - docs/merged/improvement-guide.md

# Only includes content from methodologies you've selected
```

### Hooks - Automate Your Workflow

**⭐ Featured: Automatic Session Summaries**

Aichaku automatically creates structured summaries of your Claude Code sessions! Never lose context when conversations
are compacted or ended.

- ✅ **Automatic** - Runs on conversation end and compaction
- 📄 **Structured** - Consistent Markdown format with key sections
- 📅 **Timestamped** - Easy to find and reference later
- 📋 **Organized** - Saved to `docs/checkpoints/` directory

Claude Code hooks allow you to run scripts at various points in Claude's lifecycle, such as before/after tool use, at
conversation end, or during compaction.

```bash
# See what hooks are available
aichaku hooks --list

# Show currently installed hooks
aichaku hooks --show

# Install essential hooks (recommended)
aichaku hooks --install essential --global

# Install to current project only
aichaku hooks --install essential --local

# Install specific hooks
aichaku hooks --install conversation-summary,code-review --local

# Uninstall specific hooks
aichaku hooks --uninstall path-validator --global

# Validate installed hooks are working
aichaku hooks --validate
```

**Available Hook Categories:**

- **Essential** (4 hooks): Must-haves for Claude+Aichaku workflow
  - `conversation-summary`: **Saves session summaries automatically** ⭐
  - `path-validator`: Ensures Aichaku project structure
  - `status-updater`: Updates STATUS.md automatically
  - `code-review`: Reviews code changes

- **Productivity** (4 hooks): Workflow enhancers
  - `template-validator`: Checks document templates
  - `diagram-generator`: Creates Mermaid diagrams
  - `progress-tracker`: Tracks project progress
  - `commit-validator`: Enforces conventional commits

- **Security** (2 hooks): Compliance and safety checks
  - `owasp-checker`: OWASP security validation
  - `sensitive-file-guard`: Prevents accidental secrets

- **GitHub** (5 hooks): GitHub integration and automation
  - `todo-tracker`: Scans TODOs and suggests issues
  - `pr-checker`: Validates PR readiness
  - `issue-linker`: Links commits to issues
  - `workflow-monitor`: Monitors GitHub Actions
  - `release-helper`: Assists with releases

**Important:** Restart Claude Code after installing/removing hooks for changes to take effect.

### Standards - Development Guidelines

Browse and manage development standards that guide Claude's responses:

```bash
# List all available standards
aichaku standards --list

# Search for specific standards
aichaku standards --search "security"

# Add standards to your project
aichaku standards --add NIST-CSF,TDD,CLEAN-ARCH

# View a specific standard
aichaku standards --view OWASP-WEB

# Show currently selected standards
aichaku standards --show

# Copy standard content to clipboard
aichaku standards --copy GOOGLE-STYLE
```

**Available Standard Categories:**

- **Security**: OWASP, NIST-CSF, GDPR, PCI-DSS
- **Architecture**: 15-Factor, DDD, Clean Architecture, Microservices
- **Development**: TDD, BDD, Test Pyramid, Conventional Commits
- **Style**: Google Style Guides, API Design, Documentation
- **Metrics**: DORA, Code Quality, Performance

Standards are automatically included in your CLAUDE.md when selected.

### Principles - Development Philosophies

🆕 **New in v0.39.0!** Guide your development with timeless principles that shape thinking and decision-making:

```bash
# List all available principles
aichaku principles --list

# Filter by category
aichaku principles --list --category software-development

# Show detailed information about a principle
aichaku principles --show dry
aichaku principles --show unix-philosophy --verbose

# Select principles for your project
aichaku principles --add dry,kiss,yagni,unix-philosophy

# Check principle compatibility
aichaku principles --compatibility kiss,yagni

# View currently selected principles
aichaku principles --current

# Interactive learning
aichaku learn --principles
aichaku learn dry
```

**Available Principle Categories:**

- **💻 Software Development** (6): DRY, KISS, YAGNI, SOLID, Unix Philosophy, Separation of Concerns
- **🏢 Organizational** (3): Agile Manifesto, Lean Principles, Conway's Law
- **⚙️ Engineering** (4): Fail Fast, Defensive Programming, Robustness Principle, Premature Optimization
- **👥 Human-Centered** (5): Accessibility First, Privacy by Design, User-Centered Design, Inclusive Design, Ethical
  Design

Unlike prescriptive standards, principles provide gentle guidance that helps maintain consistency in approach and
mindset. They work alongside your selected methodologies and standards to create a comprehensive development philosophy.

### Help Examples

```bash
# Get quick overview of all methodologies
aichaku help --list

# Learn when to use Shape Up vs Scrum
aichaku help --compare

# Deep dive into a specific methodology
aichaku help kanban
# Shows key concepts, best/not ideal for, and quick start tips
```

### Programmatic Usage

```typescript
import { help, init, integrate } from "jsr:@rick/aichaku";

// Initialize global methodologies
await init({
  global: true,
});

// Initialize project
await init({
  projectPath: "./my-project",
});

// Add to CLAUDE.md
await integrate({
  projectPath: "./my-project",
});
```

## MCP Server Features

**⚠️ CRITICAL CONFIGURATION NOTE**: Installing MCP servers via Aichaku does NOT automatically make them available to
Claude Code. You MUST configure them in Claude Code's MCP system separately. See
[MCP Configuration Guide](https://github.com/RickCogley/aichaku/blob/main/docs/how-to/configure-mcp-servers.md) for
details.

Aichaku includes an enhanced Model Context Protocol (MCP) server that provides intelligent project analysis and
documentation generation capabilities directly within Claude Desktop.

### HTTP/SSE Server for Code Review (v0.25.0+)

The HTTP/SSE server provides a bridge between the `aichaku review` command and the Aichaku Code Reviewer MCP server.
This allows multiple Claude Code instances to share a single MCP server for code review operations:

```bash
# Start the HTTP/SSE bridge server
aichaku mcp --start-server

# Check server status
aichaku mcp --server-status

# Now use the review command - it will use the HTTP server automatically
aichaku review file.ts

# Stop the server when done
aichaku mcp --stop-server
```

**What it does:**

- Bridges between CLI review commands and the MCP Code Reviewer
- Allows multiple users/instances to share one MCP server
- Provides real-time streaming of review results
- Runs on port 7182 (AICHAKU on phone keypad)

**Benefits:**

- More efficient resource usage (one server for all)
- Faster response times (no startup overhead)
- Works across network (not just local)
- Firewall-friendly HTTP protocol

See [MCP Server Documentation](https://github.com/RickCogley/aichaku/blob/main/docs/MCP-SERVER.md) for details.

### Available MCP Tools

#### 1. **Project Analysis** (`analyze_project`)

Performs comprehensive analysis of your codebase:

- Detects programming languages and frameworks
- Analyzes project structure and patterns
- Identifies architectural decisions
- Provides insights on code organization
- Suggests improvements based on best practices

```bash
# Example usage in Claude Desktop:
"Analyze this project's architecture and suggest improvements"
```

#### 2. **Documentation Template Creation** (`create_doc_template`)

Generates context-aware documentation templates:

- README templates tailored to your project type
- API documentation structures
- Architecture decision records (ADRs)
- Contributing guidelines
- Change logs and release notes

```bash
# Example usage in Claude Desktop:
"Create a README template for this TypeScript project"
"Generate an API documentation template"
```

#### 3. **Automated Documentation Generation** (`generate_documentation`)

Creates comprehensive documentation from your codebase:

- Auto-generates API documentation from code comments
- Creates architecture diagrams and descriptions
- Produces setup and installation guides
- Generates usage examples from tests
- Creates feature documentation from code structure

```bash
# Example usage in Claude Desktop:
"Generate complete documentation for this project"
"Create API docs for the authentication module"
```

### Statistics and Analytics

The MCP server tracks usage statistics to help you understand how Aichaku is being used:

- **Tool usage frequency**: Which tools are used most often
- **Success rates**: How often operations complete successfully
- **Performance metrics**: Response times and processing duration
- **Error tracking**: Common issues and their resolutions

Statistics are stored locally and can be viewed with:

```bash
# View MCP server statistics
aichaku stats

# Reset statistics
aichaku stats --reset
```

### Aichaku Branding and Feedback

All MCP server responses include:

- **🪴 Aichaku branding**: Visual indicator that the response comes from Aichaku
- **Contextual feedback**: Progress updates during long operations
- **Success confirmations**: Clear indication when tasks complete
- **Error guidance**: Helpful messages when issues occur

### Setting Up MCP Server

1. **Install the MCP servers** (included with Aichaku):

```bash
# The MCP servers are automatically installed with Aichaku
aichaku init --global
aichaku mcp --install
```

2. **Configure Claude Code**: Use the `claude mcp` command to add the servers:

```bash
# Add servers with user scope (recommended - available across all projects)
claude mcp add -s user aichaku-reviewer ~/.aichaku/mcp-servers/aichaku-code-reviewer
claude mcp add -s user github-operations ~/.aichaku/mcp-servers/github-operations

# Verify they're configured
claude mcp list
```

**Scope Options:**

- `-s user` (recommended): Available across all your projects
- `-s local`: Private to you in current project only
- `-s project`: Shared with everyone in the project

3. **Restart Claude Code**: The MCP tools will be available with `mcp**` prefix.

### Example Workflows

#### Complete Project Documentation

```text
You: "Analyze this project and generate complete documentation"
Claude: [Uses analyze_project] 🪴 Aichaku: Analyzing project structure...
        [Uses generate_documentation] 🪴 Aichaku: Generating documentation...

        I've analyzed your TypeScript project and generated comprehensive documentation:
        - README with setup instructions
        - API documentation for all public methods
        - Architecture overview with diagrams
        - Contributing guidelines
```

#### Methodology-Aware Documentation

```text
You: "Create a Shape Up pitch document template for this feature"
Claude: [Uses create_doc_template] 🪴 Aichaku: Creating Shape Up pitch template...

        I've created a pitch template that includes:
        - Problem definition section
        - Appetite constraints
        - Solution outline
        - Rabbit holes to avoid
        - Nice-to-haves
```

#### Continuous Documentation Updates

```text
You: "Update the API docs after adding the new authentication endpoints"
Claude: [Uses generate_documentation] 🪴 Aichaku: Updating API documentation...

        I've updated the documentation with:
        - New authentication endpoints
        - Request/response examples
        - Error codes and handling
        - Integration examples
```

## Architecture

### Global Installation (One Time)

```
~/.claude/
├── methodologies/          # All methodology files live here
│   ├── core/              # Universal modes
│   │   ├── PLANNING-MODE.md
│   │   ├── EXECUTION-MODE.md
│   │   └── IMPROVEMENT-MODE.md
│   ├── shape-up/
│   ├── scrum/
│   └── [other methodologies...]
├── user/                  # Global customizations
└── .aichaku.json         # Global metadata
```

### Project Integration (Per Project)

```
project/
├── CLAUDE.md             # Contains reference to global Aichaku
└── .claude/              # Optional, only if customizations needed
    ├── user/             # Project-specific overrides
    └── .aichaku-project  # Project marker file
```

**Key Point**: Methodologies are NEVER copied to projects - they're referenced from the global installation. This keeps
your git repositories clean!

## User Customization

The `user/` directory is yours to customize how Aichaku works for your team:

- **prompts/**: Override or extend AI behavior
- **templates/**: Add your organization's document templates
- **methods/**: Define custom practices or terminology

All customizations are preserved during upgrades. See `user/README.md` after installation for detailed examples.

## Commands (Optional)

While aichaku works best with natural language, shortcuts are available:

- `/plan` - Activate planning mode
- `/build` - Start execution mode
- `/review` - Check improvements
- `/shape` - Shape Up specific
- `/sprint` - Scrum specific
- `/kanban` - Show board

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/RickCogley/aichaku.git
cd aichaku

# Setup git hooks for automatic formatting
git config core.hooksPath .githooks
```

### Commands

```bash
# Run tests
deno task test

# Type check
deno task check

# Format code (automatic with git hook)
deno task fmt

# Lint code
deno task lint

# Create release
deno task release:patch
```

## Philosophy

Traditional methodology tools force you to adapt to them. Aichaku reverses this - it helps Claude Code adapt to you.
Whether you're a solo developer, startup team, or enterprise group, aichaku provides just enough process to be helpful
without getting in the way.

## Migrating from v0.4.x

If you're upgrading from v0.4.x, the architecture has significantly improved:

**What's Changed:**

- Methodologies now live globally only (no more project duplication)
- Projects only contain customizations, not methodology files
- Much cleaner git repositories
- Better command output with no redundancy

**Migration Steps:**

1. **Update the CLI tool:**

```bash
deno install -g --allow-read --allow-write --allow-env --allow-net --allow-run -n aichaku --force jsr:@rick/aichaku/cli
```

2. **Keep your global installation** (if you have one):

```bash
# No changes needed to ~/.claude/
```

3. **Clean up existing projects:**

```bash
# In each project that has aichaku:
rm -rf .claude/methodologies .claude/.aichaku.json
# Keep .claude/user/ if you have customizations
```

4. **Re-initialize projects:**

```bash
aichaku init
# This will create the new minimal structure
```

Your customizations in `.claude/user/` are preserved!

## Why "aichaku"?

愛着 (aichaku) means developing attachment or affection for something over time. We chose this name because good
development practices should feel natural and become something you're attached to, not forced to follow.

## Future Roadmap

- [x] Core 3-mode system
- [x] 6 major methodologies
- [x] Adaptive methodology blending
- [x] User customization system
- [x] MCP server integration
- [x] Project analysis tools
- [x] Documentation generation
- [x] Usage statistics tracking
- [ ] Methodology lock for compliance
- [ ] Advanced analytics dashboard
- [ ] Organization templates
- [ ] Additional IDE integrations

## API Documentation

For detailed API documentation, visit [https://aichaku.esolia.deno.net/](https://aichaku.esolia.deno.net/)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Rick Cogley

---

<p align="center">
  <i>Made with 愛着 - Bringing affection to your development workflow</i>
</p>
