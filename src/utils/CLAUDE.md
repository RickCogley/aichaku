# Utils Module Context

```yaml
module:
  name: "utils"
  purpose: "Shared utilities and helper functions for aichaku core functionality"
  architecture: "utility_modules"

categories:
  configuration:
    - "config-manager.ts: Unified aichaku.json configuration handling"
    - "yaml-config-reader.ts: YAML content discovery and parsing"
    - "dynamic-content-discovery.ts: Methodology/standards content loading"

  security:
    - "path-security.ts: Directory traversal prevention and safe file operations"
    - "version-checker.ts: Version compatibility and update notifications"

  user_interface:
    - "branded-messages.ts: Consistent UI messaging with Brand.PREFIX"
    - "ui.ts: User interaction patterns and prompts"
    - "terminal-formatter.ts: Console output formatting utilities"
    - "visual-guidance.ts: Progress indicators and visual feedback"
    - "feedback.ts: User feedback collection and processing"

  project_management:
    - "project-paths.ts: Project structure discovery and path resolution"
    - "migration-helper.ts: Legacy folder structure migration support"

  mcp_integration:
    - "mcp-client.ts: Base MCP client functionality"
    - "mcp-http-client.ts: HTTP transport for MCP communication"
    - "mcp-socket-client.ts: Socket transport for MCP communication"
    - "mcp-tcp-client.ts: TCP transport for MCP communication"
    - "mcp/: MCP server process management utilities"

patterns:
  utility_design:
    - "Single responsibility per utility module"
    - "Pure functions where possible for testability"
    - "Export both individual functions and default objects"
    - "Use consistent error handling patterns"

  security_first:
    - "All file operations go through path-security.ts"
    - "Validate all user inputs before processing"
    - "Use safe defaults and fail securely"
    - "InfoSec: Log security events, never sensitive data"

  configuration_management:
    - "ConfigManager class for unified configuration access"
    - "Automatic migration from legacy formats"
    - "Type-safe configuration interfaces"
    - "Consolidated aichaku.json format"

testing:
  approach: "Unit tests with mocked dependencies"
  security_focus: "Test path traversal prevention extensively"
  edge_cases: "Test error conditions and boundary values"
  integration: "Test configuration migration scenarios"

architecture_decisions:
  config_consolidation: "Single aichaku.json replaces multiple metadata files"
  mcp_abstraction: "Transport-agnostic MCP client design"
  path_safety: "Centralized path validation prevents security issues"
  brand_consistency: "Unified messaging through branded-messages.ts"
```
