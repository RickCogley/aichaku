# Pitch: MCP Server Management Improvements

## Problem

Currently, managing the MCP server requires extensive manual commands and system administration knowledge:

- No version information displayed
- Manual process management with `pkill` and direct binary execution
- Manual file copying for updates
- Confusing configuration instructions (JSON snippet instead of `claude mcp add`)
- Platform-specific commands that don't work cross-platform
- No indication of when to restart Claude Code

Users are frustrated by the complexity and error-prone nature of the current approach.

## Appetite

**2-3 days** - This is a focused improvement to an existing feature that will significantly improve user experience.

## Solution

### Enhanced `aichaku mcp` Command Structure

```
aichaku mcp --status     # Enhanced status with version, location, PID
aichaku mcp --start      # Start the MCP server
aichaku mcp --stop       # Stop the MCP server
aichaku mcp --restart    # Restart the MCP server
aichaku mcp --upgrade    # Check for and install updates
aichaku mcp --config     # Show proper claude mcp add command
```

### Status Display Mockup

```
🔍 MCP Server Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Version:        0.21.1 (latest: 0.21.2 available)
📍 Location:       ~/.aichaku/mcp-server/mcp-code-reviewer
🟢 Status:         Running (PID: 41531)
⏱️  Uptime:         2 hours 15 minutes
🔧 Platform:       macOS arm64

💡 To upgrade: aichaku mcp --upgrade
```

### Configuration Instructions Update

Instead of showing JSON, display:

```
📝 To configure Claude Code:

Run this command once per system:
─────────────────────────────────────────────────
claude mcp add aichaku-reviewer --stdio -- ~/.aichaku/mcp-server/mcp-code-reviewer
─────────────────────────────────────────────────

✅ This enables the MCP server for all your aichaku projects
💡 Restart Claude Code after making changes
```

### Cross-Platform Process Management

```typescript
// Process management abstraction
class MCPProcessManager {
  async start(): Promise<void> {
    if (Deno.build.os === "windows") {
      // Use Windows-specific start method
      await this.startWindows();
    } else {
      // Use Unix-style fork/exec
      await this.startUnix();
    }
  }

  async stop(): Promise<void> {
    const pid = await this.readPidFile();
    if (Deno.build.os === "windows") {
      await this.stopWindows(pid);
    } else {
      await this.stopUnix(pid);
    }
  }
}
```

### Version Management

```typescript
interface MCPVersionInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
  releaseNotes?: string;
}

async function checkVersion(): Promise<MCPVersionInfo> {
  // Check embedded version in binary
  const current = await this.getCurrentVersion();

  // Check GitHub releases API
  const latest = await this.getLatestVersion();

  return {
    current,
    latest,
    updateAvailable: current !== latest,
    releaseNotes: await this.getReleaseNotes(latest),
  };
}
```

## Rabbit Holes

### Avoid These

1. **Building a full daemon/service manager** - Keep it simple with PID files
2. **Complex auto-update mechanisms** - Just download and replace the binary
3. **GUI or TUI interfaces** - Stay with simple CLI commands
4. **Managing multiple versions** - Only support current + upgrade to latest
5. **Complex IPC mechanisms** - The MCP server handles its own protocol

### Keep It Simple

- Use PID files for process tracking
- Simple HTTP fetch for version checking
- Direct binary replacement for upgrades
- Clear, actionable error messages

## No-Goes

1. **Automatic updates without consent** - Always ask before upgrading
2. **Running as system service** - Keep it user-level
3. **Complex configuration files** - Everything via command flags
4. **Breaking existing workflows** - Maintain backward compatibility

## Implementation Plan

### Phase 1: Process Management (Day 1)

- [ ] Create MCPProcessManager class
- [ ] Implement PID file tracking
- [ ] Add start/stop/restart commands
- [ ] Test on macOS, Linux, Windows

### Phase 2: Version Management (Day 2)

- [ ] Embed version info in binary
- [ ] Add version check against GitHub
- [ ] Implement upgrade command
- [ ] Add upgrade confirmation flow

### Phase 3: Better UX (Day 3)

- [ ] Enhanced status display
- [ ] Better configuration instructions
- [ ] Improved error messages
- [ ] Documentation updates

## Success Metrics

- Users can manage MCP server without manual commands
- Clear version information always available
- One-command upgrades
- Works identically across all platforms
- Reduced support questions about MCP setup
