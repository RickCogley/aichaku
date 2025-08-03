/**
 * Integrate command with YAML configuration-as-code
 *
 * This replaces the hardcoded METHODOLOGY_SECTION with a system that reads
 * YAML files and assembles them into compact configuration blocks.
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { paths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { safeReadTextFile, safeStat } from "../utils/path-security.ts";
import { assembleYamlConfig } from "../utils/yaml-config-reader.ts";
import { discoverContent } from "../utils/dynamic-content-discovery.ts";
import { getAichakuPaths } from "../paths.ts";
import { generateMethodologyAwareAgents } from "../utils/agent-generator.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";

// Type definitions
interface ProjectStandardsConfig {
  version?: string;
  selected: string[];
}

interface AichakuConfig {
  version: string;
  installedAt: string;
  installationType: "global" | "local";
  lastUpgrade: string;
  methodologies?: {
    selected: string[];
    default?: string;
  };
  standards?: {
    version: string;
    selected: string[];
  };
  principles?: {
    selected: string[];
  };
  agents?: {
    selected: string[];
  };
}

interface IntegrateOptions {
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
  help?: boolean;
}

interface IntegrateResult {
  success: boolean;
  path: string;
  message?: string;
  action?: "created" | "updated" | "skipped";
  lineNumber?: number;
  agentsGenerated?: number;
  requiresRestart?: boolean;
}

// YAML block markers
const YAML_CONFIG_START = "```yaml";
const YAML_CONFIG_END = "```";
const AICHAKU_CONFIG_MARKER = "## Directives for Claude Code from Aichaku";

/**
 * Load selected methodologies from project or global configuration
 */
async function loadSelectedMethodologies(projectPath: string): Promise<string[]> {
  const aichakuPaths = paths.get();
  // Check project config first, then global
  const projectConfigPath = join(aichakuPaths.project.root, "aichaku.json");
  const globalConfigPath = join(aichakuPaths.global.root, ".aichaku.json");

  // Try project config first
  if (await exists(projectConfigPath)) {
    try {
      const content = await safeReadTextFile(projectConfigPath, projectPath);
      const config = JSON.parse(content) as AichakuConfig;

      if (config.methodologies?.selected && Array.isArray(config.methodologies.selected)) {
        return config.methodologies.selected.filter(
          (id: unknown) => typeof id === "string" && id.length > 0,
        );
      }
    } catch (_error) {
      console.warn("Failed to load methodologies from project aichaku.json");
    }
  }

  // Fall back to global config
  if (await exists(globalConfigPath)) {
    try {
      const content = await Deno.readTextFile(globalConfigPath);
      const config = JSON.parse(content);

      if (config.methodologies?.selected && Array.isArray(config.methodologies.selected)) {
        return config.methodologies.selected.filter(
          (id: unknown) => typeof id === "string" && id.length > 0,
        );
      }
    } catch (_error) {
      console.warn("Failed to load methodologies from global .aichaku.json");
    }
  }

  // Default to shape-up if nothing is configured
  return ["shape-up"];
}

/**
 * Load project standards configuration from unified aichaku.json
 */
async function loadProjectStandards(projectPath: string): Promise<string[]> {
  const aichakuPaths = paths.get();
  // Check unified config first, then legacy paths
  const unifiedConfigPath = join(aichakuPaths.project.root, "aichaku.json");
  const legacyStandardsPath = join(aichakuPaths.project.root, "standards.json");
  const legacyConfigPath = join(
    projectPath,
    ".claude",
    ".aichaku-standards.json",
  );

  // Try unified config first
  if (await exists(unifiedConfigPath)) {
    try {
      const content = await safeReadTextFile(unifiedConfigPath, projectPath);
      const config = JSON.parse(content) as AichakuConfig;

      if (
        config.standards?.selected && Array.isArray(config.standards.selected)
      ) {
        return config.standards.selected.filter(
          (id: unknown) => typeof id === "string" && id.length > 0,
        );
      }
    } catch (_error) {
      console.warn("Failed to load standards from unified aichaku.json");
    }
  }

  // Fall back to legacy separate standards.json
  let configPath = legacyStandardsPath;
  if (
    !(await exists(legacyStandardsPath)) && (await exists(legacyConfigPath))
  ) {
    configPath = legacyConfigPath;
  }

  if (!(await exists(configPath))) {
    return [];
  }

  try {
    // Security: Use safe file reading with validated path
    const content = await safeReadTextFile(configPath, projectPath);
    const config = JSON.parse(content) as ProjectStandardsConfig;

    // Validate and sanitize
    if (!Array.isArray(config.selected)) {
      console.warn("Invalid standards configuration: expected array");
      return [];
    }

    return config.selected.filter(
      (id: unknown) => typeof id === "string" && id.length > 0,
    );
  } catch (_error) {
    console.warn("Failed to load project standards configuration");
    return [];
  }
}

/**
 * Load project principles configuration from unified aichaku.json
 */
async function loadProjectPrinciples(projectPath: string): Promise<string[]> {
  const aichakuPaths = paths.get();
  const unifiedConfigPath = join(aichakuPaths.project.root, "aichaku.json");

  if (await exists(unifiedConfigPath)) {
    try {
      const content = await safeReadTextFile(unifiedConfigPath, projectPath);
      const config = JSON.parse(content) as AichakuConfig;

      if (
        config.principles?.selected && Array.isArray(config.principles.selected)
      ) {
        return config.principles.selected.filter(
          (id: unknown) => typeof id === "string" && id.length > 0,
        );
      }
    } catch (_error) {
      console.warn("Failed to load principles from unified aichaku.json");
    }
  }

  // Default to empty array if no principles are configured
  return [];
}

/**
 * Load project agents configuration from unified aichaku.json
 */
async function loadProjectAgents(projectPath: string): Promise<string[]> {
  const aichakuPaths = paths.get();
  const unifiedConfigPath = join(aichakuPaths.project.root, "aichaku.json");

  if (await exists(unifiedConfigPath)) {
    try {
      const content = await safeReadTextFile(unifiedConfigPath, projectPath);
      const config = JSON.parse(content) as AichakuConfig;

      if (
        config.agents?.selected && Array.isArray(config.agents.selected)
      ) {
        return config.agents.selected.filter(
          (id: unknown) => typeof id === "string" && id.length > 0,
        );
      }
    } catch (_error) {
      console.warn("Failed to load agents from unified aichaku.json");
    }
  }

  // Default to empty array - only default agents will be included
  return [];
}

/**
 * Separate development and documentation standards from unified list
 */
function separateStandardsByType(allStandards: string[]): {
  developmentStandards: string[];
  documentationStandards: string[];
} {
  const documentationStandards = allStandards.filter((std) =>
    std.includes("diataxis") || std.includes("documentation") ||
    std.includes("docs")
  );

  const developmentStandards = allStandards.filter((std) => !documentationStandards.includes(std));

  return { developmentStandards, documentationStandards };
}

/**
 * Create minimal CLAUDE.md with YAML configuration
 */
function createMinimalClaudeMd(yamlConfig: string): string {
  return `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this project.

${AICHAKU_CONFIG_MARKER}

This configuration is dynamically assembled from YAML files in your ~/.claude/aichaku installation.

${YAML_CONFIG_START}
${yamlConfig.trim()}
${YAML_CONFIG_END}

## Project Overview

[Add your project-specific information here]
`;
}

/**
 * Clean up old methodology quick reference sections
 */
function cleanupOldSections(content: string): string {
  // Remove old methodology quick reference section if it exists
  const oldMarker = "## Methodologies Quick Reference";
  const oldIndex = content.indexOf(oldMarker);

  if (oldIndex !== -1) {
    // Find the YAML block after this marker
    const afterOld = content.substring(oldIndex);
    const yamlStartIndex = afterOld.indexOf(YAML_CONFIG_START);
    const yamlEndIndex = afterOld.indexOf(
      YAML_CONFIG_END,
      yamlStartIndex + YAML_CONFIG_START.length,
    );

    if (yamlStartIndex !== -1 && yamlEndIndex !== -1) {
      // Remove the entire section including the marker and YAML block
      const before = content.substring(0, oldIndex);
      const after = content.substring(
        oldIndex + yamlEndIndex + YAML_CONFIG_END.length,
      );
      // Clean up extra newlines
      content = (before.trimEnd() + "\n\n" + after.trimStart()).trim() + "\n";
    }
  }

  return content;
}

/**
 * Update existing CLAUDE.md with new YAML configuration
 */
function updateClaudeMd(content: string, yamlConfig: string): string {
  // First clean up old sections
  content = cleanupOldSections(content);

  // Update Aichaku configuration section
  const configMarkerIndex = content.indexOf(AICHAKU_CONFIG_MARKER);
  if (configMarkerIndex !== -1) {
    const afterMarker = content.substring(configMarkerIndex);
    const yamlStartIndex = afterMarker.indexOf(YAML_CONFIG_START);
    const yamlEndIndex = afterMarker.indexOf(
      YAML_CONFIG_END,
      yamlStartIndex + YAML_CONFIG_START.length,
    );

    if (yamlStartIndex !== -1 && yamlEndIndex !== -1) {
      const before = content.substring(0, configMarkerIndex);
      const afterYamlEnd = content.substring(
        configMarkerIndex + yamlEndIndex + YAML_CONFIG_END.length,
      );
      return `${before}${AICHAKU_CONFIG_MARKER}

This configuration is dynamically assembled from YAML files in your ~/.claude/aichaku installation.

${YAML_CONFIG_START}
${yamlConfig.trim()}
${YAML_CONFIG_END}${afterYamlEnd}`;
    }
  }

  // If no configuration section exists, add both sections
  const insertPoint = content.indexOf("## Project Overview");
  if (insertPoint !== -1) {
    const before = content.substring(0, insertPoint);
    const after = content.substring(insertPoint);

    return `${before}${AICHAKU_CONFIG_MARKER}

This configuration is dynamically assembled from YAML files in your ~/.claude/aichaku installation.

${YAML_CONFIG_START}
${yamlConfig.trim()}
${YAML_CONFIG_END}

${after}`;
  }

  // Fallback: append at the end
  return `${content}

${AICHAKU_CONFIG_MARKER}

This configuration is dynamically assembled from YAML files in your ~/.claude/aichaku installation.

${YAML_CONFIG_START}
${yamlConfig.trim()}
${YAML_CONFIG_END}
`;
}

/**
 * Integrate Aichaku YAML configuration into project's CLAUDE.md
 */
export async function integrate(
  options: IntegrateOptions = {},
): Promise<IntegrateResult> {
  // Show help if requested
  if (options.help) {
    showIntegrateHelp();
    return {
      success: true,
      path: "",
      message: "Help displayed",
    };
  }
  const projectPath = resolveProjectPath(options.projectPath);
  const claudeMdPath = join(projectPath, "CLAUDE.md");
  const aichakuPaths = paths.get();

  // Get selected standards and methodologies
  const allSelectedStandards = await loadProjectStandards(projectPath);
  const {
    developmentStandards: selectedStandards,
  } = separateStandardsByType(allSelectedStandards);

  // Load selected methodologies from project or global config
  const selectedMethodologies = await loadSelectedMethodologies(projectPath);

  // Load selected principles from project config
  const selectedPrinciples = await loadProjectPrinciples(projectPath);

  // Load selected agents from project config
  const selectedAgents = await loadProjectAgents(projectPath);

  // Define configuration paths - use proper installation paths
  const configPaths = {
    core: join(aichakuPaths.global.root, "docs", "core"),
    methodologies: join(aichakuPaths.global.root, "methodologies"),
    standards: join(aichakuPaths.global.root, "standards"),
    principles: join(aichakuPaths.global.root, "principles"),
    user: aichakuPaths.global.user.root,
  };

  // Check for app description
  const appDescriptionPath = join(projectPath, ".claude", "aichaku", "user", "app-description.yaml");
  let appDescription = null;
  if (await exists(appDescriptionPath)) {
    try {
      const appDescContent = await safeReadTextFile(appDescriptionPath, projectPath);
      const { parse } = await import("jsr:@std/yaml@1");
      appDescription = parse(appDescContent) as { application: unknown };
    } catch (error) {
      if (!options.silent) {
        console.warn(`⚠️  Could not read app description: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Assemble YAML configuration
  const yamlConfig = await assembleYamlConfig({
    paths: configPaths,
    selectedMethodologies,
    selectedStandards,
    selectedDocStandards: [], // Explicitly exclude doc standards from CLAUDE.md
    selectedPrinciples,
    appDescription,
  });

  // Note: methodology quick reference is now included in the main yamlConfig

  if (options.dryRun) {
    const fileExists = await exists(claudeMdPath);
    console.log(
      `[DRY RUN] Would ${fileExists ? "update" : "create"} CLAUDE.md at: ${claudeMdPath}`,
    );
    console.log(`[DRY RUN] Would add YAML configuration with:`);
    console.log(
      `  - Core directives (behavioral, visual, file organization, diagrams)`,
    );
    console.log(`  - ${selectedMethodologies.length} methodologies`);
    if (selectedStandards.length > 0) {
      console.log(
        `  - ${selectedStandards.length} development standards`,
      );
    }
    if (selectedPrinciples.length > 0) {
      console.log(
        `  - ${selectedPrinciples.length} principles`,
      );
    }
    console.log(`  - Methodology-aware agents for code assistance`);
    return {
      success: true,
      path: claudeMdPath,
      message: "Dry run completed. No files were modified.",
      action: "skipped",
    };
  }

  try {
    let action: "created" | "updated";

    if (await exists(claudeMdPath)) {
      // Update existing file
      const content = await safeReadTextFile(claudeMdPath, projectPath);
      const updatedContent = updateClaudeMd(content, yamlConfig);
      await Deno.writeTextFile(claudeMdPath, updatedContent);
      action = "updated";
    } else {
      // Create new file
      const newContent = createMinimalClaudeMd(yamlConfig);
      await Deno.writeTextFile(claudeMdPath, newContent);
      action = "created";
    }

    // Find line number where configuration starts
    const fileContent = await safeReadTextFile(claudeMdPath, projectPath);
    const lines = fileContent.split("\n");
    let lineNumber = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(AICHAKU_CONFIG_MARKER)) {
        lineNumber = i + 1;
        break;
      }
    }

    // Get selected methodology from project config
    const aichakuPaths = paths.get();
    const projectConfigPath = join(aichakuPaths.project.root, "aichaku.json");
    let selectedMethodology = "";

    if (await exists(projectConfigPath)) {
      try {
        const configContent = await safeReadTextFile(projectConfigPath, projectPath);
        const config = JSON.parse(configContent);
        if (config.methodologies?.selected?.length > 0) {
          selectedMethodology = config.methodologies.selected[0];
        }
      } catch (_error) {
        console.warn("Failed to read project methodology from aichaku.json");
      }
    }

    // Generate methodology-aware agents with focused context
    const agentResult = await generateMethodologyAwareAgents({
      selectedMethodologies: selectedMethodology ? [selectedMethodology] : [],
      selectedStandards: allSelectedStandards,
      selectedPrinciples: selectedPrinciples,
      selectedAgents: selectedAgents,
      outputPath: join(Deno.cwd(), ".claude", "agents"),
      agentPrefix: "aichaku-",
    });

    const standardsMsg = selectedStandards.length > 0 ? ` with ${selectedStandards.length} development standards` : "";
    const principlesMsg = selectedPrinciples.length > 0 ? ` and ${selectedPrinciples.length} principles` : "";

    const agentsMsg = agentResult.generated > 0
      ? ` and ${agentResult.generated} custom agents for code assistance`
      : "";

    const restartMsg = agentResult.generated > 0
      ? "\n\n🔄 Restart Claude Code to load new agents: Press Ctrl+C and restart"
      : "";

    return {
      success: true,
      path: claudeMdPath,
      message: `${
        action === "created" ? "Created new" : "Updated"
      } CLAUDE.md with YAML configuration${standardsMsg}${principlesMsg}${agentsMsg}${restartMsg}`,
      action,
      lineNumber,
      agentsGenerated: agentResult.generated,
      requiresRestart: agentResult.generated > 0,
    };
  } catch (error) {
    return {
      success: false,
      path: claudeMdPath,
      message: `Failed to integrate: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Discover all available methodologies from global installation
 * Per spec: "all methodologies, selected standards" - methodologies should be auto-discovered globally
 */
async function _discoverAllMethodologies(): Promise<string[]> {
  try {
    const aichakuPaths = getAichakuPaths();
    const discovered = await discoverContent(
      "methodologies",
      aichakuPaths.global.root,
      true,
    );

    // Extract methodology names from discovered items
    const methodologies = discovered.items.map((item) => {
      // Extract methodology name from path like "shape-up/shape-up.yaml"
      const pathParts = item.path.split("/");
      return pathParts[0]; // Get directory name (methodology name)
    });

    // Remove duplicates and return
    return [...new Set(methodologies)];
  } catch (error) {
    console.warn(
      "Failed to discover methodologies dynamically, using fallback:",
      error,
    );
    // Fallback to hardcoded list if discovery fails
    return ["shape-up", "scrum", "kanban", "lean", "xp", "scrumban"];
  }
}

async function _checkFileExists(path: string): Promise<boolean> {
  try {
    // Security: Use safe stat check - path is always claudeMdPath
    // constructed from resolved projectPath and hardcoded "CLAUDE.md"
    const projectPath = path.replace(/\/CLAUDE\.md$/, "");
    await safeStat(path, projectPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Show help information for the integrate command
 */
function showIntegrateHelp(): void {
  printFormatted(`
# 🪴 Aichaku Integrate - Add Aichaku to project's CLAUDE.md

Integrates Aichaku configuration-as-code into your project's CLAUDE.md file,
providing Claude Code with methodology guidance, project standards, and custom agents.

## Usage
\`aichaku integrate [options]\`

## Options
- **-p, --project-path <path>** - Project path (default: current directory)
- **-f, --force** - Force integration even if already exists
- **-s, --silent** - Integrate silently with minimal output
- **-d, --dry-run** - Preview what would be integrated without applying changes
- **-h, --help** - Show this help message

## Examples

\`\`\`bash
# Integrate in current project
aichaku integrate

# Integrate in specific project
aichaku integrate --project-path /path

# Preview integration changes
aichaku integrate --dry-run

# Force re-integration
aichaku integrate --force
\`\`\`

## What It Does
- Automatically detects selected methodologies and standards
- Generates configuration-as-code YAML blocks
- Creates custom agents based on your selected methodologies
- Preserves existing CLAUDE.md content
- Requires Claude Code restart after adding agents

## Next Steps
After integration, restart Claude Code to load the new agents and configuration.
`);
}
