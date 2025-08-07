# Agent Namespacing Strategy

## Overview

Clear namespace separation between system agents and user-selected agents to prevent conflicts and confusion.

## Namespacing Rules

### Default/System Agents (Auto-installed)

**Prefix**: `aichaku-`

**Examples**:

- `aichaku-orchestrator` - General workflow coordinator
- `aichaku-documenter` - Documentation generation specialist
- `aichaku-security-reviewer` - Security compliance checker

**Rationale**:

- Protected namespace prevents conflicts
- Clear indication these are core system agents
- Users can't accidentally override with custom agents
- Automatically installed, so users don't choose the names

### Optional Agents (User-selected)

**Prefix**: None (simple kebab-case)

**Examples**:

- `deno-expert` - Deno runtime specialist
- `typescript-expert` - TypeScript language expert
- `python-expert` - Python specialist
- `api-architect` - API design specialist

**Rationale**:

- Users explicitly choose to install these
- Simpler to type in commands
- Users are aware of potential conflicts
- Users can manage their own namespace

## Implementation Details

### YAML Frontmatter

```yaml
# Default agent example
---
id: aichaku-orchestrator
name: Aichaku Orchestrator
type: default
description: General workflow coordinator
---

# Optional agent example
---
id: deno-expert
name: Deno Expert
type: optional
description: Deno runtime and ecosystem specialist
---
```

### Configuration Storage

```json
{
  "agents": {
    "selected": ["deno-expert", "typescript-expert"]
    // No "defaults" list - determined by type: "default" in YAML
  }
}
```

### Command Usage

```bash
# Adding optional agents - use simple names
aichaku agents --add deno        # Matches deno-expert
aichaku agents --add typescript   # Matches typescript-expert

# Cannot remove default agents
aichaku agents --remove aichaku-orchestrator  # Error: Cannot remove default agent

# Listing shows clear categories
aichaku agents --list
# Output:
# Default Agents (Auto-installed):
#   • aichaku-orchestrator - General workflow coordinator
#   • aichaku-documenter - Documentation specialist
#
# Optional Agents (Available):
#   • deno-expert - Deno runtime specialist
#   • typescript-expert - TypeScript language expert
```

## Benefits

1. **Clear Boundaries**: System vs user-selected agents are immediately distinguishable
2. **Conflict Prevention**: Core agents protected from naming collisions
3. **User-Friendly**: Optional agents have simple, typeable names
4. **Future-Proof**: Room for custom user agents without conflicts
5. **Self-Documenting**: Prefix immediately indicates agent type

## Migration Path

For existing installations with wrong IDs:

```
"Aichaku Deno Expert" → "deno-expert"
"Aichaku Orchestrator" → "aichaku-orchestrator" (keeps prefix)
"@aichaku-documenter" → "aichaku-documenter"
```
