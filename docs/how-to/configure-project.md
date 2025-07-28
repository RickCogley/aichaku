# How to Configure Your Aichaku Project

Step-by-step guide to set up and configure Aichaku for your project.

## Prerequisites

Before configuring your project, you need:

- Aichaku CLI installed globally
- Basic understanding of your project's needs
- Command-line access to your project directory

If you haven't installed Aichaku yet, see the [main README](../../README.md) for installation instructions.

## Installation Workflow

Follow this exact sequence to set up Aichaku in your project:

### 1. Install Aichaku globally

First, install the Aichaku CLI and global components:

```bash
# Install Aichaku CLI globally
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Initialize global Aichaku (installs methodologies, standards, MCP servers)
aichaku init --global
```

This installs:

- Core methodologies in `~/.claude/aichaku/methodologies/`
- Built-in standards in `~/.claude/aichaku/standards/`
- MCP server components
- Template library

### 2. Initialize your project

Navigate to your project and initialize Aichaku:

```bash
cd your-project
aichaku init
```

**New in v0.36.0+**: During initialization, you'll be prompted to select which methodologies to use:

```bash
? Select methodologies to use (space to select, enter to confirm)
❯ ◉ shape-up    - Fixed time, variable scope (6-week cycles)
  ◯ scrum       - Sprint-based iterative development
  ◉ kanban      - Visual workflow management
  ◯ xp          - Extreme Programming practices
  ◯ lean        - Build-measure-learn cycles
  ◯ scrumban    - Hybrid sprint + flow approach
```

This creates:

- `.claude/aichaku/` directory structure
- Basic project configuration files
- Links to global Aichaku installation
- **Only includes selected methodologies** in your CLAUDE.md (reduces context by 70%)

### 3. Add standards to your project

Select the coding standards you want Claude to follow:

```bash
# Add security and development standards
aichaku standards --add owasp-web,solid,tdd

# Add documentation standards
aichaku standards --add conventional-commits,google-style

# View available standards
aichaku standards --list

# View your selected standards
aichaku standards --list --selected
```

Selected standards are stored in `.claude/aichaku/aichaku.json`.

### 4. Integrate with Claude Code

Update your project's `CLAUDE.md` file with your configuration:

```bash
aichaku integrate
```

This automatically adds your selected standards and methodology to `CLAUDE.md` in a compact yaml block, so Claude Code
can pull your project's preferences into context.

### 5. Generate Merged Documentation (Optional)

**New in v0.36.0+**: Create unified documentation that blends your selected methodologies:

```bash
aichaku merge-docs
```

This generates comprehensive guides in `docs/merged/`:

- `planning-guide.md` - Blended planning approaches from your methodologies
- `execution-guide.md` - Combined execution practices
- `improvement-guide.md` - Unified improvement strategies

The guides intelligently merge content from only the methodologies you selected during init.

## Working with Standards

### Add or remove standards

```bash
# Add additional standards
aichaku standards --add test-pyramid,bdd

# Remove standards you don't need
aichaku standards --remove bdd

# Reset to specific standards only
aichaku standards --set owasp-web,solid,tdd,conventional-commits
```

### View standard details

```bash
# Show details about a specific standard
aichaku standards --show owasp-web

# List all available standards by category
aichaku standards --list --by-category
```

### Custom standards

Create organization-specific standards:

```bash
# Create a new custom standard
aichaku standards --create-custom "Company API Guidelines"

# Add it to your project
aichaku standards --add custom:company-api-guidelines

# Edit existing custom standard
aichaku standards --edit-custom company-api-guidelines
```

Custom standards are stored in `~/.claude/aichaku/user/standards/`.

## Choose Your Methodology

Set your primary development methodology:

```bash
# Set methodology (optional - defaults to shape-up)
aichaku init --methodology scrum

# Change methodology later
aichaku integrate --methodology kanban
```

Available methodologies:

- `shape-up` - Fixed time, variable scope (default)
- `scrum` - Sprint-based development
- `kanban` - Continuous flow
- `lean` - Experiment-driven development
- `xp` - Extreme programming practices
- `scrumban` - Hybrid scrum/kanban

## Configuration Files

After setup, your project contains:

```
your-project/
├── .claude/
│   ├── aichaku/
│   │   ├── aichaku.json            # Your selected standards
│   │   └── doc-standards.json      # Documentation preferences
│   └── CLAUDE.md                   # Updated with your config
```

Note: The actual standards library is installed globally at `~/.claude/aichaku/docs/standards/` during initial setup and
refreshed when you run `aichaku upgrade --global`.

### Standards configuration

`.claude/aichaku/aichaku.json` contains:

```json
{
  "selected": [
    "owasp-web",
    "solid",
    "tdd",
    "conventional-commits"
  ],
  "custom": [
    "company-api-guidelines"
  ],
  "updated": "2025-07-24T10:00:00Z"
}
```

### Updated CLAUDE.md

`aichaku integrate` adds configuration to your `CLAUDE.md`:

```yaml
# Added by aichaku integrate
aichaku:
  version: 0.35.7
  behavioral_directives:
  discussion_first:
    name: Discussion-First Document Creation
    description: A three-phase approach to thoughtful project creation
      ...
  standards:
    - owasp-web
    - solid
    - tdd
    - conventional-commits
    - custom:company-api-guidelines
  methodology: shape-up
```

## MCP Server Integration

The MCP server is installed globally and provides real-time code review capabilities.

### Verify MCP installation

```bash
# Check if MCP server is running
aichaku mcp status

# Test MCP functionality
aichaku mcp test
```

### Configure Claude Desktop

The MCP server should auto-configure, but you can manually add it to Claude Desktop:

```json
{
  "mcpServers": {
    "aichaku-reviewer": {
      "command": "deno",
      "args": [
        "run",
        "--allow-all",
        "/Users/[username]/.claude/aichaku/mcp-server/src/server.ts"
      ]
    }
  }
}
```

## Team Collaboration

### Share configuration

Commit your configuration files to share with your team:

```bash
git add .claude/aichaku/aichaku.json .claude/CLAUDE.md
git commit -m "feat: add Aichaku project configuration"
```

### Team setup

New team members run:

```bash
# Install Aichaku globally (if not already installed)
aichaku init --global

# Initialize in existing project (reads committed config)
aichaku init

# Standards and methodology are automatically loaded from committed files
```

## Troubleshooting

### Check installation

```bash
# Verify global installation
aichaku --version
ls ~/.claude/aichaku/

# Verify project setup
ls .claude/aichaku/
cat .claude/aichaku/aichaku.json
```

### Common issues

**Standards not loading in Claude:**

```bash
# Re-run integration
aichaku integrate --force
```

**MCP server not working:**

```bash
# Reinstall MCP components
aichaku init --global --force
```

**Configuration conflicts:**

```bash
# Reset project configuration
rm -rf .claude/aichaku/
aichaku init
```

### Get help

```bash
# Show help for any command
aichaku --help
aichaku standards --help
aichaku integrate --help

# Use "learn" to learn about the standards
aichaku learn
aichaku learn "shape up"
```

## Next Steps

- Review [MCP Server Documentation](../MCP-SERVER.md) for advanced features
- Learn about [Custom Standards](./manage-custom-standards.md)
- Explore [Core Concepts](../explanation/core-concepts.md)
- See [Configuration Reference](../reference/configuration-options.md) for all options

---

*Created: 2025-07-24* *Last updated: 2025-07-24* *Standard: Universal (applies to all methodologies)*
