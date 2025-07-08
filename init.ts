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
const JSR_URL = `jsr:@${SCOPE}/${PACKAGE_NAME}/cli`;
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
async function installGlobal(): Promise<boolean> {
  console.log("📦 Installing Aichaku CLI globally...");

  const installArgs = [
    "install",
    "-g",
    ...PERMISSIONS,
    "-n",
    PACKAGE_NAME,
  ];

  if (args.force) {
    installArgs.push("--force");
  }

  installArgs.push(JSR_URL);

  const cmd = new Deno.Command("deno", {
    args: installArgs,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  return code === 0;
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
    console.log(`\n🔄 Upgrading...`);
  } else {
    console.log(`\n📦 Installing v${latestVersion}...`);
  }

  // Install globally
  const installSuccess = await installGlobal();
  if (!installSuccess) {
    console.error("\n❌ Installation failed!");
    Deno.exit(1);
  }

  // Initialize global methodologies
  const initSuccess = await initGlobal();
  if (!initSuccess) {
    console.error("\n❌ Failed to initialize global methodologies!");
    console.log("Try running: aichaku init --global");
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
