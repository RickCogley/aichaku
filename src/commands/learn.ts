/**
 * Learn command for displaying methodology and standards information
 * Dynamically pulls content from YAML and markdown files
 */

import { parse as parseYaml } from "jsr:@std/yaml@1";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { discoverContent } from "../utils/dynamic-content-discovery.ts";
import { safeReadTextFile } from "../utils/path-security.ts";
import { Brand } from "../utils/branded-messages.ts";
import { getAichakuPaths } from "../paths.ts";

interface LearnOptions {
  topic?: string;
  list?: boolean;
  all?: boolean;
  methodologies?: boolean;
  standards?: boolean;
  category?: string;
  compare?: boolean;
  silent?: boolean;
}

interface LearnResult {
  success: boolean;
  message?: string;
  content?: string;
}

interface MethodologyYaml {
  name: string;
  summary: {
    key_concepts?: string[];
    cycle_length?: string;
    best_for?: string;
    not_ideal_for?: string;
    [key: string]: unknown;
  };
  display: {
    description?: string;
    phases?: string[];
    icon?: string;
    triggers?: string[];
    learn_more?: {
      docs?: string;
      local?: string;
    };
  };
  [key: string]: unknown;
}

interface StandardYaml {
  name: string;
  category: string;
  summary: {
    critical?: string;
    [key: string]: unknown;
  };
  display?: {
    description?: string;
    icon?: string;
    [key: string]: unknown;
  };
  rules?: unknown;
  [key: string]: unknown;
}

/**
 * Display methodology and standards information dynamically from YAML
 */
export async function learn(options: LearnOptions = {}): Promise<LearnResult> {
  try {
    const paths = getAichakuPaths();
    
    // Use development directory if running in development mode
    const isJSR = import.meta.url.startsWith("https://jsr.io") ||
      !import.meta.url.includes("/aichaku/");
    const basePath = isJSR ? paths.global.root : Deno.cwd();

    // List all resources
    if (options.all) {
      return await listAllResources(basePath);
    }

    // List methodologies
    if (options.list || options.methodologies) {
      return await listMethodologies(basePath);
    }

    // List standards
    if (options.standards) {
      return await listStandards(basePath);
    }

    // List by category
    if (options.category) {
      return await listByCategory(basePath, options.category);
    }

    // Compare methodologies
    if (options.compare) {
      return await compareMethodologies(basePath);
    }

    // Show specific topic help
    if (options.topic) {
      return await showTopicHelp(basePath, options.topic);
    }

    // Default help
    return showDefaultHelp();
  } catch (error) {
    return {
      success: false,
      message: `Learn command failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

async function showTopicHelp(
  basePath: string,
  topic: string,
): Promise<LearnResult> {
  // Normalize topic name
  const normalized = topic.toLowerCase().replace(/[\s-_]/g, "");

  // Try to find in methodologies
  const methodologyPath = await findMethodology(basePath, normalized);
  if (methodologyPath) {
    return await showMethodologyHelp(methodologyPath);
  }

  // Try to find in standards
  const standardPath = await findStandard(basePath, normalized);
  if (standardPath) {
    return await showStandardHelp(standardPath);
  }

  return {
    success: false,
    message:
      `Unknown topic: ${topic}. Use 'aichaku learn --all' to see available options.`,
  };
}

async function findMethodology(
  basePath: string,
  normalized: string,
): Promise<string | null> {
  const methodologiesPath = join(basePath, "docs", "methodologies");

  // Direct matches
  const directMatches: Record<string, string> = {
    "shapeup": "shape-up",
    "extremeprogramming": "xp",
    "extreme": "xp",
    "programming": "xp",
  };

  const methodologyName = directMatches[normalized] || normalized;

  // First, try a direct directory approach
  const possibleDirs = [
    methodologyName,
    methodologyName.replace("-", ""),
    methodologyName.replace("_", "-"),
  ];
  for (const dir of possibleDirs) {
    const yamlPath = join(methodologiesPath, dir, `${dir}.yaml`);
    if (await exists(yamlPath)) {
      return yamlPath;
    }
  }

  // Try to discover all methodologies and find a match
  const discovered = await discoverContent("methodologies", basePath, true);

  for (const item of discovered.items) {
    // Check if the methodology name matches
    const itemName = item.name.toLowerCase().replace(/[\s-_]/g, "");
    const pathParts = item.path.split("/");
    const dirName =
      pathParts[pathParts.length - 2]?.toLowerCase().replace(/[\s-_]/g, "") ||
      "";
    const fileName =
      pathParts[pathParts.length - 1]?.replace(".yaml", "").toLowerCase()
        .replace(/[\s-_]/g, "") || "";

    if (
      itemName === methodologyName || fileName === methodologyName ||
      dirName === methodologyName
    ) {
      return join(methodologiesPath, item.path);
    }
  }

  // Also check by number (1-based index)
  const num = parseInt(normalized);
  if (!isNaN(num) && num >= 1 && num <= discovered.items.length) {
    const item = discovered.items[num - 1];
    return join(methodologiesPath, item.path);
  }

  return null;
}

async function findStandard(
  basePath: string,
  normalized: string,
): Promise<string | null> {
  const standardsPath = join(basePath, "docs", "standards");

  // Direct matches
  const directMatches: Record<string, string> = {
    "owasp": "owasp-web",
    "owasptop10": "owasp-web",
    "12factor": "15-factor",
    "15factor": "15-factor",
    "testdrivendevelopment": "tdd",
    "nist": "nist-csf",
    "nistcyber": "nist-csf",
    "domaindriven": "ddd",
    "domaindrivendesign": "ddd",
  };

  const standardName = directMatches[normalized] || normalized;

  // Try to discover all standards and find a match
  const discovered = await discoverContent("standards", basePath, true);

  for (const item of discovered.items) {
    // Check if the standard name matches
    const itemName = item.name.toLowerCase().replace(/[\s-_]/g, "");
    const fileName =
      item.path.split("/").pop()?.replace(".yaml", "").toLowerCase().replace(
        /[\s-_]/g,
        "",
      ) || "";

    if (itemName === standardName || fileName === standardName) {
      return join(standardsPath, item.path);
    }
  }

  return null;
}

async function showMethodologyHelp(yamlPath: string): Promise<LearnResult> {
  try {
    // Read the YAML file directly with Deno (yamlPath is already absolute)
    const content = await Deno.readTextFile(yamlPath);
    const data = parseYaml(content) as MethodologyYaml;
    const mdPath = yamlPath.replace(".yaml", ".md");

    let helpContent = `${data.display?.icon || "📚"} ${data.name} Methodology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

${data.display?.description || "No description available"}

📊 Key Concepts
`;

    if (data.summary.key_concepts) {
      for (const concept of data.summary.key_concepts) {
        helpContent += `  • ${concept}\n`;
      }
    }

    if (data.summary.cycle_length) {
      helpContent += `\n⏱️  Cycle Length: ${data.summary.cycle_length}\n`;
    }

    if (data.display?.phases && data.display.phases.length > 0) {
      helpContent += `\n🔄 Phases\n`;
      helpContent += `  ${data.display.phases.join(" → ")}\n`;
    }

    if (data.summary.best_for) {
      helpContent += `\n✅ Best For\n  ${data.summary.best_for}\n`;
    }

    if (data.summary.not_ideal_for) {
      helpContent += `\n❌ Not Ideal For\n  ${data.summary.not_ideal_for}\n`;
    }

    // Read additional content from markdown if available
    if (await exists(mdPath)) {
      const mdContent = await Deno.readTextFile(mdPath);
      const sections = extractMarkdownSections(mdContent);

      if (sections.quickStart) {
        helpContent +=
          `\n💡 Quick Start with Claude Code\n${sections.quickStart}\n`;
      }

      if (sections.examples) {
        helpContent += `\n📋 Examples\n${sections.examples}\n`;
      }
    }

    if (data.display?.learn_more) {
      helpContent += `\n📚 Learn More\n`;
      if (data.display.learn_more.docs) {
        helpContent += `  • Documentation: ${data.display.learn_more.docs}\n`;
      }
      if (data.display.learn_more.local) {
        helpContent += `  • Local Guide: ${data.display.learn_more.local}\n`;
      }
    }

    return {
      success: true,
      content: helpContent,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to load methodology help: ${error}`,
    };
  }
}

async function showStandardHelp(yamlPath: string): Promise<LearnResult> {
  try {
    const content = await Deno.readTextFile(yamlPath);
    const data = parseYaml(content) as StandardYaml;
    const mdPath = yamlPath.replace(".yaml", ".md");

    let helpContent = `${data.display?.icon || "🛡️"} ${data.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

${data.display?.description || "No description available"}

`;

    if (data.summary.critical) {
      helpContent += `🎯 Critical Points\n${data.summary.critical}\n`;
    }

    // Add other summary fields dynamically
    for (const [key, value] of Object.entries(data.summary)) {
      if (key !== "critical" && typeof value === "string") {
        const displayKey = key.replace(/_/g, " ").replace(
          /\b\w/g,
          (l) => l.toUpperCase(),
        );
        helpContent += `\n${displayKey}: ${value}\n`;
      }
    }

    // Read additional content from markdown if available
    if (await exists(mdPath)) {
      const mdContent = await Deno.readTextFile(mdPath);
      const sections = extractMarkdownSections(mdContent);

      if (sections.implementation) {
        helpContent +=
          `\n💻 Implementation Examples\n${sections.implementation}\n`;
      }

      if (sections.withClaude) {
        helpContent += `\n🤖 With Claude Code\n${sections.withClaude}\n`;
      }
    }

    return {
      success: true,
      content: helpContent,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to load standard help: ${error}`,
    };
  }
}

function extractMarkdownSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Extract Quick Start section
  const quickStartMatch = content.match(
    /##\s*Quick Start.*?\n([\s\S]*?)(?=\n##|$)/i,
  );
  if (quickStartMatch) {
    sections.quickStart = quickStartMatch[1].trim();
  }

  // Extract Examples section
  const examplesMatch = content.match(/##\s*Examples?\n([\s\S]*?)(?=\n##|$)/i);
  if (examplesMatch) {
    sections.examples = examplesMatch[1].trim();
  }

  // Extract Implementation section
  const implementationMatch = content.match(
    /##\s*Implementation.*?\n([\s\S]*?)(?=\n##|$)/i,
  );
  if (implementationMatch) {
    sections.implementation = implementationMatch[1].trim();
  }

  // Extract With Claude section
  const withClaudeMatch = content.match(
    /##\s*(?:With Claude|Claude Code).*?\n([\s\S]*?)(?=\n##|$)/i,
  );
  if (withClaudeMatch) {
    sections.withClaude = withClaudeMatch[1].trim();
  }

  return sections;
}

async function listMethodologies(basePath: string): Promise<LearnResult> {
  const discovered = await discoverContent("methodologies", basePath, true);
  let content = `${Brand.PREFIX} Available Methodologies\n\n`;

  let index = 1;
  for (const item of discovered.items) {
    // The item already has the YAML path since we're discovering YAML files
    const yamlPath = join(basePath, "docs", "methodologies", item.path);
    let icon = "📚";
    let name = item.name;
    let description = item.description;

    try {
      const yamlContent = await Deno.readTextFile(yamlPath);
      const data = parseYaml(yamlContent) as MethodologyYaml;
      icon = data.display?.icon || icon;
      name = data.name || name;
      description = data.display?.description ||
        data.summary?.key_concepts?.[0] || description;
    } catch {
      // Ignore errors
    }

    content += `  ${index}. ${icon} ${name.padEnd(18)} - ${description}\n`;
    index++;
  }

  content += `\n📝 Get help using:\n`;
  content += `  • Number: aichaku learn 1\n`;
  content += `  • Name: aichaku learn "shape up"\n`;
  content += `  • Code: aichaku learn shape-up\n`;
  content += `\n✨ Natural language adapts methodologies to your workflow!`;

  return {
    success: true,
    content,
  };
}

async function listStandards(basePath: string): Promise<LearnResult> {
  const discovered = await discoverContent("standards", basePath, true);
  let content = `${Brand.PREFIX} Available Standards\n\n`;

  for (const [category, items] of Object.entries(discovered.categories)) {
    if (items.length === 0) continue;

    content += `${category.toUpperCase()}\n`;
    content += `${"─".repeat(category.length + 10)}\n`;

    for (const item of items) {
      // Try to read YAML for icon
      const yamlPath = join(
        basePath,
        "docs",
        "standards",
        item.path.replace(".md", ".yaml"),
      );
      let icon = "📋";

      if (await exists(yamlPath)) {
        try {
          const yamlContent = await safeReadTextFile(yamlPath, "");
          const data = parseYaml(yamlContent) as StandardYaml;
          icon = data.display?.icon || icon;
        } catch {
          // Ignore errors
        }
      }

      const standardName = item.name.replace(category + "/", "");
      content += `  ${icon} ${standardName.padEnd(20)} - ${item.description}\n`;
    }
    content += "\n";
  }

  content += `📝 Get help using: aichaku learn <standard-name>\n`;
  content += `✨ Use standards to guide Claude Code's development approach!`;

  return {
    success: true,
    content,
  };
}

async function listByCategory(
  basePath: string,
  category: string,
): Promise<LearnResult> {
  const discovered = await discoverContent("standards", basePath, true);
  const items = discovered.categories[category] || [];

  if (items.length === 0) {
    return {
      success: false,
      message: `No standards found in category: ${category}`,
    };
  }

  let content = `${Brand.PREFIX} ${category.toUpperCase()} Standards\n\n`;

  for (const item of items) {
    content += `  • ${item.name} - ${item.description}\n`;
  }

  return {
    success: true,
    content,
  };
}

async function compareMethodologies(basePath: string): Promise<LearnResult> {
  const discovered = await discoverContent("methodologies", basePath, true);

  let content = `${Brand.PREFIX} Methodology Comparison
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────┬──────────────────┬─────────────────┬──────────────────┐
│ Methodology     │ Cadence          │ Best For        │ Key Practice     │
├─────────────────┼──────────────────┼─────────────────┼──────────────────┤
`;

  for (const item of discovered.items) {
    const yamlPath = join(
      basePath,
      "docs",
      "methodologies",
      item.path.replace(".md", ".yaml"),
    );

    if (await exists(yamlPath)) {
      try {
        const yamlContent = await safeReadTextFile(yamlPath, "");
        const data = parseYaml(yamlContent) as MethodologyYaml;

        const name = (data.name || item.name).substring(0, 15).padEnd(15);
        const cadence = (data.summary.cycle_length || "Varies").substring(0, 16)
          .padEnd(16);
        const bestFor = (data.summary.best_for || "General").substring(0, 15)
          .padEnd(15);
        const keyPractice = (data.summary.key_concepts?.[0] || "").substring(
          0,
          16,
        ).padEnd(16);

        content += `│ ${name} │ ${cadence} │ ${bestFor} │ ${keyPractice} │\n`;
      } catch {
        // Skip on error
      }
    }
  }

  content +=
    `└─────────────────┴──────────────────┴─────────────────┴──────────────────┘`;

  return {
    success: true,
    content,
  };
}

async function listAllResources(basePath: string): Promise<LearnResult> {
  const methodologies = await discoverContent("methodologies", basePath, true);
  const standards = await discoverContent("standards", basePath, true);

  let content = `${Brand.PREFIX} Complete Knowledge Base
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Development Methodologies (${methodologies.count})
`;

  let index = 1;
  for (const item of methodologies.items) {
    content += `  ${index}. ${item.name.padEnd(18)} - ${item.description}\n`;
    index++;
  }

  content += `\n🛡️ Standards & Best Practices (${standards.count})\n`;

  for (const [category, items] of Object.entries(standards.categories)) {
    if (items.length > 0) {
      content += `\n${category.toUpperCase()}\n`;
      for (const item of items) {
        content += `  • ${item.name} - ${item.description}\n`;
      }
    }
  }

  content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
📖 Learn More:
  • Specific methodology: aichaku learn shape-up
  • Specific standard: aichaku learn owasp-web
  • Compare approaches: aichaku learn --compare
  
✨ Dynamic content loaded from YAML configuration files!`;

  return {
    success: true,
    content,
  };
}

function showDefaultHelp(): LearnResult {
  return {
    success: true,
    content: `${Brand.helpIntro()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Learn about methodologies and development standards to improve
your workflow with Claude Code.

📚 Development Methodologies
  aichaku learn shape-up       Learn about Shape Up
  aichaku learn scrum          Learn about Scrum
  aichaku learn --methodologies  See all methodologies
  aichaku learn --compare      Compare methodologies

🛡️ Standards & Best Practices
  aichaku learn owasp-web      Learn OWASP Top 10
  aichaku learn tdd            Learn Test-Driven Development
  aichaku learn --standards    See all standards
  aichaku learn --category security  Security standards

📋 Browse Everything
  aichaku learn --all          List all resources

💡 How It Works with Claude Code
  Say "let's shape a feature"    → Activates Shape Up mode
  Say "check for OWASP issues"   → Reviews security risks
  Say "help me TDD this"         → Guides test-first approach

✨ All content dynamically loaded from YAML configurations!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Looking for CLI commands?
   Run 'aichaku --help' to see all available commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Docs: https://github.com/RickCogley/aichaku`,
  };
}
