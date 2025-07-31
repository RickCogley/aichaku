/**
 * Command executor for shared CLI infrastructure
 * Routes parsed arguments to appropriate command implementations
 *
 * @module
 */

import type { CommandOptions } from "../types/command.ts";

/**
 * Executes commands using the shared infrastructure
 */
export class CommandExecutor {
  /**
   * Execute a command with parsed options
   *
   * @param commandName - Name of the command to execute
   * @param options - Parsed command options
   * @returns Promise that resolves when command completes
   */
  async execute(commandName: string, options: CommandOptions): Promise<void> {
    // Dynamically import and execute the command
    switch (commandName) {
      case "methodologies": {
        const { methodologies } = await import("../commands/methodologies.ts");
        await methodologies(options);
        break;
      }
      case "standards": {
        const { standards } = await import("../commands/standards.ts");
        await standards(options);
        break;
      }
      case "principles": {
        const { principles } = await import("../commands/principles.ts");
        await principles(options);
        break;
      }
      case "agents": {
        const { main } = await import("../commands/agents.ts");
        const exitCode = await main(options);
        if (exitCode !== 0) {
          Deno.exit(exitCode);
        }
        break;
      }
      default:
        throw new Error(`Unknown command: ${commandName}`);
    }
  }
}
