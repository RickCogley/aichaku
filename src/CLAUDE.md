# Source Module Context

```yaml
module:
  name: "src"
  purpose: "Core aichaku functionality including CLI commands, utilities, and configuration management"
  architecture: "modular_cli_application"

architecture_overview:
  entry_points:
    - "mod_test.ts: Module integration testing"
    - "types.ts: Shared TypeScript type definitions"
    - "paths.ts: Global path constants and utilities"

  legacy_components:
    - "installer.ts: Legacy installation system (superseded by commands/init.ts)"
    - "updater.ts: Legacy update system (superseded by commands/upgrade.ts)"
    - "lister.ts: Legacy listing functionality (superseded by commands/learn.ts)"

module_organization:
  commands:
    purpose: "CLI command implementations"
    pattern: "Each command exports main function with options interface"
    context: "See commands/CLAUDE.md for detailed command architecture"

  utils:
    purpose: "Shared utilities and helper functions"
    pattern: "Functional utilities with minimal dependencies"
    context: "See utils/CLAUDE.md for utility architecture details"

  linters:
    purpose: "Documentation linting engines for various style guides"
    pattern: "Strategy pattern with base linter and specific implementations"
    context: "See linters/CLAUDE.md for linting architecture"

  config:
    purpose: "Configuration defaults and templates"
    components:
      - "methodology-defaults.ts: Default methodology configurations"
      - "methodology-templates.ts: Template content for methodology artifacts"

  migration:
    purpose: "Legacy folder structure migration utilities"
    scope: "Support transition from old ~/.claude/ structure to new ~/.claude/aichaku/"

design_principles:
  modularity:
    - "Clear separation of concerns between modules"
    - "Minimal inter-module dependencies"
    - "Consistent interface patterns across similar components"
    - "Pluggable architecture for extensibility"

  security_first:
    - "All file operations validated through path-security utilities"
    - "Input sanitization and validation at module boundaries"
    - "InfoSec: Security considerations documented in relevant modules"
    - "Principle of least privilege for file system access"

  user_experience:
    - "Consistent CLI patterns and error messaging"
    - "Progressive enhancement with dry-run and verbose modes"
    - "Clear feedback and actionable error messages"
    - "Graceful degradation when features are unavailable"

configuration_management:
  unified_config:
    - "Consolidated aichaku.json format replacing multiple metadata files"
    - "Automatic migration from legacy configuration formats"
    - "Type-safe configuration interfaces with validation"
    - "Project-level and global configuration support"

  methodology_awareness:
    - "Dynamic content loading based on active methodology selection"
    - "Context optimization through focused methodology guidance"
    - "Integration with sub-agent system for specialized advice"

testing_strategy:
  unit_testing:
    - "Test files use _test.ts suffix convention"
    - "Mock file system operations for safety and speed"
    - "Focus on error paths and edge cases"
    - "Type safety validation through TypeScript compilation"

  integration_testing:
    - "Command-level integration tests"
    - "Configuration migration scenario testing"
    - "Cross-platform compatibility validation"

development_patterns:
  command_implementation:
    - "Export main function with typed options interface"
    - "Return success/failure objects with descriptive messages"
    - "Use branded console output for consistency"
    - "Support dry-run mode for destructive operations"

  utility_functions:
    - "Pure functions where possible for testability"
    - "Consistent error handling and reporting patterns"
    - "Single responsibility principle per utility module"
    - "Documented interfaces and expected behaviors"

  configuration_access:
    - "Use ConfigManager class for unified configuration access"
    - "Automatic legacy format detection and migration"
    - "Type-safe configuration reading and writing"
    - "Validation and error handling for malformed configuration"

legacy_migration:
  deprecation_strategy:
    - "Legacy files maintained for backward compatibility"
    - "Clear migration paths documented"
    - "Gradual deprecation with user warnings"
    - "Eventual removal after migration period"

  compatibility_layer:
    - "Legacy exports maintained in mod.ts for existing users"
    - "Wrapper functions that delegate to new implementations"
    - "Clear deprecation notices in documentation"
```
