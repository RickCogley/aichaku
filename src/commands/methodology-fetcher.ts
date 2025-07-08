import { ensureDir } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

interface FetchOptions {
  silent?: boolean;
}

/**
 * Fetches methodologies from GitHub for JSR installations
 */
export async function fetchMethodologies(
  targetPath: string,
  version: string,
  options: FetchOptions = {},
): Promise<void> {
  // Check if methodologies already exist
  const methodologiesPath = join(targetPath, "methodologies");
  try {
    const stat = await Deno.stat(methodologiesPath);
    if (stat.isDirectory) {
      // Methodologies already exist, skip fetching
      if (!options.silent) {
        console.log("✨ Methodologies already installed");
      }
      return;
    }
  } catch {
    // Directory doesn't exist, continue with fetch
  }

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
    },
    "shape-up": {
      "SHAPE-UP-AICHAKU-GUIDE.md": "",
      "SHAPE-UP-ADAPTIVE.md": "",
      "templates": {
        "pitch.md": "",
        "bet.md": "",
        "cycle-announcement.md": "",
      },
    },
    "scrum": {
      "SCRUM-AICHAKU-GUIDE.md": "",
      "templates": {
        "sprint-plan.md": "",
        "daily-standup.md": "",
        "sprint-review.md": "",
        "retrospective.md": "",
      },
    },
    "kanban": {
      "KANBAN-AICHAKU-GUIDE.md": "",
      "templates": {
        "board-setup.md": "",
        "flow-metrics.md": "",
        "wip-limits.md": "",
      },
    },
    "lean": {
      "LEAN-AICHAKU-GUIDE.md": "",
      "templates": {
        "mvp-plan.md": "",
        "experiment-design.md": "",
        "pivot-decision.md": "",
      },
    },
    "xp": {
      "XP-AICHAKU-GUIDE.md": "",
      "templates": {
        "user-story.md": "",
        "test-plan.md": "",
        "refactoring-plan.md": "",
      },
    },
    "scrumban": {
      "SCRUMBAN-AICHAKU-GUIDE.md": "",
      "templates": {
        "hybrid-board.md": "",
        "sprint-flow.md": "",
        "planning-trigger.md": "",
      },
    },
  };

  if (!options.silent) {
    console.log("\n🔄 Initializing adaptive methodologies...");
  }

  async function fetchFile(relativePath: string): Promise<void> {
    const localPath = join(targetPath, "methodologies", relativePath);

    // Skip if file already exists
    try {
      await Deno.stat(localPath);
      return; // File exists, skip
    } catch {
      // File doesn't exist, continue to fetch
    }

    const url = `${baseUrl}/${relativePath}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        await ensureDir(join(localPath, ".."));
        await Deno.writeTextFile(localPath, content);
      }
    } catch (error) {
      // Only show warnings for actual fetch failures, not permission issues
      if (!options.silent && !error.message?.includes("Requires net access")) {
        console.warn(
          `⚠️  Failed to fetch ${relativePath}: ${
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
        await fetchFile(path);
      }
    }
  }

  await processStructure(structure);

  if (!options.silent) {
    console.log("✨ Methodologies initialized successfully\n");
  }
}
