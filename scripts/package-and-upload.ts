#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Package binaries and upload to GitHub release
 */

const VERSION = "0.25.0";
const DIST_DIR = "./dist";

// Create tar.gz for Unix-like systems
async function createTarGz(files: string[], outputName: string) {
  const cmd = new Deno.Command("tar", {
    args: ["-czf", outputName, ...files],
    cwd: DIST_DIR,
  });
  const result = await cmd.output();
  if (!result.success) {
    throw new Error(`Failed to create ${outputName}`);
  }
}

// Create zip for Windows
async function createZip(files: string[], outputName: string) {
  const cmd = new Deno.Command("zip", {
    args: ["-r", outputName, ...files],
    cwd: DIST_DIR,
  });
  const result = await cmd.output();
  if (!result.success) {
    throw new Error(`Failed to create ${outputName}`);
  }
}

// Package binaries
async function packageBinaries() {
  console.log("📦 Packaging binaries...");

  // Package CLI binaries
  await createTarGz(
    [`aichaku-${VERSION}-macos-arm64`],
    `aichaku-${VERSION}-macos-arm64.tar.gz`,
  );
  await createTarGz(
    [`aichaku-${VERSION}-macos-x64`],
    `aichaku-${VERSION}-macos-x64.tar.gz`,
  );
  await createTarGz(
    [`aichaku-${VERSION}-linux-x64`],
    `aichaku-${VERSION}-linux-x64.tar.gz`,
  );
  await createZip(
    [`aichaku-${VERSION}-windows-x64.exe`],
    `aichaku-${VERSION}-windows-x64.zip`,
  );

  // Package MCP server binaries
  await createTarGz(
    [`aichaku-code-reviewer-${VERSION}-macos-arm64`],
    `aichaku-code-reviewer-${VERSION}-macos-arm64.tar.gz`,
  );
  await createTarGz(
    [`aichaku-code-reviewer-${VERSION}-macos-x64`],
    `aichaku-code-reviewer-${VERSION}-macos-x64.tar.gz`,
  );
  await createTarGz(
    [`aichaku-code-reviewer-${VERSION}-linux-x64`],
    `aichaku-code-reviewer-${VERSION}-linux-x64.tar.gz`,
  );
  await createZip(
    [`aichaku-code-reviewer-${VERSION}-windows-x64.exe`],
    `aichaku-code-reviewer-${VERSION}-windows-x64.zip`,
  );

  // Package GitHub MCP server binaries
  await createTarGz(
    [`github-operations-${VERSION}-macos-arm64`],
    `github-operations-${VERSION}-macos-arm64.tar.gz`,
  );
  await createTarGz(
    [`github-operations-${VERSION}-macos-x64`],
    `github-operations-${VERSION}-macos-x64.tar.gz`,
  );
  await createTarGz(
    [`github-operations-${VERSION}-linux-x64`],
    `github-operations-${VERSION}-linux-x64.tar.gz`,
  );
  await createZip(
    [`github-operations-${VERSION}-windows-x64.exe`],
    `github-operations-${VERSION}-windows-x64.zip`,
  );

  console.log("✅ All binaries packaged!");
}

// Upload to GitHub release
async function uploadToGitHub() {
  console.log("🚀 Uploading to GitHub release...");

  const files = [
    `aichaku-${VERSION}-macos-arm64.tar.gz`,
    `aichaku-${VERSION}-macos-x64.tar.gz`,
    `aichaku-${VERSION}-linux-x64.tar.gz`,
    `aichaku-${VERSION}-windows-x64.zip`,
    `aichaku-code-reviewer-${VERSION}-macos-arm64.tar.gz`,
    `aichaku-code-reviewer-${VERSION}-macos-x64.tar.gz`,
    `aichaku-code-reviewer-${VERSION}-linux-x64.tar.gz`,
    `aichaku-code-reviewer-${VERSION}-windows-x64.zip`,
    `github-operations-${VERSION}-macos-arm64.tar.gz`,
    `github-operations-${VERSION}-macos-x64.tar.gz`,
    `github-operations-${VERSION}-linux-x64.tar.gz`,
    `github-operations-${VERSION}-windows-x64.zip`,
    `checksums-${VERSION}.txt`,
  ];

  for (const file of files) {
    const filePath = `${DIST_DIR}/${file}`;

    // Check if file exists
    try {
      await Deno.stat(filePath);
    } catch {
      console.log(`⚠️  Skipping ${file} (not found)`);
      continue;
    }

    console.log(`📤 Uploading ${file}...`);

    const cmd = new Deno.Command("gh", {
      args: [
        "release",
        "upload",
        `v${VERSION}`,
        filePath,
        "--clobber", // Overwrite if exists
        "--repo",
        "RickCogley/aichaku",
      ],
    });

    const result = await cmd.output();
    if (!result.success) {
      console.error(`❌ Failed to upload ${file}`);
      const error = new TextDecoder().decode(result.stderr);
      console.error(error);
    } else {
      console.log(`✅ Uploaded ${file}`);
    }
  }
}

// Main
async function main() {
  try {
    await packageBinaries();
    await uploadToGitHub();
    console.log("\n🎉 All done!");
  } catch (error) {
    console.error("❌ Error:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
