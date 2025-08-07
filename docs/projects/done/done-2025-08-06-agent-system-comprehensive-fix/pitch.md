# Agent System Comprehensive Fix

## Problem

The agent management system is fundamentally broken with multiple cascading failures:

### Core Issues

1. **Wrong IDs**: Agent IDs are full names like "Aichaku Deno Expert" instead of "deno-expert"
2. **Messy Output**: Search results show duplicate/redundant information
3. **Integration Failure**: `aichaku integrate` doesn't properly copy agent files into .claude/agents in the project
4. **Path Confusion**: Agent templates can't be found in expected locations
5. **No Structure**: No distinction between default and optional agents
6. **Poor UX**: Confusing command output that's hard to read

### User Impact

- Can't easily add agents with simple names
- Search results are nearly useless
- Integration doesn't actually integrate agents
- No clear understanding of what's available vs installed
- The code was shown to work, so a release was performed, yet it does not really work, which is a serious QC problem

## Appetite

**4 weeks** (shorter Shape Up cycle)

This is fixing critical bugs in the existing agent system. Previous attempt in late July 2025 was incomplete. The system
exists and works but has ID generation, display, and integration issues that need fixing.

## Solution

### Three-Phase Approach

#### Phase 1: Fix Core Loading (Week 1)

- Proper ID generation from YAML frontmatter (configuration as code, do not make hardcoded lists, and use e.g.
  deno-expert over aichaku-deno-expert to keep the id's type-able)
- Correct path discovery for agent templates (it must work outside this aichaku repository, for other repositories that
  are users of aichaku)
- Clean separation of default vs optional agents

#### Phase 2: Fix Commands & Display (Week 2)

- Simplified, consistent agent IDs (e.g., "deno-expert", "TypeScript-expert")
- Clean, readable output formatting
- Proper search with deduplication (use fuse as we did in @docs/projects/active/2025-08-01-yaml-dry-consolidation)
- Clear categorization in listings

#### Phase 3: Fix Integration (Week 3)

- Reliable file copying during `aichaku integrate`
- Proper agent manifest in aichaku.json, making it clear what is optional, what is default
- Validation and error recovery

#### Phase 4: Testing & Polish (Week 4)

- Comprehensive testing of all scenarios
- Documentation updates
- Migration for existing users

## Rabbit Holes

### ❌ NOT Doing

- **Agent marketplace** or complex discovery
- **Version management** for individual agents
- **Agent dependencies** or complex relationships
- **Custom agent creation UI**
- **Breaking changes** to existing integrations

### ⚠️ Watch Out For

- **Over-engineering** the ID system
- **Hard-coded lists** because we are implementing "configuration as code"
- **Complex migration** that could fail
- **Performance issues** with file operations

## No-gos

- ❌ **Breaking existing CLAUDE.md files** - Must maintain compatibility
- ❌ **Changing agent behavior** - Only fixing management/discovery
- ❌ **Complex agent metadata** - Keep it simple
- ❌ **Manual file operations** by users - Everything automated

## Technical Approach

### 1. Agent ID Standards

```
aichaku-orchestrator    ✅ Core agent with namespace
aichaku-documenter      ✅ Core agent with namespace  
aichaku-deno-expert     ✅ ALL agents namespaced to prevent collisions
aichaku-typescript-expert ✅ Consistent aichaku- prefix
```

**Rationale**: Namespace ALL agents with `aichaku-` to prevent conflicts with other MCP servers and provide clear
ownership.

### 2. Directory Structure

```
~/.claude/aichaku/
├── agents/
│   ├── defaults/      # Auto-installed agents
│   │   ├── aichaku-orchestrator.md
│   │   └── aichaku-documenter.md
│   └── optional/      # Available to add
│       ├── deno-expert.md
│       ├── typescript-expert.md
│       └── ...
```

### 3. Configuration Format

```json
{
  "agents": {
    "selected": ["aichaku-deno-expert", "aichaku-typescript-expert"]
    // Defaults not stored - determined by type: "default" in YAML
  }
}
```

**Note**: Defaults are not stored in config to prevent manual tampering. They're identified by `type: "default"` in YAML
frontmatter.

### 4. Command Interface

```bash
# Clear, simple commands
aichaku agents --list           # Shows categorized list
aichaku agents --add deno       # Smart matching
aichaku agents --remove python  # Only removes optional
aichaku agents --show           # Shows installed agents
```

## Success Criteria

By the end of this cycle:

1. ✅ **Simple IDs work**: `aichaku agents --add deno` just works
2. ✅ **Clean output**: No duplicate text, clear categories
3. ✅ **Integration works**: Agents actually get integrated
4. ✅ **Search is useful**: Returns relevant, deduplicated results
5. ✅ **Clear structure**: Users understand default vs optional
6. ✅ **No manual work**: Everything automated through commands
7. ✅ **Backward compatible**: Existing setups continue working
