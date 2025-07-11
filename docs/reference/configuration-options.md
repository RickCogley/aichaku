# Configuration Options Reference

Complete reference for all Aichaku configuration options.

## Configuration Files

### settings.local.json

Project-specific configuration file located at `.claude/settings.local.json`.

#### Schema

```typescript
interface AichakuSettings {
  // Selected coding standards
  selectedStandards?: string[];
  
  // Primary methodology (for documentation)
  methodology?: string;
  
  // Custom directory paths
  customPaths?: {
    output?: string;
    templates?: string;
    archive?: string;
  };
  
  // Version compatibility
  version?: string;
  compatibilityMode?: "legacy" | "modern";
  
  // Feature flags
  features?: {
    autoFormat?: boolean;
    strictMode?: boolean;
    verboseOutput?: boolean;
  };
  
  // Team settings
  team?: {
    name?: string;
    velocity?: number;
    cycleLength?: number;
  };
  
  // Custom methodology mixins
  customizations?: {
    borrowed_practices?: Array<{
      from: string;
      practice: string;
      reason: string;
    }>;
  };
}
```

### standards.json

Standards configuration file located at `.claude/aichaku/standards.json`. This file tracks both built-in and custom standards selected for the project.

#### Schema

```typescript
interface StandardsConfig {
  // Built-in standards from the library
  selectedStandards?: string[];
  
  // Custom standards with metadata
  customStandards?: {
    [key: string]: {
      name: string;
      description: string;
      path: string;
      tags: string[];
      createdAt?: string;
      updatedAt?: string;
    }
  };
}
```

#### Example standards.json

```json
{
  "selectedStandards": [
    "nist-csf",
    "tdd",
    "conventional-commits"
  ],
  "customStandards": {
    "team-guidelines": {
      "name": "Team Development Guidelines",
      "description": "Our team's specific coding standards and practices",
      "path": "/Users/user/.claude/aichaku/user/standards/team-guidelines.md",
      "tags": ["custom", "team", "guidelines"],
      "createdAt": "2025-07-11T10:00:00Z",
      "updatedAt": "2025-07-11T10:00:00Z"
    },
    "api-design": {
      "name": "API Design Standards",
      "description": "REST API design patterns and conventions",
      "path": "/Users/user/.claude/aichaku/user/standards/api-design.md",
      "tags": ["custom", "api", "rest", "design"]
    }
  }
}
```

### Migration Notes

If you have an existing installation with the old configuration format:

| Old Path | New Path |
|----------|----------|
| `.claude/.aichaku-standards.json` | `.claude/aichaku/standards.json` |
| `~/.claude/standards/` | `~/.claude/aichaku/standards/` |

Run the migration command to update:

```bash
aichaku migrate
```

This command will:
1. Move standards configuration to the new location
2. Update file paths in the configuration
3. Create the new directory structure
4. Preserve all existing settings

### Example configurations

#### Minimal configuration
```json
{
  "selectedStandards": ["conventional-commits"]
}
```

#### Standard team configuration
```json
{
  "selectedStandards": [
    "nist-csf",
    "tdd",
    "conventional-commits",
    "solid"
  ],
  "methodology": "shape-up",
  "team": {
    "name": "Platform Team",
    "cycleLength": 6
  }
}
```

#### Advanced configuration with custom standards
```json
{
  "selectedStandards": [
    "owasp-web",
    "solid",
    "tdd",
    "test-pyramid",
    "conventional-commits",
    "google-style",
    "custom:team-guidelines",
    "custom:api-design"
  ],
  "methodology": "shape-up",
  "customPaths": {
    "output": ".claude/work",
    "archive": ".claude/completed"
  },
  "features": {
    "autoFormat": true,
    "strictMode": true,
    "verboseOutput": false
  },
  "team": {
    "name": "Alpha Squad",
    "velocity": 45,
    "cycleLength": 6
  },
  "customizations": {
    "borrowed_practices": [
      {
        "from": "scrum",
        "practice": "daily-standup",
        "reason": "Team coordination during building phase"
      },
      {
        "from": "kanban",
        "practice": "wip-limits",
        "reason": "Manage work in progress effectively"
      }
    ]
  }
}
```

## Command-line options

### Global options

Available for all commands:

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--help` | `-h` | Show help information | - |
| `--version` | `-v` | Show version number | - |
| `--quiet` | `-q` | Suppress output | false |
| `--verbose` | | Show detailed output | false |
| `--dry-run` | | Preview changes without applying | false |
| `--force` | `-f` | Override safety checks | false |
| `--project-path` | `-p` | Specify project directory | Current directory |

### init command

Initialize Aichaku in a project or globally.

```bash
aichaku init [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--global` | Initialize in ~/.claude | false |
| `--force` | Overwrite existing installation | false |
| `--dry-run` | Preview what would be created | false |
| `--silent` | Minimal output | false |

### integrate command

Integrate Aichaku rules into CLAUDE.md.

```bash
aichaku integrate [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--global` | Integrate with global CLAUDE.md | false |
| `--force` | Overwrite existing integration | false |
| `--dry-run` | Preview changes | false |
| `--project-path` | Target project directory | Current directory |

### standards command

Manage coding standards.

```bash
aichaku standards [options]
```

| Option | Description | Example |
|--------|-------------|---------|
| `--list` | List standards | `aichaku standards --list` |
| `--add` | Add standards (comma-separated) | `aichaku standards --add tdd,solid` |
| `--remove` | Remove standards | `aichaku standards --remove bdd` |
| `--show` | Display standard content | `aichaku standards --show tdd` |
| `--selected` | With --list, show only selected | `aichaku standards --list --selected` |
| `--categories` | Filter by categories | `aichaku standards --list --categories security,testing` |
| `--search` | Search standards | `aichaku standards --search "test"` |
| `--create-custom` | Create new custom standard | `aichaku standards --create-custom my-standard` |
| `--delete-custom` | Remove custom standard | `aichaku standards --delete-custom my-standard` |
| `--edit-custom` | Open custom standard in editor | `aichaku standards --edit-custom my-standard` |
| `--copy-custom` | Duplicate custom standard | `aichaku standards --copy-custom source-std target-std` |

#### Custom standards usage

Add custom standards with the `custom:` prefix:

```bash
# Add a custom standard to the project
aichaku standards --add custom:my-standard

# Create and add in one command
aichaku standards --create-custom team-guidelines
aichaku standards --add custom:team-guidelines
```

### help command

Get help for commands and methodologies.

```bash
aichaku help [topic]
```

| Topic | Description |
|-------|-------------|
| (none) | General help |
| `<command>` | Help for specific command |
| `<methodology>` | Help for specific methodology |

Examples:
```bash
aichaku help
aichaku help init
aichaku help shape-up
```

### upgrade command

Upgrade Aichaku installation.

```bash
aichaku upgrade [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--check` | Check for updates only | false |
| `--force` | Force upgrade even if up to date | false |
| `--global` | Upgrade global installation | false |

### uninstall command

Remove Aichaku from projects.

```bash
aichaku uninstall [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--global` | Uninstall from ~/.claude | false |
| `--force` | Skip confirmation | false |
| `--project-path` | Target project directory | Current directory |

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AICHAKU_HOME` | Override ~/.claude location | `/opt/aichaku` |
| `AICHAKU_DEFAULT_METHODOLOGY` | Default methodology for new projects | `scrum` |
| `AICHAKU_DEBUG` | Enable debug output | `true` |
| `AICHAKU_TEMPLATES` | Custom templates directory | `/shared/templates` |
| `AICHAKU_SILENT` | Suppress all output | `true` |
| `NO_COLOR` | Disable colored output | `1` |

## File paths

### Global installation

| Path | Purpose |
|------|---------|
| `~/.claude/` | Root directory |
| `~/.claude/methodologies/` | All methodology files |
| `~/.claude/aichaku/standards/` | Built-in standards library |
| `~/.claude/aichaku/user/standards/` | Custom standards directory |
| `~/.claude/output/` | Generated projects |
| `~/.claude/CLAUDE.md` | Global Claude instructions |
| `~/.claude/settings.json` | Global settings (future) |
| `~/.claude/commands.json` | Custom commands |

### Project installation

| Path | Purpose |
|------|---------|
| `.claude/` | Project root |
| `.claude/methodologies/` | Project methodologies |
| `.claude/aichaku/standards/` | Built-in standards (symlinked) |
| `.claude/aichaku/user/standards/` | Custom standards (symlinked) |
| `.claude/aichaku/standards.json` | Standards configuration |
| `.claude/output/` | Project work |
| `.claude/output/active-*/` | Active projects |
| `.claude/output/done-*/` | Completed projects |
| `.claude/.aichaku-project` | Project marker |
| `.claude/settings.local.json` | Project settings |
| `.claude/CLAUDE.md` | Project Claude instructions |
| `.claude/commands.json` | Project commands |

## Methodology options

### Available methodologies

| Methodology | Key | Description |
|-------------|-----|-------------|
| Shape Up | `shape-up` | 6-week cycles, betting, shaping |
| Scrum | `scrum` | Sprints, ceremonies, roles |
| Kanban | `kanban` | Flow-based, WIP limits |
| Lean | `lean` | MVP, experiments, metrics |
| Extreme Programming | `xp` | Pair programming, TDD |
| Scrumban | `scrumban` | Hybrid Scrum/Kanban |

### Methodology-specific settings

#### Shape Up
```json
{
  "methodology": "shape-up",
  "team": {
    "cycleLength": 6,
    "coolDownLength": 2
  }
}
```

#### Scrum
```json
{
  "methodology": "scrum",
  "team": {
    "sprintLength": 2,
    "velocity": 40,
    "ceremonies": ["planning", "daily", "review", "retro"]
  }
}
```

#### Kanban
```json
{
  "methodology": "kanban",
  "team": {
    "wipLimits": {
      "todo": 10,
      "inProgress": 3,
      "review": 5
    }
  }
}
```

## Standards categories

### Available categories

| Category | Path | Standards |
|----------|------|-----------|
| Architecture | `/architecture/` | clean-arch, 15-factor |
| Development | `/development/` | solid, tdd, conventional-commits, google-style |
| Security | `/security/` | owasp-web, nist-csf |
| Testing | `/testing/` | test-pyramid, bdd |
| DevOps | `/devops/` | dora |
| Custom | `~/.claude/aichaku/user/standards/` | User-created standards |

### Standard identifiers

| Standard | ID | Category | Type |
|----------|-----|----------|------|
| Clean Architecture | `clean-arch` | architecture | built-in |
| 15-Factor App | `15-factor` | architecture | built-in |
| SOLID Principles | `solid` | development | built-in |
| Test-Driven Development | `tdd` | development | built-in |
| Conventional Commits | `conventional-commits` | development | built-in |
| Google Style Guide | `google-style` | development | built-in |
| OWASP Top 10 | `owasp-web` | security | built-in |
| NIST Cybersecurity | `nist-csf` | security | built-in |
| Test Pyramid | `test-pyramid` | testing | built-in |
| Behavior-Driven Dev | `bdd` | testing | built-in |
| DORA Metrics | `dora` | devops | built-in |
| User Standards | `custom:<name>` | custom | custom |

### Custom standards

Custom standards are prefixed with `custom:` when referencing them:

```bash
# List all custom standards
aichaku standards --list --categories custom

# Add a custom standard
aichaku standards --add custom:my-standard

# Show custom standard content
aichaku standards --show custom:my-standard
```

#### Custom standard file format

Custom standards follow the same markdown format as built-in standards:

```markdown
## My Custom Standard

### Quick Reference
Brief overview of the standard...

### Core Principles
1. First principle
2. Second principle
3. Third principle

### Implementation Guidelines
Detailed implementation instructions...

### Examples
Code examples demonstrating the standard...
```

#### Custom standard metadata

Each custom standard has associated metadata stored in `standards.json`:

```json
{
  "my-standard": {
    "name": "My Custom Standard",
    "description": "Brief description of what this standard covers",
    "path": "/Users/user/.claude/aichaku/user/standards/my-standard.md",
    "tags": ["custom", "team", "api"],
    "createdAt": "2025-07-11T10:00:00Z",
    "updatedAt": "2025-07-11T10:00:00Z"
  }
}
```

## CLAUDE.md markers

Special markers in CLAUDE.md files:

| Marker | Purpose |
|--------|---------|
| `<!-- AICHAKU:START -->` | Start of Aichaku content |
| `<!-- AICHAKU:END -->` | End of Aichaku content |
| `<!-- AICHAKU:METHODOLOGY:START -->` | Methodology rules section |
| `<!-- AICHAKU:METHODOLOGY:END -->` | End methodology section |
| `<!-- AICHAKU:STANDARDS:START -->` | Standards section |
| `<!-- AICHAKU:STANDARDS:END -->` | End standards section |

## Output naming conventions

### Project folders

Format: `{status}-YYYY-MM-DD-{descriptive-name}`

Examples:
- `active-2025-07-10-authentication-redesign`
- `done-2025-07-09-payment-integration`

### Status prefixes

| Prefix | Meaning |
|--------|---------|
| `active-` | Currently in progress |
| `done-` | Completed work |
| `archived-` | Long-term storage |
| `cancelled-` | Discontinued projects |

## Visual indicators

### Progress indicators

| Emoji | Meaning |
|-------|---------|
| 🌱 | New/Starting |
| 🌿 | Active/Growing |
| 🌳 | Mature/Review |
| 🍃 | Complete/Done |

### Mode indicators

| Emoji | Mode |
|-------|------|
| 🎯 | Planning |
| 🚀 | Execution |
| 📊 | Improvement |

### Methodology icons

| Emoji | Methodology |
|-------|-------------|
| 🔨 | Shape Up |
| 🏃 | Scrum |
| 📍 | Kanban |
| 🧪 | Lean |
| 🤝 | XP |
| 🌊 | Scrumban |

## Permissions

### Required Deno permissions

| Permission | Purpose |
|------------|---------|
| `--allow-read` | Read files and directories |
| `--allow-write` | Create and modify files |
| `--allow-env` | Read environment variables |
| `--allow-run` | Execute git commands |

### File permissions

| File/Directory | Permissions |
|----------------|-------------|
| `.claude/` | 755 |
| `*.md` files | 644 |
| `settings.json` | 644 |
| Git hooks | 755 |