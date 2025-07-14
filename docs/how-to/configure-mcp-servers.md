# Configure MCP Servers for Claude Code

**IMPORTANT**: Installing MCP servers through Aichaku does NOT automatically make them available to Claude Code. You must configure them separately in Claude Code's MCP system.

## Understanding the Two Systems

### 1. Aichaku MCP Management
- Installs MCP server binaries to `~/.aichaku/mcp-servers/`
- Manages server lifecycle (start/stop)
- Shows available tools
- **Does NOT integrate with Claude Code automatically**

### 2. Claude Code MCP System
- Requires manual configuration
- Uses `/mcp` command to check status
- Must be configured to connect to running servers
- Only configured servers appear as tools

## Step-by-Step Configuration

### Step 1: Install MCP Servers via Aichaku

```bash
# Install the MCP servers
aichaku mcp --install

# Verify installation
aichaku mcp --status
```

### Step 2: Start the MCP Servers

```bash
# Start individual servers
aichaku mcp --start-aichaku-reviewer
aichaku mcp --start-github-operations

# Or start all at once
aichaku mcp --start-all
```

### Step 3: Configure Claude Code

Use the `claude mcp` command from your terminal to add the MCP servers to Claude Code:

```bash
# Add servers with user scope (recommended - available across all projects)
claude mcp add -s user aichaku-reviewer ~/.aichaku/mcp-servers/aichaku-code-reviewer
claude mcp add -s user github-operations ~/.aichaku/mcp-servers/github-operations

# Verify they're configured
claude mcp list
```

**Scope Options:**
- `user` (recommended): Available to you across all projects
- `local`: Private to you in current project only
- `project`: Shared with everyone working on this project

### Step 4: Restart Claude Code

After adding the servers, you must restart Claude Code for the changes to take effect.

### Step 5: Verify Configuration

1. Use `/mcp` command again - it should now show configured servers
2. MCP tools should appear with prefix `mcp__` in Claude's tool list
3. Test a simple command like `mcp__github__auth_status`

## Available MCP Servers

### Aichaku Code Reviewer
- **Purpose**: Code review and analysis
- **Tools**: 7 available
  - `mcp__aichaku-reviewer__review_file`
  - `mcp__aichaku-reviewer__review_methodology`
  - `mcp__aichaku-reviewer__get_standards`
  - `mcp__aichaku-reviewer__analyze_project`
  - `mcp__aichaku-reviewer__generate_documentation`
  - And more...

### GitHub Operations
- **Purpose**: GitHub API operations
- **Tools**: 11 available
  - `mcp__github__auth_status`
  - `mcp__github__auth_login`
  - `mcp__github__release_upload`
  - `mcp__github__release_view`
  - `mcp__github__run_list`
  - `mcp__github__workflow_trigger`
  - And more...

## Troubleshooting

### MCP Tools Not Appearing
1. Check servers are running: `aichaku mcp --status`
2. Verify Claude Code configuration: `/mcp`
3. Restart Claude Code after configuration changes
4. Check server logs for connection errors

### Server Won't Start
1. Check if port is already in use
2. Verify binary permissions
3. Check for missing dependencies
4. Review server logs

### Connection Issues
1. Ensure firewall allows local connections
2. Check server is listening on correct port
3. Verify authentication credentials if required

## Important Notes

⚠️ **MCP servers must be configured in BOTH systems**:
1. Installed and running via Aichaku
2. Configured in Claude Code's MCP system

⚠️ **Tools only appear after proper configuration**:
- Won't see `mcp__` prefixed tools until configured
- Task agent may fall back to CLI commands if MCP unavailable

⚠️ **Security considerations**:
- MCP servers run locally with your permissions
- Be cautious with authentication tokens
- Review tool permissions before use

## Quick Reference

```bash
# Aichaku MCP commands
aichaku mcp --install          # Install servers
aichaku mcp --start-all        # Start all servers
aichaku mcp --stop-all         # Stop all servers
aichaku mcp --status           # Check status

# Claude Code MCP commands
/mcp                           # Check configuration
```

Remember: Having MCP servers installed is only half the setup - they must be configured in Claude Code to be usable!