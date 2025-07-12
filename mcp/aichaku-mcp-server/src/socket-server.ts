#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run
/**
 * MCP Socket Server - Wraps the MCP server to accept Unix socket connections
 * This allows multiple clients to connect to a single server instance
 */

import { resolve } from "@std/path";

const SOCKET_PATH = `${Deno.env.get("HOME")}/.aichaku/mcp-server.sock`;
const MCP_SERVER_PATH = `${
  Deno.env.get("HOME")
}/.aichaku/mcp-servers/aichaku-code-reviewer`;

/**
 * Handle a client connection
 */
async function handleClient(
  conn: Deno.UnixConn,
  mcpProcess: Deno.ChildProcess,
) {
  console.log("[Socket Server] New client connected");

  const _encoder = new TextEncoder();
  const _decoder = new TextDecoder();

  try {
    // Set up bidirectional forwarding

    // Forward client -> MCP server
    const clientReader = conn.readable.getReader();
    const mcpWriter = mcpProcess.stdin.getWriter();

    // Forward MCP server -> client
    const mcpReader = mcpProcess.stdout.getReader();

    // Client to MCP forwarding
    const clientToMcp = (async () => {
      try {
        while (true) {
          const { done, value } = await clientReader.read();
          if (done) break;

          // Forward to MCP stdin
          await mcpWriter.write(value);
        }
      } catch (error) {
        console.error("[Socket Server] Client read error:", error);
      } finally {
        clientReader.releaseLock();
      }
    })();

    // MCP to client forwarding
    const mcpToClient = (async () => {
      try {
        while (true) {
          const { done, value } = await mcpReader.read();
          if (done) break;

          // Forward to client
          await conn.write(value);
        }
      } catch (error) {
        console.error("[Socket Server] MCP read error:", error);
      } finally {
        mcpReader.releaseLock();
      }
    })();

    // Wait for either side to close
    await Promise.race([clientToMcp, mcpToClient]);
  } catch (error) {
    console.error("[Socket Server] Connection error:", error);
  } finally {
    console.log("[Socket Server] Client disconnected");
    try {
      conn.close();
    } catch {
      // Ignore close errors
    }
  }
}

/**
 * Start the socket server
 */
async function startServer() {
  // Remove existing socket if it exists
  try {
    await Deno.remove(SOCKET_PATH);
  } catch {
    // Ignore if doesn't exist
  }

  // Ensure directory exists
  const socketDir = resolve(SOCKET_PATH, "..");
  await Deno.mkdir(socketDir, { recursive: true });

  // Start MCP server process
  console.log("[Socket Server] Starting MCP server process...");
  const mcpProcess = new Deno.Command(MCP_SERVER_PATH, {
    stdin: "piped",
    stdout: "piped",
    stderr: "inherit", // Let stderr go to console
  }).spawn();

  // Create Unix socket listener
  console.log(`[Socket Server] Listening on ${SOCKET_PATH}`);
  const listener = await Deno.listen({
    path: SOCKET_PATH,
    transport: "unix",
  });

  // Write PID file for management
  const pidPath = `${Deno.env.get("HOME")}/.aichaku/mcp-server.pid`;
  await Deno.writeTextFile(pidPath, Deno.pid.toString());

  // Handle shutdown
  const shutdown = async () => {
    console.log("\n[Socket Server] Shutting down...");

    // Close listener
    listener.close();

    // Remove socket
    try {
      await Deno.remove(SOCKET_PATH);
    } catch {
      // Ignore
    }

    // Remove PID file
    try {
      await Deno.remove(pidPath);
    } catch {
      // Ignore
    }

    // Kill MCP process
    mcpProcess.kill();

    Deno.exit(0);
  };

  // Register signal handlers
  Deno.addSignalListener("SIGINT", shutdown);
  Deno.addSignalListener("SIGTERM", shutdown);

  console.log("[Socket Server] Ready for connections");
  console.log("[Socket Server] PID:", Deno.pid);

  // Accept connections
  for await (const conn of listener) {
    // Handle each client connection
    // Note: For true multi-client support, we'd need to multiplex
    // For now, we'll handle one client at a time
    handleClient(conn as Deno.UnixConn, mcpProcess);
  }
}

// Start server
if (import.meta.main) {
  await startServer();
}
