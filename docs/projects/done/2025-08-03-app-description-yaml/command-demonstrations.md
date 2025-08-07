# Command Demonstrations: App Description YAML Feature

## 1. `aichaku init` Flow

### Global Installation (First Time)

```bash
$ aichaku init --global

🪴 Welcome to Aichaku v0.41.0
    Adaptive methodology support for Claude Code

📦 Installing adaptive methodologies...
✅ Methodologies installed (49 files)
📚 Installing standards library...
✅ Standards library installed
📂 Installing core templates...
✅ Core templates installed
✅ Created user customization directory
✅ Created behavioral guides

🎯 Select your primary methodology:
   We recommend starting with one methodology.

1. 🏔️  Shape Up - 6-week cycles, complex features
2. 🏃  Scrum - Sprints, predictable delivery
3. 📊  Kanban - Continuous flow, ongoing support
4. 🚀  Lean Startup - MVPs, new products
5. 🔄  Scrumban - Hybrid approach
6. 💡  XP - Extreme Programming, code quality

Enter numbers (comma-separated, e.g., 1,2) [1]: 1
✅ Selected methodologies: shape-up

📏 Select your standards:
   Standards help ensure quality and consistency.

1. 📝  Conventional Commits - Structured commit messages
2. 🔺  Test Pyramid - Testing strategy
3. 🔒  NIST CSF - Security framework
4. 🏗️  Clean Architecture - Code organization
5. 📚  Diataxis + Google - Documentation style
6. 🧪  TDD - Test-Driven Development
7. 🌐  OWASP Top 10 - Web security
8. 🔧  SOLID - OOP principles
9. 📊  DORA - DevOps metrics

Enter numbers (comma-separated) [1,2,3]: 1,2,7
✅ Selected standards: conventional-commits, test-pyramid, owasp-web

📝 Would you like to describe your application for better Claude Code context?
   This helps Claude understand your tech stack, architecture, and business domain.

[Y/n]: y

🔍 What type of application is this?
1. Web Application (React, Vue, etc.)
2. API Service (REST, GraphQL, microservice)
3. Static Site (Blog, docs, marketing)
4. CLI Tool (Command line application)
5. General/Other

[1-5, default=5]: 3

🔄 Creating app description template...
✅ Created ~/.claude/aichaku/user/app-description.yaml (static-site template)

📝 Next steps:
1. Edit ~/.claude/aichaku/user/app-description.yaml to describe your app
2. Run 'aichaku integrate' to update your CLAUDE.md
3. See the template for examples and documentation

💡 Tip: The app description helps Claude Code understand your specific tech stack,
   architecture patterns, and business domain.

✅ Global installation complete!

📘 Learn more: Run 'aichaku learn' to explore methodologies
```

### Project Initialization (After Global)

```bash
$ cd my-blog-project
$ aichaku init

🪴 Aichaku: Checking requirements...
✅ Global installation found (v0.41.0)
🔄 Creating project structure...
✅ Created user customization directory
✅ Created output directory and behavioral guides

📚 Which methodology would you like to use as default?
   Available methodologies:
   1. Shape Up (6-week cycles, complex features)
   2. Scrum (2-4 week sprints, predictable delivery)
   3. Kanban (Continuous flow, ongoing support)
   4. Lean (MVP focus, new products)
   5. XP (Code quality, pair programming)
   6. Scrumban (Hybrid approach)

[1-6, default=1]: 3
✅ Selected kanban as default methodology

📝 Would you like to describe your application for better Claude Code context?
   This helps Claude understand your tech stack, architecture, and business domain.

[Y/n]: y

🔍 What type of application is this?
1. Web Application (React, Vue, etc.)
2. API Service (REST, GraphQL, microservice)
3. Static Site (Blog, docs, marketing)
4. CLI Tool (Command line application)
5. General/Other

[1-5, default=5]: 3

🔄 Creating app description template...
✅ Created .claude/aichaku/user/app-description.yaml (static-site template)

📝 Next steps:
1. Edit .claude/aichaku/user/app-description.yaml to describe your app
2. Run 'aichaku integrate' to update your CLAUDE.md
3. See the template for examples and documentation

💡 Tip: The app description helps Claude Code understand your specific tech stack,
   architecture patterns, and business domain.

🤔 Would you like to add Aichaku to this project's CLAUDE.md?
   This helps Claude Code understand your methodologies.

[Y/n]: y
🔄 Updating CLAUDE.md...
✅ CLAUDE.md updated with Aichaku reference

✅ Project initialization complete!
```

## 2. `aichaku app-description` Command

### Creating a New App Description (Default)

```bash
$ aichaku app-description

🔍 What type of application is this?
1. Web Application (React, Vue, etc.)
2. API Service (REST, GraphQL, microservice)  
3. Static Site (Blog, docs, marketing)
4. CLI Tool (Command line application)
5. General/Other

[1-5, default=5]: 1

🔄 Creating app description template...
✅ Created app-description.yaml (web-app template)

📝 Next steps:
1. Edit .claude/aichaku/user/app-description.yaml
2. Run 'aichaku integrate' to update CLAUDE.md
3. Use 'aichaku app-description --validate' to check syntax
```

### Validating App Description

```bash
$ aichaku app-description --validate

🪴 Aichaku: Validating app description...
✅ App description is valid!
```

Or with errors:

```bash
$ aichaku app-description --validate

🪴 Aichaku: Validating app description...
❌ Validation failed:
  ❌ Missing required field: application.name
  ❌ Invalid application.type: webapp. Must be one of: web-application, api-service, cli-tool, mobile-app, desktop-app, library
```

### Viewing Current App Description

```bash
$ aichaku app-description --show

📄 Current App Description:
──────────────────────────────────────────────────
# Aichaku App Description
# This file helps Claude Code understand your specific application context

application:
  name: "eSolia Blog"
  type: "web-application"
  description: "Corporate blog and news site built with Lume static site generator"
  version: "2.0.0"
  
  stack:
    language: "typescript"
    runtime: "deno"
    framework: "lume"
    database: "none"
    deployment: "static"
    hosting: "netlify"
    
  architecture:
    pattern: "jamstack"
    
  # ... rest of configuration ...
──────────────────────────────────────────────────

💡 To edit: .claude/aichaku/user/app-description.yaml
💡 To apply: aichaku integrate
```

## 3. `aichaku upgrade` with App Description Prompt

```bash
$ aichaku upgrade

🪴 Aichaku: Checking for updates...
📦 Downloading latest methodologies...
✅ Methodologies updated (49 files verified/updated)
📚 Updating standards library...
✅ Standards library updated
📂 Updating core templates...
✅ Core templates updated

🆕 New feature available: App Description YAML
   Provide Claude Code with rich context about your application.

📝 Would you like to add an app description? (Y/n): y

🔍 What type of application is this?
1. Web Application (React, Vue, etc.)
2. API Service (REST, GraphQL, microservice)
3. Static Site (Blog, docs, marketing)
4. CLI Tool (Command line application)
5. General/Other

[1-5, default=5]: 2

🔄 Creating app description template...
✅ Created ~/.claude/aichaku/user/app-description.yaml (api-service template)

📝 Next steps:
1. Edit ~/.claude/aichaku/user/app-description.yaml to describe your app
2. Run 'aichaku integrate' to update your CLAUDE.md
3. See the template for examples and documentation

✅ Upgrade to v0.41.0 complete!

📁 Installation location: ~/.claude/aichaku/
   ├── methodologies/ (49 files verified/updated)
   ├── standards/ (45 files verified/updated)
   ├── user/ (preserved - your customizations)
   └── config.json (metadata updated to v0.41.0)

💡 All your projects now have the latest methodologies!
```

## 4. What the Created Template Looks Like

When you select "Static Site", here's a snippet of what gets created:

```yaml
# Aichaku App Description Template - Static Site
# Optimized for SSG sites, blogs, documentation, JAMstack
# Copy to .claude/aichaku/user/app-description.yaml and customize

application:
  # === BASIC INFORMATION (Required) ===
  name: "My Static Site"
  type: "web-application" # Static sites are still web applications
  description: "Static site built with modern SSG tools"
  version: "2.0.0"

  # === TECHNOLOGY STACK ===
  stack:
    # Static Site Generator
    language: "typescript" # typescript, javascript, ruby, python, go
    runtime: "deno" # deno, node, ruby, python, go
    framework: "lume" # lume, gatsby, nextjs, hugo, jekyll, 11ty, astro

    # No Backend Services
    database: "none" # Static sites have no database
    api: "none" # May use external APIs

    # Build & Deploy
    deployment: "static" # Always static for SSG
    hosting: "netlify" # netlify, vercel, github-pages, cloudflare-pages, s3
    cdn: "netlify" # Built-in CDN with most static hosts

    # Content Management
    cms: "markdown" # markdown, netlify-cms, forestry, contentful, none

  # ... rest of template with helpful comments ...
```

## Key Features Demonstrated

1. **Interactive Prompts** - User-friendly selection menus
2. **Contextual Help** - Explains why app descriptions are valuable
3. **Template Selection** - Different templates for different app types
4. **Next Steps Guidance** - Clear instructions on what to do next
5. **Non-Intrusive** - Can skip if not ready (answer 'n')
6. **Validation Support** - Check YAML syntax before integrating
7. **Visual Feedback** - Progress indicators and success messages

The commands integrate seamlessly into the existing Aichaku workflow while adding powerful new capabilities for
providing Claude Code with application-specific context!
