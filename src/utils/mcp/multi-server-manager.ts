/**
 * Multi-Server MCP Manager
 * Manages multiple MCP servers with proper isolation
 */

import { isAbsolute, join, normalize } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import { colors } from "../../utils/ui.ts";
import { displayFeedback } from "../../utils/feedback.ts";

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
      description:
        "Comprehensive GitHub CLI replacement with deterministic operations",
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
    const pidFile = this.getServerPidFile(serverId);

    const installed = await exists(binaryPath);
    let running = false;
    let pid: number | undefined;
    let uptime: string | undefined;

    if (installed) {
      // Check if PID file exists and process is running
      try {
        if (await exists(pidFile)) {
          const pidContent = await Deno.readTextFile(pidFile);
          pid = parseInt(pidContent.trim());

          // Check if process is actually running
          if (pid && !isNaN(pid)) {
            try {
              // On Unix systems, signal 0 checks if process exists
              Deno.kill(pid, "SIGTERM" as any);
              running = true;

              // Calculate uptime from PID file modification time
              const pidStat = await Deno.stat(pidFile);
              const uptimeMs = Date.now() - pidStat.mtime!.getTime();
              uptime = this.formatUptime(uptimeMs);
            } catch {
              // Process not running, clean up stale PID file
              await Deno.remove(pidFile).catch(() => {});
              pid = undefined;
            }
          }
        }
      } catch {
        // PID file issues, consider not running
        pid = undefined;
      }
    }

    return {
      id: serverId,
      name: config.name,
      installed,
      running,
      pid,
      uptime,
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

    console.log(`\\n${colors.bold("🔍 MCP Servers Status")}\\n`);

    for (const status of statuses) {
      console.log(`## ${colors.bold(status.name)} (${status.id})`);

      // Installation status
      if (status.installed) {
        console.log(`   ${colors.green("✓")} Installed`);
        console.log(`   ${colors.dim("Binary:")} ${status.binaryPath}`);
      } else {
        console.log(`   ${colors.red("✗")} Not installed`);
        console.log(
          `   ${colors.dim("Install:")} aichaku mcp --install-${status.id}`,
        );
      }

      // Runtime status
      if (status.running) {
        console.log(`   ${colors.green("✓")} Running (PID: ${status.pid})`);
        if (status.uptime) {
          console.log(`   ${colors.dim("Uptime:")} ${status.uptime}`);
        }
      } else {
        console.log(`   ${colors.yellow("○")} Not running`);
        if (status.installed) {
          console.log(
            `   ${colors.dim("Start:")} aichaku mcp --start-${status.id}`,
          );
        }
      }

      // Tools
      console.log(
        `   ${colors.dim("Tools:")} ${status.tools.length} available`,
      );
      if (status.running) {
        console.log(`   ${colors.green("🔗")} Ready for Claude Code`);
      } else {
        console.log(`   ${colors.dim("🔗")} Unavailable (server not running)`);
      }

      console.log("");
    }

    // MCP Tools for Claude Code
    console.log(`🪴 ${colors.bold("MCP Tools for Claude Code:")}`);
    for (const status of statuses) {
      if (status.installed) {
        console.log(`\\n   ${colors.cyan(status.name)} tools:`);
        for (const tool of status.tools.slice(0, 5)) {
          console.log(`   ${colors.cyan(tool)}`);
        }
        if (status.tools.length > 5) {
          console.log(
            `   ${colors.dim(`... and ${status.tools.length - 5} more tools`)}`,
          );
        }
      }
    }

    console.log(`\\n📋 ${colors.bold("Management Commands:")}`);
    console.log(
      `   ${colors.dim("aichaku mcp --install")}     Install all servers`,
    );
    console.log(
      `   ${colors.dim("aichaku mcp --start-all")}   Start all servers`,
    );
    console.log(
      `   ${colors.dim("aichaku mcp --stop-all")}    Stop all servers`,
    );
    console.log(
      `   ${colors.dim("aichaku mcp --status")}      Show this status`,
    );
    console.log("");
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
