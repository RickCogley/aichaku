# Security Scanning Guide

## Overview

Aichaku integrates multiple security scanners through its MCP (Model Context Protocol) server to provide comprehensive
security analysis during development. The system supports automatic security scanning through git hooks and manual
scanning through the CLI.

## Architecture

### Scanner Integration

The security scanning is implemented in the MCP server's `scanner-controller.ts`, which coordinates multiple security
tools:

1. **DevSkim** - Microsoft's regex-based security scanner
2. **Semgrep** - Semantic code analysis with custom rules
3. **CodeQL** - GitHub's semantic code analysis (requires database)
4. **GitLeaks** - Secret detection in code
5. **Trivy** - Vulnerability and secret scanning

### How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Git Hook or   │────▶│  Aichaku MCP     │────▶│ Security        │
│  Manual Review  │     │    Server        │     │ Scanners        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │ Review Engine    │◀────│ Scanner Results │
                        │ (Aggregation)    │     │ (JSON)          │
                        └──────────────────┘     └─────────────────┘
```

## Installation

### Prerequisites

Install the security scanners you want to use:

```bash
# DevSkim (requires .NET)
dotnet tool install -g Microsoft.CST.DevSkim.CLI

# Semgrep
brew install semgrep  # macOS
# or
pip install semgrep   # Python

# CodeQL
brew install codeql   # macOS

# GitLeaks
brew install gitleaks # macOS

# Trivy
brew install trivy    # macOS
```

### MCP Server Setup

1. Install the Aichaku MCP server:
   ```bash
   aichaku mcp --install
   ```

2. Configure Claude Code to use the MCP server:
   ```bash
   aichaku mcp --config
   ```

3. Add the configuration to Claude Code's settings file.

## Git Hook Configuration

### Enable Security Scanning

The security check hook is disabled by default. To enable it:

```bash
chmod +x .githooks/hooks.d/40-security-check
```

### How the Git Hook Works

The `40-security-check` hook:

1. **Checks for MCP availability** - If the Aichaku MCP reviewer is available, it uses comprehensive scanning
2. **Falls back to basic checks** - If MCP is not available, it runs basic npm/cargo audits or direct scanner commands
3. **Scans staged files** - Only scans files that are being committed
4. **Blocks commits with issues** - Prevents commits if critical security issues are found

### Hook Behavior

- Runs DevSkim, Semgrep, and other configured scanners on staged code files
- Supports multiple languages: TypeScript, JavaScript, Python, Go, Java, C#, Ruby
- Creates temporary files with staged content to scan exactly what will be committed
- Provides clear feedback about security issues found

## Manual Security Scanning

### Using the MCP Tool in Claude Code

When the MCP server is configured in Claude Code, you can use:

```
mcp__aichaku-reviewer__review_file /path/to/file.ts
```

### Using the CLI (Coming Soon)

```bash
aichaku review file.ts --security-only
```

## Scanner Details

### DevSkim

- **Type**: Pattern-based scanner
- **Speed**: Fast (< 5 seconds)
- **Focus**: Common security anti-patterns
- **Languages**: All major languages

### Semgrep

- **Type**: Semantic analysis
- **Speed**: Fast (< 5 seconds)
- **Focus**: Deep code understanding, custom rules
- **Languages**: 30+ languages

### CodeQL

- **Type**: Semantic analysis with dataflow
- **Speed**: Slow (requires database build)
- **Focus**: Complex vulnerabilities
- **Languages**: Major languages
- **Note**: Currently skipped in real-time scanning due to database requirement

### GitLeaks

- **Type**: Secret detection
- **Speed**: Fast (< 5 seconds)
- **Focus**: API keys, passwords, tokens
- **Languages**: All text files

### Trivy

- **Type**: Comprehensive scanner
- **Speed**: Medium (< 30 seconds)
- **Focus**: Dependencies, secrets, misconfigurations
- **Languages**: Multiple package managers

## Security Findings

### Severity Levels

- **Critical**: Must fix immediately (e.g., hardcoded secrets, SQL injection)
- **High**: Should fix before release (e.g., XSS vulnerabilities)
- **Medium**: Plan to fix (e.g., weak cryptography)
- **Low**: Consider fixing (e.g., information disclosure)
- **Info**: Best practices (e.g., deprecated functions)

### Example Output

```
🔍 Security Check Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 File: src/auth.ts
⚠️  3 security issues found

🔴 CRITICAL - javascript.express.security.audit.xss.no-direct-response-write
   Line 45: User input used in response without encoding
   Fix: Use res.json() or encode user input

🟡 MEDIUM - DS189424
   Line 72: Use of eval() with user input
   Fix: Replace eval with safer alternatives

🔵 INFO - typescript-lint.no-any
   Line 23: Use of 'any' type reduces type safety
   Fix: Define specific types
```

## Troubleshooting

### Scanner Not Found

If a scanner isn't detected:

1. Verify installation: `which devskim` (or other scanner name)
2. Check PATH environment variable
3. For DevSkim, ensure `~/.dotnet/tools` is in PATH

### False Positives

To suppress false positives:

- **DevSkim**: Add `// DevSkim: ignore DS######` at end of line
- **Semgrep**: Add `# nosemgrep` comment
- **General**: Update `.aichaku/security-exclusions.yaml`

### Performance Issues

If scanning is slow:

1. Disable slower scanners in git hooks
2. Use `--security-only` flag for focused scans
3. Configure scan timeouts in `scanner-controller.ts`

## Best Practices

1. **Enable git hooks** for automatic pre-commit scanning
2. **Run full scans** periodically (not just on commits)
3. **Keep scanners updated** for latest security rules
4. **Review false positives** and create exclusion rules
5. **Integrate with CI/CD** for comprehensive coverage

## Future Enhancements

- [ ] Caching of scan results for unchanged files
- [ ] Custom rule creation interface
- [ ] Integration with GitHub Security Advisories
- [ ] SARIF format output support
- [ ] VSCode extension for real-time scanning
