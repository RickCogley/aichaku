# aichaku (愛着)

> Adaptive methodology support for Claude Code that blends approaches based on
> how you naturally work

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is aichaku?

Aichaku (愛着 - "affection/attachment") provides adaptive methodology support
for Claude Code. Rather than forcing you to choose a single methodology, aichaku
installs all of them and helps Claude Code blend approaches based on your
natural language. Say "sprint" and get Scrum practices; mention "shaping" and
get Shape Up principles - all seamlessly integrated.

**✨ Key Features:**

- 🎯 **Adaptive blending** - Methodologies adapt to your language
- 🔄 **All-in-one install** - Shape Up, Scrum, Kanban, XP, Lean, Scrumban
  included
- 🧠 **Context-aware** - AI responds to your terminology and needs
- 📁 **User customization** - Your modifications survive upgrades
- 🚀 **Simple lifecycle** - Just init, upgrade, and uninstall

## Quick Start

```bash
# Install globally
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Initialize in your project
aichaku init

# Or initialize globally for all projects
aichaku init --global
```

That's it! Claude Code now has adaptive methodology support.

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

### Initialize

```bash
# Initialize in current project
aichaku init

# Initialize globally for all projects  
aichaku init --global

# Preview what would be installed
aichaku init --dry-run
```

### Upgrade

```bash
# Upgrade the CLI tool itself
deno install -g -A -n aichaku --force jsr:@rick/aichaku/cli

# Then upgrade methodologies (preserves customizations)
aichaku upgrade --global

# Check for methodology updates
aichaku upgrade --check --global

# Force reinstall methodologies
aichaku upgrade --force --global
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

### Programmatic Usage

```typescript
import { init } from "jsr:@rick/aichaku";

// Initialize with all methodologies
await init({
  global: true,
  force: false,
});
```

## What Gets Installed?

```
.claude/
├── methodologies/          # All methodology files (updated on upgrade)
│   ├── core/
│   │   ├── PLANNING-MODE.md
│   │   ├── EXECUTION-MODE.md
│   │   └── IMPROVEMENT-MODE.md
│   ├── shape-up/
│   │   ├── SHAPE-UP-AICHAKU-GUIDE.md
│   │   └── templates/
│   ├── scrum/
│   │   ├── SCRUM-AICHAKU-GUIDE.md
│   │   └── templates/
│   └── [other methodologies...]
├── user/                   # Your customizations (never touched by upgrades)
│   ├── README.md          # Customization guide
│   ├── prompts/           # Custom AI prompts
│   ├── templates/         # Your document templates
│   └── methods/           # Methodology extensions
└── .aichaku.json          # Installation metadata
```

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

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Rick Cogley

---

<p align="center">
  <i>Made with 愛着 - Bringing affection to your development workflow</i>
</p>
