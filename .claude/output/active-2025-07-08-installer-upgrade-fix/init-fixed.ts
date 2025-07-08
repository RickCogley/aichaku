#!/usr/bin/env -S deno run --allow-net --allow-run --allow-read --allow-write --allow-env

/**
 * Aichaku installer - Simple one-command installation
 *
 * Usage:
 *   deno run -A https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";

const PACKAGE_NAME = "aichaku";
const SCOPE = "rick";
const PERMISSIONS = ["--allow-read", "--allow-write", "--allow-env"];

// Parse arguments
const args = parseArgs(Deno.args, {
  boolean: ["help", "force", "global-only"],
  alias: {
    h: "help",
    f: "force",
    g: "global-only",
  },
});

// Show help
if (args.help) {
  console.log(`
🪴 Aichaku Installer

Usage:
  deno run -A https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts [options]

Options:
  -f, --force         Force reinstall if already installed
  -g, --global-only   Only install globally (skip project init)
  -h, --help          Show this help message

Examples:
  # Fresh install
  deno run -A https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts

  # Reinstall/upgrade
  deno run -A https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts --force
`);
  Deno.exit(0);
}

// Get current installed version
async function getCurrentVersion(): Promise<string | null> {
  try {
    const cmd = new Deno.Command("aichaku", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stdout } = await cmd.output();

    if (code === 0) {
      const output = new TextDecoder().decode(stdout).trim();
      const match = output.match(/v?(\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    }
  } catch {
    // Command not found
  }
  return null;
}

// Get latest version from JSR
async function getLatestVersion(): Promise<string> {
  try {
    console.log("🔍 Checking latest version...");
    const response = await fetch(
      `https://jsr.io/@${SCOPE}/${PACKAGE_NAME}/meta.json`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }
    const data = await response.json();
    return data.latest;
  } catch (error) {
    console.error("❌ Failed to check latest version:", error.message);
    throw error;
  }
}

// Install Aichaku globally with version pinning
async function installGlobal(version: string, isUpgrade: boolean = false): Promise<boolean> {
  console.log(`📦 ${isUpgrade ? 'Upgrading' : 'Installing'} Aichaku CLI globally...`);

  const installArgs = [
    "install",
    "-g",
    ...PERMISSIONS,
    "-n",
    PACKAGE_NAME,
  ];

  // For upgrades or force reinstall, add --reload to bypass cache
  if (isUpgrade || args.force) {
    installArgs.push("--reload");
  }

  if (args.force) {
    installArgs.push("--force");
  }

  // CRITICAL: Include version in JSR URL to ensure correct version is installed
  const jsrUrl = `jsr:@${SCOPE}/${PACKAGE_NAME}@${version}/cli`;
  installArgs.push(jsrUrl);

  console.log(`   Target version: v${version}`);
  if (isUpgrade) {
    console.log(`   Using --reload to bypass cache`);
  }

  const cmd = new Deno.Command("deno", {
    args: installArgs,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  
  if (code === 0) {
    // Verify the installation succeeded
    console.log("\n🔍 Verifying installation...");
    const installedVersion = await getCurrentVersion();
    
    if (installedVersion === version) {
      console.log(`✅ Successfully installed v${installedVersion}`);
      return true;
    } else {
      console.error(`\n⚠️  Installation verification failed!`);
      console.error(`   Expected: v${version}`);
      console.error(`   Actual: v${installedVersion || 'unknown'}`);
      console.error(`\n💡 Try manual installation:`);
      console.error(`   deno install -g --reload -A -n aichaku ${jsrUrl}`);
      return false;
    }
  }
  
  return false;
}

// Initialize global methodologies
async function initGlobal(): Promise<boolean> {
  console.log("\n🌍 Setting up global methodologies...");

  const cmd = new Deno.Command("aichaku", {
    args: ["init", "--global", "--silent"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  
  if (code !== 0) {
    console.error("\n❌ Failed to initialize global methodologies!");
    console.error("\nPossible causes:");
    console.error("  • Version mismatch between CLI and methodologies");
    console.error("  • Insufficient permissions for ~/.claude directory");
    console.error("  • Network issues downloading methodologies");
    console.error("\nRecovery steps:");
    console.error("  1. Try running manually:");
    console.error("     aichaku init --global");
    console.error("  2. If that fails, uninstall and retry:");
    console.error("     deno uninstall -g aichaku");
    console.error("     rm -rf ~/.claude/methodologies");
    console.error("  3. Then run this installer again");
    return false;
  }
  
  return true;
}

// Initialize current project (if not global-only)
async function initProject(): Promise<boolean> {
  console.log("\n📁 Initializing current project...");

  const cmd = new Deno.Command("aichaku", {
    args: ["init"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  return code === 0;
}

// Main installation flow
async function main() {
  console.log(`🪴 Aichaku Installer`);
  console.log(`━━━━━━━━━━━━━━━━━━━━`);

  try {
    // Check current version
    const currentVersion = await getCurrentVersion();
    const latestVersion = await getLatestVersion();

    // Handle already installed case
    if (currentVersion && !args.force) {
      if (currentVersion === latestVersion) {
        console.log(`\n✅ Aichaku v${currentVersion} is already installed and up to date!`);
        
        // Still offer to init project if not global-only
        if (!args["global-only"]) {
          console.log(`\n🤔 Initialize current directory as an Aichaku project?`);
          const response = prompt("(y/N):");
          if (response?.toLowerCase() === "y") {
            await initProject();
          }
        }
        return;
      } else {
        console.log(`\n📦 Update available!`);
        console.log(`   Current: v${currentVersion}`);
        console.log(`   Latest:  v${latestVersion}`);
        console.log(`\n💡 Use --force to upgrade`);
        return;
      }
    }

    // Show version info
    const isUpgrade = !!currentVersion;
    if (isUpgrade) {
      console.log(`\n🔄 Upgrading Aichaku...`);
      console.log(`   Current: v${currentVersion}`);
      console.log(`   Target:  v${latestVersion}`);
    } else {
      console.log(`\n📦 Installing Aichaku v${latestVersion}...`);
    }

    // Install globally with version pinning
    const installSuccess = await installGlobal(latestVersion, isUpgrade);
    if (!installSuccess) {
      console.error("\n❌ Installation failed!");
      Deno.exit(1);
    }

    // Initialize global methodologies
    const initSuccess = await initGlobal();
    if (!initSuccess) {
      // Error messages already shown in initGlobal()
      Deno.exit(1);
    }

    console.log(`\n✨ Aichaku v${latestVersion} ready to use!`);

    // Initialize current project unless global-only
    if (!args["global-only"]) {
      console.log(`\n📁 Initialize current directory as an Aichaku project?`);
      const response = prompt("(Y/n):");
      if (!response || response.toLowerCase() !== "n") {
        const projectSuccess = await initProject();
        if (!projectSuccess) {
          console.log("\n⚠️  Project initialization failed");
          console.log("   You can run 'aichaku init' manually later");
        }
      }
    }

    // Show next steps
    console.log(`
💡 Next steps:
   ${
      args["global-only"]
        ? "• Run 'aichaku init' in any project"
        : "• Start using natural language with Claude Code"
    }
   • Say "let's shape a feature" or "plan our sprint"
   • Documents appear in .claude/output/
   
📚 Learn more: https://github.com/RickCogley/aichaku
`);
  } catch (error) {
    console.error("\n❌ Installation failed:", error.message);
    console.error("\nPlease report this issue:");
    console.error("https://github.com/RickCogley/aichaku/issues");
    Deno.exit(1);
  }
}

// Run installer
if (import.meta.main) {
  await main();
}