# Specific Fixes Required

## 1. Agent ID Generation Fix

### Current Problem

```typescript
// In agent-loader.ts - Line ~108
const agent: Agent = {
  id: cleanName, // This is "Aichaku Deno Expert" not "deno-expert"
  name: cleanName,
  // ...
};
```

### Required Fix

- Parse YAML frontmatter for proper `id` field
- Apply namespacing strategy:
  - Default agents: Preserve `aichaku-` prefix (system namespace)
  - Optional agents: Use simple kebab-case (user namespace)
- Generate appropriate IDs based on agent type
- Map old IDs to new format for backward compatibility

### Files to Modify

- `/src/utils/agent-loader.ts` - metadataToAgent() function
- `/src/types/agent.ts` - Update Agent interface if needed

## 2. Agent Template Path Discovery

### Current Problem

```typescript
// Agent templates expected at:
~/.claude/aichaku/agent-templates/  // Doesn't exist!

// Actually need to discover from:
- Source installation directory
- Global aichaku installation
- Local project overrides
```

### Required Fix

- Use dynamic content discovery properly
- Check multiple locations with fallbacks
- Validate paths before attempting to load

### Files to Modify

- `/src/utils/agent-loader.ts` - constructor and basePath logic
- `/src/utils/dynamic-content-discovery.ts` - Ensure discovers agents

## 3. Search Output Deduplication

### Current Problem

```
• Aichaku Deno Expert: Aichaku Deno Expert
  Deno runtime and ecosystem specialist...
  
// Duplicate name in display!
```

### Required Fix

- Don't show name twice in search results
- Format as: `• {name}: {description}`
- Group by category (default/optional)

### Files to Modify

- `/src/formatters/agent-formatter.ts` - formatSearchResult()
- `/src/commands/agents.ts` - handleSearch()

## 4. Integration File Copying

### Current Problem

- `aichaku integrate` doesn't copy agent Markdown files
- No agent content appears in CLAUDE.md

### Required Fix

- During integrate, copy selected agent files to project
- Include agent content in CLAUDE.md generation
- Track which agents are integrated

### Files to Modify

- `/src/commands/integrate.ts` - Add agent integration step
- `/src/utils/config-manager.ts` - Track integrated agents

## 5. Clean List Display

### Current Problem

```
Optional Agents (add as needed):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Aichaku @aichaku-documenter 
    Documentation generation specialist...
```

### Required Fix

- Remove @ symbols and duplicate prefixes
- Show default agents with namespace: `• aichaku-documenter - Documentation specialist...`
- Show optional agents simply: `• deno-expert - Deno runtime specialist...`
- Clear sections for "Default Agents" and "Optional Agents"

### Files to Modify

- `/src/formatters/agent-formatter.ts` - formatList()
- `/src/utils/agent-loader.ts` - Clean names during loading

## 6. Command Switch Fixes

### Current Problem

- `--add "Aichaku Deno Expert"` requires full name
- Should work with `--add deno` or `--add deno-expert`

### Required Fix

- Implement fuzzy matching for agent names
- Accept partial matches
- Show suggestions if no exact match

### Files to Modify

- `/src/utils/base-command.ts` - handleAdd() ID resolution
- `/src/utils/fuzzy-search.ts` - Enhance for agent matching

## 7. Configuration Structure

### Current Problem

```json
{
  "agents": {
    "selected": ["Aichaku Deno Expert", "Aichaku TypeScript Expert"]
  }
}
```

### Required Fix

```json
{
  "agents": {
    "selected": ["deno-expert", "typescript-expert"]
    // Note: Don't store defaults list to prevent manual tampering
    // Defaults are determined by type: "default" in YAML frontmatter
  }
}
```

### Files to Modify

- `/src/utils/config-manager.ts` - Update agent methods
- Migration logic to convert old format

## Testing Checklist

After fixes, verify:

- [ ] `aichaku agents --list` shows clean categorized output
- [ ] `aichaku agents --add deno` works (not full name)
- [ ] `aichaku agents --search typescript` returns clean results
- [ ] `aichaku integrate` includes agent content in CLAUDE.md
- [ ] No duplicate text in any output
- [ ] Clear distinction between default and optional agents
- [ ] Existing installations still work
