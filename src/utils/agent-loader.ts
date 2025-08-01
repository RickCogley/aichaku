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
   * Load a specific agent by id (same as by name for agents)
   */
  async loadById(id: string): Promise<Agent | null> {
    const all = await this.loadAll();
    return all.find((agent) => agent.id === id) || null;
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

      // Clean the name (remove @aichaku- prefix if present from metadata.name)
      const cleanName = metadata.name?.replace(/^@?aichaku-/, "") || agentName;

      const agent: Agent = {
        id: cleanName,
        name: cleanName,
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
