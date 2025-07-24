# Getting Started with Aichaku

Welcome to Aichaku! This tutorial teaches you how to install Aichaku and create
your first project. By the end, you'll understand how Aichaku helps Claude work
with your team using development methodologies.

## What you'll learn

In this tutorial, you'll:

- Install Aichaku on your system
- Set up your first project with a methodology
- Add coding standards to your project
- Create your first planning document with Claude
- Understand the basic workflow

## Before you begin

You need:

- **Deno runtime** (version 2.4.0 or higher)
- **Write access** to your home directory
- **5 minutes** to complete this tutorial

Don't have Deno? Install it with:

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex
```

## Step 1: Install Aichaku

Install Aichaku globally so you can use it in any project:

```bash
deno install --allow-read --allow-write --allow-env --allow-run \
  -n aichaku https://jsr.io/@rick/aichaku/cli.ts
```

### Verify your installation

Check that Aichaku installed correctly:

```bash
aichaku --version
```

You should see version information. If you get "command not found", add Deno to
your PATH:

```bash
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Step 2: Initialize Aichaku globally

Set up Aichaku's global configuration in your home directory:

```bash
aichaku init --global
```

This creates a `~/.claude/` directory with:

- Methodology templates (Shape Up, Scrum, Kanban, etc.)
- Coding standards library
- Global Claude configuration

### Verify the setup

Look at what was created:

```bash
ls -la ~/.claude/
```

You'll see directories for methodologies, standards, and a CLAUDE.md file.

## Step 3: Create your first project

Navigate to any project directory (or create a new one):

```bash
mkdir my-awesome-project
cd my-awesome-project
```

Initialize Aichaku in your project:

```bash
aichaku init
```

This creates a `.claude/` directory in your project with everything Claude
needs.

### Integrate with Claude

Add Aichaku's rules to your project so Claude knows how to work with you:

```bash
aichaku integrate
```

This updates your project's CLAUDE.md file with Aichaku's methodology support.

## Step 4: Add coding standards

View available standards:

```bash
aichaku standards --list
```

Add some essential standards to your project:

```bash
aichaku standards --add nist-csf,tdd,conventional-commits
```

These standards help Claude write secure, tested, and well-documented code.

### Verify your standards

Check which standards are active:

```bash
aichaku standards --list --selected
```

## Step 5: Start working with Claude

Now you're ready to use Aichaku with Claude! Open Claude and try:

```
"I need to plan a new user authentication feature"
```

Claude will:

1. Recognize you're in planning mode
2. Ask clarifying questions
3. Help you shape the idea
4. Create project documents when you're ready
5. **Automatically save session summaries** when you finish working

When you're ready to create documents, say:

```
"Let's create a project for this"
```

Claude creates organized documents in `docs/projects/active/YYYY-MM-DD-*/`.

### ⭐ Automatic Session Summaries

Aichaku automatically creates structured summaries of your work:

- 📄 **Saved automatically** when conversations end or are compacted
- 📋 **Organized** in `docs/checkpoints/` directory
- 📅 **Timestamped** for easy reference
- 📝 **Structured** with session overview, decisions, files modified, and next
  steps

No more losing context between sessions!

## What happens behind the scenes

When you initialized Aichaku:

1. **All methodologies** were copied to your project
   - You can use Shape Up, Scrum, Kanban, or mix them
   - Switch methodologies anytime without setup

2. **Selected standards** were added to CLAUDE.md
   - Only the standards you chose are active
   - They guide Claude's code generation

3. **Project structure** was created
   - `.claude/methodologies/` - All available workflows
   - `.claude/output/` - Your actual work
   - `.claude/CLAUDE.md` - Claude's instructions

## Try it yourself

### Exercise 1: Explore methodologies

Look at the available methodologies:

```bash
ls ~/.claude/methodologies/
```

Read a methodology guide:

```bash
cat ~/.claude/methodologies/shape-up/SHAPE-UP-AICHAKU-GUIDE.md
```

### Exercise 2: Mix methodologies

With Claude, try:

```
"I want to use Scrum sprints but with a Kanban board for tracking"
```

Aichaku supports mixing methodologies because real teams work this way.

### Exercise 3: View a standard

Look at one of your selected standards:

```bash
aichaku standards --show tdd
```

This shows you the exact guidance Claude follows when writing tests.

## Next steps

You've successfully:

- ✅ Installed Aichaku
- ✅ Set up a project
- ✅ Added coding standards
- ✅ Learned the basic workflow
- ✅ **Enabled automatic session summaries** ⭐

**Quality Note**: Aichaku follows enterprise-grade engineering standards with
automated pre-flight checks (format/lint/type-check/test), configuration-as-code
architecture, and consistent branding across all commands. This ensures
reliability and maintainability for professional development workflows.

Continue learning:

- Read [First Project Tutorial](first-project.md) to build something real
- Check [Configure Your Project](../how-to/configure-project.md) for
  customization
- Explore [Core Concepts](../explanation/core-concepts.md) to understand the
  philosophy

## Getting help

- Run `aichaku help` for command reference
- Visit [GitHub Issues](https://github.com/RickCogley/aichaku/issues) for
  support
- Read the [Configuration Options](../reference/configuration-options.md) for
  detailed settings

Remember: Aichaku makes Claude a better development partner by providing
structure without rigidity. Happy coding!
