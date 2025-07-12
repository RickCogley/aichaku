#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env

/**
 * Test MCP server with persistent connection
 * Simulates how Claude Desktop communicates with MCP servers
 */

import { resolve } from "@std/path";
import { TextLineStream } from "https://deno.land/std@0.224.0/streams/text_line_stream.ts";

async function testMCPServer() {
  console.log("Testing Aichaku MCP Server with Persistent Connection\n");

  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/aichaku-code-reviewer";

  console.log("Starting MCP server at:", serverPath);

  const process = new Deno.Command(serverPath, {
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const child = process.spawn();

  // Set up stderr reader to see server output
  const stderrReader = child.stderr.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  // Read stderr in background
  (async () => {
    for await (const line of stderrReader) {
      console.log("[SERVER]", line);
    }
  })();

  // Set up stdout reader for JSON-RPC responses
  const stdoutReader = child.stdout.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  // Get writer for sending requests
  const writer = child.stdin.getWriter();

  // Helper to send request and get response
  async function sendRequest(request: unknown): Promise<unknown> {
    console.log("\n→ Sending:", JSON.stringify(request));

    await writer.write(
      new TextEncoder().encode(JSON.stringify(request) + "\n"),
    );

    // Read response
    const responseIterator = stdoutReader[Symbol.asyncIterator]();
    const { value } = await responseIterator.next();

    if (!value) {
      throw new Error("No response received");
    }

    console.log("← Received:", value);
    return JSON.parse(value);
  }

  try {
    // Wait a bit for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 1: Initialize
    console.log("\n1. Testing initialize...");
    const _initResponse = await sendRequest({
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
    });
    console.log("✅ Initialize successful");

    // Test 2: List tools
    console.log("\n2. Testing tools/list...");
    const listResponse = await sendRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });
    console.log(
      "✅ Got",
      (listResponse as { result?: { tools?: unknown[] } }).result?.tools
        ?.length || 0,
      "tools",
    );

    // Test 3: Review file
    console.log("\n3. Testing review_file...");
    const testFilePath = resolve("test-review.ts");
    const reviewResponse = await sendRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "review_file",
        arguments: {
          file: testFilePath,
          includeExternal: false,
        },
      },
    });

    const reviewResult =
      (reviewResponse as { result?: { content?: { text?: string }[] } }).result;
    if (reviewResult?.content?.[0]?.text) {
      console.log("\n📄 Review Result:");
      console.log(reviewResult.content[0].text);
    }

    // Test 4: Get statistics
    console.log("\n4. Testing get_statistics...");
    const _statsResponse = await sendRequest({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_statistics",
        arguments: {
          type: "dashboard",
        },
      },
    });
    console.log("✅ Got statistics");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    // Clean up
    writer.releaseLock();
    await child.stdin.close();
    child.kill();
  }
}

// Run test
if (import.meta.main) {
  await testMCPServer();
}
