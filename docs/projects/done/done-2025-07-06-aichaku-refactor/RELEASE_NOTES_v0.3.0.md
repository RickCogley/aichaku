# Aichaku v0.3.0 Release Notes

## 🎉 Major Release: From Methodology Selector to Adaptive System

We're excited to announce Aichaku v0.3.0, a transformative release that
fundamentally reimagines how AI assistants work with project methodologies. This
release moves beyond simple methodology selection to create an adaptive system
that blends approaches based on natural language and context.

### 🌟 What's New

#### 1. **Command-Based CLI Architecture**

- **New `init` command**: Clean installation with proper directory structure
- **New `upgrade` command**: Seamless updates that preserve your customizations
- **New `uninstall` command**: Complete removal with safety checks
- **Improved help system**: Clear command documentation and examples

#### 2. **User Customization System**

- **Survives upgrades**: Your customizations in `user/` directory are preserved
- **Three customization types**:
  - `user/prompts/`: Custom prompts for your team
  - `user/templates/`: Project-specific templates
  - `user/methods/`: Override or extend methodologies
- **Clear separation**: Aichaku files vs. your files

#### 3. **Adaptive Methodology Blending**

- **Natural language detection**: Understands mixed terminology
- **Smart blending**: Combines methodologies based on context
- **No correction needed**: Works with how teams actually talk
- **Examples**:
  - "Let's do our daily standup and check the bets" → Blends Scrum ceremonies
    with Shape Up concepts
  - "Show our sprint progress on the kanban board" → Creates hybrid
    visualizations
  - "We need to shape our backlog" → Merges Shape Up shaping with Scrum backlog

#### 4. **Version Tracking System**

- **`.aichaku.json` file**: Tracks installation metadata
- **Version awareness**: Know what version you're running
- **Upgrade history**: See when upgrades happened
- **Installation type**: Distinguish global vs. local installs

### 📊 What Changed

#### CLI Refactoring

```bash
# Old way (v0.2.x)
aichaku install --global

# New way (v0.3.0)
aichaku init --global      # First time setup
aichaku upgrade            # Update existing installation
aichaku uninstall          # Remove installation
```

#### Directory Structure

```
.claude/
├── methodologies/         # Core methodology files (managed by Aichaku)
├── user/                  # Your customizations (preserved on upgrade)
│   ├── prompts/          # Custom prompts
│   ├── templates/        # Custom templates
│   └── methods/          # Custom methodologies
├── output/               # Your generated documents
└── .aichaku.json         # Version tracking
```

#### Methodology Approach

- **Before**: Selected single methodology based on keywords
- **Now**: Adaptively blends methodologies based on natural language
- **Result**: More natural interactions, better team adoption

### 🚀 Migration Guide

#### For Existing Users (v0.2.x → v0.3.0)

1. **Update Aichaku**:

   ```bash
   deno install -g -A -n aichaku --force jsr:@rick/aichaku@0.3.0/cli
   ```

2. **Backup existing installation** (recommended):

   ```bash
   cp -r ~/.claude ~/.claude.backup
   ```

3. **Run upgrade**:

   ```bash
   # For global installation
   aichaku upgrade --global

   # For project installation
   cd your-project
   aichaku upgrade
   ```

4. **Move customizations** (if any):
   - Move custom prompts to `.claude/user/prompts/`
   - Move custom templates to `.claude/user/templates/`
   - Move methodology overrides to `.claude/user/methods/`

#### For New Users

Simply run:

```bash
# Install Aichaku
deno install -g -A -n aichaku jsr:@rick/aichaku@0.3.0/cli

# Initialize globally
aichaku init --global

# Or initialize in a project
cd your-project
aichaku init
```

### 💡 Why This Matters

#### Better Team Adoption

Teams don't need to learn new terminology. Aichaku adapts to how your team
already talks about work, whether that's "sprints", "cycles", "flow", or any
combination.

#### Preserved Investment

Your customizations, templates, and team-specific adaptations are now
first-class citizens that survive upgrades. Build on Aichaku without fear of
losing work.

#### Natural AI Interactions

AI assistants can now understand and respond to mixed methodology language,
creating more helpful and contextual responses.

#### Future-Proof Architecture

The new command structure and version tracking system provides a solid
foundation for future enhancements while maintaining backward compatibility.

### 🔧 Technical Details

- **Zero dependencies**: Pure Deno implementation
- **Security first**: Path validation, no network operations
- **Fully typed**: TypeScript with strict mode
- **Test coverage**: Comprehensive tests for all commands

### 🙏 Acknowledgments

This release represents a significant evolution in how we think about
AI-assisted project management. Thank you to everyone who provided feedback on
the initial releases.

### 📚 Learn More

- [Full Documentation](https://github.com/RickCogley/aichaku)
- [Blending Guide](https://github.com/RickCogley/aichaku/blob/main/methodologies/BLENDING-GUIDE.md)
- [Migration Examples](https://github.com/RickCogley/aichaku/blob/main/docs/migration.md)

---

**Breaking Changes**: The CLI commands have changed. Use `aichaku init` instead
of `aichaku install`. See migration guide above.

**Security**: All file operations include path validation. No network
operations. See SECURITY.md for details.
