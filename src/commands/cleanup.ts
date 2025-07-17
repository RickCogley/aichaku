import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { getAichakuPaths } from "../paths.ts";
import { safeRemove } from "../utils/path-security.ts";

interface CleanupOptions {
  dryRun?: boolean;
  silent?: boolean;
  help?: boolean;
}

interface CleanupResult {
  success: boolean;
  message: string;
  filesRemoved?: string[];
}

/**
 * Clean up old Aichaku files from legacy locations
 */
export async function cleanup(
  options: CleanupOptions = {},
): Promise<CleanupResult> {
  // Show help if requested
  if (options.help) {
    showCleanupHelp();
    return {
      success: true,
      message: "Help displayed",
      filesRemoved: [],
    };
  }
  const paths = getAichakuPaths();
  const home = Deno.env.get("HOME") || "";
  const filesRemoved: string[] = [];

  // Legacy files to clean up
  const legacyFiles = [
    join(home, ".claude", ".aichaku.json"),
    join(home, ".claude", "methodologies"),
    join(home, ".claude", "standards"),
  ];

  if (!options.silent) {
    console.log("🧹 Cleaning up legacy Aichaku files...");
  }

  if (options.dryRun) {
    console.log("[DRY RUN] Would remove:");
  }

  for (const file of legacyFiles) {
    if (await exists(file)) {
      const displayPath = file.replace(home, "~");

      if (options.dryRun) {
        console.log(`  - ${displayPath}`);
        filesRemoved.push(displayPath);
      } else {
        try {
          // Use safe remove to ensure we're only removing expected files
          await safeRemove(file, home, { recursive: true });
          filesRemoved.push(displayPath);

          if (!options.silent) {
            console.log(`  ✓ Removed ${displayPath}`);
          }
        } catch (error) {
          if (!options.silent) {
            console.error(`  ✗ Failed to remove ${displayPath}: ${error}`);
          }
        }
      }
    }
  }

  if (filesRemoved.length === 0) {
    return {
      success: true,
      message: "No legacy files found to clean up",
    };
  }

  if (options.dryRun) {
    return {
      success: true,
      message: "Dry run completed. No files were removed.",
      filesRemoved,
    };
  }

  // Ensure new directories exist
  await Deno.mkdir(paths.global.root, { recursive: true });

  return {
    success: true,
    message: `Cleaned up ${filesRemoved.length} legacy file(s)`,
    filesRemoved,
  };
}

/**
 * Show help information for the cleanup command
 */
function showCleanupHelp(): void {
  console.log(`
🪴 Aichaku Cleanup - Remove legacy files

Removes old Aichaku files from legacy locations (~/.claude/.aichaku.json and old
methodology/standards directories) to keep your system clean.

Usage:
  aichaku cleanup [options]

Options:
  -d, --dry-run     Preview what would be cleaned up without removing files
  -s, --silent      Clean up silently with minimal output
  -h, --help        Show this help message

Examples:
  aichaku cleanup                # Clean up legacy files
  aichaku cleanup --dry-run      # Preview what would be cleaned
  aichaku cleanup --silent       # Clean up quietly

Notes:
  • Only removes files from legacy locations
  • Does not affect current Aichaku installations
  • Safe to run multiple times
  • Shows detailed list of removed files
`);
}
