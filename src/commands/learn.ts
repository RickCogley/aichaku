/**
 * Learn command for displaying methodology and standards information
 * Dynamically pulls content from YAML and markdown files
 */

import { parse as parseYaml } from "jsr:@std/yaml@1";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { type ContentMetadata, discoverContent } from "../utils/dynamic-content-discovery.ts";
import { safeReadTextFile } from "../utils/path-security.ts";
import { Brand } from "../utils/branded-messages.ts";
import { getAichakuPaths } from "../paths.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";

interface LearnOptions {
  topic?: string;
  list?: boolean;
  all?: boolean;
  methodologies?: boolean;
  standards?: boolean;
  principles?: boolean;
  category?: string;
  principleCategory?: string;
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

interface PrincipleYaml {
  name: string;
  category: string;
  description: string;
  summary: {
    tagline?: string;
    core_tenets?: Array<{
      text: string;
      guidance: string;
    }>;
    anti_patterns?: Array<{
      pattern: string;
      instead: string;
    }>;
  };
  application_context?: {
    when_to_use?: string[];
    [key: string]: unknown;
  };
  compatibility?: {
    works_well_with?: string[];
    potential_conflicts?: string[];
  };
  [key: string]: unknown;
}

/**
 * Display methodology and standards information dynamically from YAML
 */
export async function learn(options: LearnOptions = {}): Promise<LearnResult> {
  try {
    const paths = getAichakuPaths();

    // Always use global path for reading methodology/standards content
    const basePath = paths.global.root;

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

    // List principles
    if (options.principles) {
      return await listPrinciples(basePath);
    }

    // List by category
    if (options.category) {
      return await listByCategory(basePath, options.category);
    }

    // List principles by category
    if (options.principleCategory) {
      return await listPrinciplesByCategory(basePath, options.principleCategory);
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
      message: `Learn command failed: ${error instanceof Error ? error.message : String(error)}`,
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

  // Try to find in principles
  const principlePath = await findPrinciple(basePath, normalized);
  if (principlePath) {
    return await showPrincipleHelp(principlePath);
  }

  return {
    success: false,
    message: `Unknown topic: ${topic}. Use 'aichaku learn --all' to see available options.`,
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
    const dirName = pathParts[pathParts.length - 2]?.toLowerCase().replace(/[\s-_]/g, "") ||
      "";
    const fileName = pathParts[pathParts.length - 1]?.replace(".yaml", "").toLowerCase()
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
    "testpyramid": "test-pyramid",
    "cleanarchitecture": "clean-arch",
    "cleanarch": "clean-arch",
    "googlestyle": "google-style",
  };

  const standardName = directMatches[normalized] || normalized;

  // Try to discover all standards and find a match
  const discovered = await discoverContent("standards", basePath, true);

  // Build flat list to support numeric lookup
  const allStandards: Array<{ item: ContentMetadata; path: string }> = [];
  for (const items of Object.values(discovered.categories)) {
    for (const item of items) {
      allStandards.push({ item, path: item.path });
    }
  }

  // Check by number (1-based index)
  const num = parseInt(normalized);
  if (!isNaN(num) && num >= 1 && num <= allStandards.length) {
    const { path } = allStandards[num - 1];
    return join(basePath, "docs", "standards", path);
  }

  // Check by name match
  for (const { item, path } of allStandards) {
    // Check if the standard name matches
    const itemName = item.name.toLowerCase().replace(/[\s-_]/g, "");
    const fileName = path.split("/").pop()?.replace(".yaml", "").toLowerCase().replace(
      /[\s-_]/g,
      "",
    ) || "";

    if (itemName === standardName || fileName === standardName) {
      return join(basePath, "docs", "standards", path);
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
        helpContent += `\n💡 Quick Start with Claude Code\n${sections.quickStart}\n`;
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
        helpContent += `\n💻 Implementation Examples\n${sections.implementation}\n`;
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
    let code = "";

    try {
      const yamlContent = await Deno.readTextFile(yamlPath);
      const data = parseYaml(yamlContent) as MethodologyYaml;
      icon = data.display?.icon || icon;
      name = data.name || name;
      description = data.display?.description ||
        data.summary?.key_concepts?.[0] || description;

      // Extract code from the path or name
      const pathParts = item.path.split("/");
      const dirName = pathParts[pathParts.length - 2];
      code = dirName || name.toLowerCase().replace(/\s+/g, "-");
    } catch {
      // Fallback code extraction
      const pathParts = item.path.split("/");
      const dirName = pathParts[pathParts.length - 2];
      code = dirName || name.toLowerCase().replace(/\s+/g, "-");
    }

    content += `  ${index}. ${icon} ${name} (${code})`.padEnd(35) + ` - ${description}\n`;
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

  // Build a flat list with indices for easy reference
  const allStandards: Array<{ item: ContentMetadata; category: string; code: string }> = [];

  for (const [category, items] of Object.entries(discovered.categories)) {
    for (const item of items) {
      const code = item.path.split("/").pop()?.replace(".md", "") || "";
      allStandards.push({ item, category, code });
    }
  }

  // Display by category with global numbering
  let index = 1;
  let currentCategory = "";

  for (const { item, category, code } of allStandards) {
    if (category !== currentCategory) {
      if (currentCategory) content += "\n";
      content += `${category.toUpperCase()}\n`;
      content += `${"─".repeat(category.length + 10)}\n`;
      currentCategory = category;
    }

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
    content += `  ${index}. ${icon} ${standardName} (${code})`.padEnd(40) + ` - ${item.description}\n`;
    index++;
  }

  content += `\n📝 Get help using:\n`;
  content += `  • Number: aichaku learn 1\n`;
  content += `  • Name: aichaku learn "test pyramid"\n`;
  content += `  • Code: aichaku learn test-pyramid\n`;
  content += `\n✨ Use standards to guide Claude Code's development approach!`;

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

`;

  let index = 1;
  for (const item of discovered.items) {
    const yamlPath = join(basePath, "docs", "methodologies", item.path);

    try {
      const yamlContent = await Deno.readTextFile(yamlPath);
      const data = parseYaml(yamlContent) as MethodologyYaml;

      const name = data.name || item.name;
      const cadence = data.summary?.cycle_length || "Varies";
      const bestFor = data.summary?.best_for || "General use";
      const keyPractice = data.summary?.key_concepts?.[0] || "See details";

      content += `${index}. ${name}\n`;
      content += `   📅 Cadence: ${cadence}\n`;
      content += `   ✅ Best for: ${bestFor}\n`;
      content += `   🎯 Key practice: ${keyPractice}\n\n`;

      index++;
    } catch (error) {
      // Log the error for debugging
      console.error(`Failed to read YAML for ${item.name}:`, error);

      content += `${index}. ${item.name}\n`;
      content += `   📅 Cadence: Varies\n`;
      content += `   ✅ Best for: General use\n`;
      content += `   🎯 Key practice: See details\n\n`;

      index++;
    }
  }

  content += `💡 Get detailed info: aichaku learn <methodology-name or number>`;

  return {
    success: true,
    content,
  };
}

async function listAllResources(basePath: string): Promise<LearnResult> {
  const methodologies = await discoverContent("methodologies", basePath, true);
  const standards = await discoverContent("standards", basePath, true);

  // Discover principles manually since discoverContent doesn't handle them yet
  const devPath = join(Deno.cwd(), "docs", "principles");
  const globalPath = join(basePath, "docs", "principles");
  const principlesPath = await exists(devPath) ? devPath : globalPath;
  const principleCategories = {
    "software-development": [],
    "organizational": [],
    "engineering": [],
    "human-centered": [],
  };
  let principleCount = 0;

  for (const category of Object.keys(principleCategories)) {
    const categoryPath = join(principlesPath, category);
    if (await exists(categoryPath)) {
      try {
        for await (const entry of Deno.readDir(categoryPath)) {
          if (entry.isFile && entry.name.endsWith(".yaml")) {
            principleCount++;
          }
        }
      } catch {
        // Skip if error
      }
    }
  }

  let content = `${Brand.PREFIX} Complete Knowledge Base
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Development Methodologies (${methodologies.count})
`;

  let index = 1;
  for (const item of methodologies.items) {
    const code = item.path.split("/")[0]; // Get directory name as code
    content += `  ${index}. ${item.name} (${code})`.padEnd(35) + ` - ${item.description}\n`;
    index++;
  }

  content += `\n🛡️ Standards & Best Practices (${standards.count})\n`;

  // Continue numbering for standards
  for (const [category, items] of Object.entries(standards.categories)) {
    if (items.length > 0) {
      content += `\n${category.toUpperCase()}\n`;
      for (const item of items) {
        const code = item.path.split("/").pop()?.replace(".md", "") || "";
        content += `  ${index}. ${item.name} (${code})`.padEnd(35) + ` - ${item.description}\n`;
        index++;
      }
    }
  }

  content += `\n🎯 Development Principles (${principleCount})\n`;
  content += `\nUse 'aichaku learn --principles' to see all principles\n`;

  content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
📖 Learn More:
  • By number: aichaku learn 1
  • By name: aichaku learn "shape up" or aichaku learn "test pyramid" 
  • By code: aichaku learn shape-up or aichaku learn test-pyramid
  • Compare: aichaku learn --compare
  
✨ Dynamic content loaded from YAML configuration files!`;

  return {
    success: true,
    content,
  };
}

function showDefaultHelp(): LearnResult {
  const helpContent = `# ${Brand.helpIntro()}

Learn about methodologies and development standards to improve your workflow with Claude Code.

## 📚 Development Methodologies

aichaku learn shape-up          # Learn about Shape Up
aichaku learn scrum             # Learn about Scrum
aichaku learn --methodologies   # See all methodologies
aichaku learn --compare         # Compare methodologies

## 🛡️ Standards & Best Practices

aichaku learn owasp-web         # Learn OWASP Top 10
aichaku learn tdd               # Learn Test-Driven Development
aichaku learn --standards       # See all standards
aichaku learn --category security  # Security standards

## 🎯 Development Principles

aichaku learn dry               # Learn DRY principle
aichaku learn unix-philosophy   # Learn Unix Philosophy
aichaku learn --principles      # See all principles
aichaku learn --principle-category human-centered  # Human-centered principles

## 📋 Browse Everything

aichaku learn --all             # List all resources

## 💡 How It Works with Claude Code

- Say **"let's shape a feature"** → Activates Shape Up mode
- Say **"check for OWASP issues"** → Reviews security risks  
- Say **"help me TDD this"** → Guides test-first approach

✨ All content dynamically loaded from YAML configurations!

---

📍 **Looking for CLI commands?**  
Run \`aichaku --help\` to see all available commands

📖 **Docs:** https://github.com/RickCogley/aichaku
`;

  printFormatted(helpContent);

  return {
    success: true,
    content: "", // Content already printed
  };
}

async function findPrinciple(
  basePath: string,
  normalized: string,
): Promise<string | null> {
  // For development, use current directory if principles exist locally
  const devPath = join(Deno.cwd(), "docs", "principles");
  const globalPath = join(basePath, "docs", "principles");
  const principlesPath = await exists(devPath) ? devPath : globalPath;

  // Try direct name matches with common variations
  const categories = ["software-development", "organizational", "engineering", "human-centered"];

  for (const category of categories) {
    // Try variations of the name
    const variations = [
      normalized,
      normalized.replace(/principle$/, ""),
      normalized + "-principle",
      normalized.replace("dont", "do-not"),
      normalized.replace("donot", "do-not"),
    ];

    for (const variant of variations) {
      const yamlPath = join(principlesPath, category, `${variant}.yaml`);
      if (await exists(yamlPath)) {
        return yamlPath;
      }
    }
  }

  // Special mappings
  const mappings: Record<string, string> = {
    "dry": "software-development/dry",
    "dontrepeatyourself": "software-development/dry",
    "kiss": "software-development/kiss",
    "keepitsimple": "software-development/kiss",
    "yagni": "software-development/yagni",
    "youarentgonnaneedit": "software-development/yagni",
    "solid": "software-development/solid",
    "unix": "software-development/unix-philosophy",
    "unixphilosophy": "software-development/unix-philosophy",
    "soc": "software-development/separation-of-concerns",
    "separationofconcerns": "software-development/separation-of-concerns",
    "failfast": "engineering/fail-fast",
    "defensive": "engineering/defensive-programming",
    "defensiveprogramming": "engineering/defensive-programming",
    "robustness": "engineering/robustness-principle",
    "premature": "engineering/premature-optimization",
    "prematureoptimization": "engineering/premature-optimization",
    "agile": "organizational/agile-manifesto",
    "agilemanifesto": "organizational/agile-manifesto",
    "lean": "organizational/lean-principles",
    "leanprinciples": "organizational/lean-principles",
    "conway": "organizational/conways-law",
    "conwayslaw": "organizational/conways-law",
    "accessibility": "human-centered/accessibility-first",
    "accessibilityfirst": "human-centered/accessibility-first",
    "privacy": "human-centered/privacy-by-design",
    "privacybydesign": "human-centered/privacy-by-design",
    "usercentered": "human-centered/user-centered-design",
    "ucd": "human-centered/user-centered-design",
    "inclusive": "human-centered/inclusive-design",
    "inclusivedesign": "human-centered/inclusive-design",
    "ethical": "human-centered/ethical-design",
    "ethicaldesign": "human-centered/ethical-design",
  };

  if (mappings[normalized]) {
    const yamlPath = join(principlesPath, `${mappings[normalized]}.yaml`);
    if (await exists(yamlPath)) {
      return yamlPath;
    }
  }

  return null;
}

async function showPrincipleHelp(yamlPath: string): Promise<LearnResult> {
  try {
    const content = await safeReadTextFile(yamlPath, yamlPath);
    const data = parseYaml(content) as PrincipleYaml;
    const mdPath = yamlPath.replace(".yaml", ".md");

    let helpContent = `🎯 ${data.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

${data.summary.tagline || data.description}

`;

    if (data.summary.core_tenets && data.summary.core_tenets.length > 0) {
      helpContent += `📌 Core Tenets\n`;
      for (const tenet of data.summary.core_tenets) {
        helpContent += `\n• ${tenet.text}\n  ${tenet.guidance}\n`;
      }
      helpContent += `\n`;
    }

    if (data.summary.anti_patterns && data.summary.anti_patterns.length > 0) {
      helpContent += `⚠️ Anti-Patterns to Avoid\n`;
      for (const ap of data.summary.anti_patterns) {
        helpContent += `\n• ${ap.pattern}\n  → Instead: ${ap.instead}\n`;
      }
      helpContent += `\n`;
    }

    // Read examples from markdown
    if (await exists(mdPath)) {
      const mdContent = await safeReadTextFile(mdPath, mdPath);
      const sections = extractMarkdownSections(mdContent);

      if (sections.examples || sections.practicalExamples) {
        helpContent += `\n💡 Practical Examples\n${sections.examples || sections.practicalExamples}\n`;
      }

      if (sections.withClaude || sections.claudeCode) {
        helpContent += `\n🤖 With Claude Code\n${sections.withClaude || sections.claudeCode}\n`;
      }
    }

    if (data.compatibility) {
      if (data.compatibility.works_well_with && data.compatibility.works_well_with.length > 0) {
        helpContent += `\n✅ Works Well With\n`;
        for (const item of data.compatibility.works_well_with) {
          helpContent += `  • ${item}\n`;
        }
      }

      if (data.compatibility.potential_conflicts && data.compatibility.potential_conflicts.length > 0) {
        helpContent += `\n⚡ Potential Conflicts\n`;
        for (const item of data.compatibility.potential_conflicts) {
          helpContent += `  • ${item}\n`;
        }
      }
    }

    return {
      success: true,
      content: helpContent,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to load principle help: ${error}`,
    };
  }
}

async function listPrinciples(basePath: string): Promise<LearnResult> {
  // For development, use current directory if principles exist locally
  const devPath = join(Deno.cwd(), "docs", "principles");
  const globalPath = join(basePath, "docs", "principles");
  const principlesPath = await exists(devPath) ? devPath : globalPath;
  const categories = {
    "software-development": { name: "Software Development", items: [] as ContentMetadata[] },
    "organizational": { name: "Organizational", items: [] as ContentMetadata[] },
    "engineering": { name: "Engineering", items: [] as ContentMetadata[] },
    "human-centered": { name: "Human-Centered", items: [] as ContentMetadata[] },
  };

  let totalCount = 0;

  // Discover principles in each category
  for (const [_catKey, catInfo] of Object.entries(categories)) {
    const categoryPath = join(principlesPath, _catKey);
    if (await exists(categoryPath)) {
      try {
        for await (const entry of Deno.readDir(categoryPath)) {
          if (entry.isFile && entry.name.endsWith(".yaml")) {
            const yamlPath = join(categoryPath, entry.name);
            const content = await safeReadTextFile(yamlPath, yamlPath);
            const data = parseYaml(content) as PrincipleYaml;

            catInfo.items.push({
              name: data.name,
              description: data.summary.tagline || data.description,
              path: `${_catKey}/${entry.name}`,
              tags: [],
            });
            totalCount++;
          }
        }
      } catch {
        // Skip category if error
      }
    }
  }

  let content = `${Brand.PREFIX} Development Principles (${totalCount})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  let index = 1;
  for (const [_catKey, catInfo] of Object.entries(categories)) {
    if (catInfo.items.length > 0) {
      content += `🎯 ${catInfo.name}\n`;
      for (const item of catInfo.items) {
        const code = item.path.split("/").pop()?.replace(".yaml", "") || "";
        content += `  ${index}. ${item.name} (${code})`.padEnd(40) + ` - ${item.description}\n`;
        index++;
      }
      content += `\n`;
    }
  }

  content += `📚 Learn More
  • Use 'aichaku learn <principle>' for detailed information
  • Use 'aichaku principles --select <ids>' to choose for your project
  • Selected principles guide AI suggestions and code reviews
`;

  printFormatted(content);

  return {
    success: true,
    content: "",
  };
}

async function listPrinciplesByCategory(
  basePath: string,
  category: string,
): Promise<LearnResult> {
  const validCategories = ["software-development", "organizational", "engineering", "human-centered"];
  const normalized = category.toLowerCase().replace(/[\s_]/g, "-");

  if (!validCategories.includes(normalized)) {
    return {
      success: false,
      message: `Invalid category: ${category}. Valid categories: ${validCategories.join(", ")}`,
    };
  }

  // For development, use current directory if principles exist locally
  const devPath = join(Deno.cwd(), "docs", "principles");
  const globalPath = join(basePath, "docs", "principles");
  const basePrinciplesPath = await exists(devPath) ? devPath : globalPath;
  const principlesPath = join(basePrinciplesPath, normalized);
  const items: ContentMetadata[] = [];

  if (await exists(principlesPath)) {
    try {
      for await (const entry of Deno.readDir(principlesPath)) {
        if (entry.isFile && entry.name.endsWith(".yaml")) {
          const yamlPath = join(principlesPath, entry.name);
          const content = await safeReadTextFile(yamlPath, yamlPath);
          const data = parseYaml(content) as PrincipleYaml;

          items.push({
            name: data.name,
            description: data.summary.tagline || data.description,
            path: entry.name,
            tags: [],
          });
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to list principles: ${error}`,
      };
    }
  }

  const categoryName = normalized.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  let content = `${Brand.PREFIX} ${categoryName} Principles (${items.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  let index = 1;
  for (const item of items) {
    const code = item.path.replace(".yaml", "");
    content += `${index}. ${item.name} (${code})`.padEnd(40) + ` - ${item.description}\n`;
    index++;
  }

  content += `
📚 Learn More
  • Use 'aichaku learn <principle>' for detailed information
  • Use 'aichaku principles --select <ids>' to choose for your project
`;

  printFormatted(content);

  return {
    success: true,
    content: "",
  };
}
