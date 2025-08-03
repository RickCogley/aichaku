# Aichaku MCP Server Context

```yaml
module:
  name: "aichaku-mcp-server"
  purpose: "Security scanning and code review MCP server with methodology awareness"
  architecture: "mcp_server_with_scanner_integration"

core_components:
  scanner_controller:
    location: "src/scanner-controller.ts"
    purpose: "Orchestrates multiple security scanners"
    scanners:
      - "DevSkim: Regex-based security patterns"
      - "Semgrep: Semantic code analysis"
      - "CodeQL: Advanced dataflow analysis (optional)"
      - "GitLeaks: Secret detection (conditional)"
      - "Trivy: Dependency/container scanning (conditional)"
    key_issue: "Scanners expect files on disk, not just content strings"

  review_engine:
    location: "src/review-engine.ts"
    purpose: "Aggregates findings from scanners and patterns"
    flow: "Request → Scanner Controller → Pattern Matching → Aggregated Results"

  feedback_system:
    location: "src/feedback-system.ts"
    purpose: "Formats results for different consumers"
    issue: "May be hiding security findings in certain formats"

transport_layers:
  stdio:
    purpose: "Claude Code direct integration"
    protocol: "JSON-RPC over stdio"

  http:
    purpose: "Shared access for multiple tools"
    port: 7182
    script: "aichaku-mcp-http-bridge-server.ts"
    note: "Script deployed to ~/.aichaku/mcp-servers/"

  socket:
    purpose: "Real-time bidirectional communication"
    path: "src/socket-server.ts"

patterns:
  security_rules:
    location: "src/patterns/security-patterns.ts"
    content: "OWASP Top 10, CWE patterns"
    format: "Regex and AST-based rules"

  typescript_patterns:
    location: "src/patterns/typescript-patterns.ts"
    content: "TypeScript-specific anti-patterns"

  documentation_patterns:
    location: "src/patterns/documentation-patterns.ts"
    content: "Documentation quality checks"

current_issues:
  scanner_file_requirement:
    problem: "Scanners need actual files on disk"
    impact: "Fails when given non-existent paths"
    solution: "Create temp files or fix path handling"

  display_pipeline:
    problem: "Security findings not shown in MCP tool output"
    location: "Somewhere between review-engine and feedback formatting"

  command_interface:
    status: "Fixed - all commands now working properly"
    improvements:
      - "--help now shows MCP-specific help"
      - "--tools displays all available tools"
      - "--server-start/stop/status for HTTP bridge"
      - "HTTP server process clearly named for grep"

mcp_tools:
  review_file:
    purpose: "Scan individual files for security/quality issues"
    issue: "Shows 'No issues found' even when scanners find problems"

  analyze_project:
    purpose: "Project-wide architecture analysis"

  generate_documentation:
    purpose: "Create docs following standards"

  get_statistics:
    purpose: "Usage metrics and analytics"

deployment:
  binary_name: "aichaku-code-reviewer"
  location: "~/.aichaku/mcp-servers/"
  compilation: "deno compile --allow-all src/mod.ts"
```
