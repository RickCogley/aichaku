# MCP Server Documentation

## Overview

The Aichaku MCP (Model Context Protocol) server provides security review and
methodology compliance checking capabilities for software projects. It enables
AI assistants and other tools to analyze code for security vulnerabilities,
verify adherence to coding standards, and ensure methodology patterns are
followed correctly.

### Key Features

- **Security Review**: Automated security scanning using multiple tools
  (Semgrep, ESLint security plugin, Bandit)
- **Standards Compliance**: Check code against various coding standards (OWASP,
  NIST-CSF, Clean Architecture, etc.)
- **Methodology Verification**: Validate project structure against methodologies
  (Shape Up, Scrum, Kanban, etc.)
- **Extensible Architecture**: Easy to add new security scanners and standards

## Architecture

### Design Decisions

1. **TypeScript Implementation**: Chosen for type safety and excellent tooling
   support
2. **Modular Scanner System**: Each security scanner is a separate module for
   maintainability
3. **Plugin Architecture**: Standards and methodologies are loaded dynamically
4. **Async/Await Pattern**: All operations are asynchronous for better
   performance
5. **Error Resilience**: Graceful handling of missing tools or failed scans

### System Architecture

The MCP server supports two operational modes:

1. **Process Mode** (Default): Each request spawns a new MCP server process
2. **HTTP/SSE Server Mode**: A persistent HTTP server handles multiple clients
   via Server-Sent Events

#### Process Mode Architecture

```
┌─────────────────────────────────────────────────┐
│                  MCP Client                     │
│            (Claude, VS Code, etc.)              │
└─────────────────────┬───────────────────────────┘
                      │ MCP Protocol (stdio)
┌─────────────────────▼───────────────────────────┐
│              Aichaku MCP Server                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────┐ │
│  │   Router    │  │   Handlers   │  │ Config │ │
│  └──────┬──────┘  └──────┬───────┘  └────────┘ │
│         │                 │                      │
│  ┌──────▼─────────────────▼────────────────┐   │
│  │          Service Layer                   │   │
│  ├──────────────────────────────────────────┤   │
│  │ SecurityService │ StandardsService       │   │
│  │ MethodologyService │ StatsService       │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │          Scanner Modules                 │   │
│  ├──────────────────────────────────────────┤   │
│  │ Semgrep │ ESLint │ Bandit │ Custom      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### HTTP/SSE Server Mode Architecture

```
┌─────────────────────┐  ┌─────────────────────┐
│   Claude Code #1    │  │   Claude Code #2    │
└──────────┬──────────┘  └──────────┬──────────┘
           │                         │
           │ POST /rpc (JSON-RPC)    │ POST /rpc (JSON-RPC)
           │ GET /sse (EventStream)  │ GET /sse (EventStream)
           ▼                         ▼
┌─────────────────────────────────────────────────┐
│          HTTP/SSE Server (Port 7182)           │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │         HTTP Request Handler             │  │
│  │  • POST /rpc    → JSON-RPC requests      │  │
│  │  • GET  /sse    → SSE response stream    │  │
│  │  • GET  /health → Server health check    │  │
│  │  • DELETE /session → Close connection    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      Session Manager (UUID-based)        │  │
│  │  ┌─────────────┐    ┌─────────────┐      │  │
│  │  │ Session #1  │    │ Session #2  │      │  │
│  │  │ ┌─────────┐ │    │ ┌─────────┐ │      │  │
│  │  │ │   MCP   │ │    │ │   MCP   │ │      │  │
│  │  │ │ Process │ │    │ │ Process │ │      │  │
│  │  │ │ (stdio) │ │    │ │ (stdio) │ │      │  │
│  │  │ └─────────┘ │    │ └─────────┘ │      │  │
│  │  └─────────────┘    └─────────────┘      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Data Flow:                                     │
│  1. Client → POST /rpc with session ID          │
│  2. Server → Forward to MCP process via stdio   │
│  3. MCP → Process and return via stdout         │
│  4. Server → Push via SSE to client             │
└─────────────────────────────────────────────────┘
```

### Server Modes

#### Process Mode (Default)

In process mode, the MCP server is spawned as a new process for each request:

- **Pros**: Simple, isolated, no persistent state
- **Cons**: Higher overhead, slower for frequent requests
- **Use When**: Running occasional reviews or in single-user environments

#### HTTP/SSE Server Mode

In HTTP/SSE mode, a persistent server handles multiple clients:

- **Pros**:
  - Efficient resource usage
  - Faster response times (no process startup)
  - Supports multiple concurrent Claude Code instances
  - Cross-platform (Windows, macOS, Linux)
- **Cons**: Requires manual server management
- **Use When**: Multiple Claude Code instances or frequent requests

**Starting the HTTP/SSE Server:**

```bash
# Start the server
aichaku mcp --start-server

# Check server status
aichaku mcp --server-status

# Stop the server
aichaku mcp --stop-server
```

The server runs on port 7182 (AICHAKU on phone keypad) and provides:

- `POST /rpc` - JSON-RPC request endpoint
- `GET /sse` - Server-Sent Events for responses
- `GET /health` - Health check endpoint
- `DELETE /session` - Close session endpoint

### Core Components

#### 1. MCP Server (`src/mcp-server.ts`)

- Initializes the MCP server with stdio transport
- Registers all available tools
- Handles lifecycle management

#### 2. Security Service (`src/services/security-service.ts`)

- Orchestrates security scans
- Aggregates results from multiple scanners
- Formats findings for consistent output

#### 3. Standards Service (`src/services/standards-service.ts`)

- Loads and manages coding standards
- Provides standard selection and retrieval
- Handles custom standards from user directory

#### 4. Methodology Service (`src/services/methodology-service.ts`)

- Checks project structure against methodologies
- Validates required files and patterns
- Provides compliance reporting

## API Documentation

### Tools

#### 1. `review_file` - Security Review Tool

Reviews a file for security vulnerabilities and code quality issues.

**Parameters:**

- `file` (string, required): Path to the file to review
- `content` (string, optional): File content (if not provided, reads from disk)
- `includeExternal` (boolean, optional): Include external security scanners
  (default: true)

**Returns:**

```typescript
{
  success: boolean;
  summary: string;
  findings: Array<{
    type: "security" | "quality" | "style";
    severity: "error" | "warning" | "info";
    message: string;
    line?: number;
    column?: number;
    rule?: string;
    scanner: string;
  }>;
  stats: {
    totalIssues: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byScanner: Record<string, number>;
  }
}
```

**Example Usage:**

```typescript
// Review a TypeScript file
const result = await mcp.callTool("review_file", {
  file: "/path/to/user-service.ts",
  includeExternal: true,
});

// Review with provided content
const result = await mcp.callTool("review_file", {
  file: "temp.js",
  content: 'const password = "hardcoded123";',
  includeExternal: false,
});
```

#### 2. `review_methodology` - Methodology Compliance Tool

Checks if a project follows selected methodology patterns.

**Parameters:**

- `projectPath` (string, required): Path to the project root
- `methodology` (string, optional): Specific methodology to check (e.g.,
  'shape-up', 'scrum')

**Returns:**

```typescript
{
  success: boolean;
  methodology: string;
  compliant: boolean;
  findings: Array<{
    type: 'missing' | 'incorrect' | 'suggestion';
    message: string;
    expected?: string;
    actual?: string;
  }>;
  recommendations: string[];
}
```

**Example Usage:**

```typescript
// Check Shape Up compliance
const result = await mcp.callTool("review_methodology", {
  projectPath: "/Users/dev/my-project",
  methodology: "shape-up",
});

// Check against configured methodology
const result = await mcp.callTool("review_methodology", {
  projectPath: "/Users/dev/my-project",
});
```

#### 3. `get_standards` - Standards Retrieval Tool

Gets currently selected standards for the project.

#### 4. `send_feedback` - Feedback Display Tool

Sends a feedback message that appears visibly in the Claude Code console. This
tool is designed for use by hooks and automation scripts to provide real-time
feedback to users.

**Parameters:**

- `message` (string, required): The feedback message to display
- `level` (string, optional): The feedback level/type ("info", "success",
  "warning", "error", default: "info")

**Returns:**

```typescript
{
  content: [{
    type: "text",
    text: string; // Formatted feedback message with emoji/icon
  }];
}
```

**Example Usage:**

```typescript
// Send informational feedback
const result = await mcp.callTool("send_feedback", {
  message: "Code review started for login.ts",
  level: "info",
});

// Send success feedback
const result = await mcp.callTool("send_feedback", {
  message: "All security checks passed",
  level: "success",
});

// Send warning feedback
const result = await mcp.callTool("send_feedback", {
  message: "Potential security issue detected",
  level: "warning",
});

// Send error feedback
const result = await mcp.callTool("send_feedback", {
  message: "Critical vulnerability found - immediate action required",
  level: "error",
});
```

**Hook Integration Example:**

```bash
#!/bin/bash
# Example hook that uses send_feedback tool

# Connect to MCP server and send feedback
deno run -A examples/send-feedback-example.ts message \
  "🔍 Hook triggered: Starting security review" \
  "info"
```

#### 5. `get_standards` - Standards Retrieval Tool (Continued)

**Parameters:**

- `projectPath` (string, required): Path to the project root

**Returns:**

```typescript
{
  success: boolean;
  selected: string[];
  available: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  customStandards: Array<{
    id: string;
    name: string;
    path: string;
  }>;
}
```

**Example Usage:**

```typescript
const result = await mcp.callTool("get_standards", {
  projectPath: "/Users/dev/my-project",
});
```

### Scanner Modules

#### Semgrep Scanner

- **Purpose**: Static analysis for security patterns
- **Languages**: Multi-language support
- **Configuration**: `.semgrep.yml` or default rules
- **Key Features**:
  - OWASP Top 10 detection
  - Custom rule support
  - Auto-fix suggestions

#### ESLint Security Plugin

- **Purpose**: JavaScript/TypeScript security linting
- **Configuration**: `.eslintrc` with security rules
- **Key Rules**:
  - `no-eval`: Detects eval usage
  - `no-implied-eval`: Detects implied eval
  - `detect-non-literal-regexp`: RegExp injection
  - `detect-buffer-noassert`: Buffer security

#### Bandit Scanner

- **Purpose**: Python security linting
- **Configuration**: `.bandit` or command line
- **Key Checks**:
  - Hardcoded passwords
  - SQL injection
  - Insecure randomness
  - Shell injection

## Usage Examples

### Server Mode Selection

The Aichaku CLI automatically detects and uses the HTTP/SSE server if it's
running:

```bash
# Start the HTTP/SSE server (one time)
aichaku mcp --start-server

# Now all review commands will use the server automatically
aichaku review src/auth/login.ts

# Multiple terminals can use the same server
# Terminal 1:
aichaku review file1.ts

# Terminal 2 (simultaneously):
aichaku review file2.ts
```

### Basic Security Review

```typescript
// Example 1: Review a single file
const reviewResult = await mcp.callTool("review_file", {
  file: "./src/auth/login.ts",
});

if (!reviewResult.success) {
  console.error("Review failed:", reviewResult.summary);
  return;
}

console.log(`Found ${reviewResult.stats.totalIssues} issues`);
reviewResult.findings.forEach((finding) => {
  console.log(`[${finding.severity}] ${finding.message} (${finding.scanner})`);
});
```

### Project-Wide Security Scan

```typescript
// Example 2: Scan entire project
const files = await glob("**/*.{js,ts,py}", { cwd: projectPath });

const results = await Promise.all(
  files.map((file) =>
    mcp.callTool("review_file", {
      file: path.join(projectPath, file),
    })
  ),
);

// Aggregate results
const totalIssues = results.reduce((sum, r) => sum + r.stats.totalIssues, 0);
console.log(`Total issues across project: ${totalIssues}`);
```

### Methodology Compliance Check

```typescript
// Example 3: Verify Shape Up implementation
const methodologyResult = await mcp.callTool("review_methodology", {
  projectPath: "./my-project",
  methodology: "shape-up",
});

if (!methodologyResult.compliant) {
  console.log("Project is not Shape Up compliant:");
  methodologyResult.findings.forEach((f) => {
    console.log(`- ${f.message}`);
  });

  console.log("\nRecommendations:");
  methodologyResult.recommendations.forEach((r) => {
    console.log(`- ${r}`);
  });
}
```

### Custom Standards Integration

```typescript
// Example 4: Use custom security standard
// First, create custom standard at ~/.claude/aichaku/user/docs/standards/MY-STANDARD.md

const standards = await mcp.callTool("get_standards", {
  projectPath: "./my-project",
});

// Review file against custom standard
const customReview = await mcp.callTool("review_file", {
  file: "./src/critical-service.ts",
});
```

## Statistics and Analytics

### Tracking Security Metrics

The MCP server provides detailed statistics for monitoring security posture:

```typescript
// Get project-wide statistics
async function getProjectStats(projectPath: string) {
  const stats = {
    totalFiles: 0,
    totalIssues: 0,
    criticalIssues: 0,
    byScanner: {},
    byFileType: {},
  };

  // Scan all files
  const files = await glob("**/*.{js,ts,py,java}", { cwd: projectPath });

  for (const file of files) {
    const result = await mcp.callTool("review_file", {
      file: path.join(projectPath, file),
    });

    if (result.success) {
      stats.totalFiles++;
      stats.totalIssues += result.stats.totalIssues;
      stats.criticalIssues += result.findings
        .filter((f) => f.severity === "error").length;

      // Aggregate by scanner
      Object.entries(result.stats.byScanner).forEach(([scanner, count]) => {
        stats.byScanner[scanner] = (stats.byScanner[scanner] || 0) + count;
      });
    }
  }

  return stats;
}
```

### Generating Reports

```typescript
// Generate security report
async function generateSecurityReport(projectPath: string) {
  const stats = await getProjectStats(projectPath);
  const methodology = await mcp.callTool("review_methodology", {
    projectPath,
  });

  const report = {
    timestamp: new Date().toISOString(),
    project: projectPath,
    summary: {
      filesScanned: stats.totalFiles,
      totalIssues: stats.totalIssues,
      criticalIssues: stats.criticalIssues,
      methodologyCompliant: methodology.compliant,
    },
    details: {
      scannerBreakdown: stats.byScanner,
      methodologyFindings: methodology.findings,
    },
  };

  return report;
}
```

## Troubleshooting

### Common Issues

#### 1. Scanner Not Found

**Problem**: "Semgrep scanner not available" or similar error

**Solution**:

```bash
# Install missing scanner
npm install -g semgrep  # For Semgrep
pip install bandit      # For Bandit

# Verify installation
semgrep --version
bandit --version
```

#### 2. Permission Denied

**Problem**: Cannot read file or access directory

**Solution**:

- Check file permissions: `ls -la <file>`
- Ensure MCP server has read access
- Run with appropriate permissions

#### 3. Timeout Issues

**Problem**: Scanner times out on large files

**Solution**:

```typescript
// Increase timeout in scanner configuration
const result = await runScanner(file, {
  timeout: 60000, // 60 seconds
});
```

#### 4. False Positives

**Problem**: Too many irrelevant findings

**Solution**:

- Configure scanner rules appropriately
- Use `.semgrepignore` or similar ignore files
- Add inline suppressions for known safe code

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Set environment variable
process.env.AICHAKU_DEBUG = "true";

// Or in code
import { logger } from "./logger";
logger.setLevel("debug");
```

### Performance Optimization

For large projects, optimize scanning:

```typescript
// Parallel scanning with concurrency limit
import pLimit from "p-limit";

const limit = pLimit(5); // Max 5 concurrent scans

const results = await Promise.all(
  files.map((file) => limit(() => mcp.callTool("review_file", { file }))),
);
```

## Development Guide

### Adding a New Scanner

1. Create scanner module in `src/scanners/`:

```typescript
// src/scanners/my-scanner.ts
import { ScanResult, SecurityScanner } from "../types";

export class MyScanner implements SecurityScanner {
  name = "MyScanner";

  async isAvailable(): Promise<boolean> {
    // Check if scanner is installed
    try {
      await exec("my-scanner --version");
      return true;
    } catch {
      return false;
    }
  }

  async scan(filePath: string, content?: string): Promise<ScanResult> {
    // Implement scanning logic
    const findings = [];

    // Run scanner
    const output = await exec(`my-scanner ${filePath}`);

    // Parse results
    // ... parsing logic ...

    return {
      success: true,
      findings,
      scanner: this.name,
    };
  }
}
```

2. Register scanner in `security-service.ts`:

```typescript
// Add to scanner initialization
this.scanners.push(new MyScanner());
```

### Adding a New Standard

1. Create standard file in `~/.claude/aichaku/user/docs/standards/`:

````markdown
# MY-STANDARD.md

## My Custom Standard

### Rules

1. **Rule 1**: Description
2. **Rule 2**: Description

### Implementation

\```typescript // Example implementation \```
````

2. The standard will be automatically detected and available for use.

### Testing

Run the test suite:

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test specific scanner
npm test -- --grep "Semgrep"
```

### Contributing

1. **Code Style**: Follow TypeScript best practices
2. **Error Handling**: Always handle errors gracefully
3. **Documentation**: Update docs for new features
4. **Tests**: Add tests for new functionality
5. **Performance**: Consider impact on large projects

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run tests: `npm test`
4. Build: `npm run build`
5. Tag release: `git tag v1.x.x`
6. Push tags: `git push --tags`

## Best Practices

### 1. Incremental Adoption

Start with basic security scanning and gradually add more sophisticated checks:

```typescript
// Phase 1: Basic security scan
const basicScan = await mcp.callTool("review_file", {
  file: "critical-file.js",
  includeExternal: false,
});

// Phase 2: Add external scanners
const fullScan = await mcp.callTool("review_file", {
  file: "critical-file.js",
  includeExternal: true,
});

// Phase 3: Methodology compliance
const compliance = await mcp.callTool("review_methodology", {
  projectPath: ".",
});
```

### 2. CI/CD Integration

Integrate MCP server into your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Security Review
  run: |
    npx @aichaku/mcp-server review-project \
      --path . \
      --fail-on-critical \
      --output report.json
```

### 3. Custom Rules

Create project-specific security rules:

```yaml
# .semgrep/rules/custom.yml
rules:
  - id: company-no-console-log
    patterns:
      - pattern: console.log(...)
    message: "Console.log not allowed in production code"
    languages: [javascript, typescript]
    severity: WARNING
```

### 4. Regular Updates

Keep scanners and rules updated:

```bash
# Update scanners
npm update -g semgrep
pip install --upgrade bandit

# Update MCP server
npm update @aichaku/mcp-server
```

### 5. Security Baseline

Establish and maintain a security baseline:

```typescript
// Track security metrics over time
const baseline = {
  maxCriticalIssues: 0,
  maxHighIssues: 5,
  maxMediumIssues: 20,
  allowedScanners: ["semgrep", "eslint-security"],
};

// Fail build if baseline is exceeded
if (stats.criticalIssues > baseline.maxCriticalIssues) {
  throw new Error("Security baseline exceeded");
}
```

## Upgrading MCP Servers

### Overview

Aichaku MCP servers are automatically updated when you upgrade the main Aichaku
package. However, you may need to manually upgrade or reinstall MCP servers in
some cases.

### Automatic Upgrade (Recommended)

The easiest way to upgrade MCP servers is to upgrade Aichaku itself:

```bash
# Upgrade Aichaku (includes all MCP servers)
npm update -g @aichaku/cli

# Verify MCP servers are updated
aichaku mcp --tools
```

### Manual MCP Server Management

#### Check Current MCP Status

```bash
# View all MCP servers and their status
aichaku mcp

# View available MCP tools
aichaku mcp --tools
```

#### Reinstall Specific MCP Server

If an MCP server is having issues or you need to force a reinstall:

```bash
# Stop any running HTTP/SSE server first
aichaku mcp --stop-server

# Remove and reinstall the problematic MCP server
rm -rf ~/.claude/mcp/aichaku-reviewer/
aichaku mcp --install-reviewer

# Or remove and reinstall GitHub MCP server
rm -rf ~/.claude/mcp/github-operations/
aichaku mcp --install-github
```

#### Complete MCP Reset

If you need to completely reset all MCP servers:

```bash
# Stop HTTP/SSE server
aichaku mcp --stop-server

# Remove all MCP servers
rm -rf ~/.claude/mcp/

# Reinstall all MCP servers
aichaku setup --force
```

### Upgrade Process After Aichaku Release

After a new Aichaku release, follow these steps:

#### 1. Stop Running Services

```bash
# Stop the HTTP/SSE server if running
aichaku mcp --stop-server
```

#### 2. Upgrade Aichaku

```bash
# Update to latest version
npm update -g @aichaku/cli

# Verify new version
aichaku --version
```

#### 3. Verify MCP Installation

```bash
# Check MCP server status
aichaku mcp

# Verify tools are available
aichaku mcp --tools
```

#### 4. Restart Services (Optional)

```bash
# Restart HTTP/SSE server if you were using it
aichaku mcp --start-server

# Verify server is running
aichaku mcp --server-status
```

### Troubleshooting Upgrades

#### MCP Server Not Found

**Problem**: `aichaku mcp` shows servers as "Not Installed"

**Solution**:

```bash
# Force reinstall all MCP servers
aichaku setup --force

# Or install specific server
aichaku mcp --install-reviewer
aichaku mcp --install-github
```

#### Permission Issues

**Problem**: Permission denied when upgrading

**Solution**:

```bash
# Use sudo for global npm packages (if needed)
sudo npm update -g @aichaku/cli

# Or use npx for one-time execution
npx @aichaku/cli@latest mcp
```

#### HTTP/SSE Server Issues

**Problem**: Server won't start after upgrade

**Solution**:

```bash
# Check if old server is still running
ps aux | grep aichaku

# Kill any old processes
pkill -f aichaku

# Start fresh server
aichaku mcp --start-server
```

#### Claude Code Integration Issues

**Problem**: Claude Code can't find MCP servers after upgrade

**Solution**:

```bash
# Verify MCP configuration
cat ~/.claude/settings.json

# Check MCP servers are properly installed
aichaku mcp

# Restart Claude Code completely
# (Close all Claude Code instances and reopen)
```

### Version Compatibility

#### Checking Compatibility

```bash
# Check Aichaku version
aichaku --version

# Check MCP server versions
aichaku mcp --tools | grep -i version
```

#### Supported Versions

- **Aichaku CLI**: Latest version recommended
- **Claude Code**: v0.8.0 or higher
- **Node.js**: v18.0.0 or higher
- **MCP Protocol**: v0.3.0 or higher

### Backup and Recovery

#### Backup MCP Configuration

Before major upgrades, backup your MCP configuration:

```bash
# Backup MCP settings
cp ~/.claude/settings.json ~/.claude/settings.json.backup

# Backup custom standards (if any)
cp -r ~/.claude/aichaku/user/ ~/.claude/aichaku/user.backup/
```

#### Recovery

If upgrade fails, restore from backup:

```bash
# Restore settings
cp ~/.claude/settings.json.backup ~/.claude/settings.json

# Restore custom standards
cp -r ~/.claude/aichaku/user.backup/ ~/.claude/aichaku/user/

# Reinstall MCP servers
aichaku setup --force
```

### Best Practices for Upgrades

1. **Always stop MCP services before upgrading**
2. **Test in development environment first**
3. **Backup configuration before major upgrades**
4. **Verify functionality after upgrade**
5. **Update documentation if custom standards changed**
6. **Check release notes for breaking changes**

### Getting Help

If you encounter issues during upgrade:

1. **Check the troubleshooting section above**
2. **Review GitHub issues**:
   [Aichaku Issues](https://github.com/RickCogley/aichaku/issues)
3. **Check Claude Code documentation**:
   [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)
4. **File a bug report** with:
   - Aichaku version (`aichaku --version`)
   - Operating system
   - Error messages
   - Steps to reproduce

## Conclusion

The Aichaku MCP server provides a powerful, extensible platform for security
review and methodology compliance. By following this documentation, you can
effectively integrate security scanning into your development workflow and
maintain high code quality standards.

For additional support or feature requests, please visit the
[Aichaku repository](https://github.com/RickCogley/aichaku) or contact the
maintainers.
