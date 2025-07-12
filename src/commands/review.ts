/**
 * Review command for Aichaku
 * Triggers MCP code review for specified files
 */

import { exists } from "@std/fs";
import { resolve } from "@std/path";

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

  // Check if MCP server is running
  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/aichaku-code-reviewer";

  try {
    // Try to check if server is responding
    const checkRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        capabilities: {},
      },
    };

    const process = new Deno.Command(serverPath, {
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    const child = process.spawn();

    const writer = child.stdin.getWriter();
    await writer.write(
      new TextEncoder().encode(JSON.stringify(checkRequest) + "\n"),
    );
    writer.releaseLock();

    // Close stdin to signal we're done
    await child.stdin.close();

    const output = await child.output();
    if (!output.success) {
      console.error(
        "⚠️  MCP server not responding. Please start it with: aichaku mcp --start",
      );
      return;
    }
  } catch (_error) {
    console.error("⚠️  MCP server not found or not running");
    console.error("Run: aichaku mcp --install && aichaku mcp --start");
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

    const reviewRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "review_file",
        arguments: {
          file: resolvedPath,
        },
      },
    };

    try {
      const process = new Deno.Command(serverPath, {
        stdin: "piped",
        stdout: "piped",
        stderr: "piped",
      });

      const child = process.spawn();

      const writer = child.stdin.getWriter();
      await writer.write(
        new TextEncoder().encode(JSON.stringify(reviewRequest) + "\n"),
      );
      writer.releaseLock();

      // Close stdin
      await child.stdin.close();

      const output = await child.output();
      const response = new TextDecoder().decode(output.stdout);

      // Parse and display the response
      try {
        const jsonResponse = JSON.parse(response);
        if (jsonResponse.result?.content?.[0]?.text) {
          console.log(jsonResponse.result.content[0].text);
        } else {
          console.log("No review feedback received");
        }
      } catch (_parseError) {
        console.error("Failed to parse review response");
      }
    } catch (error) {
      console.error(`Error reviewing ${filePath}:`, error);
    }
  }
}

async function showStatistics(): Promise<void> {
  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/aichaku-code-reviewer";

  const statsRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "get_statistics",
      arguments: {},
    },
  };

  try {
    const process = new Deno.Command(serverPath, {
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });

    const child = process.spawn();

    const writer = child.stdin.getWriter();
    await writer.write(
      new TextEncoder().encode(JSON.stringify(statsRequest) + "\n"),
    );
    writer.releaseLock();

    await child.stdin.close();

    const output = await child.output();
    const response = new TextDecoder().decode(output.stdout);

    try {
      const jsonResponse = JSON.parse(response);
      if (jsonResponse.result?.content?.[0]?.text) {
        console.log(jsonResponse.result.content[0].text);
      }
    } catch (_parseError) {
      console.error("Failed to parse statistics response");
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
