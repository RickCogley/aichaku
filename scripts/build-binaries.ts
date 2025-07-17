#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Build binaries for multiple platforms
 * Compiles both the CLI and MCP server for all supported platforms
 */

import { VERSION } from "../version.ts";
import { ensureDir, walk } from "@std/fs";
import { safeReadFile } from "../src/utils/path-security.ts";
import { basename } from "@std/path";

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
        "--allow-run",
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

async function compileMCPServers() {
  console.log(`🔨 Building MCP Servers v${VERSION} binaries...`);

  await ensureDir("./dist");

  // Build Aichaku MCP Server
  for (const platform of PLATFORMS) {
    const ext = platform.os === "windows" ? ".exe" : "";
    const output =
      `./dist/aichaku-code-reviewer-${VERSION}-${platform.name}${ext}`;

    console.log(`  📦 Building Aichaku MCP server for ${platform.name}...`);

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
        "./mcp/aichaku-mcp-server/src/server.ts",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const result = await cmd.output();
    if (!result.success) {
      throw new Error(
        `Failed to compile Aichaku MCP server for ${platform.target}`,
      );
    }
  }

  // Build GitHub MCP Server
  for (const platform of PLATFORMS) {
    const ext = platform.os === "windows" ? ".exe" : "";
    const output = `./dist/github-operations-${VERSION}-${platform.name}${ext}`;

    console.log(`  📦 Building GitHub MCP server for ${platform.name}...`);

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
        "./mcp/github-mcp-server/src/server.ts",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const result = await cmd.output();
    if (!result.success) {
      throw new Error(
        `Failed to compile GitHub MCP server for ${platform.target}`,
      );
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

async function runPreflightChecks(): Promise<void> {
  console.log("🔍 Running preflight checks...");

  // Check for formatting issues
  console.log("  📝 Checking formatting...");
  const fmtResult = await new Deno.Command("deno", {
    args: ["fmt", "--check"],
    stdout: "piped",
    stderr: "piped",
  }).output();

  if (!fmtResult.success) {
    console.error("❌ Code formatting issues found. Run 'deno fmt' to fix.");
    throw new Error("Preflight check failed: formatting");
  }

  // Check TypeScript compilation
  console.log("  🔍 Type checking...");
  const checkResult = await new Deno.Command("deno", {
    args: ["check", "cli.ts"],
    stdout: "piped",
    stderr: "piped",
  }).output();

  if (!checkResult.success) {
    console.error("❌ TypeScript compilation errors found.");
    console.error(new TextDecoder().decode(checkResult.stderr));
    throw new Error("Preflight check failed: type checking");
  }

  // Check MCP servers
  const mcpPaths = [
    "mcp/aichaku-mcp-server/src/server.ts",
    "mcp/github-mcp-server/src/server.ts",
  ];

  for (const mcpPath of mcpPaths) {
    console.log(`  🔍 Type checking ${mcpPath}...`);
    const mcpCheckResult = await new Deno.Command("deno", {
      args: ["check", mcpPath],
      stdout: "piped",
      stderr: "piped",
    }).output();

    if (!mcpCheckResult.success) {
      console.error(`❌ TypeScript compilation errors in ${mcpPath}`);
      console.error(new TextDecoder().decode(mcpCheckResult.stderr));
      throw new Error(`Preflight check failed: ${mcpPath} type checking`);
    }
  }

  // Check linting
  console.log("  🧹 Linting...");
  const lintResult = await new Deno.Command("deno", {
    args: ["lint"],
    stdout: "piped",
    stderr: "piped",
  }).output();

  if (!lintResult.success) {
    console.error("❌ Linting issues found.");
    console.error(new TextDecoder().decode(lintResult.stderr));
    throw new Error("Preflight check failed: linting");
  }

  console.log("✅ All preflight checks passed!");
}

async function cleanupOldBinaries(): Promise<void> {
  const KEEP_VERSIONS = 3;
  const DIST_DIR = "./dist";
  
  console.log("🧹 Cleaning up old binaries...");
  
  // Ensure dist directory exists
  await ensureDir(DIST_DIR);
  
  interface BinaryFile {
    path: string;
    version: string;
    name: string;
    size: number;
  }
  
  const binaries: BinaryFile[] = [];
  
  // Collect all binary files
  try {
    for await (const entry of walk(DIST_DIR, { includeFiles: true })) {
      const filename = basename(entry.path);
      
      // Match version pattern in filename
      const versionMatch = filename.match(/(\d+\.\d+\.\d+)/);
      if (!versionMatch) continue;
      
      const stat = await Deno.stat(entry.path);
      binaries.push({
        path: entry.path,
        version: versionMatch[1],
        name: filename,
        size: stat.size
      });
    }
  } catch (error) {
    // If dist directory doesn't exist or is empty, that's fine
    console.log("  📁 No existing binaries to clean up");
    return;
  }
  
  if (binaries.length === 0) {
    console.log("  📁 No versioned binaries found to clean up");
    return;
  }
  
  // Group by binary type (aichaku, aichaku-code-reviewer, etc.)
  const grouped = new Map<string, BinaryFile[]>();
  
  for (const binary of binaries) {
    const baseName = binary.name.replace(/-\d+\.\d+\.\d+.*$/, '');
    if (!grouped.has(baseName)) {
      grouped.set(baseName, []);
    }
    grouped.get(baseName)!.push(binary);
  }
  
  // Sort and clean up each group
  let totalDeleted = 0;
  let totalSize = 0;
  
  for (const [baseName, files] of grouped) {
    // Sort by version (descending)
    files.sort((a, b) => {
      const versionA = a.version.split('.').map(Number);
      const versionB = b.version.split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
        if (versionA[i] !== versionB[i]) {
          return versionB[i] - versionA[i];
        }
      }
      return 0;
    });
    
    // Keep only the most recent versions
    const toDelete = files.slice(KEEP_VERSIONS);
    
    if (toDelete.length > 0) {
      console.log(`  📦 ${baseName}: keeping ${Math.min(files.length, KEEP_VERSIONS)} versions, deleting ${toDelete.length} old ones`);
      
      for (const file of toDelete) {
        try {
          await Deno.remove(file.path);
          totalDeleted++;
          totalSize += file.size;
        } catch (error) {
          console.error(`    ❌ Failed to delete ${file.name}: ${error}`);
        }
      }
    }
  }
  
  if (totalDeleted > 0) {
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);
    console.log(`  ✅ Cleaned up ${totalDeleted} old binaries (${totalSizeMB}MB freed)`);
  } else {
    console.log("  ✅ No old binaries to clean up");
  }
}

async function main() {
  const args = new Set(Deno.args);
  const shouldUpload = args.has("--upload");
  const cliOnly = args.has("--cli-only");
  const mcpOnly = args.has("--mcp-only");
  const skipPreflight = args.has("--skip-preflight");
  const skipCleanup = args.has("--skip-cleanup");

  try {
    // Run preflight checks unless skipped
    if (!skipPreflight) {
      await runPreflightChecks();
    }
    
    // Clean up old binaries before building new ones
    if (!skipCleanup) {
      await cleanupOldBinaries();
    }
    
    // Compile binaries
    if (!mcpOnly) {
      await compileCLI();
    }
    if (!cliOnly) {
      await compileMCPServers();
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
  --upload           Upload binaries to GitHub release after building
  --cli-only         Only build CLI binaries
  --mcp-only         Only build MCP server binaries
  --skip-preflight   Skip preflight checks (formatting, linting, type checking)
  --skip-cleanup     Skip cleanup of old binaries before building
  --help             Show this help message

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
