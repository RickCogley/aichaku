/**
 * Review command for Aichaku
 * Triggers MCP code review for specified files
 */

import { exists } from "@std/fs";
import { resolve } from "@std/path";
import { callMCPTool } from "../utils/mcp-client.ts";
import {
  getSharedMCPClient,
  isMCPServerRunning,
} from "../utils/mcp-http-client.ts";

export interface ReviewOptions {
  help?: boolean;
  file?: string;
  stats?: boolean;
}

export async function runReviewCommand(
  options: ReviewOptions,
  files: string[],
): Promise<void> {
  if (options.help) {
    showReviewHelp();
    return;
  }

  if (options.stats) {
    await showStatistics();
    return;
  }

  // Get files to review from options or arguments
  const filesToReview = options.file ? [options.file] : files;

  if (filesToReview.length === 0) {
    console.error("❌ No files specified for review");
    console.error("Usage: aichaku review <file1> [file2] ...");
    return;
  }

  // Check if HTTP server is running first
  const useHttpServer = await isMCPServerRunning();

  if (useHttpServer) {
    console.log("🌐 Using shared MCP HTTP/SSE server...\n");

    try {
      const client = await getSharedMCPClient();

      // Review each file
      for (const filePath of filesToReview) {
        const resolvedPath = resolve(filePath);

        if (!await exists(resolvedPath)) {
          console.error(`❌ File not found: ${filePath}`);
          continue;
        }

        console.log(`🪴 Reviewing ${filePath}...`);

        try {
          const result = await client.callTool("review_file", {
            file: resolvedPath,
          });

          // Extract and display the review text
          if (result && typeof result === "object" && "content" in result) {
            const content = (result as { content?: { text?: string }[] }).content;
            if (Array.isArray(content) && content[0]?.text) {
              console.log(content[0].text);
            } else {
              console.error("Unexpected response format");
            }
          } else {
            console.error("No review feedback received");
          }
        } catch (error) {
          console.error(`Error reviewing ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error(
        "❌ Failed to connect to HTTP server:",
        error instanceof Error ? error.message : String(error),
      );
      console.error("💡 Try: aichaku mcp --start-server");
    }
  } else {
    // Fall back to spawning process
    const serverPath = Deno.env.get("HOME") +
      "/.aichaku/mcp-servers/aichaku-code-reviewer";

    try {
      // Check if file exists
      await Deno.stat(serverPath);
    } catch {
      console.error("⚠️  MCP server not found");
      console.error("Run: aichaku mcp --install");
      return;
    }

    // Review each file
    for (const filePath of filesToReview) {
      const resolvedPath = resolve(filePath);

      if (!await exists(resolvedPath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }

      console.log(`🪴 Reviewing ${filePath}...`);

      try {
        const result = await callMCPTool(
          serverPath,
          "review_file",
          { file: resolvedPath },
          10000, // 10 second timeout
        );

        // Extract and display the review text
        if (result && typeof result === "object" && "content" in result) {
          const content = (result as { content?: { text?: string }[] }).content;
          if (Array.isArray(content) && content[0]?.text) {
            console.log(content[0].text);
          } else {
            console.error("Unexpected response format");
          }
        } else {
          console.error("No review feedback received");
        }
      } catch (error) {
        console.error(`Error reviewing ${filePath}:`, error);
      }
    }
  }
}

async function showStatistics(): Promise<void> {
  // Check if HTTP server is running first
  const useHttpServer = await isMCPServerRunning();

  if (useHttpServer) {
    console.log("🌐 Using shared MCP HTTP/SSE server...\n");

    try {
      const client = await getSharedMCPClient();
      const result = await client.callTool("get_statistics", {
        type: "dashboard",
      });

      // Display statistics
      if (result && typeof result === "object" && "content" in result) {
        const content = (result as { content?: { text?: string }[] }).content;
        if (Array.isArray(content) && content[0]?.text) {
          console.log(content[0].text);
        } else {
          console.error("Unexpected response format");
        }
      } else {
        console.error("No statistics received");
      }
    } catch (error) {
      console.error(
        "❌ Failed to get statistics:",
        error instanceof Error ? error.message : String(error),
      );
    }
    return;
  }

  // Fall back to spawning process
  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/aichaku-code-reviewer";

  // Send initialize first, then statistics
  const requests = [
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
        name: "get_statistics",
        arguments: {},
      },
    },
  ];

  try {
    const process = new Deno.Command(serverPath, {
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    const child = process.spawn();

    const writer = child.stdin.getWriter();

    // Send both requests
    for (const request of requests) {
      await writer.write(
        new TextEncoder().encode(JSON.stringify(request) + "\n"),
      );
    }

    writer.releaseLock();

    await child.stdin.close();

    const output = await child.output();
    const response = new TextDecoder().decode(output.stdout);

    // Parse multiple JSON responses
    const lines = response.trim().split("\n").filter((line) => line.trim());
    let statsResponse = null;

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.id === 2 && json.result?.content?.[0]?.text) {
          statsResponse = json;
        }
      } catch {
        // Skip non-JSON lines
      }
    }

    if (statsResponse) {
      console.log(statsResponse.result.content[0].text);
    } else {
      console.error("Failed to get statistics");
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
  }
}

function showReviewHelp(): void {
  console.log(`
🪴 Aichaku Review - Automated code review via MCP

Triggers security and standards review for specified files using the 
Aichaku MCP server.

Usage:
  aichaku review <file1> [file2] ...
  aichaku review --file <path>
  aichaku review --stats

Options:
  --file <path>  Review a specific file
  --stats        Show review statistics for current session
  --help         Show this help message

Examples:
  # Review a single file
  aichaku review src/main.ts

  # Review multiple files
  aichaku review src/main.ts src/utils.ts README.md

  # Review using option syntax
  aichaku review --file src/main.ts

  # Show session statistics
  aichaku review --stats

Note: The MCP server must be running. Start it with:
  aichaku mcp --start
`);
}
