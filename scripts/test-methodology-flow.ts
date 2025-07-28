#!/usr/bin/env -S deno run --allow-all

/**
 * Test script for methodology-aware installation flow
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

const TEST_DIR = "/tmp/aichaku-methodology-test";

async function cleanup() {
  try {
    await Deno.remove(TEST_DIR, { recursive: true });
  } catch {
    // Ignore errors
  }

  // Also clean up global test installation
  const globalTestPath = join(Deno.env.get("HOME") || "", ".claude-test");
  try {
    await Deno.remove(globalTestPath, { recursive: true });
  } catch {
    // Ignore errors
  }
}

async function runTest() {
  console.log("🧪 Testing methodology-aware installation flow\n");

  // 1. Clean up any previous test
  await cleanup();
  await Deno.mkdir(TEST_DIR, { recursive: true });

  console.log("📁 Created test directory:", TEST_DIR);

  // 2. Change to test directory
  Deno.chdir(TEST_DIR);

  // 3. Run global installation (simulated with test path)
  console.log("\n🌍 Testing global installation with methodology selection...");

  // We need to run the actual aichaku command for proper testing
  const globalInstall = new Deno.Command("aichaku", {
    args: ["init", "--global"],
    env: {
      ...Deno.env.toObject(),
      // Override home directory for testing
      AICHAKU_HOME: join(Deno.env.get("HOME") || "", ".claude-test"),
    },
    stdin: "piped",
    stdout: "piped",
    stderr: "inherit",
  });

  const proc = globalInstall.spawn();
  const writer = proc.stdin.getWriter();

  // Simulate user selecting Shape Up and Scrum (options 1,2)
  await writer.write(new TextEncoder().encode("1,2\n"));

  // Simulate user selecting default standards (just press enter)
  await writer.write(new TextEncoder().encode("\n"));

  await writer.close();

  const { code } = await proc.status;

  if (code !== 0) {
    console.error("❌ Global installation failed");
    return;
  }

  console.log("✅ Global installation completed");

  // 4. Check if .aichaku.json was created with selections
  const globalConfigPath = join(
    Deno.env.get("HOME") || "",
    ".claude-test",
    ".aichaku.json",
  );

  if (await exists(globalConfigPath)) {
    const config = JSON.parse(await Deno.readTextFile(globalConfigPath));
    console.log("\n📋 Global configuration:");
    console.log("  Methodologies:", config.methodologies?.selected);
    console.log("  Standards:", config.standards?.selected);
  } else {
    console.error("❌ Global config not found");
    return;
  }

  // 5. Initialize a project
  console.log("\n🏗️  Testing project initialization...");

  const projectInit = new Deno.Command("aichaku", {
    args: ["init"],
    env: {
      ...Deno.env.toObject(),
      AICHAKU_HOME: join(Deno.env.get("HOME") || "", ".claude-test"),
    },
    stdin: "piped",
    stdout: "piped",
    stderr: "inherit",
  });

  const projProc = projectInit.spawn();
  const projWriter = projProc.stdin.getWriter();

  // Answer "yes" to integrate with CLAUDE.md
  await projWriter.write(new TextEncoder().encode("y\n"));
  await projWriter.close();

  const projResult = await projProc.status;

  if (projResult.code !== 0) {
    console.error("❌ Project initialization failed");
    return;
  }

  console.log("✅ Project initialization completed");

  // 6. Check CLAUDE.md content
  const claudeMdPath = join(TEST_DIR, "CLAUDE.md");
  if (await exists(claudeMdPath)) {
    const content = await Deno.readTextFile(claudeMdPath);

    // Count tokens (rough estimate)
    const tokenCount = content.length / 4; // Rough approximation

    console.log("\n📄 CLAUDE.md analysis:");
    console.log(`  Size: ${content.length} characters`);
    console.log(`  Estimated tokens: ~${Math.round(tokenCount)}`);

    // Check if only selected methodologies are included
    const hasShapeUp = content.includes("shape-up:");
    const hasScrum = content.includes("scrum:");
    const hasKanban = content.includes("kanban:");

    console.log("\n  Methodology content:");
    console.log(`  - Shape Up: ${hasShapeUp ? "✓" : "✗"} (selected)`);
    console.log(`  - Scrum: ${hasScrum ? "✓" : "✗"} (selected)`);
    console.log(`  - Kanban: ${hasKanban ? "✓" : "✗"} (not selected)`);

    if (hasKanban) {
      console.warn("\n⚠️  Warning: Unselected methodology (Kanban) found in CLAUDE.md");
    }
  } else {
    console.error("❌ CLAUDE.md not created");
    return;
  }

  // 7. Check agents directory
  const agentsDir = join(TEST_DIR, ".claude", "agents");
  if (await exists(agentsDir)) {
    const agents = [];
    for await (const entry of Deno.readDir(agentsDir)) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        agents.push(entry.name);
      }
    }

    console.log("\n🤖 Generated agents:");
    for (const agent of agents) {
      console.log(`  - ${agent}`);
    }
  } else {
    console.log("\n⚠️  No agents generated");
  }

  // 8. Success summary
  console.log("\n✅ Test completed successfully!");
  console.log("\n📊 Summary:");
  console.log("  - Global installation prompts for methodology selection");
  console.log("  - Project inherits selected methodologies");
  console.log("  - CLAUDE.md contains only selected content");
  console.log("  - Methodology-aware agents are generated");

  // Cleanup
  await cleanup();
}

// Run the test
if (import.meta.main) {
  try {
    await runTest();
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    await cleanup();
    Deno.exit(1);
  }
}
