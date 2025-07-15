import { ensureDir } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { validatePath } from "../utils/path-security.ts";
import { getContentStructure } from "../utils/dynamic-content-discovery.ts";

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
  // Try to fetch structure dynamically from a manifest file on GitHub
  let structure: Record<string, unknown>;
  try {
    structure = await fetchGitHubContentStructure(baseUrl, contentType);
  } catch {
    // Fallback to local structure generation or hardcoded
    try {
      structure = contentType === "methodologies"
        ? getMethodologyStructure()
        : getStandardsStructure();
    } catch {
      // Ultimate fallback - empty structure
      structure = {};
    }
  }

  let successCount = 0;
  let failureCount = 0;
  const failedFiles: string[] = [];

  async function fetchFile(relativePath: string): Promise<void> {
    // Security: Validate the relative path doesn't contain traversal sequences
    if (relativePath.includes("..")) {
      throw new Error(
        `Invalid path: ${relativePath} contains directory traversal`,
      );
    }

    const url = `${baseUrl}/${relativePath}`;
    const localPath = validatePath(relativePath, targetPath);

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
      if (failedFiles.length > 0) {
        console.warn("   Failed files:");
        failedFiles.forEach((file) => console.warn(`     - ${file}`));
      }
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
    "COMMANDS.md": "",
    "README.md": "",
    "core": {
      "PLANNING-MODE.md": "",
      "PLANNING-MODE-ADAPTIVE.md": "",
      "EXECUTION-MODE.md": "",
      "IMPROVEMENT-MODE.md": "",
      "STATUS-TEMPLATE.md": "",
      "AICHAKU-DIAGRAM-INTEGRATION.md": "",
      "DIAGRAM-AUTOMATION-GUIDE.md": "",
      "MERMAID-DIAGRAM-PATTERNS.md": "",
      "MERMAID-REFERENCE-GUIDE.md": "",
      "TECHNICAL-DOCUMENTATION-SUMMARY.md": "",
    },
    "shape-up": {
      "shape-up.md": "",
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
      "scrum.md": "",
      "templates": {
        "sprint-planning.md": "",
        "sprint-retrospective.md": "",
        "user-story.md": "",
      },
    },
    "kanban": {
      "kanban.md": "",
      "templates": {
        "kanban-board.md": "",
        "flow-metrics.md": "",
      },
    },
    "lean": {
      "lean.md": "",
    },
    "xp": {
      "xp.md": "",
    },
    "scrumban": {
      "scrumban.md": "",
      "templates": {
        "planning-trigger.md": "",
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

/**
 * Fetches content from local filesystem with dynamic discovery
 * Used when content is available locally (e.g., development mode)
 */
/**
 * Fetch content structure from GitHub using a manifest file
 * @param baseUrl - The base URL for the GitHub repository
 * @param contentType - Type of content to fetch
 * @returns Promise resolving to content structure
 */
async function fetchGitHubContentStructure(
  baseUrl: string,
  contentType: ContentType,
): Promise<Record<string, unknown>> {
  // Try to fetch a manifest.json file from the repository
  const manifestUrl = `${baseUrl}/manifest.json`;
  
  try {
    const response = await fetch(manifestUrl);
    if (response.ok) {
      const manifest = await response.json();
      return manifest.structure || {};
    }
  } catch {
    // Manifest doesn't exist or couldn't be fetched
  }
  
  // Fallback to hardcoded structure
  return contentType === "methodologies"
    ? getMethodologyStructure()
    : getStandardsStructure();
}

export async function fetchLocalContent(
  contentType: ContentType,
  sourcePath: string,
  targetPath: string,
  options: FetchOptions = {},
): Promise<boolean> {
  try {
    // Dynamically discover content structure
    const structure = await getContentStructure(contentType, sourcePath, false);

    let successCount = 0;
    let failureCount = 0;
    const failedFiles: string[] = [];

    async function copyFile(relativePath: string): Promise<void> {
      // Security: Validate the relative path doesn't contain traversal sequences
      if (relativePath.includes("..")) {
        throw new Error(
          `Invalid path: ${relativePath} contains directory traversal`,
        );
      }

      const sourceFile = join(sourcePath, contentType, relativePath);
      const localPath = validatePath(relativePath, targetPath);

      // Check if file exists and skip if overwrite is false
      try {
        const fileInfo = await Deno.stat(localPath);
        if (fileInfo.isFile && !options.overwrite) {
          successCount++;
          return; // Skip existing files unless overwrite is requested
        }
      } catch {
        // File doesn't exist, proceed with copy
      }

      try {
        const content = await Deno.readTextFile(sourceFile);
        await ensureDir(join(localPath, ".."));
        await Deno.writeTextFile(localPath, content);
        successCount++;
      } catch (error) {
        failureCount++;
        failedFiles.push(relativePath);

        if (!options.silent) {
          console.warn(
            `⚠️  Failed to copy ${relativePath}: ${
              error instanceof Error ? error.message : String(error)
            }`,
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
          await copyFile(path);
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
        console.error(`\n❌ Failed to copy any ${contentName} files!`);
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
          `✨ ${capitalizedContent} ready (${successCount} files copied)\n`,
        );
      }
    }

    return successCount > 0;
  } catch (error) {
    if (!options.silent) {
      console.error(
        `❌ Failed to fetch local content: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    return false;
  }
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
