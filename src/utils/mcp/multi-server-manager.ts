/**
 * Multi-Server MCP Manager
 * Manages multiple MCP servers with proper isolation
 */

import { isAbsolute, join, normalize } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import { colors } from "../../utils/ui.ts";
import { Brand } from "../../utils/branded-messages.ts";

export interface MCPServerConfig {
  id: string;
  name: string;
  description: string;
  binaryName: string;
  tools: string[];
  defaultEnv?: Record<string, string>;
}

export interface MCPServerStatus {
  id: string;
  name: string;
  installed: boolean;
  running: boolean;
  pid?: number;
  version?: string;
  uptime?: string;
  binaryPath?: string;
  tools: string[];
}

export class MultiServerMCPManager {
  private homeDir: string;
  private mcpServersDir: string;
  private servers: Map<string, MCPServerConfig>;

  constructor() {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) {
      throw new Error("Could not determine home directory");
    }
    this.homeDir = homeDir;

    // Validate and normalize paths
    const normalizedHomeDir = normalize(this.homeDir);
    if (!isAbsolute(normalizedHomeDir)) {
      throw new Error("Home directory must be an absolute path");
    }

    this.mcpServersDir = normalize(
      join(normalizedHomeDir, ".aichaku", "mcp-servers"),
    );

    // Ensure the path is within home directory
    if (!this.mcpServersDir.startsWith(normalizedHomeDir)) {
      throw new Error("Invalid MCP servers directory path");
    }

    this.servers = new Map();
    this.initializeServerConfigs();
  }

  private initializeServerConfigs(): void {
    const platform = Deno.build.os;
    const ext = platform === "windows" ? ".exe" : "";

    // Aichaku Code Reviewer MCP Server
    this.servers.set("aichaku-reviewer", {
      id: "aichaku-reviewer",
      name: "Aichaku Code Reviewer",
      description: "Code review, security scanning, and methodology compliance",
      binaryName: `aichaku-code-reviewer${ext}`,
      tools: [
        "mcp__aichaku-reviewer__review_file",
        "mcp__aichaku-reviewer__review_methodology",
        "mcp__aichaku-reviewer__get_standards",
        "mcp__aichaku-reviewer__analyze_project",
        "mcp__aichaku-reviewer__generate_documentation",
        "mcp__aichaku-reviewer__get_statistics",
        "mcp__aichaku-reviewer__create_doc_template",
      ],
    });

    // GitHub Operations MCP Server
    this.servers.set("github-operations", {
      id: "github-operations",
      name: "GitHub Operations",
      description: "Comprehensive GitHub CLI replacement with deterministic operations",
      binaryName: `github-operations${ext}`,
      tools: [
        "mcp__github__auth_status",
        "mcp__github__auth_login",
        "mcp__github__release_upload",
        "mcp__github__release_view",
        "mcp__github__run_list",
        "mcp__github__run_view",
        "mcp__github__run_watch",
        "mcp__github__repo_view",
        "mcp__github__repo_list",
        "mcp__github__version_info",
        "mcp__github__version_check",
      ],
      defaultEnv: {
        GITHUB_TOKEN: "${GITHUB_TOKEN}",
      },
    });
  }

  private getServerPidFile(serverId: string): string {
    return join(this.mcpServersDir, `${serverId}.pid`);
  }

  private getServerLogFile(serverId: string): string {
    return join(this.mcpServersDir, `${serverId}.log`);
  }

  private getServerBinaryPath(serverId: string): string {
    const config = this.servers.get(serverId);
    if (!config) {
      throw new Error(`Unknown server: ${serverId}`);
    }
    return join(this.mcpServersDir, config.binaryName);
  }

  async getServerStatus(serverId: string): Promise<MCPServerStatus> {
    const config = this.servers.get(serverId);
    if (!config) {
      throw new Error(`Unknown server: ${serverId}`);
    }

    const binaryPath = this.getServerBinaryPath(serverId);
    const installed = await exists(binaryPath);

    // For stdio servers, "running" doesn't apply - they're launched on-demand
    // We only track installation status
    return {
      id: serverId,
      name: config.name,
      installed,
      running: false, // Not applicable for stdio servers
      pid: undefined,
      uptime: undefined,
      binaryPath: installed ? binaryPath : undefined,
      tools: config.tools,
    };
  }

  async getAllServerStatus(): Promise<MCPServerStatus[]> {
    const statuses: MCPServerStatus[] = [];

    for (const serverId of this.servers.keys()) {
      const status = await this.getServerStatus(serverId);
      statuses.push(status);
    }

    return statuses;
  }

  async displayAllStatus(): Promise<void> {
    const statuses = await this.getAllServerStatus();

    // Clear header
    Brand.log("MCP Integration Status");
    console.log(colors.dim("Model Context Protocol servers for Claude Code"));
    console.log("");

    // Separate installed and not installed servers
    const installedServers = statuses.filter((s) => s.installed);
    const notInstalledServers = statuses.filter((s) => !s.installed);

    // Show installed servers
    if (installedServers.length > 0) {
      console.log(colors.bold("📦 Installed MCP Servers"));
      console.log(
        colors.dim("These servers are ready for Claude Code configuration"),
      );
      console.log("");

      for (const status of installedServers) {
        console.log(`${colors.green("✓")} ${colors.bold(status.name)}`);
        console.log(`   ${colors.dim("ID:")} ${status.id}`);
        console.log(
          `   ${colors.dim("Type:")} stdio (passive - launched on-demand)`,
        );
        console.log(
          `   ${colors.dim("Tools:")} ${status.tools.length} available`,
        );
        console.log(`   ${colors.dim("Path:")} ${status.binaryPath}`);
        console.log("");
      }
    }

    // Show not installed servers
    if (notInstalledServers.length > 0) {
      console.log(colors.bold("❌ Not Installed"));
      console.log("");

      for (const status of notInstalledServers) {
        console.log(`${colors.red("✗")} ${colors.bold(status.name)}`);
        console.log(
          `   Install with: ${colors.cyan(`aichaku mcp --install-${status.id}`)}`,
        );
        console.log("");
      }
    }

    // HTTP Bridge Server (this one actually runs)
    console.log(colors.bold("🌉 HTTP Bridge Server"));
    console.log(colors.dim("Enables 'aichaku review' command to use MCP"));
    const isHttpServerRunning = await this.checkHttpServerStatus();
    if (isHttpServerRunning) {
      console.log(`${colors.green("✓")} Running on http://127.0.0.1:7182`);
      console.log(`   Stop with: ${colors.cyan("aichaku mcp --stop-server")}`);
    } else {
      console.log(`${colors.yellow("○")} Not running`);
      console.log(
        `   Start with: ${colors.cyan("aichaku mcp --start-server")}`,
      );
    }
    console.log("");

    // Configuration section
    if (installedServers.length > 0) {
      console.log(colors.bold("⚙️  Claude Code Configuration"));
      console.log("To use these servers in Claude Code:");
      console.log(
        `1. Run ${colors.cyan("aichaku mcp --config")} to see the configuration`,
      );
      console.log("2. Add it to Claude Code's MCP settings");
      console.log("3. Restart Claude Code");
      console.log("");
    }

    // Quick actions
    console.log(colors.bold("🚀 Quick Actions"));
    if (notInstalledServers.length > 0) {
      console.log(
        `• Install all servers: ${colors.cyan("aichaku mcp --install")}`,
      );
    }
    if (installedServers.length > 0) {
      console.log(
        `• Show configuration: ${colors.cyan("aichaku mcp --config")}`,
      );
      console.log(
        `• View available tools: ${colors.cyan("aichaku mcp --tools")}`,
      );
    }
    if (!isHttpServerRunning) {
      console.log(
        `• Start bridge server: ${colors.cyan("aichaku mcp --start-server")}`,
      );
    }
    console.log("");
  }

  private async checkHttpServerStatus(): Promise<boolean> {
    try {
      const response = await fetch("http://127.0.0.1:7182/health", {
        signal: AbortSignal.timeout(1000), // 1 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async displayTools(): Promise<void> {
    const statuses = await this.getAllServerStatus();
    const installedServers = statuses.filter((s) => s.installed);

    Brand.log("MCP Tools Reference");
    console.log(colors.dim("Available tools for Claude Code"));
    console.log("");

    if (installedServers.length === 0) {
      console.log(colors.yellow("No MCP servers installed."));
      console.log(
        `Run ${colors.cyan("aichaku mcp --install")} to install servers.`,
      );
      return;
    }

    for (const status of installedServers) {
      console.log(colors.bold(`📦 ${status.name}`));
      console.log(colors.dim(`Server ID: ${status.id}`));
      console.log("");

      // Group tools by category
      const toolsByCategory = this.categorizeTools(status.tools);

      for (const [category, tools] of Object.entries(toolsByCategory)) {
        console.log(`  ${colors.cyan(category)}:`);
        for (const tool of tools) {
          const shortName = tool.replace(
            `mcp__${status.id.replace("-", "_")}__`,
            "",
          );
          console.log(`    • ${colors.green(tool)}`);
          console.log(
            `      ${colors.dim(this.getToolDescription(shortName))}`,
          );
        }
        console.log("");
      }
    }

    console.log(colors.bold("💡 Usage in Claude Code:"));
    console.log(
      "These tools are automatically available when you configure the MCP servers.",
    );
    console.log("Claude will use them when appropriate for your tasks.");
    console.log("");
  }

  private categorizeTools(tools: string[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {};

    for (const tool of tools) {
      const shortName = tool.split("__").pop() || tool;
      let category = "General";

      if (shortName.includes("review") || shortName.includes("analyze")) {
        category = "Code Review & Analysis";
      } else if (shortName.includes("auth") || shortName.includes("login")) {
        category = "Authentication";
      } else if (shortName.includes("release")) {
        category = "Release Management";
      } else if (shortName.includes("run") || shortName.includes("workflow")) {
        category = "GitHub Actions";
      } else if (shortName.includes("repo")) {
        category = "Repository Management";
      } else if (
        shortName.includes("doc") || shortName.includes("documentation")
      ) {
        category = "Documentation";
      } else if (
        shortName.includes("statistics") || shortName.includes("metrics")
      ) {
        category = "Analytics";
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(tool);
    }

    return categories;
  }

  private getToolDescription(toolName: string): string {
    const descriptions: Record<string, string> = {
      // Aichaku tools
      "review_file": "Review code for security and standards compliance",
      "review_methodology": "Check project methodology compliance",
      "get_standards": "Get configured coding standards",
      "analyze_project": "Analyze project structure and dependencies",
      "generate_documentation": "Generate project documentation",
      "get_statistics": "View usage statistics and insights",
      "create_doc_template": "Create documentation templates",

      // GitHub tools
      "auth_status": "Check GitHub authentication status",
      "auth_login": "Login to GitHub with token",
      "release_upload": "Upload assets to releases",
      "release_view": "View release details",
      "run_list": "List workflow runs",
      "run_view": "View workflow run details",
      "run_watch": "Monitor workflow progress",
      "repo_view": "View repository information",
      "repo_list": "List user repositories",
      "version_info": "Get version information",
      "version_check": "Check CLI compatibility",
    };

    return descriptions[toolName] || "Tool for MCP operations";
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getServerConfigs(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  getServerConfig(serverId: string): MCPServerConfig | undefined {
    return this.servers.get(serverId);
  }

  async ensureServerDirectories(): Promise<void> {
    await ensureDir(this.mcpServersDir);
  }
}
