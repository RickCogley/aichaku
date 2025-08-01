# aichaku (愛着)

**Adaptive developer support for Claude Code that blends selected methodologies, standards, and principles based on how
you naturally work**

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Documentation](https://img.shields.io/badge/API_docs-deno.dev-blue)](https://aichaku.esolia.deno.net/)

## ⚡ Quick Start

```bash
# Install aichaku CLI from JSR
deno install -g -A -n aichaku jsr:@rick/aichaku/cli

# Set up once globally, use everywhere
aichaku init --global
cd your-project
aichaku init
aichaku integrate

# Now Claude Code understands your methodology!
# Say "let's shape up a feature" or "start a sprint" - Claude adapts
```

## What is aichaku?

Aichaku (愛着 - "affection/attachment") helps Claude Code understand your development workflow.

- **Install once globally** - Works across all your projects
- **Natural language** - Say "sprint" → get Scrum, "shaping" → get Shape Up
- **Adaptive blending** - Mix methodologies based on your language
- **Compact context** - Reduces Claude memory from 12K→4K tokens via YAML config
- **Current version:** 0.40.1

### Key Features

- Select methodologies (Shape Up, Scrum, Kanban), standards (OWASP, TDD), principles (DRY, KISS)
- Specialized agents for security, API design, documentation, code exploration
- YAML configuration system prevents context bloat
- MCP server integration for advanced project analysis

## 🔧 Essential Commands

```bash
# Core workflow
aichaku init --global        # One-time setup
aichaku init                 # Add to project
aichaku standards --add tdd,owasp-web,clean-arch
aichaku principles --add dry,kiss
aichaku integrate           # Merge into CLAUDE.md

# Management
aichaku upgrade --global    # Update methodologies
aichaku hooks --install essential  # Auto session summaries
aichaku mcp --install      # Advanced project analysis
```

## 🏗️ What You Get

**Methodologies:** Shape Up, Scrum, Kanban, XP, Lean, Scrumban **Standards:** OWASP, TDD, Clean Architecture, Google
Style, NIST-CSF **Principles:** DRY, KISS, YAGNI, SOLID, Unix Philosophy **Agents:** Security, API, Documentation, Code
Explorer, Methodology Coach

## 📖 Documentation

- **[API Docs](https://aichaku.esolia.deno.net/)** - Complete TypeScript reference
- **[GitHub](https://github.com/RickCogley/aichaku)** - Full documentation and guides
- **[JSR Package](https://jsr.io/@rick/aichaku)** - Package registry

## 🚀 How It Works

Aichaku uses **natural language detection**:

```text
You: "Let's shape up this feature"
Claude: [Uses Shape Up methodology]

You: "Time for our sprint planning"
Claude: [Uses Scrum practices]

You: "Show me our kanban board"
Claude: [Creates Kanban workflow]
```

**3-Mode System:**

- **Planning** - "let's plan" → methodology-specific planning
- **Execution** - "let's build" → development with appropriate constraints
- **Improvement** - "retrospective" → process improvement

## ⚙️ Advanced Usage

### Programmatic API

```typescript
import { init, integrate } from "jsr:@rick/aichaku";

await init({ global: true });
await integrate({ projectPath: "./my-project" });
```

### MCP Server Setup

```bash
aichaku mcp --install
claude mcp add -s user aichaku-reviewer ~/.aichaku/mcp-servers/aichaku-code-reviewer
```

## 🧩 Why aichaku?

**Traditional problems:**

- 50KB+ CLAUDE.md files with repetitive content
- Manual updates across multiple projects
- Methodology vendor lock-in

**Aichaku solution:**

- **96% size reduction** - YAML config generates compact directives
- **One-command updates** - Global installation, project references
- **Methodology freedom** - Blend approaches naturally

## 🔄 Development

```bash
git clone https://github.com/RickCogley/aichaku.git
cd aichaku
deno task test
```

## 📜 License

MIT © Rick Cogley

---

<p align="center">
  <i>愛着 - Bringing affection to your development workflow</i>
</p>
