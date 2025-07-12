#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run

/**
 * Standalone MCP Client for build scripts
 * Communicates with GitHub MCP server for deterministic operations
 */

import { join } from "@std/path";

export interface MCPRequest {
  method: string;
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class MCPClient {
  private serverProcess?: Deno.ChildProcess;
  private serverPath: string;

  constructor(serverType: "github" | "aichaku") {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) {
      throw new Error("Could not determine home directory");
    }

    const platform = Deno.build.os;
    const ext = platform === "windows" ? ".exe" : "";
    const serverName = serverType === "github"
      ? "github-operations"
      : "aichaku-code-reviewer";

    this.serverPath = join(
      homeDir,
      ".aichaku",
      "mcp-servers",
      `${serverName}${ext}`,
    );
  }

  async connect(): Promise<void> {
    // Check if server binary exists
    try {
      await Deno.stat(this.serverPath);
    } catch {
      throw new Error(
        `MCP server binary not found at ${this.serverPath}. Run 'aichaku mcp --install' first.`,
      );
    }

    // Start the MCP server
    this.serverProcess = new Deno.Command(this.serverPath, {
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    // Wait a moment for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async disconnect(): Promise<void> {
    if (this.serverProcess) {
      this.serverProcess.kill();
      await this.serverProcess.status;
      this.serverProcess = undefined;
    }
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<MCPResponse> {
    if (!this.serverProcess) {
      throw new Error("MCP client not connected. Call connect() first.");
    }

    const request: MCPRequest = {
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    };

    const requestJson = JSON.stringify(request) + "\n";

    // Send request
    const writer = this.serverProcess.stdin.getWriter();
    await writer.write(new TextEncoder().encode(requestJson));
    writer.releaseLock();

    // Read response
    const reader = this.serverProcess.stdout.getReader();
    const { value } = await reader.read();
    reader.releaseLock();

    if (!value) {
      throw new Error("No response from MCP server");
    }

    const responseText = new TextDecoder().decode(value);
    const response = JSON.parse(responseText);

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result;
  }

  // GitHub-specific convenience methods
  async uploadReleaseAssets(
    owner: string,
    repo: string,
    tag: string,
    assets: string[],
    overwrite = true,
  ): Promise<MCPResponse> {
    return await this.callTool("release_upload", {
      owner,
      repo,
      tag,
      assets,
      overwrite,
    });
  }

  async getAuthStatus(): Promise<MCPResponse> {
    return await this.callTool("auth_status", {});
  }

  async viewRelease(
    owner: string,
    repo: string,
    tag: string,
  ): Promise<MCPResponse> {
    return await this.callTool("release_view", {
      owner,
      repo,
      tag,
    });
  }

  async getVersionInfo(): Promise<MCPResponse> {
    return await this.callTool("version_info", {});
  }
}

// CLI interface for standalone usage
if (import.meta.main) {
  const args = Deno.args;

  if (args.length === 0) {
    console.log(`
MCP Client for Build Scripts

Usage:
  deno run -A scripts/mcp-client.ts <command> [options]

Commands:
  auth-status                    - Check GitHub authentication
  version-info                   - Get version compatibility info
  upload-release <tag> <files>   - Upload files to GitHub release
  view-release <tag>             - View release details

Examples:
  deno run -A scripts/mcp-client.ts auth-status
  deno run -A scripts/mcp-client.ts upload-release v1.0.0 ./dist/aichaku-1.0.0-macos-arm64
  deno run -A scripts/mcp-client.ts view-release v1.0.0
`);
    Deno.exit(0);
  }

  const command = args[0];
  const client = new MCPClient("github");

  try {
    await client.connect();

    switch (command) {
      case "auth-status": {
        const authStatus = await client.getAuthStatus();
        console.log(authStatus.content[0].text);
        break;
      }

      case "version-info": {
        const versionInfo = await client.getVersionInfo();
        console.log(versionInfo.content[0].text);
        break;
      }

      case "upload-release": {
        if (args.length < 3) {
          console.error("Usage: upload-release <tag> <file1> [file2] ...");
          Deno.exit(1);
        }
        const tag = args[1];
        const files = args.slice(2);

        const uploadResult = await client.uploadReleaseAssets(
          "RickCogley", // Default owner
          "aichaku", // Default repo
          tag,
          files,
          true,
        );

        console.log(uploadResult.content[0].text);
        if (uploadResult.isError) {
          Deno.exit(1);
        }
        break;
      }

      case "view-release": {
        if (args.length < 2) {
          console.error("Usage: view-release <tag>");
          Deno.exit(1);
        }
        const releaseTag = args[1];

        const releaseInfo = await client.viewRelease(
          "RickCogley", // Default owner
          "aichaku", // Default repo
          releaseTag,
        );

        console.log(releaseInfo.content[0].text);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        Deno.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    Deno.exit(1);
  } finally {
    await client.disconnect();
  }
}
