# How to Set Up Security Scanning Git Hook

This guide shows you how to set up pre-commit security scanning in any Git repository using Aichaku's MCP security
infrastructure.

## Prerequisites

1. **Aichaku installed**: The MCP server should be installed in `~/.aichaku/mcp-servers/`
2. **MCP HTTP Bridge running** (optional but recommended):
   ```bash
   aichaku mcp --server-start
   ```

## Option 1: Use the Generic Security Hook (Recommended)

The easiest way is to use the generic security hook script:

```bash
# From any git repository
curl -o .git/hooks/pre-commit https://raw.githubusercontent.com/RickCogley/aichaku/main/scripts/generic-security-hook.sh
chmod +x .git/hooks/pre-commit
```

Or copy it manually:

```bash
# From aichaku repository
cp /path/to/aichaku/scripts/generic-security-hook.sh /your/repo/.git/hooks/pre-commit
chmod +x /your/repo/.git/hooks/pre-commit
```

## Option 2: Use Git Hooks Directory Structure

For more advanced setups with multiple hooks:

1. **Copy the hooks directory structure**:
   ```bash
   # From your repository root
   cp -r /path/to/aichaku/.githooks .
   ```

2. **Configure Git to use the hooks**:
   ```bash
   git config core.hooksPath .githooks
   ```

3. **Enable the security hook**:
   ```bash
   chmod +x .githooks/hooks.d/40-security-check
   ```

## How It Works

The security hook operates in two modes:

### 1. MCP Bridge Mode (Preferred)

When the MCP HTTP bridge is running (`aichaku mcp --server-start`):

- Uses comprehensive security scanning via MCP
- Checks for OWASP Top 10 vulnerabilities
- Performs secret detection
- Runs multiple security scanners in parallel
- Provides detailed feedback

### 2. Direct Scanner Mode (Fallback)

When MCP bridge is not available:

- Falls back to direct security scanners if installed:
  - Semgrep
  - GitLeaks
  - Trivy
  - DevSkim
- Basic pattern matching for common security issues

## Configuration

You can configure the hook behavior with environment variables:

```bash
# Set severity threshold (critical, high, medium, low)
export SEVERITY_THRESHOLD=high

# Set scan timeout in seconds
export SCAN_TIMEOUT=30

# Set MCP bridge port (if different from default)
export MCP_BRIDGE_PORT=7182
```

## Testing the Hook

1. **Test with a sample file**:
   ```bash
   # Create a file with security issues
   echo 'const password = "hardcoded123";' > test.js
   git add test.js
   git commit -m "Test security hook"
   # Should block the commit
   ```

2. **Run the test script**:
   ```bash
   # From aichaku directory
   ./scripts/test-mcp-bridge.sh
   ```

## Troubleshooting

### Hook Not Running

- Ensure the hook is executable: `chmod +x .git/hooks/pre-commit`
- Check Git hooks path: `git config core.hooksPath`

### MCP Bridge Issues

- Check if bridge is running: `curl http://localhost:7182/health`
- Start the bridge: `aichaku mcp --server-start`
- Check logs: `cat ~/.aichaku/aichaku-mcp-http-bridge-server.log`

### Slow Performance

- The first run may be slower as scanners initialize
- Consider adjusting `SCAN_TIMEOUT` for large commits
- Use `git commit --no-verify` to bypass (use cautiously!)

## Security Considerations

- The hook only scans staged files, not the entire repository
- Critical issues block commits, high/medium issues show warnings
- Secrets and hardcoded credentials are always blocked
- The hook runs entirely locally - no code is sent to external services

## Customization

To customize which files are scanned or adjust severity levels, edit the hook script:

```bash
# Edit severity threshold
SEVERITY_THRESHOLD="${SEVERITY_THRESHOLD:-high}"

# Add file type filters
if [[ ! "$file" =~ \.(js|ts|py|go|java)$ ]]; then
    continue
fi
```

## Integration with CI/CD

This same security scanning can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Security Scan
  run: |
    aichaku mcp --server-start
    aichaku review --path . --security-only
```

## See Also

- [MCP Server Documentation](../reference/mcp-api.md)
- [Security Standards](../standards/security/)
- [Git Hooks Guide](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
