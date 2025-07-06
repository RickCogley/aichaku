# aichaku (愛着)

> Intelligent methodology support for Claude Code that adapts to how you work

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is aichaku?

Aichaku (愛着 - "affection/attachment") brings intelligent, adaptive methodology support to Claude Code. Instead of forcing you to learn complex frameworks, aichaku helps Claude Code understand what you're trying to do and guides you using the best methodology for your situation.

**✨ Key Features:**
- 🎯 **Natural language first** - Just describe what you need
- 🔄 **6 methodologies included** - Shape Up, Scrum, Kanban, XP, Lean, Scrumban
- 🧠 **Context-aware** - Adapts to team size, urgency, and work type
- 🚀 **Zero learning curve** - Start working immediately
- 🔧 **Mix and match** - Combine methodologies naturally

## Quick Start

```bash
# Install globally
deno install -A -n aichaku jsr:@rick/aichaku/cli

# Install methodologies to your project
aichaku install
```

That's it! Claude Code now has intelligent methodology support.

## How It Works

Aichaku uses a revolutionary **3-mode system** instead of complex personas:

### 📋 Planning Mode
When you say "let's plan" or "what should we build", Claude Code helps you define work using the best methodology for your context.

### 🔨 Execution Mode  
When you say "let's build" or "start coding", Claude Code guides development with appropriate constraints (sprints, WIP limits, etc).

### 📊 Improvement Mode
When you say "how are we doing" or "retrospective", Claude Code measures progress and suggests concrete improvements.

## Usage Examples

### Natural Conversation
```
You: "I need to add user authentication to my app"
Claude: [Detects feature work, suggests Shape Up with 2-week appetite]
        "Let's shape this feature. Key questions:
         - Password only or social login too?
         - New users or existing database?
         Based on complexity, this feels like a 2-week appetite."
```

### Handling Multiple Work Types
```
You: "We have features to build and bugs to fix"
Claude: "I suggest a hybrid approach:
         - Shape Up for features (clear appetites)
         - Kanban board for bugs (continuous flow)
         Set up both? (y/n)"
```

### Team Adaptation
```
You: "Our team of 6 is struggling with delivery"
Claude: [Detects team size, suggests Scrum]
        "For a 6-person team, 2-week Scrum sprints often work well.
         Want me to help plan your first sprint?"
```

## Included Methodologies

| Methodology | Best For | Key Concept |
|------------|----------|-------------|
| **Shape Up** | Feature development | Fixed time, variable scope |
| **Scrum** | Team coordination | Sprints and ceremonies |
| **Kanban** | Continuous flow | WIP limits and pull |
| **XP** | Code quality | TDD and pairing |
| **Lean** | Validation | Build-measure-learn |
| **Scrumban** | Hybrid teams | Sprint planning + flow |

## Installation Options

### Basic Install
```bash
# Install to current project
aichaku install

# Install globally for all projects
aichaku install --global
```

### Advanced Options
```bash
# Force reinstall/update
aichaku install --force

# Install specific methodology only
aichaku install scrum

# Custom installation path
aichaku install --path ./custom/.claude
```

### Programmatic Usage
```typescript
import { install } from "jsr:@rick/aichaku";

// Install all methodologies
await install("all", { 
  global: true,
  force: false 
});
```

## What Gets Installed?

```
.claude/
└── methodologies/
    ├── core/
    │   ├── PLANNING-MODE.md
    │   ├── EXECUTION-MODE.md
    │   └── IMPROVEMENT-MODE.md
    ├── shape-up/
    │   ├── SHAPE-UP-AICHAKU-GUIDE.md
    │   └── templates/
    ├── scrum/
    │   ├── SCRUM-AICHAKU-GUIDE.md
    │   └── templates/
    └── [other methodologies...]
```

Each methodology includes an **Aichaku Guide** - a simplified, AI-friendly ruleset that helps Claude Code understand and apply the methodology effectively.

## Commands (Optional)

While aichaku works best with natural language, shortcuts are available:

- `/plan` - Activate planning mode
- `/build` - Start execution mode
- `/review` - Check improvements
- `/shape` - Shape Up specific
- `/sprint` - Scrum specific
- `/kanban` - Show board

## Development

```bash
# Clone repository
git clone https://github.com/RickCogley/aichaku.git
cd aichaku

# Run tests
deno task test

# Type check
deno task check

# Create release
deno task release:patch
```

## Philosophy

Traditional methodology tools force you to adapt to them. Aichaku reverses this - it helps Claude Code adapt to you. Whether you're a solo developer, startup team, or enterprise group, aichaku provides just enough process to be helpful without getting in the way.

## Why "aichaku"?

愛着 (aichaku) means developing attachment or affection for something over time. We chose this name because good development practices should feel natural and become something you're attached to, not forced to follow.

## Future Roadmap

- [x] Core 3-mode system
- [x] 6 major methodologies
- [x] Natural language activation
- [ ] Custom methodology builder
- [ ] Team analytics dashboard
- [ ] IDE integrations
- [ ] Methodology mixing wizard

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Rick Cogley

---

<p align="center">
  <i>Made with 愛着 - Bringing affection to your development workflow</i>
</p>