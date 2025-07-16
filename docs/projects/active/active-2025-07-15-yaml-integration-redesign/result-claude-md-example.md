# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this project.

## Methodologies Quick Reference

```yaml
methodologies:
  shape_up:
    triggers: ["shape", "appetite", "pitch", "betting table", "6 weeks", "cycle", "bet", "cool-down"]
    best_for: "Features with unclear solutions, fixed timeline projects, avoiding scope creep"
    
  scrum:
    triggers: ["sprint", "scrum", "velocity", "standup", "product owner"]
    best_for: "Teams needing predictable delivery, client visibility, regular rhythm"
    
  kanban:
    triggers: ["kanban", "flow", "WIP limit", "continuous", "pull"]
    best_for: "Continuous flow work, support teams, varying priorities, starting simply"
    
  lean:
    triggers: ["MVP", "lean", "experiment", "validate", "pivot"]
    best_for: "Startups, MVPs, experimentation, uncertainty, learning fast"
    
  xp:
    triggers: ["TDD", "test first", "pair programming", "refactor", "XP"]
    best_for: "Quality-critical code, learning teams, complex technical challenges"
    
  scrumban:
    triggers: ["scrumban", "hybrid", "sprint flow", "planning triggers"]
    best_for: "Teams transitioning between methods, combining structure with flow"
```

# Aichaku Configuration

```yaml
aichaku:
  version: "2.0.0"
  source: "configuration-as-code"
  
behavioral_directives:
  name: "Aichaku Behavioral Directives"
  version: "1.0.0"
  description: "Core behavioral rules that all Aichaku interactions must follow"
  rules:
    discussion_first:
      name: "Discussion-First Document Creation"
      description: "A three-phase approach to thoughtful project creation"
      phases:
        - name: "DISCUSSION MODE"
          triggers: ["shape", "pitch", "sprint", "scrum", "kanban", "mvp", "lean"]
          actions:
            required:
              - "Acknowledge the methodology context: '🪴 Aichaku: I see you're thinking about [topic]'"
              - "Ask clarifying questions to understand the goal"
            forbidden:
              - "DO NOT create any project folders yet"
              - "NEVER say: 'Would you like me to create documents for this?'"
        - name: "WAIT FOR READINESS"
          triggers: ["Let's create a project for this", "I'm ready to start"]
        - name: "CREATE PROJECT"
          actions:
            required:
              - "Create ALL documents in: docs/projects/active/YYYY-MM-DD-{descriptive-name}/"
              - "Create STATUS.md FIRST"

visual_identity:
  prefix:
    mandatory: true
    format: "🪴 Aichaku:"
  growth_phases:
    new: {emoji: "🌱", description: "New project just started"}
    active: {emoji: "🌿", description: "Actively being worked on"}
    mature: {emoji: "🌳", description: "In review or maturing"}
    complete: {emoji: "🍃", description: "Completed and archived"}
  progress_display:
    format:
      phase_indicator: "[Phase] → [**Current**] → [Next]"
      example: |
        🪴 Aichaku: Shape Up Progress
        [Shaping] → [**Betting**] → [Building]
                      ▲
        Week 2/6 ████████░░░░░░░░░░░░ 33% 🌿

file_organization:
  project_structure:
    root: "docs/projects/"
    states:
      active: {path: "docs/projects/active/", naming: "active-YYYY-MM-DD-{name}"}
      done: {path: "docs/projects/done/", naming: "done-YYYY-MM-DD-{name}"}
  required_files:
    STATUS.md: {created: "FIRST file created in any new project"}
  naming_conventions:
    projects: "YYYY-MM-DD-{descriptive-kebab-case-name}"
    change_logs: "YYYY-MM-DD-{Project-Name}-CHANGE-LOG.md"

diagram_templates:
  requirements:
    mandatory: true
    description: "Include Mermaid diagrams in EVERY project documentation"
  templates:
    status_lifecycle:
      document: "STATUS.md"
      template: |
        graph LR
            A[🌱 Started] --> B[🌿 Active]
            B --> C[🌳 Review]
            C --> D[🍃 Complete]

methodologies:
  shape_up:
    name: "Shape Up"
    triggers: ["shape", "pitch", "appetite", "betting", "cool-down"]
    best_for: "Clear projects, fixed timelines, autonomous teams"
    templates: ["pitch.md", "cycle-plan.md", "hill-chart.md"]
    integration_url: "aichaku://methodology/shape-up/guide"
  scrum:
    name: "Scrum"
    triggers: ["sprint", "scrum", "backlog", "velocity"]
    templates: ["sprint-planning.md", "user-story.md"]
    integration_url: "aichaku://methodology/scrum/guide"

standards:
  tdd:
    name: "Test-Driven Development"
    category: "development"
    summary:
      critical: |
        - Write failing tests FIRST before any implementation
        - Follow Red-Green-Refactor cycle strictly
        - Test behavior, not implementation details
    integration_url: "aichaku://standard/development/tdd"

included:
  core: true
  methodologies: ["shape-up", "scrum", "kanban", "lean", "xp", "scrumban"]
  standards: ["tdd"]
  doc_standards: []
  has_user_customizations: false
```

## Project Overview

[Add your project-specific information here]