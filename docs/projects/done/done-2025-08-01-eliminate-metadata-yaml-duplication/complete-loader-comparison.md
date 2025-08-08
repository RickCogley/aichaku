# Complete Loader Comparison

## Summary of All Loaders

### 1. Standards Loader (USES metadata.yaml - PROBLEMATIC)

**Pattern**: Loads individual YAML files BUT also has metadata.yaml files

```typescript
// Skips metadata.yaml explicitly
if (entry.isFile && entry.name.endsWith(".yaml") && entry.name !== "metadata.yaml") {
```

**Structure**:

```
standards/
├── architecture/
│   ├── metadata.yaml    # DUPLICATE INFO
│   ├── 15-factor.yaml   # Has name, description
│   └── clean-arch.yaml  # Has name, description
```

**Problem**: metadata.yaml duplicates info already in individual files

### 2. Principles Loader (NO metadata.yaml - CLEAN)

**Pattern**: Loads directly from individual YAML files

```typescript
for await (const entry of expandGlob(`${categoryPath}/*.yaml`)) {
  if (entry.isFile) {
    const principleWithDocs = await this.loadPrincipleWithDocs(entry.path);
  }
}
```

**Structure**:

```
principles/
├── software-development/
│   ├── dry.yaml         # Single source of truth
│   ├── kiss.yaml        # Single source of truth
│   └── yagni.yaml       # Single source of truth
```

**Success**: No duplication, clean loading

### 3. Agents Loader (USES agents.yaml - DIFFERENT PURPOSE)

**Pattern**: Loads from base.md files with YAML frontmatter

```typescript
// Reads base.md files and extracts YAML frontmatter
const content = Deno.readTextFileSync(templatePath);
const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
```

**Structure**:

```
agent-templates/
├── agents.yaml          # NOT metadata - defines default vs optional categorization
├── orchestrator/
│   └── base.md          # Contains YAML frontmatter with agent info
├── code-explorer/
│   └── base.md          # Contains YAML frontmatter with agent info
```

**Key Difference**: agents.yaml serves a DIFFERENT purpose - it categorizes agents as default or optional, NOT
duplicating metadata

### 4. Methodologies (NO files - HARDCODED)

**Pattern**: Uses hardcoded data structure

```typescript
const AVAILABLE_METHODOLOGIES: Record<string, Methodology> = {
  "shape-up": { id: "shape-up", name: "Shape Up", ... }
}
```

**Success**: Zero duplication, fastest loading

## Analysis Conclusion

### The Outlier: Standards

- **Standards**: Only loader with TRUE metadata duplication
- **Principles**: Clean pattern, no metadata.yaml needed
- **Agents**: agents.yaml serves different purpose (categorization, not metadata)
- **Methodologies**: No filesystem at all

### Why agents.yaml is Different

```yaml
# agents.yaml - CATEGORIZATION file
agents:
  default: # Which agents to include by default
    - id: orchestrator
  optional: # Which agents are optional
    - id: deno-expert
```

This is NOT duplicating metadata from base.md files - it's defining which agents are default vs optional for the
integrate command.

### Why metadata.yaml is Problematic

```yaml
# metadata.yaml - DUPLICATION file
standards:
  - id: "tdd"
    name: "Test-Driven Development" # DUPLICATE from tdd.yaml
    description: "Red-green-refactor" # DUPLICATE from tdd.yaml
```

This IS duplicating information already in individual standard files.

## Recommendation Stands

The analysis confirms:

1. ✅ Standards is the ONLY loader with true metadata duplication
2. ✅ Principles loader shows the clean pattern to follow
3. ✅ Agents loader's agents.yaml serves a different purpose (categorization)
4. ✅ Eliminating metadata.yaml files is the correct approach

The metadata.yaml files in standards are unnecessary overhead that violates DRY and causes user confusion with
"(metadata)" entries.
