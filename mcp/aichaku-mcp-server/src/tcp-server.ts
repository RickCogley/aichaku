#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net
/**
 * MCP TCP Server - Wraps the MCP server to accept TCP connections
 * Cross-platform solution that works on Windows, macOS, and Linux
 */

const DEFAULT_PORT = 7182; // AICHAKU on phone keypad
const MCP_SERVER_PATH = `${
  Deno.env.get("HOME") || Deno.env.get("USERPROFILE")
}/.aichaku/mcp-servers/aichaku-code-reviewer`;

interface ClientConnection {
  id: number;
  conn: Deno.TcpConn;
  mcpProcess: Deno.ChildProcess;
  active: boolean;
}

class MCPTcpServer {
  private server?: Deno.TcpListener;
  private clients = new Map<number, ClientConnection>();
  private clientIdCounter = 0;
  private pidFile: string;

  constructor(private port: number = DEFAULT_PORT) {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || ".";
    this.pidFile = `${homeDir}/.aichaku/mcp-tcp-server.pid`;
  }

  async start(): Promise<void> {
    // Check if already running
    if (await this.isRunning()) {
      console.log("❌ MCP TCP server is already running");
      const pid = await this.getPid();
      if (pid) {
        console.log(`   PID: ${pid}`);
      }
      return;
    }

    try {
      // Start TCP server
      this.server = Deno.listen({ port: this.port, transport: "tcp" });
      console.log(`🚀 MCP TCP Server starting on port ${this.port}...`);

      // Write PID file
      await this.writePid();

      // Set up signal handlers
      this.setupSignalHandlers();

      console.log(`✅ MCP TCP Server ready on 127.0.0.1:${this.port}`);
      console.log(`📝 PID: ${Deno.pid}`);
      console.log(`🛑 Stop with: aichaku mcp --stop-server`);

      // Accept connections
      await this.acceptConnections();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      if (errorMessage.includes("Address already in use")) {
        console.error(`❌ Port ${this.port} is already in use`);
        console.error(`   Another process may be using this port`);
      } else {
        console.error("❌ Failed to start server:", errorMessage);
      }
      Deno.exit(1);
    }
  }

  private async acceptConnections(): Promise<void> {
    if (!this.server) return;

    console.log("🔄 Waiting for connections...");

    for await (const conn of this.server) {
      // Handle each connection in parallel
      this.handleClient(conn).catch((error) => {
        console.error("Client handler error:", error);
      });
    }
  }

  private async handleClient(conn: Deno.TcpConn): Promise<void> {
    const clientId = ++this.clientIdCounter;
    console.log(
      `[Client ${clientId}] Connected from ${conn.remoteAddr.hostname}:${conn.remoteAddr.port}`,
    );

    try {
      // Start a new MCP process for this client
      const mcpProcess = new Deno.Command(MCP_SERVER_PATH, {
        stdin: "piped",
        stdout: "piped",
        stderr: "piped", // Capture stderr to avoid cluttering server output
      }).spawn();

      // Store client info
      const client: ClientConnection = {
        id: clientId,
        conn,
        mcpProcess,
        active: true,
      };
      this.clients.set(clientId, client);

      // Forward stderr to console with client prefix
      this.forwardStderr(clientId, mcpProcess);

      // Set up bidirectional forwarding
      await Promise.all([
        this.forwardClientToMCP(client),
        this.forwardMCPToClient(client),
      ]);
    } catch (error) {
      console.error(
        `[Client ${clientId}] Error:`,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      this.cleanupClient(clientId);
    }
  }

  private async forwardClientToMCP(client: ClientConnection): Promise<void> {
    const reader = client.conn.readable.getReader();
    const writer = client.mcpProcess.stdin.getWriter();

    try {
      while (client.active) {
        const { done, value } = await reader.read();
        if (done) break;

        await writer.write(value);
      }
    } catch (error) {
      if (client.active) {
        console.error(
          `[Client ${client.id}] Read error:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    } finally {
      reader.releaseLock();
      writer.releaseLock();
    }
  }

  private async forwardMCPToClient(client: ClientConnection): Promise<void> {
    const reader = client.mcpProcess.stdout.getReader();

    try {
      while (client.active) {
        const { done, value } = await reader.read();
        if (done) break;

        await client.conn.write(value);
      }
    } catch (error) {
      if (client.active) {
        console.error(
          `[Client ${client.id}] Write error:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async forwardStderr(
    clientId: number,
    process: Deno.ChildProcess,
  ): Promise<void> {
    const reader = process.stderr.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        // Only show important messages, not all the startup banner
        if (text.includes("Error") || text.includes("Warning")) {
          console.error(`[Client ${clientId}]`, text.trim());
        }
      }
    } catch {
      // Ignore errors
    } finally {
      reader.releaseLock();
    }
  }

  private cleanupClient(clientId: number): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`[Client ${clientId}] Disconnected`);

    client.active = false;

    // Close connection
    try {
      client.conn.close();
    } catch {
      // Ignore
    }

    // Kill MCP process
    try {
      client.mcpProcess.kill();
    } catch {
      // Ignore
    }

    this.clients.delete(clientId);
  }

  private setupSignalHandlers(): void {
    const shutdown = () => {
      console.log("\n🛑 Shutting down MCP TCP Server...");
      this.shutdown();
    };

    Deno.addSignalListener("SIGINT", shutdown);
    Deno.addSignalListener("SIGTERM", shutdown);

    // Windows doesn't have SIGTERM, but we can handle Ctrl+C
    if (Deno.build.os === "windows") {
      // Windows will handle Ctrl+C as SIGINT
    }
  }

  private shutdown(): void {
    // Close all client connections
    for (const [clientId, client] of this.clients) {
      this.cleanupClient(clientId);
    }

    // Close server
    if (this.server) {
      this.server.close();
    }

    // Remove PID file
    try {
      Deno.removeSync(this.pidFile);
    } catch {
      // Ignore
    }

    console.log("✅ Server stopped");
    Deno.exit(0);
  }

  private async writePid(): Promise<void> {
    const dir = this.pidFile.substring(0, this.pidFile.lastIndexOf("/"));
    await Deno.mkdir(dir, { recursive: true });
    await Deno.writeTextFile(this.pidFile, Deno.pid.toString());
  }

  private async getPid(): Promise<number | null> {
    try {
      const pid = await Deno.readTextFile(this.pidFile);
      return parseInt(pid);
    } catch {
      return null;
    }
  }

  private async isRunning(): Promise<boolean> {
    const pid = await this.getPid();
    if (!pid) return false;

    try {
      // Check if process exists (works cross-platform)
      if (Deno.build.os === "windows") {
        // On Windows, we'll try to connect to the port
        const conn = await Deno.connect({ port: this.port, transport: "tcp" });
        conn.close();
        return true;
      } else {
        // On Unix, check if process exists
        await Deno.kill(pid, "SIGCONT");
        return true;
      }
    } catch {
      // Process doesn't exist or port not open
      // Clean up stale PID file
      try {
        await Deno.remove(this.pidFile);
      } catch {
        // Ignore
      }
      return false;
    }
  }
}

// Main entry point
if (import.meta.main) {
  const port = parseInt(Deno.args[0]) || DEFAULT_PORT;
  const server = new MCPTcpServer(port);
  await server.start();
}
