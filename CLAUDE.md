# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
the Aichaku methodology library.

## Directives for Claude Code from Aichaku

This configuration is dynamically assembled from YAML files in your ~/.claude/aichaku installation.

```yaml
aichaku:
  version: 0.31.5
  source: configuration-as-code
behavioral_directives:
  discussion_first:
    name: Discussion-First Document Creation
    description: A three-phase approach to thoughtful project creation
    phases:
      - name: DISCUSSION MODE
        description: Default when methodology keywords detected
        triggers:
          - shape
          - pitch
          - appetite
          - sprint
          - scrum
          - kanban
          - board
          - mvp
          - lean
          - experiment
        actions:
          required:
            - "Acknowledge the methodology context: '\U0001FAB4 Aichaku: I see you're thinking about [topic]'"
            - Ask clarifying questions to understand the goal
            - Help shape and refine the idea
            - Read appropriate guide SILENTLY from ~/.claude/aichaku/methodologies/
          forbidden:
            - DO NOT create any project folders yet
            - DO NOT create any documents yet
            - 'NEVER say: ''Would you like me to create documents for this?'''
      - name: WAIT FOR READINESS
        description: Only create documents when user signals explicit readiness
        triggers:
          - Let's create a project for this
          - I'm ready to start
          - Set up the project
          - Create the documentation
          - Any direct request for project creation
        actions:
          required:
            - Wait for explicit readiness signal from user
          forbidden:
            - Do not create anything before user signals readiness
      - name: CREATE PROJECT
        description: 'After user signals readiness, create immediately without asking'
        actions:
          required:
            - "Confirm name: '\U0001FAB4 Aichaku: Based on our discussion, creating project: [descriptive-name]'"
            - 'Create ALL documents in: docs/projects/active/YYYY-MM-DD-{descriptive-name}/'
            - Create STATUS.md FIRST
            - Create methodology-specific documents
            - Read guides from ~/.claude/aichaku/methodologies/
          forbidden:
            - NEVER create documents in the project root directory
            - NEVER create documents in .claude/user/
            - NEVER ask where to put files
            - NEVER ask for permission after readiness signal
  critical_behavior:
    name: Critical Behavioral Rules
    rules:
      - name: No asking after readiness
        description: 'Once user signals readiness, CREATE IMMEDIATELY without asking'
        examples:
          do:
            - "\U0001FAB4 Aichaku: Creating project: [descriptive-name]"
            - Setting up Shape Up documentation...
            - Generating sprint planning templates...
          dont:
            - Would you like me to...
            - Shall I create...
            - Should I go ahead and...
      - name: Discussion mode responses
        description: 'During discussion phase, focus on understanding and refinement'
        examples:
          do:
            - "\U0001FAB4 Aichaku: I understand you're exploring [topic]. Let me help you think through this..."
            - What specific challenges are you looking to address?
          dont:
            - Would you like me to create documents for this?
  methodology_detection:
    name: Methodology Detection & Discussion
    description: How to respond when methodology keywords are detected
    planning_keywords:
      shape_up:
        triggers:
          - shape
          - pitch
          - appetite
          - betting
          - cool-down
        discussion_approach: Discuss Shape Up approach
        creates: pitch.md
      scrum:
        triggers:
          - sprint
          - scrum
          - backlog
          - velocity
          - standup
        discussion_approach: Discuss Scrum planning
        creates: sprint-planning.md
      kanban:
        triggers:
          - kanban
          - board
          - WIP
          - flow
          - continuous
        discussion_approach: Discuss Kanban flow
        creates: kanban-board.md
      lean:
        triggers:
          - mvp
          - lean
          - experiment
          - validate
          - pivot
        discussion_approach: Discuss Lean experiments
        creates: experiment-plan.md
    discussion_mode_actions:
      - "Acknowledge: '\U0001FAB4 Aichaku: I see you're interested in [methodology]'"
      - Read the appropriate guide SILENTLY
      - Ask clarifying questions based on the methodology
      - Help refine the approach
      - WAIT for explicit 'create project' signal
  error_recovery:
    name: Error Recovery
    description: How to handle mistakes in file placement
    steps:
      - 'Move file immediately: mv [file] docs/projects/active/*/'
      - Update STATUS.md noting the correction
      - Continue without asking
    principle: >-
      This is AUTOMATIC behavior. Users expect documents to appear in the right place without
      asking.
  git_automation:
    name: Git Automation
    description: How to handle git operations when work is complete
    when: Work is confirmed complete
    commands:
      - 'git add docs/projects/active/[current-project]/'
      - 'git commit -m ''[type]: [description]\n\n- [what was done]\n- [key changes]'''
      - 'git push origin [current-branch]'
    commit_types:
      - feat
      - fix
      - docs
      - refactor
visual_identity:
  prefix:
    mandatory: true
    format: "\U0001FAB4 Aichaku:"
    usage: ALWAYS prefix Aichaku messages with this exact format
  growth_phases:
    description: Project lifecycle indicators
    phases:
      new:
        emoji: "\U0001F331"
        description: New project just started
      active:
        emoji: "\U0001F33F"
        description: Actively being worked on
      mature:
        emoji: "\U0001F333"
        description: In review or maturing
      complete:
        emoji: "\U0001F343"
        description: Completed and archived
    usage: Use these indicators to show project phase in status updates
  progress_display:
    format:
      phase_indicator: '[Phase] → [**Current**] → [Next]'
      arrow_position: Place ▲ under current phase
      progress_bar: 'Week X/Y ████████░░░░░░░░░░░░ XX% [emoji]'
    example: "\U0001FAB4 Aichaku: Shape Up Progress\n[Shaping] → [**Betting**] → [Building] → [Cool-down]\n              ▲\nWeek 2/6 ████████░░░░░░░░░░░░ 33% \U0001F33F\n"
file_organization:
  root: docs/projects/
  description: All Aichaku projects live under this directory
  states:
    active:
      path: docs/projects/active/
      description: Currently active projects
      naming: 'active-YYYY-MM-DD-{descriptive-kebab-case-name}'
      example: active-2025-07-15-security-workflow-modernization
    done:
      path: docs/projects/done/
      description: Completed projects
      naming: 'done-YYYY-MM-DD-{descriptive-kebab-case-name}'
      example: done-2025-07-14-consistent-branding
      transition: Rename from active-* to done-* when complete
methodologies:
  shape_up:
    key_concepts:
      - 'Fixed time, variable scope'
      - 6-week cycles with 2-week cooldown
      - Betting table for project selection
      - Shaping work before betting
      - No backlogs or sprints
    cycle_length: 6 weeks
    templates:
      - pitch.md
      - cycle-plan.md
      - execution-plan.md
      - hill-chart.md
      - change-summary.md
  scrum:
    name: Scrum
    triggers: []
    best_for: ''
    templates:
      sprint_planning: templates/sprint-planning.md
      sprint_retrospective: templates/sprint-retrospective.md
      user_story: templates/user-story.md
    phases: {}
    integration_url: 'aichaku://methodology/scrum/guide'
  kanban:
    name: Kanban
    triggers: []
    best_for: ''
    templates:
      kanban_board: templates/kanban-board.md
      flow_metrics: templates/flow-metrics.md
    phases: {}
    integration_url: 'aichaku://methodology/kanban/guide'
  lean:
    name: Lean Startup
    triggers: []
    best_for: ''
    templates: {}
    phases: {}
    integration_url: 'aichaku://methodology/lean/guide'
  xp:
    name: Extreme Programming
    triggers: []
    best_for: ''
    templates: {}
    phases: {}
    integration_url: 'aichaku://methodology/xp/guide'
  scrumban:
    name: Scrumban
    triggers: []
    best_for: ''
    templates:
      planning_trigger: templates/planning-trigger.md
    phases: {}
    integration_url: 'aichaku://methodology/scrumban/guide'
  shape-up:
    name: Shape Up
    triggers: []
    best_for: ''
    templates:
      pitch: templates/pitch.md
      cycle_plan: templates/cycle-plan.md
      execution_plan: templates/execution-plan.md
      hill_chart: templates/hill-chart.md
      change_summary: templates/change-summary.md
    phases: {}
    integration_url: 'aichaku://methodology/shape-up/guide'
standards:
  nist-csf:
    name: NIST Cybersecurity Framework (CSF 2.0)
    category: security
    summary:
      critical: |
        - Govern: Establish cybersecurity governance and risk management
        - Identify: Understand risks to systems, people, assets, data
        - Protect: Implement safeguards for critical services
        - Detect: Identify occurrence of cybersecurity events
        - Respond: Take action on detected incidents
        - Recover: Restore capabilities after incidents
      risk_based: Focuses on risk management over compliance
      scalable: Applicable to organizations of all sizes
      implementation: Code-based policies and automated controls
    integration_url: 'aichaku://standard/security/nist-csf'
  tdd:
    name: Test-Driven Development
    category: development
    summary:
      critical: |
        - Write failing tests FIRST before any implementation
        - Follow Red-Green-Refactor cycle strictly
        - Test behavior, not implementation details
        - One assertion per test for clarity
        - Use dependency injection for testability
      test_structure: AAA (Arrange-Act-Assert) pattern
      naming: Descriptive test names that explain the behavior
      coverage: Aim for 80%+ coverage with meaningful tests
      mocking: 'Mock external dependencies, not internal implementation'
      cycle_discipline: 'Tests must fail initially, minimal implementation to pass, refactor without breaking'
      isolation_requirements: 'Tests run independently, no shared state, any execution order'
      ci_integration: 'All tests pass before merge, coverage reports generated, visible in PRs'
      test_naming_patterns: 'should [behavior] when [condition], returns [result] for [scenario]'
    integration_url: 'aichaku://standard/development/tdd'
  test-pyramid:
    name: Test Pyramid
    category: testing
    summary:
      critical: |
        - Unit Tests (Base): Many, fast, isolated tests of individual components
        - Integration Tests (Middle): Some, moderate speed, test component interactions
        - E2E Tests (Top): Few, slow, comprehensive user journey tests
        - Pyramid shape: More unit tests, fewer integration, minimal E2E
        - Fast feedback from unit tests, confidence from E2E tests
      distribution: '70% unit, 20% integration, 10% E2E'
      speed: 'Unit tests <1s, Integration <10s, E2E <60s'
      maintenance: Lower levels easier to maintain and debug
      unit_characteristics: 'Pure functions, no external dependencies, milliseconds execution, deterministic'
      integration_scope: 'Database operations, API endpoints, service interactions, real test services'
      e2e_focus: 'Critical user journeys only, production-like environment, browser automation'
      anti_patterns: >-
        Ice cream cone (too many E2E), Hourglass (missing integration), Testing trophy
        (integration-heavy alternative)
      tools_by_layer: 'Unit: Jest/PyTest/JUnit, Integration: Supertest/TestContainers, E2E: Playwright/Cypress'
    integration_url: 'aichaku://standard/testing/test-pyramid'
  conventional-commits:
    name: Conventional Commits
    category: development
    summary:
      critical: |
        - Format: <type>[optional scope]: <description>
        - Primary types: feat, fix, docs, style, refactor, test, chore
        - Breaking changes: Use ! or BREAKING CHANGE footer
        - Imperative mood: "add feature" not "added feature"
        - 50 char subject limit, 72 char body line limit
      automation: Enables semantic versioning and changelog generation
      version_bumping: 'fix=patch, feat=minor, breaking=major'
      infosec_comment: 'Use InfoSec: prefix for security implications'
    integration_url: 'aichaku://standard/development/conventional-commits'
  15-factor:
    name: 15-Factor App Methodology
    category: architecture
    summary:
      critical: |
        - Store ALL config in environment variables
        - Execute as stateless processes (no in-memory state)
        - Treat backing services as attached resources
        - Export services via port binding
        - Maximize robustness with fast startup and graceful shutdown
      additional_factors: 'API first design, comprehensive telemetry, centralized auth'
      container_ready: Designed for Kubernetes and cloud platforms
      dev_prod_parity: Keep all environments as similar as possible
    integration_url: 'aichaku://standard/architecture/15-factor'
  clean-arch:
    name: Clean Architecture
    category: architecture
    summary:
      critical: |
        - Dependency Rule: Dependencies point inward toward higher-level policies
        - Four layers: Entities, Use Cases, Interface Adapters, Frameworks/Drivers
        - Business logic independent of frameworks, UI, and databases
        - Testable without external dependencies
        - Enables flexible technology choices
      independence: 'Framework, UI, Database, and External agency independence'
      testability: Business rules testable in isolation
      dependency_direction: Always inward toward business logic
    integration_url: 'aichaku://standard/architecture/clean-arch'
  google-style:
    name: Google Style Guides
    category: development
    summary:
      critical: |
        - Optimize for the reader, not the writer
        - Be consistent with existing code
        - Clarity over cleverness
        - Comprehensive documentation with examples
        - Language-specific naming conventions
      philosophy: Code is read far more often than it's written
      languages: 'TypeScript, JavaScript, Python, Java, Go, C++'
      documentation: 'JSDoc/docstrings with Args, Returns, Raises'
    integration_url: 'aichaku://standard/development/google-style'
  bdd:
    name: Behavior-Driven Development
    category: testing
    summary:
      critical: |
        - Collaboration between Business, Development, and Testing
        - Gherkin language for shared understanding
        - Given-When-Then scenario structure
        - Living documentation that stays current
        - Outside-in development approach
      three_amigos: 'Business (what), Development (how), Testing (what could go wrong)'
      gherkin_keywords: 'Feature, Scenario, Given, When, Then, And, But'
      automation: Executable specifications that verify behavior
    integration_url: 'aichaku://standard/testing/bdd'
  dora:
    name: DORA Metrics
    category: devops
    summary:
      critical: |
        - Deployment Frequency: How often you deploy to production
        - Lead Time for Changes: Time from commit to production
        - Mean Time to Recovery (MTTR): Time to restore service after incident
        - Change Failure Rate: Percentage of deployments causing failures
      performance_levels: 'Elite, High, Medium, Low performance categories'
      correlation: Strong correlation with organizational performance
      automation: Automated measurement through CI/CD and monitoring
    integration_url: 'aichaku://standard/devops/dora'
  diataxis-google:
    name: Diátaxis + Google Developer Documentation Style
    category: documentation
    summary:
      critical: |
        - Four documentation modes: Tutorial, How-to, Reference, Explanation
        - Tutorial: Learning-oriented, step-by-step lessons
        - How-to: Task-oriented, problem-solving recipes
        - Reference: Information-oriented, complete specification
        - Explanation: Understanding-oriented, concept clarification
      google_style: 'Second person, present tense, active voice, clear outcomes'
      user_centered: Different modes serve different user needs and contexts
      separation: Keep modes separate - don't mix tutorial and reference
    integration_url: 'aichaku://standard/documentation/diataxis-google'
included:
  core: true
  methodologies:
    - shape-up
    - scrum
    - kanban
    - lean
    - xp
    - scrumban
  standards:
    - nist-csf
    - tdd
    - test-pyramid
    - conventional-commits
    - 15-factor
    - clean-arch
    - google-style
    - bdd
    - dora
  doc_standards:
    - diataxis-google
  has_user_customizations: false
```
