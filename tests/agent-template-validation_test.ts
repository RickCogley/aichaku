/**
 * Test to ensure agent template names match their directory names
 * This prevents the naming inconsistencies we've encountered
 */

import { walk } from "@std/fs";
import { basename, join } from "@std/path";
import { parse as parseYaml } from "jsr:@std/yaml@1";

const AGENT_TEMPLATES_PATH = join(Deno.cwd(), "docs", "core", "agent-templates");

// Interface for agent YAML frontmatter
interface AgentYaml {
  name: string;
  type?: string;
  description?: string;
  tools?: string[];
  delegations?: Array<{
    trigger: string;
    target: string;
    handoff: string;
  }>;
  examples?: Array<{
    context: string;
    user: string;
    assistant: string;
    commentary: string;
  }>;
  [key: string]: unknown;
}

Deno.test("Agent template names must match directory names", async () => {
  const errors: string[] = [];

  // Walk through all agent template directories
  for await (
    const entry of walk(AGENT_TEMPLATES_PATH, {
      includeDirs: true,
      includeFiles: false,
      maxDepth: 1,
    })
  ) {
    // Skip the root directory itself
    if (entry.path === AGENT_TEMPLATES_PATH) continue;

    const dirName = basename(entry.path);
    const baseFilePath = join(entry.path, "base.md");

    try {
      // Check if base.md exists
      const fileInfo = await Deno.stat(baseFilePath);
      if (!fileInfo.isFile) continue;

      // Read the base.md file
      const content = await Deno.readTextFile(baseFilePath);

      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!yamlMatch) {
        errors.push(`${dirName}: No YAML frontmatter found`);
        continue;
      }

      // Parse YAML
      interface AgentYaml {
        name: string;
        type?: string;
        description?: string;
        [key: string]: unknown;
      }

      let yaml: AgentYaml;
      try {
        yaml = parseYaml(yamlMatch[1]) as AgentYaml;
      } catch (_e) {
        const errorMessage = _e instanceof Error ? _e.message : String(_e);
        errors.push(`${dirName}: Failed to parse YAML - ${errorMessage}`);
        continue;
      }

      // Expected name is directory name with aichaku- prefix
      const expectedName = `aichaku-${dirName}`;

      // Check if name matches
      if (yaml.name !== expectedName) {
        errors.push(
          `${dirName}: Name mismatch - expected "${expectedName}", found "${yaml.name}"`,
        );
      }

      // Additional validations
      if (!yaml.type || (yaml.type !== "default" && yaml.type !== "optional")) {
        errors.push(
          `${dirName}: Invalid or missing type - must be "default" or "optional", found "${yaml.type}"`,
        );
      }

      if (!yaml.description) {
        errors.push(`${dirName}: Missing description`);
      }

      // Check for @ symbols in name (common error)
      if (yaml.name && yaml.name.includes("@")) {
        errors.push(
          `${dirName}: Name contains @ symbol - should not be in name field`,
        );
      }

      // Check for double prefix (another common error)
      if (yaml.name && yaml.name.includes("aichaku-aichaku")) {
        errors.push(
          `${dirName}: Name contains double prefix "aichaku-aichaku"`,
        );
      }
    } catch (_e) {
      // base.md doesn't exist or can't be read
      errors.push(`${dirName}: base.md not found or cannot be read`);
    }
  }

  // Report all errors
  if (errors.length > 0) {
    console.error("\nAgent Template Validation Errors:");
    errors.forEach((error) => console.error(`  ❌ ${error}`));
    throw new Error(`Found ${errors.length} agent template validation errors`);
  }
});

Deno.test("Agent template YAML structure is valid", async () => {
  const errors: string[] = [];

  for await (
    const entry of walk(AGENT_TEMPLATES_PATH, {
      includeDirs: true,
      includeFiles: false,
      maxDepth: 1,
    })
  ) {
    if (entry.path === AGENT_TEMPLATES_PATH) continue;

    const dirName = basename(entry.path);
    const baseFilePath = join(entry.path, "base.md");

    try {
      const content = await Deno.readTextFile(baseFilePath);
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!yamlMatch) continue;

      const yaml = parseYaml(yamlMatch[1]) as AgentYaml;

      // Check delegations structure if present
      if (yaml.delegations) {
        if (!Array.isArray(yaml.delegations)) {
          errors.push(`${dirName}: delegations must be an array`);
        } else {
          interface Delegation {
            trigger: string;
            target: string;
            handoff: string;
          }

          (yaml.delegations as Delegation[]).forEach((delegation, index) => {
            if (!delegation.trigger) {
              errors.push(`${dirName}: delegation[${index}] missing trigger`);
            }
            if (!delegation.target) {
              errors.push(`${dirName}: delegation[${index}] missing target`);
            }
            if (!delegation.handoff) {
              errors.push(`${dirName}: delegation[${index}] missing handoff`);
            }
            // Target should start with @ for agent references (except for special "all" case)
            if (delegation.target && !delegation.target.startsWith("@") && delegation.target !== "all") {
              errors.push(
                `${dirName}: delegation[${index}] target "${delegation.target}" should start with @`,
              );
            }
          });
        }
      }

      // Check examples structure if present
      if (yaml.examples) {
        if (!Array.isArray(yaml.examples)) {
          errors.push(`${dirName}: examples must be an array`);
        } else {
          interface Example {
            context: string;
            user: string;
            assistant: string;
            commentary: string;
          }

          (yaml.examples as Example[]).forEach((example, index) => {
            if (!example.context) {
              errors.push(`${dirName}: example[${index}] missing context`);
            }
            if (!example.user) {
              errors.push(`${dirName}: example[${index}] missing user`);
            }
            if (!example.assistant) {
              errors.push(`${dirName}: example[${index}] missing assistant`);
            }
            if (!example.commentary) {
              errors.push(`${dirName}: example[${index}] missing commentary`);
            }
          });
        }
      }
    } catch (_e) {
      // Skip if file doesn't exist
    }
  }

  if (errors.length > 0) {
    console.error("\nAgent Template Structure Errors:");
    errors.forEach((error) => console.error(`  ❌ ${error}`));
    throw new Error(`Found ${errors.length} agent template structure errors`);
  }
});

// Run this test to get a summary of all agents
Deno.test("List all agent templates (informational)", async () => {
  console.log("\nAgent Templates Summary:");
  console.log("========================");

  const agents = [];

  for await (
    const entry of walk(AGENT_TEMPLATES_PATH, {
      includeDirs: true,
      includeFiles: false,
      maxDepth: 1,
    })
  ) {
    if (entry.path === AGENT_TEMPLATES_PATH) continue;

    const dirName = basename(entry.path);
    const baseFilePath = join(entry.path, "base.md");

    try {
      const content = await Deno.readTextFile(baseFilePath);
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!yamlMatch) continue;

      const yaml = parseYaml(yamlMatch[1]) as AgentYaml;
      agents.push({
        directory: dirName,
        name: yaml.name,
        type: yaml.type || "unknown",
        hasTools: !!yaml.tools,
        hasDelegations: !!yaml.delegations,
        hasExamples: !!yaml.examples,
      });
    } catch (_e) {
      agents.push({
        directory: dirName,
        name: "ERROR",
        type: "ERROR",
        hasTools: false,
        hasDelegations: false,
        hasExamples: false,
      });
    }
  }

  // Sort by type (default first) then by name
  agents.sort((a, b) => {
    if (a.type !== b.type) {
      if (a.type === "default") return -1;
      if (b.type === "default") return 1;
    }
    return a.directory.localeCompare(b.directory);
  });

  console.log(`Total agents: ${agents.length}`);
  console.log(`Default agents: ${agents.filter((a) => a.type === "default").length}`);
  console.log(`Optional agents: ${agents.filter((a) => a.type === "optional").length}`);
  console.log("");

  agents.forEach((agent) => {
    const status = agent.name === `aichaku-${agent.directory}` ? "✅" : "❌";
    const features = [
      agent.hasTools ? "tools" : "",
      agent.hasDelegations ? "delegations" : "",
      agent.hasExamples ? "examples" : "",
    ].filter(Boolean).join(", ");

    console.log(
      `${status} ${agent.directory.padEnd(20)} | ${agent.type.padEnd(8)} | ${agent.name.padEnd(30)} | ${features}`,
    );
  });
});
