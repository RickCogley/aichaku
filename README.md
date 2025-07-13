# aichaku (愛着)

> Adaptive methodology support for Claude Code that blends approaches based on
> how you naturally work

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Documentation](https://img.shields.io/badge/API_docs-deno.dev-blue)](https://aichaku.esolia.deno.net/)

## 🚀 Quick Start (for the impatient)

Don't want to read the docs? Just run this:

```bash
# Install Aichaku globally from JSR
deno install -A -n aichaku jsr:@rick/aichaku/cli.ts

# Set up everything
aichaku init --global    # One-time global setup
cd your-project
aichaku init            # Add to your project
aichaku integrate       # Tell Claude about it

# Start using with Claude!
# Say: "I need to plan a new feature"
# Claude will use Aichaku automatically
```

That's it! Aichaku is now helping Claude understand your development workflow.
Read on for details, or jump to [full documentation](docs/README.md).

## What is aichaku?

Aichaku (愛着 - "affection/attachment") provides adaptive methodology support
for Claude Code. Install once globally, use everywhere. Rather than forcing you
to choose a single methodology, aichaku provides all of them and helps Claude
Code blend approaches based on your natural language. Say "sprint" and get Scrum
practices; mention "shaping" and get Shape Up principles - all seamlessly
integrated.

📚 **[API Documentation](https://aichaku.esolia.deno.net/)** | 📦
**[JSR Package](https://jsr.io/@rick/aichaku)** | 🐙
**[GitHub](https://github.com/RickCogley/aichaku)**

**✨ Key Features:**

- 🌍 **Global install, works everywhere** - One-time setup, all projects benefit
- 🎯 **Adaptive blending** - Methodologies adapt to your language
- 🔄 **All methodologies included** - Shape Up, Scrum, Kanban, XP, Lean,
  Scrumban
- 🧠 **Context-aware** - AI responds to your terminology and needs
- 📁 **Clean projects** - No methodology file duplication
- 🚀 **Simple lifecycle** - Just init, integrate, upgrade, and uninstall

## Installation Details

### Recommended: One-line installer

```bash
# Install and initialize everything with one command:
deno run -A https://rickcogley.github.io/aichaku/docs/init.ts
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

## How It Works

Aichaku uses a simple **3-mode system** that adapts to your context:

### 📋 Planning Mode

When you say "let's plan" or "what should we build", Claude Code helps you
define work using the best methodology for your context.

### 🔨 Execution Mode

When you say "let's build" or "start coding", Claude Code guides development
with appropriate constraints (sprints, WIP limits, etc).

### 📊 Improvement Mode

When you say "how are we doing" or "retrospective", Claude Code measures
progress and suggests concrete improvements.

## Usage Examples

### Adaptive Blending

```
You: "Let's plan our next sprint, but I want to shape this feature properly"
Claude: [Blends Scrum structure with Shape Up shaping]
        "I'll help you shape the feature first, then fit it into your sprint.
         Let's start with the problem definition and appetite..."
```

### Natural Language Detection

```
You: "We need a kanban board for tracking our 6-week cycle"
Claude: [Detects Kanban + Shape Up terminology]
        "I'll create a Kanban board structured around your Shape Up cycle.
         We'll use swimlanes for different bets and track progress visually."
```

### Team Vocabulary

```
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

#### Global CLI

```bash
# Recommended: Upgrade from JSR (matches Quick Start)
deno install -A -n aichaku --force jsr:@rick/aichaku/cli

# Alternative: Use the init script (with feedback)
deno run -A https://rickcogley.github.io/aichaku/docs/init.ts --force

# Verify what version you have
aichaku --version
```

#### Update Projects

After upgrading the global CLI:

```bash
# In each project, run upgrade to get latest methodologies and update CLAUDE.md
aichaku upgrade

# This automatically:
# - Downloads all updated methodology files
# - Updates CLAUDE.md with latest integration
# - Preserves your user customizations
```

#### Global Methodologies

```bash
# Update global methodology files to latest version
aichaku upgrade --global

# This automatically downloads all new and updated methodology files
# Your user customizations in ~/.claude/user/ are always preserved
```

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

### Hooks - Automate Your Workflow

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

# Remove all Aichaku hooks
aichaku hooks --remove --global
```

**Available Hook Sets:**
- **Essential** (4 hooks): Must-haves for Claude+Aichaku workflow
- **Productivity** (4 hooks): Workflow enhancers
- **Security** (2 hooks): Compliance and safety checks

**Important:** Restart Claude Code after installing/removing hooks for changes to take effect.

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

Aichaku includes an enhanced Model Context Protocol (MCP) server that provides
intelligent project analysis and documentation generation capabilities directly
within Claude Desktop.

### NEW: HTTP/SSE Server Mode (v0.25.0+)

Run a shared MCP server that multiple Claude Code instances can connect to:

```bash
# Start the HTTP/SSE server
aichaku mcp --start-server

# Check server status
aichaku mcp --server-status

# Review files (automatically uses HTTP server if running)
aichaku review file.ts

# Stop the server
aichaku mcp --stop-server
```

**Benefits:**

- More efficient resource usage
- Faster response times (no startup overhead)
- Shared state across multiple Claude Code instances
- Real-time streaming of results

See [MCP Server Documentation](docs/MCP-SERVER.md) for details.

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

The MCP server tracks usage statistics to help you understand how Aichaku is
being used:

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

1. **Install the MCP server** (included with Aichaku):

```bash
# The MCP server is automatically installed with Aichaku
aichaku init --global
```

2. **Configure Claude Desktop**: Add to your Claude Desktop configuration
   (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "aichaku": {
      "command": "deno",
      "args": [
        "run",
        "--allow-read",
        "--allow-write",
        "--allow-net",
        "--allow-env",
        "/path/to/aichaku/mcp/aichaku-mcp-server/src/server.ts"
      ],
      "env": {
        "AICHAKU_HOME": "~/.claude/aichaku"
      }
    }
  }
}
```

3. **Verify installation**: Restart Claude Desktop and look for Aichaku tools in
   the available MCP tools list.

### Example Workflows

#### Complete Project Documentation

```
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

```
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

```
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

**Key Point**: Methodologies are NEVER copied to projects - they're referenced
from the global installation. This keeps your git repositories clean!

## User Customization

The `user/` directory is yours to customize how Aichaku works for your team:

- **prompts/**: Override or extend AI behavior
- **templates/**: Add your organization's document templates
- **methods/**: Define custom practices or terminology

All customizations are preserved during upgrades. See `user/README.md` after
installation for detailed examples.

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

Traditional methodology tools force you to adapt to them. Aichaku reverses
this - it helps Claude Code adapt to you. Whether you're a solo developer,
startup team, or enterprise group, aichaku provides just enough process to be
helpful without getting in the way.

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
deno install -g --allow-read --allow-write --allow-env --allow-net --allow-run -n aichaku --force jsr:@rick/aichaku@0.5.0/cli
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

愛着 (aichaku) means developing attachment or affection for something over time.
We chose this name because good development practices should feel natural and
become something you're attached to, not forced to follow.

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

For detailed API documentation, visit
[https://aichaku.esolia.deno.net/](https://aichaku.esolia.deno.net/)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Rick Cogley

---

<p align="center">
  <i>Made with 愛着 - Bringing affection to your development workflow</i>
</p>
