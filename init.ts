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
  const response = await fetch(
    `https://jsr.io/@${SCOPE}/${PACKAGE_NAME}/meta.json`,
  );
  const data = await response.json();
  return data.latest;
}

// Install Aichaku globally
async function installGlobal(
  version: string,
  isUpgrade: boolean,
): Promise<boolean> {
  console.log("📦 Installing Aichaku CLI globally...");

  const installArgs = [
    "install",
    "-g",
    ...PERMISSIONS,
    "-n",
    PACKAGE_NAME,
  ];

  if (args.force || isUpgrade) {
    installArgs.push("--force");
    // Add --reload for upgrades to bypass cache
    if (isUpgrade) {
      installArgs.push("--reload");
      console.log("   • Clearing Deno cache...");
    }
  }

  // Always specify exact version
  const versionedUrl = `jsr:@${SCOPE}/${PACKAGE_NAME}@${version}/cli`;
  installArgs.push(versionedUrl);
  console.log(`   • Installing v${version}...`);

  const cmd = new Deno.Command("deno", {
    args: installArgs,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  return code === 0;
}

// Initialize global methodologies
async function initGlobal(isUpgrade: boolean = false): Promise<boolean> {
  console.log("\n🌍 Setting up global methodologies...");

  const initArgs = ["init", "--global", "--silent"];
  if (isUpgrade) {
    initArgs.push("--force");
  }

  const cmd = new Deno.Command("aichaku", {
    args: initArgs,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  return code === 0;
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

  // Check current version
  const currentVersion = await getCurrentVersion();
  const latestVersion = await getLatestVersion();

  if (currentVersion && !args.force) {
    console.log(`\n✅ Aichaku v${currentVersion} is already installed!`);
    console.log(
      `\n💡 Use --force to reinstall or upgrade to v${latestVersion}`,
    );

    // Still offer to init project if not global-only
    if (!args["global-only"]) {
      console.log(`\n🤔 Initialize current directory as an Aichaku project?`);
      const response = prompt("(y/N):");
      if (response?.toLowerCase() === "y") {
        await initProject();
      }
    }
    return;
  }

  // Show version info
  if (currentVersion) {
    console.log(`\n📦 Current: v${currentVersion}`);
    console.log(`📦 Latest:  v${latestVersion}`);
    console.log(`\n🔄 Upgrading Aichaku...`);
  } else {
    console.log(`\n📦 Installing v${latestVersion}...`);
  }

  // Install globally
  const isUpgrade = !!currentVersion;
  const installSuccess = await installGlobal(latestVersion, isUpgrade);
  if (!installSuccess) {
    console.error("\n❌ Installation failed!");
    console.error("\n🔧 Manual fix required:");
    console.error(
      `   deno install -g -A -n aichaku --force --reload jsr:@rick/aichaku@${latestVersion}/cli`,
    );
    Deno.exit(1);
  }

  // Verify installation
  console.log("   • Verifying installation...");
  const installedVersion = await getCurrentVersion();
  if (installedVersion !== latestVersion) {
    console.error("\n❌ Installation verification failed!");
    console.error(`   Expected: v${latestVersion}`);
    console.error(`   Actual:   v${installedVersion || "not found"}`);
    console.error("\n🔧 Manual fix required:");
    console.error(
      `   deno cache --reload jsr:@rick/aichaku@${latestVersion}/cli`,
    );
    console.error(
      `   deno install -g -A -n aichaku --force jsr:@rick/aichaku@${latestVersion}/cli`,
    );
    Deno.exit(1);
  }
  console.log("   ✓ Installation verified");

  // Initialize global methodologies
  console.log("\n🌍 Setting up global methodologies...");
  const initSuccess = await initGlobal(isUpgrade);
  if (!initSuccess) {
    console.error("\n❌ Failed to initialize global methodologies!");

    if (isUpgrade) {
      console.error("\n📝 This usually happens when upgrading.");
      console.error("   Your methodologies are from an older version.\n");
      console.error("🔧 To fix this, run:");
      console.error(`   aichaku upgrade --global`);
    } else {
      console.error("\n📝 To manually initialize:");
      console.error(`   aichaku init --global`);
    }

    console.error(
      "\n📚 If issues persist: https://github.com/RickCogley/aichaku/issues",
    );
    Deno.exit(1);
  }

  console.log(`\n✅ Aichaku v${latestVersion} installed successfully!`);

  // Initialize current project unless global-only
  if (!args["global-only"]) {
    console.log(`\n📁 Initialize current directory as an Aichaku project?`);
    const response = prompt("(Y/n):");
    if (!response || response.toLowerCase() !== "n") {
      await initProject();
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
}

// Run installer
if (import.meta.main) {
  await main();
}
