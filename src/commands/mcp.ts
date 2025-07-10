/**
 * MCP (Model Context Protocol) command for Aichaku
 * Manages MCP server installation and configuration
 */

import { ensureDir, exists } from "@std/fs";
import { join } from "@std/path";

export interface MCPOptions {
  install?: boolean;
  config?: boolean;
  status?: boolean;
  help?: boolean;
}

export async function runMCPCommand(options: MCPOptions): Promise<void> {
  if (options.help) {
    showMCPHelp();
    return;
  }

  if (options.install) {
    await installMCPServer();
  } else if (options.config) {
    await configureMCPServer();
  } else if (options.status) {
    await checkMCPStatus();
  } else {
    // Default: show status
    await checkMCPStatus();
  }
}

function showMCPHelp(): void {
  console.log(`
🪴 Aichaku MCP (Model Context Protocol) Server

The MCP server provides automated security and standards review for Claude Code.

Usage:
  aichaku mcp [options]

Options:
  --install    Install the MCP server
  --config     Configure Claude Code to use the MCP server
  --status     Check MCP server status (default)
  --help       Show this help message

Features:
  • Security scanning (OWASP Top 10 vulnerabilities)
  • Standards compliance (15-Factor, TDD, etc.)
  • Methodology validation (Shape Up, Scrum, Kanban)
  • TypeScript best practices
  • Educational feedback
  • External tool integration (CodeQL, DevSkim, Semgrep)

Example:
  # Install MCP server
  aichaku mcp --install

  # Configure Claude Code
  aichaku mcp --config

  # Check status
  aichaku mcp --status

Learn more: https://github.com/RickCogley/aichaku/tree/main/mcp-server
`);
}

async function installMCPServer(): Promise<void> {
  console.log("📦 Installing Aichaku MCP Server...\n");

  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error("❌ Could not determine home directory");
    return;
  }

  const mcpDir = join(homeDir, ".aichaku", "mcp-server");
  await ensureDir(mcpDir);

  try {
    // Download the compiled MCP server from GitHub releases
    const version = "0.17.0"; // TODO: Get from version.ts
    const platform = Deno.build.os;
    const arch = Deno.build.arch;

    let binaryName = "mcp-code-reviewer";
    if (platform === "darwin" && arch === "aarch64") {
      binaryName = "mcp-code-reviewer-mac";
    } else if (platform === "linux") {
      binaryName = "mcp-code-reviewer-linux";
    } else if (platform === "windows") {
      binaryName = "mcp-code-reviewer.exe";
    }

    const downloadUrl =
      `https://github.com/RickCogley/aichaku/releases/download/v${version}/${binaryName}`;
    const targetPath = join(
      mcpDir,
      platform === "windows" ? "mcp-code-reviewer.exe" : "mcp-code-reviewer",
    );

    console.log(`📥 Downloading MCP server for ${platform}-${arch}...`);
    console.log(`   From: ${downloadUrl}`);
    console.log(`   To: ${targetPath}\n`);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
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
      `❌ Installation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    console.error("\n💡 Alternative: Install from source:");
    console.error("   git clone https://github.com/RickCogley/aichaku");
    console.error("   cd aichaku/mcp-server");
    console.error("   deno task compile");
  }
}

async function configureMCPServer(): Promise<void> {
  console.log("🔧 Configuring Claude Code for MCP Server...\n");

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

  // Check if MCP server is installed
  if (!await exists(mcpBinary)) {
    console.error("❌ MCP server not installed");
    console.error("   Run 'aichaku mcp --install' first");
    return;
  }

  // Create MCP configuration
  const mcpConfig = {
    mcpServers: {
      "aichaku-reviewer": {
        command: mcpBinary,
        args: [],
        env: {},
      },
    },
  };

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
  console.log("   2. The MCP server will be available as 'aichaku-reviewer'");
  console.log(
    "   3. Claude can use review_file, review_methodology, and get_standards tools",
  );
}

async function checkMCPStatus(): Promise<void> {
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
