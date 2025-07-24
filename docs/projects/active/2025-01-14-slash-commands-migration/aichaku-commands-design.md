# Aichaku Slash Commands Management Design

## Overview

After successfully migrating personal slash commands to the new Markdown format, we should consider adding slash command
management to Aichaku itself. This would allow users to install, manage, and share slash commands through the Aichaku
CLI.

## Current State Analysis

### What Works Well

- Individual Markdown files are easy to edit and version
- YAML frontmatter provides structure and permissions
- Directory organization by category makes sense
- File-based approach allows git versioning

### Gaps for Aichaku Integration

- No installation mechanism for shared commands
- No version management for command updates
- No way to distribute commands with methodologies
- No conflict resolution between user and global commands

## Proposed Aichaku Commands System

### Command Locations Hierarchy

```
~/.claude/commands/                    # User's personal commands
├── aichaku/                          # Aichaku-provided commands
├── security/                         # User's security commands
└── custom/                           # User's custom commands

~/.claude/aichaku/commands/           # Aichaku-managed commands
├── global/                           # Built-in Aichaku commands
│   ├── methodology/
│   ├── security/
│   └── project/
└── user/                             # User customizations
    ├── methodology/
    └── custom/

{project}/.claude/aichaku/commands/   # Project-specific commands
├── project-specific/
└── team-shared/
```

### CLI Commands

#### `aichaku commands list`

```bash
# List all available commands
aichaku commands list

# List by category
aichaku commands list --category methodology
aichaku commands list --category security

# List by scope
aichaku commands list --scope global
aichaku commands list --scope user
aichaku commands list --scope project
```

#### `aichaku commands install`

```bash
# Install command from Aichaku registry
aichaku commands install security/owasp-check

# Install from URL
aichaku commands install https://github.com/user/repo/commands/my-command.md

# Install from local file
aichaku commands install ./my-command.md --category custom
```

#### `aichaku commands create`

```bash
# Create new command interactively
aichaku commands create my-command

# Create with template
aichaku commands create my-command --template methodology

# Create in specific category
aichaku commands create my-command --category security --scope user
```

#### `aichaku commands remove`

```bash
# Remove user command
aichaku commands remove my-command

# Remove from specific category
aichaku commands remove security/my-security-check
```

#### `aichaku commands update`

```bash
# Update all Aichaku-managed commands
aichaku commands update

# Update specific command
aichaku commands update security/owasp-check

# Update from source
aichaku commands update my-command --source https://...
```

### Command Metadata Format

Extend the YAML frontmatter to include Aichaku-specific metadata:

```yaml
---
# Standard Claude Code fields
allowed-tools: Read, Write, Bash
description: OWASP security checklist

# Aichaku-specific fields
aichaku:
  version: "1.0.0"
  category: "security"
  methodology: ["shape-up", "scrum"] # Which methodologies this applies to
  author: "Rick Cogley"
  source: "https://github.com/RickCogley/aichaku-commands"
  dependencies: ["aichaku:memin"] # Commands this depends on
  keywords: ["security", "owasp", "checklist"]
  license: "MIT"

# Installation metadata
install:
  scope: "global" # global, user, project
  auto-update: true
  conflicts: ["old-security-check"]
---
```

### Built-in Aichaku Commands

Commands that ship with Aichaku:

#### Methodology Commands

```
/aichaku:shape-up    # Create Shape Up pitch
/aichaku:scrum       # Create sprint planning
/aichaku:kanban      # Create kanban board
/aichaku:checkpoint  # Create session checkpoint
```

#### Project Commands

```
/aichaku:init        # Initialize Aichaku project
/aichaku:status      # Show project status
/aichaku:review      # Review project structure
/aichaku:cleanup     # Clean legacy files
```

#### Memory Commands

```
/aichaku:memin       # Load memory files
/aichaku:standards   # Show selected standards
/aichaku:config      # Show configuration
```

### Command Registry

Create a simple registry for sharing commands:

```
~/.claude/aichaku/registry/
├── index.json                 # Command catalog
├── security/
│   ├── owasp-check.md
│   └── infosec-commit.md
├── methodology/
│   ├── shape-up-pitch.md
│   └── scrum-retro.md
└── development/
    ├── preflight.md
    └── git-hooks.md
```

### Integration with Methodologies

Commands can be bundled with methodology installations:

```typescript
// In methodology definition
{
  "name": "shape-up",
  "version": "1.0.0",
  "commands": [
    "methodology/shape-up-pitch.md",
    "methodology/betting-table.md",
    "project/cool-down.md"
  ]
}
```

### Conflict Resolution

Handle conflicts between command sources:

1. **Precedence Order**:
   - Project-specific commands (highest)
   - User commands
   - Aichaku global commands (lowest)

2. **Namespace Resolution**:
   - `/user:command` - Force user version
   - `/global:command` - Force global version
   - `/project:command` - Force project version

3. **Version Management**:
   - Track command versions
   - Show when updates available
   - Allow pinning specific versions

### Command Sharing

Enable sharing commands between team members:

```bash
# Export project commands
aichaku commands export --output team-commands.zip

# Import team commands
aichaku commands import team-commands.zip --scope project

# Sync with git repository
aichaku commands sync --repo https://github.com/team/aichaku-commands
```

### Implementation Phases

#### Phase 1: Basic Command Management (v0.30.0)

- `aichaku commands list`
- `aichaku commands create`
- Basic command metadata support
- Install built-in Aichaku commands

#### Phase 2: Installation & Updates (v0.31.0)

- `aichaku commands install`
- `aichaku commands update`
- Command registry system
- Conflict resolution

#### Phase 3: Sharing & Collaboration (v0.32.0)

- `aichaku commands export/import`
- Git-based command sharing
- Team command synchronization
- Command dependencies

#### Phase 4: Advanced Features (v1.0.0)

- Command templates
- Interactive command builder
- Command analytics
- Marketplace/registry

### Configuration

Add to `aichaku.json`:

```json
{
  "commands": {
    "enabled": true,
    "autoUpdate": true,
    "registryUrl": "https://registry.aichaku.dev",
    "userCommandsPath": "~/.claude/commands",
    "scopePrecedence": ["project", "user", "global"],
    "defaultCategory": "custom"
  }
}
```

## Benefits

1. **Standardization**: Consistent command format across users
2. **Sharing**: Easy distribution of useful commands
3. **Methodology Integration**: Commands bundled with methodologies
4. **Version Management**: Track and update commands
5. **Team Collaboration**: Share project-specific commands
6. **Discoverability**: Central registry of available commands

## Challenges

1. **Complexity**: More complex than simple file-based approach
2. **Maintenance**: Need to maintain command registry
3. **Security**: Need to validate command content
4. **Compatibility**: Ensure commands work across Claude versions
5. **User Experience**: Balance simplicity with power

## Recommendation

Start with Phase 1 in Aichaku v0.30.0 to provide basic command management. This would:

- Install built-in Aichaku commands during `aichaku init`
- Provide `aichaku commands list` for discovery
- Allow `aichaku commands create` for custom commands
- Set foundation for future sharing features

The file-based approach works well, but adding Aichaku management would make commands more discoverable and shareable
across the community.
