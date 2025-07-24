# Aichaku Commands

This directory contains command implementations for the Aichaku MCP server.

## Integrate YAML Command

The `integrate-yaml.ts` module provides a modern approach to generating CLAUDE.md files using YAML configuration instead
of embedding the full 50KB+ Markdown content.

### Benefits

- **Size Reduction**: Reduces CLAUDE.md from ~50KB to ~2KB (96% reduction)
- **Machine Readable**: YAML format is easily parsed by Claude Code
- **Selective Inclusion**: Choose specific methodologies to include
- **Preserves Customizations**: Maintains existing content outside AICHAKU markers
- **Backward Compatible**: Works with existing CLAUDE.md files

### Usage

#### As an MCP Tool

```typescript
// Via MCP tool invocation
await mcp.callTool("integrate_aichaku", {
  targetPath: "./my-project",
  methodologies: ["shape-up", "scrum"],
  projectName: "My Project",
});
```

#### As a Direct Function

```typescript
import { integrate } from "./integrate-yaml.ts";

const result = await integrate({
  targetPath: "./my-project",
  methodologies: ["shape-up", "scrum", "kanban"],
  projectName: "My Multi-Method Project",
  preserveExisting: true,
});

console.log(result.message); // "Generated CLAUDE.md (2048 bytes, 96% reduction)"
```

#### As a CLI Command

```bash
# Basic usage (all methodologies)
aichaku integrate

# Select specific methodologies
aichaku integrate -m shape-up,scrum

# Specify project details
aichaku integrate -p ./my-project -n "My Project"

# Force overwrite without backup
aichaku integrate -f

# Don't preserve existing content
aichaku integrate --no-preserve
```

### Options

| Option                | Type     | Default           | Description                              |
| --------------------- | -------- | ----------------- | ---------------------------------------- |
| `targetPath`          | string   | Current directory | Target directory for CLAUDE.md           |
| `methodologies`       | string[] | All methodologies | Selected methodologies to include        |
| `includeStandards`    | boolean  | true              | Include selected standards               |
| `includeDocStandards` | boolean  | true              | Include documentation standards          |
| `projectName`         | string   | "this project"    | Custom project name for header           |
| `preserveExisting`    | boolean  | true              | Preserve content outside AICHAKU markers |
| `force`               | boolean  | false             | Force overwrite without backup           |
| `customizations`      | object   | {}                | User customizations to include           |

### Generated YAML Structure

The command generates a comprehensive YAML configuration that includes:

```yaml
version: "1.0.0"
methodologies:
  shape-up:
    triggers: ["shape", "pitch", "appetite"]
    best_for: "Clear projects, fixed timelines"
    templates: ["pitch.md", "cycle-plan.md"]
    icons:
      primary: "🎯"
      secondary: "🔨"

behavioral_directives:
  discussion_first:
    enabled: true
    phases:
      - name: "DISCUSSION MODE"
        actions:
          required: ["Acknowledge context", "Ask questions"]
          forbidden: ["DO NOT create folders"]

visual_identity:
  prefix: "🪴 Aichaku:"
  growth_phases:
    new: { emoji: "🌱", description: "New project" }

file_organization:
  project_root: "docs/projects/"
  structure:
    active_projects:
      path: "docs/projects/active/YYYY-MM-DD-{name}/"

diagrams:
  mandatory: true
  templates:
    - document: "STATUS.md"
      type: "graph LR"
```

### Example Output

A generated CLAUDE.md file will look like:

````markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with My Project.

<!-- AICHAKU:START -->

## 🎯 Aichaku Methodology Integration

This project uses the Aichaku methodology system. The configuration below defines how Claude Code should interact with
this project.

### Configuration

```yaml
version: "1.0.0"
methodologies:
  shape-up:
    triggers: ["shape", "pitch"]
    # ... full YAML configuration ...
```
````

### Usage

When Claude Code detects methodology keywords...

<!-- AICHAKU:END -->

### Testing

Run the tests with:

```bash
deno test src/commands/integrate-yaml.test.ts --allow-read --allow-write --allow-env
```

### Examples

See `examples/integrate-yaml-example.ts` for comprehensive usage examples.

## Future Commands

This directory is structured to support additional commands in the future, such as:

- `validate-yaml.ts` - Validate CLAUDE.md YAML configuration
- `migrate-legacy.ts` - Migrate from old Markdown format to YAML
- `sync-methodologies.ts` - Sync methodology definitions from upstream
