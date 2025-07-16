# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
the Aichaku methodology library.

## Directives for Claude Code from Aichaku

This configuration uses Aichaku's YAML-based "configuration as code" system that reduces file size by 96% while providing comprehensive guidance. The directives below are dynamically assembled from modular YAML files.

For detailed configuration options, see [Configure YAML Directives](docs/how-to/configure-yaml-directives.md).

```yaml
aichaku:
  version: 2.0.0
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
    rules:
      govern:
        description: GV - Cybersecurity governance and enterprise risk management
        subcategories:
          organizational_context:
            - Define organizational mission and priorities
            - Establish cybersecurity strategy aligned with business
            - Document roles and responsibilities
          risk_management_strategy:
            - Establish enterprise risk management strategy
            - Define risk tolerance and appetite
            - Integrate cybersecurity into enterprise risk
          roles_responsibilities:
            - Define cybersecurity roles and responsibilities
            - Establish accountability structures
            - Ensure adequate resources
          policy:
            - Establish cybersecurity policies
            - Communicate policies to stakeholders
            - Regular policy review and updates
          oversight:
            - Establish cybersecurity oversight function
            - Monitor cybersecurity performance
            - Regular reporting to leadership
      identify:
        description: 'ID - Understand cybersecurity risks to systems, assets, data, and capabilities'
        subcategories:
          asset_management:
            requirements:
              - Maintain inventory of hardware assets
              - Maintain inventory of software assets
              - Maintain inventory of data assets
              - Classify assets by criticality
            implementation:
              - Automated asset discovery tools
              - Configuration management databases
              - Data classification policies
          business_environment:
            requirements:
              - Understand organizational mission
              - Map critical business processes
              - Identify dependencies and supply chain
            validation:
              - Business impact analysis completed
              - Critical processes documented
              - Dependencies mapped and assessed
          governance:
            requirements:
              - Information security policies established
              - Legal and regulatory requirements identified
              - Risk assessment processes defined
          risk_assessment:
            requirements:
              - Threat landscape understood
              - Vulnerabilities identified and analyzed
              - Risk response strategies developed
            frequency: quarterly or after significant changes
          risk_management:
            requirements:
              - Risk tolerance defined
              - Risk response strategies implemented
              - Risk monitoring processes established
          supply_chain:
            requirements:
              - Supply chain partners identified
              - Supply chain risks assessed
              - Supply chain security requirements defined
      protect:
        description: PR - Implement safeguards to ensure delivery of critical services
        subcategories:
          identity_management:
            requirements:
              - Unique user identities verified
              - Privilege management implemented
              - Multi-factor authentication required
            implementation:
              - Identity and Access Management (IAM)
              - Role-based access control (RBAC)
              - Regular access reviews
          awareness_training:
            requirements:
              - Security awareness training provided
              - Privileged users receive specialized training
              - Third-party personnel training addressed
          data_security:
            requirements:
              - Data classification scheme implemented
              - Data encryption in transit and at rest
              - Data disposal procedures established
            controls:
              - AES-256 encryption minimum
              - TLS 1.2+ for data in transit
              - Secure data deletion procedures
          information_protection:
            requirements:
              - Access permissions managed
              - Network integrity protected
              - Removable media usage restricted
          maintenance:
            requirements:
              - Maintenance performed and logged
              - Remote maintenance controlled
              - Maintenance tools restricted
          protective_technology:
            requirements:
              - Communication and control networks protected
              - Security configurations managed
              - Network integrity protected
      detect:
        description: DE - Implement activities to identify cybersecurity events
        subcategories:
          anomalies_events:
            requirements:
              - Network communications monitored
              - Physical environment monitored
              - Personnel activity monitored
            implementation:
              - SIEM (Security Information and Event Management)
              - Network monitoring tools
              - User behavior analytics
          security_monitoring:
            requirements:
              - Information system monitored
              - Physical environment monitored
              - Personnel activity monitored
            metrics:
              - Mean time to detection (MTTD)
              - False positive rate
              - Coverage percentage
          detection_processes:
            requirements:
              - Detection activities defined
              - Event analysis performed
              - Incident alert thresholds established
      respond:
        description: RS - Take action regarding detected cybersecurity incidents
        subcategories:
          response_planning:
            requirements:
              - Response plan executed during incident
              - Personnel know their roles during response
              - Information sharing procedures established
            documentation:
              - Incident response playbooks
              - Contact information current
              - Communication templates
          communications:
            requirements:
              - Personnel know their roles and responsibilities
              - Events reported consistent with plan
              - Information shared with stakeholders
            timelines:
              - 'Initial response: 1 hour'
              - 'Stakeholder notification: 4 hours'
              - 'Regulatory notification: 24-72 hours'
          analysis:
            requirements:
              - Notifications received from detection systems
              - Impact of incidents understood
              - Forensics performed
          mitigation:
            requirements:
              - Activities performed to prevent expansion
              - Incidents mitigated
              - Newly identified vulnerabilities mitigated
          improvements:
            requirements:
              - Response activities documented
              - Response plan updated
              - Response strategies updated
      recover:
        description: RC - Restore capabilities impaired by cybersecurity incidents
        subcategories:
          recovery_planning:
            requirements:
              - Recovery plan executed during recovery
              - Recovery strategies updated
              - Recovery testing performed
            testing_frequency: annually
          improvements:
            requirements:
              - Recovery activities documented
              - Recovery plan updated
              - Recovery strategies improved
          communications:
            requirements:
              - Public relations managed
              - Reputation repair activities performed
              - Recovery activities communicated internally
      implementation_tiers:
        description: Maturity levels for cybersecurity practices
        tier_1_partial:
          - Risk management practices ad hoc
          - Limited awareness of cybersecurity risk
          - Irregular information sharing
        tier_2_risk_informed:
          - Risk management practices approved by management
          - Cybersecurity risk-informed decisions
          - Regular information sharing
        tier_3_repeatable:
          - Organization-wide risk management practices
          - Regular updates to cybersecurity practices
          - Formal information sharing agreements
        tier_4_adaptive:
          - Adaptive and agile approach
          - Continuous improvement
          - Advanced information sharing
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
    rules:
      test_first:
        description: Tests must be written before implementation code
        validation:
          - Check git history for test commits before implementation
          - Verify test files exist for all production code
      red_green_refactor:
        description: Follow the TDD cycle strictly
        validation:
          - Tests should fail initially
          - Implementation should be minimal to pass tests
          - Refactoring should not break existing tests
      behavior_testing:
        description: 'Test public behavior, not private implementation'
        validation:
          - No testing of private methods directly
          - No mocking of internal class methods
          - Focus on input/output and side effects
      test_structure:
        description: Use AAA pattern for test organization
        validation:
          - 'Clear separation of Arrange, Act, Assert phases'
          - Setup code in beforeEach/setUp methods
          - Teardown in afterEach/tearDown methods
      test_naming:
        description: Test names should describe the behavior being tested
        patterns:
          - 'should [expected behavior] when [condition]'
          - 'returns [expected] for [input scenario]'
          - 'throws [error type] when [error condition]'
      single_assertion:
        description: Each test should verify one behavior
        validation:
          - One expect/assert statement per test
          - Multiple related assertions grouped in separate tests
      mocking_strategy:
        description: 'Mock external dependencies, not internals'
        validation:
          - Database connections should be mocked
          - External API calls should be mocked
          - File system operations should be mocked
          - Internal class methods should not be mocked
      test_isolation:
        description: Tests should not depend on each other
        validation:
          - Each test can run independently
          - No shared state between tests
          - Order of test execution doesn't matter
      coverage_requirements:
        description: Maintain high test coverage
        thresholds:
          statements: 80
          branches: 75
          functions: 80
          lines: 80
      ci_integration:
        description: Tests must run in CI/CD pipeline
        requirements:
          - All tests pass before merge
          - Coverage reports generated
          - Test results visible in PR
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
    rules:
      unit_tests:
        description: Foundation layer - individual component testing
        characteristics:
          - Test single units in isolation
          - Fast execution (milliseconds)
          - No external dependencies
          - Deterministic results
          - Easy to write and maintain
        scope:
          - Pure functions
          - Class methods
          - Business logic
          - Validation rules
          - Calculations
        implementation:
          mocking: Mock all external dependencies
          isolation: 'No database, network, or file system'
          speed: Entire suite runs in seconds
          parallelization: Can run in parallel safely
        best_practices:
          - One assertion per test
          - Descriptive test names
          - 'AAA pattern (Arrange, Act, Assert)'
          - Test edge cases and error conditions
          - Use meaningful test data
      integration_tests:
        description: Middle layer - component interaction testing
        characteristics:
          - Test multiple components together
          - Moderate execution time
          - Limited external dependencies
          - Test integration points
          - Verify data flow
        scope:
          - Database operations
          - API endpoints
          - Service interactions
          - Message queues
          - Configuration loading
        implementation:
          dependencies: 'Real databases, test services'
          isolation: Use test databases and services
          cleanup: Reset state between tests
          containers: Docker for consistent environments
        types:
          component: Test a single service with real dependencies
          contract: Test service contracts and interfaces
          api: Test REST/GraphQL endpoints
          database: Test data layer operations
      e2e_tests:
        description: Top layer - complete user journey testing
        characteristics:
          - Test complete workflows
          - Slow execution time
          - Full system integration
          - User perspective
          - High maintenance cost
        scope:
          - Critical user journeys
          - Key business workflows
          - Cross-browser compatibility
          - Performance validation
          - Security verification
        implementation:
          environment: Production-like test environment
          automation: 'Browser automation (Playwright, Selenium)'
          data: Test data management strategy
          parallelization: Limited due to shared resources
        best_practices:
          - Test critical paths only
          - Use page object pattern
          - Stable selectors (data-testid)
          - Wait strategies for async operations
          - Screenshot/video on failures
      distribution_guidelines:
        description: Recommended test distribution across layers
        ratios:
          unit: 60-70% of total tests
          integration: 20-30% of total tests
          e2e: 5-10% of total tests
        reasoning:
          unit: 'Fast feedback, easy debugging, low cost'
          integration: 'Catch integration issues, moderate cost'
          e2e: 'User confidence, high cost, slow feedback'
      anti_patterns:
        description: Common violations of test pyramid principles
        ice_cream_cone:
          problem: 'Too many E2E tests, few unit tests'
          symptoms: 'Slow test suite, flaky tests, hard to debug'
          solution: 'Increase unit test coverage, reduce E2E tests'
        hourglass:
          problem: 'Many unit and E2E tests, few integration tests'
          symptoms: Integration bugs slip through
          solution: Add integration tests for service boundaries
        testing_trophy:
          description: Alternative emphasizing integration tests
          ratio: 'Unit 40%, Integration 50%, E2E 10%'
          use_case: Frontend applications with many integrations
      implementation_strategy:
        description: How to implement test pyramid in practice
        starting_point:
          - Begin with unit tests for new code
          - Add integration tests for critical paths
          - Create minimal E2E tests for key journeys
        existing_codebase:
          - Measure current test distribution
          - Identify gaps in unit test coverage
          - Refactor E2E tests to lower levels where possible
        tools_selection:
          unit: 'Jest, Mocha, PyTest, JUnit, XUnit'
          integration: 'Supertest, TestContainers, Postman'
          e2e: 'Playwright, Cypress, Selenium, Puppeteer'
      feedback_loops:
        description: Optimize feedback speed at each level
        unit_tests:
          frequency: On every save (watch mode)
          feedback_time: Seconds
          purpose: Immediate validation
        integration_tests:
          frequency: On commit/push
          feedback_time: Minutes
          purpose: Integration validation
        e2e_tests:
          frequency: Before deployment
          feedback_time: 10-30 minutes
          purpose: Release confidence
      maintenance_considerations:
        description: Managing test maintenance burden
        unit_tests:
          maintenance: Low - change only when behavior changes
          debugging: Easy - isolated failures
          reliability: High - deterministic
        integration_tests:
          maintenance: Medium - affected by dependency changes
          debugging: Moderate - limited scope
          reliability: Good - controlled environment
        e2e_tests:
          maintenance: High - UI and system changes affect tests
          debugging: Difficult - many potential failure points
          reliability: Lower - timing and environment issues
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
    rules:
      format:
        description: Commit message must follow conventional format
        pattern: '^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'
        validation:
          - Type must be one of the allowed types
          - Scope (if present) must be in parentheses
          - Description must start with lowercase
          - No trailing punctuation in subject
      types:
        description: Allowed commit types and their meanings
        allowed:
          feat: New feature for the user
          fix: Bug fix for the user
          docs: Documentation changes
          style: 'Code style changes (formatting, etc.)'
          refactor: Code refactoring without feature/fix
          test: Adding or updating tests
          chore: Build process or auxiliary tool changes
          perf: Performance improvements
          ci: CI/CD configuration changes
          build: Build system or dependency changes
          revert: Reverting a previous commit
      scope:
        description: Optional scope provides context
        examples:
          - 'Component names: header, footer, nav'
          - 'Feature areas: auth, payment, search'
          - 'File/Module names: utils, database, api'
          - 'Technology: docker, webpack, jest'
      breaking_changes:
        description: How to indicate breaking changes
        methods:
          - 'Add ! after type/scope: feat!: change API'
          - Add BREAKING CHANGE footer with description
        validation:
          - Major version bump required
          - Must describe what breaks
          - Migration guide recommended
      subject_rules:
        description: Rules for the subject line
        requirements:
          - Use imperative mood
          - No capitalization of first letter
          - No period at the end
          - 50 characters or less
          - 'Complete the sentence: If applied, this commit will...'
      body_rules:
        description: Optional body provides detailed explanation
        guidelines:
          - Wrap at 72 characters
          - 'Explain what and why, not how'
          - Separate from subject with blank line
          - Can use multiple paragraphs
      footer_rules:
        description: Optional footer for metadata
        types:
          issue_references:
            - 'Closes #123'
            - 'Fixes #456, #789'
            - 'Refs #321'
          coauthors:
            - 'Co-authored-by: Name <email>'
          reviewers:
            - 'Reviewed-by: Name <email>'
          security:
            - 'InfoSec: Security implication description'
            - CVE-2023-12345
      version_impact:
        description: How commits affect semantic versioning
        rules:
          - type: fix
            version: patch
            example: 1.0.0 → 1.0.1
          - type: feat
            version: minor
            example: 1.0.0 → 1.1.0
          - type: breaking
            version: major
            example: 1.0.0 → 2.0.0
      automation:
        description: Tools that work with conventional commits
        tools:
          - name: semantic-release
            purpose: Automated versioning and publishing
          - name: conventional-changelog
            purpose: Changelog generation
          - name: commitizen
            purpose: Interactive commit creation
          - name: commitlint
            purpose: Commit message validation
      security_notes:
        description: Security-related commit guidelines
        requirements:
          - 'Use InfoSec: prefix for security implications'
          - Reference CVE numbers when applicable
          - Don't expose sensitive details in commits
          - Mark security fixes clearly
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
    rules:
      codebase:
        description: 'One codebase tracked in revision control, many deploys'
        validation:
          - Single git repository per application
          - No code duplication across services
          - Shared code extracted to libraries
      dependencies:
        description: Explicitly declare and isolate dependencies
        requirements:
          - 'All dependencies in manifest (package.json, requirements.txt, etc.)'
          - No reliance on system packages
          - 'Dependency isolation (virtualenv, containers)'
          - Exact versions specified
      configuration:
        description: Store config in the environment
        validation:
          - No config in code
          - Environment variables for all settings
          - No config files checked into repository
          - Separate config per deploy environment
      backing_services:
        description: Treat backing services as attached resources
        implementation:
          - Services attached via URL/credentials in env
          - No distinction between local and third-party services
          - Services can be swapped without code changes
          - Connection strings in environment variables
      build_release_run:
        description: Strictly separate build and run stages
        stages:
          - 'Build: Convert code to executable bundle'
          - 'Release: Combine build with config'
          - 'Run: Execute in the execution environment'
        validation:
          - Builds are immutable
          - Releases have unique IDs
          - Can't change code at runtime
      processes:
        description: Execute the app as stateless processes
        requirements:
          - No sticky sessions
          - 'Session state in backing service (Redis, DB)'
          - No file system state between requests
          - Processes can be started/stopped anytime
      port_binding:
        description: Export services via port binding
        implementation:
          - App is self-contained
          - Binds to port via PORT env variable
          - 'No runtime injection (e.g., Apache modules)'
          - HTTP server included in app
      concurrency:
        description: Scale out via the process model
        validation:
          - Horizontal scaling preferred
          - Different process types for different workloads
          - No daemonization or PID files
          - Process manager handles scaling
      disposability:
        description: Maximize robustness with fast startup and graceful shutdown
        requirements:
          - Processes start in seconds
          - Graceful shutdown on SIGTERM
          - Robust against sudden death
          - Return jobs to queue on shutdown
      dev_prod_parity:
        description: 'Keep development, staging, and production similar'
        gaps_to_minimize:
          - 'Time gap: Deploy hours/minutes after writing'
          - 'Personnel gap: Developers deploy their code'
          - 'Tools gap: Same backing services everywhere'
      logs:
        description: Treat logs as event streams
        implementation:
          - App never manages log files
          - Write to stdout/stderr
          - Execution environment handles routing
          - Structured logging (JSON) preferred
      admin_processes:
        description: Run admin/management tasks as one-off processes
        validation:
          - Same environment as regular processes
          - Run against same release
          - Admin code ships with app code
          - Use same dependency isolation
      api_first:
        description: Design and document APIs before implementation
        requirements:
          - OpenAPI/Swagger specification
          - API versioning strategy
          - Contract-first development
          - API documentation auto-generated
      telemetry:
        description: Comprehensive observability built-in
        components:
          - 'Metrics: Application and business metrics'
          - 'Logs: Structured event logging'
          - 'Traces: Distributed tracing'
          - 'Health checks: Liveness and readiness probes'
      authentication:
        description: Centralized authentication and authorization
        implementation:
          - OAuth2/OIDC for service auth
          - JWT tokens for stateless auth
          - Service-to-service authentication
          - API gateway handles auth concerns
      container_requirements:
        description: Container and orchestration readiness
        checklist:
          - Dockerfile follows best practices
          - Multi-stage builds for smaller images
          - Non-root user in container
          - Health check endpoints implemented
          - Graceful shutdown handling
          - Resource limits defined
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
    rules:
      dependency_rule:
        description: The fundamental rule governing all dependencies
        principle: 'Source code dependencies must point only inward, toward higher-level policies'
        implementation:
          - Outer layers depend on inner layers
          - Inner layers know nothing about outer layers
          - Use dependency inversion for external dependencies
          - 'Interfaces defined in inner layers, implemented in outer layers'
        validation:
          - No imports from outer layers in inner layers
          - Business logic has no framework dependencies
          - Entities have no use case dependencies
      layer_structure:
        description: Four concentric layers of the architecture
        entities:
          position: innermost
          description: Enterprise business rules and critical business data
          characteristics:
            - Pure business logic
            - No dependencies on other layers
            - Most stable code
            - Can be shared across applications
          examples:
            - User entity with validation rules
            - Order entity with business constraints
            - Domain value objects
        use_cases:
          position: second layer
          description: Application business rules and orchestration
          characteristics:
            - Application-specific business rules
            - Orchestrates entities
            - Defines interfaces for outer layers
            - Contains application workflow
          examples:
            - CreateUserUseCase
            - ProcessOrderUseCase
            - AuthenticateUserUseCase
        interface_adapters:
          position: third layer
          description: 'Controllers, presenters, and gateways'
          characteristics:
            - Converts data between use cases and external systems
            - Implements interfaces defined by use cases
            - Contains controllers and presenters
            - Database and external service adapters
          examples:
            - UserController
            - DatabaseUserRepository
            - EmailServiceAdapter
        frameworks_drivers:
          position: outermost
          description: 'External frameworks, tools, and devices'
          characteristics:
            - Database drivers
            - Web frameworks
            - External libraries
            - UI frameworks
          examples:
            - Express.js framework
            - PostgreSQL driver
            - React components
      implementation_patterns:
        description: Common patterns for implementing Clean Architecture
        dependency_inversion:
          description: Use interfaces to invert dependencies
          implementation:
            - Define interfaces in inner layers
            - Implement interfaces in outer layers
            - Inject dependencies at runtime
            - Use IoC containers for dependency injection
        repository_pattern:
          description: Abstract data access
          implementation:
            - Define repository interface in use case layer
            - Implement repository in interface adapter layer
            - Use dependency injection to provide implementation
        use_case_interactor:
          description: Encapsulate application business rules
          implementation:
            - One use case per business operation
            - Input and output data structures
            - Error handling and validation
            - Transaction management
      testing_strategy:
        description: How to test each layer effectively
        entity_testing:
          approach: Unit tests with no mocks
          focus: Business rule validation
          characteristics: 'Fast, deterministic, isolated'
        use_case_testing:
          approach: Unit tests with mocked dependencies
          focus: Application logic and orchestration
          characteristics: Mock external interfaces
        adapter_testing:
          approach: Integration tests with real external systems
          focus: Data conversion and external integration
          characteristics: 'Test database, API calls'
        system_testing:
          approach: End-to-end tests
          focus: Complete user workflows
          characteristics: Slow but comprehensive
      benefits:
        description: Advantages of Clean Architecture
        independence:
          frameworks: Can change frameworks without affecting business logic
          database: Can swap databases with minimal impact
          ui: Can change UI without affecting business rules
          external_services: Can change external services easily
        testability:
          business_rules: Test business logic without external dependencies
          use_cases: Test application logic with mocked dependencies
          integration: Test adapters with real external systems
        maintainability:
          separation: Clear separation of concerns
          flexibility: Easy to modify and extend
          understanding: Easier to understand system structure
      common_mistakes:
        description: Pitfalls to avoid when implementing Clean Architecture
        dependency_violations:
          - Inner layers importing from outer layers
          - Entities depending on use cases
          - Use cases depending on frameworks
        anemic_domain:
          - Entities with only getters and setters
          - Business logic in use cases instead of entities
          - Missing domain behavior
        over_engineering:
          - Too many layers for simple applications
          - Unnecessary abstractions
          - Premature optimization
      implementation_guidelines:
        description: Best practices for implementing Clean Architecture
        starting_small:
          - Begin with core entities
          - Add use cases gradually
          - Implement adapters as needed
        refactoring_approach:
          - Extract business logic first
          - Create interfaces for external dependencies
          - Move framework code to outer layers
        team_adoption:
          - Train team on dependency rule
          - Use code reviews to enforce patterns
          - Create architectural guidelines
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
    rules:
      naming_conventions:
        description: Language-specific naming rules
        typescript_javascript:
          classes: PascalCase
          interfaces: PascalCase
          functions: camelCase
          variables: camelCase
          constants: UPPER_SNAKE_CASE
          files: lowercase-with-hyphens.ts
          private_members: no leading underscore
        python:
          modules: lowercase_with_underscores.py
          classes: PascalCase
          functions: lowercase_with_underscores
          variables: lowercase_with_underscores
          constants: UPPER_SNAKE_CASE
          protected: _single_underscore_prefix
          private: __double_underscore_prefix
      type_safety:
        description: Type annotation requirements
        typescript:
          - Always annotate function parameters
          - Always annotate return types
          - Prefer interfaces for object shapes
          - Use type for unions and aliases
          - Avoid any type
        python:
          - Use type hints for all public APIs
          - Include return type annotations
          - Use Optional for nullable types
          - Prefer dataclasses for data structures
      documentation:
        description: Documentation standards
        requirements:
          - All public APIs must be documented
          - Include parameter descriptions
          - Document return values
          - List possible exceptions
          - Provide usage examples for complex APIs
        typescript_format:
          style: JSDoc
          example: |
            /**
             * Calculates the total price including tax.
             * @param basePrice - The base price before tax
             * @param taxRate - The tax rate as a decimal
             * @returns The total price including tax
             */
        python_format:
          style: Google docstrings
          example: |
            """Calculate the total price including tax.

            Args:
                base_price: The base price before tax.
                tax_rate: The tax rate as a decimal.
                
            Returns:
                The total price including tax.
                
            Raises:
                ValueError: If base_price is negative.
            """
      code_organization:
        description: How to structure code files
        import_order:
          - Standard library imports
          - Third-party imports
          - Local application imports
          - Type imports (TypeScript)
        class_member_order:
          - Static properties
          - Instance properties
          - Constructor
          - Static methods
          - Public methods
          - Protected methods
          - Private methods
      formatting:
        description: Code formatting rules
        general:
          - 2 spaces for indentation (4 for Python)
          - '80 character line limit (100 for code, 80 for comments)'
          - Spaces around operators
          - No trailing whitespace
          - Single blank line between methods
        typescript_specific:
          - Semicolons required
          - Single quotes for strings
          - Trailing commas in multiline
        python_specific:
          - No semicolons
          - Double quotes for docstrings
          - Single quotes for strings
      comments:
        description: Commenting guidelines
        principles:
          - 'Explain why, not what'
          - Avoid obvious comments
          - Keep comments up to date
          - Use TODO(username) format
        requirements:
          - Comment complex algorithms
          - Document workarounds
          - Explain business logic
          - Note performance considerations
      error_handling:
        description: Error handling patterns
        guidelines:
          - Fail fast and explicitly
          - Provide context in errors
          - Don't ignore exceptions
          - Use custom error types
          - Document exceptions in API
      testing:
        description: Testing conventions
        requirements:
          - 'Test file naming: *_test.ts or test_*.py'
          - One test class per production class
          - Descriptive test method names
          - 'AAA pattern (Arrange, Act, Assert)'
          - Mock external dependencies
      language_specific:
        description: Additional language-specific rules
        typescript:
          - Prefer const over let
          - Use strict mode
          - Avoid var keyword
          - Use async/await over promises
        python:
          - Follow PEP 8 as baseline
          - Use f-strings for formatting
          - Prefer list comprehensions
          - Use context managers
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
    rules:
      three_amigos:
        description: Collaboration between three key perspectives
        roles:
          business:
            responsibility: What problem are we solving?
            participants:
              - Product Owner
              - Business Analyst
              - Domain Expert
            contribution: 'Requirements, acceptance criteria, business rules'
          development:
            responsibility: How might we solve this?
            participants:
              - Developer
              - Architect
              - Technical Lead
            contribution: 'Technical feasibility, implementation approach'
          testing:
            responsibility: What could go wrong?
            participants:
              - QA Engineer
              - Tester
              - Test Analyst
            contribution: 'Edge cases, error scenarios, quality risks'
      gherkin_structure:
        description: Standard structure for BDD scenarios
        keywords:
          feature:
            purpose: High-level description of functionality
            format: 'As a [user], I want [goal] so that [benefit]'
          scenario:
            purpose: Specific example of behavior
            structure: Given-When-Then
          given:
            purpose: Preconditions and context
            guidelines: Set up the initial state
          when:
            purpose: Action or event
            guidelines: Single action that triggers behavior
          then:
            purpose: Expected outcome
            guidelines: Observable result or side effect
          and_but:
            purpose: Additional steps
            guidelines: Chain multiple conditions or outcomes
      scenario_writing:
        description: Guidelines for writing effective scenarios
        best_practices:
          - 'Use domain language, not technical jargon'
          - 'Focus on behavior, not implementation'
          - Keep scenarios independent
          - 'Use specific examples, not abstract concepts'
          - Write from user perspective
          - One scenario per behavior
        structure:
          title: 'Clear, descriptive scenario name'
          given: Context and preconditions
          when: Single action or event
          then: Expected outcome
        anti_patterns:
          - Implementation details in scenarios
          - Multiple actions in When step
          - Testing internal state instead of behavior
          - Scenarios that depend on other scenarios
      automation:
        description: Connecting Gherkin scenarios to code
        frameworks:
          javascript: Cucumber.js
          python: 'Behave, pytest-bdd'
          java: Cucumber-Java
          csharp: SpecFlow
          ruby: Cucumber
        step_definitions:
          purpose: Code that implements Gherkin steps
          guidelines:
            - Reusable across scenarios
            - Parameter extraction from steps
            - Page Object pattern for UI tests
            - Data table handling
      collaboration_practices:
        description: How to implement effective BDD collaboration
        discovery_workshops:
          purpose: Explore and understand requirements
          participants: Three Amigos + stakeholders
          output: Example scenarios and acceptance criteria
        refinement_sessions:
          purpose: Detail scenarios before implementation
          timing: Sprint planning or before development
          output: Refined scenarios ready for automation
        review_sessions:
          purpose: Validate scenarios match expectations
          timing: 'After implementation, before release'
          output: Verified behavior and updated documentation
      living_documentation:
        description: Keeping documentation current and useful
        characteristics:
          - Executable and automated
          - Always up-to-date with code
          - Readable by non-technical stakeholders
          - Serves as regression test suite
        maintenance:
          - Update scenarios when behavior changes
          - Remove obsolete scenarios
          - Refactor common steps
          - Generate reports from test results
      implementation_levels:
        description: Different levels of BDD implementation
        unit_level:
          description: Spec by example for individual components
          tools: 'Jest, RSpec, NUnit with BDD style'
        integration_level:
          description: Service behavior verification
          tools: Cucumber with API testing
        acceptance_level:
          description: End-to-end user behavior
          tools: Cucumber with browser automation
      quality_guidelines:
        description: Ensuring high-quality BDD scenarios
        characteristics:
          readable: Clear to all stakeholders
          maintainable: Easy to update as requirements change
          reliable: Consistent results
          focused: Single behavior per scenario
          independent: No dependencies between scenarios
        review_criteria:
          - Scenarios read like documentation
          - Technical implementation hidden
          - Examples cover happy path and edge cases
          - Business value is clear
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
    rules:
      deployment_frequency:
        description: How often an organization successfully releases to production
        measurement:
          definition: Number of production deployments per unit time
          calculation: deployments_count / time_period
          excludes: 'Failed deployments, rollbacks'
        performance_levels:
          elite: Multiple times per day
          high: Weekly to monthly
          medium: Monthly to every 6 months
          low: Less than every 6 months
        implementation:
          - Automate deployment pipeline
          - Use feature flags for safe releases
          - Implement blue-green deployments
          - Track deployment events automatically
          - Measure only successful production deployments
      lead_time_for_changes:
        description: Time from code commit to code running in production
        measurement:
          definition: Time between commit and successful production deployment
          start_point: Code commit timestamp
          end_point: Production deployment completion
          calculation: median time across all changes
        performance_levels:
          elite: Less than 1 hour
          high: 1 day to 1 week
          medium: 1 week to 1 month
          low: 1 to 6 months
        implementation:
          - Automate CI/CD pipeline completely
          - Minimize code review bottlenecks
          - Reduce batch sizes
          - Eliminate manual approval gates
          - Optimize build and test times
      mean_time_to_recovery:
        description: Time to restore service after a production incident
        measurement:
          definition: Time from incident detection to service restoration
          start_point: Incident detection or user impact
          end_point: Service fully restored
          calculation: median recovery time across incidents
        performance_levels:
          elite: Less than 1 hour
          high: Less than 1 day
          medium: 1 day to 1 week
          low: More than 1 week
        implementation:
          - Implement comprehensive monitoring
          - Create automated alerting
          - Practice incident response procedures
          - Prepare rollback mechanisms
          - Maintain incident response playbooks
      change_failure_rate:
        description: Percentage of deployments causing a failure in production
        measurement:
          definition: Deployments causing incidents / total deployments
          failure_criteria: 'Requires hotfix, rollback, or patch'
          time_window: Link incidents to specific deployments
          calculation: (failed_deployments / total_deployments) * 100
        performance_levels:
          elite: 0-15%
          high: 16-30%
          medium: 16-30%
          low: 16-30%
        implementation:
          - Implement comprehensive testing
          - Use canary deployments
          - Practice test-driven development
          - Implement automated quality gates
          - Monitor post-deployment health
      measurement_automation:
        description: Automated collection and reporting of DORA metrics
        data_sources:
          deployment_frequency:
            - CI/CD pipeline logs
            - Deployment automation tools
            - Container orchestration platforms
          lead_time:
            - Version control systems
            - CI/CD pipeline timestamps
            - Issue tracking systems
          mttr:
            - Incident management systems
            - Monitoring and alerting tools
            - Service status pages
          change_failure_rate:
            - Deployment logs
            - Incident tracking systems
            - Error monitoring tools
        tools:
          - Prometheus + Grafana for metrics
          - DataDog or New Relic for monitoring
          - GitHub/GitLab for source control data
          - Jira/Linear for incident tracking
      improvement_strategies:
        description: How to improve DORA metrics systematically
        deployment_frequency:
          - Reduce deployment friction
          - Automate deployment pipeline
          - Implement feature flags
          - Use trunk-based development
          - Minimize deployment size
        lead_time:
          - Optimize CI/CD pipeline
          - Reduce code review cycle time
          - Automate testing
          - Eliminate manual gates
          - Parallelize build processes
        mttr:
          - Improve monitoring and alerting
          - Practice incident response
          - Automate rollback procedures
          - Implement chaos engineering
          - Create detailed runbooks
        change_failure_rate:
          - Increase test coverage
          - Implement progressive delivery
          - Use automated quality gates
          - Practice TDD/BDD
          - Implement canary releases
      reporting_and_visualization:
        description: How to present and use DORA metrics
        dashboards:
          - Real-time metric displays
          - Trend analysis over time
          - Team and organization comparisons
          - Performance level indicators
        reporting_frequency:
          - Daily monitoring for teams
          - Weekly reports for management
          - Monthly trend analysis
          - Quarterly performance reviews
        actionable_insights:
          - Identify improvement opportunities
          - Track progress against goals
          - Benchmark against industry standards
          - Correlate with business outcomes
      cultural_considerations:
        description: Cultural aspects of implementing DORA metrics
        principles:
          - 'Focus on system improvement, not individual blame'
          - Use metrics for learning and improvement
          - Encourage experimentation and risk-taking
          - Celebrate improvements and learning from failures
        anti_patterns:
          - Using metrics for performance reviews
          - Gaming metrics instead of improving outcomes
          - Focusing on individual rather than team performance
          - Optimizing one metric at the expense of others
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
    rules:
      tutorial_mode:
        description: Learning-oriented documentation for beginners
        purpose: Teaching someone to do something through guided practice
        characteristics:
          - Step-by-step instructions
          - Learning-oriented
          - Concrete working example
          - Minimal explanation
          - Encourages experimentation
        structure:
          introduction: Clear learning outcome statement
          prerequisites: Required knowledge and setup
          learning_objectives: What user will learn
          steps: Numbered sequential instructions
          verification: How to check success
          summary: What was accomplished
          next_steps: Where to go next
        style_guidelines:
          - Use second person ('you will')
          - Present tense ('the command creates')
          - Active voice ('configure the server')
          - Imperative mood for instructions
          - Encouraging and supportive tone
      howto_mode:
        description: Task-oriented documentation for solving specific problems
        purpose: Showing how to solve a particular problem
        characteristics:
          - Problem-focused
          - Assumes some knowledge
          - Results-oriented
          - Practical and actionable
          - No unnecessary explanation
        structure:
          title: 'How to [specific task]'
          context: When to use this approach
          prerequisites: Required setup and knowledge
          procedure: Steps to complete the task
          verification: How to confirm success
          troubleshooting: Common issues and solutions
        style_guidelines:
          - Start with the goal
          - Use conditional language ('if you need to')
          - 'Focus on the task, not learning'
          - Provide alternatives when relevant
      reference_mode:
        description: Information-oriented documentation providing complete details
        purpose: 'Describing the machinery - complete, accurate information'
        characteristics:
          - Comprehensive coverage
          - Authoritative and accurate
          - Well-organized and structured
          - Easy to scan and search
          - Consistent formatting
        structure:
          overview: Brief description of the subject
          parameters: 'All options, arguments, and settings'
          examples: Illustrative usage examples
          return_values: What is returned or output
          errors: Possible error conditions
          see_also: Related reference materials
        style_guidelines:
          - Use declarative statements
          - Be comprehensive and precise
          - Use consistent formatting
          - Include all parameters and options
          - Provide brief examples
      explanation_mode:
        description: Understanding-oriented documentation for deeper comprehension
        purpose: 'Clarifying and discussing concepts, design decisions, and context'
        characteristics:
          - Understanding-oriented
          - Provides context and background
          - Discusses alternatives
          - Explains the 'why'
          - Connects to broader concepts
        structure:
          introduction: Introduce the concept or topic
          context: Why this matters
          detailed_discussion: Deep dive into the concept
          examples: Illustrative scenarios
          implications: Consequences and considerations
          conclusion: Summary and key takeaways
        style_guidelines:
          - Use explanatory tone
          - Provide context and background
          - Discuss trade-offs and alternatives
          - Connect to related concepts
      google_style_integration:
        description: Google Developer Documentation Style Guide integration
        voice_and_tone:
          - Conversational but professional
          - Helpful and encouraging
          - Respectful of user's time
          - Honest about complexity
        grammar_and_style:
          - Second person for user actions
          - Present tense for current state
          - Active voice preferred
          - Parallel structure in lists
          - Sentence case for headings
        formatting:
          - Use code blocks for commands
          - Highlight UI elements with bold
          - Use numbered lists for procedures
          - Use bullet lists for related items
        accessibility:
          - Descriptive link text
          - Alt text for images
          - Logical heading hierarchy
          - Color-independent information
      content_organization:
        description: How to structure and organize documentation
        navigation:
          - Clear information architecture
          - Logical progression from basic to advanced
          - Cross-references between modes
          - Search-friendly structure
        mode_separation:
          - Don't mix tutorial and reference content
          - Link between related content in different modes
          - Use consistent templates within each mode
          - Clear mode identification
      code_examples:
        description: Guidelines for code and examples
        quality_standards:
          - 'Working, tested examples'
          - Realistic use cases
          - Clear comments and explanations
          - Error handling included
          - Consistent style and formatting
        presentation:
          - Syntax highlighting
          - Copy-paste friendly
          - Show expected output
          - Explain non-obvious parts
      user_testing:
        description: Validating documentation effectiveness
        methods:
          - User testing with real users
          - Analytics on documentation usage
          - Feedback collection mechanisms
          - Regular content audits
        metrics:
          - Task completion rates
          - Time to complete tasks
          - User satisfaction scores
          - Support ticket reduction
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

