# GitHub MCP Server Context

```yaml
module:
  name: "github-mcp-server"
  purpose: "Model Context Protocol server for GitHub operations via API integration"
  architecture: "mcp_github_client"
  protocol: "Model Context Protocol v1.0"

core_components:
  server_infrastructure:
    - "src/server.ts: Main MCP server with GitHub API integration"
    - "src/formatting-system.ts: Response formatting and output standardization"

  authentication:
    - "src/auth/manager.ts: GitHub token management and authentication flow"
    - "Secure token storage and validation"
    - "Support for personal access tokens and GitHub Apps"

  github_integration:
    - "src/github/client.ts: GitHub API client with rate limiting and error handling"
    - "REST API v4 integration with proper pagination"
    - "Webhook support for real-time updates"

  tools_provided:
    auth:
      - "auth_status: Check GitHub authentication state"
      - "auth_login: Authenticate with GitHub token"

    releases:
      - "release_upload: Upload assets to GitHub releases"
      - "release_view: View release details and assets"

    workflows:
      - "run_list: List GitHub Actions workflow runs"
      - "run_view: View specific workflow run details"
      - "run_watch: Monitor workflow run progress with polling"

    repositories:
      - "repo_view: View repository information and metadata"
      - "repo_list: List user repositories with filtering"

    utilities:
      - "version_info: Get version compatibility information"
      - "version_check: Check GitHub CLI version compatibility"

patterns:
  mcp_compliance:
    - "Strict adherence to MCP protocol specification"
    - "JSON Schema validation for all tool parameters"
    - "Consistent error reporting with GitHub API error codes"
    - "Proper resource cleanup and connection management"

  github_api_best_practices:
    - "Rate limiting respect with exponential backoff"
    - "Proper pagination handling for large result sets"
    - "Efficient use of conditional requests with ETags"
    - "Comprehensive error handling for API edge cases"

  security_patterns:
    - "Token validation and secure storage patterns"
    - "Path traversal prevention for file operations"
    - "Input sanitization for all user-provided parameters"
    - "InfoSec: Never log tokens or sensitive authentication data"

tool_architecture:
  parameter_validation:
    - "JSON Schema validation for all tool inputs"
    - "Type-safe parameter handling with TypeScript interfaces"
    - "Required vs optional parameter enforcement"
    - "Default value handling and parameter coercion"

  response_formatting:
    - "Consistent response structure across all tools"
    - "Rich formatting with markdown support"
    - "Progress indicators for long-running operations"
    - "Error context with actionable remediation steps"

  async_operations:
    - "Proper async/await patterns for API calls"
    - "Timeout handling for long-running requests"
    - "Cancellation support for user-interrupted operations"
    - "Progress reporting for multi-step operations"

integration_points:
  aichaku_commands: "Used by src/commands/github.ts for CLI GitHub operations"
  claude_code: "Direct MCP integration for seamless GitHub workflow management"
  ci_cd: "Supports release automation and workflow monitoring"
  development_workflow: "Integrates with standard GitHub development practices"

error_handling:
  github_api_errors:
    - "Rate limiting: Graceful backoff with retry suggestions"
    - "Authentication: Clear token validation and renewal guidance"
    - "Permissions: Specific scope requirement explanations"
    - "Network: Timeout and connectivity issue handling"

  user_experience:
    - "Progressive disclosure of error details"
    - "Actionable error messages with next steps"
    - "Context-aware suggestions based on operation type"
    - "Graceful degradation when partial data is available"

deployment:
  distribution: "Compiled binaries via build-binaries.ts script"
  configuration: "Environment-based token and endpoint configuration"
  monitoring: "Built-in health checks and status reporting"
  security: "Minimal permissions principle with explicit scope requests"
```
