# Getting Started with Aichaku API

This comprehensive tutorial teaches you how to use the Aichaku methodology
library and MCP (Model Context Protocol) server. You learn how to use all
available tools, CLI commands, and configuration options to enhance your
development workflow.

## Prerequisites

Before you begin this tutorial, ensure you have:

- **Deno 2.4.0+** or **Node.js 18+** installed
- **Claude Code** or another MCP-compatible client
- Basic familiarity with command-line interfaces
- A development project where you want to apply methodologies

## Table of Contents

- [CLI Commands](#cli-commands)
- [MCP Tools](#mcp-tools)
  - [Code Review Tools](#code-review-tools)
  - [Documentation Tools](#documentation-tools)
  - [Statistics API](#statistics-api)
- [Configuration Files](#configuration-files)
- [Programmatic API](#programmatic-api)
- [Security Patterns](#security-patterns)
- [External Scanner Integration](#external-scanner-integration)
- [Error Handling](#error-handling)

## CLI Commands

### Core Commands

#### `aichaku init`

Initialize a new Aichaku project in your current directory.

```bash
aichaku init [options]

Options:
  --methodology, -m    Methodology to use (shape-up, scrum, kanban, lean, xp)
  --standards, -s      Comma-separated list of standards to enable
  --silent             Skip interactive prompts
  --force              Overwrite existing configuration
```

#### `aichaku install`

Install a methodology in your current project or globally.

```bash
aichaku install <methodology> [options]

Options:
  --global, -g         Install globally in ~/.claude/methodologies
  --force, -f          Force installation even if already exists
  --symlink            Create symlink instead of copying
  --project-path       Specify project path (default: current directory)
```

#### `aichaku list`

View available and installed methodologies.

```bash
aichaku list [options]

Options:
  --installed          Show only installed methodologies
  --available          Show only available methodologies
  --global             List global methodologies
```

#### `aichaku standards`

Manage documentation standards for your project.

```bash
aichaku standards [action] [options]

Actions:
  list                 List all available standards
  add <standard>       Add a standard to the project
  remove <standard>    Remove a standard from the project
  show                 Show currently selected standards

Options:
  --project-path       Specify project path (default: current directory)
```

#### `aichaku mcp`

Start the MCP server for Claude Code integration.

```bash
aichaku mcp [options]

Options:
  --debug              Enable debug logging
  --no-external        Disable external security scanners
  --statistics         Enable statistics collection
```

## MCP Tools

You can access Aichaku MCP server tools through Claude Code using the
`mcp__aichaku-reviewer__` prefix for review tools and `mcp__aichaku__` prefix
for documentation tools.

### Code Review Tools

#### `review_file`

Review a single file for security vulnerabilities, standards compliance, and
code quality issues.

##### Parameters

| Parameter         | Type    | Required | Default | Description                                     |
| ----------------- | ------- | -------- | ------- | ----------------------------------------------- |
| `file`            | string  | Yes      | -       | Path to the file you want to review             |
| `content`         | string  | No       | -       | File content (if not provided, reads from disk) |
| `includeExternal` | boolean | No       | true    | Include external security scanners if available |

##### Example Usage

```typescript
// Basic file review
await mcp__aichaku - reviewer__review_file({
  file: "/path/to/src/auth.ts",
});

// Review with content (useful for unsaved files)
await mcp__aichaku - reviewer__review_file({
  file: "untitled.js",
  content:
    "const password = process.env.DB_PASSWORD; // Use environment variables for secrets",
  includeExternal: false,
});
```

##### Response Format

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
      issues: Array<{
        severity: string;
        type: string;
        line: number;
        column: number;
        message: string;
        owasp?: string;
        fix?: {
          description: string;
          example: string;
        };
      }>;
    };
    standards: {
      violations: Array<{
        standard: string;
        rule: string;
        message: string;
        suggestion: string;
      }>;
      suggestions: string[];
    };
    education: {
      lessons: Array<{
        issue: string;
        solution: string;
        context: string;
        problematicPattern: string;
        recommendedPattern: string;
        steps: string[];
        reflection: string;
      }>;
      resources: string[];
    };
  };
}
```

#### `review_methodology`

Check if your project follows the specified methodology patterns and practices.

##### Parameters

| Parameter     | Type   | Required | Default | Description                                                  |
| ------------- | ------ | -------- | ------- | ------------------------------------------------------------ |
| `projectPath` | string | Yes      | -       | Path to your project root directory                          |
| `methodology` | string | No       | -       | Methodology to check against (auto-detects if not specified) |

##### Supported Methodologies

- `shape-up` - Shape Up (6-week cycles, betting table, etc.)
- `scrum` - Scrum (sprints, ceremonies, artifacts)
- `kanban` - Kanban (WIP limits, flow metrics)
- `lean` - Lean (experiments, validated learning)
- `xp` - Extreme Programming (pair programming, TDD)
- `scrumban` - Hybrid Scrum/Kanban

##### Response Format

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

#### `get_standards`

Retrieve the currently selected standards for your project.

##### Parameters

| Parameter     | Type   | Required | Default | Description                         |
| ------------- | ------ | -------- | ------- | ----------------------------------- |
| `projectPath` | string | Yes      | -       | Path to your project root directory |

##### Response Format

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

### Documentation Tools

#### `analyze_project`

Analyze your project directory to understand its structure, technologies, and
patterns.

##### Parameters

| Parameter      | Type    | Required | Description                                         |
| -------------- | ------- | -------- | --------------------------------------------------- |
| `projectPath`  | string  | Yes      | Absolute or relative path to your project directory |
| `depth`        | number  | No       | How deep to analyze (1-5, default: 3)               |
| `includeTests` | boolean | No       | Whether to analyze test files (default: true)       |
| `includeDocs`  | boolean | No       | Whether to analyze documentation (default: true)    |

##### Response Format

```typescript
{
  projectPath: string;
  name: string;
  type: 'application' | 'library' | 'tool' | 'mixed';
  languages: Array<{
    name: string;
    percentage: number;
    files: number;
  }>;
  frameworks: string[];
  structure: {
    hasSrc: boolean;
    hasTests: boolean;
    hasDocs: boolean;
    hasCI: boolean;
    directories: string[];
  };
  dependencies: {
    manager: string;
    count: number;
    dev: number;
    outdated?: number;
  };
  methodology: {
    detected: string[];
    confidence: number;
    suggestions: string[];
  };
  metrics: {
    totalFiles: number;
    totalLines: number;
    testCoverage?: number;
  };
}
```

##### Example Usage

```typescript
// Analyze current directory
const analysis = await mcp__aichaku__analyze_project({
  projectPath: ".",
  depth: 3,
});

// Deep analysis with all options
const deepAnalysis = await mcp__aichaku__analyze_project({
  projectPath: "./my-app",
  depth: 5,
  includeTests: true,
  includeDocs: true,
});
```

#### `create_doc_template`

Generate documentation templates based on your project type and detected
patterns.

##### Parameters

| Parameter      | Type     | Required | Description                                                                  |
| -------------- | -------- | -------- | ---------------------------------------------------------------------------- |
| `projectPath`  | string   | Yes      | Path to your project                                                         |
| `templateType` | string   | Yes      | Type of template: 'readme', 'api', 'architecture', 'contributing', 'testing' |
| `format`       | string   | No       | Output format: 'markdown', 'asciidoc', 'rst' (default: 'markdown')           |
| `analysis`     | object   | No       | Pre-computed project analysis (to avoid re-analysis)                         |
| `standards`    | string[] | No       | Documentation standards to follow                                            |

##### Response Format

```typescript
{
  type: string;
  format: string;
  path: string;
  content: string;
  sections: Array<{
    name: string;
    content: string;
    required: boolean;
  }>;
  metadata: {
    created: string;
    projectType: string;
    technologies: string[];
    standards: string[];
  };
}
```

##### Example Usage

```typescript
// Create README template
const readme = await mcp__aichaku__create_doc_template({
  projectPath: ".",
  templateType: "readme",
  standards: ["conventional-commits", "semver"],
});

// Create API documentation template
const apiDocs = await mcp__aichaku__create_doc_template({
  projectPath: "./api-service",
  templateType: "api",
  format: "markdown",
});
```

#### `generate_documentation`

Automatically generate complete documentation by analyzing your code and
existing docs.

##### Parameters

| Parameter         | Type     | Required | Description                                                         |
| ----------------- | -------- | -------- | ------------------------------------------------------------------- |
| `projectPath`     | string   | Yes      | Path to your project                                                |
| `outputPath`      | string   | No       | Where to save documentation (default: './docs')                     |
| `types`           | string[] | No       | Documentation types to generate: ['api', 'readme', 'guides', 'all'] |
| `format`          | string   | No       | Output format (default: 'markdown')                                 |
| `includeExamples` | boolean  | No       | Generate usage examples (default: true)                             |
| `analysis`        | object   | No       | Pre-computed project analysis                                       |
| `standards`       | string[] | No       | Documentation standards to follow                                   |
| `methodology`     | string   | No       | Specific methodology to align with                                  |

##### Response Format

```typescript
{
  success: boolean;
  outputPath: string;
  files: Array<{
    path: string;
    type: string;
    size: number;
    sections: number;
  }>;
  summary: {
    totalFiles: number;
    totalSections: number;
    coverage: {
      functions: number;
      classes: number;
      modules: number;
    };
    standards: string[];
  };
  warnings: string[];
}
```

##### Example Usage

```typescript
// Generate all documentation types
const docs = await mcp__aichaku__generate_documentation({
  projectPath: ".",
  types: ["all"],
  includeExamples: true,
});

// Generate API documentation only
const apiDocs = await mcp__aichaku__generate_documentation({
  projectPath: "./typescript-api",
  outputPath: "./docs/api",
  types: ["api"],
  standards: ["openapi", "jsdoc"],
});

// Generate methodology-aligned documentation
const shapeUpDocs = await mcp__aichaku__generate_documentation({
  projectPath: "./my-project",
  types: ["guides", "readme"],
  methodology: "shape-up",
});
```

### Statistics API

#### `get_statistics`

Retrieve usage statistics and analytics for your MCP tool usage.

##### Parameters

| Parameter  | Type   | Required | Description                                                       |
| ---------- | ------ | -------- | ----------------------------------------------------------------- |
| `type`     | string | No       | Type of statistics: 'dashboard', 'realtime', 'insights', 'export' |
| `format`   | string | No       | Export format (for type=export): 'json', 'csv'                    |
| `question` | string | No       | Specific question to answer about your usage                      |

##### Response Types

###### Dashboard Statistics

```typescript
{
  generatedAt: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSessions: number;
    totalOperations: number;
    averageSessionDuration: number;
    overallSuccessRate: number;
    mostUsedTool: string;
    mostReviewedFileType: string;
    mostUsedStandard: string;
  };
  toolUsage: Array<{
    toolName: string;
    usageCount: number;
    successRate: number;
    averageDuration: number;
  }>;
  fileAnalytics: Array<{
    fileType: string;
    reviewCount: number;
    averageIssues: number;
    topIssues: string[];
  }>;
  standardsCompliance: Array<{
    standard: string;
    usageCount: number;
    averageScore: number;
    improvement: number;
  }>;
  performanceTrends: Array<{
    date: string;
    averageResponseTime: number;
    successRate: number;
    operationCount: number;
  }>;
  recommendations: string[];
}
```

###### Real-time Statistics

```typescript
{
  activeSession?: {
    startTime: Date;
    totalOperations: number;
    successRate: number;
  };
  recentActivity: Array<{
    timestamp: Date;
    success: boolean;
    toolName: string;
    duration: number;
  }>;
  currentPerformance: Record<string, {
    averageDuration: number;
    successRate: number;
  }>;
}
```

###### Insights Report

```typescript
{
  totalOperations: number;
  toolUsage: Array<{
    tool: string;
    count: number;
    averageTime: number;
    successRate: number;
  }>;
  fileAnalytics: Array<{
    file: string;
    reviewCount: number;
    averageTime: number;
    issues: number;
  }>;
  trend: string;
  recommendations: string[];
}
```

##### Example Usage

```typescript
// Get dashboard statistics
const stats = await mcp__aichaku - reviewer__get_statistics({
  type: "dashboard",
});

// Get real-time performance data
const realtime = await mcp__aichaku - reviewer__get_statistics({
  type: "realtime",
});

// Export statistics as CSV
const csvExport = await mcp__aichaku - reviewer__get_statistics({
  type: "export",
  format: "csv",
});

// Ask specific questions
const answer = await mcp__aichaku - reviewer__get_statistics({
  type: "insights",
  question: "Which files have the most security issues?",
});
```

## Configuration Files

### Project Configuration

You can configure project-specific settings in
`.claude/.aichaku-standards.json`:

```json
{
  "version": "1.0.0",
  "selected": [
    "nist-csf",
    "owasp-web",
    "tdd",
    "conventional-commits"
  ],
  "methodologies": ["shape-up"],
  "customRules": {
    "maxFileSize": 1000,
    "requireTests": true
  }
}
```

### Global Configuration

You can set up global defaults in `~/.aichaku/mcp-config.json`:

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
    "maxFileSize": 5242880,
    "timeout": 60000,
    "parallel": true
  },
  "statistics": {
    "enabled": true,
    "retentionDays": 30,
    "privacy": {
      "anonymizeFilePaths": true,
      "excludeFileContents": true,
      "hashUserIdentifiers": true
    },
    "reporting": {
      "enableDailyReports": false,
      "enableWeeklyReports": true,
      "enableRealtimeMetrics": true
    }
  }
}
```

## Programmatic API

### TypeScript/JavaScript

```typescript
import { Aichaku } from "aichaku";

// Initialize
const aichaku = new Aichaku({
  projectPath: ".",
  methodology: "shape-up",
});

// Initialize project
await aichaku.init({
  standards: ["nist-csf", "tdd"],
});

// Install methodology
await aichaku.install("scrum", {
  global: false,
  force: true,
});

// List methodologies
const methodologies = await aichaku.list();

// Manage standards
await aichaku.standards.add("conventional-commits");
await aichaku.standards.remove("owasp-web");
const current = await aichaku.standards.list();
```

### Deno Module

```typescript
import {
  init,
  install,
  list,
  standards,
} from "https://deno.land/x/aichaku/mod.ts";

// Initialize project
await init({
  methodology: "kanban",
  standards: ["google-style", "bdd"],
});

// Install methodology globally
await install("lean", {
  global: true,
});

// Get available standards
const availableStandards = await standards.list();
```

## Security Patterns

The MCP server includes built-in patterns for detecting security
vulnerabilities:

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

- Dynamic code execution with user input (use JSON.parse() instead)
- Unvalidated user input in child processes
- DOM-based cross-site scripting vulnerabilities
- Prototype pollution attacks
- Cryptographically weak random values

#### Python

- `pickle` deserialization
- SQL string formatting
- Command injection via `subprocess`
- Path traversal in file operations
- Weak cryptography usage

#### Go

- SQL query building
- Command execution
- Path cleaning issues
- Integer overflow
- Race conditions

## External Scanner Integration

### CodeQL

When CodeQL is available, the MCP server runs:

```bash
codeql database analyze --format=sarif-latest
```

### DevSkim

When DevSkim is available:

```bash
devskim analyze -f sarif -o results.sarif
```

### Semgrep

When Semgrep is available:

```bash
semgrep --config=auto --json
```

## Error Handling

### Common Errors

| Error Code                | Description              | Solution                    |
| ------------------------- | ------------------------ | --------------------------- |
| `FILE_NOT_FOUND`          | File doesn't exist       | Check file path             |
| `PROJECT_NOT_INITIALIZED` | No .claude directory     | Run `aichaku init`          |
| `INVALID_METHODOLOGY`     | Unknown methodology      | Check spelling              |
| `SCANNER_TIMEOUT`         | External scanner timeout | Increase timeout or disable |
| `PERMISSION_DENIED`       | Can't read file          | Check file permissions      |
| `NO_SOURCE_FILES`         | No source files found    | Check project structure     |
| `INVALID_TEMPLATE_TYPE`   | Unknown template type    | Use valid template type     |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "Cannot read file: /path/to/file.ts",
    "suggestion": "Check that the file exists and is readable",
    "details": {
      "path": "/path/to/file.ts",
      "operation": "review_file"
    }
  }
}
```

## Performance Considerations

### File Size Limits

- Default: 5MB per file
- You can configure this in `mcp-config.json`
- Large files may timeout

### Caching

- File content cache (5 minute TTL)
- Standards configuration cache
- External scanner results cache
- Project analysis cache

### Parallel Processing

- Security patterns run in parallel
- External scanners run sequentially
- Results aggregated asynchronously

## Environment Variables

| Variable                     | Description               | Default            |
| ---------------------------- | ------------------------- | ------------------ |
| `AICHAKU_MCP_DEBUG`          | Enable debug logging      | `false`            |
| `AICHAKU_MCP_TIMEOUT`        | Global timeout (ms)       | `60000`            |
| `AICHAKU_MCP_CACHE_DIR`      | Cache directory           | `~/.aichaku/cache` |
| `AICHAKU_MCP_NO_EXTERNAL`    | Disable external scanners | `false`            |
| `AICHAKU_FEEDBACK_LEVEL`     | Feedback verbosity        | `standard`         |
| `AICHAKU_PROGRESS_THRESHOLD` | Progress indicator delay  | `1500`             |

## Version Compatibility

| MCP Server Version | Aichaku Version | Claude Code Version |
| ------------------ | --------------- | ------------------- |
| 1.0.x              | 1.0.x           | 0.9.x+              |
| 1.1.x              | 1.1.x           | 1.0.x+              |

You should always use matching Aichaku and MCP server versions for best results.

## See Also

- [MCP Server Setup](./tutorials/setup-mcp-server.md)
- [MCP Tools Documentation](./MCP-TOOLS.md)
- [MCP Feedback System](./reference/mcp-feedback-system.md)
- [Project Configuration](./reference/configuration-options.md)
- [Security Standards](./explanation/security-standards.md)
