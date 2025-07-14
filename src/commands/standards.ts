/**
 * Standards command for Aichaku
 * Manages modular guidance sections that users can choose to include
 *
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { join, normalize, resolve } from "jsr:@std/path@1";
import {
  ensureAichakuDirs,
  getAichakuPaths,
  getUserStandardPath,
  isPathSafe,
} from "../paths.ts";
import {
  safeReadDir,
  safeReadTextFile,
  safeRemove,
} from "../utils/path-security.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";

/**
 * Represents a development standard or guideline
 * @public
 */
interface Standard {
  /** Display name of the standard */
  name: string;
  /** Brief description of what the standard covers */
  description: string;
  /** Categorization tags for search and filtering */
  tags: string[];
}

/**
 * Category grouping for related standards
 * @public
 */
interface StandardCategory {
  /** Category display name */
  name: string;
  /** Description of what standards in this category cover */
  description: string;
  /** Map of standard IDs to their definitions */
  standards: Record<string, Standard>;
}

/**
 * Project-specific standards configuration
 * @internal
 */
interface ProjectConfig {
  /** Configuration schema version */
  version: string;
  /** List of selected standard IDs */
  selected: string[];
  /** User-defined custom standards */
  customStandards?: Record<string, CustomStandard>;
}

/**
 * User-defined custom standard
 * @public
 */
interface CustomStandard {
  /** Display name of the custom standard */
  name: string;
  /** Description of the custom standard */
  description: string;
  /** File path to the custom standard content */
  path: string;
  /** Categorization tags */
  tags: string[];
}

/**
 * Standard categories with their modules
 */
export const STANDARD_CATEGORIES = {
  security: {
    name: "Security Standards",
    description: "Security frameworks and compliance standards",
    standards: {
      "owasp-web": {
        name: "OWASP Top 10 Web",
        description: "Web application security risks",
        tags: ["security", "web", "api"],
      },
      "nist-csf": {
        name: "NIST Cybersecurity Framework",
        description: "Governance and risk management",
        tags: ["security", "governance", "compliance"],
      },
      "gdpr": {
        name: "GDPR Privacy",
        description: "EU privacy regulations",
        tags: ["privacy", "compliance", "european"],
      },
      "pci-dss": {
        name: "PCI DSS",
        description: "Payment card security",
        tags: ["security", "payments", "compliance"],
      },
    },
  },
  architecture: {
    name: "Architecture Patterns",
    description: "Software architecture and design patterns",
    standards: {
      "15-factor": {
        name: "15-Factor Apps",
        description: "Modern cloud-native principles",
        tags: ["cloud", "microservices", "best-practices"],
      },
      "ddd": {
        name: "Domain-Driven Design",
        description: "Strategic and tactical patterns",
        tags: ["architecture", "design", "patterns"],
      },
      "clean-arch": {
        name: "Clean Architecture",
        description: "Dependency inversion principles",
        tags: ["architecture", "solid", "design"],
      },
      "microservices": {
        name: "Microservices Patterns",
        description: "Distributed system patterns",
        tags: ["architecture", "distributed", "patterns"],
      },
    },
  },
  development: {
    name: "Development Standards",
    description: "Coding standards and best practices",
    standards: {
      "google-style": {
        name: "Google Style Guides",
        description: "Language-specific style guides",
        tags: ["style", "formatting", "best-practices"],
      },
      "conventional-commits": {
        name: "Conventional Commits",
        description: "Structured commit messages",
        tags: ["git", "commits", "automation"],
      },
      "solid": {
        name: "SOLID Principles",
        description: "Object-oriented design principles",
        tags: ["oop", "design", "principles"],
      },
      "tdd": {
        name: "Test-Driven Development",
        description: "Red-green-refactor cycle",
        tags: ["testing", "methodology", "quality"],
      },
    },
  },
  testing: {
    name: "Testing Strategies",
    description: "Testing methodologies and practices",
    standards: {
      "bdd": {
        name: "Behavior-Driven Development",
        description: "Given-when-then scenarios",
        tags: ["testing", "behavior", "collaboration"],
      },
      "test-pyramid": {
        name: "Test Pyramid",
        description: "Balanced testing strategy",
        tags: ["testing", "strategy", "quality"],
      },
    },
  },
  devops: {
    name: "DevOps Practices",
    description: "Operational excellence and automation",
    standards: {
      "sre": {
        name: "Site Reliability Engineering",
        description: "Error budgets and SLOs",
        tags: ["operations", "reliability", "google"],
      },
      "gitops": {
        name: "GitOps",
        description: "Git as source of truth",
        tags: ["operations", "automation", "kubernetes"],
      },
      "dora": {
        name: "DORA Metrics",
        description: "Deployment frequency and MTTR",
        tags: ["metrics", "performance", "devops"],
      },
    },
  },
};

/**
 * Standard selection options
 */
interface StandardsOptions {
  list?: boolean;
  categories?: boolean;
  select?: boolean;
  add?: string | string[];
  remove?: string | string[];
  show?: boolean;
  search?: string;
  projectPath?: string;
  dryRun?: boolean;
  createCustom?: string;
  deleteCustom?: string;
  editCustom?: string;
  copyCustom?: { source: string; target: string };
}

/**
 * Project standards configuration
 */
interface ProjectStandards {
  version: string;
  selected: string[];
  customStandards?: Record<string, CustomStandard>;
}

/**
 * Main standards command implementation
 */
/**
 * Browse and manage development standards and guidelines
 *
 * Provides access to a curated collection of industry standards including
 * security frameworks (OWASP, NIST-CSF), architecture patterns (Clean Architecture, DDD),
 * development practices (TDD, BDD), and coding standards (Google Style Guides).
 * Standards can be added to your project's CLAUDE.md for AI guidance.
 *
 * @param {StandardsOptions} options - Options for browsing and managing standards
 * @param {boolean} options.list - List all available standards
 * @param {string[]} options.categories - Filter by specific categories
 * @param {boolean} options.show - Show currently selected standards
 * @param {string[]} options.add - Standards to add to project configuration
 * @param {string[]} options.remove - Standards to remove from configuration
 * @param {string} options.search - Search standards by name or tags
 * @param {string} options.view - View a specific standard's content
 * @param {string} options.copy - Copy a standard to clipboard
 * @param {boolean} options.global - Apply operations globally
 * @param {string} options.projectPath - Project path for local operations
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // List all available standards
 * await standards({ list: true });
 *
 * // List security standards only
 * await standards({ list: true, categories: ["security"] });
 *
 * // Search for TDD-related standards
 * await standards({ search: "tdd" });
 *
 * // Add standards to project
 * await standards({ add: ["NIST-CSF", "TDD", "CLEAN-ARCH"] });
 *
 * // View a specific standard
 * await standards({ view: "OWASP-WEB" });
 *
 * // Copy standard content to clipboard
 * await standards({ copy: "GOOGLE-STYLE" });
 * ```
 *
 * @public
 */
export async function standards(options: StandardsOptions = {}): Promise<void> {
  try {
    // List all available standards
    if (options.list) {
      await listStandards(options.categories);
      return;
    }

    // Search standards
    if (options.search) {
      await searchStandards(options.search);
      return;
    }

    // Show current project standards
    if (options.show) {
      await showProjectStandards(options.projectPath);
      return;
    }

    // Add standards to project
    if (options.add) {
      await addStandards(options.add, options.projectPath, options.dryRun);
      return;
    }

    // Remove standards from project
    if (options.remove) {
      await removeStandards(
        options.remove,
        options.projectPath,
        options.dryRun,
      );
      return;
    }

    // Interactive selection
    if (options.select) {
      await interactiveSelection(options.projectPath, options.dryRun);
      return;
    }

    // Create custom standard
    if (options.createCustom) {
      await createCustomStandard(options.createCustom);
      return;
    }

    // Delete custom standard
    if (options.deleteCustom) {
      await deleteCustomStandard(options.deleteCustom);
      return;
    }

    // Edit custom standard
    if (options.editCustom) {
      await editCustomStandard(options.editCustom);
      return;
    }

    // Copy custom standard
    if (options.copyCustom) {
      await copyCustomStandard(
        options.copyCustom.source,
        options.copyCustom.target,
      );
      return;
    }

    // Default: show help
    showStandardsHelp();
  } catch (error) {
    // InfoSec: Avoid exposing detailed error messages
    console.error(`❌ Error: An error occurred while processing standards`);
    if (
      error instanceof Error && error.message.includes("directory traversal")
    ) {
      console.error("Security violation detected");
    }
    Deno.exit(1);
  }
}

/**
 * List all available standards (including custom standards)
 */
async function listStandards(byCategory: boolean = false): Promise<void> {
  console.log("\n🪴 Aichaku: Available Standards\n");

  if (byCategory) {
    // List by category
    for (const [_categoryId, category] of Object.entries(STANDARD_CATEGORIES)) {
      console.log(`${category.name}`);
      console.log(`  ${category.description}\n`);

      for (const [standardId, standard] of Object.entries(category.standards)) {
        console.log(`  • ${standardId}: ${standard.name}`);
        console.log(`    ${standard.description}`);
        console.log(`    Tags: ${standard.tags.join(", ")}`);
      }
      console.log();
    }

    // Add custom standards section
    const customStandards = await loadAvailableCustomStandards();
    if (customStandards.length > 0) {
      console.log("Custom Standards");
      console.log("  User-defined standards from your configuration\n");

      for (const custom of customStandards) {
        console.log(`  • custom:${custom.id}: ${custom.name}`);
        console.log(`    ${custom.description}`);
        console.log(`    Source: ${formatPathForDisplay(custom.path)}`);
        console.log(`    Tags: ${custom.tags.join(", ")}`);
      }
      console.log();
    }
  } else {
    // List all standards flat
    const allStandards: Array<[string, Standard, string]> = [];

    for (const [categoryId, category] of Object.entries(STANDARD_CATEGORIES)) {
      for (const [standardId, standard] of Object.entries(category.standards)) {
        allStandards.push([standardId, standard, categoryId]);
      }
    }

    // Sort alphabetically
    allStandards.sort((a, b) => a[0].localeCompare(b[0]));

    for (const [id, standard, category] of allStandards) {
      console.log(`• ${id}: ${standard.name}`);
      console.log(`  ${standard.description}`);
      console.log(
        `  Category: ${
          STANDARD_CATEGORIES[category as keyof typeof STANDARD_CATEGORIES].name
        }`,
      );
      console.log(`  Tags: ${standard.tags.join(", ")}`);
      console.log();
    }

    // Add custom standards
    const customStandards = await loadAvailableCustomStandards();
    if (customStandards.length > 0) {
      console.log("--- Custom Standards ---\n");

      for (const custom of customStandards) {
        console.log(`• custom:${custom.id}: ${custom.name}`);
        console.log(`  ${custom.description}`);
        console.log(`  Category: Custom`);
        console.log(`  Source: ${formatPathForDisplay(custom.path)}`);
        console.log(`  Tags: ${custom.tags.join(", ")}`);
        console.log();
      }
    }
  }
}

/**
 * Search standards by keyword (including custom standards)
 */
async function searchStandards(query: string): Promise<void> {
  const lowerQuery = query.toLowerCase();
  const matches: Array<[string, Standard, string]> = [];
  const customMatches: Array<{
    id: string;
    name: string;
    description: string;
    path: string;
    tags: string[];
  }> = [];

  // Search built-in standards
  for (const [categoryId, category] of Object.entries(STANDARD_CATEGORIES)) {
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

  // Search custom standards
  const customStandards = await loadAvailableCustomStandards();
  for (const custom of customStandards) {
    if (
      custom.id.includes(lowerQuery) ||
      custom.name.toLowerCase().includes(lowerQuery) ||
      custom.description.toLowerCase().includes(lowerQuery) ||
      custom.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    ) {
      customMatches.push(custom);
    }
  }

  if (matches.length === 0 && customMatches.length === 0) {
    console.log(`\n🪴 Aichaku: No standards found matching "${query}"`);
    return;
  }

  console.log(`\n🪴 Aichaku: Standards matching "${query}"\n`);

  // Show built-in matches
  for (const [id, standard, category] of matches) {
    console.log(`• ${id}: ${standard.name}`);
    console.log(`  ${standard.description}`);
    console.log(
      `  Category: ${
        STANDARD_CATEGORIES[category as keyof typeof STANDARD_CATEGORIES].name
      }`,
    );
    console.log();
  }

  // Show custom matches
  if (customMatches.length > 0) {
    if (matches.length > 0) {
      console.log("--- Custom Standards ---\n");
    }

    for (const custom of customMatches) {
      console.log(`• custom:${custom.id}: ${custom.name}`);
      console.log(`  ${custom.description}`);
      console.log(`  Category: Custom`);
      console.log(`  Source: ${formatPathForDisplay(custom.path)}`);
      console.log();
    }
  }
}

/**
 * Show standards selected for current project
 */
async function showProjectStandards(projectPath?: string): Promise<void> {
  const configPath = getProjectConfigPath(projectPath);

  if (!(await exists(configPath))) {
    console.log("\n🪴 Aichaku: No standards configured for this project");
    console.log("Run 'aichaku standards --select' to choose standards");
    return;
  }

  const config = await loadProjectConfig(configPath);

  if (config.selected.length === 0) {
    console.log("\n🪴 Aichaku: No standards selected for this project");
    console.log("\n💡 To get started:");
    console.log(
      "   • Run 'aichaku standards --list' to see available standards",
    );
    console.log(
      "   • Run 'aichaku standards --search <term>' to find specific standards",
    );
    console.log("   • Run 'aichaku standards --add <id>' to select standards");
    console.log("\nExample: aichaku standards --add owasp-web,15-factor,tdd");
    return;
  }

  console.log("\n🪴 Aichaku: Project Standards Configuration\n");
  console.log(`Selected standards (${config.selected.length}):\n`);

  for (const standardId of config.selected) {
    // Handle custom standards
    if (standardId.startsWith("custom:")) {
      const customId = standardId.replace("custom:", "");
      const customStandard = config.customStandards?.[customId];

      if (customStandard) {
        console.log(`• ${standardId}: ${customStandard.name}`);
        console.log(`  ${customStandard.description}`);
        console.log(
          `  📁 Source: ${formatPathForDisplay(customStandard.path)}`,
        );

        // Check if the custom standard file still exists
        try {
          if (!(await exists(customStandard.path))) {
            console.log(
              `  ⚠️  Warning: Custom standard file not found at source path`,
            );
          }
        } catch {
          console.log(
            `  ⚠️  Warning: Cannot verify custom standard file existence`,
          );
        }
      } else {
        console.log(`• ${standardId} (custom - metadata missing)`);
        console.log(`  ⚠️  Warning: Custom standard metadata not found`);
      }
    } else {
      // Handle built-in standards
      const standard = findStandard(standardId);
      if (standard) {
        console.log(`• ${standardId}: ${standard.name}`);
        console.log(`  ${standard.description}`);
      } else {
        console.log(`• ${standardId} (unknown built-in standard)`);
        console.log(`  ⚠️  Warning: Standard not found in available standards`);
      }
    }
  }

  if (
    config.customStandards && Object.keys(config.customStandards).length > 0
  ) {
    console.log("\nCustom standards:");
    for (const [id, custom] of Object.entries(config.customStandards)) {
      console.log(`• ${id}: ${custom.name}`);
      console.log(`  ${custom.description}`);
      console.log(`  Path: ${custom.path}`);
    }
  }

  // Check integration status and provide options
  const validatedProjectPath = projectPath
    ? resolveProjectPath(projectPath)
    : Deno.cwd();
  const claudeMdPath = join(validatedProjectPath, "CLAUDE.md");
  const claudeExists = await exists(claudeMdPath);
  const needsIntegration = !claudeExists ||
    (claudeExists &&
      !(await safeReadTextFile(claudeMdPath, validatedProjectPath)).includes(
        "AICHAKU:STANDARDS",
      ));

  console.log(`\n💡 What you can do:`);
  if (needsIntegration) {
    console.log(
      `   • Run 'aichaku integrate' to ${
        claudeExists ? "update" : "create"
      } CLAUDE.md with these standards`,
    );
  }
  console.log(`   • Run 'aichaku standards --add <id>' to add more standards`);
  console.log(`   • Run 'aichaku standards --remove <id>' to remove standards`);
  console.log(
    `   • Run 'aichaku standards --search <term>' to find specific standards`,
  );
  console.log(
    `   • Run 'aichaku standards --list --categories' to browse all available standards`,
  );
}

/**
 * Add standards to project
 */
async function addStandards(
  standardIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(standardIds)
    ? standardIds
    : standardIds.includes(",")
    ? standardIds.split(",").map((s) => s.trim())
    : [standardIds];
  const configPath = getProjectConfigPath(projectPath);
  const config = await loadProjectConfig(configPath);

  console.log("\n🪴 Aichaku: Adding standards to project...\n");

  let added = 0;
  for (const id of ids) {
    if (config.selected.includes(id)) {
      console.log(`⚠️  ${id} already selected`);
      continue;
    }

    // Check if it's a custom standard (prefixed with "custom:")
    if (id.startsWith("custom:")) {
      const customResult = await addCustomStandard(id, config);
      if (customResult.success) {
        config.selected.push(id);
        console.log(`✅ Added custom standard ${id}: ${customResult.name}`);
        console.log(`   📁 Source: ${customResult.source}`);
        added++;
      } else {
        console.log(
          `❌ Failed to add custom standard ${id}: ${customResult.error}`,
        );
      }
      continue;
    }

    // Handle built-in standards
    const standard = findStandard(id);
    if (!standard) {
      console.log(`❌ Unknown standard: ${id}`);
      console.log(
        `   💡 Use 'aichaku standards --list' to see available standards`,
      );
      console.log(`   💡 Use 'custom:my-standard' for custom standards`);
      continue;
    }

    config.selected.push(id);
    console.log(`✅ Added ${id}: ${standard.name}`);
    added++;
  }

  if (!dryRun && added > 0) {
    await saveProjectConfig(configPath, config);
    console.log(
      `\n✅ Updated project configuration (${config.selected.length} standards)`,
    );

    // Provide comprehensive next steps
    console.log(
      `\n📋 You now have ${config.selected.length} standards selected`,
    );
    console.log(`\n💡 What you can do next:`);
    console.log(
      `   • Run 'aichaku integrate' to apply these standards to CLAUDE.md`,
    );
    console.log(
      `   • Run 'aichaku standards --show' to review your selections`,
    );
    console.log(
      `   • Run 'aichaku standards --add <id>' to add more standards`,
    );
    console.log(
      `   • Run 'aichaku standards --remove <id>' to remove standards`,
    );
    console.log(
      `   • Run 'aichaku standards --list' to see all available standards`,
    );
  } else if (dryRun) {
    console.log("\n[Dry run - no changes made]");
  }
}

/**
 * Remove standards from project
 */
async function removeStandards(
  standardIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(standardIds)
    ? standardIds
    : standardIds.includes(",")
    ? standardIds.split(",").map((s) => s.trim())
    : [standardIds];
  const configPath = getProjectConfigPath(projectPath);
  const config = await loadProjectConfig(configPath);

  console.log("\n🪴 Aichaku: Removing standards from project...\n");

  let removed = 0;
  for (const id of ids) {
    const index = config.selected.indexOf(id);
    if (index === -1) {
      console.log(`⚠️  ${id} not selected`);
      continue;
    }

    // Remove from selected array
    config.selected.splice(index, 1);

    // If it's a custom standard, also remove from customStandards metadata
    if (id.startsWith("custom:") && config.customStandards) {
      const customId = id.replace("custom:", "");
      if (config.customStandards[customId]) {
        delete config.customStandards[customId];
        console.log(`✅ Removed custom standard ${id} and its metadata`);
      } else {
        console.log(`✅ Removed ${id} (metadata already cleaned)`);
      }
    } else {
      console.log(`✅ Removed ${id}`);
    }

    removed++;
  }

  if (!dryRun && removed > 0) {
    await saveProjectConfig(configPath, config);
    console.log(
      `\n✅ Updated project configuration (${config.selected.length} standards remaining)`,
    );

    console.log(`\n💡 What you can do next:`);
    if (config.selected.length > 0) {
      console.log(
        `   • Run 'aichaku integrate' to update CLAUDE.md with current standards`,
      );
      console.log(
        `   • Run 'aichaku standards --show' to review remaining standards`,
      );
    }
    console.log(`   • Run 'aichaku standards --add <id>' to add standards`);
    console.log(
      `   • Run 'aichaku standards --search <term>' to find relevant standards`,
    );
  } else if (dryRun) {
    console.log("\n[Dry run - no changes made]");
  }
}

/**
 * Interactive standard selection
 */
function interactiveSelection(
  _projectPath?: string,
  _dryRun: boolean = false,
): void {
  console.log("\n🪴 Aichaku: Interactive Standards Selection\n");
  console.log("This feature is coming soon!");
  console.log("\nFor now, use:");
  console.log("  aichaku standards --add owasp-web,nist-csf,15-factor");
  console.log("  aichaku standards --show");
  console.log("  aichaku standards --remove pci-dss");
}

/**
 * Create a new custom standard
 */
async function createCustomStandard(name: string): Promise<void> {
  console.log(`\n🪴 Aichaku: Creating custom standard "${name}"...\n`);

  // Sanitize the name to prevent directory traversal
  const sanitizedName = sanitizeStandardName(name);
  if (!sanitizedName) {
    console.error(`❌ Invalid standard name: "${name}"`);
    console.error(
      `Standard names must contain only letters, numbers, hyphens, and underscores`,
    );
    return;
  }

  // Ensure Aichaku directories exist
  await ensureAichakuDirs();

  const standardPath = getUserStandardPath(sanitizedName);

  // Check if standard already exists
  if (await exists(standardPath)) {
    console.error(`❌ Custom standard "${sanitizedName}" already exists`);
    console.log(`   Path: ${standardPath}`);
    console.log(
      `   Use --edit-custom to modify it or --copy-custom to duplicate it`,
    );
    return;
  }

  // Create the standard template
  const template = createStandardTemplate(name, sanitizedName);

  try {
    await Deno.writeTextFile(standardPath, template, { mode: 0o644 });
    console.log(`✅ Created custom standard: ${sanitizedName}`);
    console.log(`   Path: ${standardPath}`);
    console.log(`\n💡 Next steps:`);
    console.log(
      `   • Edit the standard: aichaku standards --edit-custom ${sanitizedName}`,
    );
    console.log(
      `   • Add to project: aichaku standards --add ${sanitizedName}`,
    );
    console.log(`   • View all standards: aichaku standards --list`);
  } catch (error) {
    console.error(
      `❌ Failed to create custom standard: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Delete a custom standard
 */
async function deleteCustomStandard(name: string): Promise<void> {
  console.log(`\n🪴 Aichaku: Deleting custom standard "${name}"...\n`);

  const sanitizedName = sanitizeStandardName(name);
  if (!sanitizedName) {
    console.error(`❌ Invalid standard name: "${name}"`);
    return;
  }

  const standardPath = getUserStandardPath(sanitizedName);

  if (!(await exists(standardPath))) {
    console.error(`❌ Custom standard "${sanitizedName}" does not exist`);
    console.log(`   Use --list to see available standards`);
    return;
  }

  try {
    // Security: Use safe remove with validation
    const paths = getAichakuPaths();
    await safeRemove(standardPath, paths.global.user.standards);
    console.log(`✅ Deleted custom standard: ${sanitizedName}`);
    console.log(`\n💡 The standard has been removed from your system`);
    console.log(
      `   If it was used in any projects, you may want to remove it:`,
    );
    console.log(`   aichaku standards --remove ${sanitizedName}`);
  } catch (error) {
    console.error(
      `❌ Failed to delete custom standard: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Edit a custom standard
 */
async function editCustomStandard(name: string): Promise<void> {
  console.log(
    `\n🪴 Aichaku: Opening custom standard "${name}" for editing...\n`,
  );

  const sanitizedName = sanitizeStandardName(name);
  if (!sanitizedName) {
    console.error(`❌ Invalid standard name: "${name}"`);
    return;
  }

  const standardPath = getUserStandardPath(sanitizedName);

  if (!(await exists(standardPath))) {
    console.error(`❌ Custom standard "${sanitizedName}" does not exist`);
    console.log(`   Use --create-custom to create it first`);
    return;
  }

  // Try to open with the system's default editor
  try {
    const editor = Deno.env.get("EDITOR") || Deno.env.get("VISUAL") || "code";

    const command = new Deno.Command(editor, {
      args: [standardPath],
      stdout: "inherit",
      stderr: "inherit",
    });

    const process = command.spawn();
    const result = await process.status;

    if (result.success) {
      console.log(`✅ Opened ${sanitizedName} in ${editor}`);
      console.log(`   Path: ${standardPath}`);
    } else {
      console.error(
        `❌ Failed to open editor. Try setting EDITOR environment variable.`,
      );
      console.log(`   Path: ${standardPath}`);
    }
  } catch (error) {
    console.error(
      `❌ Failed to open editor: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
    console.log(`   You can manually edit: ${standardPath}`);
  }
}

/**
 * Copy a custom standard
 */
async function copyCustomStandard(
  source: string,
  target: string,
): Promise<void> {
  console.log(
    `\n🪴 Aichaku: Copying custom standard "${source}" to "${target}"...\n`,
  );

  const sanitizedSource = sanitizeStandardName(source);
  const sanitizedTarget = sanitizeStandardName(target);

  if (!sanitizedSource || !sanitizedTarget) {
    console.error(`❌ Invalid standard names`);
    return;
  }

  const sourcePath = getUserStandardPath(sanitizedSource);
  const targetPath = getUserStandardPath(sanitizedTarget);

  if (!(await exists(sourcePath))) {
    console.error(`❌ Source standard "${sanitizedSource}" does not exist`);
    return;
  }

  if (await exists(targetPath)) {
    console.error(`❌ Target standard "${sanitizedTarget}" already exists`);
    return;
  }

  try {
    // Read source content
    // Security: Use safe read with validation
    const paths = getAichakuPaths();
    const content = await safeReadTextFile(sourcePath, paths.global.standards);

    // Update frontmatter with new name
    const updatedContent = content.replace(
      /^---\s*\n([\s\S]*?)\n---/,
      (_match, frontmatter) => {
        const updatedFrontmatter = frontmatter
          .replace(/^title: ".*"/m, `title: "${target}"`);
        return `---\n${updatedFrontmatter}\n---`;
      },
    );

    // Write to target
    await Deno.writeTextFile(targetPath, updatedContent, { mode: 0o644 });

    console.log(
      `✅ Copied custom standard: ${sanitizedSource} → ${sanitizedTarget}`,
    );
    console.log(`   Source: ${sourcePath}`);
    console.log(`   Target: ${targetPath}`);
    console.log(`\n💡 Next steps:`);
    console.log(
      `   • Edit the copy: aichaku standards --edit-custom ${sanitizedTarget}`,
    );
    console.log(
      `   • Add to project: aichaku standards --add ${sanitizedTarget}`,
    );
  } catch (error) {
    console.error(
      `❌ Failed to copy custom standard: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Sanitize standard name to prevent directory traversal and ensure valid filename
 */
function sanitizeStandardName(name: string): string | null {
  // Remove any path separators and invalid characters
  const sanitized = name
    .replace(/[/\\]/g, "")
    .replace(/[<>:"|?*]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  // Check if it's a valid name (only letters, numbers, hyphens, underscores)
  if (!/^[a-z0-9_-]+$/.test(sanitized) || sanitized.length === 0) {
    return null;
  }

  return sanitized;
}

/**
 * Create a standard template with proper frontmatter
 */
function createStandardTemplate(
  originalName: string,
  _sanitizedName: string,
): string {
  return `---
title: "${originalName}"
description: "Brief description of this standard"
tags: ["custom", "organization"]
---

# ${originalName}

## Overview
[Description of the standard]

## Implementation
[How to implement this standard]

## Examples
[Code examples or guidelines]

## Quick Reference
[Key points for quick reference]

## Best Practices
[Recommended practices when using this standard]

## Common Pitfalls
[Things to avoid when implementing this standard]

## Related Standards
[Links to related or complementary standards]

---

*This is a custom standard created for your specific needs. Edit this file to add your organization's guidelines and requirements.*
`;
}

/**
 * Show standards command help
 */
function showStandardsHelp(): void {
  console.log(`
🪴 Aichaku Standards - Choose Your Guidance

Usage:
  aichaku standards [options]

Options:
  --list              List all available standards
  --categories        List standards grouped by category
  --search <query>    Search standards by keyword
  --show              Show standards selected for this project
  --add <ids>         Add standards to project (comma-separated)
  --remove <ids>      Remove standards from project
  --select            Interactive selection (coming soon)

  Custom Standard Management:
  --create-custom <name>       Create a new custom standard
  --delete-custom <name>       Delete a custom standard
  --edit-custom <name>         Edit a custom standard
  --copy-custom <src> <target> Copy a custom standard

Examples:
  # See all available standards
  aichaku standards --list

  # Search for security standards
  aichaku standards --search security

  # Add built-in standards to your project
  aichaku standards --add owasp-web,15-factor,tdd

  # Add custom standards to your project
  aichaku standards --add custom:my-company-guidelines

  # Mix built-in and custom standards
  aichaku standards --add owasp-web,custom:internal-standards

  # See what's selected
  aichaku standards --show

  # Remove any standard (built-in or custom)
  aichaku standards --remove pci-dss,custom:old-guidelines

  # Create a custom standard
  aichaku standards --create-custom "My Organization Style"

  # Edit a custom standard
  aichaku standards --edit-custom my-organization-style

  # Copy a custom standard
  aichaku standards --copy-custom my-style company-wide-style

Custom Standards:
  Custom standards are markdown files you create with your own
  guidance. They should be placed in:
  • ~/.claude/aichaku/user/standards/STANDARD-NAME.md
  • ~/.claude/aichaku/standards/custom/STANDARD-NAME.md (legacy)
  
  Use the format: custom:standard-name (lowercase, hyphens allowed)

Standards provide modular guidance that Claude Code will follow
when working on your project. Choose standards that match your
needs - security, architecture, testing, and more.
`);
}

/**
 * Helper: Get project config path with security validation
 * InfoSec: Prevents path traversal attacks by validating normalized paths
 */
function getProjectConfigPath(projectPath?: string): string {
  const _paths = getAichakuPaths();
  const base = resolve(projectPath || Deno.cwd());

  // Use new path structure under .claude/aichaku/
  const configPath = join(base, ".claude", "aichaku", "aichaku-standards.json");
  const normalized = normalize(configPath);

  // Security: Ensure the path is within the project directory and is safe
  if (!normalized.startsWith(base) || !isPathSafe(normalized)) {
    throw new Error("Invalid project path: attempted directory traversal");
  }

  return normalized;
}

/**
 * Helper: Load project configuration with validation
 */
async function loadProjectConfig(path: string): Promise<ProjectConfig> {
  if (await exists(path)) {
    // Security: The path should already be validated by the caller,
    // but we'll ensure it's within the project directory
    const projectRoot = path.includes("aichaku")
      ? resolve(path, "..", "..", "..") // Go up from .claude/aichaku/standards.json
      : resolve(path, "..", ".."); // Go up from .claude/standards.json
    const content = await safeReadTextFile(path, projectRoot);
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

      return parsed as ProjectConfig;
    } catch (_error) {
      // InfoSec: Don't expose raw error messages
      console.error("Failed to parse project configuration");
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
async function saveProjectConfig(
  path: string,
  config: ProjectConfig,
): Promise<void> {
  // Validate path to prevent directory traversal
  const normalized = normalize(path);

  // Security check using paths module
  if (!isPathSafe(normalized)) {
    throw new Error("Invalid configuration path: security violation");
  }

  // Ensure the directory exists (.claude/aichaku/)
  const dir = join(normalized, "..");
  await ensureDir(dir);

  // Write with secure permissions (read/write for owner, read-only for others)
  await Deno.writeTextFile(path, JSON.stringify(config, null, 2), {
    mode: 0o644,
  });
}

/**
 * Helper: Find a standard by ID (handles both built-in and custom standards)
 */
function findStandard(id: string): Standard | null {
  // Handle custom standards
  if (id.startsWith("custom:")) {
    return null; // Custom standards are handled separately
  }

  // Handle built-in standards
  for (const category of Object.values(STANDARD_CATEGORIES)) {
    if (id in category.standards) {
      return category.standards[id as keyof typeof category.standards];
    }
  }
  return null;
}

/**
 * Helper: Add a custom standard to project configuration
 */
async function addCustomStandard(
  customId: string,
  config: ProjectConfig,
): Promise<
  { success: boolean; name?: string; source?: string; error?: string }
> {
  // Validate custom ID format
  if (!customId.startsWith("custom:")) {
    return {
      success: false,
      error: "Custom standard ID must start with 'custom:'",
    };
  }

  const standardName = customId.replace("custom:", "");

  // Validate standard name (prevent path traversal)
  if (!/^[a-zA-Z0-9_-]+$/.test(standardName)) {
    return {
      success: false,
      error:
        "Invalid custom standard name. Use only letters, numbers, hyphens, and underscores.",
    };
  }

  try {
    // Try to find the custom standard file
    const customStandard = await loadCustomStandard(standardName);

    if (!customStandard) {
      return {
        success: false,
        error: `Custom standard '${standardName}' not found. Check ${
          formatCustomStandardPaths(standardName)
        }`,
      };
    }

    // Initialize customStandards if it doesn't exist
    if (!config.customStandards) {
      config.customStandards = {};
    }

    // Add custom standard metadata
    config.customStandards[standardName] = {
      name: customStandard.name,
      description: customStandard.description,
      path: customStandard.path,
      tags: customStandard.tags || [],
    };

    return {
      success: true,
      name: customStandard.name,
      source: formatPathForDisplay(customStandard.path),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to load custom standard: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Helper: Load custom standard from file system
 */
async function loadCustomStandard(standardName: string): Promise<
  {
    name: string;
    description: string;
    path: string;
    tags: string[];
  } | null
> {
  // InfoSec: Validate standard name to prevent path traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(standardName)) {
    return null;
  }

  const paths = getAichakuPaths();
  const possiblePaths = [
    // User standards directory
    join(paths.global.user.standards, `${standardName.toUpperCase()}.md`),
    // Legacy custom standards directory
    join(paths.legacy.customStandards, `${standardName.toUpperCase()}.md`),
  ];

  for (const standardPath of possiblePaths) {
    try {
      // Security: Validate path is safe
      if (!isPathSafe(standardPath)) {
        continue;
      }

      if (await exists(standardPath)) {
        // Security: Use safe read for custom standards
        const paths = getAichakuPaths();
        const content = await safeReadTextFile(
          standardPath,
          paths.global.user.standards,
        );

        // Extract metadata from markdown file
        const metadata = extractStandardMetadata(content);

        return {
          name: metadata.name || standardName,
          description: metadata.description || "Custom standard",
          path: standardPath,
          tags: metadata.tags || ["custom"],
        };
      }
    } catch (error) {
      // Continue to next path
      console.warn(
        `Failed to load custom standard from ${standardPath}: ${error}`,
      );
    }
  }

  return null;
}

/**
 * Helper: Extract metadata from standard markdown content
 */
function extractStandardMetadata(content: string): {
  name?: string;
  description?: string;
  tags?: string[];
} {
  const metadata: { name?: string; description?: string; tags?: string[] } = {};

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.name = titleMatch[1].trim();
  }

  // Extract description from first paragraph after title
  const descMatch = content.match(/^#\s+.+\n\n(.+)$/m);
  if (descMatch) {
    metadata.description = descMatch[1].trim();
  }

  // Extract tags from YAML frontmatter or special comment
  const tagsMatch = content.match(/tags:\s*\[(.*?)\]/i);
  if (tagsMatch) {
    metadata.tags = tagsMatch[1].split(",").map((tag) =>
      tag.trim().replace(/"/g, "")
    );
  }

  return metadata;
}

/**
 * Helper: Format custom standard paths for display
 */
function formatCustomStandardPaths(standardName: string): string {
  const paths = getAichakuPaths();
  return [
    formatPathForDisplay(
      join(paths.global.user.standards, `${standardName.toUpperCase()}.md`),
    ),
    formatPathForDisplay(
      join(paths.legacy.customStandards, `${standardName.toUpperCase()}.md`),
    ),
  ].join(" or ");
}

/**
 * Helper: Format path for display (imported from paths module)
 */
function formatPathForDisplay(path: string): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (home && path.startsWith(home)) {
    return path.replace(home, "~");
  }
  return path;
}

/**
 * Helper: Load all available custom standards from the file system
 */
async function loadAvailableCustomStandards(): Promise<
  Array<{
    id: string;
    name: string;
    description: string;
    path: string;
    tags: string[];
  }>
> {
  const customStandards: Array<{
    id: string;
    name: string;
    description: string;
    path: string;
    tags: string[];
  }> = [];

  const paths = getAichakuPaths();
  const directories = [
    paths.global.user.standards,
    paths.legacy.customStandards,
  ];

  for (const directory of directories) {
    try {
      if (await exists(directory)) {
        // Security: Use safe directory reading
        for await (
          const entry of safeReadDir(directory, paths.global.user.standards)
        ) {
          if (entry.isFile && entry.name.endsWith(".md")) {
            const standardPath = join(directory, entry.name);

            // Security: Validate path is safe
            if (!isPathSafe(standardPath)) {
              continue;
            }

            try {
              // Security: Use safe read for custom standards
              const content = await safeReadTextFile(standardPath, directory);
              const metadata = extractStandardMetadata(content);

              // Extract standard ID from filename (remove .md extension and convert to lowercase)
              const standardId = entry.name.replace(".md", "").toLowerCase();

              customStandards.push({
                id: standardId,
                name: metadata.name || standardId,
                description: metadata.description || "Custom standard",
                path: standardPath,
                tags: metadata.tags || ["custom"],
              });
            } catch (error) {
              console.warn(
                `Failed to load custom standard from ${standardPath}: ${error}`,
              );
            }
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read, skip
      console.warn(
        `Failed to read custom standards directory ${directory}: ${error}`,
      );
    }
  }

  // Remove duplicates (prefer user directory over legacy)
  const uniqueStandards = new Map<string, typeof customStandards[0]>();
  for (const standard of customStandards) {
    if (
      !uniqueStandards.has(standard.id) ||
      standard.path.includes(paths.global.user.standards)
    ) {
      uniqueStandards.set(standard.id, standard);
    }
  }

  return Array.from(uniqueStandards.values()).sort((a, b) =>
    a.id.localeCompare(b.id)
  );
}
