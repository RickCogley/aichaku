/**
 * MCP Client utilities for communicating with MCP servers
 */

export interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Send requests to an MCP server and get responses
 */
export async function sendMCPRequests(
  serverPath: string,
  requests: MCPRequest[],
  timeoutMs: number = 5000,
): Promise<MCPResponse[]> {
  const process = new Deno.Command(serverPath, {
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const child = process.spawn();

  // Send all requests
  const writer = child.stdin.getWriter();
  for (const request of requests) {
    await writer.write(
      new TextEncoder().encode(JSON.stringify(request) + "\n"),
    );
  }
  writer.releaseLock();
  await child.stdin.close();

  // Set up timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => { // DevSkim: ignore DS172411
      child.kill();
      reject(new Error(`MCP server timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    // Wait for output or timeout
    const output = await Promise.race([
      child.output(),
      timeoutPromise,
    ]);

    // Parse responses
    const stdout = new TextDecoder().decode(output.stdout);
    const lines = stdout.trim().split("\n").filter((line) => line.trim());

    const responses: MCPResponse[] = [];
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.jsonrpc === "2.0") {
          responses.push(json);
        }
      } catch {
        // Skip non-JSON lines
      }
    }

    return responses;
  } catch (error) {
    // Make sure process is killed on error
    try {
      child.kill();
    } catch {
      // Ignore kill errors
    }
    throw error;
  }
}

/**
 * Initialize an MCP server and call a tool
 */
export async function callMCPTool(
  serverPath: string,
  toolName: string,
  args: Record<string, unknown>,
  timeoutMs: number = 5000,
): Promise<unknown> {
  const requests: MCPRequest[] = [
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "0.1.0",
        capabilities: {},
        clientInfo: {
          name: "aichaku-cli",
          version: "0.24.2",
        },
      },
    },
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    },
  ];

  const responses = await sendMCPRequests(serverPath, requests, timeoutMs);

  // Find the tool response
  const toolResponse = responses.find((r) => r.id === 2);
  if (!toolResponse) {
    throw new Error("No response from MCP tool");
  }

  if (toolResponse.error) {
    throw new Error(`MCP error: ${toolResponse.error.message}`);
  }

  return toolResponse.result;
}
