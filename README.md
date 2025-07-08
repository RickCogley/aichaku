# aichaku (愛着)

> Adaptive methodology support for Claude Code that blends approaches based on
> how you naturally work

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Documentation](https://img.shields.io/badge/API_docs-deno.dev-blue)](https://aichaku.esolia.deno.net/)

## What is aichaku?

Aichaku (愛着 - "affection/attachment") provides adaptive methodology support
for Claude Code. Install once globally, use everywhere. Rather than forcing you
to choose a single methodology, aichaku provides all of them and helps Claude
Code blend approaches based on your natural language. Say "sprint" and get Scrum
practices; mention "shaping" and get Shape Up principles - all seamlessly
integrated.

📚 **[API Documentation](https://aichaku.esolia.deno.net/)** | 📦
**[JSR Package](https://jsr.io/@rick/aichaku)** | 🐙
**[GitHub](https://github.com/RickCogley/aichaku)**

**✨ Key Features:**

- 🌍 **Global install, works everywhere** - One-time setup, all projects benefit
- 🎯 **Adaptive blending** - Methodologies adapt to your language
- 🔄 **All methodologies included** - Shape Up, Scrum, Kanban, XP, Lean,
  Scrumban
- 🧠 **Context-aware** - AI responds to your terminology and needs
- 📁 **Clean projects** - No methodology file duplication
- 🚀 **Simple lifecycle** - Just init, integrate, upgrade, and uninstall

## Quick Start

```bash
# Install and initialize everything with one command:
deno run -A https://rickcogley.github.io/aichaku/init.ts
```

That's it! This single command will:

- Install the Aichaku CLI globally
- Set up global methodologies
- Optionally initialize your current project

### Alternative installation methods:

```bash
# Traditional approach (if you prefer explicit steps):
deno install -g -A -n aichaku jsr:@rick/aichaku/cli
aichaku init --global
aichaku init
```

## How It Works

Aichaku uses a simple **3-mode system** that adapts to your context:

### 📋 Planning Mode

When you say "let's plan" or "what should we build", Claude Code helps you
define work using the best methodology for your context.

### 🔨 Execution Mode

When you say "let's build" or "start coding", Claude Code guides development
with appropriate constraints (sprints, WIP limits, etc).

### 📊 Improvement Mode

When you say "how are we doing" or "retrospective", Claude Code measures
progress and suggests concrete improvements.

## Usage Examples

### Adaptive Blending

```
You: "Let's plan our next sprint, but I want to shape this feature properly"
Claude: [Blends Scrum structure with Shape Up shaping]
        "I'll help you shape the feature first, then fit it into your sprint.
         Let's start with the problem definition and appetite..."
```

### Natural Language Detection

```
You: "We need a kanban board for tracking our 6-week cycle"
Claude: [Detects Kanban + Shape Up terminology]
        "I'll create a Kanban board structured around your Shape Up cycle.
         We'll use swimlanes for different bets and track progress visually."
```

### Team Vocabulary

```
You: "Time for our daily standup to check the backlog"
Claude: [Recognizes Scrum ceremony + general terms]
        "Let's run through the standup format:
         - What did you complete yesterday?
         - What will you work on today?
         - Any blockers?"
```

## Included Methodologies

| Methodology  | Best For            | Key Concept                |
| ------------ | ------------------- | -------------------------- |
| **Shape Up** | Feature development | Fixed time, variable scope |
| **Scrum**    | Team coordination   | Sprints and ceremonies     |
| **Kanban**   | Continuous flow     | WIP limits and pull        |
| **XP**       | Code quality        | TDD and pairing            |
| **Lean**     | Validation          | Build-measure-learn        |
| **Scrumban** | Hybrid teams        | Sprint planning + flow     |

## Lifecycle Commands

### Help System

```bash
# Learn about a specific methodology
aichaku help shape-up
aichaku help scrum

# List all available methodologies
aichaku help --list

# Compare methodologies side-by-side
aichaku help --compare
```

### Initialize

```bash
# First time: Install global methodologies
aichaku init --global

# Per project: Create minimal setup
aichaku init
# → Creates .claude/user/ for customizations
# → Prompts to add Aichaku to CLAUDE.md
# → No methodology files copied!

# Preview what would happen
aichaku init --dry-run
```

### Upgrading

#### Global CLI

```bash
# Simplest upgrade (with feedback):
deno run -A https://rickcogley.github.io/aichaku/init.ts --force

# Or traditional upgrade:
deno install -g -A -n aichaku --force jsr:@rick/aichaku/cli

# Verify what version you have
aichaku --version
```

#### Update Projects

After upgrading the global CLI:

```bash
# In each project, run upgrade to get latest methodologies and update CLAUDE.md
aichaku upgrade

# This automatically:
# - Downloads all updated methodology files
# - Updates CLAUDE.md with latest integration
# - Preserves your user customizations
```

#### Global Methodologies

```bash
# Update global methodology files to latest version
aichaku upgrade --global

# This automatically downloads all new and updated methodology files
# Your user customizations in ~/.claude/user/ are always preserved
```

### Uninstall

```bash
# Remove from current project
aichaku uninstall

# Remove global installation
aichaku uninstall --global
```

### Integrate

```bash
# Add Aichaku reference to current project's CLAUDE.md
aichaku integrate

# Preview what would be added
aichaku integrate --dry-run

# Force add even if already present
aichaku integrate --force
```

### Help Examples

```bash
# Get quick overview of all methodologies
aichaku help --list

# Learn when to use Shape Up vs Scrum
aichaku help --compare

# Deep dive into a specific methodology
aichaku help kanban
# Shows key concepts, best/not ideal for, and quick start tips
```

### Programmatic Usage

```typescript
import { init, integrate, help } from "jsr:@rick/aichaku";

// Initialize global methodologies
await init({
  global: true,
});

// Initialize project
await init({
  projectPath: "./my-project",
});

// Add to CLAUDE.md
await integrate({
  projectPath: "./my-project",
});
```

## Architecture

### Global Installation (One Time)

```
~/.claude/
├── methodologies/          # All methodology files live here
│   ├── core/              # Universal modes
│   │   ├── PLANNING-MODE.md
│   │   ├── EXECUTION-MODE.md
│   │   └── IMPROVEMENT-MODE.md
│   ├── shape-up/
│   ├── scrum/
│   └── [other methodologies...]
├── user/                  # Global customizations
└── .aichaku.json         # Global metadata
```

### Project Integration (Per Project)

```
project/
├── CLAUDE.md             # Contains reference to global Aichaku
└── .claude/              # Optional, only if customizations needed
    ├── user/             # Project-specific overrides
    └── .aichaku-project  # Project marker file
```

**Key Point**: Methodologies are NEVER copied to projects - they're referenced
from the global installation. This keeps your git repositories clean!

## User Customization

The `user/` directory is yours to customize how Aichaku works for your team:

- **prompts/**: Override or extend AI behavior
- **templates/**: Add your organization's document templates
- **methods/**: Define custom practices or terminology

All customizations are preserved during upgrades. See `user/README.md` after
installation for detailed examples.

## Commands (Optional)

While aichaku works best with natural language, shortcuts are available:

- `/plan` - Activate planning mode
- `/build` - Start execution mode
- `/review` - Check improvements
- `/shape` - Shape Up specific
- `/sprint` - Scrum specific
- `/kanban` - Show board

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/RickCogley/aichaku.git
cd aichaku

# Setup git hooks for automatic formatting
git config core.hooksPath .githooks
```

### Commands

```bash
# Run tests
deno task test

# Type check
deno task check

# Format code (automatic with git hook)
deno task fmt

# Lint code
deno task lint

# Create release
deno task release:patch
```

## Philosophy

Traditional methodology tools force you to adapt to them. Aichaku reverses
this - it helps Claude Code adapt to you. Whether you're a solo developer,
startup team, or enterprise group, aichaku provides just enough process to be
helpful without getting in the way.

## Migrating from v0.4.x

If you're upgrading from v0.4.x, the architecture has significantly improved:

**What's Changed:**

- Methodologies now live globally only (no more project duplication)
- Projects only contain customizations, not methodology files
- Much cleaner git repositories
- Better command output with no redundancy

**Migration Steps:**

1. **Update the CLI tool:**

```bash
deno install -g -A -n aichaku --force jsr:@rick/aichaku@0.5.0/cli
```

2. **Keep your global installation** (if you have one):

```bash
# No changes needed to ~/.claude/
```

3. **Clean up existing projects:**

```bash
# In each project that has aichaku:
rm -rf .claude/methodologies .claude/.aichaku.json
# Keep .claude/user/ if you have customizations
```

4. **Re-initialize projects:**

```bash
aichaku init
# This will create the new minimal structure
```

Your customizations in `.claude/user/` are preserved!

## Why "aichaku"?

愛着 (aichaku) means developing attachment or affection for something over time.
We chose this name because good development practices should feel natural and
become something you're attached to, not forced to follow.

## Future Roadmap

- [x] Core 3-mode system
- [x] 6 major methodologies
- [x] Adaptive methodology blending
- [x] User customization system
- [ ] Methodology lock for compliance
- [ ] Usage analytics (opt-in)
- [ ] Organization templates
- [ ] IDE integrations

## API Documentation

For detailed API documentation, visit
[https://aichaku.esolia.deno.net/](https://aichaku.esolia.deno.net/)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Rick Cogley

---

<p align="center">
  <i>Made with 愛着 - Bringing affection to your development workflow</i>
</p>
