/**
 * Principles management command for development philosophies
 * @module
 */

import { BaseCommand } from "../utils/base-command.ts";
import { PrincipleLoader } from "../utils/principle-loader.ts";
import { PrincipleFormatter } from "../formatters/principle-formatter.ts";
import { Principle } from "../types/principle.ts";
import { CommandOptions } from "../types/command.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";
import type { ConfigManager } from "../utils/config-manager.ts";

/**
 * Command class for managing development principles
 *
 * Provides operations to select and apply development principles like DRY, KISS,
 * YAGNI, and SOLID. Principles guide thinking without being prescriptive.
 *
 * @public
 */
export class PrinciplesCommand extends BaseCommand<Principle> {
  constructor() {
    super({
      name: "principles",
      configKey: "principles",
      loader: new PrincipleLoader(),
      formatter: new PrincipleFormatter(),
      supportedOperations: {
        list: true,
        show: true,
        showDetails: true, // Principles supports --show <id>
        add: true,
        remove: true,
        search: true,
        current: true,
        categories: true,
        createCustom: false,
      },
      helpText: {
        description: "Manage software engineering principles",
        examples: [
          "aichaku principles --list",
          "aichaku principles --show",
          "aichaku principles --show dry",
          "aichaku principles --add dry,solid",
          "aichaku principles --remove yagni",
          "aichaku principles --search design",
          "aichaku principles --categories",
        ],
      },
    });
  }

  protected override async handleCustomOperation(options: CommandOptions): Promise<boolean> {
    // Handle command-specific operations
    if (options.categories) {
      const categories = await (this.definition.loader as PrincipleLoader).getCategories();
      printFormatted(this.definition.formatter.formatCategories!(categories));
      return true;
    }

    // No custom operations for principles yet
    return false;
  }

  protected async addItemsToConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    await configManager.setPrinciples(ids);
  }

  protected async removeItemsFromConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    const current = configManager.getPrinciples() || [];
    const updated = current.filter((id: string) => !ids.includes(id));
    await configManager.setPrinciples(updated);
  }

  protected getSelectedItems(configManager: ConfigManager): string[] {
    return configManager.getPrinciples() || [];
  }
}

// Export function for backward compatibility
export async function principles(options: CommandOptions): Promise<void> {
  const command = new PrinciplesCommand();
  // Convert CommandOptions to ParsedArgs
  const parsedArgs = {
    ...options,
    remaining: [],
  };
  await command.execute(parsedArgs);
}
