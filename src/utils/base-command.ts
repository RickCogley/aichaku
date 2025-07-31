/**
 * Base command implementation for shared CLI operations
 * Implements the DRY principle by extracting common command patterns
 *
 * @module
 */

import { resolveProjectPath } from "./project-paths.ts";
import { createProjectConfigManager } from "./config-manager.ts";
import { printFormatted } from "./terminal-formatter.ts";
import { AichakuBrand as Brand } from "./branded-messages.ts";
import type { CommandDefinition, ConfigItem } from "../types/command.ts";
import type { ParsedArgs } from "./argument-parser.ts";
import type { ConfigManager } from "./config-manager.ts";

/**
 * Abstract base class for all Aichaku commands
 * Provides common operations: list, show, add, remove, search
 */
export abstract class BaseCommand<T extends ConfigItem> {
  protected definition: CommandDefinition<T>;

  constructor(definition: CommandDefinition<T>) {
    this.definition = definition;
  }

  /**
   * Execute the command with parsed arguments
   */
  async execute(args: ParsedArgs): Promise<void> {
    try {
      // Route to appropriate operation
      if (args.help) {
        this.showHelp();
        return;
      }

      if (args.list) {
        await this.handleList(args);
        return;
      }

      if (args.show !== undefined && args.show !== false) {
        await this.handleShow(args);
        return;
      }

      if (args.add) {
        await this.handleAdd(args);
        return;
      }

      if (args.remove) {
        await this.handleRemove(args);
        return;
      }

      if (args.search) {
        await this.handleSearch(args);
        return;
      }

      if (args.current) {
        await this.handleCurrent(args);
        return;
      }

      if (args.createCustom) {
        this.handleCreateCustom(args);
        return;
      }

      // Additional operations can be handled by subclasses
      if (await this.handleCustomOperation(args)) {
        return;
      }

      // Default: show help
      this.showHelp();
    } catch (error) {
      // InfoSec: Generic error messages to avoid information disclosure
      Brand.error(`Failed to process ${this.definition.name} command`);
      if (error instanceof Error && error.message.includes("directory traversal")) {
        Brand.error("Security violation detected");
      }
      throw error;
    }
  }

  /**
   * Handle list operation
   */
  protected async handleList(args: ParsedArgs): Promise<void> {
    if (!this.definition.supportedOperations?.list) {
      throw new Error(`List operation not supported for ${this.definition.name}`);
    }

    const items = await Promise.resolve(this.definition.loader.loadAll());

    // Filter by category if specified
    const filteredItems = args.category ? items.filter((item) => item.category === args.category) : items;

    const content = this.definition.formatter.formatList(filteredItems);
    printFormatted(content);
  }

  /**
   * Handle show operation
   */
  protected async handleShow(args: ParsedArgs): Promise<void> {
    if (!this.definition.supportedOperations?.show) {
      throw new Error(`Show operation not supported for ${this.definition.name}`);
    }

    if (typeof args.show === "string") {
      // Show specific item
      if (!this.definition.supportedOperations?.showDetails) {
        throw new Error(`Show details operation not supported for ${this.definition.name}`);
      }

      const item = await Promise.resolve(this.definition.loader.loadById(args.show));
      if (!item) {
        Brand.error(`${this.definition.name.slice(0, -1)} '${args.show}' not found`);
        Brand.tip(`Use 'aichaku ${this.definition.name} --list' to see available items`);
        return;
      }

      const content = this.definition.formatter.formatDetails(item, args.verbose);
      printFormatted(content);
    } else {
      // Show current selection
      await this.handleCurrent(args);
    }
  }

  /**
   * Handle add operation
   */
  protected async handleAdd(args: ParsedArgs): Promise<void> {
    if (!this.definition.supportedOperations?.add || !args.add) {
      throw new Error(`Add operation not supported for ${this.definition.name}`);
    }

    const ids = this.parseListArgument(args.add);
    const validatedProjectPath = args.projectPath ? resolveProjectPath(args.projectPath) : Deno.cwd();

    Brand.log(`Adding ${this.definition.name} to project...\n`);

    // Validate all items exist
    const validItems: T[] = [];
    for (const id of ids) {
      const item = await Promise.resolve(this.definition.loader.loadById(id));
      if (!item) {
        Brand.error(`Unknown ${this.definition.name.slice(0, -1)}: ${id}`);
        Brand.tip(`Use 'aichaku ${this.definition.name} --list' to see available items`);
        return;
      }
      validItems.push(item);
    }

    try {
      const configManager = createProjectConfigManager(validatedProjectPath);

      // Load or create configuration
      try {
        await configManager.load();
      } catch {
        await configManager.update({});
        await configManager.load();
      }

      if (!args.dryRun) {
        // Add items using the appropriate config manager method
        await this.addItemsToConfig(configManager, ids);

        Brand.success(`Added ${this.definition.name}: ${ids.join(", ")}`);

        // Show what was added
        Brand.info(`\nAdded ${this.definition.name}:`);
        for (const item of validItems) {
          Brand.info(`   • ${item.name}: ${item.description}`);
        }

        this.showNextSteps("add");
      } else {
        Brand.info(`[Dry run] Would add ${this.definition.name}: ${ids.join(", ")}`);
      }
    } catch (error) {
      Brand.error(
        `Failed to add ${this.definition.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Handle remove operation
   */
  protected async handleRemove(args: ParsedArgs): Promise<void> {
    if (!this.definition.supportedOperations?.remove || !args.remove) {
      throw new Error(`Remove operation not supported for ${this.definition.name}`);
    }

    const ids = this.parseListArgument(args.remove);
    const validatedProjectPath = args.projectPath ? resolveProjectPath(args.projectPath) : Deno.cwd();

    Brand.log(`Removing ${this.definition.name} from project...\n`);

    try {
      const configManager = createProjectConfigManager(validatedProjectPath);
      await configManager.load();

      if (!args.dryRun) {
        // Remove items using the appropriate config manager method
        await this.removeItemsFromConfig(configManager, ids);

        Brand.success(`Removed ${this.definition.name}: ${ids.join(", ")}`);
        this.showNextSteps("remove");
      } else {
        Brand.info(`[Dry run] Would remove ${this.definition.name}: ${ids.join(", ")}`);
      }
    } catch (error) {
      Brand.error(
        `Failed to remove ${this.definition.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Handle search operation
   */
  protected async handleSearch(args: ParsedArgs): Promise<void> {
    if (!this.definition.supportedOperations?.search || !args.search) {
      throw new Error(`Search operation not supported for ${this.definition.name}`);
    }

    const results = await Promise.resolve(this.definition.loader.search(args.search));

    if (results.length === 0) {
      Brand.log(`No ${this.definition.name} found matching "${args.search}"`);
      return;
    }

    Brand.log(`${this.definition.name} matching "${args.search}"\n`);

    for (const item of results) {
      Brand.info(`• ${item.id}: ${item.name}`);
      Brand.info(`  ${item.description}`);
      if (item.category) {
        Brand.info(`  Category: ${item.category}`);
      }
      Brand.info("");
    }
  }

  /**
   * Handle current selection display
   */
  protected async handleCurrent(args: ParsedArgs): Promise<void> {
    if (!this.definition.supportedOperations?.current) {
      throw new Error(`Current operation not supported for ${this.definition.name}`);
    }

    const validatedProjectPath = args.projectPath ? resolveProjectPath(args.projectPath) : Deno.cwd();

    try {
      const configManager = createProjectConfigManager(validatedProjectPath);
      await configManager.load();

      const selected = this.getSelectedItems(configManager);
      const content = this.definition.formatter.formatCurrent(selected);
      printFormatted(content);
    } catch (_error) {
      printFormatted(`# 🪴 Aichaku: No Configuration Found

This project hasn't been initialized with Aichaku yet.

Run \`aichaku init\` to initialize project with ${this.definition.name} selection.`);
    }
  }

  /**
   * Handle create custom operation (optional, override in subclasses)
   */
  protected handleCreateCustom(_args: ParsedArgs): void {
    Brand.log(`Custom ${this.definition.name} creation not yet supported`);
  }

  /**
   * Handle custom operations specific to each command (override in subclasses)
   */
  protected handleCustomOperation(_args: ParsedArgs): boolean | Promise<boolean> {
    return false; // Not handled
  }

  /**
   * Show help for this command
   */
  protected showHelp(): void {
    const helpContent = `
# 🪴 Aichaku ${this.definition.name.charAt(0).toUpperCase() + this.definition.name.slice(1)} - ${
      this.definition.helpText?.description || "Command Help"
    }

## Usage
\`aichaku ${this.definition.name} [options]\`

## Options
${this.generateHelpOptions()}

## Examples
${this.definition.helpText?.examples.join("\n") || "No examples available"}
`;

    printFormatted(helpContent);
  }

  /**
   * Generate help options based on supported operations
   */
  protected generateHelpOptions(): string {
    const options: string[] = [
      "- **--help** - Show this help message",
    ];

    if (this.definition.supportedOperations?.list) {
      options.push("- **--list** - List all available items (shows priority order)");
    }

    if (this.definition.supportedOperations?.show) {
      options.push("- **--show** - Show current selection");
    }

    if (this.definition.supportedOperations?.showDetails) {
      options.push("- **--show <id>** - Show details about specific item");
    }

    if (this.definition.supportedOperations?.add) {
      options.push("- **--add <ids>** - Add items to project (order determines priority)");
    }

    if (this.definition.supportedOperations?.remove) {
      options.push("- **--remove <ids>** - Remove items from project");
    }

    if (this.definition.supportedOperations?.search) {
      options.push("- **--search <query>** - Search items by keyword");
    }

    if (this.definition.supportedOperations?.current) {
      options.push("- **--current** - Show currently selected items");
    }

    if (this.definition.supportedOperations?.categories) {
      options.push("- **--categories** - List items grouped by category");
    }

    options.push("- **--dry-run** - Preview changes without applying");
    options.push("- **--verbose** - Show detailed information");

    return options.join("\n");
  }

  /**
   * Show next steps after operations
   */
  protected showNextSteps(operation: "add" | "remove"): void {
    Brand.info(`\n💡 What you can do next:`);
    Brand.info(`   • Run 'aichaku integrate' to update CLAUDE.md`);
    Brand.info(`   • Run 'aichaku ${this.definition.name} --show' to review selection`);

    if (operation === "add") {
      Brand.info(`   • Run 'aichaku ${this.definition.name} --add <id>' to add more items`);
    } else {
      Brand.info(`   • Run 'aichaku ${this.definition.name} --remove <id>' to remove more items`);
    }
  }

  /**
   * Parse comma-separated argument safely
   */
  protected parseListArgument(value: string): string[] {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  // Abstract methods that subclasses must implement
  protected abstract addItemsToConfig(configManager: ConfigManager, ids: string[]): Promise<void>;
  protected abstract removeItemsFromConfig(configManager: ConfigManager, ids: string[]): Promise<void>;
  protected abstract getSelectedItems(configManager: ConfigManager): string[];
}
