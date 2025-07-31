/**
 * Refactored Methodologies command using shared infrastructure
 * Demonstrates the DRY principle in action
 *
 * @module
 */

import { BaseCommand } from "../utils/base-command.ts";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";
import type { CommandDefinition, ConfigItem, ItemFormatter, ItemLoader } from "../types/command.ts";
import type { ParsedArgs } from "../utils/argument-parser.ts";
import type { ConfigManager } from "../utils/config-manager.ts";

/**
 * Methodology item extending ConfigItem
 */
interface Methodology extends ConfigItem {
  bestFor: string;
  principles: string[];
  teamSize: string;
}

/**
 * Available methodologies with their definitions
 */
const AVAILABLE_METHODOLOGIES: Record<string, Methodology> = {
  "shape-up": {
    id: "shape-up",
    name: "Shape Up",
    description: "6-week cycles with appetite-based planning and fixed time/variable scope",
    category: "iterative",
    tags: ["solo", "small-team", "feature-focused"],
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
    id: "scrum",
    name: "Scrum",
    description: "Sprint-based iterative development with ceremonies and roles",
    category: "agile",
    tags: ["team", "structured", "predictable"],
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
    id: "kanban",
    name: "Kanban",
    description: "Continuous flow with WIP limits and visual management",
    category: "flow",
    tags: ["continuous", "visual", "flexible"],
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
    id: "lean",
    name: "Lean Startup",
    description: "Build-measure-learn cycles with validated learning",
    category: "startup",
    tags: ["experimental", "learning", "mvp"],
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
    id: "scrumban",
    name: "Scrumban",
    description: "Hybrid approach combining Scrum structure with Kanban flow",
    category: "hybrid",
    tags: ["transitional", "flexible", "mixed"],
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
    id: "xp",
    name: "Extreme Programming (XP)",
    description: "Engineering-focused methodology with technical practices",
    category: "technical",
    tags: ["engineering", "quality", "practices"],
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
 * Methodology loader implementation
 */
class MethodologyLoader implements ItemLoader<Methodology> {
  loadAll(): Promise<Methodology[]> {
    return Object.values(AVAILABLE_METHODOLOGIES);
  }

  loadById(id: string): Promise<Methodology | null> {
    return AVAILABLE_METHODOLOGIES[id] || null;
  }

  search(query: string): Promise<Methodology[]> {
    const lowerQuery = query.toLowerCase();
    const results: Methodology[] = [];

    for (const methodology of Object.values(AVAILABLE_METHODOLOGIES)) {
      if (
        methodology.id.toLowerCase().includes(lowerQuery) ||
        methodology.name.toLowerCase().includes(lowerQuery) ||
        methodology.description.toLowerCase().includes(lowerQuery) ||
        methodology.category?.toLowerCase().includes(lowerQuery) ||
        methodology.bestFor.toLowerCase().includes(lowerQuery) ||
        methodology.principles.some((p) => p.toLowerCase().includes(lowerQuery)) ||
        methodology.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
      ) {
        results.push(methodology);
      }
    }

    return results;
  }

  getCategories(): Promise<string[]> {
    const categories = new Set(Object.values(AVAILABLE_METHODOLOGIES).map((m) => m.category || "uncategorized"));
    return Array.from(categories).sort();
  }
}

/**
 * Methodology formatter implementation
 */
class MethodologyFormatter implements ItemFormatter<Methodology> {
  formatList(methodologies: Methodology[]): string {
    const content = [`# 🪴 Aichaku Methodologies - Development Approaches\n`];
    content.push(
      `Select from ${methodologies.length} proven methodologies to guide your workflow.\n`,
    );

    let index = 1;
    for (const methodology of methodologies) {
      content.push(`## ${index}. ${methodology.name} (\`${methodology.id}\`)\n`);
      content.push(`${methodology.description}\n`);
      content.push(`- **Best for:** ${methodology.bestFor}`);
      content.push(`- **Team size:** ${methodology.teamSize}`);
      content.push(`- **Key principles:** ${methodology.principles.slice(0, 3).join(", ")}...\n`);
      index++;
    }

    content.push(`## 💡 Usage Tips\n`);
    content.push(`- Use \`aichaku methodologies --add shape-up\` for focused context`);
    content.push(`- Multiple methodologies can be active simultaneously`);
    content.push(`- Each active methodology adds ~1500 tokens to agent context`);
    content.push(`- Run \`aichaku methodologies --show\` to see current selection`);

    return content.join("\n");
  }

  formatDetails(methodology: Methodology, _verbose?: boolean): string {
    const content = [`# 📚 ${methodology.name}\n`];
    content.push(`**ID:** \`${methodology.id}\``);
    content.push(`**Category:** ${methodology.category}\n`);

    content.push(`## Description\n`);
    content.push(`${methodology.description}\n`);

    content.push(`**Best for:** ${methodology.bestFor}`);
    content.push(`**Team size:** ${methodology.teamSize}\n`);

    content.push(`## Key Principles\n`);
    methodology.principles.forEach((principle) => {
      content.push(`- ${principle}`);
    });

    content.push(`\n## Tags\n`);
    content.push(`${methodology.tags?.join(", ") || "None"}`);

    return content.join("\n");
  }

  formatCurrent(selected: string[]): string {
    const content = [`# 🪴 Aichaku: Project Methodology Configuration\n`];

    if (selected.length === 0) {
      content.push(`No methodologies currently selected for this project.\n`);
      content.push(`## 💡 To Get Started\n`);
      content.push(`- Run \`aichaku methodologies --list\` to see available methodologies`);
      content.push(`- Run \`aichaku methodologies --add <id>\` to add a methodology`);
      content.push(`- Run \`aichaku methodologies --set shape-up\` for solo development\n`);
      content.push(`**Example:** \`aichaku methodologies --add shape-up\``);
    } else {
      content.push(`**Active methodologies:** ${selected.join(", ")}\n`);

      let index = 1;
      for (const methodologyId of selected) {
        const methodology = AVAILABLE_METHODOLOGIES[methodologyId];
        if (methodology) {
          content.push(`## ${index}. ${methodology.name} (\`${methodologyId}\`)\n`);
          content.push(`${methodology.description}\n`);
          content.push(`- **Best for:** ${methodology.bestFor}`);
          content.push(`- **Team size:** ${methodology.teamSize}`);
          content.push(`- **Key principles:**`);
          methodology.principles.forEach((principle) => {
            content.push(`  - ${principle}`);
          });
          content.push(``);
          index++;
        } else {
          content.push(`## ⚠️ ${methodologyId} (Unknown Methodology)\n`);
          content.push(`Warning: Methodology not found in available methodologies\n`);
        }
      }

      content.push(`## 💡 What You Can Do\n`);
      content.push(`- Run \`aichaku integrate\` to update CLAUDE.md with methodologies`);
      content.push(`- Run \`aichaku methodologies --add <id>\` to add additional methodologies`);
      content.push(`- Run \`aichaku methodologies --set <id>\` to change to a different methodology`);
      content.push(`- Run \`aichaku methodologies --search <term>\` to find specific methodologies`);
    }

    return content.join("\n");
  }
}

/**
 * Methodologies command implementation using shared infrastructure
 */
class MethodologiesCommand extends BaseCommand<Methodology> {
  constructor() {
    const definition: CommandDefinition<Methodology> = {
      name: "methodologies",
      configKey: "methodologies",
      loader: new MethodologyLoader(),
      formatter: new MethodologyFormatter(),
      supportedOperations: {
        list: true,
        show: true,
        showDetails: true,
        add: true,
        remove: true,
        search: true,
        current: true,
        categories: true,
      },
      helpText: {
        description: "Choose Your Development Approach",
        examples: [
          "# List all available methodologies",
          "aichaku methodologies --list",
          "",
          "# Search for agile methodologies",
          "aichaku methodologies --search agile",
          "",
          "# Set primary methodology for solo development",
          "aichaku methodologies --set shape-up",
          "",
          "# See what's currently active",
          "aichaku methodologies --show",
          "",
          "# Add additional methodology",
          "aichaku methodologies --add scrum",
          "",
          "# Remove methodology",
          "aichaku methodologies --remove scrum",
        ],
      },
    };

    super(definition);
  }

  /**
   * Handle custom operations specific to methodologies
   */
  protected override async handleCustomOperation(args: ParsedArgs): Promise<boolean> {
    // Handle --set operation (replace current methodologies)
    if (args.set) {
      await this.handleSet(args);
      return true;
    }

    // Handle --reset operation
    if (args.reset) {
      await this.handleReset(args);
      return true;
    }

    return false; // Not handled
  }

  /**
   * Handle set operation (replace current methodologies)
   */
  private async handleSet(args: ParsedArgs): Promise<void> {
    if (!args.set) return;

    const ids = this.parseListArgument(args.set);
    const validatedProjectPath = args.projectPath ? args.projectPath : Deno.cwd();

    Brand.log("Setting project methodology...\n");

    // Validate all methodologies exist
    const validMethodologies: Methodology[] = [];
    for (const id of ids) {
      const methodology = await this.definition.loader.loadById(id);
      if (!methodology) {
        Brand.error(`Unknown methodology: ${id}`);
        Brand.tip(`Use 'aichaku methodologies --list' to see available methodologies`);
        return;
      }
      validMethodologies.push(methodology);
    }

    if (!args.dryRun) {
      // Use config manager to set methodologies (replaces current)
      const { createProjectConfigManager } = await import("../utils/config-manager.ts");
      const { resolveProjectPath } = await import("../utils/project-paths.ts");

      const configManager = createProjectConfigManager(resolveProjectPath(validatedProjectPath));

      try {
        await configManager.load();
      } catch {
        // Create configuration if it doesn't exist
        await configManager.update({});
        await configManager.load();
      }

      await configManager.setMethodologies(ids);
      Brand.success(`Set methodologies: ${ids.join(", ")}`);
      Brand.info("");

      // Show details for each methodology
      for (const methodology of validMethodologies) {
        Brand.info(`   • ${methodology.name}: ${methodology.description}`);
      }

      this.showNextSteps("add");
    } else {
      Brand.info(`[Dry run] Would set methodologies: ${ids.join(", ")}`);
    }
  }

  /**
   * Handle reset operation
   */
  private async handleReset(args: ParsedArgs): Promise<void> {
    const validatedProjectPath = args.projectPath ? args.projectPath : Deno.cwd();
    const defaultMethodology = "shape-up"; // Good for solo development

    Brand.log("Resetting to default methodology...\n");

    if (!args.dryRun) {
      const { createProjectConfigManager } = await import("../utils/config-manager.ts");
      const { resolveProjectPath } = await import("../utils/project-paths.ts");

      const configManager = createProjectConfigManager(resolveProjectPath(validatedProjectPath));
      await configManager.setMethodologies([defaultMethodology]);

      Brand.success(`Reset to default methodology: ${defaultMethodology}`);

      const methodology = AVAILABLE_METHODOLOGIES[defaultMethodology];
      Brand.info(`   ${methodology.name}: ${methodology.description}`);
      Brand.info(`   Best for: ${methodology.bestFor}`);

      this.showNextSteps("add");
    } else {
      Brand.info(`[Dry run] Would reset to default methodology: ${defaultMethodology}`);
    }
  }

  /**
   * Add methodologies to configuration
   */
  protected override async addItemsToConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    const current = configManager.getMethodologies();
    const newMethodologies = [...new Set([...current, ...ids])];
    await configManager.setMethodologies(newMethodologies);
  }

  /**
   * Remove methodologies from configuration
   */
  protected override async removeItemsFromConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    const current = configManager.getMethodologies();
    const remaining = current.filter((m: string) => !ids.includes(m));
    await configManager.setMethodologies(remaining);
  }

  /**
   * Get selected methodologies from configuration
   */
  protected override getSelectedItems(configManager: ConfigManager): string[] {
    return configManager.getMethodologies();
  }
}

/**
 * Create and export the methodologies command instance
 */
export const methodologiesCommand = new MethodologiesCommand();

/**
 * Main entry point for methodologies command (for backwards compatibility)
 */
export async function methodologies(options: Record<string, unknown> = {}): Promise<void> {
  // Convert old-style options to ParsedArgs format
  const parsedArgs: ParsedArgs = {
    list: options.list,
    show: options.show,
    add: Array.isArray(options.add) ? options.add.join(",") : options.add,
    remove: Array.isArray(options.remove) ? options.remove.join(",") : options.remove,
    search: options.search,
    current: false, // Not used by methodologies
    projectPath: options.projectPath,
    dryRun: options.dryRun,
    verbose: options.verbose,
    categories: false, // Not used by methodologies
    help: false,
    createCustom: undefined,
    deleteCustom: undefined,
    editCustom: undefined,
    copyCustom: undefined,
    set: Array.isArray(options.set) ? options.set.join(",") : options.set,
    reset: options.reset,
    clear: false, // Not used by methodologies
    compatibility: undefined,
    category: undefined,
    addInteractive: false,
    remaining: [],
  };

  await methodologiesCommand.execute(parsedArgs);
}
