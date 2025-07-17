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
  standards?: {
    version: string;
    selected: string[];
  };
}

interface IntegrateOptions {
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
}

interface IntegrateResult {
  success: boolean;
  path: string;
  message?: string;
  action?: "created" | "updated" | "skipped";
  lineNumber?: number;
}

// YAML block markers
const YAML_CONFIG_START = "```yaml";
const YAML_CONFIG_END = "```";
const AICHAKU_CONFIG_MARKER = "## Directives for Claude Code from Aichaku";

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

  const developmentStandards = allStandards.filter((std) =>
    !documentationStandards.includes(std)
  );

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
  const projectPath = resolveProjectPath(options.projectPath);
  const claudeMdPath = join(projectPath, "CLAUDE.md");
  const aichakuPaths = paths.get();

  // Get selected standards and methodologies
  const allSelectedStandards = await loadProjectStandards(projectPath);
  const {
    developmentStandards: selectedStandards,
    documentationStandards: selectedDocStandards,
  } = separateStandardsByType(allSelectedStandards);

  // Dynamically discover all methodologies (per spec: "all methodologies, selected standards")
  const selectedMethodologies = await discoverAllMethodologies();

  // Define configuration paths - use development paths for now
  const configPaths = {
    core: join("/Users/rcogley/dev/aichaku", "docs", "core"),
    methodologies: join("/Users/rcogley/dev/aichaku", "docs", "methodologies"),
    standards: join("/Users/rcogley/dev/aichaku", "docs", "standards"),
    user: aichakuPaths.global.user.root,
  };

  // Assemble YAML configuration
  const yamlConfig = await assembleYamlConfig({
    paths: configPaths,
    selectedMethodologies,
    selectedStandards,
    selectedDocStandards,
  });

  // Note: methodology quick reference is now included in the main yamlConfig

  if (options.dryRun) {
    const fileExists = await exists(claudeMdPath);
    console.log(
      `[DRY RUN] Would ${
        fileExists ? "update" : "create"
      } CLAUDE.md at: ${claudeMdPath}`,
    );
    console.log(`[DRY RUN] Would add YAML configuration with:`);
    console.log(
      `  - Core directives (behavioral, visual, file organization, diagrams)`,
    );
    console.log(`  - ${selectedMethodologies.length} methodologies`);
    if (allSelectedStandards.length > 0) {
      console.log(
        `  - ${allSelectedStandards.length} total standards (${selectedStandards.length} development + ${selectedDocStandards.length} documentation)`,
      );
    }
    return {
      success: true,
      path: claudeMdPath,
      message: "Dry run completed. No files were modified.",
      action: "skipped",
    };
  }

  try {
    let action: "created" | "updated" = "created";

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

    const standardsMsg = allSelectedStandards.length > 0
      ? ` with ${allSelectedStandards.length} standards (${selectedStandards.length} development + ${selectedDocStandards.length} documentation)`
      : "";

    return {
      success: true,
      path: claudeMdPath,
      message: `${
        action === "created" ? "Created new" : "Updated"
      } CLAUDE.md with YAML configuration${standardsMsg}`,
      action,
      lineNumber,
    };
  } catch (error) {
    return {
      success: false,
      path: claudeMdPath,
      message: `Failed to integrate: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Discover all available methodologies from global installation
 * Per spec: "all methodologies, selected standards" - methodologies should be auto-discovered globally
 */
async function discoverAllMethodologies(): Promise<string[]> {
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
