# Example: New CLAUDE.md with YAML Integration

This shows what CLAUDE.md will look like after implementing the YAML integration
system.

---

# CLAUDE.md

Project instructions for Claude Code.

<!-- AICHAKU:START -->

````yaml
aichaku:

  version: "2.0.0"
  project: "aichaku"

  # Methodology triggers and configuration
  methodologies:
    shape_up:
      triggers: ["shape", "appetite", "pitch", "betting", "6 weeks", "cycle"]
      integration_url: "aichaku://methodology/shape-up/guide"
      visual_indicator: "🎯"

    scrum:
      triggers: ["sprint", "backlog", "daily", "retrospective", "velocity"]
      integration_url: "aichaku://methodology/scrum/guide"
      visual_indicator: "🏃"

    kanban:
      triggers: ["board", "wip", "flow", "pull", "continuous"]
      integration_url: "aichaku://methodology/kanban/guide"
      visual_indicator: "📍"

    lean:
      triggers: ["mvp", "pivot", "experiment", "hypothesis", "validate"]
      integration_url: "aichaku://methodology/lean/guide"
      visual_indicator: "🧪"

  # Behavioral directives (no more huge markdown blocks!)
  directives:
    discussion_first:
      enabled: true
      phases:

        - name: "discussion"
          triggers: "${methodologies.*.triggers}"
          actions:

            - "acknowledge": "🪴 Aichaku: I see you're thinking about [topic]"

            - "ask_clarifying": true

            - "help_shape": true
          forbidden:

            - "create_folders"

            - "create_documents"

        - name: "ready"
          triggers: ["let's create", "I'm ready", "set up the project"]
          actions:

            - "create_immediately": true

            - "no*permission*asking": true

            - "use*descriptive*names": true

    visual_identity:
      prefix: "🪴 Aichaku:"
      growth_phases:
        new: "🌱"
        active: "🌿"
        mature: "🌳"
        complete: "🍃"
      progress_display: |
        [Phase] → [**Current**] → [Next]
                   ▲
        Week X/Y ████░░░░ XX%

    file_organization:
      project_root: "docs/projects/"
      structure:
        active: "active/active-YYYY-MM-DD-{name}/"
        done: "done/done-YYYY-MM-DD-{name}/"
      required_files:

        - "STATUS.md"

        - "{methodology}-specific.md"

  # Development standards references
  standards:
    selected: ["owasp-web", "iso-27001", "tdd", "clean-code"]
    integration_urls:
      owasp: "aichaku://standards/security/owasp"
      iso27001: "aichaku://standards/compliance/iso-27001"

  # Documentation standards
  documentation:
    standard: "diataxis"
    integration_url: "aichaku://standards/docs/diataxis"

  # MCP configurations
  mcp:
    reviewer:
      config_url: "aichaku://mcp/reviewer/config"
      blocklist_enabled: true
    statistics:
      enabled: true

  # User customizations
  customizations:
    include: ["~/.claude/aichaku/user-config.yaml"]
```text

<!-- AICHAKU:END -->

## Project Specific Instructions

[User's own project instructions continue here...]

---

## Size Comparison

### Before (Current System)

- **Size**: 50KB+

- **Lines**: 1,500+

- **Content**: Full Markdown guides duplicated inline

- **Maintenance**: Edit multiple places for updates

### After (YAML Integration)

- **Size**: ~2KB

- **Lines**: ~80

- **Content**: References to external content

- **Maintenance**: Update YAML, behavior follows

## Key Benefits

1. **Compact**: 96% size reduction

2. **Dynamic**: Content loaded based on context

3. **Maintainable**: Single source of truth

4. **Extensible**: Easy to add new methodologies

5. **Configurable**: User can customize behavior

6. **Readable**: Clear YAML structure

## How It Works

1. **Triggers**: When Claude sees keywords, it knows which methodology you're
   discussing

2. **Integration URLs**: MCP hooks resolve these to actual content

3. **Directives**: Define Claude's behavior without verbose instructions

4. **Visual Identity**: Consistent presentation across all interactions

5. **Standards**: Reference external documentation dynamically

This is the beautiful future of Aichaku integration! 🪴
````
