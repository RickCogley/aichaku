# How to Configure Your Aichaku Project

## Before you begin

Ensure you have Aichaku installed and initialized in your project. You need:

- Basic understanding of JSON configuration files
- Access to your project's `.claude` directory
- Text editor or command-line access

This guide shows you how to configure Aichaku for your specific needs. Each section addresses a specific configuration
task.

## Solution

Follow these sections to configure different aspects of your Aichaku project. Each provides step-by-step instructions
for specific configuration tasks.

## Configure project settings

Edit your project's settings in `.claude/settings.local.json`:

```json
{
  "selectedStandards": ["owasp-web", "solid", "tdd", "conventional-commits"],
  "methodology": "shape-up",
  "customPaths": {
    "output": ".claude/output",
    "templates": ".claude/templates"
  }
}
```

This file controls:

- Which coding standards Claude follows (including custom standards)
- Your primary methodology (for documentation)
- Where you create files
- Custom standards metadata that you configure at `~/.claude/aichaku/standards.json`

## Add or remove coding standards

## Add standards to your project

```bash
# Add security and testing standards
aichaku standards --add owasp-web,tdd,test-pyramid

# Add development practices
aichaku standards --add solid,conventional-commits
```

## Remove standards you don't need

```bash
# Remove a single standard
aichaku standards --remove test-pyramid

# Remove multiple standards
aichaku standards --remove solid,bdd
```

## View your active standards

```bash
# List only selected standards
aichaku standards --list --selected

# Show all available standards
aichaku standards --list
```

Example output with source paths:

```text
Selected Standards:
✅ owasp-web (OWASP Web Security) 📁 ~/.claude/aichaku/docs/standards/security
✅ solid (SOLID Principles) 📁 ~/.claude/aichaku/docs/standards/architecture
✅ custom:api-design 📁 ~/.claude/aichaku/custom-standards

Available Standards:
  Security:
    - nist-csf (NIST Cybersecurity Framework)
    - owasp-web (OWASP Web Security) ✅
  Architecture:
    - solid (SOLID Principles) ✅
    - clean-architecture (Clean Architecture)
  Custom:
    - api-design (My Organization API Design) ✅
```

## Customize methodology templates

## Edit existing templates

Navigate to your methodology's template directory:

```bash
cd .claude/methodologies/scrum/templates/
```

Edit any template to match your team's needs:

```markdown
<!-- In sprint-planning.md -->

# Sprint Planning - $\{TEAM_NAME\}

Sprint Duration: **3 weeks** <!-- Changed from 2 weeks --> Team Velocity: **45 points**

<!-- Your team's actual velocity -->

## Sprint Goal

[Your custom sprint goal format]

## Selected Items

[Your custom backlog format]
```

## Add custom templates

Create new templates for your team:

```bash
# Create a custom daily standup template
cat > .claude/methodologies/scrum/templates/daily-standup.md << 'EOF'
# Daily Standup - ${DATE}

## Team Updates

### ${TEAM_MEMBER}
- Yesterday:
- Today:
- Blockers:

## Action Items
- [ ]

## Parking Lot
-
EOF
```

## Use templates from multiple methodologies

Copy templates from other methodologies:

```bash
# Use Shape Up's pitch template in a Scrum project
cp "$HOME/.claude/methodologies/shape-up/templates/pitch.md" \
   ".claude/methodologies/scrum/templates/"

# Use Kanban's flow metrics in Shape Up
cp "$HOME/.claude/methodologies/kanban/templates/flow-metrics.md" \
   ".claude/methodologies/shape-up/templates/"
```

## Set up custom commands

Create quick-access commands in `.claude/commands.json`:

```json
{
  "commands": {
    "deploy": "git push && npm run deploy",
    "test": "deno test --coverage",
    "review": "aichaku standards --check",
    "standup": "open .claude/output/active-*/daily-standup.md",
    "metrics": "npm run metrics && open coverage/index.html"
  }
}
```

Use these in Claude:

```text
"Run the deploy command"
"Show me the test coverage"
```

## Configure git hooks

## Install pre-commit hooks

Enable automatic formatting and validation:

```bash
# Create hooks directory
mkdir -p .githooks

# Create pre-commit hook
cat > .githooks/pre-commit << 'EOF'
#!/bin/sh
echo "🎨 Running pre-commit checks..."

# Format code
if [ -f "deno.json" ]; then
  deno fmt
  git add -u
fi

# Run linter
if [ -f "deno.json" ]; then
  deno lint || exit 1
fi

echo "✅ Pre-commit checks complete"
EOF

# Make executable
chmod +x .githooks/pre-commit

# Configure git to use the hooks
git config core.hooksPath .githooks
```

## Add to your project documentation

Update your README.md:

````markdown
## Setup

Enable git hooks for automatic formatting:

```bash
git config core.hooksPath .githooks
```
````

````
## Use environment variables

## Set Aichaku environment variables

```bash
# Override home directory location
export AICHAKU_HOME="$HOME/.config/aichaku"

# Set default methodology
export AICHAKU*DEFAULT*METHODOLOGY="scrum"

# Enable debug output
export AICHAKU_DEBUG="true"

# Custom templates directory
export AICHAKU_TEMPLATES="/path/to/custom/templates"
````

## Add to your shell configuration

```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export AICHAKU*DEFAULT*METHODOLOGY="shape-up"' >> ~/.zshrc
echo 'export AICHAKU_DEBUG="false"' >> ~/.zshrc
source ~/.zshrc
```

## Working with custom standards

Custom standards allow you to define organization-specific coding guidelines that work alongside built-in standards.

## Create a custom standard

```bash
# Create custom standard with template
aichaku standards --create-custom "My Organization API Design"

# Edit the generated template
aichaku standards --edit-custom my-organization-api-design

# Add to your project
aichaku standards --add custom:my-organization-api-design
```

## Example: Mixed standards configuration

```bash
# Add both built-in and custom standards
aichaku standards --add owasp-web,solid,custom:my-organization-api-design

# View current configuration
aichaku standards --list --selected
```

Output shows both types:

```text
✅ owasp-web (OWASP Web Security) 📁 ~/.claude/aichaku/docs/standards/security
✅ solid (SOLID Principles) 📁 ~/.claude/aichaku/docs/standards/architecture
✅ custom:my-organization-api-design 📁 ~/.claude/aichaku/custom-standards
```

## Quick overview

1. **Create** - Generate template with `--create-custom`
2. **Edit** - Modify content with `--edit-custom`
3. **Add** - Include in project with `--add custom:name`
4. **Share** - Export and import across teams

For detailed instructions, see [How to Manage Custom Standards](./manage-custom-standards.md).

## Migration from old structure

If you have custom standards in the old location (`~/.claude/docs/standards/`), migrate them:

```bash
# Run migration command
aichaku standards --migrate-custom

# Old standards are automatically converted to new format
```

See [Migration Guide](../guides/migration-guide.md) for details.

## Set up team configurations

## Share configurations across team

Create a team configuration repository:

```bash
# In your team's config repo
mkdir team-aichaku-config
cd team-aichaku-config

# Add team standards
mkdir -p standards/team
cp "$HOME/.claude/docs/standards/company/"* standards/team/

# Add team templates
mkdir -p methodologies/team-scrum
cp -r "$HOME/.claude/methodologies/scrum/"* methodologies/team-scrum/
# Customize templates for your team

# Create setup script
cat > setup.sh << 'EOF'
#!/bin/bash
echo "Setting up team Aichaku configuration..."
cp -r standards/* "$HOME/.claude/docs/standards/"
cp -r methodologies/* "$HOME/.claude/methodologies/"
echo "✅ Team configuration installed"
EOF

chmod +x setup.sh
```

Team members run:

```bash
git clone team-config-repo
cd team-config-repo
./setup.sh
```

## Configure MCP server

## Install MCP server for real-time analysis

```bash
# Install MCP server
cd ~/.claude/aichaku
git clone https://github.com/RickCogley/aichaku.git
cd aichaku/mcp-server
deno cache src/server.ts
```

## Add to Claude Desktop settings

Edit Claude Desktop's configuration:

```json
{
  "mcpServers": {
    "aichaku-reviewer": {
      "command": "deno",
      "args": [
        "run",
        "--allow-read",
        "--allow-net",
        "${HOME}/.claude/aichaku/mcp-server/src/server.ts"
      ]
    }
  }
}
```

## Debug configuration issues

## Check current configuration

```bash
# Validate installation
aichaku doctor

# Show current settings
cat .claude/settings.local.json
```

Example output with custom standards:

```json
{
  "selectedStandards": [
    "owasp-web",
    "solid",
    "custom:my-organization-api-design"
  ],
  "methodology": "shape-up",
  "customStandards": {
    "my-organization-api-design": {
      "name": "My Organization API Design",
      "path": "~/.claude/aichaku/custom-standards/my-organization-api-design.md",
      "created": "2025-07-11T10:00:00Z"
    }
  }
}
```

```bash
# List all methodology files
find .claude/methodologies -name "*.md" | head -20

# Check which standards you have configured
grep -A 5 "Selected Standards" .claude/CLAUDE.md
```

## Reset configuration

If something goes wrong:

```bash
# Reset project configuration
rm -rf .claude
aichaku init
aichaku standards --add [your-standards]

# Reset global configuration
aichaku uninstall --global
aichaku init --global
```

## Common configuration patterns

## For enterprise teams

```bash
# Initialize with security focus
aichaku init
aichaku standards --add nist-csf,owasp-web,solid,tdd

# Add custom security templates
mkdir -p .claude/methodologies/security-review/templates
# Add threat modeling templates
```

## For startups

```bash
# Initialize with speed focus
aichaku init
aichaku standards --add conventional-commits,tdd

# Use lean methodology
echo '{"methodology": "lean"}' > .claude/settings.local.json
```

## For open source projects

```bash
# Initialize with collaboration focus
aichaku init
aichaku standards --add conventional-commits,solid,google-style

# Add contributing templates
cp templates/CONTRIBUTING.md .claude/methodologies/common/templates/
```

## Next steps

- Read the [Configuration Reference](../reference/configuration-options.md) for all options
- Learn about [Using MCP with Multiple Projects](../how-to/use-mcp-with-multiple-projects.md)
- Explore [Core Concepts](../explanation/core-concepts.md)
