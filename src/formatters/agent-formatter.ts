import { Agent } from "../types/agent.ts";
import { BaseFormatter } from "./base-formatter.ts";

export class AgentFormatter extends BaseFormatter<Agent> {
  /**
   * Format a list of agents
   */
  formatList(agents: Agent[]): string {
    const lines: string[] = [];

    // Header
    lines.push(this.formatHeader("Available Agents"));
    lines.push(this.addEmptyLine());

    // Group by type
    const defaultAgents = agents.filter((a) => a.type === "default");
    const optionalAgents = agents.filter((a) => a.type === "optional");

    if (defaultAgents.length > 0) {
      lines.push(this.formatSubsection("Default Agents (automatically included):"));
      lines.push(this.formatSeparator());
      for (const agent of defaultAgents) {
        const colorIndicator = agent.color ? `[${agent.color}]` : "";
        lines.push(this.formatItem(`${agent.name} ${colorIndicator}`));
        lines.push(`    ${agent.description}`);
        if (agent.technology_focus) {
          lines.push(`    Focus: ${agent.technology_focus}`);
        }
      }
      lines.push(this.addEmptyLine());
    }

    if (optionalAgents.length > 0) {
      lines.push(this.formatSubsection("Optional Agents (add as needed):"));
      lines.push(this.formatSeparator(34));
      for (const agent of optionalAgents) {
        const colorIndicator = agent.color ? `[${agent.color}]` : "";
        lines.push(this.formatItem(`${agent.name} ${colorIndicator}`));
        lines.push(`    ${agent.description}`);
        if (agent.technology_focus) {
          lines.push(`    Focus: ${agent.technology_focus}`);
        }
      }
    }

    return this.buildOutput(lines);
  }

  /**
   * Format currently selected agents
   */
  formatCurrent(selected: string[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Selected Agents"));
    lines.push(this.addEmptyLine());

    if (selected.length === 0) {
      lines.push("No agents selected (default agents will be included during integration)");
    } else {
      lines.push("Currently selected:");
      for (const agent of selected) {
        lines.push(this.formatItem(agent));
      }
      lines.push(this.addEmptyLine());
      lines.push(`💡 Selection order determines priority when conflicts arise`);
      lines.push(`   First listed agents take precedence over later ones`);
    }

    return this.buildOutput(lines);
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
    lines.push(this.formatHeader("Agent", agent.name));
    lines.push(this.addEmptyLine());

    // Basic info section
    lines.push(this.formatSection("Basic Information"));
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
      lines.push(this.addEmptyLine());
      lines.push(this.formatSection("Available Tools"));
      for (const tool of agent.tools) {
        lines.push(this.formatItem(tool));
      }
    }

    // Examples
    if (agent.examples && agent.examples.length > 0) {
      lines.push(this.addEmptyLine());
      lines.push(this.formatSection("Usage Examples"));
      for (const example of agent.examples) {
        lines.push(`  Context: ${example.context}`);
        lines.push(`  User: "${example.user}"`);
        lines.push(`  Assistant: "${example.assistant}"`);
        lines.push(`  ${example.commentary}`);
        lines.push(this.addEmptyLine());
      }
    }

    // Delegations
    if (agent.delegations && agent.delegations.length > 0) {
      lines.push(this.formatSection("Delegates To"));
      for (const delegation of agent.delegations) {
        lines.push(this.formatItem(delegation.target));
        lines.push(`    When: ${delegation.trigger}`);
        lines.push(`    Handoff: "${delegation.handoff}"`);
        lines.push(this.addEmptyLine());
      }
    }

    return this.buildOutput(lines);
  }

  /**
   * Format search results
   */
  formatSearch(agents: Agent[], keyword: string): string {
    const lines: string[] = [];

    lines.push(this.formatHeader("Search Results", `for "${keyword}"`));
    lines.push(this.addEmptyLine());

    if (agents.length === 0) {
      lines.push("No agents found matching your search.");
    } else {
      lines.push(`Found ${agents.length} agent${agents.length > 1 ? "s" : ""}:`);
      lines.push(this.addEmptyLine());
      for (const agent of agents) {
        lines.push(this.formatItem(`${agent.name} (${agent.type})`));
        lines.push(`    ${agent.description}`);
      }
    }

    return this.buildOutput(lines);
  }
}
