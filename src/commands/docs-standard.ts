/**
 * Documentation standards command for Aichaku
 * Manages documentation style guides that users can choose to include
 *
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { dirname, join, normalize, resolve } from "jsr:@std/path@1";
import { safeReadTextFile } from "../utils/path-security.ts";

// Type definitions for documentation standards
interface DocStandard {
  name: string;
  description: string;
  tags: string[];
  templates: string[];
}

interface DocStandardCategory {
  name: string;
  description: string;
  standards: Record<string, DocStandard>;
}

interface ProjectDocConfig {
  version: string;
  selected: string[];
  customStandards?: Record<string, CustomDocStandard>;
}

interface CustomDocStandard {
  name: string;
  description: string;
  path: string;
  tags: string[];
}

/**
 * Documentation standard categories with their modules
 */
export const DOC_STANDARD_CATEGORIES: Record<string, DocStandardCategory> = {
  comprehensive: {
    name: "Comprehensive Documentation Systems",
    description: "Full documentation frameworks covering all document types",
    standards: {
      "diataxis-google": {
        name: "Diátaxis + Google Style",
        description:
          "Four-mode documentation (Tutorial, How-to, Reference, Explanation) with Google's writing style",
        tags: ["comprehensive", "structured", "google", "diataxis"],
        templates: ["tutorial", "how-to", "reference", "explanation"],
      },
      "microsoft-style": {
        name: "Microsoft Writing Style Guide",
        description:
          "Microsoft's modern technical writing approach with accessible, conversational tone",
        tags: ["comprehensive", "accessible", "microsoft", "modern"],
        templates: ["tutorial", "how-to", "reference", "explanation"],
      },
      "writethedocs": {
        name: "Write the Docs Principles",
        description:
          "Community-driven best practices for technical documentation",
        tags: ["community", "best-practices", "inclusive", "docs-as-code"],
        templates: ["tutorial", "how-to", "reference", "explanation"],
      },
    },
  },
};

/**
 * Documentation standard selection options
 */
interface DocStandardsOptions {
  list?: boolean;
  add?: string | string[];
  remove?: string | string[];
  show?: boolean;
  search?: string;
  projectPath?: string;
  dryRun?: boolean;
}

/**
 * Main documentation standards command implementation
 */
export async function docsStandard(
  options: DocStandardsOptions = {},
): Promise<void> {
  try {
    // List all available documentation standards
    if (options.list) {
      await listDocStandards();
      return;
    }

    // Search documentation standards
    if (options.search) {
      await searchDocStandards(options.search);
      return;
    }

    // Show current project documentation standards
    if (options.show) {
      await showProjectDocStandards(options.projectPath);
      return;
    }

    // Add documentation standards to project
    if (options.add) {
      await addDocStandards(options.add, options.projectPath, options.dryRun);
      return;
    }

    // Remove documentation standards from project
    if (options.remove) {
      await removeDocStandards(
        options.remove,
        options.projectPath,
        options.dryRun,
      );
      return;
    }

    // Default: show help
    await showDocStandardsHelp();
  } catch (error) {
    // InfoSec: Avoid exposing detailed error messages
    console.error(
      `❌ Error: An error occurred while processing documentation standards`,
    );
    if (
      error instanceof Error && error.message.includes("directory traversal")
    ) {
      console.error("Security violation detected");
    }
    Deno.exit(1);
  }
}

/**
 * List all available documentation standards
 */
function listDocStandards(): void {
  console.log("\n🪴 Aichaku: Available Documentation Standards\n");

  for (
    const [_categoryId, category] of Object.entries(DOC_STANDARD_CATEGORIES)
  ) {
    console.log(`${category.name}`);
    console.log(`  ${category.description}\n`);

    for (const [standardId, standard] of Object.entries(category.standards)) {
      console.log(`  • ${standardId}: ${standard.name}`);
      console.log(`    ${standard.description}`);
      console.log(`    Tags: ${standard.tags.join(", ")}`);
      console.log(`    Templates: ${standard.templates.join(", ")}`);
    }
    console.log();
  }
}

/**
 * Search documentation standards by keyword
 */
function searchDocStandards(query: string): void {
  const lowerQuery = query.toLowerCase();
  const matches: Array<[string, DocStandard, string]> = [];

  for (
    const [categoryId, category] of Object.entries(DOC_STANDARD_CATEGORIES)
  ) {
    for (const [standardId, standard] of Object.entries(category.standards)) {
      // Search in ID, name, description, and tags
      if (
        standardId.includes(lowerQuery) ||
        standard.name.toLowerCase().includes(lowerQuery) ||
        standard.description.toLowerCase().includes(lowerQuery) ||
        standard.tags.some((tag: string) => tag.includes(lowerQuery))
      ) {
        matches.push([standardId, standard, categoryId]);
      }
    }
  }

  if (matches.length === 0) {
    console.log(
      `\n🪴 Aichaku: No documentation standards found matching "${query}"`,
    );
    return;
  }

  console.log(`\n🪴 Aichaku: Documentation standards matching "${query}"\n`);
  for (const [id, standard, category] of matches) {
    console.log(`• ${id}: ${standard.name}`);
    console.log(`  ${standard.description}`);
    console.log(
      `  Category: ${
        DOC_STANDARD_CATEGORIES[
          category as keyof typeof DOC_STANDARD_CATEGORIES
        ].name
      }`,
    );
    console.log();
  }
}

/**
 * Show documentation standards selected for current project
 */
async function showProjectDocStandards(projectPath?: string): Promise<void> {
  const configPath = getProjectDocConfigPath(projectPath);

  if (!(await exists(configPath))) {
    console.log(
      "\n🪴 Aichaku: No documentation standards configured for this project",
    );
    console.log(
      "Run 'aichaku docs-standard --add <id>' to choose documentation standards",
    );
    return;
  }

  const config = await loadProjectDocConfig(configPath);

  if (config.selected.length === 0) {
    console.log(
      "\n🪴 Aichaku: No documentation standards selected for this project",
    );
    console.log("\n💡 To get started:");
    console.log(
      "   • Run 'aichaku docs-standard --list' to see available documentation standards",
    );
    console.log(
      "   • Run 'aichaku docs-standard --search <term>' to find specific standards",
    );
    console.log(
      "   • Run 'aichaku docs-standard --add <id>' to select standards",
    );
    console.log("\nExample: aichaku docs-standard --add diataxis-google");
    return;
  }

  console.log("\n🪴 Aichaku: Project Documentation Standards Configuration\n");
  console.log(
    `Selected documentation standards (${config.selected.length}):\n`,
  );

  for (const standardId of config.selected) {
    const standard = findDocStandard(standardId);
    if (standard) {
      console.log(`• ${standardId}: ${standard.name}`);
      console.log(`  ${standard.description}`);
      console.log(`  Templates: ${standard.templates.join(", ")}`);
    } else {
      console.log(`• ${standardId} (custom or unknown)`);
    }
  }

  if (
    config.customStandards && Object.keys(config.customStandards).length > 0
  ) {
    console.log("\nCustom documentation standards:");
    for (const [id, custom] of Object.entries(config.customStandards)) {
      console.log(`• ${id}: ${custom.name}`);
      console.log(`  ${custom.description}`);
      console.log(`  Path: ${custom.path}`);
    }
  }

  // Check integration status and provide options
  const claudeMdPath = join(projectPath || ".", "CLAUDE.md");
  const claudeExists = await exists(claudeMdPath);
  const needsIntegration = !claudeExists ||
    (claudeExists &&
      !(await safeReadTextFile(claudeMdPath, projectPath || ".")).includes(
        "AICHAKU:DOC-STANDARDS",
      ));

  console.log(`\n💡 What you can do:`);
  if (needsIntegration) {
    console.log(
      `   • Run 'aichaku integrate' to ${
        claudeExists ? "update" : "create"
      } CLAUDE.md with these documentation standards`,
    );
  }
  console.log(
    `   • Run 'aichaku docs-standard --add <id>' to add more standards`,
  );
  console.log(
    `   • Run 'aichaku docs-standard --remove <id>' to remove standards`,
  );
  console.log(
    `   • Run 'aichaku docs-standard --search <term>' to find specific standards`,
  );
  console.log(
    `   • Run 'aichaku docs-standard --list' to browse all available standards`,
  );
}

/**
 * Add documentation standards to project
 */
async function addDocStandards(
  standardIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(standardIds)
    ? standardIds
    : standardIds.includes(",")
    ? standardIds.split(",").map((s) => s.trim())
    : [standardIds];
  const configPath = getProjectDocConfigPath(projectPath);
  const config = await loadProjectDocConfig(configPath);

  console.log("\n🪴 Aichaku: Adding documentation standards to project...\n");

  let added = 0;
  for (const id of ids) {
    if (config.selected.includes(id)) {
      console.log(`⚠️  ${id} already selected`);
      continue;
    }

    const standard = findDocStandard(id);
    if (!standard) {
      console.log(`❌ Unknown documentation standard: ${id}`);
      continue;
    }

    config.selected.push(id);
    console.log(`✅ Added ${id}: ${standard.name}`);
    added++;
  }

  if (!dryRun && added > 0) {
    await saveProjectDocConfig(configPath, config);
    console.log(
      `\n✅ Updated project configuration (${config.selected.length} documentation standards)`,
    );

    // Provide comprehensive next steps
    console.log(
      `\n📋 You now have ${config.selected.length} documentation standards selected`,
    );
    console.log(`\n💡 What you can do next:`);
    console.log(
      `   • Run 'aichaku integrate' to apply these standards to CLAUDE.md`,
    );
    console.log(
      `   • Run 'aichaku docs-standard --show' to review your selections`,
    );
    console.log(
      `   • Run 'aichaku docs-standard --add <id>' to add more standards`,
    );
    console.log(
      `   • Run 'aichaku docs-standard --remove <id>' to remove standards`,
    );
    console.log(
      `   • Run 'aichaku docs-standard --list' to see all available standards`,
    );
  } else if (dryRun) {
    console.log("\n[Dry run - no changes made]");
  }
}

/**
 * Remove documentation standards from project
 */
async function removeDocStandards(
  standardIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(standardIds)
    ? standardIds
    : standardIds.includes(",")
    ? standardIds.split(",").map((s) => s.trim())
    : [standardIds];
  const configPath = getProjectDocConfigPath(projectPath);
  const config = await loadProjectDocConfig(configPath);

  console.log(
    "\n🪴 Aichaku: Removing documentation standards from project...\n",
  );

  let removed = 0;
  for (const id of ids) {
    const index = config.selected.indexOf(id);
    if (index === -1) {
      console.log(`⚠️  ${id} not selected`);
      continue;
    }

    config.selected.splice(index, 1);
    console.log(`✅ Removed ${id}`);
    removed++;
  }

  if (!dryRun && removed > 0) {
    await saveProjectDocConfig(configPath, config);
    console.log(
      `\n✅ Updated project configuration (${config.selected.length} documentation standards remaining)`,
    );

    console.log(`\n💡 What you can do next:`);
    if (config.selected.length > 0) {
      console.log(
        `   • Run 'aichaku integrate' to update CLAUDE.md with current standards`,
      );
      console.log(
        `   • Run 'aichaku docs-standard --show' to review remaining standards`,
      );
    }
    console.log(`   • Run 'aichaku docs-standard --add <id>' to add standards`);
    console.log(
      `   • Run 'aichaku docs-standard --search <term>' to find relevant standards`,
    );
  } else if (dryRun) {
    console.log("\n[Dry run - no changes made]");
  }
}

/**
 * Show documentation standards command help
 */
function showDocStandardsHelp(): void {
  console.log(`
🪴 Aichaku Documentation Standards - Choose Your Writing Style

Usage:
  aichaku docs-standard [options]

Options:
  --list              List all available documentation standards
  --search <query>    Search standards by keyword
  --show              Show standards selected for this project
  --add <ids>         Add standards to project (comma-separated)
  --remove <ids>      Remove standards from project

Examples:
  # See all available documentation standards
  aichaku docs-standard --list

  # Search for specific styles
  aichaku docs-standard --search google

  # Add documentation standards to your project
  aichaku docs-standard --add diataxis-google

  # See what's selected
  aichaku docs-standard --show

  # Remove a standard
  aichaku docs-standard --remove microsoft-style

Documentation standards provide structured templates and writing
guidelines that ensure consistent, high-quality documentation
across your project.
`);
}

/**
 * Helper: Get project config path with security validation
 * InfoSec: Prevents path traversal attacks by validating normalized paths
 */
function getProjectDocConfigPath(projectPath?: string): string {
  const base = resolve(projectPath || ".");
  // Use new path structure under .claude/aichaku/
  const configPath = join(base, ".claude", "aichaku", "doc-standards.json");
  const normalized = normalize(configPath);

  // Security: Ensure the path is within the project directory
  if (!normalized.startsWith(base)) {
    throw new Error("Invalid project path: attempted directory traversal");
  }

  return normalized;
}

/**
 * Helper: Load project configuration with validation
 */
async function loadProjectDocConfig(path: string): Promise<ProjectDocConfig> {
  // The path parameter is already the full path to the config file
  if (await exists(path)) {
    // Security: Use safe file reading with base directory validation
    const baseDir = dirname(path);
    const content = await safeReadTextFile(path, baseDir);
    try {
      const parsed = JSON.parse(content);

      // Validate required fields
      if (!parsed.version || !Array.isArray(parsed.selected)) {
        throw new Error("Invalid configuration format");
      }

      // Sanitize selected array
      parsed.selected = parsed.selected.filter(
        (id: unknown) => typeof id === "string" && id.length > 0,
      );

      return parsed as ProjectDocConfig;
    } catch (_error) {
      // InfoSec: Don't expose raw error messages
      console.error("Failed to parse project documentation configuration");
      return {
        version: "1.0.0",
        selected: [],
      };
    }
  }

  return {
    version: "1.0.0",
    selected: [],
  };
}

/**
 * Helper: Save project configuration with proper permissions
 * InfoSec: Sets appropriate file permissions for configuration files
 */
async function saveProjectDocConfig(
  path: string,
  config: ProjectDocConfig,
): Promise<void> {
  // Validate path to prevent directory traversal
  const normalized = normalize(path);
  const resolved = resolve(normalized);

  // Get parent directory safely using dirname
  const dir = dirname(resolved);

  await ensureDir(dir);

  // Write with secure permissions (read/write for owner, read-only for others)
  await Deno.writeTextFile(path, JSON.stringify(config, null, 2), {
    mode: 0o644,
  });
}

/**
 * Helper: Find a documentation standard by ID
 */
function findDocStandard(id: string): DocStandard | null {
  for (const category of Object.values(DOC_STANDARD_CATEGORIES)) {
    if (id in category.standards) {
      return category.standards[id as keyof typeof category.standards];
    }
  }
  return null;
}
