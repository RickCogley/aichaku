# Configuration Options Reference

Complete reference for all Aichaku configuration options.

## settings.local.json

Project-specific configuration file located at `.claude/settings.local.json`.

### Schema

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

#### Advanced configuration
```json
{
  "selectedStandards": [
    "owasp-web",
    "solid",
    "tdd",
    "test-pyramid",
    "conventional-commits",
    "google-style"
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
| `~/.claude/standards/` | Standards library |
| `~/.claude/output/` | Generated projects |
| `~/.claude/CLAUDE.md` | Global Claude instructions |
| `~/.claude/settings.json` | Global settings (future) |
| `~/.claude/commands.json` | Custom commands |

### Project installation

| Path | Purpose |
|------|---------|
| `.claude/` | Project root |
| `.claude/methodologies/` | Project methodologies |
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

### Standard identifiers

| Standard | ID | Category |
|----------|-----|----------|
| Clean Architecture | `clean-arch` | architecture |
| 15-Factor App | `15-factor` | architecture |
| SOLID Principles | `solid` | development |
| Test-Driven Development | `tdd` | development |
| Conventional Commits | `conventional-commits` | development |
| Google Style Guide | `google-style` | development |
| OWASP Top 10 | `owasp-web` | security |
| NIST Cybersecurity | `nist-csf` | security |
| Test Pyramid | `test-pyramid` | testing |
| Behavior-Driven Dev | `bdd` | testing |
| DORA Metrics | `dora` | devops |

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