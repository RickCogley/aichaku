#!/usr/bin/env -S deno run --allow-run

/**
 * Format all files in the project
 * 1. Run deno fmt to format code (including code blocks in markdown)
 * 2. Run markdownlint to fix markdown emphasis style back to asterisks
 */

console.log("🎨 Formatting TypeScript and code blocks...");
const denoFmt = new Deno.Command("deno", {
  args: ["fmt"],
  stdout: "inherit",
  stderr: "inherit",
});

const denoResult = await denoFmt.output();
if (!denoResult.success) {
  console.error("❌ Deno format failed");
  Deno.exit(1);
}

console.log("🎨 Fixing markdown emphasis style...");
const markdownFmt = new Deno.Command("markdownlint-cli2", {
  args: ["--fix", "**/*.md"],
  stdout: "inherit",
  stderr: "inherit",
});

const mdResult = await markdownFmt.output();
// Note: markdownlint-cli2 returns non-zero exit code when it finds issues,
// even if it fixes them. We only care if it actually fails to run.
if (mdResult.code > 1) {
  console.error("❌ Markdown format failed");
  Deno.exit(1);
}

console.log("✅ All formatting complete!");
