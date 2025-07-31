#!/usr/bin/env -S deno run --allow-read --allow-env

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.208.0/yaml/mod.ts";
import { paths } from "../src/paths.ts";

interface AgentConfig {
  name: string;
  description: string;
  color?: string;
  methodology_aware?: boolean;
}

async function validateAgentNames(): Promise<void> {
  console.log("🧪 Validating agent names...\n");

  // Agents are in the project's .claude/agents directory
  const agentsDir = join(Deno.cwd(), ".claude", "agents");

  let allValid = true;
  const errors: string[] = [];

  try {
    // Read all .md files in agents directory
    for await (const entry of Deno.readDir(agentsDir)) {
      if (entry.isFile && entry.name.endsWith(".md") && entry.name !== "CLAUDE.md") {
        const filePath = join(agentsDir, entry.name);
        const content = await Deno.readTextFile(filePath);

        // Extract YAML frontmatter
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!yamlMatch) {
          errors.push(`❌ ${entry.name}: No YAML frontmatter found`);
          allValid = false;
          continue;
        }

        try {
          const config = parse(yamlMatch[1]) as AgentConfig;
          const expectedName = entry.name.replace(".md", "");

          // Validate name matches filename
          if (config.name !== expectedName) {
            errors.push(`❌ ${entry.name}: Name mismatch - expected '${expectedName}', found '${config.name}'`);
            allValid = false;
          } else {
            console.log(`✅ ${entry.name}: Name is correct ('${config.name}')`);
          }

          // Validate name doesn't contain @
          if (config.name.includes("@")) {
            errors.push(`❌ ${entry.name}: Name contains '@' character`);
            allValid = false;
          }

          // Validate name follows pattern
          if (!config.name.match(/^aichaku-[a-z-]+$/)) {
            errors.push(`❌ ${entry.name}: Name doesn't follow 'aichaku-*' pattern`);
            allValid = false;
          }
        } catch (e) {
          errors.push(`❌ ${entry.name}: Failed to parse YAML - ${e instanceof Error ? e.message : String(e)}`);
          allValid = false;
        }
      }
    }

    console.log("\n📊 Summary:");
    if (allValid) {
      console.log("✅ All agent names are valid!");
    } else {
      console.log("❌ Found validation errors:\n");
      errors.forEach((error) => console.log(error));
      Deno.exit(1);
    }
  } catch (e) {
    console.error(`❌ Failed to read agents directory: ${e instanceof Error ? e.message : String(e)}`);
    Deno.exit(1);
  }
}

// Also validate that orchestrator can find agents
async function validateOrchestratorReferences(): Promise<void> {
  console.log("\n🧪 Validating orchestrator references...\n");

  // Orchestrator is in the project's .claude/agents directory
  const orchestratorPath = join(Deno.cwd(), ".claude", "agents", "aichaku-orchestrator.md");

  try {
    const content = await Deno.readTextFile(orchestratorPath);

    // Find all @agent references
    const references = content.match(/@aichaku-[a-z-]+/g) || [];
    const uniqueRefs = [...new Set(references)];

    console.log(`Found ${uniqueRefs.length} unique agent references in orchestrator:`);

    for (const ref of uniqueRefs) {
      const agentName = ref.substring(1); // Remove @
      const agentFile = join(paths.get().userAgents, `${agentName}.md`);

      try {
        await Deno.stat(agentFile);
        console.log(`✅ ${ref} -> ${agentName}.md exists`);
      } catch {
        console.log(`❌ ${ref} -> ${agentName}.md NOT FOUND`);
      }
    }
  } catch (e) {
    console.error(`❌ Failed to validate orchestrator: ${e instanceof Error ? e.message : String(e)}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await validateAgentNames();
  await validateOrchestratorReferences();
}
