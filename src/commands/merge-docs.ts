/**
 * Merge documentation from completed projects into central documentation
 */

import { exists } from "jsr:@std/fs@1";
import { basename, join } from "jsr:@std/path@1";
import { ensureDir } from "jsr:@std/fs@1";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { safeReadTextFile } from "../utils/path-security.ts";
import { Brand } from "../utils/branded-messages.ts";

interface MergeDocsOptions {
  /** Project path to search for documentation */
  projectPath?: string;
  /** Force overwrite existing files */
  force?: boolean;
  /** Show what would be done without making changes */
  dryRun?: boolean;
  /** Suppress output messages */
  silent?: boolean;
  /** Specific project directory to merge (instead of scanning all) */
  project?: string;
}

interface MergeDocsResult {
  success: boolean;
  mergedFiles: number;
  skippedFiles: number;
  errors: string[];
  mergedPaths: string[];
}

interface DocumentFile {
  sourcePath: string;
  filename: string;
  type: "tutorial" | "how-to" | "reference" | "explanation" | "other";
  targetPath: string;
}

/**
 * Merge documentation from completed projects into central docs
 */
export async function mergeDocs(options: MergeDocsOptions = {}): Promise<MergeDocsResult> {
  const projectPath = resolveProjectPath(options.projectPath);

  const result: MergeDocsResult = {
    success: true,
    mergedFiles: 0,
    skippedFiles: 0,
    errors: [],
    mergedPaths: [],
  };

  try {
    if (!options.silent) {
      Brand.progress("🔄 Scanning for documentation to merge...", "active");
    }

    // Find documentation files to merge
    const docsToMerge = await findDocumentationFiles(projectPath, options.project);

    if (docsToMerge.length === 0) {
      if (!options.silent) {
        console.log("📄 No documentation files found to merge");
      }
      return result;
    }

    // Show merge plan
    if (!options.silent) {
      console.log(`\\n📋 Documentation Merge Plan:`);
      console.log(`   Found ${docsToMerge.length} files to merge\\n`);

      for (const doc of docsToMerge) {
        const status = await exists(doc.targetPath) && !options.force ? "⚠️  CONFLICT" : "✅";
        console.log(`   ${status} ${doc.filename} → ${doc.targetPath}`);
      }
    }

    if (options.dryRun) {
      if (!options.silent) {
        console.log("\\n[DRY RUN] No files were modified.");
      }
      return result;
    }

    // Perform merges
    for (const doc of docsToMerge) {
      try {
        await mergeDocumentFile(doc, options.force);
        result.mergedFiles++;
        result.mergedPaths.push(doc.targetPath);

        if (!options.silent) {
          Brand.success(`Merged: ${doc.filename}`);
        }
      } catch (error) {
        const errorMsg = `Failed to merge ${doc.filename}: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        result.success = false;

        if (!options.silent) {
          console.error(`❌ ${errorMsg}`);
        }
      }
    }

    if (!options.silent && result.mergedFiles > 0) {
      Brand.success(`Successfully merged ${result.mergedFiles} documentation files`);
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Documentation merge failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Find documentation files in completed projects
 */
async function findDocumentationFiles(projectPath: string, specificProject?: string): Promise<DocumentFile[]> {
  const docsToMerge: DocumentFile[] = [];
  const projectsPath = join(projectPath, "docs", "projects");

  // Scan done projects directory
  const doneProjectsPath = join(projectsPath, "done");
  if (!await exists(doneProjectsPath)) {
    return docsToMerge;
  }

  // Get list of completed projects
  const projects: string[] = [];
  if (specificProject) {
    projects.push(specificProject);
  } else {
    for await (const entry of Deno.readDir(doneProjectsPath)) {
      if (entry.isDirectory) {
        projects.push(entry.name);
      }
    }
  }

  // Scan each project for documentation files
  for (const project of projects) {
    const projectDir = join(doneProjectsPath, project);
    if (!await exists(projectDir)) continue;

    try {
      for await (const entry of Deno.readDir(projectDir)) {
        if (!entry.isFile || !entry.name.endsWith(".md")) continue;

        const docFile = classifyDocumentFile(entry.name, join(projectDir, entry.name));
        if (docFile) {
          docsToMerge.push(docFile);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan project ${project}: ${error}`);
    }
  }

  return docsToMerge;
}

/**
 * Classify documentation file and determine target path
 */
function classifyDocumentFile(filename: string, sourcePath: string): DocumentFile | null {
  // Skip internal project files
  if (
    filename.toLowerCase().includes("status") ||
    filename.toLowerCase().includes("pitch") ||
    filename.toLowerCase().includes("change-log")
  ) {
    return null;
  }

  let type: DocumentFile["type"] = "other";
  let targetDir = "docs";

  // Classify by filename patterns
  if (filename.toLowerCase().startsWith("tutorial-")) {
    type = "tutorial";
    targetDir = "docs/tutorials";
  } else if (filename.toLowerCase().startsWith("how-to-")) {
    type = "how-to";
    targetDir = "docs/how-to";
  } else if (filename.toLowerCase().startsWith("reference-")) {
    type = "reference";
    targetDir = "docs/reference";
  } else if (filename.toLowerCase().startsWith("explanation-") || filename.toLowerCase().startsWith("guide-")) {
    type = "explanation";
    targetDir = "docs/explanation";
  }

  return {
    sourcePath,
    filename,
    type,
    targetPath: join(targetDir, filename),
  };
}

/**
 * Merge a single documentation file
 */
async function mergeDocumentFile(doc: DocumentFile, force: boolean = false): Promise<void> {
  // Check if target already exists
  if (await exists(doc.targetPath) && !force) {
    throw new Error(`Target file already exists: ${doc.targetPath}. Use --force to overwrite.`);
  }

  // Ensure target directory exists
  const targetDir = doc.targetPath.substring(0, doc.targetPath.lastIndexOf("/"));
  await ensureDir(targetDir);

  // Read source content
  const sourceContent = await safeReadTextFile(doc.sourcePath, doc.sourcePath);

  // Add metadata header
  const timestamp = new Date().toISOString().split("T")[0];
  const sourceProject = basename(doc.sourcePath.substring(0, doc.sourcePath.lastIndexOf("/")));

  const mergedContent = `<!-- 
Merged from: ${sourceProject}
Original path: ${doc.sourcePath}
Merged on: ${timestamp}
-->

${sourceContent}`;

  // Write to target location
  await Deno.writeTextFile(doc.targetPath, mergedContent);
}

/**
 * CLI command handler
 */
export async function mergeDocsCommand(args: string[]): Promise<void> {
  const options: MergeDocsOptions = {
    projectPath: Deno.cwd(),
    force: false,
    dryRun: false,
    silent: false,
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--force":
      case "-f":
        options.force = true;
        break;
      case "--dry-run":
      case "-n":
        options.dryRun = true;
        break;
      case "--silent":
      case "-s":
        options.silent = true;
        break;
      case "--project":
      case "-p":
        if (i + 1 < args.length) {
          options.project = args[++i];
        }
        break;
      case "--path":
        if (i + 1 < args.length) {
          options.projectPath = args[++i];
        }
        break;
      case "--help":
      case "-h":
        showHelp();
        return;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown option: ${arg}`);
          Deno.exit(1);
        }
    }
  }

  const result = await mergeDocs(options);

  if (!result.success) {
    console.error("\\n❌ Documentation merge failed:");
    for (const error of result.errors) {
      console.error(`   ${error}`);
    }
    Deno.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
🪴 Aichaku: Documentation Merge Command

Merge documentation from completed projects into central documentation structure.

USAGE:
  aichaku merge-docs [OPTIONS]

OPTIONS:
  -f, --force         Overwrite existing files
  -n, --dry-run       Show what would be done without making changes
  -s, --silent        Suppress output messages
  -p, --project NAME  Merge specific project only
      --path PATH     Project path (defaults to current directory)
  -h, --help          Show this help message

EXAMPLES:
  aichaku merge-docs                    # Merge all documentation
  aichaku merge-docs --dry-run          # Preview merge plan
  aichaku merge-docs --project done-2025-07-28-auth-feature
  aichaku merge-docs --force            # Overwrite existing files

BEHAVIOR:
  - Scans docs/projects/done/ for completed projects
  - Identifies documentation by filename patterns:
    * tutorial-*.md → docs/tutorials/
    * how-to-*.md → docs/how-to/
    * reference-*.md → docs/reference/
    * explanation-*.md → docs/explanation/
  - Adds merge metadata to each file
  - Skips internal project files (STATUS.md, pitch.md, etc.)
`);
}
