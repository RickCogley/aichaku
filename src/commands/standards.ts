/**
 * Standards command for Aichaku
 * Manages modular guidance sections that users can choose to include
 *
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { join, normalize, resolve } from "jsr:@std/path@1";
import { getAichakuPaths, isPathSafe } from "../paths.ts";

// Type definitions for better type safety
interface Standard {
  name: string;
  description: string;
  tags: string[];
}

interface StandardCategory {
  name: string;
  description: string;
  standards: Record<string, Standard>;
}

interface ProjectConfig {
  version: string;
  selected: string[];
  customStandards?: Record<string, CustomStandard>;
}

interface CustomStandard {
  name: string;
  description: string;
  path: string;
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
    },
  },
  testing: {
    name: "Testing Strategies",
    description: "Testing methodologies and practices",
    standards: {
      "tdd": {
        name: "Test-Driven Development",
        description: "Red-green-refactor cycle",
        tags: ["testing", "methodology", "quality"],
      },
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
}

/**
 * Project standards configuration
 */
interface ProjectStandards {
  version: string;
  selected: string[];
  customStandards?: Record<string, CustomStandard>;
}

interface CustomStandard {
  name: string;
  description: string;
  path: string;
  tags: string[];
}

/**
 * Main standards command implementation
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

    // Default: show help
    await showStandardsHelp();
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
 * List all available standards
 */
function listStandards(byCategory: boolean = false): void {
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
  }
}

/**
 * Search standards by keyword
 */
function searchStandards(query: string): void {
  const lowerQuery = query.toLowerCase();
  const matches: Array<[string, Standard, string]> = [];

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

  if (matches.length === 0) {
    console.log(`\n🪴 Aichaku: No standards found matching "${query}"`);
    return;
  }

  console.log(`\n🪴 Aichaku: Standards matching "${query}"\n`);
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
    const standard = findStandard(standardId);
    if (standard) {
      console.log(`• ${standardId}: ${standard.name}`);
      console.log(`  ${standard.description}`);
    } else {
      console.log(`• ${standardId} (custom or unknown)`);
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
  const claudeMdPath = join(projectPath || Deno.cwd(), "CLAUDE.md");
  const claudeExists = await exists(claudeMdPath);
  const needsIntegration = !claudeExists ||
    (claudeExists &&
      !(await Deno.readTextFile(claudeMdPath)).includes("AICHAKU:STANDARDS"));

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

    const standard = findStandard(id);
    if (!standard) {
      console.log(`❌ Unknown standard: ${id}`);
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

    config.selected.splice(index, 1);
    console.log(`✅ Removed ${id}`);
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

Examples:
  # See all available standards
  aichaku standards --list

  # Search for security standards
  aichaku standards --search security

  # Add standards to your project
  aichaku standards --add owasp-web,15-factor,tdd

  # See what's selected
  aichaku standards --show

  # Remove a standard
  aichaku standards --remove pci-dss

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
  const paths = getAichakuPaths();
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
    const content = await Deno.readTextFile(path);
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
 * Helper: Find a standard by ID
 */
function findStandard(id: string): Standard | null {
  for (const category of Object.values(STANDARD_CATEGORIES)) {
    if (id in category.standards) {
      return category.standards[id as keyof typeof category.standards];
    }
  }
  return null;
}
