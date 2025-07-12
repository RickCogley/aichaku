#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env --allow-net --allow-sys

/**
 * Bootstrap release script for aichaku
 *
 * This is a one-time script to handle the catch-22 situation where
 * the new GitHub upload command isn't available until after release.
 *
 * After this release, the normal nagare release process will use
 * the new `aichaku github release upload` command.
 */

import { resolve } from "@std/path";

console.log("🚀 Bootstrap Release Script for Aichaku");
console.log("=====================================");
console.log(
  "This script handles the chicken-and-egg problem for the first release",
);
console.log("with the new GitHub MCP integration.\n");

// Step 1: Build binaries
console.log("📦 Step 1: Building binaries...");
const buildCmd = new Deno.Command("deno", {
  args: ["run", "-A", "./scripts/build-binaries.ts"],
  stdout: "inherit",
  stderr: "inherit",
});

const buildResult = await buildCmd.output();
if (!buildResult.success) {
  console.error("❌ Binary build failed");
  Deno.exit(1);
}

console.log("✅ Binaries built successfully\n");

// Step 2: Get the latest tag
console.log("🏷️  Step 2: Getting latest tag...");
const tagCmd = new Deno.Command("git", {
  args: ["describe", "--tags", "--abbrev=0"],
  stdout: "piped",
});

const tagResult = await tagCmd.output();
if (!tagResult.success) {
  console.error("❌ Failed to get latest tag");
  Deno.exit(1);
}

const tag = new TextDecoder().decode(tagResult.stdout).trim();
console.log(`📌 Latest tag: ${tag}\n`);

// Step 3: Find binary files
console.log("🔍 Step 3: Finding binary files...");
const files: string[] = [];
for await (const entry of Deno.readDir("./dist")) {
  if (
    entry.isFile &&
    (entry.name.endsWith(".tar.gz") || entry.name.endsWith(".zip"))
  ) {
    files.push(resolve("./dist", entry.name));
  }
}

if (files.length === 0) {
  console.error("❌ No binary files found in dist/");
  Deno.exit(1);
}

console.log(`📦 Found ${files.length} files to upload:`);
files.forEach((f) => console.log(`   - ${f}`));
console.log();

// Step 4: Upload to GitHub using gh CLI directly
console.log("🚀 Step 4: Uploading to GitHub release...");

for (const file of files) {
  console.log(`   Uploading ${file}...`);
  const uploadCmd = new Deno.Command("gh", {
    args: [
      "release",
      "upload",
      tag,
      file,
      "--clobber", // Overwrite if exists
    ],
    stdout: "inherit",
    stderr: "inherit",
  });

  const uploadResult = await uploadCmd.output();
  if (!uploadResult.success) {
    console.error(`❌ Failed to upload ${file}`);
    // Continue with other files
  } else {
    console.log(`   ✅ Uploaded successfully`);
  }
}

console.log("\n✨ Bootstrap release complete!");
console.log("\nNext steps:");
console.log("1. Run: aichaku upgrade --global");
console.log("2. Future releases will use: aichaku github release upload");
console.log("\nThe new seamless GitHub MCP integration is now available!");
