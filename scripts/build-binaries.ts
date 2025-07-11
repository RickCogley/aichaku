#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Build binaries for multiple platforms
 * Compiles both the CLI and MCP server for all supported platforms
 */

import { VERSION } from "../version.ts";
import { ensureDir } from "@std/fs";
import { safeReadFile } from "../src/utils/path-security.ts";

interface Platform {
  os: string;
  arch: string;
  target: string;
  name: string;
}

const PLATFORMS: Platform[] = [
  {
    os: "darwin",
    arch: "aarch64",
    target: "aarch64-apple-darwin",
    name: "macos-arm64",
  },
  {
    os: "darwin",
    arch: "x86_64",
    target: "x86_64-apple-darwin",
    name: "macos-x64",
  },
  {
    os: "linux",
    arch: "x86_64",
    target: "x86_64-unknown-linux-gnu",
    name: "linux-x64",
  },
  {
    os: "windows",
    arch: "x86_64",
    target: "x86_64-pc-windows-msvc",
    name: "windows-x64",
  },
];

async function compileCLI() {
  console.log(`🔨 Building Aichaku CLI v${VERSION} binaries...`);

  await ensureDir("./dist");

  for (const platform of PLATFORMS) {
    const ext = platform.os === "windows" ? ".exe" : "";
    const output = `./dist/aichaku-${VERSION}-${platform.name}${ext}`;

    console.log(`  📦 Building CLI for ${platform.name}...`);

    const cmd = new Deno.Command("deno", {
      args: [
        "compile",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        "--allow-net",
        "--target",
        platform.target,
        "--output",
        output,
        "cli.ts",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const result = await cmd.output();
    if (!result.success) {
      throw new Error(`Failed to compile CLI for ${platform.target}`);
    }
  }

  console.log("✅ All CLI binaries compiled successfully!");
}

async function compileMCPServer() {
  console.log(`🔨 Building MCP Server v${VERSION} binaries...`);

  await ensureDir("./dist");

  for (const platform of PLATFORMS) {
    const ext = platform.os === "windows" ? ".exe" : "";
    const output = `./dist/mcp-code-reviewer-${VERSION}-${platform.name}${ext}`;

    console.log(`  📦 Building MCP server for ${platform.name}...`);

    const cmd = new Deno.Command("deno", {
      args: [
        "compile",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        "--allow-run",
        "--target",
        platform.target,
        "--output",
        output,
        "./mcp-server/src/server.ts",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const result = await cmd.output();
    if (!result.success) {
      throw new Error(`Failed to compile MCP server for ${platform.target}`);
    }
  }

  console.log("✅ All MCP server binaries compiled successfully!");
}

async function uploadBinaries() {
  const tag = `v${VERSION}`;
  console.log(`📤 Uploading binaries to GitHub release ${tag}...`);

  const binaries = await Array.fromAsync(Deno.readDir("./dist"));

  for (const binary of binaries) {
    if (binary.isFile && binary.name.includes(VERSION)) {
      console.log(`  📦 Uploading ${binary.name}...`);

      const cmd = new Deno.Command("gh", {
        args: [
          "release",
          "upload",
          tag,
          `./dist/${binary.name}`,
          "--clobber", // Overwrite if exists
        ],
        stdout: "inherit",
        stderr: "inherit",
      });

      const result = await cmd.output();
      if (!result.success) {
        console.error(`  ❌ Failed to upload ${binary.name}`);
      } else {
        console.log(`  ✅ Uploaded ${binary.name}`);
      }
    }
  }

  console.log("✅ All binaries uploaded to GitHub release!");
}

async function createChecksums() {
  console.log("🔐 Creating checksums...");

  const entries = [];
  const binaries = await Array.fromAsync(Deno.readDir("./dist"));

  for (const binary of binaries) {
    if (binary.isFile && binary.name.includes(VERSION)) {
      const path = `./dist/${binary.name}`;
      // Security: Use safe file reading - path already includes ./dist
      const data = await safeReadFile(path, ".");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      entries.push(`${hashHex}  ${binary.name}`);
    }
  }

  const checksumContent = entries.join("\n") + "\n";
  await Deno.writeTextFile(`./dist/checksums-${VERSION}.txt`, checksumContent);
  console.log("✅ Checksums created");
}

async function main() {
  const args = new Set(Deno.args);
  const shouldUpload = args.has("--upload");
  const cliOnly = args.has("--cli-only");
  const mcpOnly = args.has("--mcp-only");

  try {
    // Compile binaries
    if (!mcpOnly) {
      await compileCLI();
    }
    if (!cliOnly) {
      await compileMCPServer();
    }

    // Create checksums
    await createChecksums();

    // Upload if requested
    if (shouldUpload) {
      await uploadBinaries();

      // Also upload the checksum file
      const tag = `v${VERSION}`;
      console.log("📤 Uploading checksum file...");

      const cmd = new Deno.Command("gh", {
        args: [
          "release",
          "upload",
          tag,
          `./dist/checksums-${VERSION}.txt`,
          "--clobber",
        ],
        stdout: "inherit",
        stderr: "inherit",
      });

      await cmd.output();
    }

    console.log("\n🎉 Build complete!");
    console.log(`📁 Binaries are in ./dist/`);
  } catch (error) {
    console.error("❌ Build failed:", error);
    Deno.exit(1);
  }
}

// Usage information
if (Deno.args.includes("--help")) {
  console.log(`
Build binaries for Aichaku

Usage:
  deno run -A scripts/build-binaries.ts [options]

Options:
  --upload      Upload binaries to GitHub release after building
  --cli-only    Only build CLI binaries
  --mcp-only    Only build MCP server binaries
  --help        Show this help message

Examples:
  # Build all binaries
  deno run -A scripts/build-binaries.ts

  # Build and upload to release
  deno run -A scripts/build-binaries.ts --upload

  # Build only CLI
  deno run -A scripts/build-binaries.ts --cli-only
  `);
  Deno.exit(0);
}

// Run main
if (import.meta.main) {
  await main();
}
