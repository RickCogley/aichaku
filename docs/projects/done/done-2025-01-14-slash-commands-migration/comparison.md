# Slash Commands: Old vs New Format Comparison

## Storage Location

**Old**: Single monolithic `~/.claude/settings.json` file (228+ lines) **New**: Individual files in
`~/.claude/commands/` directory

## Command Definition

### Old Format (JSON)

```json
{
  "name": "preflight",
  "description": "Show preflight checks for current project",
  "prompt": "Based on the project type (check for deno.json, package.json, pyproject.toml, etc.), show me the appropriate preflight checks I should run before committing code."
}
```

### New Format (Markdown)

````markdown
---
allowed-tools: Read, Bash(deno:*), Bash(npm:*), Bash(python:*)
description: Show preflight checks based on project type
---

# Preflight Checks for $ARGUMENTS

Detecting project type...

!test -f deno.json && echo "Deno project detected" || true !test -f package.json && echo "Node.js project detected" ||
true\
!test -f pyproject.toml && echo "Python project detected" || true

Based on the project type, here are your preflight checks:

## Deno Project

```bash
deno fmt --check
deno lint
deno check **/*.ts
deno test
```
````

## Node.js Project

```bash
npm run format
npm run lint
npm test
```

## Python Project

```bash
black . --check
mypy .
pytest
```

Run these before committing your changes!

```
## Key Improvements

### 1. Tool Permissions
**Old**: No granular control
**New**: Specify exactly which tools/commands are allowed

### 2. Dynamic Content
**Old**: Static prompt text only
**New**:
- `$ARGUMENTS` - Pass parameters to commands
- `!command` - Execute bash commands inline
- `@file` - Reference file contents directly

### 3. Organization
**Old**: All commands in one JSON array
**New**: Organized in directories by category
```

commands/ ├── aichaku/ # Aichaku-specific ├── security/ # Security tools ├── dev/ # Development helpers └── utils/ #
General utilities

```
### 4. Version Control
**Old**: Single file changes affect all commands
**New**: Each command tracked separately

### 5. Discoverability
**Old**: Must parse JSON to see commands
**New**: Browse filesystem, read markdown files

## Migration Benefits

1. **Easier Maintenance**: Edit individual command files
2. **Better Documentation**: Markdown format is readable
3. **Sharing**: Can share command sets via git repos
4. **Testing**: Test commands in isolation
5. **Permissions**: Fine-grained security control

## Overlap Analysis

### Commands to Keep (Aichaku-specific)
- `/aichaku:memin` - Loads our specific memory format
- `/aichaku:checkpoint` - Our checkpoint format
- `/security:owasp` - Our security focus
- `/security:commit-style` - InfoSec guidelines

### Commands to Deprecate (Covered by Claude)
- `/commands` → Use Claude's `/help`
- `/project add` → May overlap with `/add-dir`

### Commands to Enhance
- `/preflight` - Add project type detection
- `/security-rules` - Add examples and validation
```
