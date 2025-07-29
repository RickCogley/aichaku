/**
 * MCP (Model Context Protocol) command for Aichaku
 * Manages MCP server installation and configuration
 */

import { ensureDir, exists } from "@std/fs";
import { join } from "@std/path";
import { VERSION } from "../../version.ts";
import { MCPProcessManager } from "../utils/mcp/process-manager.ts";
import { MultiServerMCPManager } from "../utils/mcp/multi-server-manager.ts";
import { isMCPServerRunning } from "../utils/mcp-http-client.ts";

export interface MCPOptions {
  install?: boolean;
  installReviewer?: boolean;
  installGithub?: boolean;
  config?: boolean;
  status?: boolean;
  help?: boolean;
  start?: boolean;
  stop?: boolean;
  restart?: boolean;
  upgrade?: boolean;
  startAll?: boolean;
  stopAll?: boolean;
  restartAll?: boolean;
  startServer?: boolean;
  stopServer?: boolean;
  serverStatus?: boolean;
  tools?: boolean;
}

export async function runMCPCommand(options: MCPOptions): Promise<void> {
  if (options.help) {
    showMCPHelp();
    return;
  }

  const multiManager = new MultiServerMCPManager();
  const processManager = new MCPProcessManager(); // Keep for backward compatibility

  if (options.install) {
    await installAllMCPServers();
  } else if (options.installReviewer) {
    await installMCPServer("aichaku-reviewer");
  } else if (options.installGithub) {
    await installMCPServer("github-operations");
  } else if (options.config) {
    await configureMCPServer();
  } else if (options.start) {
    await processManager.start();
  } else if (options.stop) {
    await processManager.stop();
  } else if (options.restart) {
    await processManager.restart();
  } else if (options.upgrade) {
    await processManager.upgrade();
  } else if (options.startAll) {
    console.log("🚀 Starting all MCP servers...");
    // TODO: Implement multi-server start
  } else if (options.stopAll) {
    console.log("🛑 Stopping all MCP servers...");
    // TODO: Implement multi-server stop
  } else if (options.restartAll) {
    console.log("🔄 Restarting all MCP servers...");
    // TODO: Implement multi-server restart
  } else if (options.startServer) {
    await startHTTPServer();
  } else if (options.stopServer) {
    await stopHTTPServer();
  } else if (options.serverStatus) {
    await checkHTTPServerStatus();
  } else if (options.tools) {
    await multiManager.displayTools();
  } else if (options.status) {
    await multiManager.displayAllStatus();
  } else {
    // Default: show status
    await multiManager.displayAllStatus();
  }
}

function showMCPHelp(): void {
  console.log(`
🪴 Aichaku MCP (Model Context Protocol) Server

The MCP server provides automated security and standards review for Claude Code.

Usage:
  aichaku mcp [options]

Options:
  --install       Install all MCP servers
  --install-aichaku-reviewer  Install Aichaku Code Reviewer
  --install-github-operations Install GitHub Operations
  --config        Show Claude Code configuration
  --status        Check MCP server status (default)
  --tools         List available MCP tools
  --help          Show this help message

HTTP Bridge Server (for 'aichaku review' command):
  --start-server  Start HTTP bridge server
  --stop-server   Stop HTTP bridge server
  --server-status Check bridge server status

⚠️  IMPORTANT: Installing MCP servers does NOT make them available to Claude Code!
   You must configure them in Claude Code's MCP system separately.
   See: https://docs.anthropic.com/en/docs/claude-code/mcp

Examples:
  aichaku mcp                   # Show status (default)
  aichaku mcp --install         # Install all MCP servers
  aichaku mcp --config          # Show Claude Code configuration
  aichaku mcp --tools           # List available MCP tools
  aichaku mcp --start-server    # Start HTTP bridge for 'aichaku review'

Learn more: https://github.com/RickCogley/aichaku/tree/main/mcp-server
`);
}

export async function installAllMCPServers(): Promise<void> {
  console.log("🚀 Installing all MCP servers...");
  await installMCPServer("aichaku-reviewer");
  await installMCPServer("github-operations");
  console.log("✅ All MCP servers installed successfully!");
}

export async function installMCPServer(serverId?: string): Promise<void> {
  const serverType = serverId || "aichaku-reviewer";
  const serverName = serverType === "aichaku-reviewer" ? "Aichaku MCP Server" : "GitHub MCP Server";

  console.log(`📦 Installing ${serverName}...\n`);

  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  const mcpDir = join(homeDir, ".aichaku", "mcp-servers");
  await ensureDir(mcpDir);

  try {
    // Download the compiled MCP server from GitHub releases
    const platform = Deno.build.os;
    const arch = Deno.build.arch;

    // Map platform/arch to our naming convention
    let platformName = "";
    if (platform === "darwin" && arch === "aarch64") {
      platformName = "macos-arm64";
    } else if (platform === "darwin" && arch === "x86_64") {
      platformName = "macos-x64";
    } else if (platform === "linux" && arch === "x86_64") {
      platformName = "linux-x64";
    } else if (platform === "windows" && arch === "x86_64") {
      platformName = "windows-x64";
    } else {
      throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }

    const ext = platform === "windows" ? ".exe" : "";

    let binaryName: string;
    let targetPath: string;

    if (serverType === "aichaku-reviewer") {
      binaryName = `aichaku-code-reviewer-${VERSION}-${platformName}${ext}`;
      targetPath = join(mcpDir, `aichaku-code-reviewer${ext}`);
    } else {
      binaryName = `github-operations-${VERSION}-${platformName}${ext}`;
      targetPath = join(mcpDir, `github-operations${ext}`);
    }

    const downloadUrl = `https://github.com/RickCogley/aichaku/releases/download/v${VERSION}/${binaryName}`;

    console.log(
      `📥 Downloading MCP server v${VERSION} for ${platform}-${arch}...`,
    );
    console.log(`   From: ${downloadUrl}`);
    console.log(`   To: ${targetPath}\n`);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Binary not found. The v${VERSION} release may not have binaries uploaded yet.`,
        );
      }
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    await Deno.writeFile(targetPath, new Uint8Array(data));

    // Make executable on Unix-like systems
    if (platform !== "windows") {
      await Deno.chmod(targetPath, 0o755);
    }

    console.log("✅ MCP server installed successfully!");
    console.log(`📍 Location: ${targetPath}\n`);

    // Check for external scanners
    await checkExternalScanners();

    console.log(
      "\n💡 Next step: Run 'aichaku mcp --config' to configure Claude Code",
    );
  } catch (error) {
    console.error(
      `❌ Installation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.error("\n💡 Alternative: Install from source:");
    console.error("   git clone https://github.com/RickCogley/aichaku");
    console.error("   cd aichaku/mcp-server");
    console.error("   deno task compile");
  }
}

async function configureMCPServer(): Promise<void> {
  console.log("🔧 Configuring Claude Code for MCP Servers...\n");

  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  const platform = Deno.build.os;
  const ext = platform === "windows" ? ".exe" : "";
  const serversPath = join(homeDir, ".aichaku", "mcp-servers");

  // Check for new multi-server structure
  const reviewerPath = join(serversPath, `aichaku-code-reviewer${ext}`);
  const githubPath = join(serversPath, `github-operations${ext}`);

  const hasReviewer = await exists(reviewerPath);
  const hasGithub = await exists(githubPath);

  // Also check old location for backward compatibility
  const oldPath = join(homeDir, ".aichaku", "mcp-server", `mcp-code-reviewer${ext}`);
  const hasOldReviewer = await exists(oldPath);

  if (!hasReviewer && !hasGithub && !hasOldReviewer) {
    console.error("❌ No MCP servers installed");
    console.error("   Run 'aichaku mcp --install' to install servers");
    return;
  }

  // Create MCP configuration for all installed servers
  const mcpConfig: any = {
    mcpServers: {},
  };

  if (hasReviewer) {
    mcpConfig.mcpServers["aichaku-reviewer"] = {
      command: reviewerPath,
      args: [],
      env: {},
    };
  } else if (hasOldReviewer) {
    console.log("⚠️  Using old MCP server location. Consider reinstalling with --install");
    mcpConfig.mcpServers["aichaku-reviewer"] = {
      command: oldPath,
      args: [],
      env: {},
    };
  }

  if (hasGithub) {
    mcpConfig.mcpServers["github-operations"] = {
      command: githubPath,
      args: [],
      env: {},
    };
  }

  console.log("📝 Add this configuration to Claude Code's MCP settings:\n");
  console.log(JSON.stringify(mcpConfig, null, 2));
  console.log("\n📍 Configuration locations:");
  console.log(
    "   • macOS: ~/Library/Application Support/Claude/claude_desktop_settings.json",
  );
  console.log("   • Windows: %APPDATA%\\Claude\\claude_desktop_settings.json");
  console.log("   • Linux: ~/.config/Claude/claude_desktop_settings.json");

  console.log("\n💡 After adding the configuration:");
  console.log("   1. Restart Claude Code");
  console.log("   2. The MCP servers will be available:");

  if (hasReviewer || hasOldReviewer) {
    console.log("\n   📚 aichaku-reviewer tools:");
    console.log("      • mcp__aichaku-reviewer__review_file");
    console.log("      • mcp__aichaku-reviewer__review_methodology");
    console.log("      • mcp__aichaku-reviewer__get_standards");
    console.log("      • mcp__aichaku-reviewer__analyze_project");
    console.log("      • mcp__aichaku-reviewer__generate_documentation");
    console.log("      • mcp__aichaku-reviewer__get_statistics");
    console.log("      • mcp__aichaku-reviewer__create_doc_template");
  }

  if (hasGithub) {
    console.log("\n   🐙 github-operations tools:");
    console.log("      • mcp__github-operations__auth_status");
    console.log("      • mcp__github-operations__auth_login");
    console.log("      • mcp__github-operations__release_upload");
    console.log("      • mcp__github-operations__release_view");
    console.log("      • mcp__github-operations__run_list");
    console.log("      • mcp__github-operations__run_view");
    console.log("      • mcp__github-operations__run_watch");
    console.log("      • mcp__github-operations__repo_view");
    console.log("      • mcp__github-operations__repo_list");
    console.log("      • mcp__github-operations__version_info");
    console.log("      • mcp__github-operations__version_check");
  }
}

async function _checkMCPStatus(): Promise<void> {
  console.log("🔍 Checking MCP Server Status...\n");

  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  const platform = Deno.build.os;
  const mcpBinary = join(
    homeDir,
    ".aichaku",
    "mcp-server",
    platform === "windows" ? "mcp-code-reviewer.exe" : "mcp-code-reviewer",
  );

  // Check if installed
  const isInstalled = await exists(mcpBinary);
  console.log(
    `📦 MCP Server: ${isInstalled ? "✅ Installed" : "❌ Not installed"}`,
  );
  if (isInstalled) {
    console.log(`   Location: ${mcpBinary}`);
  }

  // Check external scanners
  console.log("\n🔍 External Scanners:");
  await checkExternalScanners();

  if (!isInstalled) {
    console.log("\n💡 To install: aichaku mcp --install");
  }
}

async function checkExternalScanners(): Promise<void> {
  const scanners = [
    { name: "CodeQL", command: "codeql", installCmd: "brew install codeql" },
    {
      name: "DevSkim",
      command: "devskim",
      installCmd: "dotnet tool install -g Microsoft.CST.DevSkim.CLI",
    },
    { name: "Semgrep", command: "semgrep", installCmd: "brew install semgrep" },
  ];

  for (const scanner of scanners) {
    const available = await checkCommand(scanner.command);
    console.log(
      `   ${scanner.name}: ${available ? "✅ Available" : "⚠️  Not installed"}`,
    );
    if (!available) {
      console.log(`      Install: ${scanner.installCmd}`);
    }
  }
}

async function checkCommand(command: string): Promise<boolean> {
  try {
    const cmd = new Deno.Command(command, {
      args: ["--version"],
      stdout: "null",
      stderr: "null",
    });
    const result = await cmd.output();
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Start the HTTP/SSE server for shared MCP access
 */
async function startHTTPServer(): Promise<void> {
  console.log("🚀 Starting MCP HTTP/SSE Server...\n");

  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  // Check if server is already running
  if (await isMCPServerRunning()) {
    console.log("✅ MCP HTTP/SSE server is already running on port 7182");
    console.log("   Multiple Claude Code instances can connect to it");
    return;
  }

  const httpServerPath = join(
    homeDir,
    ".aichaku",
    "mcp-servers",
    "http-server.ts",
  );

  // Check if HTTP server script already exists, if not try to copy it
  try {
    // First check if the file already exists
    const fileExists = await exists(httpServerPath);

    if (!fileExists) {
      // Try to copy from development directory if running locally
      const serverScript = `${Deno.env.get("PWD")}/mcp/aichaku-mcp-server/src/http-server.ts`;

      try {
        const serverCode = await Deno.readTextFile(serverScript);
        await ensureDir(join(homeDir, ".aichaku", "mcp-servers"));
        await Deno.writeTextFile(httpServerPath, serverCode);
      } catch {
        // If we can't find it locally, fetch from GitHub
        console.log("📥 Downloading HTTP server from GitHub...");
        const response = await fetch(
          "https://raw.githubusercontent.com/RickCogley/aichaku/main/mcp/aichaku-mcp-server/src/http-server.ts",
        );
        if (!response.ok) {
          throw new Error(
            `Failed to download HTTP server: ${response.statusText}`,
          );
        }
        const serverCode = await response.text();
        await ensureDir(join(homeDir, ".aichaku", "mcp-servers"));
        await Deno.writeTextFile(httpServerPath, serverCode);
      }
    }
  } catch (error) {
    console.error(
      "❌ Failed to prepare HTTP server:",
      error instanceof Error ? error.message : String(error),
    );
    return;
  }

  // Start the server in background using nohup to detach it
  const cmd = new Deno.Command("sh", {
    args: [
      "-c",
      `nohup deno run --allow-read --allow-write --allow-env --allow-run --allow-net "${httpServerPath}" > "${homeDir}/.aichaku/mcp-http-server.log" 2>&1 &`,
    ],
  });

  const output = await cmd.output();
  if (!output.success) {
    console.error("❌ Failed to start server");
    return;
  }

  // Give it a moment to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check if it started successfully
  if (await isMCPServerRunning()) {
    console.log("✅ MCP HTTP/SSE Server started successfully!");
    console.log("   URL: http://127.0.0.1:7182");
    console.log(
      "\n💡 Multiple Claude Code instances can now connect to this server",
    );
    console.log(
      "   The review command will automatically use this server when available",
    );
  } else {
    console.error("❌ Failed to start HTTP/SSE server");
    console.error("   Check if port 7182 is already in use");
  }
}

/**
 * Stop the HTTP/SSE server
 */
async function stopHTTPServer(): Promise<void> {
  console.log("🛑 Stopping MCP HTTP/SSE Server...\n");

  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  const pidFile = join(homeDir, ".aichaku", "mcp-http-server.pid");

  try {
    const pid = parseInt(await Deno.readTextFile(pidFile));

    if (Deno.build.os === "windows") {
      // On Windows, use taskkill
      const cmd = new Deno.Command("taskkill", {
        args: ["/F", "/PID", pid.toString()],
        stdout: "null",
        stderr: "null",
      });
      await cmd.output();
    } else {
      // On Unix, use kill
      await Deno.kill(pid, "SIGTERM");
    }

    // Remove PID file
    await Deno.remove(pidFile);

    console.log("✅ MCP HTTP/SSE Server stopped");
  } catch (error: unknown) {
    if (
      error && typeof error === "object" && "code" in error &&
      error.code === "ENOENT"
    ) {
      console.log("⚠️  MCP HTTP/SSE Server is not running");
    } else {
      console.error(
        "❌ Failed to stop server:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

/**
 * Check HTTP/SSE server status
 */
async function checkHTTPServerStatus(): Promise<void> {
  console.log("🔍 Checking Code Review Bridge Server Status...");
  console.log("");

  const isRunning = await isMCPServerRunning();

  if (isRunning) {
    console.log("✅ Code Review Bridge Server is running");
    console.log(
      "   Purpose: Bridges 'aichaku review' commands to MCP Code Reviewer",
    );
    console.log("   URL: http://127.0.0.1:7182");
    console.log("   Protocol: HTTP/SSE (Server-Sent Events)");

    // Try to get server health info
    try {
      const response = await fetch("http://127.0.0.1:7182/health");
      const health = await response.json();
      console.log(`   Active review sessions: ${health.sessions}`);
      console.log(`   Process ID: ${health.pid}`);
    } catch {
      // Ignore if health check fails
    }

    console.log("");
    console.log("   Use: aichaku review <file> to analyze code");
    console.log("   The review command will automatically use this bridge");
  } else {
    console.log("❌ Code Review Bridge Server is not running");
    console.log("   Purpose: Required for 'aichaku review' command to work");
    console.log("");
    console.log("💡 Start it with: aichaku mcp --start-server");
  }
}
