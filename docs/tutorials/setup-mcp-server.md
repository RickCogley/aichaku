# Setting Up the Aichaku MCP Server

Learn how to install and configure the Aichaku MCP (Model Context Protocol)
server for automated code review in Claude Code. This tutorial covers first-time
setup and verification.

## What you'll learn

In this tutorial, you'll:

- Install the Aichaku MCP server globally

- Configure Claude Code to use the MCP server

- Verify the installation is working

- Understand what the MCP server provides

- Test automated code review with Claude

## Before you begin

You need:

- **Aichaku installed** (run `aichaku --version` to check)

- **Claude Code** with MCP support

- **Admin access** to install global tools

- **10 minutes** to complete this tutorial

Don't have Aichaku? Follow the [Getting Started](getting-started.md) guide
first.

## Understanding MCP

The Model Context Protocol (MCP) lets Claude Code use external tools. The
Aichaku MCP server provides:

- **Security scanning** - OWASP Top 10 vulnerability detection

- **Standards checking** - TDD, SOLID, conventional commits, etc.

- **Methodology validation** - Shape Up, Scrum, Kanban compliance

- **Educational feedback** - Learning opportunities, not just errors

- **Privacy-first** - All scanning happens locally on your machine

- **HTTP/SSE Server Mode** - Optional shared server for multiple Claude Code
  instances

## Step 1: Install the MCP server

Install the Aichaku MCP server globally:

````bash
aichaku mcp --install
```text

This downloads the correct binary for your platform and installs it to
`~/.aichaku/mcp-server/`.

### What happens during installation

The installer:

1. Detects your operating system and architecture

2. Downloads the pre-compiled binary from GitHub releases

3. Saves it to `~/.aichaku/mcp-server/mcp-code-reviewer`

4. Makes it executable (on Unix-like systems)

5. Checks for optional external scanners

### Verify the installation

Check that the MCP server installed correctly:

```bash
aichaku mcp --status
```text

You should see:

```text
🔍 Checking MCP Server Status...

📦 MCP Server: ✅ Installed
   Location: /Users/yourname/.aichaku/mcp-server/mcp-code-reviewer

🔍 External Scanners:

   CodeQL: ⚠️  Not installed
      Install: brew install codeql
   DevSkim: ⚠️  Not installed
      Install: dotnet tool install -g Microsoft.CST.DevSkim.CLI
   Semgrep: ⚠️  Not installed
      Install: brew install semgrep
```text

The external scanners are optional but provide enhanced security checking.

## Step 2: Configure Claude Code

Configure Claude Code to use the MCP servers with the `claude mcp` command:

```bash
# Add servers with user scope (recommended - available across all projects)
claude mcp add -s user aichaku-reviewer ~/.aichaku/mcp-servers/aichaku-code-reviewer
claude mcp add -s user github-operations ~/.aichaku/mcp-servers/github-operations

# Verify they're configured
claude mcp list
```text

**Scope Options:**

- `-s user` (recommended): Available to you across all projects

- `-s local`: Private to you in current project only

- `-s project`: Shared with everyone working on this project

### Restart Claude Code

After adding the servers, you must restart Claude Code for the changes to take
effect.

### Verify Claude Code configuration

After restarting Claude Code:

1. Open any project with Aichaku initialized

2. Ask Claude: "Can you check what MCP tools are available?"

3. Claude should list:

   - `mcp__aichaku-reviewer__review_file`

   - `mcp__aichaku-reviewer__review_methodology`

   - `mcp__aichaku-reviewer__get_standards`

If you don't see these tools, check:

- The settings file path is correct

- The JSON syntax is valid (no trailing commas)

- Claude Code was fully restarted

## Step 3: Test the MCP server

Create a test file with a security issue:

```bash
cat > test-security.js << 'EOF'
// Test file with intentional security issues
const userInput = process.argv[2];
const exec = require('child_process').exec;

// Command injection vulnerability
exec(`echo ${userInput}`, (error, stdout) => {
  console.log(stdout);
});

// Hardcoded secret
const apiKey = "sk-1234567890abcdef";

// SQL injection
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
EOF
```text

Now ask Claude to review it:

```text
"Please review test-security.js for security issues"
```text

Claude will use the MCP server to:

1. Scan for security vulnerabilities

2. Check against your project standards

3. Provide educational feedback with fixes

## Understanding the feedback

The MCP server provides comprehensive feedback:

```text
🌱 Learning Opportunity - Let's fix this properly:

📖 Context: Command injection is one of the most critical security vulnerabilities...

⚠️ Issue: Using shell variables directly in commands
📌 Reminder: Your CLAUDE.md requires preventing command injection

❌ Bad Example:
exec(`echo ${userInput}`)

✅ Good Example:
execFile('echo', [userInput])

🔄 Step-by-Step Fix:

1. Replace exec with execFile for parameterized execution

2. Use array arguments instead of string interpolation
...
```text

This educational approach helps you:

- Understand why something is a problem

- Learn the secure alternative

- Apply the fix with confidence

- Remember for next time

## Optional: Install external scanners

For enhanced security scanning, install external tools:

### macOS

```bash
# Install Homebrew if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install scanners
brew install codeql semgrep

# Install DevSkim (requires .NET)
dotnet tool install -g Microsoft.CST.DevSkim.CLI
```text

### Linux

```bash
# Semgrep
python3 -m pip install semgrep

# CodeQL
# Download from: https://github.com/github/codeql-cli-binaries

# DevSkim
dotnet tool install -g Microsoft.CST.DevSkim.CLI
```text

### Windows

```powershell
# Semgrep
pip install semgrep

# DevSkim
dotnet tool install -g Microsoft.CST.DevSkim.CLI

# CodeQL - download from GitHub releases
```text

## Troubleshooting

### MCP server not found in Claude

**Problem:** Claude doesn't see the MCP tools

**Solutions:**

1. Verify the settings file location is correct

2. Check JSON syntax (use a JSON validator)

3. Ensure the binary path in settings is absolute

4. Restart Claude Code completely (quit and reopen)

### Installation fails

**Problem:** Binary download fails

**Solutions:**

1. Check your internet connection

2. Try the manual installation:

   ```bash
   git clone https://github.com/RickCogley/aichaku
   cd aichaku/mcp-server
   deno task compile
   cp dist/mcp-code-reviewer ~/.aichaku/mcp-server/
````

### Reviews not working

**Problem:** Claude can see the tools but reviews fail

**Solutions:**

1. Check file permissions on the MCP binary

2. Run `aichaku mcp --status` to verify installation

3. Check Claude's developer console for errors

4. Ensure the project has Aichaku initialized

## Optional: HTTP/SSE Server Mode

For users running multiple Claude Code instances or frequent reviews, you can
use the HTTP/SSE server mode:

### Start the shared server

````bash
# Start the HTTP/SSE server
aichaku mcp --start-server

# Check server status
aichaku mcp --server-status

# Stop the server when done
aichaku mcp --stop-server
```text

When the HTTP/SSE server is running:

- The `aichaku review` command automatically uses it

- Multiple Claude Code instances can share the same server

- Faster response times (no process startup overhead)

- Works on port 7182 (AICHAKU on phone keypad)

The server mode is completely optional - the default process mode works
perfectly for most users.

## What's next?

You've successfully:

- ✅ Installed the MCP server globally

- ✅ Configured Claude Code to use it

- ✅ Tested automated security scanning

- ✅ Understood the educational feedback

- ✅ Learned about the optional HTTP/SSE server mode

Continue with:

- [Using MCP with Multiple Projects](../how-to/use-mcp-with-multiple-projects.md) -
  Share one server across projects

- [MCP API Reference](../reference/mcp-api.md) - All available tools and options

- [MCP Architecture](../explanation/mcp-architecture.md) - How it works under
  the hood

## Getting help

- Run `aichaku mcp --help` for command options

- Check the
  [MCP README](https://github.com/RickCogley/aichaku/tree/main/mcp-server) for
  details

- Report issues on [GitHub](https://github.com/RickCogley/aichaku/issues)

Remember: The MCP server runs locally and never sends your code anywhere. All
security scanning happens on your machine for complete privacy.
````
