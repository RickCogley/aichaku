# Configure YAML Directives

## Overview

Aichaku uses a YAML-based configuration system that allows you to customize how Claude Code works with your projects.
Instead of large static Markdown files, directives are now modular YAML configurations that can be mixed and matched.

## Key Benefits

- **96% smaller files**: From 50KB+ Markdown to ~2KB YAML
- **Modular updates**: Change specific behaviors without rewriting everything
- **Single source of truth**: One place to update behavior across all projects
- **Customizable**: Override defaults for your specific needs

## How It Works

When you run `aichaku integrate`, the system:

1. **Reads base configuration** from `~/.claude/aichaku/config/core.yaml`
2. **Merges methodology-specific configs** (e.g., `shape-up.yaml`, `scrum.yaml`)
3. **Applies project overrides** from your local `.claude/aichaku/` directory
4. **Generates final directives** and adds them to your `CLAUDE.md`

## Configuration Hierarchy

```
~/.claude/aichaku/config/
├── core.yaml              # Base Aichaku behavior
├── methodologies/
│   ├── shape-up.yaml       # Shape Up specific
│   ├── scrum.yaml          # Scrum specific
│   ├── kanban.yaml         # Kanban specific
│   └── common.yaml         # Cross-methodology
└── standards/
    ├── security.yaml       # OWASP, security standards
    └── development.yaml    # TDD, clean code, etc.
```

**Project overrides** (optional):

```
your-project/.claude/aichaku/
├── overrides.yaml          # Project-specific customizations
└── local-standards.yaml    # Additional standards for this project
```

## Example YAML Structure

````yaml
aichaku:
  version: "0.29.0"
  source: "configuration-as-code"

directives:
  project_structure:
    required_directories:
      - "docs/projects/active/"
      - "docs/checkpoints/"
    naming_convention: "YYYY-MM-DD-descriptive-name"

  methodology_detection:
    shape_up:
      triggers: ["shape", "appetite", "pitch", "betting table", "6 weeks"]
      documents: ["pitch.md", "betting-table.md"]
    scrum:
      triggers: ["sprint", "scrum", "velocity", "standup"]
      documents: ["sprint-planning.md", "backlog.md"]

  visual_identity:
    prefix: "🪴 Aichaku:"
    progress_indicators:
      new: "🌱"
      active: "🌿"
      review: "🌳"
      complete: "🍃"

  required_diagrams:
    status_md: |
      ```mermaid
      graph LR
          A[🌱 Started] --> B[🌿 Active]
          B --> C[🌳 Review]
          C --> D[🍃 Complete]
          style B fill:#90EE90
      ```
````

## Customizing for Your Project

### 1. Create Project Overrides

```bash
mkdir -p .claude/aichaku
```

### 2. Add Custom Configuration

Create `.claude/aichaku/overrides.yaml`:

```yaml
# Override default behavior for this project
aichaku:
  project_name: "My Custom Project"

directives:
  visual_identity:
    prefix: "🚀 MyProject:" # Custom prefix instead of Aichaku

  methodology_detection:
    custom_method:
      triggers: ["our-process", "company-way"]
      documents: ["company-process.md"]

  project_structure:
    additional_directories:
      - "docs/architecture/"
      - "docs/decisions/"
```

### 3. Apply Changes

```bash
aichaku integrate --force
```

This will regenerate your `CLAUDE.md` with the new configuration.

## Available Configuration Options

### Core Directives

- `project_structure`: Directory requirements and naming conventions
- `methodology_detection`: Keyword triggers and document templates
- `visual_identity`: Branding, emojis, and progress indicators
- `git_automation`: Commit message formats and branching rules
- `required_diagrams`: Mermaid diagram templates

### Methodology-Specific Options

Each methodology (Shape Up, Scrum, Kanban, etc.) has its own configuration file with:

- Specific terminology and triggers
- Document templates and requirements
- Workflow diagrams
- Mode transitions (Planning → Execution → Improvement)

### Standards Integration

Security, development, and style standards are also YAML-configurable:

- OWASP Top 10 compliance checks
- Code quality standards
- Documentation requirements
- Architectural patterns

## Enterprise-Grade Configuration Quality

Aichaku's YAML configuration system follows enterprise software engineering standards:

### Configuration-as-Code Architecture

**Problem Solved**: Eliminates hardcoded lists scattered throughout the codebase that made maintenance difficult.

**Before**: Methodology lists, fallbacks, and templates were hardcoded in business logic

```typescript
// BAD: Hardcoded in multiple places
return ["shape-up", "scrum", "kanban", "lean", "xp", "scrumban"];
```

**After**: Centralized configuration files with dedicated purposes

```typescript
// GOOD: Single source of truth
return getFallbackMethodologies(); // Reads from config/methodology-fallback.ts
```

### Key Configuration Files

- **`src/config/methodology-fallback.ts`** - Emergency fallback when dynamic discovery fails
- **`src/config/methodology-defaults.ts`** - Default methodology lists for new installations
- **`src/config/methodology-templates.ts`** - Template mappings per methodology
- **`mcp/aichaku-mcp-server/src/config/methodology-fallback.ts`** - MCP server configuration

### Benefits for Teams

1. **Maintainable**: Adding new methodologies only requires updating configuration files
2. **Auditable**: All configuration changes are version controlled and documented
3. **Testable**: Configuration can be validated and tested independently
4. **Consistent**: No risk of different hardcoded lists getting out of sync
5. **Scalable**: Easy to extend without touching business logic

### Senior Engineer Standards Applied

- **Zero hardcoded business logic**: All configuration externalized
- **Type safety**: Configuration interfaces ensure correctness
- **Documentation**: Each config file includes purpose and update tracking
- **Version control**: Configuration changes are tracked with rationale

This foundation ensures Aichaku remains maintainable as it scales to more methodologies and standards.

## Troubleshooting

### Configuration Not Applied

```bash
# Force regenerate CLAUDE.md
aichaku integrate --force

# Check what configuration is being used
cat ~/.claude/aichaku/config/core.yaml
```

### Custom YAML Syntax Errors

```bash
# Validate YAML syntax
deno eval "console.log(JSON.stringify(Deno.readTextFileSync('.claude/aichaku/overrides.yaml')))"
```

### Reset to Defaults

```bash
# Remove project overrides
rm -rf .claude/aichaku/

# Regenerate with defaults
aichaku integrate
```

## Migration from Static Files

If you were using older versions of Aichaku with large Markdown files:

1. **Your customizations are preserved** in `.claude/user/`
2. **No manual migration needed** - just run `aichaku upgrade`
3. **Old files are automatically cleaned up** during upgrade

The new YAML system provides the same functionality with much better maintainability and performance.
