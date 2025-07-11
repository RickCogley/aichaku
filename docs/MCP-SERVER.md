# MCP Server Documentation

## Overview

The Aichaku MCP (Model Context Protocol) server provides security review and methodology compliance checking capabilities for software projects. It enables AI assistants and other tools to analyze code for security vulnerabilities, verify adherence to coding standards, and ensure methodology patterns are followed correctly.

### Key Features

- **Security Review**: Automated security scanning using multiple tools (Semgrep, ESLint security plugin, Bandit)
- **Standards Compliance**: Check code against various coding standards (OWASP, NIST-CSF, Clean Architecture, etc.)
- **Methodology Verification**: Validate project structure against methodologies (Shape Up, Scrum, Kanban, etc.)
- **Extensible Architecture**: Easy to add new security scanners and standards

## Architecture

### Design Decisions

1. **TypeScript Implementation**: Chosen for type safety and excellent tooling support
2. **Modular Scanner System**: Each security scanner is a separate module for maintainability
3. **Plugin Architecture**: Standards and methodologies are loaded dynamically
4. **Async/Await Pattern**: All operations are asynchronous for better performance
5. **Error Resilience**: Graceful handling of missing tools or failed scans

### System Architecture

```
┌─────────────────────────────────────────────────┐
│                  MCP Client                     │
│            (Claude, VS Code, etc.)              │
└─────────────────────┬───────────────────────────┘
                      │ MCP Protocol
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
- `includeExternal` (boolean, optional): Include external security scanners (default: true)

**Returns:**
```typescript
{
  success: boolean;
  summary: string;
  findings: Array<{
    type: 'security' | 'quality' | 'style';
    severity: 'error' | 'warning' | 'info';
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
  };
}
```

**Example Usage:**
```typescript
// Review a TypeScript file
const result = await mcp.callTool('review_file', {
  file: '/path/to/user-service.ts',
  includeExternal: true
});

// Review with provided content
const result = await mcp.callTool('review_file', {
  file: 'temp.js',
  content: 'const password = "hardcoded123";',
  includeExternal: false
});
```

#### 2. `review_methodology` - Methodology Compliance Tool

Checks if a project follows selected methodology patterns.

**Parameters:**
- `projectPath` (string, required): Path to the project root
- `methodology` (string, optional): Specific methodology to check (e.g., 'shape-up', 'scrum')

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
const result = await mcp.callTool('review_methodology', {
  projectPath: '/Users/dev/my-project',
  methodology: 'shape-up'
});

// Check against configured methodology
const result = await mcp.callTool('review_methodology', {
  projectPath: '/Users/dev/my-project'
});
```

#### 3. `get_standards` - Standards Retrieval Tool

Gets currently selected standards for the project.

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
const result = await mcp.callTool('get_standards', {
  projectPath: '/Users/dev/my-project'
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

### Basic Security Review

```typescript
// Example 1: Review a single file
const reviewResult = await mcp.callTool('review_file', {
  file: './src/auth/login.ts'
});

if (!reviewResult.success) {
  console.error('Review failed:', reviewResult.summary);
  return;
}

console.log(`Found ${reviewResult.stats.totalIssues} issues`);
reviewResult.findings.forEach(finding => {
  console.log(`[${finding.severity}] ${finding.message} (${finding.scanner})`);
});
```

### Project-Wide Security Scan

```typescript
// Example 2: Scan entire project
const files = await glob('**/*.{js,ts,py}', { cwd: projectPath });

const results = await Promise.all(
  files.map(file => 
    mcp.callTool('review_file', {
      file: path.join(projectPath, file)
    })
  )
);

// Aggregate results
const totalIssues = results.reduce((sum, r) => sum + r.stats.totalIssues, 0);
console.log(`Total issues across project: ${totalIssues}`);
```

### Methodology Compliance Check

```typescript
// Example 3: Verify Shape Up implementation
const methodologyResult = await mcp.callTool('review_methodology', {
  projectPath: './my-project',
  methodology: 'shape-up'
});

if (!methodologyResult.compliant) {
  console.log('Project is not Shape Up compliant:');
  methodologyResult.findings.forEach(f => {
    console.log(`- ${f.message}`);
  });
  
  console.log('\nRecommendations:');
  methodologyResult.recommendations.forEach(r => {
    console.log(`- ${r}`);
  });
}
```

### Custom Standards Integration

```typescript
// Example 4: Use custom security standard
// First, create custom standard at ~/.claude/aichaku/user/standards/MY-STANDARD.md

const standards = await mcp.callTool('get_standards', {
  projectPath: './my-project'
});

// Review file against custom standard
const customReview = await mcp.callTool('review_file', {
  file: './src/critical-service.ts'
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
    byFileType: {}
  };
  
  // Scan all files
  const files = await glob('**/*.{js,ts,py,java}', { cwd: projectPath });
  
  for (const file of files) {
    const result = await mcp.callTool('review_file', {
      file: path.join(projectPath, file)
    });
    
    if (result.success) {
      stats.totalFiles++;
      stats.totalIssues += result.stats.totalIssues;
      stats.criticalIssues += result.findings
        .filter(f => f.severity === 'error').length;
      
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
  const methodology = await mcp.callTool('review_methodology', {
    projectPath
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    project: projectPath,
    summary: {
      filesScanned: stats.totalFiles,
      totalIssues: stats.totalIssues,
      criticalIssues: stats.criticalIssues,
      methodologyCompliant: methodology.compliant
    },
    details: {
      scannerBreakdown: stats.byScanner,
      methodologyFindings: methodology.findings
    }
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
  timeout: 60000  // 60 seconds
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
process.env.AICHAKU_DEBUG = 'true';

// Or in code
import { logger } from './logger';
logger.setLevel('debug');
```

### Performance Optimization

For large projects, optimize scanning:

```typescript
// Parallel scanning with concurrency limit
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent scans

const results = await Promise.all(
  files.map(file => 
    limit(() => mcp.callTool('review_file', { file }))
  )
);
```

## Development Guide

### Adding a New Scanner

1. Create scanner module in `src/scanners/`:

```typescript
// src/scanners/my-scanner.ts
import { SecurityScanner, ScanResult } from '../types';

export class MyScanner implements SecurityScanner {
  name = 'MyScanner';
  
  async isAvailable(): Promise<boolean> {
    // Check if scanner is installed
    try {
      await exec('my-scanner --version');
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
      scanner: this.name
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

1. Create standard file in `~/.claude/aichaku/user/standards/`:

```markdown
# MY-STANDARD.md

## My Custom Standard

### Rules

1. **Rule 1**: Description
2. **Rule 2**: Description

### Implementation

\```typescript
// Example implementation
\```
```

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
const basicScan = await mcp.callTool('review_file', {
  file: 'critical-file.js',
  includeExternal: false
});

// Phase 2: Add external scanners
const fullScan = await mcp.callTool('review_file', {
  file: 'critical-file.js',
  includeExternal: true
});

// Phase 3: Methodology compliance
const compliance = await mcp.callTool('review_methodology', {
  projectPath: '.'
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
  allowedScanners: ['semgrep', 'eslint-security']
};

// Fail build if baseline is exceeded
if (stats.criticalIssues > baseline.maxCriticalIssues) {
  throw new Error('Security baseline exceeded');
}
```

## Conclusion

The Aichaku MCP server provides a powerful, extensible platform for security review and methodology compliance. By following this documentation, you can effectively integrate security scanning into your development workflow and maintain high code quality standards.

For additional support or feature requests, please visit the [Aichaku repository](https://github.com/RickCogley/aichaku) or contact the maintainers.