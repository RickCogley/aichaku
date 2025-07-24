# MCP API Reference

Complete reference for the Aichaku MCP (Model Context Protocol) server API, including all available tools, parameters,
and configuration options.

## Available Tools

The Aichaku MCP server provides three tools to Claude Code:

### `review_file`

Reviews a single file for security vulnerabilities, standards compliance, and code quality issues.

#### Parameters

| Parameter         | Type    | Required | Default | Description                                     |
| ----------------- | ------- | -------- | ------- | ----------------------------------------------- |
| `file`            | string  | Yes      | -       | Path to the file to review                      |
| `content`         | string  | No       | -       | File content (if not provided, reads from disk) |
| `includeExternal` | boolean | No       | true    | Include external security scanners if available |

#### Example Usage

```typescript
// Basic file review
(await mcp**aichaku) -
  reviewer**review_file({
    file: "/path/to/src/auth.ts",
  });

// Review with content (useful for unsaved files)
(await mcp**aichaku) -
  reviewer**review_file({
    file: "untitled.js",
    content: "const password = 'hardcoded123';",
    includeExternal: false,
  });
```

#### Response Format

```typescript
{
  success: boolean;
  summary: string;
  details: {
    security: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      issues: SecurityIssue[];
    };
    standards: {
      violations: StandardViolation[];
      suggestions: string[];
    };
    education: {
      lessons: Lesson[];
      resources: string[];
    };
  };
}
```

### `review_methodology`

Checks if a project follows the specified methodology patterns and practices.

#### Parameters

| Parameter     | Type   | Required | Default | Description                        |
| ------------- | ------ | -------- | ------- | ---------------------------------- |
| `projectPath` | string | Yes      | -       | Path to the project root directory |
| `methodology` | string | Yes      | -       | Methodology to check against       |

#### Supported Methodologies

- `shape-up` - Shape Up (6-week cycles, betting table, etc.)
- `scrum` - Scrum (sprints, ceremonies, artifacts)
- `kanban` - Kanban (WIP limits, flow metrics)
- `lean` - Lean (experiments, validated learning)
- `xp` - Extreme Programming (pair programming, TDD)
- `scrumban` - Hybrid Scrum/Kanban

#### Example Usage

```typescript
// Check Shape Up compliance
(await mcp**aichaku) -
  reviewer**review_methodology({
    projectPath: "/Users/you/projects/app",
    methodology: "shape-up",
  });
```

#### Response Format

```typescript
{
  success: boolean;
  methodology: string;
  compliance: {
    score: number; // 0-100
    status: "compliant" | "partial" | "non-compliant";
  };
  findings: {
    present: string[];    // Found methodology artifacts
    missing: string[];    // Expected but missing artifacts
    suggestions: string[]; // Improvements
  };
}
```

### `get_standards`

Retrieves the currently selected standards for a project.

#### Parameters

| Parameter     | Type   | Required | Default | Description                        |
| ------------- | ------ | -------- | ------- | ---------------------------------- |
| `projectPath` | string | Yes      | -       | Path to the project root directory |

#### Example Usage

```typescript
// Get project standards
(await mcp**aichaku) -
  reviewer**get_standards({
    projectPath: "/Users/you/projects/app",
  });
```

#### Response Format

```typescript
{
  success: boolean;
  standards: {
    selected: string[];      // Active standards
    available: string[];     // All available standards
    version: string;         // Configuration version
  };
  methodologies: string[];   // Detected methodologies
}
```

### `get_statistics`

Gets usage statistics and analytics for MCP tool usage.

#### Parameters

| Parameter  | Type   | Required | Default     | Description                                                       |
| ---------- | ------ | -------- | ----------- | ----------------------------------------------------------------- |
| `type`     | string | No       | "dashboard" | Type of statistics: "dashboard", "realtime", "insights", "export" |
| `question` | string | No       | -           | Specific question to answer about usage                           |
| `format`   | string | No       | "json"      | Export format (only for type="export"): "json", "csv"             |

#### Example Usage

```typescript
// Get dashboard statistics
{
  "tool": "get_statistics",
  "arguments": {
    "type": "dashboard"
  }
}

// Ask specific question
{
  "tool": "get_statistics",
  "arguments": {
    "type": "insights",
    "question": "What are the most common security issues?"
  }
}
```

#### Response Format

```typescript
{
  success: boolean;
  type: string;
  data: {
    // Varies by type
    totalReviews?: number;
    issuesFound?: number;
    topIssues?: Array<{issue: string; count: number}>;
    // ... other metrics
  };
}
```

### `analyze_project`

Analyzes project structure, languages, architecture, and dependencies.

#### Parameters

| Parameter     | Type    | Required | Default | Description                                       |
| ------------- | ------- | -------- | ------- | ------------------------------------------------- |
| `projectPath` | string  | Yes      | -       | Path to the project directory to analyze          |
| `detailed`    | boolean | No       | true    | Include detailed analysis of files and components |

#### Example Usage

```typescript
// Analyze project structure
{
  "tool": "analyze_project",
  "arguments": {
    "projectPath": "/Users/you/projects/app",
    "detailed": true
  }
}
```

### `generate_documentation`

Generates comprehensive documentation following selected standards.

#### Parameters

| Parameter         | Type    | Required | Default          | Description                                                     |
| ----------------- | ------- | -------- | ---------------- | --------------------------------------------------------------- |
| `projectPath`     | string  | Yes      | -                | Path to the project directory                                   |
| `outputPath`      | string  | No       | projectPath/docs | Output path for documentation                                   |
| `standard`        | string  | No       | "diataxis"       | Documentation standard: "diataxis", "google", "microsoft", etc. |
| `includeExamples` | boolean | No       | true             | Include code examples                                           |
| `includeDiagrams` | boolean | No       | true             | Generate architecture diagrams                                  |
| `overwrite`       | boolean | No       | false            | Overwrite existing documentation                                |
| `autoChain`       | boolean | No       | true             | Run analyze*project first and review*file after                 |

#### Example Usage

```typescript
// Generate documentation with Diátaxis standard
{
  "tool": "generate_documentation",
  "arguments": {
    "projectPath": "/Users/you/projects/app",
    "standard": "diataxis",
    "includeDiagrams": true
  }
}
```

### `create_doc_template`

Creates a documentation template file for tutorials, how-tos, references, etc.

#### Parameters

| Parameter      | Type   | Required | Default | Description                                                  |
| -------------- | ------ | -------- | ------- | ------------------------------------------------------------ |
| `outputPath`   | string | Yes      | -       | Path where the template file should be created               |
| `templateType` | string | Yes      | -       | Type: "tutorial", "how-to", "reference", "explanation", etc. |
| `title`        | string | No       | -       | Title for the document                                       |
| `projectName`  | string | No       | -       | Name of the project (used in templates)                      |
| `customFields` | object | No       | {}      | Custom fields to replace in the template                     |

#### Example Usage

```typescript
// Create a tutorial template
{
  "tool": "create_doc_template",
  "arguments": {
    "outputPath": "./docs/tutorials/getting-started.md",
    "templateType": "tutorial",
    "title": "Getting Started with MyApp",
    "projectName": "MyApp"
  }
}
```

## Configuration Files

### Project Configuration

The MCP server reads project configuration from `.claude/.aichaku-standards.json`:

```json
{
  "version": "1.0.0",
  "selected": ["nist-csf", "owasp-web", "tdd", "conventional-commits"],
  "methodologies": ["shape-up"],
  "customRules": {
    "maxFileSize": 1000,
    "requireTests": true
  }
}
```

### Global Configuration

Global MCP settings can be placed in `~/.aichaku/mcp-config.json`:

```json
{
  "externalScanners": {
    "codeql": {
      "enabled": true,
      "timeout": 30000
    },
    "devskim": {
      "enabled": true,
      "ignoreRules": ["DS123456"]
    },
    "semgrep": {
      "enabled": true,
      "config": "auto"
    }
  },
  "performance": {
    "maxFileSize": 5242880, // 5MB
    "timeout": 60000, // 60 seconds
    "parallel": true
  }
}
```

## Security Patterns

The MCP server includes built-in patterns for detecting:

### OWASP Top 10 (2021)

| Category                       | Pattern Examples                      |
| ------------------------------ | ------------------------------------- |
| A01: Broken Access Control     | Missing auth checks, path traversal   |
| A02: Cryptographic Failures    | Hardcoded secrets, weak encryption    |
| A03: Injection                 | SQL injection, command injection, XSS |
| A04: Insecure Design           | Security anti-patterns                |
| A05: Security Misconfiguration | Verbose errors, default configs       |
| A06: Vulnerable Components     | Outdated dependencies                 |
| A07: Auth Failures             | Weak password handling                |
| A08: Software Integrity        | Unsigned code, untrusted sources      |
| A09: Logging Failures          | Sensitive data in logs                |
| A10: SSRF                      | Unvalidated redirects                 |

### Language-Specific Patterns

#### TypeScript/JavaScript

```typescript
// Detected patterns:
- eval() and Function() usage
- Unvalidated user input in exec()
- DOM XSS vulnerabilities
- Prototype pollution
- Insecure randomness
```

#### Python

```python
# Detected patterns:
- pickle deserialization
- SQL string formatting
- Command injection via subprocess
- Path traversal in file operations
- Weak cryptography usage
```

#### Go

```go
// Detected patterns:
- SQL query building
- Command execution
- Path cleaning issues
- Integer overflow
- Race conditions
```

## External Scanner Integration

### CodeQL

When CodeQL is available, the MCP server runs:

```bash
codeql database analyze --format=sarif-latest
```

Supports:

- JavaScript/TypeScript security queries
- Python security queries
- Go security queries
- Custom query packs

### DevSkim

When DevSkim is available:

```bash
devskim analyze -f sarif -o results.sarif
```

Features:

- IDE-focused security rules
- Low false positive rate
- Cross-language support

### Semgrep

When Semgrep is available:

```bash
semgrep --config=auto --json
```

Benefits:

- Community rules
- Custom patterns
- Fast scanning

## Response Examples

### Security Issue Found

```json
{
  "success": true,
  "summary": "Found 3 security issues (1 critical, 2 medium)",
  "details": {
    "security": {
      "critical": 1,
      "high": 0,
      "medium": 2,
      "low": 0,
      "issues": [
        {
          "severity": "critical",
          "type": "command-injection",
          "line": 42,
          "column": 15,
          "message": "User input passed directly to shell command",
          "owasp": "A03",
          "fix": {
            "description": "Use parameterized commands",
            "example": "Use execFile() instead of exec()"
          }
        }
      ]
    }
  }
}
```

### Standards Violation

```json
{
  "success": true,
  "summary": "Code violates 2 standards",
  "details": {
    "standards": {
      "violations": [
        {
          "standard": "tdd",
          "rule": "test-first",
          "message": "No tests found for auth.ts",
          "suggestion": "Create auth.test.ts with test cases"
        },
        {
          "standard": "conventional-commits",
          "rule": "commit-format",
          "message": "Non-conventional commit message",
          "suggestion": "Use format: type(scope): description"
        }
      ]
    }
  }
}
```

## Error Handling

### Common Errors

| Error Code                | Description              | Solution                    |
| ------------------------- | ------------------------ | --------------------------- |
| `FILE*NOT*FOUND`          | File doesn't exist       | Check file path             |
| `PROJECT*NOT*INITIALIZED` | No .claude directory     | Run `aichaku init`          |
| `INVALID_METHODOLOGY`     | Unknown methodology      | Check spelling              |
| `SCANNER_TIMEOUT`         | External scanner timeout | Increase timeout or disable |
| `PERMISSION_DENIED`       | Can't read file          | Check file permissions      |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "FILE*NOT*FOUND",
    "message": "Cannot read file: /path/to/file.ts",
    "suggestion": "Check that the file exists and is readable"
  }
}
```

## Performance Considerations

### File Size Limits

- Default: 5MB per file
- Configurable in `mcp-config.json`
- Large files may timeout

### Caching

The MCP server implements smart caching:

- File content cache (5 minute TTL)
- Standards configuration cache
- External scanner results cache

### Parallel Processing

When reviewing multiple files:

- Runs security patterns in parallel
- External scanners run sequentially
- Results aggregated asynchronously

## Environment Variables

| Variable                  | Description               | Default            |
| ------------------------- | ------------------------- | ------------------ |
| `AICHAKU*MCP*DEBUG`       | Enable debug logging      | `false`            |
| `AICHAKU*MCP*TIMEOUT`     | Global timeout (ms)       | `60000`            |
| `AICHAKU*MCP*CACHE_DIR`   | Cache directory           | `~/.aichaku/cache` |
| `AICHAKU*MCP*NO_EXTERNAL` | Disable external scanners | `false`            |

## Logging

Debug logs are written to `~/.aichaku/mcp-server/logs/` when debug mode is enabled:

```bash
export AICHAKU*MCP*DEBUG=true
```

Log format:

```
[2024-07-10T15:30:45Z] [INFO] Starting file review: /path/to/file.ts
[2024-07-10T15:30:45Z] [DEBUG] Loading standards: ["nist-csf", "tdd"]
[2024-07-10T15:30:46Z] [INFO] Review complete: 3 issues found
```

## Version Compatibility

| MCP Server Version | Aichaku Version | Claude Code Version |
| ------------------ | --------------- | ------------------- |
| 1.0.x              | 1.0.x           | 0.9.x+              |
| 1.1.x              | 1.1.x           | 1.0.x+              |

Always use matching Aichaku and MCP server versions for best results.

## See Also

- [Setup MCP Server](../tutorials/setup-mcp-server.md) - Installation guide
- [Using MCP with Multiple Projects](../how-to/use-mcp-with-multiple-projects.md) - Multi-project setup
- [MCP Architecture](../explanation/mcp-architecture.md) - Technical deep dive
