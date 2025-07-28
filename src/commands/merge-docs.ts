/**
 * Merge project documentation back into central repository
 *
 * This command helps merge completed project documentation from
 * docs/projects/done/* back into the appropriate central documentation
 * locations (tutorials, how-tos, references, etc.)
 */

import { ensureDir, exists } from "jsr:@std/fs@1";
import { join, relative } from "jsr:@std/path@1";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { Brand } from "../utils/branded-messages.ts";

interface MergeOptions {
  projectPath?: string;
  projectName?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
}

interface MergeResult {
  success: boolean;
  message?: string;
  mergedFiles?: string[];
  conflicts?: string[];
}

interface DocumentMapping {
  source: string;
  target: string;
  type: "tutorial" | "how-to" | "reference" | "explanation";
}

/**
 * Analyze project documentation and suggest merge targets
 */
async function analyzeProjectDocs(projectDir: string): Promise<DocumentMapping[]> {
  const mappings: DocumentMapping[] = [];

  // Look for common documentation patterns
  const patterns = [
    { pattern: /tutorial.*\.md$/i, type: "tutorial" as const, target: "tutorials" },
    { pattern: /how[-_]?to.*\.md$/i, type: "how-to" as const, target: "how-to" },
    { pattern: /reference.*\.md$/i, type: "reference" as const, target: "reference" },
    { pattern: /explanation.*\.md$/i, type: "explanation" as const, target: "explanation" },
    { pattern: /guide.*\.md$/i, type: "how-to" as const, target: "how-to" },
    { pattern: /api.*\.md$/i, type: "reference" as const, target: "reference" },
  ];

  // Scan project directory for markdown files
  try {
    for await (const entry of Deno.readDir(projectDir)) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        // Skip status and meta files
        if (["STATUS.md", "README.md", "CHANGE-LOG.md", "pitch.md"].includes(entry.name)) {
          continue;
        }

        // Try to match against patterns
        for (const { pattern, type, target } of patterns) {
          if (pattern.test(entry.name)) {
            mappings.push({
              source: join(projectDir, entry.name),
              target: join("docs", target, entry.name),
              type,
            });
            break;
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to scan directory ${projectDir}:`, error);
  }

  return mappings;
}

/**
 * Merge documentation from completed projects back to central docs
 */
export async function mergeDocs(options: MergeOptions = {}): Promise<MergeResult> {
  const projectPath = resolveProjectPath(options.projectPath);

  if (!options.silent) {
    Brand.log("Starting documentation merge...");
  }

  // Determine project directory
  let projectDir: string;

  if (options.projectName) {
    // Specific project requested
    projectDir = join(projectPath, "docs", "projects", "done", options.projectName);
  } else {
    // Find most recent done project
    const doneDir = join(projectPath, "docs", "projects", "done");

    if (!(await exists(doneDir))) {
      return {
        success: false,
        message: "No completed projects found in docs/projects/done/",
      };
    }

    // Get most recent project
    const projects: { name: string; mtime: Date }[] = [];
    for await (const entry of Deno.readDir(doneDir)) {
      if (entry.isDirectory) {
        const stat = await Deno.stat(join(doneDir, entry.name));
        projects.push({ name: entry.name, mtime: stat.mtime || new Date(0) });
      }
    }

    if (projects.length === 0) {
      return {
        success: false,
        message: "No completed projects found",
      };
    }

    // Sort by modification time, newest first
    projects.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    projectDir = join(doneDir, projects[0].name);

    if (!options.silent) {
      Brand.info(`Selected most recent project: ${projects[0].name}`);
    }
  }

  // Check if project exists
  if (!(await exists(projectDir))) {
    return {
      success: false,
      message: `Project directory not found: ${projectDir}`,
    };
  }

  // Analyze documentation
  const mappings = await analyzeProjectDocs(projectDir);

  if (mappings.length === 0) {
    return {
      success: false,
      message: "No documentation files found to merge",
    };
  }

  // Show merge plan
  if (!options.silent) {
    console.log("\n📋 Merge Plan:");
    for (const mapping of mappings) {
      const source = relative(projectPath, mapping.source);
      const target = relative(projectPath, mapping.target);
      console.log(`  ${source} → ${target} (${mapping.type})`);
    }
  }

  if (options.dryRun) {
    return {
      success: true,
      message: "Dry run completed. No files were moved.",
      mergedFiles: mappings.map((m) => m.source),
    };
  }

  // Confirm merge
  if (!options.force && !options.silent) {
    console.log("\n🤔 Proceed with merge? [Y/n]: ");
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    const answer = new TextDecoder().decode(buf.subarray(0, n || 0)).trim().toLowerCase();

    if (answer !== "" && answer !== "y" && answer !== "yes") {
      return {
        success: false,
        message: "Merge cancelled by user",
      };
    }
  }

  // Execute merge
  const mergedFiles: string[] = [];
  const conflicts: string[] = [];

  for (const mapping of mappings) {
    try {
      const targetDir = join(projectPath, mapping.target, "..");
      await ensureDir(targetDir);

      const targetPath = join(projectPath, mapping.target);

      // Check for conflicts
      if (await exists(targetPath) && !options.force) {
        conflicts.push(mapping.target);
        if (!options.silent) {
          Brand.warning(`Conflict: ${mapping.target} already exists (use --force to overwrite)`);
        }
        continue;
      }

      // Read source content
      const content = await Deno.readTextFile(mapping.source);

      // Add merge metadata
      const metadata = `---
merged_from: ${relative(projectPath, mapping.source)}
merged_date: ${new Date().toISOString()}
project: ${relative(join(projectPath, "docs", "projects", "done"), projectDir)}
---

`;

      // Write to target with metadata
      await Deno.writeTextFile(targetPath, metadata + content);

      mergedFiles.push(mapping.target);

      if (!options.silent) {
        Brand.success(`Merged: ${relative(projectPath, mapping.target)}`);
      }

      // Add to git
      try {
        const git = new Deno.Command("git", {
          args: ["add", targetPath],
          cwd: projectPath,
        });
        await git.output();
      } catch {
        // Git add failed, but continue
      }
    } catch (error) {
      if (!options.silent) {
        Brand.error(`Failed to merge ${mapping.source}: ${error}`);
      }
    }
  }

  // Summary
  const message = conflicts.length > 0
    ? `Merged ${mergedFiles.length} files with ${conflicts.length} conflicts`
    : `Successfully merged ${mergedFiles.length} files`;

  if (!options.silent) {
    console.log("\n" + Brand.completed(message));

    if (mergedFiles.length > 0) {
      console.log("\n💡 Next steps:");
      console.log("  1. Review the merged documentation");
      console.log("  2. Update any cross-references");
      console.log("  3. Commit the changes");
    }
  }

  return {
    success: true,
    message,
    mergedFiles,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
  };
}
