/**
 * MCP Socket Client - Connects to a running MCP server via Unix socket
 * This allows multiple clients to share a single MCP server instance
 */

import type { MCPRequest, MCPResponse } from "./mcp-client.ts";

export class MCPSocketClient {
  private socket?: Deno.UnixConn;
  private requestId = 0;
  private responseHandlers = new Map<number, {
    resolve: (response: MCPResponse) => void;
    reject: (error: Error) => void;
  }>();
  private buffer = "";
  private initialized = false;

  constructor(private socketPath: string) {}

  /**
   * Connect to the MCP server socket
   */
  async connect(): Promise<void> {
    try {
      this.socket = await Deno.connect({
        path: this.socketPath,
        transport: "unix",
      } as Deno.UnixConnectOptions);

      // Start reading responses
      this.startResponseReader();

      // Initialize the connection
      await this.initialize();
    } catch (error) {
      throw new Error(
        `Failed to connect to MCP server: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Initialize the MCP session
   */
  private async initialize(): Promise<void> {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: ++this.requestId,
      method: "initialize",
      params: {
        protocolVersion: "0.1.0",
        capabilities: {},
        clientInfo: {
          name: "aichaku-cli",
          version: "0.24.2",
        },
      },
    });

    if (response.error) {
      throw new Error(`Failed to initialize MCP: ${response.error.message}`);
    }

    this.initialized = true;
  }

  /**
   * Send a request and wait for response
   */
  sendRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.socket) {
      throw new Error("Not connected to MCP server");
    }

    return new Promise((resolve, reject) => {
      // Store handlers for this request ID
      this.responseHandlers.set(request.id, { resolve, reject });

      // Send the request
      const data = JSON.stringify(request) + "\n";
      const encoded = new TextEncoder().encode(data);

      this.socket!.write(encoded).catch((error) => {
        this.responseHandlers.delete(request.id);
        reject(error);
      });

      // Set timeout
      setTimeout(() => {
        if (this.responseHandlers.has(request.id)) {
          this.responseHandlers.delete(request.id);
          reject(new Error("Request timeout"));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Call an MCP tool
   */
  async callTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.initialized) {
      throw new Error("MCP client not initialized");
    }

    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: ++this.requestId,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    });

    if (response.error) {
      throw new Error(`Tool error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Read responses from the socket
   */
  private async startResponseReader(): Promise<void> {
    if (!this.socket) return;

    const reader = this.socket.readable.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        this.buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line) as MCPResponse;
              const handler = this.responseHandlers.get(response.id);
              if (handler) {
                this.responseHandlers.delete(response.id);
                handler.resolve(response);
              }
            } catch (error) {
              console.error("Failed to parse MCP response:", error);
            }
          }
        }
      }
    } catch (error) {
      // Connection closed or error
      console.error("MCP socket reader error:", error);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Close the connection
   */
  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }

    // Reject any pending requests
    for (const [id, handler] of this.responseHandlers) {
      handler.reject(new Error("Connection closed"));
    }
    this.responseHandlers.clear();
  }
}

/**
 * Global MCP client instance
 */
let globalClient: MCPSocketClient | null = null;

/**
 * Get or create a shared MCP client
 */
export async function getSharedMCPClient(): Promise<MCPSocketClient> {
  const socketPath = `${Deno.env.get("HOME")}/.aichaku/mcp-server.sock`;

  if (!globalClient) {
    globalClient = new MCPSocketClient(socketPath);
    try {
      await globalClient.connect();
    } catch (error) {
      globalClient = null;
      throw error;
    }
  }

  return globalClient;
}

/**
 * Check if MCP server is running by checking if socket exists
 */
export async function isMCPServerRunning(): Promise<boolean> {
  const socketPath = `${Deno.env.get("HOME")}/.aichaku/mcp-server.sock`;
  try {
    await Deno.stat(socketPath);
    return true;
  } catch {
    return false;
  }
}
