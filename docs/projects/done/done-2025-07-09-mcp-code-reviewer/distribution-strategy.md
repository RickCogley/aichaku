# MCP Code Reviewer Distribution Strategy

🪴 Aichaku: Making Installation Dead Simple

## Core Principles

1. **Privacy First**: Local-only execution, no cloud
2. **Easy Installation**: One command setup
3. **Optional Tools**: Security scanners installed separately
4. **PR Creation**: Manual only, never automatic

## Distribution via GitHub Packages

### 1. Cross-Platform Binaries

```yaml
# .github/workflows/release.yml
name: Build and Release

on:
  release:
    types: [created]

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-latest
            target: x86_64-apple-darwin
            name: mcp-code-reviewer-macos-intel
          - os: macos-latest
            target: aarch64-apple-darwin
            name: mcp-code-reviewer-macos-arm
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            name: mcp-code-reviewer-linux
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            name: mcp-code-reviewer-windows.exe

    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1

      - name: Compile
        run: |
          deno compile \
            --allow-read \
            --allow-write \
            --allow-run \
            --allow-env \
            --target ${{ matrix.target }} \
            --output ${{ matrix.name }} \
            src/server.ts

      - name: Upload to Release
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./${{ matrix.name }}
          asset_name: ${{ matrix.name }}
```

### 2. Installation Script

```bash
#!/bin/bash
# install.sh - One-line installer

echo "🪴 Installing Aichaku MCP Code Reviewer..."

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS-$ARCH" in
  darwin-x86_64) BINARY="mcp-code-reviewer-macos-intel" ;;
  darwin-arm64) BINARY="mcp-code-reviewer-macos-arm" ;;
  linux-x86_64) BINARY="mcp-code-reviewer-linux" ;;
  *) echo "Unsupported platform: $OS-$ARCH"; exit 1 ;;
esac

# Download binary
URL="https://github.com/aichaku/mcp-code-reviewer/releases/latest/download/$BINARY"
curl -fsSL "$URL" -o mcp-code-reviewer
chmod +x mcp-code-reviewer

# Install to PATH
sudo mv mcp-code-reviewer /usr/local/bin/

# Configure Claude Code
claude code config add-mcp mcp-code-reviewer

echo "✅ MCP Code Reviewer installed!"
echo "🔒 Privacy: All reviews happen locally on your machine"
```

## Tool Integration Strategy

### Cannot Bundle External Tools ❌

**Why?** DevSkim, CodeQL, and Semgrep are:

- Written in different languages (C#, Java, Python)
- Have their own runtimes
- Licensed separately
- Update independently

### Smart Tool Detection ✅

```typescript
class ToolDetector {
  async detectAvailableTools(): Promise<ToolStatus> {
    const tools = {
      devskim: await this.checkCommand("devskim --version"),
      codeql: await this.checkCommand("codeql --version"),
      semgrep: await this.checkCommand("semgrep --version"),
      eslint: await this.checkNodePackage("eslint"),
    };

    return {
      available: Object.entries(tools)
        .filter(([_, installed]) => installed)
        .map(([name]) => name),
      missing: Object.entries(tools)
        .filter(([_, installed]) => !installed)
        .map(([name]) => name),
    };
  }

  async suggestInstallation(missing: string[]): Promise<string> {
    const suggestions = {
      devskim: "npm install -g @microsoft/devskim-cli",
      codeql: "brew install codeql",
      semgrep: "pip install semgrep",
      eslint: "npm install -g eslint eslint-plugin-security",
    };

    return missing.map((tool) => suggestions[tool]).join("\n");
  }
}
```

### Progressive Enhancement

```typescript
// MCP works with whatever tools are available
async performReview(file: string): ReviewResult {
  const tools = await this.detectAvailableTools();
  
  if (tools.available.length === 0) {
    // Built-in pattern matching only
    return this.basicPatternReview(file);
  }
  
  // Use all available tools
  const results = await Promise.all(
    tools.available.map(tool => this.runTool(tool, file))
  );
  
  return this.aggregateResults(results);
}
```

## User Experience

### First Run

```
$ mcp-code-reviewer
🪴 MCP Code Reviewer v1.0.0

🔍 Checking available security tools...
✅ Built-in pattern scanner
❌ DevSkim not found
❌ CodeQL not found
✅ ESLint found

💡 For enhanced security scanning, install:
   npm install -g @microsoft/devskim-cli
   brew install codeql

🔒 Privacy Notice: All scanning happens locally.
   Your code never leaves your machine.

Ready to review code!
```

### Optional Tool Installation

```bash
# Helper command
$ mcp-code-reviewer install-tools

🪴 Installing recommended security tools...

1. DevSkim (Microsoft)
   npm install -g @microsoft/devskim-cli

2. Semgrep (r2c)
   pip install semgrep

3. ESLint Security Plugin
   npm install -g eslint eslint-plugin-security

Install all? [y/N]
```

## PR Creation - Manual Only

### Why Manual?

- Avoids PR spam
- User maintains control
- Conscious decision required
- Better for team workflows

### How It Works

```
User: "Create a PR to fix the security issues you found"
Claude: "I'll create a PR with the security fixes"
  → MCP: create_fix_pr(findings, { confirmed: true })
  ← MCP: "Created PR #123 with 5 security fixes"
Claude: "Created PR #123: [Security fixes for command injection and path traversal]"
```

### Never Automatic

```typescript
// BAD - Would create too many PRs
hooks: [{
  name: "Auto PR on High Severity",
  command: "mcp-reviewer create-pr --auto", // ❌ Don't do this
}];

// GOOD - User decides
// User explicitly asks: "Fix these security issues"
// Then MCP can create PR
```

## Installation Methods

### 1. Direct Download (Recommended)

```bash
# One-liner
curl -fsSL https://aichaku.dev/install-mcp | bash
```

### 2. Via Aichaku CLI

```bash
# Future enhancement
aichaku install-mcp
```

### 3. Manual Download

- Go to: https://github.com/aichaku/mcp-code-reviewer/releases
- Download for your platform
- Add to PATH
- Configure Claude Code

### 4. Build from Source

```bash
git clone https://github.com/aichaku/mcp-code-reviewer
cd mcp-code-reviewer
deno compile --allow-all --output mcp-code-reviewer src/server.ts
```

## Security & Privacy Guarantees

### What We Promise

1. **No Network Calls**: Except to check for updates (optional)
2. **No Telemetry**: Zero tracking or analytics
3. **No Code Storage**: Everything in memory only
4. **No API Keys**: Works without any credentials
5. **Open Source**: Audit the code yourself

### User Documentation Must Emphasize

```markdown
## 🔒 Privacy First

The MCP Code Reviewer runs 100% locally on your machine:

- Your code NEVER leaves your computer
- No cloud services or APIs involved
- No account or authentication required
- Complete control over your security reviews

This is by design - we believe code security reviews should be private.
```
