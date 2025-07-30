/**
 * Agent Generator Utility
 *
 * Generates methodology-aware Claude Code agents by combining base templates
 * with methodology and standards extensions.
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { safeReadTextFile } from "./path-security.ts";
import type { PrincipleCategory } from "../types/principle.ts";

interface AgentGenerationOptions {
  selectedMethodologies: string[];
  selectedStandards: string[];
  selectedPrinciples: string[];
  outputPath: string;
  agentPrefix: string;
}

interface AgentGenerationResult {
  success: boolean;
  generated: number;
  skipped: number;
  errors: string[];
}

interface AgentTemplate {
  name: string;
  description: string;
  tools: string[];
  content: string;
}

interface ParsedYaml {
  name: string;
  description: string;
  tools: string[];
  examples?: Array<{
    context: string;
    user: string;
    assistant: string;
    commentary: string;
  }>;
  delegations?: Array<{
    trigger: string;
    target: string;
    handoff: string;
  }>;
}

/**
 * Define which principles each agent type should be aware of
 */
const AGENT_PRINCIPLE_MAPPING: Record<string, {
  categories: PrincipleCategory[];
  specific?: string[];
}> = {
  "orchestrator": {
    categories: ["software-development", "organizational", "engineering", "human-centered"],
    // Orchestrator gets all principles for intelligent routing
  },
  "security-reviewer": {
    categories: ["engineering"],
    specific: ["defensive-programming", "fail-fast", "robustness-principle", "privacy-by-design"],
  },
  "code-explorer": {
    categories: ["software-development", "engineering"],
    specific: ["dry", "yagni", "kiss", "unix-philosophy", "separation-of-concerns", "solid"],
  },
  "methodology-coach": {
    categories: ["organizational", "human-centered"],
    specific: ["agile-manifesto", "lean-principles", "conways-law", "user-centered-design", "inclusive-design"],
  },
  "documenter": {
    categories: ["human-centered"],
    specific: ["accessibility-first", "inclusive-design", "user-centered-design", "dry"],
  },
  "api-architect": {
    categories: ["software-development", "engineering"],
    specific: [
      "solid",
      "separation-of-concerns",
      "unix-philosophy",
      "robustness-principle",
      "defensive-programming",
      "user-centered-design",
    ],
  },
  "principle-coach": {
    categories: ["software-development", "organizational", "engineering", "human-centered"],
    // Principle coach gets all principles for comprehensive guidance
  },
};

/**
 * Generate methodology-aware agents based on selected methodologies and standards
 */
export async function generateMethodologyAwareAgents(
  options: AgentGenerationOptions,
): Promise<AgentGenerationResult> {
  const result: AgentGenerationResult = {
    success: true,
    generated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Ensure output directory exists
    await Deno.mkdir(options.outputPath, { recursive: true });

    // Define agent types to generate
    const agentTypes = [
      "orchestrator",
      "security-reviewer",
      "methodology-coach",
      "documenter",
      "code-explorer",
      "api-architect",
      "principle-coach",
    ];

    for (const agentType of agentTypes) {
      try {
        const agent = await generateAgent(agentType, options);
        if (agent) {
          const agentPath = join(options.outputPath, `${options.agentPrefix}${agentType}.md`);

          // Check if agent already exists
          if (await exists(agentPath)) {
            // Update existing agent
            await Deno.writeTextFile(agentPath, agent.content);
            result.generated++;
          } else {
            // Create new agent
            await Deno.writeTextFile(agentPath, agent.content);
            result.generated++;
          }
        } else {
          result.skipped++;
        }
      } catch (error) {
        result.errors.push(
          `Failed to generate ${agentType}: ${error instanceof Error ? error.message : String(error)}`,
        );
        result.success = false;
      }
    }
  } catch (error) {
    result.errors.push(`Agent generation failed: ${error instanceof Error ? error.message : String(error)}`);
    result.success = false;
  }

  return result;
}

/**
 * Generate a single agent by injecting selected standards and methodology YAML
 */
async function generateAgent(
  agentType: string,
  options: AgentGenerationOptions,
): Promise<AgentTemplate | null> {
  // Use global installation path for agent templates
  const homePath = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
  const templateBase = join(homePath, ".claude", "aichaku", "docs", "core", "agent-templates");
  const agentBasePath = join(templateBase, agentType, "base.md");

  // Always use fresh template from global installation
  // TODO: Implement proper user customization system with clear override mechanism
  if (!(await exists(agentBasePath))) {
    console.warn(`Base template not found for ${agentType}: ${agentBasePath}`);
    return null;
  }

  let baseContent = await safeReadTextFile(agentBasePath, templateBase);
  const parsed = parseAgentTemplate(baseContent);
  const yaml = parsed.yaml;
  baseContent = parsed.content;

  // Generate standards YAML section
  const standardsYaml = await generateStandardsYaml(options.selectedStandards);

  // Generate methodology YAML section
  const methodologyYaml = await generateMethodologyYaml(options.selectedMethodologies);

  // Generate principles YAML section
  const principlesYaml = await generatePrinciplesYaml(options.selectedPrinciples, agentType);

  // Sections will be combined later after YAML frontmatter is built

  // Build YAML frontmatter with pure YAML structure
  const yamlFrontmatter: {
    name: string;
    description: string;
    color: string;
    methodology_aware: boolean;
    tools?: string[];
    examples?: typeof yaml.examples;
    delegations?: typeof yaml.delegations;
  } = {
    // Check if name already has the prefix to avoid double prefixing
    name: yaml.name.startsWith(options.agentPrefix) ? yaml.name : `${options.agentPrefix}${yaml.name}`,
    description: yaml.description,
    color: getAgentColor(agentType),
    methodology_aware: true,
  };

  // Only add tools if not all tools (omit for "*")
  if (yaml.tools && JSON.stringify(yaml.tools) !== '["*"]') {
    yamlFrontmatter.tools = yaml.tools;
  }

  // Add cross-functional config from parsed YAML
  if (yaml.examples) {
    yamlFrontmatter.examples = yaml.examples;
  }
  if (yaml.delegations) {
    yamlFrontmatter.delegations = yaml.delegations;
  }

  // Convert to YAML string with proper formatting
  const yamlString = formatYamlFrontmatter(yamlFrontmatter);

  // Combine content sections
  const contentSections = [
    baseContent.trim(),
    standardsYaml,
    methodologyYaml,
    principlesYaml,
  ].filter(Boolean);

  const finalContent = `---
${yamlString}
---

${contentSections.join("\n\n")}`;

  return {
    name: yaml.name,
    description: yaml.description,
    tools: yaml.tools,
    content: finalContent,
  };
}

/**
 * Parse agent template to extract YAML frontmatter and content
 */
function parseAgentTemplate(template: string): { yaml: ParsedYaml; content: string } {
  const lines = template.split("\n");

  // Check if template starts with YAML frontmatter
  if (lines[0] === "---") {
    const endIndex = lines.findIndex((line, index) => index > 0 && line === "---");
    if (endIndex > 0) {
      const yamlLines = lines.slice(1, endIndex);
      const contentLines = lines.slice(endIndex + 1);

      // Parse YAML - handle nested structures like examples and delegations
      const yaml: ParsedYaml = {
        name: "Unknown Agent",
        description: "Generated agent",
        tools: ["*"],
      };
      let currentKey = "";
      let currentIndent = 0;
      let currentArray: unknown[] | null = null;
      let currentObject: Record<string, unknown> | null = null;

      for (const line of yamlLines) {
        const match = line.match(/^(\s*)(.*)$/);
        if (!match) continue;

        const [, indent, content] = match;
        const indentLevel = indent.length;

        if (!content.trim()) continue;

        // Top-level key-value pair
        if (indentLevel === 0 && content.includes(":")) {
          // Save any in-progress array
          if (currentKey && currentArray !== null) {
            if (currentKey === "examples") {
              yaml.examples = currentArray as typeof yaml.examples;
            } else if (currentKey === "delegations") {
              yaml.delegations = currentArray as typeof yaml.delegations;
            }
            currentArray = null;
          }

          const [key, ...valueParts] = content.split(":");
          const value = valueParts.join(":").trim();
          currentKey = key.trim();

          if (value) {
            // Simple value
            if (currentKey === "tools") {
              try {
                yaml.tools = JSON.parse(value);
              } catch {
                yaml.tools = ["*"];
              }
            } else if (currentKey === "name" || currentKey === "description") {
              yaml[currentKey] = value.replace(/^["']|["']$/g, "");
            }
            currentKey = "";
          } else {
            // Start of nested structure
            currentIndent = indentLevel;
            if (currentKey === "examples" || currentKey === "delegations") {
              currentArray = [];
            }
          }
        } // Array item
        else if (content.trim().startsWith("- ") && currentArray !== null) {
          const itemContent = content.trim().substring(2);
          if (itemContent.includes(":")) {
            // Start of object in array
            currentObject = {};
            const [key, ...valueParts] = itemContent.split(":");
            const value = valueParts.join(":").trim();
            if (value) {
              currentObject[key.trim()] = value.replace(/^["']|["']$/g, "");
            }
            currentArray.push(currentObject);
          } else {
            // Simple array item
            currentArray.push(itemContent);
            currentObject = null;
          }
        } // Object property in array
        else if (currentObject && indentLevel > currentIndent) {
          if (content.includes(":")) {
            const [key, ...valueParts] = content.split(":");
            const value = valueParts.join(":").trim();
            currentObject[key.trim()] = value.replace(/^["']|["']$/g, "");
          }
        }
      }

      // Save any remaining array
      if (currentKey && currentArray !== null) {
        if (currentKey === "examples") {
          yaml.examples = currentArray as typeof yaml.examples;
        } else if (currentKey === "delegations") {
          yaml.delegations = currentArray as typeof yaml.delegations;
        }
      }

      return {
        yaml,
        content: contentLines.join("\n"),
      };
    }
  }

  // Fallback: treat entire content as content section
  return {
    yaml: {
      name: "Unknown Agent",
      description: "Generated agent",
      tools: ["*"],
    } as ParsedYaml,
    content: template,
  };
}

/**
 * Format YAML frontmatter with proper indentation and structure
 */
function formatYamlFrontmatter(yaml: {
  name: string;
  description: string;
  color: string;
  methodology_aware: boolean;
  tools?: string[];
  examples?: Array<{
    context: string;
    user: string;
    assistant: string;
    commentary: string;
  }>;
  delegations?: Array<{
    trigger: string;
    target: string;
    handoff: string;
  }>;
}): string {
  const lines: string[] = [];

  // Simple properties first
  // Add simple properties
  lines.push(`name: ${yaml.name}`);
  lines.push(`description: ${yaml.description}`);
  lines.push(`color: ${yaml.color}`);
  lines.push(`methodology_aware: ${yaml.methodology_aware}`);

  // Tools array (if present)
  if (yaml.tools && Array.isArray(yaml.tools)) {
    lines.push(`tools: ${JSON.stringify(yaml.tools)}`);
  }

  // Examples array
  if (yaml.examples && Array.isArray(yaml.examples)) {
    lines.push("examples:");
    for (const example of yaml.examples) {
      lines.push("  - context: " + example.context);
      lines.push('    user: "' + example.user + '"');
      lines.push('    assistant: "' + example.assistant + '"');
      lines.push("    commentary: " + example.commentary);
    }
  }

  // Delegations array
  if (yaml.delegations && Array.isArray(yaml.delegations)) {
    lines.push("delegations:");
    for (const delegation of yaml.delegations) {
      lines.push("  - trigger: " + delegation.trigger);
      lines.push("    target: " + delegation.target);
      lines.push('    handoff: "' + delegation.handoff + '"');
    }
  }

  return lines.join("\n");
}

/**
 * Get agent color based on type
 */
function getAgentColor(agentType: string): string {
  const colors: { [key: string]: string } = {
    "orchestrator": "yellow", // Aichaku brand color
    "security-reviewer": "red", // Security/danger
    "methodology-coach": "green", // Growth/guidance
    "documenter": "blue", // Information/docs
    "code-explorer": "magenta", // Discovery/analysis
    "api-architect": "cyan", // Technical/architecture
  };
  return colors[agentType] || "white";
}

/**
 * Generate standards YAML section from selected standards
 */
async function generateStandardsYaml(standards: string[]): Promise<string> {
  if (standards.length === 0) return "";

  const standardsByCategory: { [key: string]: Record<string, unknown>[] } = {};

  for (const standard of standards) {
    const category = await findStandardCategory(standard);
    if (category) {
      const homePath = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
      const standardPath = join(homePath, ".claude", "aichaku", "docs", "standards", category, `${standard}.yaml`);
      if (await exists(standardPath)) {
        const yamlContent = await safeReadTextFile(standardPath, join(homePath, ".claude", "aichaku"));
        const parsedYaml = parseYamlSections(yamlContent, ["summary", "rules"]);

        if (!standardsByCategory[category]) standardsByCategory[category] = [];
        standardsByCategory[category].push({
          name: standard,
          ...parsedYaml,
        });
      }
    }
  }

  if (Object.keys(standardsByCategory).length === 0) return "";

  let yamlSection = `## Selected Standards

<!-- AUTO-GENERATED from docs/standards/ - Do not edit manually -->

\`\`\`yaml
standards:`;

  for (const [category, categoryStandards] of Object.entries(standardsByCategory)) {
    yamlSection += `\n  ${category}:`;
    for (const standard of categoryStandards) {
      yamlSection += `\n    ${standard.name}:`;
      if (standard.summary) {
        yamlSection += `\n      summary: ${JSON.stringify(standard.summary, null, 6).replace(/^/gm, "      ")}`;
      }
      if (standard.rules) {
        yamlSection += `\n      rules: ${JSON.stringify(standard.rules, null, 6).replace(/^/gm, "      ")}`;
      }
    }
  }

  yamlSection += `\n\`\`\``;
  return yamlSection;
}

/**
 * Generate methodology YAML section from selected methodologies
 */
async function generateMethodologyYaml(methodologies: string[]): Promise<string> {
  if (methodologies.length === 0) return "";

  const methodologyData: Array<{
    name: string;
    summary?: unknown;
    rules?: unknown;
    templates?: unknown;
  }> = [];

  for (const methodology of methodologies) {
    const homePath = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    const methodologyPath = join(
      homePath,
      ".claude",
      "aichaku",
      "docs",
      "methodologies",
      methodology,
      `${methodology}.yaml`,
    );
    if (await exists(methodologyPath)) {
      const yamlContent = await safeReadTextFile(methodologyPath, join(homePath, ".claude", "aichaku"));
      const parsedYaml = parseYamlSections(yamlContent, ["summary", "rules", "templates"]);
      methodologyData.push({
        name: methodology,
        ...parsedYaml as { summary?: unknown; rules?: unknown; templates?: unknown },
      });
    }
  }

  if (methodologyData.length === 0) return "";

  let yamlSection = `## Active Methodology

<!-- AUTO-GENERATED from docs/methodologies/ - Do not edit manually -->

\`\`\`yaml
methodology:`;

  for (const methodology of methodologyData) {
    yamlSection += `\n  ${methodology.name}:`;
    if (methodology.summary) {
      yamlSection += `\n    summary: ${JSON.stringify(methodology.summary, null, 4).replace(/^/gm, "    ")}`;
    }
    if (methodology.rules) {
      yamlSection += `\n    rules: ${JSON.stringify(methodology.rules, null, 4).replace(/^/gm, "    ")}`;
    }
    if (methodology.templates) {
      yamlSection += `\n    templates: ${JSON.stringify(methodology.templates, null, 4).replace(/^/gm, "    ")}`;
    }
  }

  yamlSection += `\n\`\`\``;
  return yamlSection;
}

/**
 * Parse YAML content and extract specific sections
 */
function parseYamlSections(yamlContent: string, sections: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  try {
    // Simple YAML parsing for the sections we need
    const lines = yamlContent.split("\n");
    let currentSection = "";
    let currentContent: string[] = [];
    let indentLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = line.match(/^(\s*)(\w+):\s*(.*)$/);
      if (match) {
        const [, indent, key, value] = match;
        const currentIndent = indent.length;

        // If this is a top-level section we want
        if (currentIndent === 0 && sections.includes(key)) {
          // Save previous section
          if (currentSection && currentContent.length > 0) {
            result[currentSection] = parseYamlValue(currentContent.join("\n"));
          }

          currentSection = key;
          currentContent = [];
          indentLevel = currentIndent;

          if (value) {
            currentContent.push(value);
          }
        } else if (currentSection && currentIndent > indentLevel) {
          // Add content to current section
          currentContent.push(line);
        } else if (currentSection && currentIndent <= indentLevel && currentIndent > 0) {
          // Still part of current section
          currentContent.push(line);
        } else if (currentIndent === 0) {
          // New top-level section, save current if we were collecting
          if (currentSection && currentContent.length > 0) {
            result[currentSection] = parseYamlValue(currentContent.join("\n"));
          }
          currentSection = "";
          currentContent = [];
        }
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save final section
    if (currentSection && currentContent.length > 0) {
      result[currentSection] = parseYamlValue(currentContent.join("\n"));
    }
  } catch (error) {
    console.warn(`Failed to parse YAML sections: ${error}`);
  }

  return result;
}

/**
 * Parse a YAML value (handling strings, objects, arrays)
 */
function parseYamlValue(content: string): unknown {
  const trimmed = content.trim();

  // Handle multiline string (|)
  if (trimmed.startsWith("|")) {
    return trimmed.substring(1).trim();
  }

  // Handle simple string value
  if (!trimmed.includes("\n") && !trimmed.includes(":")) {
    return trimmed;
  }

  // For complex structures, return as-is for now
  // (Could implement full YAML parsing if needed)
  return trimmed;
}

/**
 * Generate principles YAML section from selected principles for specific agent
 */
async function generatePrinciplesYaml(principles: string[], agentType: string): Promise<string> {
  // Get the mapping for this agent type
  const agentMapping = AGENT_PRINCIPLE_MAPPING[agentType];
  if (!agentMapping) return "";

  const principlesByCategory: { [key: string]: Record<string, unknown>[] } = {};
  const homePath = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
  const principlesBase = join(homePath, ".claude", "aichaku", "docs", "principles");

  // Helper function to check if a principle should be included for this agent
  const shouldIncludePrinciple = (principleId: string, category: PrincipleCategory): boolean => {
    // Always include if specifically listed for this agent
    if (agentMapping.specific?.includes(principleId)) return true;

    // Include if the agent accepts this category AND the principle is selected
    if (agentMapping.categories.includes(category) && principles.includes(principleId)) return true;

    return false;
  };

  // Load principles from each category
  const categories: PrincipleCategory[] = ["software-development", "organizational", "engineering", "human-centered"];

  for (const category of categories) {
    const categoryPath = join(principlesBase, category);

    if (!await exists(categoryPath)) continue;

    // Find all YAML files in the category
    try {
      for await (const entry of Deno.readDir(categoryPath)) {
        if (entry.isFile && entry.name.endsWith(".yaml")) {
          const principleId = entry.name.replace(".yaml", "");

          // Check if this principle should be included for this agent
          if (!shouldIncludePrinciple(principleId, category)) {
            continue;
          }

          const yamlPath = join(categoryPath, entry.name);
          const yamlContent = await safeReadTextFile(yamlPath, principlesBase);
          const parsedYaml = parseYamlSections(yamlContent, ["summary", "guidance", "application_context"]);

          if (!principlesByCategory[category]) principlesByCategory[category] = [];
          principlesByCategory[category].push({
            name: principleId,
            ...parsedYaml,
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to read principles from ${categoryPath}: ${error}`);
    }
  }

  if (Object.keys(principlesByCategory).length === 0) return "";

  // Add principle-aware section header with agent-specific context
  let yamlSection = `## Principle-Aware Guidance

This agent has been configured with relevant software engineering principles to provide 
context-aware guidance and decision support.

### How to Use Principles

1. **Contextual Application**: Apply principles based on the specific situation
2. **Trade-off Analysis**: Help users understand when principles conflict
3. **Practical Examples**: Provide concrete examples from the current context
4. **Educational Approach**: Explain why a principle matters in this case

<!-- AUTO-GENERATED from docs/principles/ - Do not edit manually -->

\`\`\`yaml
principles:`;

  for (const [category, categoryPrinciples] of Object.entries(principlesByCategory)) {
    yamlSection += `\n  ${category}:`;
    for (const principle of categoryPrinciples) {
      yamlSection += `\n    ${principle.name}:`;
      if (principle.summary) {
        yamlSection += `\n      summary: ${JSON.stringify(principle.summary, null, 6).replace(/^/gm, "      ")}`;
      }
      if (principle.guidance) {
        yamlSection += `\n      guidance: ${JSON.stringify(principle.guidance, null, 6).replace(/^/gm, "      ")}`;
      }
      if (principle.application_context) {
        yamlSection += `\n      application_context: ${
          JSON.stringify(principle.application_context, null, 6).replace(/^/gm, "      ")
        }`;
      }
    }
  }

  yamlSection += `\n\`\`\``;

  // Add agent-specific principle application notes
  yamlSection += `\n\n### Agent-Specific Application Notes\n\n`;

  switch (agentType) {
    case "orchestrator":
      yamlSection += `As the orchestrator, use principles to:
- Guide task decomposition and routing decisions
- Identify which specialists need principle context
- Ensure principle compliance across the workflow
- Detect when principle guidance is needed`;
      break;

    case "security-reviewer":
      yamlSection += `As the security reviewer, apply principles to:
- Enforce defensive programming practices
- Validate fail-fast implementations
- Ensure privacy-by-design compliance
- Guide secure coding practices`;
      break;

    case "code-explorer":
      yamlSection += `As the code explorer, use principles to:
- Identify principle violations in existing code
- Recognize architectural patterns
- Detect code smells and anti-patterns
- Suggest principle-based improvements`;
      break;

    case "methodology-coach":
      yamlSection += `As the methodology coach, leverage principles to:
- Align team practices with principles
- Guide process improvements
- Resolve methodology-principle conflicts
- Foster principle-driven culture`;
      break;

    case "documenter":
      yamlSection += `As the documenter, apply principles to:
- Ensure documentation follows DRY principle
- Create accessible, inclusive content
- Design user-centered documentation
- Maintain principle-based examples`;
      break;

    case "api-architect":
      yamlSection += `As the API architect, use principles to:
- Design SOLID-compliant interfaces
- Apply separation of concerns
- Ensure robustness principle in APIs
- Guide RESTful design decisions`;
      break;

    case "principle-coach":
      yamlSection += `As the principle coach, your role is to:
- Provide deep principle understanding
- Guide contextual application
- Resolve principle conflicts
- Foster principle-based thinking`;
      break;
  }

  return yamlSection;
}

/**
 * Find the category for a given standard
 */
async function findStandardCategory(standard: string): Promise<string | null> {
  const homePath = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
  const standardsBase = join(homePath, ".claude", "aichaku", "docs", "standards");
  const categories = ["security", "development", "testing", "architecture", "documentation", "devops"];

  for (const category of categories) {
    const standardPath = join(standardsBase, category, `${standard}.md`);
    if (await exists(standardPath)) {
      return category;
    }
  }

  return null;
}
