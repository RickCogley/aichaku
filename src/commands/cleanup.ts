import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { getAichakuPaths } from "../paths.ts";
import { safeRemove } from "../utils/path-security.ts";

interface CleanupOptions {
  dryRun?: boolean;
  silent?: boolean;
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
