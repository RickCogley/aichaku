/**
 * Principles command for Aichaku
 * Manages guiding philosophies that inform development decisions
 *
 * @module
 */

import { resolveProjectPath } from "../utils/project-paths.ts";
import { createProjectConfigManager } from "../utils/config-manager.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";
import { PrincipleLoader } from "../utils/principle-loader.ts";
import { PRINCIPLE_CATEGORIES } from "../types/principle.ts";
import type { PrincipleCategory, PrincipleWithDocs } from "../types/principle.ts";

/**
 * Principle selection options
 */
interface PrinciplesOptions {
  list?: boolean;
  show?: boolean | string;
  add?: string;
  addInteractive?: boolean;
  current?: boolean;
  remove?: string;
  clear?: boolean;
  compatibility?: string;
  verbose?: boolean;
  category?: string;
  projectPath?: string;
  dryRun?: boolean;
}

// Initialize the principle loader
const principleLoader = new PrincipleLoader();

/**
 * Generate a consistent ID from a principle name
 */
function generatePrincipleId(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/[\s]+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Browse and manage development principles
 *
 * Allows teams to add guiding philosophies that expert agents
 * will consider when providing suggestions and reviewing code.
 *
 * @param {PrinciplesOptions} options - Options for browsing and managing principles
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // List all available principles
 * await principles({ list: true });
 *
 * // Show details about a specific principle
 * await principles({ show: "unix-philosophy", verbose: true });
 *
 * // Select principles for current project
 * await principles({ add: "unix-philosophy,dry,yagni" });
 *
 * // Show currently selected principles
 * await principles({ current: true });
 * ```
 *
 * @public
 */
export async function principles(options: PrinciplesOptions = {}): Promise<void> {
  try {
    // List all available principles
    if (options.list) {
      await listPrinciples(options.category);
      return;
    }

    // Show details about a specific principle or current selection
    if (options.show !== undefined && options.show !== false) {
      if (options.show === true || options.show === "") {
        // Bare --show, show current selection
        await showCurrentPrinciples(options.projectPath);
      } else if (typeof options.show === "string") {
        // --show <id>, show specific principle
        await showPrinciple(options.show, options.verbose);
      }
      return;
    }

    // Select principles for project
    if (options.add) {
      await selectPrinciples(options.add, options.projectPath, options.dryRun);
      return;
    }

    // Interactive selection
    if (options.addInteractive) {
      await selectPrinciplesInteractive(options.projectPath);
      return;
    }

    // Remove principles
    if (options.remove) {
      await removePrinciples(options.remove, options.projectPath, options.dryRun);
      return;
    }

    // Clear all principles
    if (options.clear) {
      await clearPrinciples(options.projectPath, options.dryRun);
      return;
    }

    // Check compatibility
    if (options.compatibility) {
      await checkCompatibility(options.compatibility);
      return;
    }

    // Default: show help
    showPrinciplesHelp();
  } catch (error) {
    console.error(`❌ Error: Failed to process principles command`);
    if (error instanceof Error && error.message.includes("directory traversal")) {
      console.error("Security violation detected");
    }
    Deno.exit(1);
  }
}

/**
 * List all available principles
 */
async function listPrinciples(category?: string): Promise<void> {
  // Load all principles
  const allPrinciples = await principleLoader.loadAll();

  const content = [`# 🌸 Aichaku Principles - Guiding Philosophies\n`];
  content.push(
    `Select from ${allPrinciples.length} timeless principles to guide your development.\n`,
  );

  // Group principles by category
  const principlesByCategory: Record<string, PrincipleWithDocs[]> = {};
  for (const principle of allPrinciples) {
    if (category && principle.data.category !== category) continue;

    if (!principlesByCategory[principle.data.category]) {
      principlesByCategory[principle.data.category] = [];
    }
    principlesByCategory[principle.data.category].push(principle);
  }

  // Display each category
  for (const [cat, categoryInfo] of Object.entries(PRINCIPLE_CATEGORIES)) {
    const principles = principlesByCategory[cat as PrincipleCategory];
    if (!principles || principles.length === 0) continue;

    content.push(`## ${categoryInfo.emoji} ${categoryInfo.name}\n`);

    for (const principle of principles) {
      const id = generatePrincipleId(principle.data.name);
      content.push(`- **${principle.data.name}** (\`${id}\`)`);
      content.push(`  ${principle.data.description}`);
      const coreTenets = principle.data.summary.core_tenets.slice(0, 2).map((t) => t.text);
      content.push(`  Core: ${coreTenets.join(", ")}...\n`);
    }
  }

  content.push(`## 💡 Usage Tips\n`);
  content.push(`- Use \`aichaku principles --add unix-philosophy,dry\` to choose principles`);
  content.push(`- Principles guide agent suggestions, not enforce rules`);
  content.push(`- Multiple principles can work together synergistically`);
  content.push(`- Run \`aichaku principles --show <id>\` for detailed information`);

  printFormatted(content.join("\n"));
}

/**
 * Show detailed information about a specific principle
 */
async function showPrinciple(principleId: string, verbose?: boolean): Promise<void> {
  const principle = await principleLoader.loadById(principleId);

  if (!principle) {
    console.error(`❌ Error: Principle '${principleId}' not found`);
    console.log(`💡 Use 'aichaku principles --list' to see available principles`);
    return;
  }

  const content = [`# 📚 ${principle.data.name}\n`];
  content.push(`**Category:** ${principle.data.category}`);
  content.push(`**ID:** \`${principleId}\`\n`);

  content.push(`## Description\n`);
  content.push(`${principle.data.description}\n`);

  // Only show tagline if it's different from description
  if (principle.data.summary.tagline && principle.data.summary.tagline !== principle.data.description) {
    content.push(`> ${principle.data.summary.tagline}\n`);
  }

  content.push(`## Core Tenets\n`);
  principle.data.summary.core_tenets.forEach((tenet) => {
    content.push(`- **${tenet.text}**`);
    content.push(`  ${tenet.guidance}`);
  });
  content.push(``);

  if (principle.data.summary.anti_patterns && principle.data.summary.anti_patterns.length > 0) {
    content.push(`## Anti-Patterns to Avoid\n`);
    principle.data.summary.anti_patterns.forEach((ap) => {
      content.push(`- **${ap.pattern}**`);
      content.push(`  Instead: ${ap.instead}`);
    });
    content.push(``);
  }

  if (verbose) {
    // Show full documentation if available
    if (principle.documentation) {
      content.push(`## Full Documentation\n`);
      content.push(principle.documentation);
    }

    if (principle.data.compatibility?.works_well_with && principle.data.compatibility.works_well_with.length > 0) {
      content.push(`## ✅ Works Well With\n`);
      for (const id of principle.data.compatibility.works_well_with) {
        const other = await principleLoader.loadById(id);
        if (other) {
          content.push(`- **${other.data.name}** - ${other.data.description}`);
        } else {
          content.push(`- ${id}`);
        }
      }
      content.push(``);
    }

    if (
      principle.data.compatibility?.potential_conflicts && principle.data.compatibility.potential_conflicts.length > 0
    ) {
      content.push(`## ⚠️ Potential Conflicts\n`);
      for (const id of principle.data.compatibility.potential_conflicts) {
        const other = await principleLoader.loadById(id);
        if (other) {
          content.push(`- **${other.data.name}** - May have conflicting approaches`);
        } else {
          content.push(`- ${id}`);
        }
      }
      content.push(``);
    }
  }

  printFormatted(content.join("\n"));
}

/**
 * Select principles for the current project
 */
async function selectPrinciples(
  principleIds: string,
  projectPath?: string,
  dryRun?: boolean,
): Promise<void> {
  const ids = principleIds.split(",").map((s) => s.trim());
  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  console.log("\n🌸 Aichaku: Selecting principles for project...\n");

  // Validate all principles exist
  const validPrinciples: PrincipleWithDocs[] = [];
  for (const id of ids) {
    const principle = await principleLoader.loadById(id);
    if (!principle) {
      console.error(`❌ Unknown principle: ${id}`);
      console.log(`   💡 Use 'aichaku principles --list' to see available principles`);
      return;
    }
    validPrinciples.push(principle);
  }

  // Check for compatibility warnings
  const warnings: string[] = [];
  for (let i = 0; i < validPrinciples.length; i++) {
    const principle = validPrinciples[i];
    if (!principle.data.compatibility?.potential_conflicts) continue;

    for (let j = 0; j < validPrinciples.length; j++) {
      if (i === j) continue;
      const conflictId = generatePrincipleId(validPrinciples[j].data.name);
      if (principle.data.compatibility.potential_conflicts.includes(conflictId)) {
        warnings.push(`⚠️  ${principle.data.name} may conflict with ${validPrinciples[j].data.name}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log("Compatibility warnings:");
    warnings.forEach((w) => console.log(`   ${w}`));
    console.log("");
  }

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);

    // Try to load existing config or create new one
    try {
      await configManager.load();
    } catch {
      // Create new configuration if none exists
      await configManager.update({});
      await configManager.load();
    }

    if (!dryRun) {
      // Save the principles to config
      await configManager.setPrinciples(ids);

      console.log(`✅ Selected principles: ${ids.join(", ")}`);

      // Show selected principles
      console.log(`\nSelected principles:`);
      for (const principle of validPrinciples) {
        console.log(`   • ${principle.data.name}: ${principle.data.description}`);
      }

      console.log(`\n💡 What you can do next:`);
      console.log(`   • Run 'aichaku integrate' to update CLAUDE.md with principles`);
      console.log(`   • Expert agents will now consider these principles`);
      console.log(`   • Use 'aichaku principles --current' to review selection`);
    } else {
      console.log(`[Dry run] Would select principles: ${ids.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Failed to select principles: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Interactive principle selection (placeholder)
 */
function selectPrinciplesInteractive(_projectPath?: string): void {
  console.log("\n🌸 Aichaku: Interactive principle selection\n");
  console.log("ℹ️  Interactive selection coming soon!");
  console.log("   For now, use: aichaku principles --add <principle-ids>");
}

/**
 * Show currently selected principles
 */
async function showCurrentPrinciples(projectPath?: string): Promise<void> {
  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);
    await configManager.load();

    const selectedPrinciples = configManager.getPrinciples();

    const content = [`# 🎯 Current Principle Selection\n`];

    if (selectedPrinciples.length === 0) {
      content.push(`No principles currently selected for this project.\n`);
      content.push(`## 💡 To Get Started\n`);
      content.push(`- Run \`aichaku principles --list\` to see available principles`);
      content.push(`- Run \`aichaku principles --add <ids>\` to choose principles`);
      content.push(`- Example: \`aichaku principles --add unix-philosophy,dry,yagni\``);
    } else {
      content.push(`Project follows ${selectedPrinciples.length} guiding principles:\n`);

      // Load and display each principle
      for (const id of selectedPrinciples) {
        const principle = await principleLoader.loadById(id);
        if (principle) {
          content.push(`## ${principle.data.name}`);
          content.push(`   ${principle.data.description}`);
          content.push(`   Category: ${principle.data.category}\n`);
        }
      }

      content.push(`## 💡 Managing Principles\n`);
      content.push(`- Add more: \`aichaku principles --add <ids>\``);
      content.push(`- Remove: \`aichaku principles --remove <ids>\``);
      content.push(`- Clear all: \`aichaku principles --clear\``);
      content.push(`- Check compatibility: \`aichaku principles --compatibility ${selectedPrinciples.join(",")}\``);
    }

    printFormatted(content.join("\n"));
  } catch (error) {
    console.error(`❌ Failed to show current principles: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Remove selected principles
 */
async function removePrinciples(
  principleIds: string,
  projectPath?: string,
  dryRun?: boolean,
): Promise<void> {
  const ids = principleIds.split(",").map((s) => s.trim());
  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  console.log("\n🌸 Aichaku: Removing principles from project...\n");

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);
    await configManager.load();

    if (!dryRun) {
      for (const id of ids) {
        await configManager.removePrinciple(id);
      }
      console.log(`✅ Removed principles: ${ids.join(", ")}`);
    } else {
      console.log(`[Dry run] Would remove principles: ${ids.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Failed to remove principles: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Clear all selected principles
 */
async function clearPrinciples(projectPath?: string, dryRun?: boolean): Promise<void> {
  const validatedProjectPath = projectPath ? resolveProjectPath(projectPath) : Deno.cwd();

  console.log("\n🌸 Aichaku: Clearing all principles...\n");

  try {
    const configManager = createProjectConfigManager(validatedProjectPath);
    await configManager.load();

    if (!dryRun) {
      await configManager.setPrinciples([]);
      console.log(`✅ All principles cleared`);
      console.log(`   Run 'aichaku principles --add <ids>' to choose new principles`);
    } else {
      console.log(`[Dry run] Would clear all principles`);
    }
  } catch (error) {
    console.error(`❌ Failed to clear principles: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Check compatibility between principles
 */
async function checkCompatibility(principleIds: string): Promise<void> {
  const ids = principleIds.split(",").map((s) => s.trim());

  const content = [`# 🔍 Principle Compatibility Check\n`];
  content.push(`Checking compatibility for: ${ids.join(", ")}\n`);

  // Validate principles exist and load them
  const principles: PrincipleWithDocs[] = [];
  for (const id of ids) {
    const principle = await principleLoader.loadById(id);
    if (!principle) {
      content.push(`❌ Unknown principle: ${id}`);
      printFormatted(content.join("\n"));
      return;
    }
    principles.push(principle);
  }

  // Check compatibility
  const compatible: string[] = [];
  const conflicts: string[] = [];

  for (let i = 0; i < principles.length; i++) {
    const principle = principles[i];
    const principleId = ids[i];

    for (let j = i + 1; j < principles.length; j++) {
      const other = principles[j];
      const otherId = ids[j];

      // Check if they work well together
      if (
        principle.data.compatibility?.works_well_with?.includes(otherId) ||
        other.data.compatibility?.works_well_with?.includes(principleId)
      ) {
        compatible.push(`✅ ${principle.data.name} + ${other.data.name}`);
      }

      // Check for conflicts
      if (
        principle.data.compatibility?.potential_conflicts?.includes(otherId) ||
        other.data.compatibility?.potential_conflicts?.includes(principleId)
      ) {
        conflicts.push(`⚠️  ${principle.data.name} ↔ ${other.data.name}`);
      }
    }
  }

  if (compatible.length > 0) {
    content.push(`## ✅ Synergistic Combinations\n`);
    compatible.forEach((c) => content.push(c));
    content.push(``);
  }

  if (conflicts.length > 0) {
    content.push(`## ⚠️ Potential Conflicts\n`);
    conflicts.forEach((c) => content.push(c));
    content.push(``);
  }

  if (compatible.length === 0 && conflicts.length === 0) {
    content.push(`ℹ️  No specific compatibility information found for this combination.`);
  }

  printFormatted(content.join("\n"));
}

/**
 * Show principles command help
 */
function showPrinciplesHelp(): void {
  printFormatted(`
# 🌸 Aichaku Principles - Guiding Philosophies

Select and manage development principles that guide your thinking and decision-making.

## Usage
\`aichaku principles [options]\`

## Options
- **--list** - List all available principles
- **--list --category <name>** - List principles in specific category
- **--show** - Show currently selected principles
- **--show <id>** - Show details about a specific principle
- **--show <id> --verbose** - Include compatibility information
- **--add <ids>** - Select principles (comma-separated)
- **--add-interactive** - Interactive principle selection (coming soon)
- **--remove <ids>** - Remove specific principles
- **--clear** - Remove all selected principles
- **--compatibility <ids>** - Check principle compatibility

## Examples

\`\`\`bash
# List all available principles
aichaku principles --list

# List only software development principles
aichaku principles --list --category software-development

# Show details about Unix Philosophy
aichaku principles --show unix-philosophy
aichaku principles --show unix-philosophy --verbose

# Select principles for your project
aichaku principles --add unix-philosophy,dry,yagni

# Check if principles work well together
aichaku principles --compatibility kiss,yagni,unix-philosophy

# See what's currently selected
aichaku principles --show

# Remove a principle
aichaku principles --remove dry

# Clear all principles
aichaku principles --clear
\`\`\`

## How Principles Work
Principles are guiding philosophies that expert agents consider when:
- Reviewing your code
- Suggesting improvements
- Making architectural decisions
- Providing guidance

Unlike standards (which are prescriptive), principles guide thinking
and help maintain consistency in approach and mindset.

## Categories
- **💻 Software Development** - Programming philosophies (DRY, KISS, YAGNI)
- **🏢 Organizational** - Team and process principles (Agile, Lean)
- **⚙️ Engineering** - Technical practices (Fail Fast, Defensive)
- **👥 Human-Centered** - User-focused principles (Accessibility, Privacy)
`);
}
