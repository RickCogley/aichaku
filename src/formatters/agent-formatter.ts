import { Agent } from "../types/agent.ts";
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";

export class AgentFormatter {
  /**
   * Format a list of agents
   */
  formatList(agents: Agent[]): string {
    const lines: string[] = [];

    // Header
    lines.push(`${Brand.PREFIX} Available Agents`);
    lines.push("");

    // Group by type
    const defaultAgents = agents.filter((a) => a.type === "default");
    const optionalAgents = agents.filter((a) => a.type === "optional");

    if (defaultAgents.length > 0) {
      lines.push("Default Agents (automatically included):");
      lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      for (const agent of defaultAgents) {
        const colorIndicator = agent.color ? `[${agent.color}]` : "";
        lines.push(`  • ${agent.name} ${colorIndicator}`);
        lines.push(`    ${agent.description}`);
        if (agent.technology_focus) {
          lines.push(`    Focus: ${agent.technology_focus}`);
        }
      }
      lines.push("");
    }

    if (optionalAgents.length > 0) {
      lines.push("Optional Agents (add as needed):");
      lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      for (const agent of optionalAgents) {
        const colorIndicator = agent.color ? `[${agent.color}]` : "";
        lines.push(`  • ${agent.name} ${colorIndicator}`);
        lines.push(`    ${agent.description}`);
        if (agent.technology_focus) {
          lines.push(`    Focus: ${agent.technology_focus}`);
        }
      }
    }

    return lines.join("\n");
  }

  /**
   * Format currently selected agents
   */
  formatCurrent(selected: string[]): string {
    const lines: string[] = [];

    lines.push(`${Brand.PREFIX} Selected Agents`);
    lines.push("");

    if (selected.length === 0) {
      lines.push("No agents selected (default agents will be included during integration)");
    } else {
      lines.push("Currently selected:");
      for (const agent of selected) {
        lines.push(`  • ${agent}`);
      }
      lines.push("");
      lines.push(`💡 Selection order determines priority when conflicts arise`);
      lines.push(`   First listed agents take precedence over later ones`);
    }

    return lines.join("\n");
  }

  /**
   * Format detailed agent information (required by ItemFormatter interface)
   */
  formatDetails(agent: Agent, _verbose?: boolean): string {
    return this.formatDetail(agent);
  }

  /**
   * Format detailed agent information
   */
  formatDetail(agent: Agent): string {
    const lines: string[] = [];

    // Header
    lines.push(`${Brand.PREFIX} Agent: ${agent.name}`);
    lines.push("━".repeat(40));
    lines.push("");

    // Basic info
    lines.push(`Type: ${agent.type}`);
    lines.push(`Description: ${agent.description}`);
    if (agent.color) {
      lines.push(`Color: ${agent.color}`);
    }
    if (agent.methodology_aware !== undefined) {
      lines.push(`Methodology Aware: ${agent.methodology_aware ? "Yes" : "No"}`);
    }
    if (agent.technology_focus) {
      lines.push(`Technology Focus: ${agent.technology_focus}`);
    }

    // Tools
    if (agent.tools && agent.tools.length > 0) {
      lines.push("");
      lines.push("Available Tools:");
      for (const tool of agent.tools) {
        lines.push(`  • ${tool}`);
      }
    }

    // Examples
    if (agent.examples && agent.examples.length > 0) {
      lines.push("");
      lines.push("Usage Examples:");
      for (const example of agent.examples) {
        lines.push(`  Context: ${example.context}`);
        lines.push(`  User: "${example.user}"`);
        lines.push(`  Assistant: "${example.assistant}"`);
        lines.push(`  ${example.commentary}`);
        lines.push("");
      }
    }

    // Delegations
    if (agent.delegations && agent.delegations.length > 0) {
      lines.push("Delegates To:");
      for (const delegation of agent.delegations) {
        lines.push(`  • ${delegation.target}`);
        lines.push(`    When: ${delegation.trigger}`);
        lines.push(`    Handoff: "${delegation.handoff}"`);
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  /**
   * Format search results
   */
  formatSearch(agents: Agent[], keyword: string): string {
    const lines: string[] = [];

    lines.push(`${Brand.PREFIX} Search Results for "${keyword}"`);
    lines.push("");

    if (agents.length === 0) {
      lines.push("No agents found matching your search.");
    } else {
      lines.push(`Found ${agents.length} agent${agents.length > 1 ? "s" : ""}:`);
      lines.push("");
      for (const agent of agents) {
        lines.push(`  • ${agent.name} (${agent.type})`);
        lines.push(`    ${agent.description}`);
      }
    }

    return lines.join("\n");
  }
}
