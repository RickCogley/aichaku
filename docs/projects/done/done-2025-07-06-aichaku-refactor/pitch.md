# Pitch: Aichaku Adaptive System Refactor

## The Problem

Users are confused about what Aichaku is:

- They think they need to choose a methodology

- Documentation shows different commands

- No clear upgrade path

- Can't customize without losing changes

## The Solution

Make Aichaku what it was meant to be: **one adaptive system** that responds to
context.

### Before (Confusing)

````bash
# Which methodology do I need?
aichaku shape-up
aichaku scrum
aichaku install  # Wait, what?
```text

### After (Clear)

```bash
# Just initialize - Aichaku handles the rest
aichaku init
```text

## How It Works

1. **Single Command**: `aichaku init` installs everything

2. **User Space**: `user/` directory for customizations that survive upgrades

3. **Smart Updates**: `aichaku upgrade` preserves your work

4. **Clean Removal**: `aichaku uninstall` when needed

## The Bet

- **Scope**: Refactor CLI and structure

- **Time**: 4-6 hours

- **Risk**: Low - improves clarity

- **Reward**: Matches user mental model

## Breadboarding

```text
$ aichaku init
✓ Creating .claude/ directory
✓ Installing adaptive methodologies
✓ Setting up user customization space
✓ Aichaku initialized! The AI now has context-aware methodology support.

$ aichaku upgrade
✓ Current version: 0.2.2
✓ Latest version: 0.3.0
✓ Upgrading core methodologies...
✓ Preserving user customizations
✓ Upgrade complete!

$ tree .claude/
.claude/
├── methodologies/    # We manage this
├── user/            # You own this
└── .aichaku.json    # Tracks installation
```text

## Why This Matters

Aichaku becomes what users expect:

- One tool that adapts

- Not a methodology picker

- Customizable without fear

- Easy to understand and use
````
