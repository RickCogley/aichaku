# Getting Started with MCP Server Configuration

This guide explains how to set up Aichaku's MCP (Model Context Protocol) servers
to work with Claude Code.

## Prerequisites

Before you begin, ensure you have:

- [Claude Code](https://claude.ai/code) installed and running
- [Aichaku CLI](https://github.com/RickCogley/aichaku) installed
  (`npm install -g @aichaku/cli`)
- Basic familiarity with command line interfaces
- Administrator access to your system for installing software
- Understanding of what MCP (Model Context Protocol) is

## Understanding MCP Architecture

## MCP Server Types

Aichaku provides two types of MCP servers:

1. **Stdio MCP Servers** (Default)
   - Passive - launched on-demand by Claude Code
   - No persistent processes running
   - Configured directly in Claude Code settings
   - Examples: aichaku-reviewer, GitHub-operations

2. **HTTP/SSE Bridge Server** (Optional)
   - Persistent server running on port 7182
   - **Only supports aichaku-reviewer MCP server currently**
   - Supports multiple concurrent Claude Code instances
   - Better for high-frequency usage
   - Managed via `aichaku mcp --start-server`
   - **Note**: GitHub-operations uses stdio mode only

## Quick Setup (Recommended)

## Option 1: Automatic Setup

```bash
# Install Aichaku and set up MCP servers automatically
npm install -g @aichaku/cli
aichaku setup

# Verify MCP servers are installed
aichaku mcp
```

This automatically:

- Installs MCP server binaries to `~/.claude/mcp/`
- Configures Claude Code settings
- Makes MCP tools available immediately

## Option 2: Manual Setup

If automatic setup doesn't work or you need custom configuration:

```bash
# Install MCP servers manually
aichaku mcp --install-reviewer
aichaku mcp --install-github

# Check installation status
aichaku mcp
```

## MCP Server Configuration

## Check Current MCP Status

Check what's installed and configured:

```bash
# View all MCP servers and their installation status
aichaku mcp

# View available MCP tools
aichaku mcp --tools
```

Expected output:

```text
📋 Aichaku MCP Server Status

Installed MCP Servers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ aichaku-reviewer
   Description: stdio (passive - launched on-demand)
   Path: /Users/username/.claude/mcp/aichaku-reviewer/
   Tools: 6 available

✅ github-operations
   Description: stdio (passive - launched on-demand)
   Path: /Users/username/.claude/mcp/github-operations/
   Tools: 11 available
```

## Available MCP Tools

#### Aichaku Code Reviewer (6 tools)

- `mcp__aichaku-reviewer__review_file` - Security and code quality review
- `mcp__aichaku-reviewer__review_methodology` - Methodology compliance checking
- `mcp__aichaku-reviewer__get_standards` - Retrieve coding standards
- `mcp__aichaku-reviewer__get_statistics` - Usage analytics
- `mcp__aichaku-reviewer__analyze_project` - Project structure analysis
- `mcp__aichaku-reviewer__generate_documentation` - Auto-generate docs

#### GitHub Operations (11 tools)

- `mcp__github-operations__auth_status` - Check GitHub authentication
- `mcp__github-operations__auth_login` - Login to GitHub
- `mcp__github-operations__release_upload` - Upload release assets
- `mcp__github-operations__release_view` - View release details
- `mcp__github-operations__run_list` - List workflow runs
- `mcp__github-operations__run_view` - View workflow run details
- `mcp__github-operations__run_watch` - Monitor workflow progress
- `mcp__github-operations__repo_view` - View repository information
- `mcp__github-operations__repo_list` - List repositories
- `mcp__github-operations__version_info` - Version compatibility info
- `mcp__github-operations__version_check` - Check GitHub CLI version

## Advanced Configuration

## HTTP/SSE Bridge Server (Optional - aichaku-reviewer only)

For better performance with multiple Claude Code instances (aichaku-reviewer
only):

```bash
# Start the HTTP/SSE bridge server
aichaku mcp --start-server

# Check server status
aichaku mcp --server-status

# Stop the server
aichaku mcp --stop-server
```

The server runs on port 7182 and provides:

- Faster response times (no process startup overhead)
- Support for multiple concurrent clients
- Persistent session management
- **Currently only supports aichaku-reviewer tools**

## Claude Code Settings

MCP servers are configured in `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "aichaku-reviewer": {
      "command": "/Users/username/.claude/mcp/aichaku-reviewer/index.js",
      "args": [],
      "env": {}
    },
    "github-operations": {
      "command": "/Users/username/.claude/mcp/github-operations/index.js",
      "args": [],
      "env": {}
    }
  }
}
```

**Note**: `aichaku setup` automatically manages this configuration. You rarely
need to edit it manually.

## Verification

## Check MCP Status in Claude Code

In Claude Code, use the `/mcp` command to verify configuration:

```
/mcp
```

This shows:

- Configured MCP servers
- Connection status
- Available tools count

## Test MCP Tools

Try using an MCP tool:

```
Use the mcp__github-operations__auth_status tool to check GitHub authentication
```

## Verify Tool Availability

MCP tools appear with the `mcp**` prefix in Claude's tool usage.

## Troubleshooting

## MCP Tools Not Available

**Problem**: MCP tools don't appear in Claude Code

**Solution**:

```bash
# Check if servers are installed
aichaku mcp

# Reinstall if needed
aichaku setup --force

# Restart Claude Code completely
```

## Permission Issues

**Problem**: Permission denied errors

**Solution**:

```bash
# Fix file permissions
chmod +x ~/.claude/mcp/*/index.js

# Reinstall with proper permissions
aichaku setup --force
```

## Configuration Issues

**Problem**: Claude Code can't find MCP servers

**Solution**:

```bash
# Check Claude Code settings
cat ~/.claude/settings.json

# Reset configuration
rm ~/.claude/settings.json
aichaku setup
```

## Server Not Starting (HTTP/SSE mode)

**Problem**: `aichaku mcp --start-server` fails

**Solution**:

```bash
# Check if port 7182 is in use
lsof -i :7182

# Kill any conflicting processes
pkill -f aichaku

# Try starting again
aichaku mcp --start-server
```

## Best Practices

## Use Stdio Mode by Default

- Stdio servers are simpler and more reliable
- No persistent processes to manage
- Automatically started by Claude Code when needed

## HTTP/SSE Mode for Heavy Usage (aichaku-reviewer only)

- Use when running multiple Claude Code instances
- Better for frequent aichaku-reviewer tool usage
- Requires manual server management
- **Only works with aichaku-reviewer tools currently**

## Keep Servers Updated

```bash
# Update all servers with Aichaku
npm update -g @aichaku/cli

# Verify update
aichaku mcp --tools
```

## Monitor Server Health

```bash
# Check status regularly
aichaku mcp

# View detailed tool information
aichaku mcp --tools
```

## Security Considerations

## Local Execution

- MCP servers run with your user permissions
- They can access files and APIs you have access to
- Review tool permissions before use

## Authentication

- GitHub MCP requires GitHub token for API access
- Store tokens securely (environment variables)
- Use minimal required permissions

## Network Access

- HTTP/SSE server only binds to localhost (127.0.0.1)
- No external network exposure by default
- Firewall rules generally not needed

## Getting Help

If you encounter issues:

1. **Check server status**: `aichaku mcp`
2. **View detailed logs**: Check Claude Code console output
3. **Reset configuration**: `aichaku setup --force`
4. **Report issues**:
   [Aichaku GitHub Issues](https://github.com/RickCogley/aichaku/issues)

## Summary

- **Stdio servers** (default): Passive, launched on-demand, no management needed
- **HTTP/SSE server** (optional): Persistent, better for heavy usage
- **Tools appear** with `mcp**` prefix once configured
- **Use `aichaku setup`** for automatic configuration
- **Restart Claude Code** after configuration changes

The MCP system enables powerful integrations between Claude Code and external
tools while maintaining security and performance.
