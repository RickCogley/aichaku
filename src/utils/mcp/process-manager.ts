/**
 * MCP Process Manager
 * Manages the lifecycle of MCP server processes with cross-platform support
 */

import { isAbsolute, join, normalize } from "@std/path";
import { exists } from "@std/fs";
import { PIDManager } from "./pid-manager.ts";
import { UnixProcessHandler } from "./platform/unix.ts";
import { WindowsProcessHandler } from "./platform/windows.ts";
import { colors } from "../../utils/ui.ts";
import { displayFeedback } from "../../utils/feedback.ts";

export interface ProcessHandler {
  start(command: string, args: string[]): Promise<number>;
  stop(pid: number): Promise<boolean>;
  isRunning(pid: number): Promise<boolean>;
  getProcessInfo(pid: number): Promise<ProcessInfo | null>;
}

export interface ProcessInfo {
  pid: number;
  command: string;
  startTime: Date;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface MCPStatus {
  installed: boolean;
  running: boolean;
  pid?: number;
  version?: string;
  uptime?: string;
  binaryPath?: string;
  processInfo?: ProcessInfo;
}

export class MCPProcessManager {
  private pidManager: PIDManager;
  private processHandler: ProcessHandler;
  private mcpBinaryPath: string;

  constructor() {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) {
      throw new Error("Could not determine home directory");
    }

    // Validate and normalize paths to prevent traversal
    const normalizedHomeDir = normalize(homeDir);
    if (!isAbsolute(normalizedHomeDir)) {
      throw new Error("Home directory must be an absolute path");
    }

    const platform = Deno.build.os;
    const mcpDir = normalize(join(normalizedHomeDir, ".aichaku", "mcp-server"));

    // Ensure the path is still within the home directory
    if (!mcpDir.startsWith(normalizedHomeDir)) {
      throw new Error("Invalid MCP directory path");
    }

    this.mcpBinaryPath = normalize(join(
      mcpDir,
      platform === "windows" ? "mcp-code-reviewer.exe" : "mcp-code-reviewer",
    ));

    this.pidManager = new PIDManager(mcpDir);

    // Select platform-specific handler
    this.processHandler = platform === "windows"
      ? new WindowsProcessHandler()
      : new UnixProcessHandler();
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      // Check if already running
      const currentPID = await this.pidManager.getPID();
      if (currentPID && await this.processHandler.isRunning(currentPID)) {
        displayFeedback({
          type: "warning",
          title: "MCP Server Already Running",
          message: `The MCP server is already running with PID ${currentPID}`,
        });
        return;
      }

      // Check if binary exists
      if (!await exists(this.mcpBinaryPath)) {
        displayFeedback({
          type: "error",
          title: "MCP Server Not Installed",
          message: "Run 'aichaku mcp --install' to install the MCP server",
        });
        return;
      }

      displayFeedback({
        type: "info",
        title: "Starting MCP Server",
        message: "Launching the MCP server process...",
      });

      // Start the process
      const pid = await this.processHandler.start(this.mcpBinaryPath, []);
      await this.pidManager.setPID(pid);

      // Wait a moment to ensure it started successfully
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (await this.processHandler.isRunning(pid)) {
        displayFeedback({
          type: "success",
          title: "MCP Server Started",
          message: `Server started successfully with PID ${pid}`,
        });
      } else {
        await this.pidManager.removePID();
        throw new Error("Server process terminated unexpectedly");
      }
    } catch (error) {
      displayFeedback({
        type: "error",
        title: "Failed to Start MCP Server",
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    try {
      const pid = await this.pidManager.getPID();
      if (!pid) {
        displayFeedback({
          type: "info",
          title: "MCP Server Not Running",
          message: "No MCP server process found",
        });
        return;
      }

      displayFeedback({
        type: "info",
        title: "Stopping MCP Server",
        message: `Stopping process with PID ${pid}...`,
      });

      const stopped = await this.processHandler.stop(pid);
      if (stopped) {
        await this.pidManager.removePID();
        displayFeedback({
          type: "success",
          title: "MCP Server Stopped",
          message: "Server stopped successfully",
        });
      } else {
        displayFeedback({
          type: "warning",
          title: "Process Not Found",
          message: `Process ${pid} was not running. Cleaning up PID file.`,
        });
        await this.pidManager.removePID();
      }
    } catch (error) {
      displayFeedback({
        type: "error",
        title: "Failed to Stop MCP Server",
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Restart the MCP server
   */
  async restart(): Promise<void> {
    displayFeedback({
      type: "info",
      title: "Restarting MCP Server",
      message: "Stopping current instance...",
    });

    await this.stop();

    // Wait a moment before starting
    await new Promise((resolve) => setTimeout(resolve, 500));

    await this.start();
  }

  /**
   * Get the current status of the MCP server
   */
  async getStatus(): Promise<MCPStatus> {
    const installed = await exists(this.mcpBinaryPath);
    const pid = await this.pidManager.getPID();
    const running = pid ? await this.processHandler.isRunning(pid) : false;

    const status: MCPStatus = {
      installed,
      running,
      binaryPath: installed ? this.mcpBinaryPath : undefined,
    };

    if (running && pid) {
      status.pid = pid;

      // Get process info
      const processInfo = await this.processHandler.getProcessInfo(pid);
      if (processInfo) {
        status.processInfo = processInfo;

        // Calculate uptime
        const uptimeMs = Date.now() - processInfo.startTime.getTime();
        status.uptime = this.formatUptime(uptimeMs);
      }

      // Get version if possible
      try {
        const cmd = new Deno.Command(this.mcpBinaryPath, {
          args: ["--version"],
          stdout: "piped",
          stderr: "piped",
        });
        const output = await cmd.output();
        if (output.success) {
          const version = new TextDecoder().decode(output.stdout).trim();
          status.version = version;
        }
      } catch {
        // Version check failed, continue without it
      }
    }

    // Clean up stale PID if process not running
    if (!running && pid) {
      await this.pidManager.removePID();
    }

    return status;
  }

  /**
   * Display a rich status report
   */
  async displayStatus(): Promise<void> {
    const status = await this.getStatus();

    console.log(`\n${colors.bold("🔍 MCP Server Status")}\n`);

    // Installation status
    console.log(`📦 ${colors.bold("Installation:")}`);
    if (status.installed) {
      console.log(`   ${colors.green("✓")} Installed`);
      console.log(`   ${colors.dim("Path:")} ${status.binaryPath}`);
    } else {
      console.log(`   ${colors.red("✗")} Not installed`);
      console.log(`   ${colors.dim("Run:")} aichaku mcp --install`);
    }

    // Runtime status
    console.log(`\n🚀 ${colors.bold("Runtime:")}`);
    if (status.running) {
      console.log(`   ${colors.green("✓")} Running`);
      console.log(`   ${colors.dim("PID:")} ${status.pid}`);
      if (status.uptime) {
        console.log(`   ${colors.dim("Uptime:")} ${status.uptime}`);
      }
      if (status.version) {
        console.log(`   ${colors.dim("Version:")} ${status.version}`);
      }
      if (status.processInfo) {
        if (status.processInfo.memoryUsage) {
          const memMB = (status.processInfo.memoryUsage / 1024 / 1024).toFixed(
            1,
          );
          console.log(`   ${colors.dim("Memory:")} ${memMB} MB`);
        }
        if (status.processInfo.cpuUsage !== undefined) {
          console.log(
            `   ${colors.dim("CPU:")} ${
              status.processInfo.cpuUsage.toFixed(1)
            }%`,
          );
        }
      }
    } else {
      console.log(`   ${colors.yellow("○")} Not running`);
      if (status.installed) {
        console.log(`   ${colors.dim("Start:")} aichaku mcp --start`);
      }
    }

    // Features
    console.log(`\n🛠️  ${colors.bold("Features:")}`);
    console.log(`   • Security scanning (OWASP Top 10)`);
    console.log(`   • Standards compliance checking`);
    console.log(`   • Methodology validation`);
    console.log(`   • Educational feedback`);

    // MCP Tools for Claude Code
    console.log(`\n🪴 ${colors.bold("MCP Tools for Claude Code:")}`);
    if (status.installed) {
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__review_file")
        }        Review individual files`,
      );
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__review_methodology")
        }  Check methodology compliance`,
      );
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__get_standards")
        }      Get project standards`,
      );
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__analyze_project")
        }    Analyze project structure`,
      );
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__generate_documentation")
        } Generate docs`,
      );
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__get_statistics")
        }     View usage statistics`,
      );
      console.log(
        `   ${
          colors.cyan("mcp__aichaku-reviewer__create_doc_template")
        } Create doc templates`,
      );

      if (!status.running) {
        console.log(
          `\n   ${
            colors.dim(
              "Note: MCP tools are only available when the server is running",
            )
          }`,
        );
      }
    } else {
      console.log(
        `   ${colors.dim("Install MCP server first to use these tools")}`,
      );
    }

    // Available commands
    console.log(`\n📋 ${colors.bold("Management Commands:")}`);
    if (status.installed) {
      if (status.running) {
        console.log(
          `   ${colors.dim("aichaku mcp --stop")}     Stop the server`,
        );
        console.log(
          `   ${colors.dim("aichaku mcp --restart")}  Restart the server`,
        );
      } else {
        console.log(
          `   ${colors.dim("aichaku mcp --start")}    Start the server`,
        );
      }
      console.log(
        `   ${colors.dim("aichaku mcp --upgrade")}  Upgrade to latest version`,
      );
    } else {
      console.log(
        `   ${colors.dim("aichaku mcp --install")}  Install the server`,
      );
    }
    console.log(
      `   ${colors.dim("aichaku mcp --config")}   Show configuration`,
    );

    console.log("");
  }

  /**
   * Upgrade the MCP server to the latest version
   */
  async upgrade(): Promise<void> {
    try {
      // Stop if running
      const status = await this.getStatus();
      if (status.running) {
        displayFeedback({
          type: "info",
          title: "Stopping Current Server",
          message: "Stopping the running server before upgrade...",
        });
        await this.stop();
      }

      // Run the install command which will download the latest
      displayFeedback({
        type: "info",
        title: "Upgrading MCP Server",
        message: "Downloading the latest version...",
      });

      // Import and run the install function
      const { installMCPServer } = await import("../../commands/mcp.ts");
      await installMCPServer();

      // Start if it was running before
      if (status.running) {
        displayFeedback({
          type: "info",
          title: "Restarting Server",
          message: "Starting the upgraded server...",
        });
        await this.start();
      }
    } catch (error) {
      displayFeedback({
        type: "error",
        title: "Upgrade Failed",
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Format uptime in a human-readable way
   */
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
}
