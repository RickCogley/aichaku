# Utilities

This directory contains utility modules for the Aichaku MCP server.

## YAML Generator

The `yaml-generator.ts` module provides functionality to generate structured YAML configuration for CLAUDE.md files,
encoding all Aichaku methodology rules in a compact, machine-readable format.

### Features

- **Complete Rule Encoding**: All behavioral directives, visual identity rules, and file organization patterns from the
  METHODOLOGY_SECTION are encoded in structured YAML
- **Methodology Configuration**: Includes triggers, best practices, templates, and icons for each methodology
- **Discussion Phases**: Encodes the three-phase discussion-first approach with triggers, actions, and examples
- **Visual Identity**: Includes growth phase emojis, progress display formats, and methodology-specific icons
- **File Organization**: Defines project structure, naming conventions, and required files
- **Diagram Templates**: Includes Mermaid diagram templates for different document types
- **Extensible**: Supports user customizations and methodology selection

### Usage

```typescript
import { generateAichakuYAML } from "./yaml-generator.ts";

// Generate full YAML with all methodologies
const fullYaml = await generateAichakuYAML();

// Generate YAML with selected methodologies
const selectedYaml = await generateAichakuYAML({
  methodologies: ["shape-up", "scrum"],
});

// Generate YAML with custom settings
const customYaml = await generateAichakuYAML({
  methodologies: ["shape-up", "kanban"],
  customizations: {
    user_preferences: {
      default_methodology: "shape-up",
      auto*create*diagrams: true,
    },
  },
});
```

### Integration with CLAUDE.md

The `claude-md-integration.ts` module shows how to generate complete CLAUDE.md sections:

```typescript
import { generateMinimalCLAUDEmd } from "./claude-md-integration.ts";

// Generate a complete CLAUDE.md file
const claudeMd = await generateMinimalCLAUDEmd("My Project", [
  "shape-up",
  "scrum",
  "kanban",
]);
```

### YAML Structure

The generated YAML includes:

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
        description: "Default when methodology keywords detected"
        actions:
          required: ["Acknowledge context", "Ask questions"]
          forbidden: ["DO NOT create folders", "DO NOT create documents"]

visual_identity:
  prefix: "🪴 Aichaku:"
  growth_phases:
    new: { emoji: "🌱", description: "New project" }
    active: { emoji: "🌿", description: "Active work" }

file_organization:
  project_root: "docs/projects/"
  structure:
    active_projects:
      path: "docs/projects/active/YYYY-MM-DD-{name}/"
      required: true

diagrams:
  mandatory: true
  templates:
    - document: "STATUS.md"
      type: "graph LR"
      template: "A[🌱 Started] --> B[🌿 Active]"
```

### Testing

Run the tests with:

```bash
deno test src/utils/yaml-generator.test.ts --allow-read --allow-env
```

### Example

See `examples/yaml-generator-example.ts` for a complete demonstration of the YAML generator capabilities.

## Other Utilities

### config-loader.ts

Configuration loading with validation and security checks.

### file-filter.ts

File filtering utilities for excluding files from review based on patterns, size, and content type.

### path-security.ts

Path validation and security utilities to prevent directory traversal attacks.
