# How to Configure Your Aichaku Project

This guide shows you how to configure Aichaku for your specific needs. Each section addresses a specific configuration task.

## Configure project settings

Edit your project's settings in `.claude/settings.local.json`:

```json
{
  "selectedStandards": [
    "owasp-web",
    "solid",
    "tdd",
    "conventional-commits"
  ],
  "methodology": "shape-up",
  "customPaths": {
    "output": ".claude/output",
    "templates": ".claude/templates"
  }
}
```

This file controls:
- Which coding standards Claude follows
- Your primary methodology (for documentation)
- Where files are created

## Add or remove coding standards

### Add standards to your project

```bash
# Add security and testing standards
aichaku standards --add owasp-web,tdd,test-pyramid

# Add development practices
aichaku standards --add solid,conventional-commits
```

### Remove standards you don't need

```bash
# Remove a single standard
aichaku standards --remove test-pyramid

# Remove multiple standards
aichaku standards --remove solid,bdd
```

### View your active standards

```bash
# List only selected standards
aichaku standards --list --selected

# Show all available standards
aichaku standards --list
```

## Customize methodology templates

### Edit existing templates

Navigate to your methodology's template directory:

```bash
cd .claude/methodologies/scrum/templates/
```

Edit any template to match your team's needs:

```markdown
<!-- In sprint-planning.md -->
# Sprint Planning - ${TEAM_NAME}

Sprint Duration: **3 weeks** <!-- Changed from 2 weeks -->
Team Velocity: **45 points** <!-- Your team's actual velocity -->

## Sprint Goal
[Your custom sprint goal format]

## Selected Items
[Your custom backlog format]
```

### Add custom templates

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

### Use templates from multiple methodologies

Copy templates from other methodologies:

```bash
# Use Shape Up's pitch template in a Scrum project
cp ~/.claude/methodologies/shape-up/templates/pitch.md \
   .claude/methodologies/scrum/templates/

# Use Kanban's flow metrics in Shape Up
cp ~/.claude/methodologies/kanban/templates/flow-metrics.md \
   .claude/methodologies/shape-up/templates/
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
```
"Run the deploy command"
"Show me the test coverage"
```

## Configure git hooks

### Install pre-commit hooks

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

### Add to your project documentation

Update your README.md:

```markdown
## Setup

Enable git hooks for automatic formatting:
```bash
git config core.hooksPath .githooks
```
```

## Use environment variables

### Set Aichaku environment variables

```bash
# Override home directory location
export AICHAKU_HOME="$HOME/.config/aichaku"

# Set default methodology
export AICHAKU_DEFAULT_METHODOLOGY="scrum"

# Enable debug output
export AICHAKU_DEBUG="true"

# Custom templates directory
export AICHAKU_TEMPLATES="/path/to/custom/templates"
```

### Add to your shell configuration

```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export AICHAKU_DEFAULT_METHODOLOGY="shape-up"' >> ~/.zshrc
echo 'export AICHAKU_DEBUG="false"' >> ~/.zshrc
source ~/.zshrc
```

## Create custom standards

### Add company-specific standards

```bash
# Create custom category
mkdir -p ~/.claude/standards/company

# Create coding standard
cat > ~/.claude/standards/company/api-design.md << 'EOF'
# Company API Design Standards

## RESTful Endpoints
- Use nouns for resources: `/users`, `/products`
- Use HTTP verbs correctly: GET, POST, PUT, DELETE
- Version APIs: `/api/v1/users`

## Response Format
```json
{
  "data": {},
  "meta": {
    "timestamp": "2025-07-10T10:00:00Z",
    "version": "1.0"
  }
}
```

## Error Handling
- Use proper HTTP status codes
- Include error details in response body
- Log all 5xx errors
EOF

# Add to your project
aichaku standards --add company/api-design
```

## Set up team configurations

### Share configurations across team

Create a team configuration repository:

```bash
# In your team's config repo
mkdir team-aichaku-config
cd team-aichaku-config

# Add team standards
mkdir -p standards/team
cp ~/.claude/standards/company/* standards/team/

# Add team templates
mkdir -p methodologies/team-scrum
cp -r ~/.claude/methodologies/scrum/* methodologies/team-scrum/
# Customize templates for your team

# Create setup script
cat > setup.sh << 'EOF'
#!/bin/bash
echo "Setting up team Aichaku configuration..."
cp -r standards/* ~/.claude/standards/
cp -r methodologies/* ~/.claude/methodologies/
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

### Install MCP server for real-time analysis

```bash
# Install MCP server
cd ~/.claude
git clone https://github.com/RickCogley/aichaku.git
cd aichaku/mcp-server
deno cache src/server.ts
```

### Add to Claude Desktop settings

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
        "~/.claude/aichaku/mcp-server/src/server.ts"
      ]
    }
  }
}
```

## Debug configuration issues

### Check current configuration

```bash
# Validate installation
aichaku doctor

# Show current settings
cat .claude/settings.local.json

# List all methodology files
find .claude/methodologies -name "*.md" | head -20

# Check which standards are injected
grep -A 5 "Selected Standards" .claude/CLAUDE.md
```

### Reset configuration

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

### For enterprise teams

```bash
# Initialize with security focus
aichaku init
aichaku standards --add nist-csf,owasp-web,solid,tdd

# Add custom security templates
mkdir -p .claude/methodologies/security-review/templates
# Add threat modeling templates
```

### For startups

```bash
# Initialize with speed focus
aichaku init
aichaku standards --add conventional-commits,tdd

# Use lean methodology
echo '{"methodology": "lean"}' > .claude/settings.local.json
```

### For open source projects

```bash
# Initialize with collaboration focus
aichaku init
aichaku standards --add conventional-commits,solid,google-style

# Add contributing templates
cp templates/CONTRIBUTING.md .claude/methodologies/core/templates/
```

## Next steps

- Read the [Configuration Reference](../reference/configuration-options.md) for all options
- Learn about [Using MCP with Multiple Projects](../how-to/use-mcp-with-multiple-projects.md)
- Explore [Core Concepts](../explanation/core-concepts.md)