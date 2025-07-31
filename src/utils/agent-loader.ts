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
   * List all available agents
   */
  async list(): Promise<Agent[]> {
    const agents: Agent[] = [];

    try {
      // Read all directories in agent-templates
      for await (const entry of Deno.readDir(this.templatesPath)) {
        if (!entry.isDirectory) continue;

        const templatePath = join(this.templatesPath, entry.name, "base.md");
        if (!(await exists(templatePath))) continue;

        const agent = await this.loadAgent(entry.name);
        if (agent) {
          agents.push(agent);
        }
      }
    } catch (error) {
      Brand.error(`Failed to list agents: ${error.message}`);
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
   * Load all available agents (alias for list)
   */
  async loadAll(): Promise<Agent[]> {
    return this.list();
  }

  /**
   * Load a specific agent by name
   */
  async load(name: string): Promise<Agent | null> {
    return this.loadAgent(name);
  }

  /**
   * Load a specific agent by id (same as by name for agents)
   */
  async loadById(id: string): Promise<Agent | null> {
    return this.loadAgent(id);
  }

  /**
   * Search agents by keyword
   */
  async search(keyword: string): Promise<Agent[]> {
    const allAgents = await this.list();
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
  async getByType(type: "default" | "optional"): Promise<Agent[]> {
    const allAgents = await this.list();
    return allAgents.filter((agent) => agent.type === type);
  }

  private async loadAgent(name: string): Promise<Agent | null> {
    const templatePath = join(this.templatesPath, name, "base.md");

    try {
      const content = await Deno.readTextFile(templatePath);

      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!yamlMatch) {
        Brand.error(`No YAML frontmatter found in ${name} template`);
        return null;
      }

      const yamlContent = yamlMatch[1];
      let yaml: any;
      try {
        yaml = parseYaml(yamlContent) as any;
      } catch (yamlError) {
        // If YAML parsing fails, try to extract basic info manually
        const nameMatch = yamlContent.match(/^name:\s*(.+)$/m);
        const descMatch = yamlContent.match(/^description:\s*(.+)$/m);
        const typeMatch = yamlContent.match(/^type:\s*(.+)$/m);

        if (!nameMatch) {
          Brand.error(`Failed to parse YAML for ${name}: ${yamlError.message}`);
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
        name: cleanName,
        type: yaml.type || "optional", // Default to optional if not specified
        description: yaml.description || "",
        color: yaml.color,
        methodology_aware: yaml.methodology_aware,
        tools: yaml.tools,
        technology_focus: yaml.technology_focus,
        examples: yaml.examples,
        delegations: yaml.delegations,
      };

      return agent;
    } catch (error) {
      Brand.error(`Failed to load agent ${name}: ${error.message}`);
      return null;
    }
  }
}
