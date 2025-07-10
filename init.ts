#!/usr/bin/env -S deno run --allow-net --allow-run --allow-read --allow-write --allow-env

/**
 * Aichaku installer - Simple one-command installation
 *
 * Usage:
 *   deno run -A https://raw.githubusercontent.com/RickCogley/aichaku/main/init.ts
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { getAichakuPaths, formatPathForDisplay } from "./src/paths.ts";

const PACKAGE_NAME = "aichaku";
const SCOPE = "rick";
const PERMISSIONS = [
  "--allow-read",
  "--allow-write",
  "--allow-env",
  "--allow-net",
  "--allow-run", // Needed for git commands and other tools
];

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
  if (isUpgrade || args.force) {
    initArgs.push("--force");
  }

  // Pass network permissions for methodology fetching from GitHub
  const cmd = new Deno.Command("aichaku", {
    args: initArgs,
    stdout: "piped",
    stderr: "piped",
    // Explicitly pass permissions to subprocess
    env: {
      ...Deno.env.toObject(),
      DENO_PERMISSIONS:
        "--allow-read --allow-write --allow-env --allow-net --allow-run",
    },
  });

  const { code, stdout } = await cmd.output();

  if (code === 0) {
    // Parse the output to get file count
    const output = new TextDecoder().decode(stdout);
    const match = output.match(/(\d+) files? (?:verified|ready)/);
    if (match) {
      console.log(`   ✓ ${match[1]} methodology files ready`);
    }
    console.log(`   ✓ User customizations preserved`);
    console.log(`   ✓ Output directories created`);
  }

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
  console.log(`🪴 Aichaku Installer - Methodology Support for Claude Code`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

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

  // Show methodologies path (CLI path already shown by Deno)
  const paths = getAichakuPaths();
  const methodologyPath = formatPathForDisplay(paths.global.methodologies);

  console.log(`   📚 Methodologies: ${methodologyPath}`);

  // Verify installation (with retry for PATH updates)
  console.log("   • Verifying installation...");
  let installedVersion = await getCurrentVersion();

  // If version check fails, wait a moment and retry (PATH might not be updated)
  if (!installedVersion || installedVersion !== latestVersion) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    installedVersion = await getCurrentVersion();
  }

  if (installedVersion !== latestVersion) {
    console.error(
      "\n⚠️  Version verification shows v" + (installedVersion || "unknown"),
    );
    console.error(`   Expected: v${latestVersion}`);

    // Don't fail hard - the installation likely succeeded
    console.log("\n📝 This might be a PATH issue. Try:");
    console.log("   1. Open a new terminal");
    console.log("   2. Run: aichaku --version");
    console.log(`   3. If still showing old version, run:`);
    console.log(
      `      deno install -g -A -n aichaku --force --reload jsr:@rick/aichaku@${latestVersion}/cli`,
    );
  } else {
    console.log("   ✓ Installation verified");
  }

  // Initialize global methodologies
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

  // Show single success message after all installation steps
  console.log(`\n✅ Aichaku v${latestVersion} ready!`);

  // Initialize current project unless global-only
  let projectInitialized = false;
  if (!args["global-only"]) {
    console.log(`\n📁 Initialize current directory as an Aichaku project?`);
    const response = prompt("(Y/n):");
    if (!response || response.toLowerCase() !== "n") {
      projectInitialized = await initProject();
    } else {
      console.log("\n⏭️  Skipped project initialization");
    }
  }

  // Show next steps
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Next steps:
   ${
    !projectInitialized
      ? "• Run 'aichaku init' (new) or 'aichaku upgrade' (existing) in your Claude Code projects"
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
