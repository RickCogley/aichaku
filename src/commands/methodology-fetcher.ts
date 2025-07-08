import { ensureDir } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

interface FetchOptions {
  silent?: boolean;
  overwrite?: boolean; // More explicit than "force"
}

/**
 * Fetches methodologies from GitHub for JSR installations
 */
export async function fetchMethodologies(
  targetPath: string,
  version: string,
  options: FetchOptions = {},
): Promise<boolean> {
  // Note: We check individual files rather than skipping if directory exists
  // This ensures new files are downloaded during upgrades

  const baseUrl =
    `https://raw.githubusercontent.com/RickCogley/aichaku/v${version}/methodologies`;

  // Define the methodology structure to fetch
  const structure = {
    "BLENDING-GUIDE.md": "",
    "core": {
      "PLANNING-MODE.md": "",
      "PLANNING-MODE-ADAPTIVE.md": "",
      "EXECUTION-MODE.md": "",
      "IMPROVEMENT-MODE.md": "",
      "STATUS-TEMPLATE.md": "",
    },
    "shape-up": {
      "SHAPE-UP-AICHAKU-GUIDE.md": "",
      "SHAPE-UP-ADAPTIVE.md": "",
      "templates": {
        "pitch.md": "",
        "hill-chart.md": "",
        "cycle-plan.md": "",
        "execution-plan.md": "",
        "change-summary.md": "",
      },
    },
    "scrum": {
      "SCRUM-AICHAKU-GUIDE.md": "",
      "templates": {
        "sprint-planning.md": "",
        "sprint-retrospective.md": "",
        "user-story.md": "",
      },
    },
    "kanban": {
      "KANBAN-AICHAKU-GUIDE.md": "",
      "templates": {
        "kanban-board.md": "",
        "flow-metrics.md": "",
      },
    },
    "lean": {
      "LEAN-AICHAKU-GUIDE.md": "",
    },
    "xp": {
      "XP-AICHAKU-GUIDE.md": "",
    },
    "scrumban": {
      "SCRUMBAN-AICHAKU-GUIDE.md": "",
      "templates": {
        "planning-trigger.md": "",
      },
    },
  };

  if (!options.silent) {
    console.log("\n🔄 Initializing adaptive methodologies...");
  }

  let successCount = 0;
  let failureCount = 0;
  const failedFiles: string[] = [];

  async function fetchFile(relativePath: string): Promise<void> {
    // codeql[js/path-injection] Safe because targetPath is validated .claude directory and relativePath is from predefined structure
    const localPath = join(targetPath, "methodologies", relativePath);

    // Skip if file exists and we're not overwriting
    if (!options.overwrite) {
      try {
        // Security: localPath is safe - constructed from validated targetPath (.claude) and relativePath from static structure
        await Deno.stat(localPath);
        successCount++; // Count existing files as successes
        return; // File exists, skip fetching
      } catch {
        // File doesn't exist, continue to fetch
      }
    }

    const url = `${baseUrl}/${relativePath}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        // codeql[js/path-injection] Safe because localPath is constructed from validated components
        await ensureDir(join(localPath, ".."));
        // Security: localPath is safe - constructed from validated targetPath (.claude) and relativePath from static structure
        await Deno.writeTextFile(localPath, content);
        successCount++;
      } else {
        failureCount++;
        failedFiles.push(relativePath);
      }
    } catch (error) {
      failureCount++;
      failedFiles.push(relativePath);

      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      // Track network permission errors separately
      if (errorMessage.includes("Requires net access")) {
        if (!options.silent) {
          console.error(
            "\n❌ Network permission denied. Cannot fetch methodologies from GitHub.",
          );
          console.error(
            "   The installer needs --allow-net permission to download files.",
          );
        }
      } else if (!options.silent) {
        console.warn(
          `⚠️  Failed to fetch ${relativePath}: ${errorMessage}`,
        );
      }
    }
  }

  async function processStructure(
    obj: Record<string, unknown>,
    currentPath: string = "",
  ): Promise<void> {
    for (const [key, value] of Object.entries(obj)) {
      const path = currentPath ? `${currentPath}/${key}` : key;

      if (typeof value === "object" && value !== null) {
        // It's a directory
        await processStructure(value as Record<string, unknown>, path);
      } else {
        // It's a file
        await fetchFile(path);
      }
    }
  }

  await processStructure(structure);

  // Report results
  if (!options.silent) {
    if (successCount === 0 && failureCount > 0) {
      console.error("\n❌ Failed to fetch any methodology files!");
      console.error(`   ${failureCount} files could not be downloaded.`);
      if (failedFiles.length > 0 && failedFiles.length <= 5) {
        console.error("   Failed files:");
        failedFiles.forEach((file) => console.error(`     - ${file}`));
      }
      return false;
    } else if (failureCount > 0) {
      console.warn(
        `\n⚠️  Partial success: ${successCount} files ready, ${failureCount} failed`,
      );
      return true; // Partial success is still considered success
    } else if (successCount > 0) {
      console.log(
        `✨ Methodologies ready (${successCount} files verified/updated)\n`,
      );
    }
  }

  return successCount > 0;
}
