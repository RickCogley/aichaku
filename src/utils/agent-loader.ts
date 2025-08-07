import { Agent } from "../types/agent.ts";
import { paths } from "../paths.ts";
import { AichakuBrand as Brand } from "./branded-messages.ts";
import type { ItemLoader } from "../types/command.ts";
import { smartSearch } from "./fuzzy-search.ts";
import { type ContentMetadata, discoverContent } from "./dynamic-content-discovery.ts";

export class AgentLoader implements ItemLoader<Agent> {
  private basePath: string;

  constructor() {
    // Agent templates are in the aichaku source directory
    const aichakuPaths = paths.get();
    this.basePath = aichakuPaths.global.root;
  }

  /**
   * Load all available agents using dynamic content discovery
   */
  async loadAll(): Promise<Agent[]> {
    return await this.list();
  }

  /**
   * List all available agents using dynamic content discovery
   */
  async list(): Promise<Agent[]> {
    const agents: Agent[] = [];

    try {
      // Discover core content which includes agent templates
      const discovered = await discoverContent("core", this.basePath, true);

      // Filter for agent template base.md files
      const agentItems = discovered.items.filter((item) =>
        item.path.startsWith("agent-templates/") &&
        (item.path.endsWith("/base.md") || item.path === "agent-templates/base.md")
      );

      for (const item of agentItems) {
        const agent = this.metadataToAgent(item);
        if (agent) {
          agents.push(agent);
        }
      }
    } catch (error) {
      Brand.error(`Failed to list agents: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Sort by type (default first) then by name
    return agents.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "default" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Load a specific agent by name
   */
  async load(name: string): Promise<Agent | null> {
    return await this.loadById(name);
  }

  /**
   * Load a specific agent by id (supports both full ID and short name)
   */
  async loadById(id: string): Promise<Agent | null> {
    const all = await this.loadAll();

    // Clean up the input ID (trim whitespace, lowercase for comparison)
    const searchId = id.trim().toLowerCase();

    // Strategy 1: Exact match (with or without aichaku- prefix)
    const exactId = searchId.startsWith("aichaku-") ? searchId : `aichaku-${searchId}`;
    let agent = all.find((a) => a.id.toLowerCase() === exactId);

    if (agent) return agent;

    // Strategy 2: Try common suffixes if input has no suffix
    // Only try suffixes if the input doesn't already have one
    const commonSuffixes = ["-expert", "-architect", "-explorer", "-reviewer", "-coach", "-model-agent"];
    const singleWordAgents = ["documenter", "orchestrator"]; // Agents that are single words
    const hasAnySuffix = commonSuffixes.some((suffix) => searchId.includes(suffix)) ||
      singleWordAgents.includes(searchId.replace("aichaku-", ""));

    if (!hasAnySuffix) {
      for (const suffix of commonSuffixes) {
        const candidateId = searchId.startsWith("aichaku-") ? `${searchId}${suffix}` : `aichaku-${searchId}${suffix}`;
        agent = all.find((a) => a.id.toLowerCase() === candidateId);
        if (agent) return agent;
      }
    }

    // Strategy 3: Partial match (e.g., "api" matches "aichaku-api-architect")
    // Only use this for very short inputs (1-2 segments) to avoid false positives
    const segments = searchId.replace("aichaku-", "").split("-");
    if (segments.length <= 2) {
      agent = all.find((a) => {
        const agentIdLower = a.id.toLowerCase();
        // Must start with aichaku-{searchTerm}
        return agentIdLower.startsWith(`aichaku-${searchId.replace("aichaku-", "")}`) ||
          // Or contain the search term as a complete segment
          agentIdLower.split("-").includes(searchId.replace("aichaku-", ""));
      });
      if (agent) return agent;
    }

    return null;
  }

  /**
   * Search agents using fuzzy search
   */
  async search(keyword: string): Promise<Agent[]> {
    const all = await this.loadAll();
    return smartSearch(all, keyword, "agents");
  }

  /**
   * Get agents by type
   */
  async getByType(type: "default" | "optional"): Promise<Agent[]> {
    const allAgents = await this.list();
    return allAgents.filter((agent) => agent.type === type);
  }

  /**
   * Convert ContentMetadata to Agent object
   */
  private metadataToAgent(metadata: ContentMetadata): Agent | null {
    try {
      // Extract agent name from path (e.g., "agent-templates/code-explorer/base.md")
      const pathParts = metadata.path.split("/");
      const agentName = pathParts[1]; // Should be like "code-explorer"

      if (!agentName) {
        console.warn(`Invalid agent path: ${metadata.path}`);
        return null;
      }

      // Always use aichaku- prefix for all agents to prevent collisions
      const agentId = `aichaku-${agentName}`;

      // Extract display name from metadata or generate from agent name
      const displayName = metadata.name || `Aichaku ${
        agentName.split("-").map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1),
        ).join(" ")
      }`;

      const agent: Agent = {
        id: agentId,
        name: displayName,
        type: "optional", // Default type, will be enhanced from metadata if needed
        description: metadata.description || "No description available",
        // Additional fields will be populated from YAML frontmatter on demand
      };

      return agent;
    } catch (error) {
      console.error(`Failed to convert metadata to agent: ${metadata.path}`, error);
      return null;
    }
  }
}
