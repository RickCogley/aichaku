# Bet: Simplify Aichaku to True Adaptive System

## Problem

Aichaku's current implementation doesn't match its core vision:

- CLI uses `aichaku <methodology>` implying users must choose
- README and mod.ts have inconsistent documentation
- No upgrade path that preserves user customizations
- "Revolutionary" language overstates what's a natural flow
- Missing user customization structure

## Appetite

4-6 hours of focused development

## Solution

Transform Aichaku into a truly adaptive system:

### 1. Single Installation Command

```bash
aichaku init          # Installs everything
aichaku init --global # Global installation
```

### 2. User Customization Layer

```
.claude/
├── methodologies/    # Core (managed)
├── user/            # Customizations (preserved)
│   ├── prompts/
│   ├── templates/
│   └── methods/
└── .aichaku.json    # Metadata
```

### 3. Lifecycle Commands

- `aichaku init` - Install all methodologies
- `aichaku upgrade` - Update core, preserve user/
- `aichaku uninstall` - Clean removal

### 4. Aligned Messaging

- "Adaptive methodology support"
- "Natural 3-mode workflow"
- Remove methodology selection

## Rabbit Holes

- ❌ Complex merge strategies for upgrades
- ❌ Methodology-specific installations
- ❌ Version compatibility checks
- ❌ Migration tools for existing installs

## No-gos

- Complex configuration files
- Multiple installation modes
- Over-engineering the solution
- Adding unnecessary dependencies

## Sketch

```
User runs: aichaku init
→ Creates .claude/
  → Copies all methodologies/
  → Creates user/ with README
  → Writes .aichaku.json
→ Success message with next steps

User runs: aichaku upgrade
→ Reads .aichaku.json
→ Preserves user/
→ Updates methodologies/
→ Updates .aichaku.json
→ Shows what changed
```

## Nice-to-haves

- `--dry-run` flag for all commands
- `--check` flag for upgrade
- Backup before upgrade
- Change summary after upgrade
