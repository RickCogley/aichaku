# YAML to Markdown Generation

## Problem

We currently maintain both YAML and Markdown files for each methodology and standard. This creates:

- **Drift risk**: Manual updates to one file might not be reflected in the other
- **Duplication of effort**: Writing the same information twice
- **Maintenance burden**: Two files to update for every change
- **Inconsistency**: Different authors might structure content differently

Examples:

- `kanban.yaml` and `kanban.md` could have different descriptions
- Summary in YAML might not match overview in Markdown
- New fields added to YAML might be forgotten in Markdown

## Appetite

3-4 weeks - This is infrastructure work that will pay dividends over time.

## Solution

Generate Markdown files from YAML as the single source of truth:

```yaml
# shape-up.yaml (source)
methodology: shape-up
name: "Shape Up"
display:
  icon: "🎯"
  description: "Basecamp's methodology..."
summary:
  key_concepts: [...]
  cycle_length: "6 weeks"
content:
  overview: |
    Full markdown content here...
  quick_start: |
    Step-by-step guide...
  examples: |
    Real examples...
```

Generated `shape-up.md`:

```markdown
# 🎯 Shape Up

Basecamp's methodology...

## Key Concepts

- Fixed time, variable scope
- 6-week cycles...

## Overview

[content from YAML]

## Quick Start

[content from YAML]
```

### Key Features

1. **YAML as single source**: All content lives in YAML files
2. **Template-based generation**: Consistent structure across all docs
3. **Build-time generation**: Part of the release process
4. **Validation**: Ensure all required fields exist
5. **Backward compatible**: Generated files match current structure

### Implementation Approach

```typescript
// generate-docs.ts
async function generateMarkdown(yamlPath: string): Promise<void> {
  const data = parseYaml(await Deno.readTextFile(yamlPath));
  const template = getTemplate(data.type); // methodology or standard
  const markdown = renderTemplate(template, data);
  await Deno.writeTextFile(mdPath, markdown);
}
```

## Rabbit Holes

### Not Doing

- Custom Markdown extensions
- Interactive documentation
- Multi-language support
- Version control of generated files

### Risks

- Complex YAML structures might be hard to edit
- Need good YAML validation
- Template complexity could grow

## No-Gos

- Don't break existing documentation URLs
- Don't lose any current content
- Don't make YAML files unreadable
- Don't generate files in source control (build artifact)

## Success Criteria

1. All methodologies and standards have single YAML source
2. Generated Markdown is identical to hand-written quality
3. CI/CD automatically generates docs on release
4. Contributors only need to edit YAML
5. Documentation stays in perfect sync

## Follow-on Opportunities

1. **Live preview**: Editor plugin to preview generated Markdown
2. **Cross-references**: Auto-link between related concepts
3. **API docs**: Generate from code + YAML
4. **Multi-format**: HTML, PDF from same source
5. **Validation**: Ensure examples actually work
