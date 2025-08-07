import { Agent } from "../types/agent.ts";
import { paths } from "../paths.ts";
import { AichakuBrand as Brand } from "./branded-messages.ts";
import type { ItemLoader } from "../types/command.ts";
import { smartSearch } from "./fuzzy-search.ts";
import { type ContentMetadata, discoverContent } from "./dynamic-content-discovery.ts";

export class AgentLoader implements ItemLoader<Agent> {
  private basePath: string;

  constructor() {
    // For testing and development, use local docs directory if it exists
    // Otherwise fall back to global installation
    const aichakuPaths = paths.get();

    // Check if we're in the source repository (has docs/core/agent-templates)
    // Try multiple possible locations
    const possiblePaths = [
      // Current working directory (for tests)
      `${Deno.cwd()}/docs`,
      // Relative to the source file location
      new URL("../../docs", import.meta.url).pathname,
      // Global installation
      `${aichakuPaths.global.root}/docs`,
    ];

    this.basePath = aichakuPaths.global.root; // Default

    for (const docsPath of possiblePaths) {
      try {
        const agentTemplatesPath = `${docsPath}/core/agent-templates`;
        const stat = Deno.statSync(agentTemplatesPath);
        if (stat.isDirectory) {
          this.basePath = docsPath.replace("/docs", ""); // Remove /docs suffix to get root
          break;
        }
      } catch {
        // Try next path
      }
    }
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
   * Returns null if no match or multiple matches found
   */
  async loadById(id: string): Promise<Agent | null> {
    const all = await this.loadAll();

    // Clean up the input ID
    const searchId = id.trim();

    // First try exact match (with or without aichaku- prefix)
    const exactId = searchId.toLowerCase().startsWith("aichaku-")
      ? searchId.toLowerCase()
      : `aichaku-${searchId.toLowerCase()}`;

    const exactMatch = all.find((a) => a.id.toLowerCase() === exactId);
    if (exactMatch) {
      return exactMatch;
    }

    // Use fuzzy search to find potential matches
    const searchResults = smartSearch(all, searchId, "agents");

    // If no matches found, return null
    if (searchResults.length === 0) {
      return null;
    }

    // If exactly one match, return it
    if (searchResults.length === 1) {
      return searchResults[0];
    }

    // Multiple matches found - this is ambiguous
    // In a CLI context, we should prompt the user to be more specific
    // For now, return null to indicate ambiguity
    // The calling code should handle this case and show available options
    return null;
  }

  /**
   * Find agents by partial ID (returns all matches)
   * This is useful when we need to show the user their options
   */
  async findByPartialId(partialId: string): Promise<Agent[]> {
    const all = await this.loadAll();
    return smartSearch(all, partialId, "agents");
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
