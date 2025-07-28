#!/usr/bin/env -S deno run --allow-run --allow-read

/**
 * Check if TypeScript/JavaScript files are properly formatted
 * Excludes markdown files to avoid emphasis style conflicts
 */

import { walk } from "jsr:@std/fs@^1.0.0/walk";

// Find all TypeScript/JavaScript files, excluding markdown
const files: string[] = [];
for await (
  const entry of walk(".", {
    includeDirs: false,
    exts: ["ts", "js", "tsx", "jsx", "json", "jsonc"],
    skip: [/node_modules/, /\.git/, /dist/, /\.claude/],
  })
) {
  files.push(entry.path);
}

if (files.length === 0) {
  console.log("✅ No TypeScript/JavaScript files to check");
  Deno.exit(0);
}

// Run format check on non-markdown files only
const command = new Deno.Command("deno", {
  args: ["fmt", "--check", ...files],
  stdout: "inherit",
  stderr: "inherit",
});

const result = await command.output();

if (!result.success) {
  console.error("❌ Format check failed for TypeScript/JavaScript files");
  Deno.exit(1);
}

console.log("✅ TypeScript/JavaScript format check passed");
