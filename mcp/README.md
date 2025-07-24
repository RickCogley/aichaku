# Aichaku MCP Servers

This directory contains the Model Context Protocol (MCP) servers that provide Claude Code with enhanced capabilities.

## Directory Structure

```
mcp/
├── aichaku-mcp-server/     # Code review, security, and methodology compliance
└── github-mcp-server/      # GitHub operations and workflow management
```

## MCP Servers

### 🔍 Aichaku Code Reviewer (`aichaku-mcp-server`)

**Purpose**: Code review, security scanning, and methodology compliance

**Tools Provided**:

- `mcp__aichaku-reviewer__review_file` - Review individual files for security and standards
- `mcp__aichaku-reviewer__review_methodology` - Check methodology compliance
- `mcp__aichaku-reviewer__get_standards` - Get project standards configuration
- `mcp__aichaku-reviewer__analyze_project` - Analyze project structure
- `mcp__aichaku-reviewer__generate_documentation` - Generate documentation
- `mcp__aichaku-reviewer__get_statistics` - View usage statistics
- `mcp__aichaku-reviewer__create_doc_template` - Create documentation templates

**Installation**: `aichaku mcp --install-reviewer`

### 🐙 GitHub Operations (`github-mcp-server`)

**Purpose**: Comprehensive GitHub CLI replacement with deterministic operations

**Tools Provided**:

- `mcp__github__release_upload` - Upload assets to releases
- `mcp__github__release_view` - View release details
- `mcp__github__run_list` - List workflow runs
- `mcp__github__run_watch` - Monitor workflow progress
- `mcp__github__auth_status` - Check authentication
- `mcp__github__version_info` - Version compatibility checking
- And 60+ more GitHub operations...

**Installation**: `aichaku mcp --install-github` (coming soon)

## Installation

### Quick Setup

```bash
# Install both MCP servers
aichaku mcp --install

# Or install specific ones
aichaku mcp --install-reviewer  # Just code review
aichaku mcp --install-github    # Just GitHub operations
```

### Manual Setup

Each MCP server can be configured independently in Claude Code:

```json
{
  "mcpServers": {
    "aichaku-reviewer": {
      "command": "/Users/user/.aichaku/mcp-servers/aichaku-code-reviewer",
      "args": []
    },
    "github": {
      "command": "/Users/user/.aichaku/mcp-servers/github-operations",
      "args": [],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Development

### Building

```bash
# Build aichaku MCP server
cd mcp/aichaku-mcp-server
deno task compile

# Build GitHub MCP server
cd mcp/github-mcp-server
deno task compile
```

### Testing

```bash
# Test aichaku MCP server
cd mcp/aichaku-mcp-server
deno test -A

# Test GitHub MCP server
cd mcp/github-mcp-server
deno test -A
```

## Architecture Benefits

**Separation of Concerns**: Each MCP server has a focused responsibility

- **Aichaku MCP**: Code quality, security, methodology
- **GitHub MCP**: GitHub API operations, release management

**Independent Lifecycle**: Updates and changes don't interfere

- GitHub API changes only affect GitHub MCP
- Security pattern updates only affect Aichaku MCP

**Flexible Deployment**: Install only what you need

- Code review without GitHub operations
- GitHub operations without methodology compliance
- Or both together for complete functionality

## Learn More

- [Aichaku MCP Server Documentation](./aichaku-mcp-server/README.md)
- [GitHub MCP Server Documentation](./github-mcp-server/README.md)
- [Main Aichaku Documentation](../docs/README.md)
