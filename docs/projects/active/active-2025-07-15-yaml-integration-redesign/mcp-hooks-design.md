# MCP Hooks Design for Dynamic Content Loading

## Overview

This document outlines how MCP (Model Context Protocol) hooks can dynamically
load content based on references in the CLAUDE.md YAML block, enabling a compact
configuration that expands into full context when needed.

## Architecture

````mermaid
graph TD
    A[Claude reads CLAUDE.md] --> B[Encounters YAML block]
    B --> C[MCP Hook: parse-yaml-references]
    C --> D[Extract reference URLs]
    D --> E[Fetch content from URLs]
    E --> F[Provide expanded context to Claude]
    F --> G[Claude has full context without bloat]
```text

## Hook Types and Triggers

### 1. Pre-Read Hook: `aichaku-yaml-expander`

**Trigger**: Before Claude reads CLAUDE.md **Function**: Detects YAML block and
expands references

```yaml
# Example CLAUDE.md YAML block
aichaku:

  version: "3.0.0"

  methodologies:
    shape_up:
      reference: "~/.claude/aichaku/methodologies/shape-up/"
      # Hook will expand this to full content when needed

  standards:
    owasp_web:
      reference: "~/.claude/aichaku/standards/security/owasp-web.md"
      # Hook fetches and includes content dynamically
```text

### 2. Context Hook: `aichaku-context-provider`

**Trigger**: When Claude detects methodology/standard keywords **Function**:
Loads specific content on-demand

```typescript
// Hook implementation pseudocode
interface AichakuHook {
  trigger: "pre-read" | "context" | "keyword";
  pattern?: RegExp;
  action: (context: HookContext) => Promise<EnhancedContext>;
}

const yamlExpanderHook: AichakuHook = {
  trigger: "pre-read",
  pattern: /aichaku:\s*version:/,
  action: async (context) => {
    const yaml = parseYamlBlock(context.content);
    const expanded = await expandReferences(yaml);
    return mergeContext(context, expanded);
  },
};
```text

## Implementation Strategy

### Phase 1: Reference Resolution

```typescript
interface YamlReference {
  type: "file" | "directory" | "url" | "aichaku";
  path: string;
  mode?: "full" | "summary" | "triggers";
}

async function resolveReference(ref: YamlReference): Promise<string> {
  switch (ref.type) {
    case "file":
      return await readFile(expandPath(ref.path));

    case "directory":
      return await readGuideFiles(expandPath(ref.path));

    case "url":
      return await fetchUrl(ref.path);

    case "aichaku":
      // Special protocol for Aichaku content
      // aichaku://methodologies/shape-up/guide
      return await resolveAichakuProtocol(ref.path);
  }
}
```text

### Phase 2: Smart Loading

```yaml
# Enhanced YAML with loading hints
aichaku:

  standards:
    owasp_web:
      reference: "~/.claude/aichaku/standards/security/owasp-web.md"
      loading: "lazy" # Don't load until triggered
      triggers: ["OWASP", "security", "vulnerability"]
      cache_duration: "session" # Cache for entire session

    tdd:
      reference: "~/.claude/aichaku/standards/development/tdd.md"
      loading: "eager" # Load immediately if selected
      summary_only: true # Only load summary section
```text

### Phase 3: Hook Configuration

```json
// .claude/hooks/aichaku.json
{
  "hooks": [
    {
      "name": "aichaku-yaml-expander",
      "trigger": "file-read",
      "pattern": "CLAUDE.md",
      "script": "~/.claude/aichaku/hooks/yaml-expander.js",
      "config": {
        "max*expansion*size": "100KB",
        "cache_enabled": true,
        "fallback_mode": "graceful"
      }
    },
    {
      "name": "aichaku-keyword-loader",
      "trigger": "keyword",
      "keywords": ["shape", "sprint", "kanban", "OWASP"],
      "script": "~/.claude/aichaku/hooks/keyword-loader.js"
    }
  ]
}
```text

## Content Loading Strategies

### 1. Lazy Loading

- Only load content when keywords are detected

- Reduces initial context size

- Better performance for large projects

### 2. Progressive Enhancement

```yaml
standards:

  owasp_web:
    # Level 1: Always included (minimal)
    name: "OWASP Top 10"
    triggers: ["OWASP", "security"]

    # Level 2: Loaded on trigger
    reference: "~/.claude/aichaku/standards/security/owasp-web.md"

    # Level 3: Deep dive (on explicit request)
    deep_reference: "~/.claude/aichaku/standards/security/owasp-detailed/"
```text

### 3. Context-Aware Loading

```typescript
// Hook decides what to load based on conversation context
async function contextAwareLoader(context: ConversationContext) {
  const topics = detectTopics(context.recentMessages);

  if (topics.includes("security") && topics.includes("web")) {
    return loadFullContent("owasp_web");
  } else if (topics.includes("security")) {
    return loadSummary("owasp_web");
  }

  return null; // Don't load if not relevant
}
```text

## Benefits

1. **Minimal CLAUDE.md Size**: ~2KB base configuration

2. **Dynamic Context**: Load only what's needed

3. **Performance**: Faster initial parsing

4. **Flexibility**: Easy to add new content without bloating

5. **Caching**: Reuse loaded content within session

6. **Versioning**: Clean diffs in version control

## Example Workflow

1. **User Message**: "I need to implement authentication following OWASP"

2. **Hook Activation**:

   ```text

   - Detect "OWASP" keyword

   - Check YAML for owasp_web reference

   - Load content from reference path

   - Inject into Claude's context
````

3. **Claude Response**: Full OWASP guidance available without permanent bloat

## Integration with Aichaku CLI

````bash
# New command to test hook functionality
aichaku test-hooks --simulate "OWASP security check"

# Output shows what would be loaded:
🪴 Aichaku: Hook Simulation

- Keyword detected: "OWASP"

- Would load: ~/.claude/aichaku/standards/security/owasp-web.md (15KB)

- Cache status: Not cached

- Total context after load: 17KB
```text

## Security Considerations

1. **Path Validation**: Ensure references can't escape intended directories

2. **Size Limits**: Prevent loading massive files

3. **Network Safety**: Validate URLs before fetching

4. **Caching**: Secure cache storage for sensitive content

## Future Enhancements

1. **Conditional Loading**: Based on project type

2. **User Preferences**: Allow users to configure loading behavior

3. **Analytics**: Track which content is most useful

4. **Preloading**: Predictive loading based on patterns

5. **Compression**: Store compressed content in cache

## Implementation Timeline

- **Week 1**: Basic reference resolution

- **Week 2**: Hook infrastructure

- **Week 3**: Caching and optimization

- **Week 4**: Testing and refinement

- **Week 5**: Integration with CLI

- **Week 6**: Documentation and release

This design enables the compact YAML approach while maintaining full
functionality through intelligent, dynamic content loading.
````
