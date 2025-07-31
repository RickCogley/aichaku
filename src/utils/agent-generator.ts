/**
 * Agent Generator Utility - Focused Context Injection
 *
 * Generates methodology-aware Claude Code agents with focused context
 * based on agent-specific requirements defined in templates.
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { parse as parseYaml } from "jsr:@std/yaml@1";
import { safeReadTextFile } from "./path-security.ts";

interface AgentGenerationOptions {
  selectedMethodologies: string[];
  selectedStandards: string[];
  selectedPrinciples: string[];
  selectedAgents: string[]; // New: which optional agents are selected
  outputPath: string;
  agentPrefix: string;
}

interface AgentGenerationResult {
  success: boolean;
  generated: number;
  skipped: number;
  errors: string[];
}

interface ContextRequirements {
  standards?: string[];
  standardsRequired?: string[];
  standardsDefaults?: string[];
  standardsConflicts?: Array<{
    group: string;
    exclusive: string[];
    strategy: string;
    message: string;
  }>;
  methodologies?: string[];
  methodologiesRequired?: string[];
  methodologiesDefaults?: string[];
  principles?: string[];
  principlesRequired?: string[];
  principlesDefaults?: string[];
}

interface ConflictDefinition {
  group: string;
  exclusive: string[];
  strategy: string;
  message: string;
}

interface ParsedTemplate {
  yaml: {
    name: string;
    type: "default" | "optional";
    description: string;
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
  };
  content: string;
  contextRequirements: ContextRequirements;
}

// Default agents that are always included
const DEFAULT_AGENTS = [
  "orchestrator",
  "api-architect",
  "security-reviewer",
  "test-expert",
  "documenter",
  "code-explorer",
  "methodology-coach",
  "principle-coach",
];

/**
 * Generate methodology-aware agents with focused context injection
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

    // Determine which agents to generate (default + selected optional)
    const agentsToGenerate = [
      ...DEFAULT_AGENTS,
      ...options.selectedAgents.filter((agent) => !DEFAULT_AGENTS.includes(agent)),
    ];

    for (const agentType of agentsToGenerate) {
      try {
        const template = await loadAgentTemplate(agentType);
        if (!template) {
          result.errors.push(`Template not found for ${agentType}`);
          result.skipped++;
          continue;
        }

        const agentContent = generateAgentWithFocusedContext(
          agentType,
          template,
          options,
        );

        const agentPath = join(options.outputPath, `${options.agentPrefix}${agentType}.md`);
        await Deno.writeTextFile(agentPath, agentContent);
        result.generated++;
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
 * Load and parse agent template with context requirements
 */
async function loadAgentTemplate(agentType: string): Promise<ParsedTemplate | null> {
  const homePath = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
  const templateBase = join(homePath, ".claude", "aichaku", "docs", "core", "agent-templates");
  const agentBasePath = join(templateBase, agentType, "base.md");

  if (!(await exists(agentBasePath))) {
    return null;
  }

  const content = await safeReadTextFile(agentBasePath, templateBase);
  return parseAgentTemplate(content);
}

/**
 * Parse agent template including context requirements
 */
function parseAgentTemplate(template: string): ParsedTemplate {
  const lines = template.split("\n");
  let yamlEndIndex = -1;

  // Extract YAML frontmatter
  if (lines[0] === "---") {
    yamlEndIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  }

  interface AgentYaml {
    name: string;
    type: "default" | "optional";
    description: string;
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
  }

  let yaml: AgentYaml = {
    name: "Unknown Agent",
    type: "default",
    description: "Generated agent",
    tools: ["*"],
  };

  if (yamlEndIndex > 0) {
    const yamlContent = lines.slice(1, yamlEndIndex).join("\n");
    try {
      const parsedYaml = parseYaml(yamlContent);
      if (parsedYaml && typeof parsedYaml === "object") {
        yaml = parsedYaml as AgentYaml;
      }
    } catch (e) {
      console.warn("Failed to parse YAML frontmatter:", e);
    }
  }

  // Extract content after frontmatter
  const contentStartIndex = yamlEndIndex > 0 ? yamlEndIndex + 1 : 0;
  const contentLines = lines.slice(contentStartIndex);

  // Parse context requirements from content
  const contextRequirements = parseContextRequirements(contentLines);

  return {
    yaml,
    content: contentLines.join("\n"),
    contextRequirements,
  };
}

/**
 * Parse context requirements from template content
 */
function parseContextRequirements(lines: string[]): ContextRequirements {
  const requirements: ContextRequirements = {};
  let inContextSection = false;
  let currentSubsection = "";
  let collectingList = false;
  let currentList: string[] = [];
  let currentConflict: Partial<ConflictDefinition> | null = null;
  let conflicts: ConflictDefinition[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for Context Requirements section
    if (trimmed === "## Context Requirements") {
      inContextSection = true;
      continue;
    }

    // Exit context section on next major section
    if (inContextSection && trimmed.startsWith("## ") && !trimmed.includes("Context Requirements")) {
      inContextSection = false;
      break;
    }

    if (!inContextSection) continue;

    // Handle subsections
    if (trimmed.startsWith("### ")) {
      // Save any pending list
      if (collectingList && currentList.length > 0) {
        saveList(requirements, currentSubsection, currentList);
        currentList = [];
      }
      // Save any pending conflicts
      if (currentSubsection === "Standards Conflicts" && conflicts.length > 0) {
        requirements.standardsConflicts = conflicts;
        conflicts = [];
      }

      currentSubsection = trimmed.substring(4);
      collectingList = false;
      continue;
    }

    // Handle list items
    if (trimmed.startsWith("- ")) {
      const item = trimmed.substring(2);

      // Check if it's a conflict definition
      if (currentSubsection === "Standards Conflicts") {
        if (item.startsWith("group:")) {
          // Start of a new conflict definition
          if (currentConflict && isCompleteConflict(currentConflict)) {
            conflicts.push(currentConflict);
          }
          currentConflict = parseConflictLine(item);
        }
      } else {
        // Regular list item
        collectingList = true;
        // Extract just the file name without comments
        const match = item.match(/^([^#\s]+)/);
        if (match) {
          currentList.push(match[1]);
        }
      }
    }

    // Handle conflict properties on continuation lines
    if (currentConflict && trimmed && !trimmed.startsWith("-")) {
      const conflictProps = parseConflictLine(trimmed);
      Object.assign(currentConflict, conflictProps);
    }
  }

  // Save any remaining data
  if (collectingList && currentList.length > 0) {
    saveList(requirements, currentSubsection, currentList);
  }
  if (currentConflict && isCompleteConflict(currentConflict)) {
    conflicts.push(currentConflict);
  }
  if (conflicts.length > 0) {
    requirements.standardsConflicts = conflicts;
  }

  return requirements;
}

/**
 * Check if a partial conflict definition is complete
 */
function isCompleteConflict(conflict: Partial<ConflictDefinition>): conflict is ConflictDefinition {
  return !!(conflict.group && conflict.exclusive && conflict.strategy && conflict.message);
}

/**
 * Parse a conflict definition line
 */
function parseConflictLine(line: string): Partial<ConflictDefinition> {
  const result: Partial<ConflictDefinition> = {};

  // Parse key-value pairs
  const pairs = line.match(/(\w+):\s*([^,]+)(?:,|$)/g);
  if (pairs) {
    for (const pair of pairs) {
      const [key, value] = pair.split(":").map((s) => s.trim().replace(/,$/, ""));
      if (key === "exclusive") {
        // Parse array value
        result.exclusive = value.replace(/[\[\]]/g, "").split(/\s+/);
      } else if (key === "group") {
        result.group = value.replace(/["']/g, "");
      } else if (key === "strategy") {
        result.strategy = value.replace(/["']/g, "");
      } else if (key === "message") {
        result.message = value.replace(/["']/g, "");
      }
    }
  }

  return result;
}

/**
 * Save a parsed list to the requirements object
 */
function saveList(requirements: ContextRequirements, subsection: string, list: string[]) {
  const mapping: Record<string, keyof ContextRequirements> = {
    "Standards": "standards",
    "Standards Required": "standardsRequired",
    "Standards Defaults": "standardsDefaults",
    "Methodologies": "methodologies",
    "Methodologies Required": "methodologiesRequired",
    "Methodologies Defaults": "methodologiesDefaults",
    "Principles": "principles",
    "Principles Required": "principlesRequired",
    "Principles Defaults": "principlesDefaults",
  };

  const key = mapping[subsection];
  if (key && key !== "standardsConflicts") {
    if (
      key === "standards" || key === "standardsRequired" || key === "standardsDefaults" ||
      key === "methodologies" || key === "methodologiesRequired" || key === "methodologiesDefaults" ||
      key === "principles" || key === "principlesRequired" || key === "principlesDefaults"
    ) {
      (requirements as ContextRequirements)[key] = [...list];
    }
  }
}

/**
 * Generate agent content with focused context
 */
function generateAgentWithFocusedContext(
  agentType: string,
  template: ParsedTemplate,
  options: AgentGenerationOptions,
): string {
  const { yaml, content, contextRequirements } = template;

  // Determine which standards to include
  const standardsToInclude = resolveContextItems(
    options.selectedStandards,
    contextRequirements.standards || [],
    contextRequirements.standardsRequired || [],
    contextRequirements.standardsDefaults || [],
    "standards",
  );

  // Determine which methodologies to include
  const methodologiesToInclude = resolveContextItems(
    options.selectedMethodologies,
    contextRequirements.methodologies || [],
    contextRequirements.methodologiesRequired || [],
    contextRequirements.methodologiesDefaults || [],
    "methodologies",
  );

  // Determine which principles to include
  const principlesToInclude = resolveContextItems(
    options.selectedPrinciples,
    contextRequirements.principles || [],
    contextRequirements.principlesRequired || [],
    contextRequirements.principlesDefaults || [],
    "principles",
  );

  // Generate context sections
  const standardsYaml = generateFocusedStandardsYaml(
    standardsToInclude,
    contextRequirements.standardsConflicts,
  );
  const methodologyYaml = generateFocusedMethodologyYaml(methodologiesToInclude);
  const principlesYaml = generateFocusedPrinciplesYaml(principlesToInclude, agentType);

  // Build final YAML frontmatter
  const yamlFrontmatter = {
    name: yaml.name.startsWith(options.agentPrefix) ? yaml.name : `${options.agentPrefix}${yaml.name}`,
    type: yaml.type || "default",
    description: yaml.description,
    color: getAgentColor(agentType),
    methodology_aware: true,
    ...(yaml.tools && JSON.stringify(yaml.tools) !== '["*"]' && { tools: yaml.tools }),
    ...(yaml.examples && { examples: yaml.examples }),
    ...(yaml.delegations && { delegations: yaml.delegations }),
  };

  // Format YAML
  const yamlString = formatYamlFrontmatter(yamlFrontmatter);

  // Combine all sections
  const contentSections = [
    content.trim(),
    standardsYaml,
    methodologyYaml,
    principlesYaml,
  ].filter(Boolean);

  return `---
${yamlString}
---

${contentSections.join("\n\n")}`;
}

/**
 * Resolve which items to include based on requirements and user selection
 */
function resolveContextItems(
  userSelected: string[],
  requested: string[],
  required: string[],
  defaults: string[],
  category: string,
): string[] {
  const included = new Set<string>();

  // 1. Always include required items
  for (const item of required) {
    included.add(item.replace(/\.yaml$/, ""));
  }

  // 2. Include requested items that user has selected
  for (const item of requested) {
    const itemId = item.replace(/\.yaml$/, "");
    // Handle wildcards
    if (item.includes("*")) {
      const pattern = item.replace("*", "");
      const matching = userSelected.filter((s) => s.includes(pattern.replace("/", "")));
      matching.forEach((m) => included.add(m));
    } else if (userSelected.includes(itemId)) {
      included.add(itemId);
    }
  }

  // 3. If no items in category selected by user, use defaults
  if (category === "standards") {
    const hasTestingStandards = userSelected.some((s) => s.includes("test"));
    if (!hasTestingStandards && defaults.length > 0) {
      for (const item of defaults) {
        included.add(item.replace(/\.yaml$/, ""));
      }
    }
  } else if (included.size === 0 && defaults.length > 0) {
    for (const item of defaults) {
      included.add(item.replace(/\.yaml$/, ""));
    }
  }

  return Array.from(included);
}

/**
 * Generate focused standards YAML section
 */
function generateFocusedStandardsYaml(
  standards: string[],
  conflicts?: Array<ConflictDefinition>,
): string {
  if (standards.length === 0) return "";

  let yamlSection = `## Selected Standards

<!-- AUTO-GENERATED - Focused context for this agent -->

\`\`\`yaml
standards:`;

  // Add selected standards
  for (const standard of standards) {
    yamlSection += `\n  - ${standard}`;
  }

  // Add conflict information if present
  if (conflicts && conflicts.length > 0) {
    yamlSection += `\n\nstandards_conflicts:`;
    for (const conflict of conflicts) {
      yamlSection += `\n  - group: ${conflict.group}`;
      yamlSection += `\n    exclusive: [${conflict.exclusive.join(", ")}]`;
      yamlSection += `\n    strategy: ${conflict.strategy}`;
      yamlSection += `\n    message: "${conflict.message}"`;
    }
  }

  yamlSection += `\n\`\`\``;
  return yamlSection;
}

/**
 * Generate focused methodology YAML section
 */
function generateFocusedMethodologyYaml(methodologies: string[]): string {
  if (methodologies.length === 0) return "";

  let yamlSection = `## Active Methodologies

<!-- AUTO-GENERATED - Focused context for this agent -->

\`\`\`yaml
methodologies:`;

  for (const methodology of methodologies) {
    yamlSection += `\n  - ${methodology}`;
  }

  yamlSection += `\n\`\`\``;
  return yamlSection;
}

/**
 * Generate focused principles YAML section
 */
function generateFocusedPrinciplesYaml(
  principles: string[],
  agentType: string,
): string {
  if (principles.length === 0) return "";

  let yamlSection = `## Relevant Principles

<!-- AUTO-GENERATED - Focused context for this agent -->

\`\`\`yaml
principles:`;

  for (const principle of principles) {
    yamlSection += `\n  - ${principle}`;
  }

  yamlSection += `\n\`\`\``;

  // Add agent-specific notes
  yamlSection += `\n\n### Agent-Specific Principle Application\n\n`;
  yamlSection += getAgentPrincipleNotes(agentType);

  return yamlSection;
}

/**
 * Get agent-specific principle application notes
 */
function getAgentPrincipleNotes(agentType: string): string {
  const notes: Record<string, string> = {
    "test-expert": `Apply these principles to:
- Design tests that fail fast and provide clear feedback
- Keep test code simple (KISS) and avoid over-engineering
- Follow YAGNI - only test what's actually needed
- Use defensive programming in test assertions`,

    "security-reviewer": `Use these principles for:
- Enforce defensive programming practices
- Apply fail-fast to security validations
- Ensure privacy-by-design in implementations
- Guide robustness in security controls`,

    "api-architect": `Apply principles to:
- Design SOLID-compliant API interfaces
- Ensure proper separation of concerns
- Follow robustness principle in API contracts
- Apply defensive programming to input validation`,
    // Add more as needed
  };

  return notes[agentType] || "Apply relevant principles based on context.";
}

/**
 * Format YAML frontmatter
 */
interface YamlFrontmatter {
  name: string;
  type?: string;
  description: string;
  color?: string;
  methodology_aware?: boolean;
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
}

function formatYamlFrontmatter(yaml: YamlFrontmatter): string {
  // Use the YAML library for proper formatting
  let yamlStr = "";

  // Add properties in specific order
  const orderedProps = ["name", "type", "description", "color", "methodology_aware", "tools"] as const;
  for (const prop of orderedProps) {
    const value = yaml[prop];
    if (value !== undefined) {
      if (typeof value === "string") {
        yamlStr += `${prop}: ${value}\n`;
      } else {
        yamlStr += `${prop}: ${JSON.stringify(value)}\n`;
      }
    }
  }

  // Add complex structures
  if (yaml.examples) {
    yamlStr += "examples:\n";
    for (const example of yaml.examples) {
      yamlStr += "  - context: " + example.context + "\n";
      yamlStr += '    user: "' + example.user + '"\n';
      yamlStr += '    assistant: "' + example.assistant + '"\n';
      yamlStr += "    commentary: " + example.commentary + "\n";
    }
  }

  if (yaml.delegations) {
    yamlStr += "delegations:\n";
    for (const delegation of yaml.delegations) {
      yamlStr += "  - trigger: " + delegation.trigger + "\n";
      yamlStr += '    target: "' + delegation.target + '"\n';
      yamlStr += '    handoff: "' + delegation.handoff + '"\n';
    }
  }

  return yamlStr.trim();
}

/**
 * Get agent color based on type
 */
function getAgentColor(agentType: string): string {
  const colors: Record<string, string> = {
    "orchestrator": "yellow",
    "security-reviewer": "red",
    "methodology-coach": "green",
    "documenter": "blue",
    "code-explorer": "magenta",
    "api-architect": "cyan",
    "principle-coach": "purple",
    "test-expert": "orange",
    // Add more as needed
  };
  return colors[agentType] || "white";
}
