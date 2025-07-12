#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env

/**
 * Test script for MCP server JSON-RPC communication
 * Tests the Aichaku MCP server by sending proper JSON-RPC requests
 */

import { resolve } from "@std/path";

// Helper to send JSON-RPC request to MCP server
async function sendMCPRequest(request: unknown): Promise<unknown> {
  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/aichaku-code-reviewer";

  const process = new Deno.Command(serverPath, {
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const child = process.spawn();

  // Write request
  const writer = child.stdin.getWriter();
  await writer.write(
    new TextEncoder().encode(JSON.stringify(request) + "\n"),
  );
  writer.releaseLock();
  await child.stdin.close();

  // Read response with timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout waiting for response")), 5000);
  });

  try {
    const output = await Promise.race([
      child.output(),
      timeoutPromise,
    ]) as Deno.CommandOutput;

    // Read stderr for debug info
    const stderr = new TextDecoder().decode(output.stderr);
    if (stderr) {
      console.log("MCP Server output:");
      console.log(stderr);
    }

    // Parse stdout for JSON-RPC response
    const stdout = new TextDecoder().decode(output.stdout);
    if (!stdout.trim()) {
      throw new Error("No response from server");
    }

    // The response might have multiple JSON objects, get the last one
    const jsonLines = stdout.trim().split("\n").filter((line) => line.trim());
    const lastLine = jsonLines[jsonLines.length - 1];

    return JSON.parse(lastLine);
  } catch (error) {
    console.error("Error communicating with MCP server:", error);
    throw error;
  }
}

async function testMCPServer() {
  console.log("Testing Aichaku MCP Server JSON-RPC Communication\n");

  // Test 1: Initialize
  console.log("1. Testing initialize request...");
  try {
    const initRequest = {
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
    };

    const initResponse = await sendMCPRequest(initRequest);
    console.log(
      "✅ Initialize response:",
      JSON.stringify(initResponse, null, 2),
    );
  } catch (error) {
    console.error("❌ Initialize failed:", error);
  }

  // Test 2: List tools
  console.log("\n2. Testing tools/list request...");
  try {
    const listRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    };

    const listResponse = await sendMCPRequest(listRequest);
    console.log(
      "✅ Tools list response:",
      JSON.stringify(listResponse, null, 2),
    );
  } catch (error) {
    console.error("❌ List tools failed:", error);
  }

  // Test 3: Review file
  console.log("\n3. Testing review_file tool...");
  try {
    const testFilePath = resolve("test-review.ts");

    const reviewRequest = {
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
    };

    console.log("Sending review request for:", testFilePath);
    const reviewResponse = await sendMCPRequest(reviewRequest);
    console.log("✅ Review response:", JSON.stringify(reviewResponse, null, 2));

    // Extract and display the formatted result
    if (
      reviewResponse && typeof reviewResponse === "object" &&
      "result" in reviewResponse
    ) {
      const result = (reviewResponse as { result?: { content?: { text?: string }[] } }).result;
      if (result?.content?.[0]?.text) {
        console.log("\n📄 Formatted Review Result:");
        console.log(result.content[0].text);
      }
    }
  } catch (error) {
    console.error("❌ Review file failed:", error);
  }

  // Test 4: Get statistics
  console.log("\n4. Testing get_statistics tool...");
  try {
    const statsRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_statistics",
        arguments: {
          type: "dashboard",
        },
      },
    };

    const statsResponse = await sendMCPRequest(statsRequest);
    console.log(
      "✅ Statistics response:",
      JSON.stringify(statsResponse, null, 2),
    );
  } catch (error) {
    console.error("❌ Get statistics failed:", error);
  }
}

// Run tests
if (import.meta.main) {
  await testMCPServer();
}
