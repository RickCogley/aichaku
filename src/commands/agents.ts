import { BaseCommand } from "../utils/base-command.ts";
import { AgentLoader } from "../utils/agent-loader.ts";
import { AgentFormatter } from "../formatters/agent-formatter.ts";
import { Agent } from "../types/agent.ts";
import { CommandOptions } from "../types/command.ts";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";

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

  protected override async handleCustomOperation(options: CommandOptions): Promise<boolean> {
    // All standard operations are handled by BaseCommand
    // Return false to let BaseCommand handle standard operations
    return false;
  }

  protected override async handleAdd(items: string[]): Promise<boolean> {
    // Validate agent names before adding
    const availableAgents = await this.definition.loader.list();
    const availableNames = availableAgents.map((a) => a.name);

    const invalidAgents = items.filter((item) => !availableNames.includes(item));
    if (invalidAgents.length > 0) {
      Brand.error(`Unknown agents: ${invalidAgents.join(", ")}`);
      Brand.tip("Use --list to see available agents");
      return false;
    }

    // Let BaseCommand handle the actual addition
    return super.handleAdd(items);
  }

  protected override async handleRemove(items: string[]): Promise<boolean> {
    // Prevent removal of core agents
    const coreAgents = ["orchestrator"];
    const protectedAgents = items.filter((item) => coreAgents.includes(item));

    if (protectedAgents.length > 0) {
      Brand.error(`Cannot remove core agents: ${protectedAgents.join(", ")}`);
      return false;
    }

    // Let BaseCommand handle the actual removal
    return super.handleRemove(items);
  }

  // Implement abstract methods from BaseCommand
  protected async addItemsToConfig(configManager: any, ids: string[]): Promise<void> {
    await configManager.addAgents(ids);
  }

  protected async removeItemsFromConfig(configManager: any, ids: string[]): Promise<void> {
    await configManager.removeAgents(ids);
  }

  protected getSelectedItems(configManager: any): string[] {
    return configManager.getSelectedAgents();
  }
}

/**
 * Main entry point for agents command
 */
export async function main(options: CommandOptions): Promise<number> {
  const command = new AgentsCommand();
  const success = await command.execute(options);
  return success ? 0 : 1;
}
