# Existing Agent System Files

## Core Implementation Files (All Exist)

### Commands

- ✅ `/src/commands/agents.ts` - AgentsCommand using BaseCommand pattern
  - Implements list, show, add, remove, search operations
  - Issue: Uses full names instead of kebab-case IDs

### Types

- ✅ `/src/types/agent.ts` - Agent interface extending ConfigItem
  - Has proper type definitions
  - Includes delegations, examples, tools

### Utilities

- ✅ `/src/utils/agent-loader.ts` - AgentLoader class
  - Uses dynamic content discovery
  - Issue: Line 108 - Sets ID to cleanName which is wrong format
  - Issue: Line 105 - Removes prefix but should keep `aichaku-` for all

- ✅ `/src/utils/agent-generator.ts` - Agent generation with context injection
  - Generates methodology-aware agents
  - Has focused context injection
  - Works with YAML frontmatter

### Formatters

- ✅ `/src/formatters/agent-formatter.ts` - AgentFormatter class
  - Formats list, details, search results
  - Issue: Shows duplicate names in output

### Tests

- ✅ `/tests/agent-template-validation_test.ts` - Template validation
- ✅ `/tests/agent-validation_test.ts` - Agent validation tests

## Key Issues to Fix

### 1. ID Generation Bug (agent-loader.ts:105-108)

```typescript
// Current (WRONG):
const cleanName = metadata.name?.replace(/^@?aichaku-/, "") || agentName;
const agent: Agent = {
  id: cleanName, // This removes prefix - wrong!
  name: cleanName,
  // ...
};
```

Should be:

```typescript
// Fixed:
const agent: Agent = {
  id: `aichaku-${agentName}`, // Always use aichaku- prefix
  name: metadata.name || `Aichaku ${agentName}`,
  // ...
};
```

### 2. Path Discovery Issue (agent-loader.ts:32-37)

Currently looks for `agent-templates/` but templates might be elsewhere.

### 3. Display Formatting (agent-formatter.ts)

Shows redundant information in search results.

### 4. Integration Missing

`aichaku integrate` doesn't copy agent files to `.claude/agents/`

## System Architecture

The agent system is **fully implemented** with:

- Command structure using BaseCommand pattern
- Type-safe Agent interfaces
- Dynamic content discovery
- YAML-based configuration
- Test coverage

This is **not a from-scratch build** - it's fixing specific bugs in the existing, working system.
