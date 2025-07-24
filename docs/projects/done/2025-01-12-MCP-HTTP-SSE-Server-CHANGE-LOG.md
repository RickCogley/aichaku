# MCP HTTP/SSE Server Implementation - Change Log

**Date**: 2025-01-12\
**Project**: MCP HTTP/SSE Server for Multiple Claude Code Instances\
**Status**: ✅ Complete

## Overview

Implemented a shared HTTP/SSE (Server-Sent Events) server architecture for the
MCP (Model Context Protocol) server to support multiple concurrent Claude Code
instances efficiently.

## Problem Statement

The original MCP implementation spawned a new process for each request, which
would be problematic when:

- Multiple Claude Code instances are running on the same machine
- Frequent requests lead to excessive process creation/destruction
- Windows compatibility is required (named pipes don't work well on Windows)

## Solution

Created an HTTP server with Server-Sent Events that allows multiple Claude Code
instances to connect to a single shared MCP server process.

## Architecture

```
Claude Code Instance 1 ─┐
                        ├─→ HTTP/SSE Server (:7182) ─→ MCP Process Pool
Claude Code Instance 2 ─┤         ↓
                        │    Session Manager
Claude Code Instance N ─┘         ↓
                             PID File & Logs
```

## Files Created/Modified

### 1. **HTTP/SSE Server**

`mcp/aichaku-mcp-server/src/http-server.ts`

- Complete HTTP server implementation
- Manages multiple MCP process sessions
- Implements SSE for real-time responses
- Cross-platform (Windows, macOS, Linux)
- Features:
  - Health check endpoint (`GET /health`)
  - RPC endpoint (`POST /rpc`)
  - SSE stream (`GET /sse`)
  - Session management (`DELETE /session`)
  - Automatic cleanup of inactive sessions
  - PID file management for single instance

### 2. **HTTP Client**

`src/utils/mcp-http-client.ts`

- TypeScript client for the HTTP/SSE server
- Manual SSE parsing (Deno lacks EventSource)
- Connection pooling with shared client instance
- Automatic reconnection logic
- Session-based communication

### 3. **TCP Server (Alternative)**

`mcp/aichaku-mcp-server/src/tcp-server.ts`

- TCP-based alternative for direct socket communication
- Also cross-platform
- Each client gets dedicated MCP process

### 4. **Command Updates**

`src/commands/mcp.ts`

- Added server management options:
  - `--start-server`: Start HTTP/SSE server
  - `--stop-server`: Stop the server
  - `--server-status`: Check server status
- Server lifecycle management
- Cross-platform process handling

### 5. **Review Command Integration**

`src/commands/review.ts`

- Automatic detection of HTTP server
- Seamless fallback to process spawning
- Unified interface for both modes

### 6. **CLI Updates**

`cli.ts`

- Added new boolean flags for server commands
- Proper argument parsing for server options

## Technical Implementation Details

### Server Features

- **Port**: 7182 (AICHAKU on phone keypad)
- **Protocol**: HTTP with JSON-RPC over POST, SSE for responses
- **Sessions**: UUID-based session management
- **Cleanup**: 5-minute timeout for inactive sessions
- **Logging**: Structured logs to `~/.aichaku/mcp-http-server.log`
- **PID Management**: Prevents multiple server instances

### Client Features

- **Polling**: Manual SSE parsing with configurable intervals
- **Timeout**: 30-second default with configurable options
- **Shared Instance**: Singleton pattern for efficiency
- **Auto-connect**: Lazy connection on first use

### Cross-Platform Considerations

- **Windows**: Uses `taskkill` for process termination
- **Unix**: Uses standard signals (SIGTERM)
- **Path handling**: Proper home directory detection
- **Network**: 127.0.0.1 binding for security

## Benefits Achieved

1. **Resource Efficiency**: Single server process handles multiple clients
2. **Performance**: Persistent connections reduce overhead
3. **Scalability**: Can handle many concurrent Claude Code instances
4. **Compatibility**: Works on all major platforms
5. **Backward Compatibility**: Falls back to process spawning if needed
6. **Security**: Local-only binding, session isolation

## Usage Examples

```bash
# Start the shared HTTP/SSE server (once)
aichaku mcp --start-server

# Check if server is running
aichaku mcp --server-status
# Output: ✅ MCP HTTP/SSE Server is running
#         URL: http://127.0.0.1:7182
#         Active sessions: 0
#         Process ID: 2006

# Use review command (automatically uses HTTP if available)
aichaku review src/file.ts

# Stop the server
aichaku mcp --stop-server
```

## Migration Path

1. **No Breaking Changes**: Existing functionality preserved
2. **Automatic Detection**: Review command auto-detects server
3. **Gradual Adoption**: Users can choose when to use server mode
4. **Clear Documentation**: Help text updated with new options

## Testing Performed

- ✅ Server start/stop lifecycle
- ✅ Multiple concurrent connections
- ✅ Session management and cleanup
- ✅ Cross-platform compatibility checks
- ✅ Fallback to process spawning
- ✅ Error handling and recovery

## Known Limitations

1. **Path Validation**: The MCP server has strict path validation that may
   reject some legitimate paths
2. **Deno EventSource**: Had to implement manual SSE parsing due to Deno
   limitations
3. **Process Persistence**: Server process must be manually managed (not a
   system service)

## Future Enhancements

1. **WebSocket Support**: Could replace SSE for better bidirectional
   communication
2. **Service Integration**: systemd/launchd/Windows Service support
3. **Multi-user Support**: Currently limited to single user
4. **Configuration File**: Server settings could be externalized
5. **Metrics/Monitoring**: Prometheus-compatible metrics endpoint

## Security Considerations

- Server binds to localhost only (127.0.0.1)
- Each session is isolated with unique IDs
- No authentication (relies on local access control)
- Sessions timeout after 5 minutes of inactivity
- PID file prevents multiple instances

## Conclusion

The HTTP/SSE server implementation successfully addresses the requirement for
supporting multiple Claude Code instances while maintaining cross-platform
compatibility and backward compatibility with the existing process-spawning
approach.
