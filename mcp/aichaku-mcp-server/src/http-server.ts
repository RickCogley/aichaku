#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net
/**
 * MCP HTTP/SSE Server - JSON-RPC over HTTP with Server-Sent Events
 * Cross-platform, firewall-friendly, network-capable MCP server
 */

import { serve } from "https://deno.land/std@0.220.0/http/server.ts";

const DEFAULT_PORT = 7182; // AICHAKU on phone keypad
const MCP_SERVER_PATH = `${
  Deno.env.get("HOME") || Deno.env.get("USERPROFILE")
}/.aichaku/mcp-servers/aichaku-code-reviewer`;

interface MCPSession {
  id: string;
  process: Deno.ChildProcess;
  initialized: boolean;
  lastActivity: number;
}

class MCPHttpServer {
  private sessions = new Map<string, MCPSession>();
  private pidFile: string;

  constructor(private port: number = DEFAULT_PORT) {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || ".";
    this.pidFile = `${homeDir}/.aichaku/aichaku-mcp-http-bridge-server.pid`;
  }

  async start(): Promise<void> {
    // Check if already running
    if (await this.isRunning()) {
      console.log("❌ MCP HTTP server is already running");
      const pid = await this.getPid();
      if (pid) {
        console.log(`   PID: ${pid}`);
      }
      return;
    }

    // Write PID file
    await this.writePid();

    // Set up signal handlers
    this.setupSignalHandlers();

    // Start cleanup interval (remove inactive sessions)
    setInterval(() => this.cleanupSessions(), 60000); // Every minute

    console.log(`🚀 MCP HTTP/SSE Server starting on port ${this.port}...`);

    // Start HTTP server
    await serve(
      (req) => this.handleRequest(req),
      {
        port: this.port,
        onListen: ({ hostname, port }) => {
          console.log(
            `✅ MCP HTTP/SSE Server ready on http://${hostname}:${port}`,
          );
          console.log(`📝 PID: ${Deno.pid}`);
          console.log(`🛑 Stop with: aichaku mcp --server-stop`);
          console.log(`\nEndpoints:`);
          console.log(`  POST   /rpc        - Send JSON-RPC requests`);
          console.log(`  GET    /sse        - Server-Sent Events stream`);
          console.log(`  GET    /health     - Health check`);
          console.log(`  DELETE /session    - Close session`);
        },
      },
    );
  }

  private async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // CORS headers for browser clients
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Session-ID",
    };

    // Handle preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (url.pathname) {
        case "/health":
          return new Response(
            JSON.stringify({
              status: "ok",
              sessions: this.sessions.size,
              pid: Deno.pid,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );

        case "/rpc":
          if (req.method !== "POST") {
            return new Response("Method not allowed", {
              status: 405,
              headers: corsHeaders,
            });
          }
          return await this.handleRPC(req, corsHeaders);

        case "/sse":
          if (req.method !== "GET") {
            return new Response("Method not allowed", {
              status: 405,
              headers: corsHeaders,
            });
          }
          return this.handleSSE(req, corsHeaders);

        case "/session":
          if (req.method === "DELETE") {
            return this.handleCloseSession(req, corsHeaders);
          }
          return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
          });

        default:
          return new Response("Not found", {
            status: 404,
            headers: corsHeaders,
          });
      }
    } catch (error) {
      console.error("Request error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  private async handleRPC(
    req: Request,
    corsHeaders: Record<string, string>,
  ): Promise<Response> {
    const sessionId = req.headers.get("X-Session-ID") || crypto.randomUUID();
    const session = await this.getOrCreateSession(sessionId);

    try {
      const request = await req.json();

      // Send request to MCP process
      const writer = session.process.stdin.getWriter();
      await writer.write(
        new TextEncoder().encode(JSON.stringify(request) + "\n"),
      );
      writer.releaseLock();

      // Update activity
      session.lastActivity = Date.now();

      // For HTTP/SSE, we return session ID immediately
      // The response will come through SSE
      return new Response(
        JSON.stringify({
          sessionId,
          message: "Request sent, response will arrive via SSE",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
          },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  private handleSSE(
    req: Request,
    corsHeaders: Record<string, string>,
  ): Response {
    const sessionId = req.headers.get("X-Session-ID");
    if (!sessionId) {
      return new Response("Session ID required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return new Response("Session not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection event
        controller.enqueue(
          encoder.encode(
            `event: connected\ndata: {"sessionId":"${sessionId}"}\n\n`,
          ),
        );

        // Read from MCP stdout
        const reader = session.process.stdout.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim()) {
                // Send as SSE event
                controller.enqueue(
                  encoder.encode(`event: message\ndata: ${line}\n\n`),
                );
              }
            }
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${
                JSON.stringify({
                  error: error instanceof Error ? error.message : String(error),
                })
              }\n\n`,
            ),
          );
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  private handleCloseSession(
    req: Request,
    corsHeaders: Record<string, string>,
  ): Response {
    const sessionId = req.headers.get("X-Session-ID");
    if (!sessionId) {
      return new Response("Session ID required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (this.closeSession(sessionId)) {
      return new Response(JSON.stringify({ message: "Session closed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response("Session not found", {
        status: 404,
        headers: corsHeaders,
      });
    }
  }

  private getOrCreateSession(sessionId: string): MCPSession {
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Start new MCP process
      const process = new Deno.Command(MCP_SERVER_PATH, {
        stdin: "piped",
        stdout: "piped",
        stderr: "piped",
      }).spawn();

      session = {
        id: sessionId,
        process,
        initialized: false,
        lastActivity: Date.now(),
      };

      this.sessions.set(sessionId, session);
      console.log(`[Session ${sessionId}] Created new MCP process`);
    }

    return session;
  }

  private closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    try {
      session.process.kill();
    } catch {
      // Ignore
    }

    this.sessions.delete(sessionId);
    console.log(`[Session ${sessionId}] Closed`);
    return true;
  }

  private cleanupSessions(): void {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > timeout) {
        console.log(`[Session ${sessionId}] Cleaning up inactive session`);
        this.closeSession(sessionId);
      }
    }
  }

  private setupSignalHandlers(): void {
    const shutdown = () => {
      console.log("\n🛑 Shutting down MCP HTTP Server...");
      this.shutdown();
    };

    Deno.addSignalListener("SIGINT", shutdown);
    Deno.addSignalListener("SIGTERM", shutdown);
  }

  private shutdown(): void {
    // Close all sessions
    for (const sessionId of this.sessions.keys()) {
      this.closeSession(sessionId);
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
      // Try to connect to the HTTP server
      const response = await fetch(`http://127.0.0.1:${this.port}/health`);
      await response.text();
      return true;
    } catch {
      // Server not responding, clean up PID file
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
  const server = new MCPHttpServer(port);
  await server.start();
}
