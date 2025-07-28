# Getting Started with Aichaku Documentation

Welcome to the Aichaku documentation! This guide uses the Diátaxis framework to help you find exactly what you need.

## Prerequisites

Before you start using Aichaku:

- **Claude Code** - You need access to [Claude Code](https://claude.ai/code) to use Aichaku
- **Git repository** - A project with git initialized
- **Basic familiarity** with development methodologies (Shape Up, Scrum, Kanban, or Lean)
- **Text editor** - Any editor that supports Markdown files

## 🆕 Latest Updates

**v0.35.0+ - Sub-Agent Architecture & Technology Experts**

- **🤖 NEW**: **Sub-Agent System** - Specialized agents for focused assistance (security, docs, API design)
- **💻 NEW**: **Technology Experts** - Language-specific guidance (TypeScript, Python, Go, React, Deno, etc.)
- **🔄 IMPROVED**: **Context Optimization** - 70% reduction in context usage (12K→4K tokens)
- **📚 NEW**: **Agent Templates** - 15+ expert agents with ~10 code examples each
- **🎯 NEW**: **Smart Delegation** - Agents coordinate and hand off tasks automatically
- **🧭 NEW**: **Orchestrator Agent** - General workflow coordinator for all projects

**The Context Revolution:** Sub-agents maintain their own focused context windows, enabling long development sessions
without losing continuity. Each agent specializes in specific domains while coordinating through the orchestrator.

**v0.31.2+ - Foundation Quality & Pre-flight Standards**

- **🏗️ FOUNDATION**: **Configuration-as-code compliance** - All hardcoded lists eliminated for maintainability
- **🎨 CONSISTENCY**: **Unified branding** - All commands now use consistent `🪴 Aichaku:` messaging
- **🧹 CLEANUP**: **Legacy file elimination** - Removed outdated RULES-REMINDER.md creation
- **⚡ PRE-FLIGHT**: **Senior engineer standards** - Automated linting, type checking, and testing workflow
- **🔧 VISUAL GUIDANCE**: **Contextual feedback framework** - "What did I do and where" + "What's next" patterns
- **✅ RELIABILITY**: **Help screen compliance** - All commands properly respect --help flag
- **🔍 TYPE SAFETY**: **Zero TypeScript errors** - Complete type checking compliance

**v0.29.0 - YAML Configuration Revolution & Enhanced Automation**

- **🔧 REVOLUTIONARY**: **YAML-based "configuration as code"** - 96% reduction in file sizes (50KB→2KB)
- **🏗️ NEW**: Modular configuration system with dynamic assembly and smart merging
- **🎯 NEW**: Project-specific overrides with inheritance from global configuration
- **📝 NEW**: **Automatic session summaries** - Never lose context with automatic checkpoint creation
- **🔗 NEW**: TypeScript-based hooks system for Claude Code automation
- **🐙 NEW**: GitHub integration hooks (todo-tracker, pr-checker, etc.)
- **📖 NEW**: Documentation review hooks (docs-review, jsdoc-checker)
- **⚡ IMPROVED**: Standards command with better search and management
- **📚 IMPROVED**: Comprehensive JSDoc for better API documentation
- Enhanced hook categories: Essential, Productivity, Security, and GitHub

**The Game Changer:** Instead of massive, hardcoded CLAUDE.md files, Aichaku now uses modular YAML configurations that
are dynamically assembled. Update one YAML file, and all your projects benefit instantly!

## 📚 Documentation Types

### 🎓 [Tutorials](tutorials/)

**Learning-oriented** - Start here if you're new to Aichaku

- [Getting Started](tutorials/getting-started.md) - Install and set up Aichaku
- [Your First Project](tutorials/first-project.md) - Build a real feature with Aichaku
- [Migrate to New Structure](tutorials/migrate-to-new-structure.md) - Update from v0.19.x to v0.20.0+

### 🔧 [How-to Guides](how-to/)

**Task-oriented** - Practical guides for specific tasks

- [**Configure YAML Directives**](how-to/configure-yaml-directives.md) - **REVOLUTIONARY: 96% smaller files with modular
  configuration** 🔧
- [**Configure MCP Servers**](how-to/configure-mcp-servers.md) - **CRITICAL: Set up MCP for Claude Code** ⚠️
- [Configure Your Project](how-to/configure-project.md) - Customize Aichaku with standards and methodologies
- [Manage Custom Standards](how-to/manage-custom-standards.md) - Create and share your own coding standards
- [Using MCP with Multiple Projects](how-to/use-mcp-with-multiple-projects.md) - Share server across projects

### 📖 [Reference](reference/)

**Information-oriented** - Complete technical reference

- [Configuration Options](reference/configuration-options.md) - All settings and options
- [File Structure](reference/file-structure.md) - Complete file organization reference
- [MCP API Reference](reference/mcp-api.md) - All available tools and commands

### 🔗 [Hooks](hooks/)

**Automation-oriented** - Claude Code integration hooks

- [**Conversation Summary**](hooks/conversation-summary.md) - **AUTOMATIC session checkpoints** ⭐
- [Aichaku Feedback](hooks/aichaku-feedback.md) - Visual confirmation system

### 💡 [Explanation](explanation/)

**Understanding-oriented** - The "why" behind Aichaku

- [Core Concepts](explanation/core-concepts.md) - Fundamental ideas and principles
- [Architecture](explanation/architecture.md) - System design and structure
- [Design Philosophy](explanation/design-philosophy.md) - Why Aichaku works this way

## 🚀 Where to Start?

### New to Aichaku?

1. Start with [Getting Started](tutorials/getting-started.md)
2. Follow [Your First Project](tutorials/first-project.md)
3. Read [Core Concepts](explanation/core-concepts.md)

### Need to accomplish something specific?

- Browse [How-to Guides](how-to/) for your task
- Check [Reference](reference/) for detailed information

### Want to understand Aichaku deeply?

- Read [Design Philosophy](explanation/design-philosophy.md)
- Study [Architecture](explanation/architecture.md)

## 📋 Quick Links

### Most Common Tasks

- [Install Aichaku](tutorials/getting-started.md#step-1-install-aichaku)
- [Add coding standards](how-to/configure-project.md#add-or-remove-coding-standards)
- [Create custom standards](how-to/manage-custom-standards.md)
- [Migrate to new structure](tutorials/migrate-to-new-structure.md)
- [Customize templates](how-to/configure-project.md#customize-methodology-templates)
- [Mix methodologies](explanation/core-concepts.md#methodology-inclusive)

### Essential Reference

- [All MCP tools](reference/mcp-api.md)
- [Configuration options](reference/configuration-options.md)
- [Visual indicators](reference/configuration-options.md#visual-indicators)
- [File structure](reference/file-structure.md)
- [**Automatic session summaries**](hooks/conversation-summary.md) - Never lose context! ⭐

### Key Concepts

- [Methodologies vs Standards](explanation/core-concepts.md#the-fundamental-design-principle)
- [The three modes](explanation/core-concepts.md#the-three-modes)
- [Two-phase approach](explanation/core-concepts.md#the-two-phase-approach)

## 🎯 Finding What You Need

### By User Type

**Solo Developer**

- [Getting Started](tutorials/getting-started.md)
- [Configure Your Project](how-to/configure-project.md)
- [Core Concepts](explanation/core-concepts.md)

**Team Lead**

- [Configure Your Project](how-to/configure-project.md)
- [Create Custom Standards](how-to/manage-custom-standards.md)
- [Team Configuration](how-to/configure-project.md#set-up-team-configurations)
- [Design Philosophy](explanation/design-philosophy.md)

**Enterprise User**

- [Using MCP with Multiple Projects](how-to/use-mcp-with-multiple-projects.md)
- [Security Configuration](how-to/configure-project.md#configure-security-standards)
- [Architecture](explanation/architecture.md)

### By Methodology

**Shape Up**

- [Configure Your Project](how-to/configure-project.md)
- [File Structure Reference](reference/file-structure.md)

**Scrum**

- [Configure Your Project](how-to/configure-project.md)
- [File Structure Reference](reference/file-structure.md)

**Kanban**

- [Configure Your Project](how-to/configure-project.md)
- [File Structure Reference](reference/file-structure.md)

## 📝 Documentation Principles

This documentation follows these principles:

1. **You/your pronouns** - We address you directly
2. **Present tense** - We describe what happens now
3. **Examples first** - We show, then explain
4. **Task-focused** - We help you accomplish goals
5. **Clear structure** - We organize by purpose

## 🤝 Contributing

Found an issue or want to improve the docs?

- File an issue on [GitHub](https://github.com/RickCogley/aichaku/issues)
- Read our [Contributing Guide](CONTRIBUTING.md)
- Submit a pull request

## 📄 License

Aichaku is MIT licensed. See [LICENSE](LICENSE) for details.
