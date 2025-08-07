# CLAUDE.md Size Comparison

## Before (Current Approach)

- Full Markdown injection: ~50KB
- Contains hardcoded METHODOLOGY_SECTION
- Duplicates content from source files
- Hard to maintain and update

## After (Configuration as Code)

- Compact YAML block: ~2KB
- References source YAML files
- No duplication
- Easy to maintain

## Size Reduction

- **96% reduction** in file size
- From 50,000+ characters to ~2,000 characters
- All behavioral rules preserved in structured YAML

## Key Benefits

### 1. True Configuration as Code

- All configuration lives in `/docs/` YAML files
- `integrate` command just reads and merges
- No hardcoded content in TypeScript

### 2. Single Source of Truth

- `/docs/core/behavioral-directives.yaml` - Core rules
- `/docs/core/visual-identity.yaml` - Branding
- `/docs/core/file-organization.yaml` - Structure
- `/docs/core/diagram-templates.yaml` - Diagrams
- `/docs/methodologies/*/[methodology].yaml` - Methodology configs
- `/docs/standards/*/[standard].yaml` - Standard configs

### 3. Dynamic Assembly

```
docs/core/*.yaml +
selected methodologies +
selected standards +
user customizations
= Compact CLAUDE.md YAML block
```

### 4. MCP Integration Ready

- Integration URLs like `aichaku://methodology/shape-up/guide`
- MCP can resolve these to actual content
- Dynamic loading without file bloat

### 5. Maintainability

- Change a YAML file → automatically reflected
- No code changes needed for config updates
- Version control shows clear config changes
