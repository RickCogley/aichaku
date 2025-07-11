# File Structure Reference

Complete reference of Aichaku's file structure and organization.

## Repository structure

```
aichaku/
├── cli.ts                      # CLI entry point
├── mod.ts                      # Library exports
├── init.ts                     # Global installer
├── version.ts                  # Version info (auto-generated)
├── deno.json                   # Deno configuration
├── deno.lock                   # Dependency lock
├── nagare.config.ts            # Release config
├── LICENSE                     # MIT license
├── README.md                   # Main documentation
├── CLAUDE.md                   # Claude integration
├── CHANGELOG.md                # Release history
├── CONTRIBUTING.md             # Contribution guide
├── SECURITY.md                 # Security policy
├── CODE_OF_CONDUCT.md          # Community guidelines
│
├── src/                        # Source code
│   ├── commands/               # CLI commands
│   │   ├── init.ts            # Initialize command
│   │   ├── integrate.ts       # Integration command
│   │   ├── standards.ts       # Standards management
│   │   ├── help.ts            # Help system
│   │   ├── upgrade.ts         # Upgrade command
│   │   ├── uninstall.ts       # Uninstall command
│   │   ├── mcp.ts             # MCP integration
│   │   └── hooks.ts           # Git hooks
│   │
│   ├── installer.ts           # Installation logic
│   ├── lister.ts              # Discovery service
│   ├── updater.ts             # Update service
│   └── types.ts               # TypeScript types
│
├── methodologies/              # Methodology packages
│   ├── README.md              # Methodology overview
│   ├── COMMANDS.md            # Quick reference
│   ├── BLENDING-GUIDE.md      # Mixing methodologies
│   │
│   ├── core/                  # Universal files
│   │   ├── PLANNING-MODE.md   # Planning phase
│   │   ├── EXECUTION-MODE.md  # Execution phase
│   │   ├── IMPROVEMENT-MODE.md # Improvement phase
│   │   ├── STATUS-TEMPLATE.md # Status tracking
│   │   └── diagrams/          # Mermaid examples
│   │
│   ├── shape-up/              # Shape Up package
│   │   ├── SHAPE-UP-AICHAKU-GUIDE.md
│   │   ├── templates/
│   │   │   ├── pitch.md
│   │   │   ├── cycle-plan.md
│   │   │   ├── hill-chart.md
│   │   │   └── cool-down.md
│   │   └── scripts/
│   │       └── generate-pdf.sh
│   │
│   ├── scrum/                 # Scrum package
│   │   ├── SCRUM-AICHAKU-GUIDE.md
│   │   └── templates/
│   │       ├── sprint-planning.md
│   │       ├── user-story.md
│   │       ├── daily-standup.md
│   │       └── retrospective.md
│   │
│   ├── kanban/                # Kanban package
│   ├── lean/                  # Lean package
│   ├── xp/                    # XP package
│   └── scrumban/              # Scrumban package
│
├── standards/                  # Standards library
│   ├── architecture/
│   │   ├── clean-arch.md
│   │   └── 15-factor.md
│   │
│   ├── development/
│   │   ├── conventional-commits.md
│   │   ├── solid.md
│   │   ├── tdd.md
│   │   └── google-style.md
│   │
│   ├── security/
│   │   ├── owasp-web.md
│   │   └── nist-csf.md
│   │
│   ├── testing/
│   │   ├── test-pyramid.md
│   │   └── bdd.md
│   │
│   └── devops/
│       └── dora.md
│
├── mcp-server/                # MCP integration
│   ├── README.md
│   ├── src/
│   │   ├── server.ts
│   │   ├── review-engine.ts
│   │   └── standards-manager.ts
│   └── tests/
│
├── scripts/                   # Dev tools
│   ├── build-binaries.ts
│   └── install.ts
│
├── docs/                      # Documentation
├── test-installations/        # Test scenarios
├── coverage/                  # Test coverage
└── dist/                      # Build output
```

## Global installation structure

Location: `~/.claude/aichaku/`

```
~/.claude/
└── aichaku/                   # All Aichaku files
    ├── methodologies/         # Core methodology files
    │   ├── shape-up/         # Full methodology
    │   ├── scrum/            # Full methodology
    │   ├── kanban/           # Full methodology
    │   ├── lean/             # Full methodology
    │   ├── xp/               # Full methodology
    │   ├── scrumban/         # Full methodology
    │   └── core/             # Always present
    │
    ├── standards/             # Built-in standards library
    │   ├── architecture/     # Architecture patterns
    │   ├── development/      # Dev practices
    │   ├── documentation/    # Documentation standards
    │   ├── security/         # Security standards
    │   └── testing/          # Testing approaches
    │
    ├── user/                  # User customizations
    │   ├── standards/         # Custom standards go here
    │   ├── methodologies/     # Custom methodologies (future)
    │   ├── templates/         # Custom templates (future)
    │   └── config/            # User configuration (future)
    │
    └── cache/                 # Performance cache
```

Note: User-specific files remain in the root `~/.claude/` directory:
- `CLAUDE.md` - Global AI instructions
- `output/` - User's work outside of projects
- `settings.json` - Global settings
- `commands.json` - Custom commands

## Project installation structure

Location: `project/.claude/`

```
[project]/
└── .claude/
    ├── aichaku/                # Aichaku project files
    │   ├── standards.json      # Selected standards (was .aichaku-standards.json)
    │   ├── doc-standards.json  # Documentation standards
    │   └── output/             # Generated documents
    │       ├── active-*/       # Work in progress
    │       └── done-*/         # Completed work
    │
    ├── output/                 # User work (stays here)
    ├── user/                   # User customizations (stays here)
    ├── CLAUDE.md              # AI instructions (stays here)
    └── settings.local.json    # Claude Code settings (stays here)
```

Note: The `.aichaku-project` marker file is no longer needed. Aichaku detects projects by the presence of `.claude/aichaku/` directory.

## Methodology package structure

Each methodology contains:

```
methodology-name/
├── [METHODOLOGY]-AICHAKU-GUIDE.md    # Main guide
├── templates/                        # Document templates
│   ├── planning-doc.md              # Planning phase
│   ├── execution-doc.md             # Execution phase
│   └── review-doc.md                # Review phase
└── scripts/                         # Optional tools
    └── helper-script.sh
```

### Shape Up structure
```
shape-up/
├── SHAPE-UP-AICHAKU-GUIDE.md
├── templates/
│   ├── pitch.md               # Problem/solution pitch
│   ├── cycle-plan.md          # 6-week cycle plan
│   ├── hill-chart.md          # Progress visualization
│   ├── cool-down.md           # Cool-down activities
│   └── betting-table.md       # Project selection
└── scripts/
    └── generate-pitch-pdf.sh
```

### Scrum structure
```
scrum/
├── SCRUM-AICHAKU-GUIDE.md
├── templates/
│   ├── sprint-planning.md     # Sprint planning
│   ├── user-story.md          # Story template
│   ├── daily-standup.md       # Daily sync
│   ├── sprint-review.md       # Sprint demo
│   └── retrospective.md       # Team reflection
└── scripts/
    └── velocity-calculator.sh
```

### Kanban structure
```
kanban/
├── KANBAN-AICHAKU-GUIDE.md
├── templates/
│   ├── kanban-board.md        # Board visualization
│   ├── flow-metrics.md        # Cycle time, WIP
│   ├── card-template.md       # Work item template
│   └── service-classes.md     # Priority classes
└── scripts/
    └── metrics-dashboard.sh
```

## Standards structure

Each standard is a single markdown file:

```
standards/
├── category/
│   └── standard-name.md       # Complete standard
```

### Standard file format
```markdown
# Standard Name

## Quick Reference
[Brief overview]

## Core Principles
[Key concepts]

## Implementation
[How to apply]

## Examples
[Code examples]

## Anti-patterns
[What to avoid]
```

## Custom standards structure

Users can add their own standards to extend Aichaku's built-in library:

### Location
Custom standards must be placed in: `~/.claude/aichaku/user/standards/`

### File naming
- Use UPPERCASE-KEBAB-CASE: `MY-CUSTOM-STANDARD.md`
- Must end with `.md` extension
- Names should be descriptive and unique

### Required frontmatter format
```yaml
---
title: "My Custom Standard"
description: "Brief description of what this standard covers"
tags: ["category", "subcategory", "custom"]
---
```

### Auto-discovery
- Aichaku automatically discovers custom standards on startup
- No registration required - just add the file
- Standards appear in the selection list with "(Custom)" suffix

### Example custom standard
```markdown
---
title: "Company Code Style"
description: "Our company's specific coding standards"
tags: ["development", "style", "custom"]
---

# Company Code Style

## Quick Reference
Our company follows specific conventions...

## Rules
1. All functions must be documented
2. Use 4-space indentation
3. Maximum line length: 100 characters

## Examples
```typescript
/**
 * Calculates the sum of two numbers
 * @param a First number
 * @param b Second number
 * @returns The sum of a and b
 */
function add(a: number, b: number): number {
    return a + b;
}
```
```

## Legacy structure migration

Aichaku v2.0+ uses a new organized structure to avoid cluttering `~/.claude/`:

### Old structure (v1.x)
```
~/.claude/
├── methodologies/          # Aichaku files mixed with user files
├── standards/              # Aichaku files mixed with user files
├── output/                 # User work
├── CLAUDE.md              # User's global instructions
├── settings.json          # User settings
└── commands.json          # User commands
```

### New structure (v2.0+)
```
~/.claude/
├── aichaku/               # All Aichaku files contained here
│   ├── methodologies/     # Core methodology files
│   ├── standards/         # Built-in standards
│   ├── user/              # User customizations
│   └── cache/             # Performance cache
│
├── output/                # User work (stays in original location)
├── CLAUDE.md             # User instructions (stays in original location)
├── settings.json         # User settings (stays in original location)
└── commands.json         # User commands (stays in original location)
```

### Migration notes
- The installer automatically migrates existing installations
- User files in `~/.claude/` are preserved in their original locations
- Only Aichaku-specific files are moved to `~/.claude/aichaku/`
- Custom standards should be moved to `~/.claude/aichaku/user/standards/`

## Output directory structure

Work organization:

```
output/
├── active-2025-07-10-authentication-system/
│   ├── STATUS.md              # Current progress
│   ├── pitch.md               # Initial pitch
│   ├── cycle-plan.md          # Execution plan
│   ├── implementation-notes.md # Technical details
│   └── assets/                # Supporting files
│       ├── diagrams/
│       └── screenshots/
│
├── active-2025-07-11-payment-integration/
│   └── [project files]
│
├── done-2025-07-09-security-audit/
│   ├── STATUS.md              # Final status
│   ├── findings.md            # Audit results
│   ├── remediation-plan.md    # Fix plan
│   └── 2025-07-09-Security-Audit-CHANGE-LOG.md
│
└── archived-2025-01-15-legacy-migration/
    └── [old project files]
```

## File naming conventions

### Markdown files
| Type | Convention | Example |
|------|------------|---------|
| Guides | UPPERCASE-HYPHEN | `SHAPE-UP-AICHAKU-GUIDE.md` |
| Templates | lowercase-hyphen | `sprint-planning.md` |
| Core docs | UPPERCASE-HYPHEN | `PLANNING-MODE.md` |
| Custom standards | UPPERCASE-HYPHEN | `MY-CODING-STANDARD.md` |
| Change logs | DATE-Name-CHANGE-LOG | `2025-07-07-Fix-Auth-CHANGE-LOG.md` |
| User docs | flexible | `notes.md`, `ToDo.md` |

### TypeScript files
| Type | Convention | Example |
|------|------------|---------|
| Commands | lowercase | `init.ts` |
| Tests | append _test | `init_test.ts` |
| Types | types.ts | `types.ts` |
| Config | .config.ts | `nagare.config.ts` |

### Directories
| Type | Convention | Example |
|------|------------|---------|
| Categories | lowercase | `security/`, `testing/` |
| Methodologies | lowercase-hyphen | `shape-up/`, `extreme-programming/` |
| Output | status-date-name | `active-2025-07-10-feature/` |

## Special files

### Marker files
| File | Purpose |
|------|---------|
| `.claude/aichaku/` | Directory presence identifies Aichaku project |
| `.claude/aichaku/standards.json` | Selected standards list (was `.aichaku-standards.json`) |
| `.claude/aichaku/doc-standards.json` | Documentation standards configuration |
| `.claude/settings.local.json` | Claude Code project configuration |

### Generated files
| File | Generated by | Purpose |
|------|--------------|---------|
| `version.ts` | Nagare | Version information |
| `deno.lock` | Deno | Dependency lock |
| `STATUS.md` | Aichaku | Project tracking |

### Configuration files
| File | Purpose |
|------|---------|
| `deno.json` | Deno configuration |
| `nagare.config.ts` | Release configuration |
| `.githooks/pre-commit` | Git automation |

## File permissions

Default permissions:

| Type | Permissions | Octal |
|------|-------------|-------|
| Directories | drwxr-xr-x | 755 |
| Markdown | -rw-r--r-- | 644 |
| Scripts | -rwxr-xr-x | 755 |
| Config | -rw-r--r-- | 644 |

## Git integration

### Files to commit
```gitignore
# Commit these
.claude/aichaku/standards.json
.claude/aichaku/doc-standards.json
.claude/settings.local.json
.claude/CLAUDE.md
.claude/commands.json

# Always ignore output
.claude/aichaku/output/

# Ignore Aichaku core files (installed separately)
.claude/aichaku/methodologies/
.claude/aichaku/standards/
.claude/aichaku/cache/
```

### Recommended .gitignore
```gitignore
# Aichaku generated output
.claude/aichaku/output/

# Aichaku core files (don't commit)
.claude/aichaku/methodologies/
.claude/aichaku/standards/
.claude/aichaku/cache/

# Keep configuration
!.claude/aichaku/standards.json
!.claude/aichaku/doc-standards.json

# User files (optional to commit)
.claude/output/
.claude/user/
```

## File size guidelines

| File type | Typical size | Maximum |
|-----------|--------------|---------|
| Methodology guide | 5-10 KB | 20 KB |
| Template | 1-3 KB | 5 KB |
| Standard | 3-8 KB | 15 KB |
| STATUS.md | 1-2 KB | 5 KB |
| User documents | Variable | No limit |

## Total installation size

| Component | Size |
|-----------|------|
| Core files | ~500 KB |
| Per methodology | ~50 KB |
| All methodologies | ~300 KB |
| All standards | ~200 KB |
| Total typical | ~1 MB |