/**
 * Methodologies command for Aichaku
 * Manages which methodologies are active for focused context loading
 *
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { join } from "jsr:@std/path@1";
import { safeReadTextFile } from "../utils/path-security.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { createProjectConfigManager } from "../utils/config-manager.ts";

/**
 * Represents a development methodology
 * @public
 */
interface Methodology {
  /** Display name of the methodology */
  name: string;
  /** Brief description of what the methodology covers */
  description: string;
  /** Best use cases for this methodology */
  bestFor: string;
  /** Key principles and practices */
  principles: string[];
  /** Typical team size */
  teamSize: string;
}

/**
 * Methodology selection options
 */
interface MethodologiesOptions {
  list?: boolean;
  show?: boolean;
  add?: string | string[];
  remove?: string | string[];
  search?: string;
  projectPath?: string;
  dryRun?: boolean;
  set?: string | string[];
  reset?: boolean;
}

/**
 * Available methodologies with their definitions
 */
const AVAILABLE_METHODOLOGIES: Record<string, Methodology> = {
  "shape-up": {
    name: "Shape Up",
    description: "6-week cycles with appetite-based planning and fixed time/variable scope",
    bestFor: "Complex features, solo developers, small focused teams",
    principles: [
      "Fixed time, variable scope",
      "Appetite over estimates",
      "Shaping before betting",
      "Hill charts for progress",
      "Circuit breakers for scope",
    ],
    teamSize: "1-3 people",
  },
  "scrum": {
    name: "Scrum",
    description: "Sprint-based iterative development with ceremonies and roles",
    bestFor: "Predictable delivery, established teams, regular releases",
    principles: [
      "Sprint-based iterations",
      "User stories and backlog",
      "Daily standups",
      "Sprint retrospectives",
      "Definition of Done",
    ],
    teamSize: "5-9 people",
  },
  "kanban": {
    name: "Kanban",
    description: "Continuous flow with WIP limits and visual management",
    bestFor: "Ongoing support, maintenance work, continuous delivery",
    principles: [
      "Visualize workflow",
      "Limit work in progress",
      "Manage flow",
      "Make policies explicit",
      "Continuous improvement",
    ],
    teamSize: "Any size",
  },
  "lean": {
    name: "Lean Startup",
    description: "Build-measure-learn cycles with validated learning",
    bestFor: "New products, uncertain requirements, startup environments",
    principles: [
      "Build-Measure-Learn",
      "Minimum viable product",
      "Validated learning",
      "Innovation accounting",
      "Pivot or persevere",
    ],
    teamSize: "2-8 people",
  },
  "scrumban": {
    name: "Scrumban",
    description: "Hybrid approach combining Scrum structure with Kanban flow",
    bestFor: "Transitioning teams, mixed workload types, evolutionary improvement",
    principles: [
      "Scrum events + Kanban flow",
      "Pull-based planning",
      "Continuous improvement",
      "Visual management",
      "Flexible iteration boundaries",
    ],
    teamSize: "3-7 people",
  },
  "xp": {
    name: "Extreme Programming (XP)",
    description: "Engineering-focused methodology with technical practices",
    bestFor: "Technical teams, high-quality code requirements, frequent releases",
    principles: [
      "Test-driven development",
      "Pair programming",
      "Continuous integration",
      "Simple design",
      "Collective code ownership",
    ],
    teamSize: "2-12 people",
  },
};

/**
 * Browse and manage development methodologies
 *
 * Allows teams to select specific methodologies for focused context loading.
 * Instead of loading all methodologies, only active ones contribute to
 * agent context, reducing bloat while maintaining relevant guidance.
 *
 * @param {MethodologiesOptions} options - Options for browsing and managing methodologies
 * @param {boolean} options.list - List all available methodologies
 * @param {boolean} options.show - Show currently active methodologies
 * @param {string[]} options.add - Methodologies to add to project configuration
 * @param {string[]} options.remove - Methodologies to remove from configuration
 * @param {string[]} options.set - Set specific methodologies (replaces current selection)
 * @param {boolean} options.reset - Reset to default methodology
 * @param {string} options.search - Search methodologies by keyword
 * @param {string} options.projectPath - Project path for local operations
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // List all available methodologies
 * await methodologies({ list: true });
 *
 * // Search for agile methodologies
 * await methodologies({ search: "agile" });
 *
 * // Add methodologies to project
 * await methodologies({ add: ["shape-up", "scrum"] });
 *
 * // Set single methodology (removes others)
 * await methodologies({ set: ["kanban"] });
 *
 * // Show current selection
 * await methodologies({ show: true });
 * ```
 *
 * @public
 */
export async function methodologies(options: MethodologiesOptions = {}): Promise<void> {
  try {
    // List all available methodologies
    if (options.list) {
      await listMethodologies();
      return;
    }

    // Search methodologies
    if (options.search) {
      await searchMethodologies(options.search);
      return;
    }

    // Show current project methodologies
    if (options.show) {
      await showProjectMethodologies(options.projectPath);
      return;
    }

    // Add methodologies to project
    if (options.add) {
      await addMethodologies(options.add, options.projectPath, options.dryRun);
      return;
    }

    // Remove methodologies from project
    if (options.remove) {
      await removeMethodologies(options.remove, options.projectPath, options.dryRun);
      return;
    }

    // Set methodologies (replace current)
    if (options.set) {
      await setMethodologies(options.set, options.projectPath, options.dryRun);
      return;
    }

    // Reset to default methodology
    if (options.reset) {
      await resetMethodologies(options.projectPath, options.dryRun);
      return;
    }

    // Default: show help
    showMethodologiesHelp();
  } catch (error) {
    // InfoSec: Avoid exposing detailed error messages
    console.error(`❌ Error: An error occurred while processing methodologies`);
    if (error instanceof Error && error.message.includes("directory traversal")) {
      console.error("Security violation detected");
    }
    Deno.exit(1);
  }
}

/**
 * List all available methodologies
 */
function listMethodologies(): void {
  console.log("\n🪴 Aichaku: Available Methodologies\n");

  for (const [id, methodology] of Object.entries(AVAILABLE_METHODOLOGIES)) {
    console.log(`• ${id}: ${methodology.name}`);
    console.log(`  ${methodology.description}`);
    console.log(`  Best for: ${methodology.bestFor}`);
    console.log(`  Team size: ${methodology.teamSize}`);
    console.log(`  Key principles: ${methodology.principles.slice(0, 3).join(", ")}...`);
    console.log();
  }

  console.log("💡 Usage tips:");
  console.log("   • Use 'aichaku methodologies --add shape-up' for focused context");
  console.log("   • Multiple methodologies can be active simultaneously");
  console.log("   • Each active methodology adds ~1500 tokens to agent context");
  console.log("   • Run 'aichaku methodologies --show' to see current selection");
}

/**
 * Search methodologies by keyword
 */
function searchMethodologies(query: string): void {
  const lowerQuery = query.toLowerCase();
  const matches: Array<{ id: string; methodology: Methodology }> = [];

  // Search in ID, name, description, bestFor, and principles
  for (const [id, methodology] of Object.entries(AVAILABLE_METHODOLOGIES)) {
    if (
      id.toLowerCase().includes(lowerQuery) ||
      methodology.name.toLowerCase().includes(lowerQuery) ||
      methodology.description.toLowerCase().includes(lowerQuery) ||
      methodology.bestFor.toLowerCase().includes(lowerQuery) ||
      methodology.principles.some((principle) => principle.toLowerCase().includes(lowerQuery))
    ) {
      matches.push({ id, methodology });
    }
  }

  if (matches.length === 0) {
    console.log(`\n🪴 Aichaku: No methodologies found matching "${query}"`);
    return;
  }

  console.log(`\n🪴 Aichaku: Methodologies matching "${query}"\n`);

  for (const { id, methodology } of matches) {
    console.log(`• ${id}: ${methodology.name}`);
    console.log(`  ${methodology.description}`);
    console.log(`  Best for: ${methodology.bestFor}`);
    console.log();
  }
}

/**
 * Show methodologies active for current project
 */
async function showProjectMethodologies(projectPath?: string): Promise<void> {
  try {
    const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();
    const configManager = await createProjectConfigManager(validatedProjectPath);

    // Try to load existing config
    try {
      await configManager.load();
    } catch {
      console.log("\n🪴 Aichaku: No configuration found for this project");
      console.log("Run 'aichaku init' to initialize project with methodology selection");
      return;
    }

    const activeMethodologies = configManager.getMethodologies();
    const defaultMethodology = configManager.getDefaultMethodology();

    console.log("\n🪴 Aichaku: Project Methodology Configuration\n");

    if (!activeMethodologies || activeMethodologies.length === 0) {
      console.log("No methodologies currently selected for this project\n");
      console.log("💡 To get started:");
      console.log("   • Run 'aichaku methodologies --list' to see available methodologies");
      console.log("   • Run 'aichaku methodologies --add <id>' to select a methodology");
      console.log("   • Run 'aichaku methodologies --set shape-up' for solo development");
      console.log("\nExample: aichaku methodologies --add shape-up");
      return;
    }

    // Show active methodologies
    console.log(`Active methodologies: ${activeMethodologies.join(", ")}`);
    if (defaultMethodology) {
      console.log(`Default methodology: ${defaultMethodology}`);
    }
    console.log();

    // Show details for each methodology
    for (const methodologyId of activeMethodologies) {
      const methodology = AVAILABLE_METHODOLOGIES[methodologyId];
      if (methodology) {
        console.log(`• ${methodologyId}: ${methodology.name}`);
        console.log(`  Description: ${methodology.description}`);
        console.log(`  Best for: ${methodology.bestFor}`);
        console.log(`  Team size: ${methodology.teamSize}`);
        console.log(`  Key principles:`);
        methodology.principles.forEach((principle) => {
          console.log(`    - ${principle}`);
        });
        console.log();
      } else {
        console.log(`• ${methodologyId} (unknown methodology)`);
        console.log(`  ⚠️  Warning: Methodology not found in available methodologies\n`);
      }
    }

    // Check integration status and provide options
    const claudeMdPath = join(validatedProjectPath, "CLAUDE.md");
    const claudeExists = await exists(claudeMdPath);
    const needsIntegration = !claudeExists ||
      (claudeExists &&
        !(await safeReadTextFile(claudeMdPath, validatedProjectPath)).includes(
          "AICHAKU:",
        ));

    console.log(`\n💡 What you can do:`);
    if (needsIntegration) {
      console.log(
        `   • Run 'aichaku integrate' to ${claudeExists ? "update" : "create"} CLAUDE.md with this methodology`,
      );
    }
    console.log(`   • Run 'aichaku methodologies --add <id>' to add additional methodologies`);
    console.log(`   • Run 'aichaku methodologies --set <id>' to change to a different methodology`);
    console.log(`   • Run 'aichaku methodologies --search <term>' to find specific methodologies`);
  } catch (error) {
    console.error(
      `❌ Failed to show project methodologies: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Add methodologies to project
 */
async function addMethodologies(
  methodologyIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(methodologyIds)
    ? methodologyIds
    : methodologyIds.includes(",")
    ? methodologyIds.split(",").map((s) => s.trim())
    : [methodologyIds];

  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  console.log("\n🪴 Aichaku: Adding methodologies to project...\n");

  // Validate all methodologies exist first
  const invalidIds = ids.filter((id) => !AVAILABLE_METHODOLOGIES[id]);
  if (invalidIds.length > 0) {
    console.log(`❌ Unknown methodologies: ${invalidIds.join(", ")}`);
    console.log(`   💡 Use 'aichaku methodologies --list' to see available methodologies`);
    return;
  }

  try {
    let configManager = createProjectConfigManager(validatedProjectPath);

    // Try to load existing config or create new one
    try {
      await configManager.load();
    } catch {
      // Create new configuration if none exists
      const defaultConfig = createProjectConfigManager(validatedProjectPath);
      await defaultConfig.update({
        project: {
          created: new Date().toISOString(),
        },
      });
      // Re-load the config manager to get the updated configuration
      configManager = createProjectConfigManager(validatedProjectPath);
      await configManager.load();
    }

    // Add all specified methodologies
    const currentMethodologies = configManager.getMethodologies();
    const newMethodologies = [...new Set([...currentMethodologies, ...ids])];

    if (!dryRun) {
      await configManager.setMethodologies(newMethodologies);
      console.log(`✅ Added methodologies: ${ids.join(", ")}`);
      console.log(`\nActive methodologies: ${newMethodologies.join(", ")}`);

      console.log(`\n💡 What you can do next:`);
      console.log(`   • Run 'aichaku integrate' to apply this methodology to CLAUDE.md`);
      console.log(`   • Run 'aichaku methodologies --show' to review your selection`);
      console.log(`   • Start using methodology-specific language in your conversations`);
    } else {
      console.log(`[Dry run] Would add methodologies: ${ids.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Failed to add methodologies: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Remove methodologies from project
 */
async function removeMethodologies(
  methodologyIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(methodologyIds)
    ? methodologyIds
    : methodologyIds.includes(",")
    ? methodologyIds.split(",").map((s) => s.trim())
    : [methodologyIds];

  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  console.log("\n🪴 Aichaku: Removing methodologies from project...\n");

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);
    await configManager.load();

    const currentMethodologies = configManager.getMethodologies();

    if (!currentMethodologies || currentMethodologies.length === 0) {
      console.log(`⚠️  No methodologies currently set for this project`);
      return;
    }

    const toRemove = ids.filter((id) => currentMethodologies.includes(id));
    const notActive = ids.filter((id) => !currentMethodologies.includes(id));

    if (toRemove.length === 0) {
      console.log(`⚠️  None of the specified methodologies are currently active`);
      console.log(`   Current methodologies: ${currentMethodologies.join(", ")}`);
      return;
    }

    const remaining = currentMethodologies.filter((m) => !toRemove.includes(m));

    if (!dryRun) {
      await configManager.setMethodologies(remaining);
      console.log(`✅ Removed methodologies: ${toRemove.join(", ")}`);

      if (notActive.length > 0) {
        console.log(`ℹ️  Not active (skipped): ${notActive.join(", ")}`);
      }

      if (remaining.length === 0) {
        console.log(`\n💡 Project now has no active methodologies`);
        console.log(`   • Run 'aichaku methodologies --add <id>' to select a new methodology`);
      } else {
        console.log(`\nRemaining methodologies: ${remaining.join(", ")}`);
      }
    } else {
      console.log(`[Dry run] Would remove methodologies: ${toRemove.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Failed to remove methodologies: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Set methodologies (replace current selection)
 */
async function setMethodologies(
  methodologyIds: string | string[],
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const ids = Array.isArray(methodologyIds)
    ? methodologyIds
    : methodologyIds.includes(",")
    ? methodologyIds.split(",").map((s) => s.trim())
    : [methodologyIds];

  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  console.log("\n🪴 Aichaku: Setting project methodology...\n");

  // Validate all methodologies exist first
  const invalidIds = ids.filter((id) => !AVAILABLE_METHODOLOGIES[id]);
  if (invalidIds.length > 0) {
    console.log(`❌ Unknown methodologies: ${invalidIds.join(", ")}`);
    console.log(`   💡 Use 'aichaku methodologies --list' to see available methodologies`);
    return;
  }

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);

    // Try to load existing config or create new one
    try {
      await configManager.load();
    } catch {
      // Will create configuration when setting methodology
    }

    if (!dryRun) {
      await configManager.setMethodologies(ids);
      console.log(`✅ Set methodologies: ${ids.join(", ")}`);
      console.log();

      // Show details for each set methodology
      for (const id of ids) {
        const methodology = AVAILABLE_METHODOLOGIES[id];
        console.log(`   • ${methodology.name}: ${methodology.description}`);
      }

      console.log(`\n💡 What you can do next:`);
      console.log(`   • Run 'aichaku integrate' to apply this methodology to CLAUDE.md`);
      console.log(`   • Start using methodology-specific terminology`);
      console.log(`   • Agents will now load context for: ${ids.join(", ")}`);
    } else {
      console.log(`[Dry run] Would set methodologies: ${ids.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Failed to set methodologies: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Reset to default methodology
 */
async function resetMethodologies(
  projectPath?: string,
  dryRun: boolean = false,
): Promise<void> {
  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();
  const defaultMethodology = "shape-up"; // Good for solo development

  console.log("\n🪴 Aichaku: Resetting to default methodology...\n");

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);

    if (!dryRun) {
      await configManager.setMethodologies([defaultMethodology]);
      console.log(`✅ Reset to default methodology: ${defaultMethodology}`);

      const methodology = AVAILABLE_METHODOLOGIES[defaultMethodology];
      console.log(`   ${methodology.name}: ${methodology.description}`);
      console.log(`   Best for: ${methodology.bestFor}`);

      console.log(`\n💡 What you can do next:`);
      console.log(`   • Run 'aichaku integrate' to apply this methodology to CLAUDE.md`);
      console.log(`   • Run 'aichaku methodologies --set <id>' to choose a different methodology`);
    } else {
      console.log(`[Dry run] Would reset to default methodology: ${defaultMethodology}`);
    }
  } catch (error) {
    console.error(`❌ Failed to reset methodologies: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Show methodologies command help
 */
function showMethodologiesHelp(): void {
  console.log(`
🪴 Aichaku Methodologies - Choose Your Development Approach

Usage:
  aichaku methodologies [options]

Options:
  --list              List all available methodologies
  --search <query>    Search methodologies by keyword
  --show              Show methodology selected for this project
  --add <ids>         Add methodologies to project (comma-separated)
  --remove <ids>      Remove methodologies from project
  --set <ids>         Set specific methodologies (replaces current)
  --reset             Reset to default methodology (shape-up)

Examples:
  # See all available methodologies
  aichaku methodologies --list

  # Search for agile methodologies
  aichaku methodologies --search agile

  # Set primary methodology for solo development
  aichaku methodologies --set shape-up

  # Set methodology for team development
  aichaku methodologies --set scrum

  # See what's currently active
  aichaku methodologies --show

  # Remove current methodology
  aichaku methodologies --remove scrum

  # Reset to default
  aichaku methodologies --reset

Context Optimization:
  • Each methodology adds ~1500 tokens to agent context
  • Focused methodology selection reduces context bloat
  • Agents load only relevant guidance for active methodologies
  • Better performance and more targeted advice

Methodologies provide focused guidance that agents will use when
working on your project. Choose methodologies that match your
team size, project type, and development approach.

After selecting methodologies, run 'aichaku integrate' to update
your CLAUDE.md with the selected methodology context.
`);
}
