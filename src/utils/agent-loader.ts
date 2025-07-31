import { join } from "jsr:@std/path@1";
import { exists } from "jsr:@std/fs@1";
import { parse as parseYaml } from "jsr:@std/yaml@1";
import { Agent } from "../types/agent.ts";
import { paths } from "../paths.ts";
import { AichakuBrand as Brand } from "./branded-messages.ts";

export class AgentLoader {
  private templatesPath: string;

  constructor() {
    // Agent templates are in the aichaku source directory
    const aichakuPaths = paths.get();
    this.templatesPath = join(aichakuPaths.global.root, "docs", "core", "agent-templates");
  }

  /**
   * Load all available agents (required by ItemLoader interface)
   */
  loadAll(): Agent[] {
    return this.list();
  }

  /**
   * List all available agents
   */
  list(): Agent[] {
    const agents: Agent[] = [];

    try {
      // Read all directories in agent-templates synchronously
      for (const entry of Deno.readDirSync(this.templatesPath)) {
        if (!entry.isDirectory) continue;

        const templatePath = join(this.templatesPath, entry.name, "base.md");
        try {
          Deno.statSync(templatePath); // Check if file exists
          const agent = this.loadAgentSync(entry.name);
          if (agent) {
            agents.push(agent);
          }
        } catch {
          // File doesn't exist, skip
          continue;
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
  load(name: string): Agent | null {
    return this.loadAgentSync(name);
  }

  /**
   * Load a specific agent by id (same as by name for agents)
   */
  loadById(id: string): Agent | null {
    return this.loadAgentSync(id);
  }

  /**
   * Search agents by keyword
   */
  search(keyword: string): Agent[] {
    const allAgents = this.list();
    const lowerKeyword = keyword.toLowerCase();

    return allAgents.filter((agent) =>
      agent.name.toLowerCase().includes(lowerKeyword) ||
      agent.description.toLowerCase().includes(lowerKeyword) ||
      agent.technology_focus?.toLowerCase().includes(lowerKeyword) ||
      false
    );
  }

  /**
   * Get agents by type
   */
  getByType(type: "default" | "optional"): Agent[] {
    const allAgents = this.list();
    return allAgents.filter((agent) => agent.type === type);
  }

  private loadAgentSync(name: string): Agent | null {
    const templatePath = join(this.templatesPath, name, "base.md");

    try {
      const content = Deno.readTextFileSync(templatePath);

      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!yamlMatch) {
        Brand.error(`No YAML frontmatter found in ${name} template`);
        return null;
      }

      const yamlContent = yamlMatch[1];
      interface AgentYaml {
        name: string;
        type?: string;
        description?: string;
        tools?: string[];
        [key: string]: unknown;
      }

      let yaml: AgentYaml;
      try {
        yaml = parseYaml(yamlContent) as AgentYaml;
      } catch (yamlError) {
        // If YAML parsing fails, try to extract basic info manually
        const nameMatch = yamlContent.match(/^name:\s*(.+)$/m);
        const descMatch = yamlContent.match(/^description:\s*(.+)$/m);
        const typeMatch = yamlContent.match(/^type:\s*(.+)$/m);

        if (!nameMatch) {
          Brand.error(
            `Failed to parse YAML for ${name}: ${yamlError instanceof Error ? yamlError.message : "Unknown error"}`,
          );
          return null;
        }

        yaml = {
          name: nameMatch[1].trim(),
          description: descMatch?.[1]?.trim() || "",
          type: typeMatch?.[1]?.trim() || "optional",
        };
      }

      // Clean the name (remove @aichaku- prefix if present)
      const cleanName = yaml.name?.replace(/^@?aichaku-/, "") || name;

      const agent: Agent = {
        id: cleanName, // ConfigItem requires id field
        name: cleanName,
        type: (yaml.type as "default" | "optional") || "optional", // Default to optional if not specified
        description: yaml.description || "",
        color: yaml.color as string | undefined,
        methodology_aware: yaml.methodology_aware as boolean | undefined,
        tools: yaml.tools as string[] | undefined,
        technology_focus: yaml.technology_focus as string | undefined,
        examples: yaml.examples as Agent["examples"],
        delegations: yaml.delegations as Agent["delegations"],
      };

      return agent;
    } catch (error) {
      Brand.error(`Failed to load agent ${name}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  }
}
