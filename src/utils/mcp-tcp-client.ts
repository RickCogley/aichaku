/**
 * MCP TCP Client - Cross-platform client that connects to MCP server via TCP
 * Works on Windows, macOS, and Linux
 */

import type { MCPRequest, MCPResponse } from "./mcp-client.ts";

export interface MCPClientConfig {
  host?: string;
  port?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: Required<MCPClientConfig> = {
  host: "127.0.0.1",
  port: 7182, // AICHAKU on phone keypad: 724-2258 -> 7182
  timeout: 30000,
};

export class MCPTcpClient {
  private socket?: Deno.TcpConn;
  private requestId = 0;
  private responseHandlers = new Map<number, {
    resolve: (response: MCPResponse) => void;
    reject: (error: Error) => void;
    timeout: number;
  }>();
  private buffer = "";
  private initialized = false;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private config: Required<MCPClientConfig>;

  constructor(config: MCPClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    try {
      this.socket = await Deno.connect({
        hostname: this.config.host,
        port: this.config.port,
        transport: "tcp",
      });

      // Start reading responses
      this.startResponseReader();

      // Initialize the connection
      await this.initialize();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Connection refused")) {
        throw new Error(
          `MCP server not running on ${this.config.host}:${this.config.port}. ` +
            `Run 'aichaku mcp --server-start' first.`,
        );
      }
      throw new Error(`Failed to connect to MCP server: ${errorMessage}`);
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
      const requestId = request.id;

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (this.responseHandlers.has(requestId)) {
          this.responseHandlers.delete(requestId);
          reject(new Error(`Request timeout after ${this.config.timeout}ms`));
        }
      }, this.config.timeout);

      // Store handlers for this request ID
      this.responseHandlers.set(requestId, {
        resolve,
        reject,
        timeout: timeoutId,
      });

      // Send the request
      const data = JSON.stringify(request) + "\n";
      const encoded = new TextEncoder().encode(data);

      this.socket!.write(encoded).catch((error) => {
        const handler = this.responseHandlers.get(requestId);
        if (handler) {
          clearTimeout(handler.timeout);
          this.responseHandlers.delete(requestId);
        }
        reject(error);
      });
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
      await this.connect();
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

    this.reader = this.socket.readable.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await this.reader.read();
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
                clearTimeout(handler.timeout);
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
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes("BadResource")) {
        console.error("MCP socket reader error:", error);
      }
    } finally {
      this.reader?.releaseLock();
    }
  }

  /**
   * Close the connection
   */
  close(): void {
    // Cancel all pending requests
    for (const [_id, handler] of this.responseHandlers) {
      clearTimeout(handler.timeout);
      handler.reject(new Error("Connection closed"));
    }
    this.responseHandlers.clear();

    // Close socket
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // Ignore close errors
      }
      this.socket = undefined;
    }

    this.initialized = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.initialized && this.socket !== undefined;
  }
}

/**
 * Shared client instance for reuse
 */
let sharedClient: MCPTcpClient | null = null;

/**
 * Get or create a shared MCP client
 */
export async function getSharedMCPClient(
  config?: MCPClientConfig,
): Promise<MCPTcpClient> {
  if (!sharedClient || !sharedClient.isConnected()) {
    sharedClient = new MCPTcpClient(config);
    await sharedClient.connect();
  }
  return sharedClient;
}

/**
 * Close shared client
 */
export function closeSharedClient(): void {
  if (sharedClient) {
    sharedClient.close();
    sharedClient = null;
  }
}

/**
 * Check if MCP server is running
 */
export async function isMCPServerRunning(
  config?: MCPClientConfig,
): Promise<boolean> {
  const { host, port } = { ...DEFAULT_CONFIG, ...config };

  try {
    const conn = await Deno.connect({
      hostname: host,
      port: port,
    });
    conn.close();
    return true;
  } catch {
    return false;
  }
}
