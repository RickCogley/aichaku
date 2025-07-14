#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

/**
 * Example of using the send_feedback MCP tool
 * 
 * This demonstrates how hooks can send visible feedback messages
 * to Claude Code using the Aichaku MCP server.
 */

import { MCPClient } from "../scripts/mcp-client.ts";

// Extended MCPClient for Aichaku server
class AichakuMCPClient extends MCPClient {
  constructor() {
    super("aichaku");
  }

  /**
   * Send a feedback message that will appear in Claude Code console
   */
  async sendFeedback(message: string, level: "info" | "success" | "warning" | "error" = "info") {
    return await this.callTool("send_feedback", {
      message,
      level,
    });
  }
}

// Example usage
async function demonstrateFeedback() {
  const client = new AichakuMCPClient();
  
  try {
    console.log("Connecting to Aichaku MCP server...");
    await client.connect();
    
    // Send different types of feedback messages
    console.log("Sending feedback messages...");
    
    await client.sendFeedback("Hook execution started", "info");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await client.sendFeedback("Code review completed successfully", "success");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await client.sendFeedback("Potential security issue detected in login.ts", "warning");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await client.sendFeedback("Critical OWASP violation found - immediate attention required", "error");
    
    console.log("All feedback messages sent!");
    
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
  } finally {
    await client.disconnect();
  }
}

// Hook simulation function
async function simulateCodeReviewHook(filePath: string) {
  const client = new AichakuMCPClient();
  
  try {
    await client.connect();
    
    // Simulate hook feedback
    await client.sendFeedback(`🔍 Starting code review for ${filePath}`, "info");
    
    // Simulate security check
    if (filePath.includes("auth") || filePath.includes("login")) {
      await client.sendFeedback("🔒 Performing enhanced security checks for authentication code", "info");
      
      // Simulate finding an issue
      if (Math.random() > 0.7) {
        await client.sendFeedback("⚠️ Hardcoded credential detected - please use environment variables", "warning");
      } else {
        await client.sendFeedback("✅ Security checks passed", "success");
      }
    }
    
    // Simulate OWASP check
    await client.sendFeedback("🛡️ OWASP Top 10 compliance verified", "success");
    
    // Simulate completion
    await client.sendFeedback("📋 Code review completed - ready for commit", "success");
    
  } catch (error) {
    await client.sendFeedback(`❌ Code review failed: ${error instanceof Error ? error.message : String(error)}`, "error");
  } finally {
    await client.disconnect();
  }
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args;
  
  if (args.length === 0) {
    console.log(`
Send Feedback Example Tool

Usage:
  deno run -A examples/send-feedback-example.ts demo                    - Basic demonstration
  deno run -A examples/send-feedback-example.ts hook <file-path>        - Simulate hook feedback
  deno run -A examples/send-feedback-example.ts message <text> [level]  - Send single message

Examples:
  deno run -A examples/send-feedback-example.ts demo
  deno run -A examples/send-feedback-example.ts hook "src/auth/login.ts"
  deno run -A examples/send-feedback-example.ts message "Test complete" success
`);
    Deno.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case "demo":
      await demonstrateFeedback();
      break;
      
    case "hook":
      if (args.length < 2) {
        console.error("Usage: hook <file-path>");
        Deno.exit(1);
      }
      await simulateCodeReviewHook(args[1]);
      break;
      
    case "message":
      if (args.length < 2) {
        console.error("Usage: message <text> [level]");
        Deno.exit(1);
      }
      const client = new AichakuMCPClient();
      try {
        await client.connect();
        const level = args[2] as "info" | "success" | "warning" | "error" || "info";
        await client.sendFeedback(args[1], level);
        console.log("Message sent!");
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : String(error));
      } finally {
        await client.disconnect();
      }
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      Deno.exit(1);
  }
}