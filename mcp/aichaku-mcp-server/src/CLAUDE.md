# Aichaku MCP Server Context

```yaml
module:
  name: "aichaku-mcp-server"
  purpose: "Model Context Protocol server for code review, documentation generation, and methodology compliance"
  architecture: "mcp_server_pattern"
  protocol: "Model Context Protocol v1.0"

core_components:
  server_infrastructure:
    - "server.ts: Main MCP server implementation and tool registry"
    - "http-server.ts: HTTP transport layer for MCP communication"
    - "socket-server.ts: WebSocket transport for real-time communication"
    - "tcp-server.ts: TCP transport for network communication"
    - "mod.ts: Module exports and public API surface"

  analysis_engine:
    - "review-engine.ts: Core code review logic with methodology awareness"
    - "scanner-controller.ts: Coordinated analysis across multiple tools"
    - "analysis/project-analyzer.ts: Project structure and architecture analysis"

  methodology_integration:
    - "methodology-manager.ts: Dynamic methodology loading and application"
    - "standards-manager.ts: Development standards enforcement"
    - "config/methodology-fallback.ts: Default methodology behaviors"

  feedback_system:
    - "feedback-system.ts: Structured feedback generation and formatting"
    - "feedback-builder.ts: Feedback construction with priority levels"
    - "feedback/: Specialized feedback formatters and progress tracking"

tools_provided:
  review_file: "Comprehensive code review with methodology-specific guidance"
  analyze_project: "Project structure analysis and architecture insights"
  generate_documentation: "Documentation generation following selected standards"
  create_doc_template: "Template creation for methodology-specific documents"
  review_methodology: "Methodology compliance checking"
  get_standards: "Active standards retrieval for projects"
  get_statistics: "Usage analytics and review metrics"

patterns:
  mcp_compliance:
    - "Follow MCP protocol specification strictly"
    - "Provide structured tool definitions with JSON schemas"
    - "Return consistent error formats and status codes"
    - "Support both streaming and batch operations"

  methodology_awareness:
    - "Load only active methodology patterns for focused analysis"
    - "Adapt review criteria based on project methodology selection"
    - "Provide methodology-specific templates and guidance"
    - "Integrate with aichaku methodology configuration"

  security_integration:
    - "Apply OWASP Top 10 analysis patterns"
    - "Enforce NIST-CSF compliance where configured"
    - "Generate InfoSec annotations for security-relevant changes"
    - "Validate all file operations through path-security utilities"

feedback_structure:
  priority_levels:
    - "critical: Must fix before deployment"
    - "warning: Should address for code quality"
    - "suggestion: Consider for improvement"
    - "info: General observations and insights"

  methodology_context:
    - "Include relevant methodology principles in feedback"
    - "Suggest methodology-specific patterns and practices"
    - "Reference methodology documentation where applicable"

integration_points:
  aichaku_core: "Uses shared methodology and standards configuration"
  claude_code: "Integrated as MCP server for seamless code review"
  project_config: "Reads aichaku.json for methodology and standards selection"
  documentation: "Generates docs following selected documentation standards"
```
