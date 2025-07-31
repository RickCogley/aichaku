import { BaseCommand } from "../utils/base-command.ts";
import { AgentLoader } from "../utils/agent-loader.ts";
import { AgentFormatter } from "../formatters/agent-formatter.ts";
import { Agent } from "../types/agent.ts";
import { CommandOptions } from "../types/command.ts";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";
import type { ConfigManager } from "../utils/config-manager.ts";
import type { ParsedArgs } from "../utils/argument-parser.ts";

export class AgentsCommand extends BaseCommand<Agent> {
  constructor() {
    super({
      name: "agents",
      configKey: "agents",
      loader: new AgentLoader(),
      formatter: new AgentFormatter(),
      supportedOperations: {
        list: true,
        show: true,
        showDetails: true, // Agents support --show <name>
        add: true,
        remove: true,
        search: true,
        current: true,
        categories: false, // Agents use type (default/optional) not categories
        createCustom: false, // Not yet implemented
      },
      helpText: {
        description: "Manage aichaku agents for specialized assistance",
        examples: [
          "aichaku agents --list",
          "aichaku agents --show",
          "aichaku agents --show test-expert",
          "aichaku agents --add typescript-expert,react-expert",
          "aichaku agents --remove golang-expert",
          "aichaku agents --search security",
        ],
      },
    });
  }

  protected override handleCustomOperation(_args: ParsedArgs): boolean {
    // All standard operations are handled by BaseCommand
    // Return false to let BaseCommand handle standard operations
    return false;
  }

  // Implement abstract methods from BaseCommand
  protected async addItemsToConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    await configManager.addAgents(ids);
  }

  protected async removeItemsFromConfig(configManager: ConfigManager, ids: string[]): Promise<void> {
    await configManager.removeAgents(ids);
  }

  protected getSelectedItems(configManager: ConfigManager): string[] {
    return configManager.getSelectedAgents();
  }
}

/**
 * Export function for backward compatibility
 */
export async function agents(options: CommandOptions): Promise<void> {
  const command = new AgentsCommand();
  // Convert CommandOptions to ParsedArgs
  const parsedArgs: ParsedArgs = {
    ...options,
    remaining: [],
  };
  await command.execute(parsedArgs);
}

/**
 * Main entry point for agents command
 */
export async function main(options: CommandOptions): Promise<number> {
  try {
    await agents(options);
    return 0;
  } catch (error) {
    Brand.error(`Failed to execute agents command: ${error instanceof Error ? error.message : "Unknown error"}`);
    return 1;
  }
}
