/**
 * MCP HTTP Client with polling - Works in Deno without EventSource
 * Cross-platform client that works everywhere
 */

import type { MCPRequest, MCPResponse } from "./mcp-client.ts";

export interface MCPHttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  pollInterval?: number;
}

const DEFAULT_CONFIG: Required<MCPHttpClientConfig> = {
  baseUrl: "http://127.0.0.1:7182",
  timeout: 30000,
  pollInterval: 100, // Poll every 100ms for responses
};

export class MCPHttpClient {
  private sessionId?: string;
  private responseQueue: MCPResponse[] = [];
  private responseHandlers = new Map<number, {
    resolve: (response: MCPResponse) => void;
    reject: (error: Error) => void;
    timeout: number;
  }>();
  private requestId = 0;
  private initialized = false;
  private config: Required<MCPHttpClientConfig>;
  private polling = false;
  private pollController?: AbortController;

  constructor(config: MCPHttpClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    try {
      // Check server health
      const healthResponse = await fetch(`${this.config.baseUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error("MCP server is not healthy");
      }

      // Get or create session
      this.sessionId = crypto.randomUUID();

      // Start polling for responses
      this.startPolling();

      // Initialize MCP session
      await this.initialize();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        throw new Error(
          `MCP server not running at ${this.config.baseUrl}. ` +
            `Run 'aichaku mcp --start-server' first.`,
        );
      }
      throw error;
    }
  }

  /**
   * Start polling for responses
   */
  private startPolling(): void {
    if (this.polling) return;

    this.polling = true;
    this.pollController = new AbortController();

    // Run polling in background
    this.pollResponses().catch((error) => {
      console.error("Polling error:", error);
      this.polling = false;
    });
  }

  /**
   * Poll for responses using long polling
   */
  private async pollResponses(): Promise<void> {
    while (this.polling && this.sessionId) {
      try {
        // Use SSE endpoint but read as text stream
        const response = await fetch(`${this.config.baseUrl}/sse`, {
          headers: {
            "X-Session-ID": this.sessionId,
          },
          signal: this.pollController?.signal,
        });

        if (!response.ok) {
          throw new Error(`Polling error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) continue;

        const decoder = new TextDecoder();
        let buffer = "";

        while (this.polling) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data.trim()) {
                try {
                  const response = JSON.parse(data) as MCPResponse;
                  this.handleResponse(response);
                } catch (error) {
                  console.error("Failed to parse response:", error);
                }
              }
            }
          }
        }

        reader.releaseLock();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") break;

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Handle incoming response
   */
  private handleResponse(response: MCPResponse): void {
    const handler = this.responseHandlers.get(response.id);
    if (handler) {
      clearTimeout(handler.timeout);
      this.responseHandlers.delete(response.id);
      handler.resolve(response);
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
   * Send a request via HTTP POST
   */
  sendRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.sessionId) {
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

      // Store handler
      this.responseHandlers.set(requestId, {
        resolve,
        reject,
        timeout: timeoutId,
      });

      // Send request via HTTP POST (async operation)
      fetch(`${this.config.baseUrl}/rpc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": this.sessionId!,
        },
        body: JSON.stringify(request),
      }).then(async (response) => {
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`HTTP error ${response.status}: ${error}`);
        }
        // Response will come via polling
      }).catch((error) => {
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
   * Close the connection
   */
  async close(): Promise<void> {
    // Stop polling
    this.polling = false;
    this.pollController?.abort();

    // Cancel all pending requests
    for (const [_id, handler] of this.responseHandlers) {
      clearTimeout(handler.timeout);
      handler.reject(new Error("Client closing"));
    }
    this.responseHandlers.clear();

    // Close session on server
    if (this.sessionId) {
      try {
        await fetch(`${this.config.baseUrl}/session`, {
          method: "DELETE",
          headers: {
            "X-Session-ID": this.sessionId,
          },
        });
      } catch {
        // Ignore errors when closing
      }
    }

    this.initialized = false;
    this.sessionId = undefined;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.initialized && this.polling;
  }
}

/**
 * Shared client instance
 */
let sharedClient: MCPHttpClient | null = null;

/**
 * Get or create a shared MCP client
 */
export async function getSharedMCPClient(
  config?: MCPHttpClientConfig,
): Promise<MCPHttpClient> {
  if (!sharedClient || !sharedClient.isConnected()) {
    sharedClient = new MCPHttpClient(config);
    await sharedClient.connect();
  }
  return sharedClient;
}

/**
 * Close shared client
 */
export async function closeSharedClient(): Promise<void> {
  if (sharedClient) {
    await sharedClient.close();
    sharedClient = null;
  }
}

/**
 * Check if MCP server is running
 */
export async function isMCPServerRunning(
  config?: MCPHttpClientConfig,
): Promise<boolean> {
  const { baseUrl } = { ...DEFAULT_CONFIG, ...config };

  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
