#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env

/**
 * Simple test for MCP server to verify it's working
 * Tests basic JSON-RPC communication
 */

import { resolve } from "@std/path";

async function testMCPReview() {
  console.log("Simple MCP Server Test\n");

  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/aichaku-code-reviewer";
  const testFilePath = resolve("test-review_test.ts");

  console.log("Testing review of:", testFilePath);
  console.log("Server path:", serverPath);

  // Create a single JSON-RPC request that initializes and calls review
  const requests = [
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "0.1.0",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0",
        },
      },
    },
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "review_file",
        arguments: {
          file: testFilePath,
          includeExternal: false,
        },
      },
    },
  ];

  // Run server with all requests at once
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

  // Wait for completion
  const output = await child.output();

  // Show server output (stderr)
  const stderr = new TextDecoder().decode(output.stderr);
  if (stderr) {
    console.log("\n=== Server Output ===");
    console.log(stderr);
  }

  // Parse responses (stdout)
  const stdout = new TextDecoder().decode(output.stdout);
  if (stdout) {
    console.log("\n=== Responses ===");
    const lines = stdout.trim().split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const response = JSON.parse(line);

        if (response.id === 2 && response.result?.content?.[0]?.text) {
          console.log("\n=== Review Result ===");
          console.log(response.result.content[0].text);
        } else {
          console.log("Response:", JSON.stringify(response, null, 2));
        }
      } catch (_e) {
        console.log("Raw line:", line);
      }
    }
  }

  if (!output.success) {
    console.error("\nServer exited with error code:", output.code);
  }
}

// Run test
if (import.meta.main) {
  await testMCPReview();
}
