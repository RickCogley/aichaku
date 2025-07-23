# Implementation Plan: Aichaku v0.5.0

_"Making Aichaku Truly Superior"_

## Vision

Aichaku v0.5.0 will be a transformative release that makes the tool feel
magical. Users should feel like they have a thoughtful assistant that
understands their intent and keeps their workspace beautifully organized.

## Core Principles

1. **Clarity Over Cleverness** - Every message should be immediately
   understandable

2. **Beauty in Simplicity** - Terminal output should be visually pleasing

3. **Natural Language First** - Commands are fallbacks; conversation is primary

4. **Zero Friction** - Global install once, works everywhere

5. **Respectful Assistance** - Never overwrite user content without permission

## 🏗️ Architecture Redesign

### Global Installation (One Time)

````text
~/.claude/
├── methodologies/          # All methodology files live here
│   ├── core/              # Universal modes
│   ├── shape-up/          # Shape Up specific
│   ├── scrum/             # Scrum specific
│   └── ...                # Other methodologies
├── user/                  # Global customizations
└── .aichaku.json         # Global metadata
```text

### Project Integration (Per Project)

```text
project/
├── CLAUDE.md             # Contains reference to global Aichaku
└── .claude/              # Optional, only if customizations needed
    └── user/             # Project-specific overrides only
```text

### Key Change: No Methodology Duplication

- Methodologies exist ONLY in global location

- Projects reference global, never copy

- Updates propagate automatically

## 🎨 Beautiful Output Design

### Color Palette & Icons

```text
🎯 Primary Actions    - Bold cyan
✅ Success           - Green with subtle animation
⚠️  Warnings         - Amber with emphasis
❌ Errors            - Red with clear guidance
📁 File Operations   - Blue
🔄 Progress          - Animated spinner
💡 Tips              - Soft yellow
```text

### Message Architecture

#### 1. Progress Messages (During Operation)

```text
🔄 Checking global installation...
📁 Creating project structure...
✏️  Updating CLAUDE.md...
```text

#### 2. Success Messages (Action Completed)

```text
╭─────────────────────────────────────────╮
│  ✅ Aichaku initialized in project!     │
╰─────────────────────────────────────────╯

📁 Created: .claude/user/
📝 Updated: CLAUDE.md
💡 Next: Start Claude Code and begin naturally
```text

#### 3. Status Messages (No Action Needed)

```text
ℹ️  Already up to date (v0.5.0)
    No action needed.
```text

## 📋 Command Behaviors

### `aichaku init --global`

**Purpose**: One-time global setup

**Output**:

```text
🌍 Installing Aichaku globally...

✅ Global installation complete!

📁 Installed to: ~/.claude/
📚 Methodologies: Shape Up, Scrum, Kanban, Lean, XP, Scrumban
🎯 Next: Run 'aichaku init' in any project

💡 Pro tip: Aichaku works best through natural language.
   Just tell Claude Code what you want to do!
```text

### `aichaku init` (in project)

**Purpose**: Minimal project setup

**Flow**:

1. Check global exists → Error if not

2. Create .claude/user/ for customizations

3. Interactive prompt for integration

**Output**:

```text
🔍 Checking requirements...
✓ Global Aichaku found (v0.5.0)

📁 Creating project structure...
✓ Created .claude/user/ for your customizations

Would you like to add Aichaku to this project's CLAUDE.md?
This helps Claude Code understand your methodologies.

[Y/n]: _
```text

**If Yes**:

```text
✏️  Updating CLAUDE.md...

✅ Project initialized with Aichaku!

Your project now has:

  • Access to all global methodologies
  • Local customization directory
  • CLAUDE.md integration

💡 Start working naturally - just tell Claude Code what you need!
```text

### `aichaku integrate`

**Purpose**: Add/update CLAUDE.md reference

**Smart Detection**:

- Check if already integrated

- Find optimal insertion point

- Preserve existing content

**Output**:

```text
📄 Analyzing CLAUDE.md...
✏️  Adding Aichaku methodology section...

✅ Integration complete!

📍 Added at line 23
📚 Methodologies available: 6
🔗 Using global: ~/.claude/

✨ Claude Code now understands your methodology preferences!
```text

### `aichaku upgrade`

**Purpose**: Update global methodologies

**Check Mode** (`--check`):

```text
🔍 Checking for updates...

ℹ️  Current version: v0.5.0
    Latest version:  v0.5.0

✓ You're up to date!
```text

**Upgrade Mode** (when update available):

```text
🔍 Checking for updates...

📦 Update available: v0.5.0 → v0.5.1

📋 What's new:

  • Improved Shape Up templates
  • Better Kanban board visualization
  • Fixed sprint planning typos

Proceed with upgrade? [Y/n]: _
```text

**After Upgrade**:

```text
🔄 Upgrading methodologies...
✓ Downloaded latest version
✓ Preserved customizations
✓ Updated 23 files

✅ Upgraded to v0.5.1!

💡 All your projects now have the latest methodologies!
```text

### `aichaku uninstall`

**Purpose**: Remove Aichaku (with safety checks)

**Project Level**:

```text
🔍 Analyzing project...

Found Aichaku files:

  • .claude/user/ (empty)
  • CLAUDE.md references (lines 23-35)

⚠️  This will remove project customizations.
    Global installation will remain.

Remove Aichaku from this project? [y/N]: _
```text

**After Confirmation**:

```text
🗑️  Removing project files...
✓ Removed .claude/user/

ℹ️  CLAUDE.md still contains Aichaku references:

    Lines 23-35: "## Methodologies"

    Remove these manually if no longer needed.

✅ Aichaku removed from project.
```text

## 🧠 Natural Language Integration

### Enhanced Methodology Files

Each core file starts with:

```markdown
## 🏗️ PROJECT STRUCTURE - ALWAYS START HERE

When you hear any of these:

- "Let's add..." / "I want to..." / "Can we..."

- "Help me implement..." / "We need to..."

- "Fix..." / "Improve..." / "Change..."

IMMEDIATELY create: 📁 .claude/output/active-{YYYY-MM-DD}-{descriptive-name}/
└── STATUS.md

This is automatic - users shouldn't need to ask!
```text

### STATUS.md Template

```markdown
# Status: {Change Description}

**Status**: ACTIVE - {Current Mode} **Started**: {Date} **Methodology**:
{Detected blend}

## 🎯 Objective

{What we're trying to achieve}

## 📋 Progress

- [ ] Planning

- [ ] Implementation

- [ ] Testing

- [ ] Documentation

## 📝 Notes

{Decisions, context, learnings}

## 🔗 References

{Related files, docs, discussions}
```text

## 🛠️ Implementation Order

### Phase 1: Core Architecture (2 hours)

1. Redesign init command for global/project split

2. Remove methodology copying logic

3. Add interactive prompts

4. Create .aichaku-project marker file

### Phase 2: Message Cleanup (1 hour)

1. Fix redundant success messages

2. Add conditional messaging (check vs action)

3. Implement beautiful output formatting

4. Add progress indicators

### Phase 3: Enhanced Features (1 hour)

1. Smart CLAUDE.md integration

2. Uninstall improvements with line detection

3. Update methodology files with structure emphasis

4. Add interactive prompts where helpful

### Phase 4: Polish & Testing (1 hour)

1. Test all command combinations

2. Ensure git cleanliness

3. Verify beautiful output rendering

4. Update all documentation

## 🎯 Success Metrics

1. **Zero Confusion**: Users understand global vs project immediately

2. **Beautiful Output**: Every message is clear and pleasing

3. **Natural Flow**: Folder structure happens automatically

4. **Clean Git**: Only user customizations need tracking

5. **Delightful Experience**: Users enjoy using Aichaku

## 💫 The Magic Touch

### Small Details That Matter

- Subtle animations for progress (⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏)

- Thoughtful emoji usage (meaningful, not excessive)

- Helpful tips that appear at the right moment

- Error messages that guide to solutions

- Celebration for successful operations

### Example Error Handling

Instead of:

```text
Error: Global installation not found
```text

We show:

```text
❌ Aichaku not installed globally yet!

To use Aichaku in projects, first install it globally:

  $ aichaku init --global

This one-time setup provides methodologies for all your projects.
Learn more: https://github.com/RickCogley/aichaku#installation
```text

## 🚀 Release Plan

1. **Implement all changes in feature branch**

2. **Comprehensive testing of new flow**

3. **Update README with new architecture**

4. **Create migration guide for existing users**

5. **Release as v0.5.0 with clear upgrade path**

## 📝 Migration Guide Preview

For users upgrading from v0.4.x:

```text
🎉 Aichaku v0.5.0 - A Superior Experience!

Major changes:
• Projects no longer copy methodology files
• Cleaner git repos (no more .gitignore hassles)
• Beautiful new output design
• Automatic project structure creation

To upgrade:

1. Install new CLI: deno install -g -A -n aichaku --force jsr:@rick/aichaku@0.5.0/cli

2. Keep your global installation: No change needed

3. In existing projects: Remove .claude/methodologies/

4. Run 'aichaku init' to set up new structure

Your customizations are preserved!
```text

---

This implementation plan transforms Aichaku from a good tool into a delightful
experience. Every interaction should feel thoughtful, every output should be
beautiful, and the entire system should work so naturally that users forget
they're using a tool at all.
````
