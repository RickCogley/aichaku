#!/usr/bin/env -S deno run --allow-net --allow-run --allow-read

/**
 * Enhanced installation script for Aichaku
 * Provides version feedback and clear next steps
 */

const PACKAGE_NAME = "aichaku";
const SCOPE = "rick";
const JSR_URL = `https://jsr.io/@${SCOPE}/${PACKAGE_NAME}`;

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
      // Extract version from "aichaku v0.7.0"
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
  const response = await fetch(`${JSR_URL}/meta.json`);
  const data = await response.json();
  return data.latest;
}

// Install Aichaku
async function install(force: boolean = false): Promise<boolean> {
  const args = [
    "install",
    "-g",
    "-A",
    "-n",
    PACKAGE_NAME,
  ];

  if (force) {
    args.push("--force");
  }

  // Always use latest by not specifying version
  args.push(`jsr:@${SCOPE}/${PACKAGE_NAME}/cli`);

  const cmd = new Deno.Command("deno", {
    args,
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();
  return code === 0;
}

// Main installation flow
async function main() {
  console.log(`🪴 Aichaku Global Installation`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Check current version
  const currentVersion = await getCurrentVersion();
  const latestVersion = await getLatestVersion();

  if (currentVersion) {
    console.log(`📦 Current: v${currentVersion}`);
    console.log(`📦 Latest:  v${latestVersion}`);

    if (currentVersion === latestVersion) {
      console.log(`\n✅ Already up to date!`);
      return;
    }
  } else {
    console.log(`📦 Installing: v${latestVersion}`);
  }

  console.log(`\n🔄 Installing...`);

  const success = await install(!!currentVersion);

  if (success) {
    console.log(
      `\n✅ Successfully ${currentVersion ? "upgraded" : "installed"}!`,
    );
    console.log(`\n📚 Next steps for your projects:`);
    console.log(`   • Run 'aichaku init' in new projects`);
    if (currentVersion) {
      console.log(`   • Run 'aichaku upgrade' in existing projects`);
      console.log(`   • Or 'aichaku integrate --force' to update CLAUDE.md`);
    }
    console.log(`\n💡 Verify installation: aichaku --version`);
  } else {
    console.error(`\n❌ Installation failed`);
    Deno.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  await main();
}
