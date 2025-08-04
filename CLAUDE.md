# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Aichaku methodology library.

## Directives for Claude Code from Aichaku

This configuration is dynamically assembled from YAML files in your ~/.claude/aichaku installation.

```yaml
application:
  name: Aichaku
  type: cli-tool
  description: >-
    AI-optimized project methodology installer for Claude Code - brings affection (愛着) to your
    development workflow
  version: 0.43.1
  stack:
    language: typescript
    runtime: deno
    framework: none
    database: none
  architecture:
    pattern: modular-cli
    components:
      - CLI commands in src/commands/
      - MCP server integration
      - YAML-based configuration
      - Plugin system for methodologies/standards
  security:
    standards:
      - owasp-cli
      - secure-defaults
  testing:
    framework: deno-test
    coverage_target: 80
  deployment:
    method: jsr-registry
    ci_cd: github-actions
behavioral_directives:
  context_awareness:
    name: Context-First Development
    priority: HIGHEST
    mandatory: true
    description: Always read and understand all available context before any action
    implementation:
      - Read the main CLAUDE.md immediately to understand project configuration
      - Use Glob tool with pattern '**/CLAUDE.md' to find all context files
      - Read subfolder CLAUDE.md files before working in those areas
      - Prioritize local context over general patterns
    why: >-
      Context determines everything - the app type, selected methodologies, standards, and
      project-specific patterns
  respect_user_selection:
    name: Respect User Selections
    priority: CRITICAL
    description: "Users have explicitly chosen their methodologies, standards, and principles"
    implementation:
      - Check 'application' section first - understand what kind of app this is
      - Check 'methodologies' section - work within the selected approach
      - Check 'standards' section - follow the selected guidelines
      - Check 'principles' section - respect the chosen philosophies
      - NEVER suggest alternatives or try to detect different approaches
    triggers:
      - "When user mentions methodology concepts, respond within their selection"
      - Reference the methodology's specific triggers and templates
      - 'Guide using the patterns they''ve chosen, not what you think is best'
  project_creation:
    name: Project Creation Workflow
    description: "Simple two-step process: Discuss then Create"
    workflow:
      discuss:
        when: User mentions project ideas or methodology concepts
        do:
          - "Acknowledge their selected methodology: '\U0001FAB4 Aichaku: I see you're working with [methodology]'"
          - Ask clarifying questions to understand their goal
          - Help refine ideas using their methodology's principles
        dont:
          - Create any files or folders
          - Ask 'Would you like me to create...?'
          - Suggest different methodologies
      create:
        when: 'User explicitly says: ''create project'', ''let''s start'', ''set it up'''
        do:
          - "State what you're doing: '\U0001FAB4 Aichaku: Creating project: [descriptive-name]'"
          - "Create in: docs/projects/active/YYYY-MM-DD-{descriptive-name}/"
          - "Create STATUS.md first, then methodology-specific documents"
          - Use the templates from their selected methodology
        dont:
          - Ask for confirmation after they've signaled readiness
          - Create files in the root directory
          - Deviate from the selected methodology's structure
  automation:
    name: Automatic Behaviors
    description: Things that happen without asking
    behaviors:
      error_recovery:
        when: File created in wrong location
        do: Move it immediately to docs/projects/active/*/ and update STATUS.md
      git_operations:
        when: Work confirmed complete
        do: |
          git add docs/projects/active/[current-project]/
          git commit -m '[type]: [description]

          - [what was done]
          - [key changes]'
      progress_tracking:
        when: Working on any task
        do: Update STATUS.md with progress automatically
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
      phase_indicator: "[Phase] → [**Current**] → [Next]"
      arrow_position: Place ▲ under current phase
      progress_bar: "Week X/Y ████████░░░░░░░░░░░░ XX% [emoji]"
    example: "\U0001FAB4 Aichaku: Shape Up Progress\n[Shaping] → [**Betting**] → [Building] → [Cool-down]\n              ▲\nWeek 2/6 ████████░░░░░░░░░░░░ 33% \U0001F33F\n"
file_organization:
  root: docs/projects/
  description: All Aichaku projects live under this directory
  states:
    active:
      path: docs/projects/active/
      description: Currently active projects
      naming: "active-YYYY-MM-DD-{descriptive-kebab-case-name}"
      example: active-2025-07-15-security-workflow-modernization
    done:
      path: docs/projects/done/
      description: Completed projects
      naming: "done-YYYY-MM-DD-{descriptive-kebab-case-name}"
      example: done-2025-07-14-consistent-branding
      transition: Rename from active-* to done-* when complete
methodologies:
  shape-up:
    name: Shape Up
    triggers:
      - shape
      - pitch
      - appetite
      - betting
      - cool-down
    best_for: Complex features
    templates:
      pitch: templates/pitch.md
      cycle_plan: templates/cycle-plan.md
      execution_plan: templates/execution-plan.md
      hill_chart: templates/hill-chart.md
      change_summary: templates/change-summary.md
    phases: {}
    integration_url: "aichaku://methodology/shape-up/guide"
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
    integration_url: "aichaku://standard/security/nist-csf"
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
      mocking: "Mock external dependencies, not internal implementation"
      cycle_discipline: "Tests must fail initially, minimal implementation to pass, refactor without breaking"
      isolation_requirements: "Tests run independently, no shared state, any execution order"
      ci_integration: "All tests pass before merge, coverage reports generated, visible in PRs"
      test_naming_patterns: "should [behavior] when [condition], returns [result] for [scenario]"
    integration_url: "aichaku://standard/development/tdd"
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
      distribution: "70% unit, 20% integration, 10% E2E"
      speed: "Unit tests <1s, Integration <10s, E2E <60s"
      maintenance: Lower levels easier to maintain and debug
      unit_characteristics: "Pure functions, no external dependencies, milliseconds execution, deterministic"
      integration_scope: "Database operations, API endpoints, service interactions, real test services"
      e2e_focus: "Critical user journeys only, production-like environment, browser automation"
      anti_patterns: >-
        Ice cream cone (too many E2E), Hourglass (missing integration), Testing trophy
        (integration-heavy alternative)
      tools_by_layer: "Unit: Jest/PyTest/JUnit, Integration: Supertest/TestContainers, E2E: Playwright/Cypress"
    integration_url: "aichaku://standard/testing/test-pyramid"
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
      version_bumping: "fix=patch, feat=minor, breaking=major"
      infosec_comment: "Use InfoSec: prefix for security implications"
    integration_url: "aichaku://standard/development/conventional-commits"
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
      additional_factors: "API first design, comprehensive telemetry, centralized auth"
      container_ready: Designed for Kubernetes and cloud platforms
      dev_prod_parity: Keep all environments as similar as possible
    integration_url: "aichaku://standard/architecture/15-factor"
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
      independence: "Framework, UI, Database, and External agency independence"
      testability: Business rules testable in isolation
      dependency_direction: Always inward toward business logic
    integration_url: "aichaku://standard/architecture/clean-arch"
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
      languages: "TypeScript, JavaScript, Python, Java, Go, C++"
      documentation: "JSDoc/docstrings with Args, Returns, Raises"
    integration_url: "aichaku://standard/development/google-style"
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
      three_amigos: "Business (what), Development (how), Testing (what could go wrong)"
      gherkin_keywords: "Feature, Scenario, Given, When, Then, And, But"
      automation: Executable specifications that verify behavior
    integration_url: "aichaku://standard/testing/bdd"
  owasp-web:
    name: OWASP Top 10 Web Application Security
    category: security
    summary:
      critical: |
        - A01: Broken Access Control - Validate authorization on EVERY request
        - A02: Cryptographic Failures - Use strong encryption, secure key management
        - A03: Injection - Parameterized queries, input validation, output encoding
        - A07: Authentication Failures - Strong auth, proper session management
        - A09: Logging Failures - Log security events WITHOUT sensitive data
      security_headers: "X-Content-Type-Options, X-Frame-Options, HSTS, CSP"
      input_validation: "Never trust user input - validate, sanitize, escape"
      error_handling: "Generic error messages, log details server-side only"
    integration_url: "aichaku://standard/security/owasp-web"
  microsoft-style:
    name: Microsoft Writing Style Guide
    category: documentation
    summary:
      critical: |
        - Global-ready: Write for international audiences
        - Accessible: Design for all abilities and contexts
        - Inclusive: Welcome everyone with bias-free language
        - Clear: Prioritize clarity over cleverness
        - Empowering: Help users succeed and feel confident
      tone: "Warm, approachable, and encouraging"
      structure: Step-by-step with clear outcomes and verification
      formatting: "Use bold for UI elements, tips and warnings in callouts"
    integration_url: "aichaku://standard/documentation/microsoft-style"
  solid:
    name: SOLID Principles
    category: development
    summary:
      critical: |
        - S: Single Responsibility - One reason to change per class
        - O: Open/Closed - Open for extension, closed for modification
        - L: Liskov Substitution - Subtypes must be substitutable
        - I: Interface Segregation - Many specific interfaces > one general
        - D: Dependency Inversion - Depend on abstractions, not concretions
      object_oriented: Core principles for maintainable OOP design
      flexibility: Enables code extension without modification
      testability: Promotes dependency injection and mocking
    integration_url: "aichaku://standard/development/solid"
  dora:
    name: DORA Metrics (DevOps Research and Assessment)
    category: devops
    summary:
      critical: |
        - Deployment Frequency: How often you deploy to production
        - Lead Time for Changes: Time from commit to production
        - Mean Time to Recovery (MTTR): Time to restore service after incident
        - Change Failure Rate: Percentage of deployments causing failures
      performance_levels: "Elite, High, Medium, Low performance categories"
      correlation: Strong correlation with organizational performance
      automation: Automated measurement through CI/CD and monitoring
    integration_url: "aichaku://standard/devops/dora"
principles:
  dry:
    name: DRY (Don't Repeat Yourself)
    category: software-development
    summary:
      tagline: "Every piece of knowledge should have a single, authoritative representation"
      core_tenets:
        - text: Avoid code duplication
        - text: Single source of truth
        - text: Eliminate redundancy
    integration_url: "aichaku://principle/software-development/dry"
aichaku:
  version: 0.43.1
  source: configuration-as-code
included:
  core: true
  methodologies:
    - shape-up
  standards:
    - nist-csf
    - tdd
    - test-pyramid
    - conventional-commits
    - 15-factor
    - clean-arch
    - google-style
    - bdd
    - owasp-web
    - microsoft-style
    - solid
    - dora
  principles:
    - dry
  has_user_customizations: true
```
