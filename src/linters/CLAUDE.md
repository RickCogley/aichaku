# Linters Module Context

```yaml
module:
  name: "linters"
  purpose: "Documentation linting engines for various style guides and standards"
  architecture: "strategy_pattern"

linter_implementations:
  base_linter:
    file: "base-linter.ts"
    role: "Abstract base class defining linter interface and common functionality"
    patterns:
      - "Standardized error reporting with line numbers and severity"
      - "File type detection and processing pipeline"
      - "Configurable rules and auto-fix capabilities"

  documentation_standards:
    diataxis:
      file: "diataxis-linter.ts"
      focus: "Diátaxis documentation framework compliance"
      checks:
        - "Four documentation types: tutorial, how-to, reference, explanation"
        - "Content structure and organization patterns"
        - "User-centered documentation approach validation"

    google_style:
      file: "google-style-linter.ts"
      focus: "Google developer documentation style guide"
      checks:
        - "Writing style: active voice, second person, present tense"
        - "Technical accuracy and code example formatting"
        - "Accessibility and inclusive language requirements"

    microsoft_style:
      file: "microsoft-style-linter.ts"
      focus: "Microsoft Writing Style Guide compliance"
      checks:
        - "Global-ready and accessible writing patterns"
        - "Inclusive language and bias-free communication"
        - "Technical documentation structure and formatting"

architecture_patterns:
  strategy_pattern:
    - "Base linter defines common interface and behavior"
    - "Each style guide implements specific linting rules"
    - "Pluggable architecture allows adding new linters easily"
    - "Consistent error reporting across all implementations"

  rule_engine:
    - "Configurable rule sets per linting standard"
    - "Severity levels: error, warning, suggestion, info"
    - "Auto-fix capabilities where rules allow safe correction"
    - "Line-by-line analysis with precise error location"

integration:
  docs_lint_command: "Used by src/commands/docs-lint.ts for CLI linting"
  standards_selection: "Activated based on selected documentation standards"
  auto_fix: "Supports automatic correction of style violations"
  reporting: "Structured error reports with actionable suggestions"

usage_patterns:
  initialization:
    - "Instantiate specific linter based on selected standard"
    - "Configure rules and severity levels"
    - "Set auto-fix preferences and safe operation limits"

  processing:
    - "Accept file content and metadata"
    - "Apply rule set to analyze content structure and style"
    - "Generate structured error reports with locations"
    - "Provide auto-fix suggestions where applicable"

  error_handling:
    - "Graceful degradation when rules fail to apply"
    - "Clear error messages for rule configuration issues"
    - "Safe auto-fix that preserves content integrity"

testing_approach:
  rule_validation: "Test each rule against positive and negative examples"
  auto_fix_safety: "Verify auto-fixes don't introduce new errors"
  edge_cases: "Test with malformed markdown and edge content"
  integration: "Test with actual documentation files from projects"
```
