import { ensureDir } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

interface FetchOptions {
  silent?: boolean;
  overwrite?: boolean;
}

type ContentType = "methodologies" | "standards";

/**
 * Fetches content (methodologies or standards) from GitHub for JSR installations
 */
export async function fetchContent(
  contentType: ContentType,
  targetPath: string,
  version: string,
  options: FetchOptions = {},
): Promise<boolean> {
  const baseUrl =
    `https://raw.githubusercontent.com/RickCogley/aichaku/v${version}/${contentType}`;

  // Get the appropriate structure based on content type
  const structure = contentType === "methodologies"
    ? getMethodologyStructure()
    : getStandardsStructure();

  let successCount = 0;
  let failureCount = 0;
  const failedFiles: string[] = [];

  async function fetchFile(relativePath: string): Promise<void> {
    const url = `${baseUrl}/${relativePath}`;
    const localPath = join(targetPath, relativePath);

    // Check if file exists and skip if overwrite is false
    try {
      const fileInfo = await Deno.stat(localPath);
      if (fileInfo.isFile && !options.overwrite) {
        successCount++;
        return; // Skip existing files unless overwrite is requested
      }
    } catch {
      // File doesn't exist, proceed with download
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        await ensureDir(join(localPath, ".."));
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
            `\n❌ Network permission denied. Cannot fetch ${contentType} from GitHub.`,
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
    const contentName = contentType === "methodologies"
      ? "methodology"
      : contentType;

    if (successCount === 0 && failureCount > 0) {
      console.error(`\n❌ Failed to fetch any ${contentName} files!`);
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
      const capitalizedContent = contentType.charAt(0).toUpperCase() +
        contentType.slice(1);
      console.log(
        `✨ ${capitalizedContent} ready (${successCount} files verified/updated)\n`,
      );
    }
  }

  return successCount > 0;
}

/**
 * Define the methodology structure to fetch
 */
function getMethodologyStructure(): Record<string, unknown> {
  return {
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
        "wip-limits.md": "",
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
        "board-setup.md": "",
        "flow-metrics.md": "",
      },
    },
  };
}

/**
 * Define the standards structure to fetch
 */
function getStandardsStructure(): Record<string, unknown> {
  return {
    "architecture": {
      "15-factor.md": "",
      "clean-arch.md": "",
    },
    "development": {
      "conventional-commits.md": "",
      "google-style.md": "",
      "solid.md": "",
      "tdd.md": "",
    },
    "devops": {
      "dora.md": "",
    },
    "security": {
      "nist-csf.md": "",
      "owasp-web.md": "",
    },
    "testing": {
      "bdd.md": "",
      "test-pyramid.md": "",
    },
  };
}

// Export legacy functions for backward compatibility
export function fetchMethodologies(
  targetPath: string,
  version: string,
  options: FetchOptions = {},
): Promise<boolean> {
  return fetchContent("methodologies", targetPath, version, options);
}

export function fetchStandards(
  targetPath: string,
  version: string,
  options: FetchOptions = {},
): Promise<boolean> {
  return fetchContent("standards", targetPath, version, options);
}
