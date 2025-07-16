# Improved YAML Structure for CLAUDE.md

## Current Problems

1. **Too Sparse**: The current YAML example lacks context and descriptive information
2. **Missing Directives**: The `METHODOLOGY_SECTION` rules aren't represented in YAML
3. **No Clear Purpose**: Unclear what the YAML is for or how Claude should use it
4. **No References**: No way to access full documentation when needed

## Proposed Enhanced YAML Structure

```yaml
# Aichaku Configuration
# This YAML block provides Claude with methodology triggers and behavioral rules
# Full documentation available at: ~/.claude/aichaku/
aichaku:
  version: "3.0.0"
  description: "Adaptive methodology support system for software development"
  generated: "2025-01-15T20:30:00Z"
  
  # Core behavioral directives Claude must follow
  directives:
    visual_identity:
      prefix: "🪴 Aichaku:"
      phases:
        new: "🌱"
        active: "🌿" 
        mature: "🌳"
        complete: "🍃"
      rules:
        - "Always prefix Aichaku messages with 🪴 Aichaku:"
        - "Show growth phase in status updates"
        - "Never use garden metaphors in text"
    
    discussion_first:
      description: "Discuss and understand before creating any documents"
      phases:
        - name: "discussion"
          triggers: ["shape", "sprint", "kanban", "mvp", "methodology keywords"]
          actions:
            - "Acknowledge: '🪴 Aichaku: I see you're thinking about [topic]'"
            - "Ask clarifying questions"
            - "Help refine the approach"
          forbidden:
            - "Creating project folders"
            - "Creating documents"
            - "Asking 'Would you like me to create...'"
        
        - name: "ready"
          triggers: 
            - "Let's create a project for this"
            - "I'm ready to start"
            - "Set up the project"
            - "Create the documentation"
          actions:
            - "Immediately say: '🪴 Aichaku: Creating project: [name]'"
            - "Create ALL documents in docs/projects/active/"
            - "Create STATUS.md FIRST"
          forbidden:
            - "Asking for confirmation"
            - "Saying 'Would you like me to...'"
    
    project_structure:
      base_path: "docs/projects/active/YYYY-MM-DD-{descriptive-name}/"
      required_files:
        - "STATUS.md (with mermaid diagram)"
        - "[methodology]-specific documents"
      forbidden_locations:
        - "Project root directory"
        - ".claude/user/ (reserved for customizations)"
      date_format: "Use TODAY's actual date from environment"
    
    progress_tracking:
      display_format: "[Phase] → [**Current**] → [Next] ▲"
      example: |
        🪴 Aichaku: Shape Up Progress
        [Shaping] → [**Betting**] → [Building] → [Cool-down]
                      ▲
        Week 2/6 ████████░░░░░░░░ 33% 🌿
    
    mermaid_diagrams:
      required: true
      status_diagram: |
        graph LR
          A[🌱 Started] --> B[🌿 Active]
          B --> C[🌳 Review]
          C --> D[🍃 Complete]
          style B fill:#90EE90
    
    git_workflow:
      on_complete:
        - "Create YYYY-MM-DD-{Project-Name}-CHANGE-LOG.md"
        - "Rename folder: active-* → done-*"
        - "Use conventional commits: feat:/fix:/docs:/refactor:"
        - "Ask: 'Work appears complete. Shall I commit and push?'"
  
  # Available methodologies with full context
  methodologies:
    shape_up:
      name: "Shape Up"
      description: "Basecamp's product development methodology with fixed time, variable scope"
      triggers: ["shape", "appetite", "pitch", "betting table", "6 weeks", "cycle", "bet", "cool-down"]
      best_for: "Features with unclear solutions, fixed timeline projects, avoiding scope creep"
      key_concepts:
        appetite: "Time willing to spend (not estimate)"
        shaping: "Define problem + rough solution upfront"
        betting: "Choose what to work on"
        circuit_breaker: "Hard stop at 6 weeks"
      icons:
        betting: "🎯"
        building: "🔨"
      cycle: "6 weeks build + 2 weeks cooldown"
      documents:
        - "pitch.md"
        - "hill-chart.md"
      reference: "~/.claude/aichaku/methodologies/shape-up/"
    
    scrum:
      name: "Scrum"
      description: "Iterative development with fixed-length sprints and defined roles"
      triggers: ["sprint", "scrum", "velocity", "standup", "product owner", "backlog", "retrospective"]
      best_for: "Teams needing predictable delivery, client visibility, regular rhythm"
      key_concepts:
        sprint: "Fixed time iteration (1-4 weeks)"
        roles: ["Product Owner", "Scrum Master", "Development Team"]
        ceremonies: ["Sprint Planning", "Daily Standup", "Sprint Review", "Retrospective"]
      icons:
        sprint: "🏃"
        backlog: "📋"
      documents:
        - "sprint-planning.md"
        - "retrospective.md"
      reference: "~/.claude/aichaku/methodologies/scrum/"
    
    kanban:
      name: "Kanban"
      description: "Continuous flow system with visual boards and WIP limits"
      triggers: ["kanban", "flow", "WIP limit", "continuous", "pull", "board", "column"]
      best_for: "Continuous flow work, support teams, varying priorities, starting simply"
      key_concepts:
        wip_limits: "Limit work in progress"
        pull_system: "Pull work when capacity available"
        continuous_flow: "No fixed iterations"
      icons:
        card: "📍"
        flow: "🌊"
      documents:
        - "kanban-board.md"
      reference: "~/.claude/aichaku/methodologies/kanban/"
    
    lean:
      name: "Lean Startup"
      description: "Build-Measure-Learn cycles for validated learning"
      triggers: ["MVP", "lean", "experiment", "validate", "pivot", "hypothesis"]
      best_for: "Startups, MVPs, experimentation, uncertainty, learning fast"
      key_concepts:
        mvp: "Minimum Viable Product"
        validated_learning: "Test assumptions with real users"
        pivot: "Change direction based on learning"
      icons:
        experiment: "🧪"
        metrics: "📊"
      documents:
        - "experiment-plan.md"
        - "mvp-definition.md"
      reference: "~/.claude/aichaku/methodologies/lean/"
    
    xp:
      name: "Extreme Programming"
      description: "Engineering practices for high-quality software"
      triggers: ["TDD", "test first", "pair programming", "refactor", "XP", "continuous integration"]
      best_for: "Quality-critical code, learning teams, complex technical challenges"
      key_practices:
        - "Test-Driven Development"
        - "Pair Programming"
        - "Continuous Integration"
        - "Refactoring"
        - "Simple Design"
      documents:
        - "xp-practices.md"
      reference: "~/.claude/aichaku/methodologies/xp/"
    
    scrumban:
      name: "Scrumban"
      description: "Hybrid combining Scrum structure with Kanban flow"
      triggers: ["scrumban", "hybrid", "sprint flow", "planning triggers"]
      best_for: "Teams transitioning between methods, combining structure with flow"
      combines:
        from_scrum: ["Roles", "Planning", "Reviews"]
        from_kanban: ["Continuous flow", "WIP limits", "Pull system"]
      documents:
        - "scrumban-board.md"
      reference: "~/.claude/aichaku/methodologies/scrumban/"
  
  # Only selected standards are included (example with owasp and tdd)
  standards:
    owasp_web:
      name: "OWASP Top 10 Web Security"
      category: "security"
      triggers: ["OWASP", "security check", "vulnerability", "top 10", "injection", "XSS"]
      focus: "Essential web application security verification"
      key_rules:
        - "A01: Broken Access Control"
        - "A02: Cryptographic Failures"
        - "A03: Injection"
        - "...and 7 more"
      applies_to: ["Web APIs", "Web Applications", "Services"]
      reference: "~/.claude/aichaku/standards/security/owasp-web.md"
    
    tdd:
      name: "Test-Driven Development"
      category: "development"
      triggers: ["TDD", "test first", "red green refactor", "test driven"]
      focus: "Write tests before implementation code"
      cycle: "Red → Green → Refactor"
      rules:
        - "Write a failing test first"
        - "Write minimal code to pass"
        - "Refactor while keeping tests green"
      benefits: ["Better design", "Full coverage", "Confidence in changes"]
      reference: "~/.claude/aichaku/standards/development/tdd.md"
```

## Key Improvements

1. **Rich Context**: Each item has name, description, and purpose
2. **Directives Included**: All behavioral rules from METHODOLOGY_SECTION in structured format
3. **Clear Organization**: Separates directives, methodologies, and standards
4. **Actionable Information**: Specific triggers, actions, and forbidden behaviors
5. **References**: Points to full documentation without bloating the file
6. **Examples**: Shows exact format for progress displays and diagrams
7. **Metadata**: Version, generation time, and description for context

## Size Comparison

- **Old approach**: Full markdown content = 50KB+
- **New approach**: Rich YAML metadata = ~3-4KB
- **Reduction**: ~92% while maintaining all essential information

## Usage by Claude

When Claude reads this YAML:
1. Immediately understands the behavioral rules (directives)
2. Can detect methodology triggers in conversation
3. Knows exactly what documents to create
4. Has references to full content if needed
5. Can show proper progress indicators
6. Follows the discussion-first approach

The `reference` fields use the path format that Claude can understand, allowing it to request full content when needed without embedding everything in CLAUDE.md.