/**
 * Standards management command for development standards and methodologies
 * @module
 */

import { BaseCommand } from "../utils/base-command.ts";
import { StandardLoader } from "../utils/standard-loader.ts";
import { StandardFormatter } from "../formatters/standard-formatter.ts";
import { Standard } from "../types/standard.ts";
import { CommandOptions } from "../types/command.ts";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";
import type { ConfigManager } from "../utils/config-manager.ts";

/**
 * Command class for managing development standards
 *
 * Provides operations to list, add, remove, and search development standards
 * such as OWASP, TDD, Clean Architecture, and Google Style guides.
 *
 * @public
 */
export class StandardsCommand extends BaseCommand<Standard> {
  constructor() {
    super({
      name: "standards",
      configKey: "standards",
      loader: new StandardLoader(),
      formatter: new StandardFormatter(),
      supportedOperations: {
        list: true,
        show: true,
        showDetails: false, // Standards doesn't support --show <id> yet
        add: true,
        remove: true,
        search: true,
        current: true,
        categories: true,
        createCustom: true,
      },
      helpText: {
        description: "Manage development standards and methodologies",
        examples: [
          "aichaku standards --list",
          "aichaku standards --show",
          "aichaku standards --add tdd,google-style",
          "aichaku standards --remove solid",
          "aichaku standards --search security",
          "aichaku standards --categories",
        ],
      },
    });
  }

  protected override async handleCustomOperation(options: CommandOptions): Promise<boolean> {
    // Handle command-specific operations
    if (options.createCustom) {
      Brand.log("Create custom standard feature not yet implemented");
      return true;
    }

    if (options.categories) {
      const categories = await (this.definition.loader as StandardLoader).getCategories();
      printFormatted(this.definition.formatter.formatCategories!(categories));
      return true;
    }

    return false;
  }

  protected async addItemsToConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    // Add standards one by one since config manager uses singular methods
    for (const id of ids) {
      await configManager.addStandard(id);
    }
  }

  protected async removeItemsFromConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    // Remove standards one by one since config manager uses singular methods
    for (const id of ids) {
      await configManager.removeStandard(id);
    }
  }

  protected getSelectedItems(configManager: ConfigManager): string[] {
    return configManager.getStandards() || [];
  }
}

// Export function for backward compatibility
export async function standards(options: CommandOptions): Promise<void> {
  const command = new StandardsCommand();
  // Convert CommandOptions to ParsedArgs
  const parsedArgs = {
    ...options,
    remaining: [],
  };
  await command.execute(parsedArgs);
}
