# MCP Module Context

```yaml
module:
  name: "mcp"
  purpose: "Model Context Protocol servers providing AI-enhanced development tools"
  architecture: "multi_server_mcp"

overview:
  description: "Container for multiple MCP servers, each with focused responsibilities"
  protocol: "Model Context Protocol (MCP) - standardized AI tool interaction"
  deployment: "Individual binaries per server, shared HTTP bridge infrastructure"

servers:
  aichaku_mcp_server:
    purpose: "Code review, security scanning, methodology compliance"
    transport: "stdio (Claude Code), HTTP (shared access)"
    capabilities:
      - "Security scanning via DevSkim, Semgrep, CodeQL"
      - "Methodology compliance checking"
      - "Documentation generation"
      - "Code standards enforcement"

  github_mcp_server:
    purpose: "GitHub API operations and workflow management"
    transport: "stdio (Claude Code)"
    capabilities:
      - "Release management"
      - "Workflow monitoring"
      - "Repository operations"
      - "Authentication handling"

infrastructure:
  http_bridge:
    purpose: "Shared access point for multiple consumers"
    port: 7182
    script_name: "aichaku-mcp-http-bridge-server.ts"
    benefits:
      - "Scanner process reuse"
      - "Result caching"
      - "Centralized configuration"
      - "No token consumption for local operations"
    files:
      - "~/.aichaku/mcp-servers/aichaku-mcp-http-bridge-server.ts"
      - "~/.aichaku/aichaku-mcp-http-bridge-server.log"
      - "~/.aichaku/aichaku-mcp-http-bridge-server.pid"

  command_interface:
    entry: "aichaku mcp"
    subcommands:
      - "install: Deploy MCP server binaries"
      - "config: Generate Claude Code configuration"
      - "status: Check server health"
      - "tools: List available MCP tools"
      - "server-start: Launch HTTP bridge server"
      - "server-stop: Stop HTTP bridge server"
      - "server-status: Check HTTP bridge status"

architecture_benefits:
  abstraction:
    - "Unified interface for multiple security scanners"
    - "Normalized output across different tools"
    - "Single configuration point"

  performance:
    - "Warm scanner instances"
    - "Shared cache across consumers"
    - "No startup overhead per scan"

  flexibility:
    - "Multiple access patterns (stdio, HTTP)"
    - "Independent server lifecycles"
    - "Graceful degradation"

integration_points:
  claude_code: "Direct MCP protocol integration"
  git_hooks: "HTTP API for pre-commit scanning"
  cli: "aichaku review command"
  editors: "VS Code, vim via HTTP API"
  ci_cd: "GitHub Actions, Jenkins via HTTP"
```
