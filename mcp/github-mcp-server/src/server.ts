#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net

/**
 * GitHub MCP Server
 * Comprehensive GitHub operations for Claude Code
 */

import { Server } from "@modelcontextprotocol/sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/stdio";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types";
import { GitHubClient } from "./github/client.ts";
import { GitHubAuthManager } from "./auth/manager.ts";

// Core tool implementations
import { releaseTools } from "./tools/release.ts";
import { workflowTools } from "./tools/workflow.ts";
import { authTools } from "./tools/auth.ts";
import { repositoryTools } from "./tools/repository.ts";

class GitHubMCPServer {
  private server: Server;
  private githubClient: GitHubClient;
  private authManager: GitHubAuthManager;

  constructor() {
    this.server = new Server(
      {
        name: "github-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.authManager = new GitHubAuthManager();
    this.githubClient = new GitHubClient(this.authManager);

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Authentication tools
          {
            name: "auth_status",
            description: "Check GitHub authentication status",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
          },
          {
            name: "auth_login",
            description: "Login to GitHub with token",
            inputSchema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "GitHub personal access token",
                },
              },
              required: ["token"],
              additionalProperties: false,
            },
          },

          // Release tools
          {
            name: "release_upload",
            description: "Upload assets to GitHub release",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string", 
                  description: "Repository name",
                },
                tag: {
                  type: "string",
                  description: "Release tag (e.g., v1.0.0)",
                },
                assets: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of file paths to upload",
                },
                overwrite: {
                  type: "boolean",
                  description: "Overwrite existing assets",
                  default: false,
                },
              },
              required: ["tag", "assets"],
              additionalProperties: false,
            },
          },
          {
            name: "release_view",
            description: "View GitHub release details",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name", 
                },
                tag: {
                  type: "string",
                  description: "Release tag",
                },
              },
              required: ["tag"],
              additionalProperties: false,
            },
          },

          // Workflow tools
          {
            name: "run_list",
            description: "List GitHub Actions workflow runs",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                workflow: {
                  type: "string",
                  description: "Workflow file name (e.g., publish.yml)",
                },
                status: {
                  type: "string",
                  enum: ["completed", "in_progress", "queued", "requested", "waiting"],
                  description: "Filter by run status",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of runs to return",
                  default: 10,
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: "run_view",
            description: "View GitHub Actions workflow run details",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                runId: {
                  type: "number",
                  description: "Workflow run ID",
                },
              },
              required: ["runId"],
              additionalProperties: false,
            },
          },
          {
            name: "run_watch",
            description: "Monitor workflow run progress",
            inputSchema: {
              type: "object",
              properties: {
                owner: {
                  type: "string",
                  description: "Repository owner",
                },
                repo: {
                  type: "string",
                  description: "Repository name",
                },
                runId: {
                  type: "number",
                  description: "Workflow run ID",
                },
                timeout: {
                  type: "number",
                  description: "Timeout in milliseconds",
                  default: 600000,
                },
                pollInterval: {
                  type: "number", 
                  description: "Poll interval in milliseconds",
                  default: 10000,
                },
              },
              required: ["runId"],
              additionalProperties: false,
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Get repository context
        const context = {
          owner: args.owner || this.getDefaultOwner(),
          repo: args.repo || this.getDefaultRepo(),
        };

        switch (name) {
          case "auth_status":
            return await authTools.status(this.authManager, args);

          case "auth_login": 
            return await authTools.login(this.authManager, args);

          case "release_upload":
            return await releaseTools.upload(this.githubClient, { ...args, ...context });

          case "release_view":
            return await releaseTools.view(this.githubClient, { ...args, ...context });

          case "run_list":
            return await workflowTools.listRuns(this.githubClient, { ...args, ...context });

          case "run_view":
            return await workflowTools.viewRun(this.githubClient, { ...args, ...context });

          case "run_watch":
            return await workflowTools.watchRun(this.githubClient, { ...args, ...context });

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getDefaultOwner(): string {
    return Deno.env.get("GITHUB_OWNER") || "RickCogley";
  }

  private getDefaultRepo(): string {
    return Deno.env.get("GITHUB_REPO") || "aichaku";
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🔗 GitHub MCP Server running on stdio");
  }
}

// Run the server
if (import.meta.main) {
  const server = new GitHubMCPServer();
  await server.run();
}