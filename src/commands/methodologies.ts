/**
 * Refactored Methodologies command using shared infrastructure
 * Demonstrates the DRY principle in action
 *
 * @module
 */

import { BaseCommand } from "../utils/base-command.ts";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";
import type { CommandDefinition } from "../types/command.ts";
import type { ParsedArgs } from "../utils/argument-parser.ts";
import type { ConfigManager } from "../utils/config-manager.ts";
import { type Methodology, MethodologyLoader } from "../utils/methodology-loader.ts";
import { BaseFormatter } from "../formatters/base-formatter.ts";
import { bold } from "jsr:@std/fmt@1/colors";

// Hardcoded methodologies replaced with dynamic loader

/**
 * Methodology formatter implementation
 */
class MethodologyFormatter extends BaseFormatter<Methodology> {
  private loader: MethodologyLoader;

  constructor(loader: MethodologyLoader) {
    super();
    this.loader = loader;
  }
  formatList(methodologies: Methodology[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Available Methodologies"));
    lines.push(this.addEmptyLine());
    lines.push(`Select from ${methodologies.length} proven methodologies to guide your workflow.`);
    lines.push(this.addEmptyLine());

    let index = 1;
    for (const methodology of methodologies) {
      lines.push(this.formatSection(`${index}. ${methodology.name} (\`${methodology.id}\`)`));
      lines.push(this.addEmptyLine());
      lines.push(methodology.description);
      lines.push(this.addEmptyLine());
      lines.push(this.formatItem(`Best for: ${methodology.bestFor}`));
      lines.push(this.formatItem(`Team size: ${methodology.teamSize}`));
      lines.push(this.formatItem(`Key principles: ${methodology.principles.slice(0, 3).join(", ")}...`));
      lines.push(this.addEmptyLine());
      index++;
    }

    lines.push(this.formatSection("💡 Usage Tips"));
    lines.push(this.formatItem(`Use \`aichaku methodologies --add shape-up\` for focused context`));
    lines.push(this.formatItem(`Multiple methodologies can be active simultaneously`));
    lines.push(this.formatItem(`Each active methodology adds ~1500 tokens to agent context`));
    lines.push(this.formatItem(`Run \`aichaku methodologies --show\` to see current selection`));

    return this.buildOutput(lines);
  }

  formatDetails(methodology: Methodology, _verbose?: boolean): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Methodology", methodology.name));
    lines.push(this.addEmptyLine());

    lines.push(`${bold("ID:")} \`${methodology.id}\``);
    lines.push(`${bold("Category:")} ${methodology.category || "general"}`);
    lines.push(this.addEmptyLine());

    lines.push(this.formatSection("Description"));
    lines.push(methodology.description);
    lines.push(this.addEmptyLine());

    lines.push(`${bold("Best for:")} ${methodology.bestFor}`);
    lines.push(`${bold("Team size:")} ${methodology.teamSize}`);
    lines.push(this.addEmptyLine());

    lines.push(this.formatSection("Key Principles"));
    methodology.principles.forEach((principle) => {
      lines.push(this.formatItem(principle));
    });
    lines.push(this.addEmptyLine());

    if (methodology.tags && methodology.tags.length > 0) {
      lines.push(this.formatSection("Tags"));
      lines.push(methodology.tags.join(", "));
    }

    return this.buildOutput(lines);
  }

  formatCurrent(selected: string[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Current Methodology Selection"));
    lines.push(this.addEmptyLine());

    if (selected.length === 0) {
      lines.push("ℹ️  No methodologies currently selected for this project.");
      lines.push(this.addEmptyLine());
      lines.push(this.formatSection("💡 To Get Started"));
      lines.push(this.formatItem(`Run \`aichaku methodologies --list\` to see available methodologies`));
      lines.push(this.formatItem(`Run \`aichaku methodologies --add <id>\` to add a methodology`));
      lines.push(this.formatItem(`Run \`aichaku methodologies --set shape-up\` for solo development`));
      lines.push(this.addEmptyLine());
      lines.push(`${bold("Example:")} \`aichaku methodologies --add shape-up\``);
    } else {
      lines.push(`${bold("Active methodologies:")} ${selected.join(", ")}`);
      lines.push(this.addEmptyLine());
      lines.push(this.formatSection("💡 What You Can Do"));
      lines.push(this.formatItem(`Run \`aichaku integrate\` to update CLAUDE.md with methodologies`));
      lines.push(this.formatItem(`Run \`aichaku methodologies --add <id>\` to add additional methodologies`));
      lines.push(this.formatItem(`Run \`aichaku methodologies --set <id>\` to change to a different methodology`));
      lines.push(this.formatItem(`Run \`aichaku methodologies --search <term>\` to find specific methodologies`));
    }

    return this.buildOutput(lines);
  }

  /**
   * Format current methodologies with details (async version)
   */
  async formatCurrentWithDetails(selected: string[]): Promise<string> {
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
        const methodology = await this.loader.loadById(methodologyId);
        if (methodology) {
          content.push(`## ${index}. ${methodology.name} (\`${methodologyId}\`)\n`);
          content.push(`${methodology.description}\n`);
          content.push(`- **Best for:** ${methodology.bestFor}`);
          content.push(`- **Team size:** ${methodology.teamSize}`);
          content.push(`- **Key principles:**`);
          methodology.principles.forEach((principle: string) => {
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

  // Override only if we need custom formatting, otherwise inherit from BaseFormatter
}

/**
 * Methodologies command implementation using shared infrastructure
 */
class MethodologiesCommand extends BaseCommand<Methodology> {
  constructor() {
    const loader = new MethodologyLoader();
    const definition: CommandDefinition<Methodology> = {
      name: "methodologies",
      configKey: "methodologies",
      loader: loader,
      formatter: new MethodologyFormatter(loader),
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

      const methodology = await this.definition.loader.loadById(defaultMethodology);
      if (methodology) {
        Brand.info(`   ${methodology.name}: ${methodology.description}`);
        Brand.info(`   Best for: ${methodology.bestFor}`);
      }

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
    list: options.list as boolean | undefined,
    show: options.show as boolean | string | undefined,
    add: Array.isArray(options.add) ? options.add.join(",") : options.add as string | undefined,
    remove: Array.isArray(options.remove) ? options.remove.join(",") : options.remove as string | undefined,
    search: options.search as string | undefined,
    current: false, // Not used by methodologies
    projectPath: options.projectPath as string | undefined,
    dryRun: options.dryRun as boolean | undefined,
    verbose: options.verbose as boolean | undefined,
    categories: false, // Not used by methodologies
    help: false,
    createCustom: undefined,
    deleteCustom: undefined,
    editCustom: undefined,
    copyCustom: undefined,
    set: Array.isArray(options.set) ? options.set.join(",") : options.set as string | undefined,
    reset: options.reset as boolean | undefined,
    clear: false, // Not used by methodologies
    compatibility: undefined,
    category: undefined,
    addInteractive: false,
    remaining: [],
  };

  await methodologiesCommand.execute(parsedArgs);
}
