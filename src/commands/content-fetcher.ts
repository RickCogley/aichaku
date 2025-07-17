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
    `https://raw.githubusercontent.com/RickCogley/aichaku/v${version}/docs/${contentType}`;

  // Get the appropriate structure based on content type
  // First try to fetch a manifest.json from GitHub for dynamic discovery
  let structure: Record<string, unknown>;
  try {
    structure = await fetchGitHubManifest(baseUrl, contentType);
  } catch {
    // Fallback: Generate structure dynamically from GitHub's directory listing
    // This is the preferred approach - configuration as code
    try {
      structure = await fetchGitHubStructureDynamically(baseUrl, contentType);
    } catch {
      // Ultimate fallback - empty structure
      if (!options.silent) {
        console.warn(
          `⚠️  Could not fetch content structure for ${contentType}. The repository may be unreachable.`,
        );
      }
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
    "common": {
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
 * Fetch content structure from a pre-built manifest file
 * @param baseUrl - The base URL for the GitHub repository
 * @param contentType - Type of content to fetch
 * @returns Promise resolving to content structure
 */
async function fetchGitHubManifest(
  baseUrl: string,
  _contentType: ContentType,
): Promise<Record<string, unknown>> {
  // Try to fetch a manifest.json file from the repository
  const manifestUrl = `${baseUrl}/manifest.json`;

  const response = await fetch(manifestUrl);
  if (response.ok) {
    const manifest = await response.json();
    return manifest.structure || manifest;
  }

  throw new Error("Manifest not found");
}

/**
 * Dynamically fetch content structure using GitHub API tree endpoint
 * This implements "configuration as code" by discovering files at runtime
 * @param baseUrl - The base URL for the GitHub repository
 * @param contentType - Type of content to fetch
 * @returns Promise resolving to content structure
 */
async function fetchGitHubStructureDynamically(
  baseUrl: string,
  contentType: ContentType,
): Promise<Record<string, unknown>> {
  // Extract repo info from baseUrl
  // baseUrl format: https://raw.githubusercontent.com/RickCogley/aichaku/v0.30.1/docs/methodologies
  const urlParts = baseUrl.split("/");
  const owner = urlParts[3]; // RickCogley
  const repo = urlParts[4]; // aichaku
  const ref = urlParts[5]; // v0.30.1
  const path = urlParts.slice(6).join("/"); // docs/methodologies

  // Use GitHub API to get directory tree
  const apiUrl =
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }

    const data = await response.json();
    const tree = data.tree || [];

    // Filter files that are in our content path and build structure
    const structure: Record<string, unknown> = {};

    for (const item of tree) {
      if (item.type === "blob" && item.path.startsWith(path + "/")) {
        // Remove the base path to get relative path
        const relativePath = item.path.substring(path.length + 1);

        // Skip hidden files, manifest files, and README files
        if (
          relativePath.startsWith(".") ||
          relativePath.includes("manifest.json") ||
          relativePath === "README.md"
        ) {
          continue;
        }

        // Build nested structure
        const pathParts = relativePath.split("/");
        let current = structure;

        // Navigate/create nested structure
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part] as Record<string, unknown>;
        }

        // Set the file (empty string value for compatibility)
        const fileName = pathParts[pathParts.length - 1];
        current[fileName] = "";
      }
    }

    return structure;
  } catch (error) {
    // If GitHub API fails, fall back to hardcoded structure
    console.warn(`Failed to fetch dynamic structure from GitHub API: ${error}`);
    return contentType === "methodologies"
      ? getMethodologyStructure()
      : getStandardsStructure();
  }
}

// Helper function to copy a file from source to target
async function copyLocalFile(
  relativePath: string,
  sourcePath: string,
  targetPath: string,
  contentType: ContentType,
  options: FetchOptions,
  stats: { successCount: number; failureCount: number; failedFiles: string[] },
): Promise<void> {
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
      stats.successCount++;
      return; // Skip existing files unless overwrite is requested
    }
  } catch {
    // File doesn't exist, proceed with copy
  }

  try {
    const content = await Deno.readTextFile(sourceFile);
    await ensureDir(join(localPath, ".."));
    await Deno.writeTextFile(localPath, content);
    stats.successCount++;
  } catch (error) {
    stats.failureCount++;
    stats.failedFiles.push(relativePath);

    if (!options.silent) {
      console.warn(
        `⚠️  Failed to copy ${relativePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

// Helper function to process content structure recursively
async function processLocalStructure(
  obj: Record<string, unknown>,
  currentPath: string,
  sourcePath: string,
  targetPath: string,
  contentType: ContentType,
  options: FetchOptions,
  stats: { successCount: number; failureCount: number; failedFiles: string[] },
): Promise<void> {
  for (const [key, value] of Object.entries(obj)) {
    const path = currentPath ? `${currentPath}/${key}` : key;

    if (typeof value === "object" && value !== null) {
      // It's a directory
      await processLocalStructure(
        value as Record<string, unknown>,
        path,
        sourcePath,
        targetPath,
        contentType,
        options,
        stats,
      );
    } else {
      // It's a file
      await copyLocalFile(
        path,
        sourcePath,
        targetPath,
        contentType,
        options,
        stats,
      );
    }
  }
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

    const stats = {
      successCount: 0,
      failureCount: 0,
      failedFiles: [] as string[],
    };

    await processLocalStructure(
      structure,
      "",
      sourcePath,
      targetPath,
      contentType,
      options,
      stats,
    );

    // Report results
    if (!options.silent) {
      const contentName = contentType === "methodologies"
        ? "methodology"
        : contentType;

      if (stats.successCount === 0 && stats.failureCount > 0) {
        console.error(`\n❌ Failed to copy any ${contentName} files!`);
        return false;
      } else if (stats.failureCount > 0) {
        console.warn(
          `\n⚠️  Partial success: ${stats.successCount} files ready, ${stats.failureCount} failed`,
        );
        return true; // Partial success is still considered success
      } else if (stats.successCount > 0) {
        const capitalizedContent = contentType.charAt(0).toUpperCase() +
          contentType.slice(1);
        console.log(
          `✨ ${capitalizedContent} ready (${stats.successCount} files copied)\n`,
        );
      }
    }

    return stats.successCount > 0;
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
