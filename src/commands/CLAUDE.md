# Commands Module Context

```yaml
module:
  name: "commands"
  purpose: "CLI command implementations for aichaku functionality"
  architecture: "command_pattern"

commands:
  core:
    - "init.ts: Project initialization with methodology selection"
    - "upgrade.ts: Update methodologies and project configuration"
    - "integrate.ts: Add aichaku directives to CLAUDE.md"
    - "uninstall.ts: Clean removal of aichaku components"

  methodology_management:
    - "methodologies.ts: Select and manage active methodologies"
    - "standards.ts: Choose development and documentation standards for projects"

  content_discovery:
    - "learn.ts: Dynamic methodology and standards learning"
    - "help.ts: Legacy help system (deprecated)"
    - "content-fetcher.ts: YAML-based content retrieval"

  advanced:
    - "mcp.ts: Model Context Protocol server management"
    - "review.ts: Code review via MCP integration"
    - "github.ts: GitHub operations through MCP"
    - "hooks.ts: Claude Code hooks management"
    - "migrate.ts: Legacy folder structure migration"

patterns:
  command_structure:
    - "Each command exports main function with options interface"
    - "Use branded console messages via branded-messages.ts"
    - "Validate paths with path-security.ts utilities"
    - "Return success/failure objects with descriptive messages"

  error_handling:
    - "InfoSec: Never expose sensitive paths in error messages"
    - "Use try-catch with user-friendly error descriptions"
    - "Exit with appropriate codes (0=success, 1=error)"

  user_experience:
    - "Provide clear next steps after command completion"
    - "Use consistent emoji and formatting via Brand.PREFIX"
    - "Support dry-run mode for destructive operations"

testing:
  approach: "Unit tests with _test.ts suffix"
  mocking: "Mock file system operations for safety"
  coverage: "Focus on error paths and edge cases"

security:
  path_validation: "All file operations use path-security.ts"
  user_input: "Sanitize and validate all user-provided paths"
  permissions: "Minimal required permissions for each operation"
```
