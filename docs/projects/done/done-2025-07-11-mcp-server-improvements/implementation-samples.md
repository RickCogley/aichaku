# MCP Server Management - Implementation Samples

## Priority 1: Process Management Core

### utils/mcp/pid-manager.ts

```typescript
import { exists } from "@std/fs";
import { join } from "@std/path";

export class PIDManager {
  private readonly pidFile: string;

  constructor(mcpDir: string) {
    this.pidFile = join(mcpDir, "mcp-server.pid");
  }

  async writePID(pid: number): Promise<void> {
    await Deno.writeTextFile(this.pidFile, pid.toString());
  }

  async readPID(): Promise<number | null> {
    try {
      const content = await Deno.readTextFile(this.pidFile);
      const pid = parseInt(content.trim(), 10);
      return isNaN(pid) ? null : pid;
    } catch {
      return null;
    }
  }

  async removePID(): Promise<void> {
    try {
      await Deno.remove(this.pidFile);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  async lockPID(): Promise<boolean> {
    const existingPID = await this.readPID();
    if (existingPID && await this.isProcessRunning(existingPID)) {
      return false; // Another instance is running
    }

    // Clean up stale PID file
    if (existingPID) {
      await this.removePID();
    }

    return true;
  }

  private async isProcessRunning(pid: number): Promise<boolean> {
    if (Deno.build.os === "windows") {
      return await this.isProcessRunningWindows(pid);
    } else {
      return await this.isProcessRunningUnix(pid);
    }
  }

  private async isProcessRunningUnix(pid: number): Promise<boolean> {
    try {
      const command = new Deno.Command("kill", {
        args: ["-0", pid.toString()],
        stdout: "piped",
        stderr: "piped",
      });

      const { success } = await command.output();
      return success;
    } catch {
      return false;
    }
  }

  private async isProcessRunningWindows(pid: number): Promise<boolean> {
    const command = new Deno.Command("tasklist", {
      args: ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, success } = await command.output();
    if (!success) return false;

    const output = new TextDecoder().decode(stdout);
    return output.includes(pid.toString());
  }
}
```

### utils/mcp/process-manager.ts

```typescript
import { join } from "@std/path";
import { exists } from "@std/fs";
import { PIDManager } from "./pid-manager.ts";

export interface ProcessStatus {
  running: boolean;
  pid?: number;
  uptime?: string;
  version?: string;
  binaryPath: string;
  lastError?: string;
}

export interface ProcessResult {
  success: boolean;
  message: string;
  pid?: number;
}

export class MCPProcessManager {
  private readonly mcpDir: string;
  private readonly binaryName: string;
  private readonly pidManager: PIDManager;
  private startTime?: Date;

  constructor() {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) {
      throw new Error("Could not determine home directory");
    }

    this.mcpDir = join(homeDir, ".aichaku", "mcp-server");
    this.binaryName = Deno.build.os === "windows"
      ? "mcp-code-reviewer.exe"
      : "mcp-code-reviewer";
    this.pidManager = new PIDManager(this.mcpDir);
  }

  async start(): Promise<ProcessResult> {
    // Check if already running
    const pid = await this.pidManager.readPID();
    if (pid && await this.isRunning()) {
      return {
        success: false,
        message: "MCP server is already running",
        pid,
      };
    }

    // Get binary path
    const binaryPath = join(this.mcpDir, this.binaryName);
    if (!await exists(binaryPath)) {
      return {
        success: false,
        message:
          `MCP server not found at ${binaryPath}. Run 'aichaku mcp --install' first.`,
      };
    }

    // Start the process
    try {
      const command = new Deno.Command(binaryPath, {
        stdout: "piped",
        stderr: "piped",
        stdin: "piped",
      });

      const process = command.spawn();

      // Write PID file
      await this.pidManager.writePID(process.pid);
      this.startTime = new Date();

      // Set up process monitoring
      this.monitorProcess(process);

      return {
        success: true,
        message: "MCP server started successfully",
        pid: process.pid,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start MCP server: ${error.message}`,
      };
    }
  }

  async stop(): Promise<ProcessResult> {
    const pid = await this.pidManager.readPID();
    if (!pid) {
      return {
        success: false,
        message: "MCP server is not running",
      };
    }

    try {
      if (Deno.build.os === "windows") {
        await this.stopWindows(pid);
      } else {
        await this.stopUnix(pid);
      }

      await this.pidManager.removePID();

      return {
        success: true,
        message: "MCP server stopped successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to stop MCP server: ${error.message}`,
      };
    }
  }

  async restart(): Promise<ProcessResult> {
    const stopResult = await this.stop();
    if (!stopResult.success && !stopResult.message.includes("not running")) {
      return stopResult;
    }

    // Wait a moment for clean shutdown
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return await this.start();
  }

  async status(): Promise<ProcessStatus> {
    const binaryPath = join(this.mcpDir, this.binaryName);
    const pid = await this.pidManager.readPID();
    const running = pid ? await this.isRunning() : false;

    return {
      running,
      pid: running ? pid : undefined,
      uptime: running && this.startTime
        ? this.formatUptime(this.startTime)
        : undefined,
      binaryPath,
      version: await this.getVersion(),
    };
  }

  async isRunning(): Promise<boolean> {
    const pid = await this.pidManager.readPID();
    if (!pid) return false;

    if (Deno.build.os === "windows") {
      return await this.isProcessRunningWindows(pid);
    } else {
      return await this.isProcessRunningUnix(pid);
    }
  }

  private async stopUnix(pid: number): Promise<void> {
    // Try graceful shutdown first
    Deno.kill(pid, "SIGTERM");

    // Wait up to 5 seconds
    for (let i = 0; i < 50; i++) {
      if (!await this.isProcessRunningUnix(pid)) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Force kill if still running
    Deno.kill(pid, "SIGKILL");
  }

  private async stopWindows(pid: number): Promise<void> {
    const command = new Deno.Command("taskkill", {
      args: ["/PID", pid.toString(), "/F"],
      stdout: "piped",
      stderr: "piped",
    });

    await command.output();
  }

  private async isProcessRunningUnix(pid: number): Promise<boolean> {
    try {
      Deno.kill(pid, "SIGCONT"); // Signal 0 would be better but Deno doesn't support it
      return true;
    } catch {
      return false;
    }
  }

  private async isProcessRunningWindows(pid: number): Promise<boolean> {
    const command = new Deno.Command("tasklist", {
      args: ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, success } = await command.output();
    if (!success) return false;

    const output = new TextDecoder().decode(stdout);
    return output.includes(pid.toString());
  }

  private formatUptime(startTime: Date): string {
    const diff = Date.now() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
        minutes !== 1 ? "s" : ""
      }`;
    } else {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
  }

  private async getVersion(): Promise<string | undefined> {
    // This would be implemented by the version manager
    return undefined;
  }

  private monitorProcess(process: Deno.ChildProcess): void {
    // Monitor process in background
    process.status.then(async (status) => {
      if (status.code !== 0) {
        console.error(`MCP server exited with code ${status.code}`);
      }
      await this.pidManager.removePID();
    });
  }
}
```

## Priority 2: Enhanced MCP Command

### commands/mcp.ts (updated sections)

```typescript
export interface MCPOptions {
  install?: boolean;
  config?: boolean;
  status?: boolean;
  start?: boolean;
  stop?: boolean;
  restart?: boolean;
  upgrade?: boolean;
  help?: boolean;
}

export async function runMCPCommand(options: MCPOptions): Promise<void> {
  if (options.help) {
    showMCPHelp();
    return;
  }

  const processManager = new MCPProcessManager();
  const versionManager = new MCPVersionManager();

  // Handle commands
  if (options.status) {
    await showEnhancedStatus(processManager, versionManager);
  } else if (options.start) {
    await startServer(processManager);
  } else if (options.stop) {
    await stopServer(processManager);
  } else if (options.restart) {
    await restartServer(processManager);
  } else if (options.upgrade) {
    await upgradeServer(versionManager, processManager);
  } else if (options.config) {
    showConfigInstructions();
  } else if (options.install) {
    await installMCPServer();
  } else {
    // Default: show status
    await showEnhancedStatus(processManager, versionManager);
  }
}

async function showEnhancedStatus(
  processManager: MCPProcessManager,
  versionManager: MCPVersionManager,
): Promise<void> {
  console.log("🔍 MCP Server Status");
  console.log("━".repeat(50));

  const status = await processManager.status();
  const currentVersion = await versionManager.getCurrentVersion();
  const latestVersion = await versionManager.getLatestVersion();
  const updateAvailable = currentVersion !== latestVersion;

  console.log(
    `📦 Version:        ${currentVersion || "Unknown"}${
      updateAvailable ? ` (latest: ${latestVersion} available)` : " (latest)"
    }`,
  );
  console.log(`📍 Location:       ${status.binaryPath}`);
  console.log(
    `${status.running ? "🟢" : "🔴"} Status:         ${
      status.running ? "Running" : "Stopped"
    }${status.pid ? ` (PID: ${status.pid})` : ""}`,
  );

  if (status.uptime) {
    console.log(`⏱️  Uptime:         ${status.uptime}`);
  }

  console.log(`🔧 Platform:       ${Deno.build.os} ${Deno.build.arch}`);

  // Check for external tools
  console.log("\n🔍 External Scanners:");
  await checkExternalScanners();

  // Provide actionable next steps
  console.log("\n💡 Available commands:");
  if (!status.running) {
    console.log("   aichaku mcp --start      Start the MCP server");
  } else {
    console.log("   aichaku mcp --restart    Restart the MCP server");
    console.log("   aichaku mcp --stop       Stop the MCP server");
  }

  if (updateAvailable) {
    console.log("   aichaku mcp --upgrade    Upgrade to latest version");
  }

  console.log("   aichaku mcp --config     Show configuration instructions");
}

async function startServer(processManager: MCPProcessManager): Promise<void> {
  console.log("🚀 Starting MCP server...");

  const result = await processManager.start();

  if (result.success) {
    console.log(`✅ ${result.message}`);
    console.log(`   PID: ${result.pid}`);
    console.log(
      "\n💡 The MCP server will be available to Claude Code after restart",
    );
  } else {
    console.error(`❌ ${result.message}`);

    // Provide helpful suggestions based on error
    if (result.message.includes("already running")) {
      console.log("\n💡 Use 'aichaku mcp --restart' to restart the server");
    } else if (result.message.includes("not found")) {
      console.log("\n💡 Run 'aichaku mcp --install' to install the MCP server");
    }
  }
}

async function stopServer(processManager: MCPProcessManager): Promise<void> {
  console.log("🛑 Stopping MCP server...");

  const result = await processManager.stop();

  if (result.success) {
    console.log(`✅ ${result.message}`);
  } else {
    console.error(`❌ ${result.message}`);
  }
}

async function restartServer(processManager: MCPProcessManager): Promise<void> {
  console.log("🔄 Restarting MCP server...");

  const result = await processManager.restart();

  if (result.success) {
    console.log(`✅ ${result.message}`);
    console.log("\n💡 Claude Code will reconnect to the restarted server");
  } else {
    console.error(`❌ ${result.message}`);
  }
}

function showConfigInstructions(): void {
  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  const binaryPath = join(
    homeDir,
    ".aichaku",
    "mcp-server",
    Deno.build.os === "windows" ? "mcp-code-reviewer.exe" : "mcp-code-reviewer",
  );

  console.log("📝 To configure Claude Code:\n");
  console.log("Run this command once per system:");
  console.log("─".repeat(70));

  if (Deno.build.os === "windows") {
    console.log(`claude mcp add aichaku-reviewer --stdio -- "${binaryPath}"`);
  } else {
    console.log(`claude mcp add aichaku-reviewer --stdio -- ${binaryPath}`);
  }

  console.log("─".repeat(70));

  console.log("\n✅ This enables the MCP server for all your aichaku projects");
  console.log("💡 Restart Claude Code after making changes");

  console.log("\n📍 The MCP server provides:");
  console.log("   • Security scanning (OWASP Top 10 vulnerabilities)");
  console.log("   • Standards compliance checking");
  console.log("   • Methodology validation (Shape Up, Scrum, Kanban)");
  console.log("   • TypeScript best practices");
  console.log("   • Educational feedback");

  console.log("\n🔧 Available MCP tools in Claude Code:");
  console.log("   • review_file - Review a file against standards");
  console.log("   • review_methodology - Check methodology compliance");
  console.log("   • get_standards - View project standards");
}
```

## Next Steps

1. Implement the version manager with GitHub API integration
2. Add automatic version embedding during build
3. Create comprehensive tests for all platforms
4. Update CLI argument parsing to support new flags
5. Add telemetry for usage tracking (optional)
6. Create migration guide for users
