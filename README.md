# aichaku (愛着)

> ## ⚠️ This project is being retired
>
> Active development stopped in 2025-07. After audit (no external adopters, 0 JSR dependents, single external issue
> ever), the maintainer has decided to retire aichaku and consolidate the value into smaller, focused tools. **The
> simpler post-migration setup of devkit slash commands + the `esolia-standards` MCP works better for the actual usage
> pattern.**
>
> See [#17](https://github.com/RickCogley/aichaku/issues/17) for the full retirement plan, and the salvage targets:
>
> - **Pre-commit hooks orchestrator** is being lifted into
>   [`eSolia/devkit#84`](https://github.com/eSolia/devkit/issues/84)
> - **Methodology cheat-sheets** (Shape Up / Scrum / Kanban / XP / Lean / Scrumban) are being imported into the
>   `esolia-standards` MCP — see [`eSolia/codex#158`](https://github.com/eSolia/codex/issues/158)
> - Smaller utility code (path-security, security-pattern catalog, Diátaxis linter) is tracked for on-demand lift in
>   [`eSolia/devkit#85`](https://github.com/eSolia/devkit/issues/85)
>
> The repo will be archived once those land. Existing installs continue to work — git history and JSR versions are
> preserved indefinitely. No new releases planned.
>
> If you have something on aichaku and need help migrating, open an issue before archive lands.

---

**Adaptive developer support for Claude Code that blends selected methodologies, standards, and principles based on how
you naturally work**

[![JSR](https://jsr.io/badges/@rick/aichaku)](https://jsr.io/@rick/aichaku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Documentation](https://img.shields.io/badge/docs-cloudflare-orange)](https://aichaku-docs.esolia.workers.dev/)

## ⚡ Quick Start

### Step 1: Install aichaku

```bash
# Install the CLI from JSR
deno install -g -A -n aichaku jsr:@rick/aichaku/cli
```

### Step 2: Global Setup (one-time)

```bash
# Initialize aichaku globally
aichaku init --global
```

### Step 3: Project Setup

```bash
# Navigate to your project
cd /path/to/your-project

# Initialize aichaku for this project
aichaku init

# Select a methodology when prompted (e.g., shape-up for solo dev)
# Add standards that match your project
aichaku standards --add tdd,clean-arch

# Add principles you follow
aichaku principles --add dry,kiss

# Generate CLAUDE.md with your selections
aichaku integrate
```

### Step 4: Start Coding!

Now Claude Code understands your workflow:

- Say "let's shape up a feature" → Shape Up mode
- Say "write tests first" → TDD approach
- Say "keep it simple" → KISS principle applied

## What is aichaku?

Aichaku (愛着 - "affection/attachment") helps Claude Code understand your development workflow.

- **Install once globally** - Works across all your projects
- **Natural language aware** - Claude responds to your language within your selected methodologies
- **Context-efficient** - Load only what you need, reducing from 50K+ tokens (traditional Markdown docs) to ~4K
- **Methodology blending** - Mix multiple approaches when needed
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

## 🔄 Upgrading aichaku

To upgrade to the latest version of aichaku, you need to refresh Deno's cache and reinstall:

```bash
# Refresh cache and force reinstall
deno cache --reload jsr:@rick/aichaku/cli && deno install -g -A -n aichaku --force jsr:@rick/aichaku/cli

# Verify the upgrade
aichaku --version

# Update your global installation's content
aichaku upgrade --global
```

**Why the cache reload?** Deno aggressively caches modules. Without `--reload`, you might get the old version even with
`--force`.

## 🏗️ What You Get

**Methodologies:** Shape Up, Scrum, Kanban, XP, Lean, Scrumban **Standards:** OWASP, TDD, Clean Architecture, Google
Style, NIST-CSF **Principles:** DRY, KISS, YAGNI, SOLID, Unix Philosophy **Agents:** Security, API, Documentation, Code
Explorer, Methodology Coach

## 📖 Documentation

- **[API Docs](https://aichaku-docs.esolia.workers.dev/)** - Complete TypeScript reference
- **[GitHub](https://github.com/RickCogley/aichaku/tree/main/docs)** - Full documentation and guides
- **[JSR Package](https://jsr.io/@rick/aichaku)** - Package registry

## 🚀 How It Works

Aichaku works by loading your selected methodologies, then Claude responds naturally to your language:

```text
# With Shape Up loaded:
You: "Let's shape up this feature"
Claude: [Uses Shape Up methodology]

# With Scrum loaded:
You: "Time for our sprint planning"
Claude: [Uses Scrum practices]

# With multiple methodologies:
You: "Show me our kanban board" 
Claude: [Uses Kanban if loaded, or suggests adding it]
```

**The key difference from early versions:** You explicitly choose which methodologies to load (keeping context lean),
then Claude naturally responds to your language within those loaded frameworks.

**The key:** You select what you want to use. Claude works within your selections, not through magic detection.

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
- Context overload from loading everything

**Aichaku solution:**

- **96% size reduction vs verbose Markdown** - YAML-based config instead of repetitive explanations
- **One-command updates** - Global installation, project references
- **Smart selection** - Choose what you need, blend when necessary

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
