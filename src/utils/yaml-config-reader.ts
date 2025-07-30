/**
 * YAML Configuration Reader for Aichaku
 *
 * This module reads and merges YAML configuration files for the integrate command.
 * It implements true "configuration as code" by reading from source YAML files
 * rather than generating content programmatically.
 */
// deno-lint-ignore-file no-explicit-any

import { parse, stringify } from "jsr:@std/yaml@1";
import { join } from "jsr:@std/path@1";
import { exists } from "jsr:@std/fs@1";
import { VERSION } from "../../version.ts";
import { getDefaultMethodologies } from "../config/methodology-defaults.ts";

interface YamlConfig {
  [key: string]: unknown;
}

interface ConfigPaths {
  core: string;
  methodologies: string;
  standards: string;
  principles: string;
  user?: string;
}

/**
 * Read and parse a YAML file
 */
async function readYamlFile(filePath: string): Promise<YamlConfig | null> {
  try {
    if (!(await exists(filePath))) {
      // Silently return null for missing files
      return null;
    }

    const content = await Deno.readTextFile(filePath);
    return parse(content) as YamlConfig;
  } catch (error) {
    console.error(`Error reading YAML file ${filePath}:`, error);
    return null;
  }
}

/**
 * Read all core configuration files
 */
async function readCoreConfigs(corePath: string): Promise<YamlConfig> {
  const coreConfig: YamlConfig = {
    aichaku: {
      version: VERSION,
      source: "configuration-as-code",
    },
  };

  // Read metadata to know which files to include
  const metadataPath = join(corePath, "metadata.yaml");
  const metadata = await readYamlFile(metadataPath);

  if (metadata?.core_components) {
    const components = metadata.core_components as Record<string, unknown>;

    // Sort by order if specified
    const sortedComponents = Object.entries(components)
      .sort(([, a], [, b]) => {
        const aOrder = typeof (a as any).order === "number" ? (a as any).order : 999;
        const bOrder = typeof (b as any).order === "number" ? (b as any).order : 999;
        return aOrder - bOrder;
      });

    for (const [key, component] of sortedComponents) {
      if ((component as any).mandatory !== false) {
        const configPath = join(corePath, (component as any).file);
        const config = await readYamlFile(configPath);

        if (config) {
          // Extract the actual content from the YAML file
          // Core files have their content under specific keys
          if (key === "behavioral_directives" && config.rules) {
            coreConfig.behavioral_directives = config.rules;
          } else if (key === "visual_identity" && config.identity) {
            coreConfig.visual_identity = config.identity;
          } else if (key === "file_organization" && config.project_structure) {
            coreConfig.file_organization = config.project_structure;
          } else if (key === "diagram_templates" && config.diagrams) {
            coreConfig.diagram_templates = config.diagrams;
          }
        }
      }
    }
  }

  return coreConfig;
}

/**
 * Read selected methodology configurations
 */
async function readMethodologyConfigs(
  methodologiesPath: string,
  selected: string[],
): Promise<YamlConfig> {
  const methodologies: YamlConfig = {};

  for (const methodology of selected) {
    const yamlPath = join(
      methodologiesPath,
      methodology,
      `${methodology}.yaml`,
    );
    const config = await readYamlFile(yamlPath);

    if (config) {
      // Extract relevant fields for CLAUDE.md
      methodologies[methodology] = {
        name: config.name,
        triggers: (config.summary as any)?.triggers || [],
        best_for: (config.summary as any)?.best_for || "",
        templates: config.templates || [],
        phases: config.phases || {},
        integration_url: `aichaku://methodology/${methodology}/guide`,
      };
    }
  }

  return { methodologies };
}

/**
 * Read selected standards configurations
 */
async function readStandardsConfigs(
  standardsPath: string,
  selected: string[],
): Promise<YamlConfig> {
  const standards: YamlConfig = {};

  for (const standard of selected) {
    // Find the standard in any category
    const categories = [
      "development",
      "security",
      "architecture",
      "testing",
      "devops",
      "documentation",
    ];
    let config: YamlConfig | null = null;
    let category = "";

    for (const cat of categories) {
      const yamlPath = join(standardsPath, cat, `${standard}.yaml`);
      config = await readYamlFile(yamlPath);
      if (config) {
        category = cat;
        break;
      }
    }

    if (config) {
      // Extract relevant fields for CLAUDE.md (exclude rules for size optimization)
      standards[standard] = {
        name: config.name,
        category,
        summary: config.summary,
        integration_url: `aichaku://standard/${category}/${standard}`,
      };
    }
  }

  return { standards };
}

/**
 * Read selected principles configurations
 */
async function readPrinciplesConfigs(
  principlesPath: string,
  selected: string[],
): Promise<YamlConfig> {
  const principles: YamlConfig = {};

  for (const principle of selected) {
    // Find the principle in any category
    const categories = [
      "engineering",
      "human-centered",
      "organizational",
      "software-development",
    ];
    let config: YamlConfig | null = null;
    let category = "";

    for (const cat of categories) {
      const yamlPath = join(principlesPath, cat, `${principle}.yaml`);
      config = await readYamlFile(yamlPath);
      if (config) {
        category = cat;
        break;
      }
    }

    if (config) {
      // Extract relevant fields for CLAUDE.md (compact summary)
      principles[principle] = {
        name: config.name,
        category,
        summary: {
          tagline: (config.summary as any)?.tagline || config.description,
          core_tenets: ((config.summary as any)?.core_tenets || []).slice(0, 3).map((tenet: any) => ({
            text: tenet.text,
          })),
        },
        integration_url: `aichaku://principle/${category}/${principle}`,
      };
    }
  }

  return { principles };
}

/**
 * Read user customizations if they exist
 */
async function readUserCustomizations(userPath?: string): Promise<YamlConfig> {
  if (!userPath) return {};

  const customPath = join(userPath, "aichaku-custom.yaml");
  const config = await readYamlFile(customPath);

  return config ? { user_customizations: config } : {};
}

/**
 * Merge all configurations in the correct order
 */
function mergeConfigs(...configs: YamlConfig[]): YamlConfig {
  // Deep merge configurations
  const merged: YamlConfig = {};

  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (
        typeof value === "object" && value !== null && !Array.isArray(value)
      ) {
        merged[key] = {
          ...(merged[key] as object || {}),
          ...(value as object),
        };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

/**
 * Main function to assemble YAML configuration for CLAUDE.md
 */
export async function assembleYamlConfig(options: {
  paths: ConfigPaths;
  selectedMethodologies?: string[];
  selectedStandards?: string[];
  selectedDocStandards?: string[];
  selectedPrinciples?: string[];
}): Promise<string> {
  const {
    paths,
    selectedMethodologies = [],
    selectedStandards = [],
    selectedDocStandards = [],
    selectedPrinciples = [],
  } = options;

  // First, get methodology quick reference
  const allMethodologies = selectedMethodologies.length > 0 ? selectedMethodologies : getDefaultMethodologies();
  const methodologyQuickRef: YamlConfig = { methodologies: {} };

  for (const methodology of allMethodologies) {
    const yamlPath = join(
      paths.methodologies,
      methodology,
      `${methodology}.yaml`,
    );
    const config = await readYamlFile(yamlPath);

    if (config?.summary) {
      if (methodologyQuickRef.methodologies) {
        (methodologyQuickRef.methodologies as any)[
          methodology.replace("-", "_")
        ] = config.summary;
      }
    }
  }

  // Read all configurations
  const coreConfig = await readCoreConfigs(paths.core);
  const methodologyConfig = await readMethodologyConfigs(
    paths.methodologies,
    selectedMethodologies,
  );
  const standardsConfig = await readStandardsConfigs(paths.standards, [
    ...selectedStandards,
    ...selectedDocStandards,
  ]);
  const principlesConfig = await readPrinciplesConfigs(
    paths.principles,
    selectedPrinciples,
  );
  const userConfig = await readUserCustomizations(paths.user);

  // Merge in the correct order: core first, then methodology quick ref, then detailed configs
  const finalConfig = mergeConfigs(
    coreConfig,
    methodologyQuickRef,
    methodologyConfig,
    standardsConfig,
    principlesConfig,
    userConfig,
  );

  // Add metadata about what was included
  finalConfig.included = {
    core: true,
    methodologies: selectedMethodologies,
    standards: selectedStandards,
    doc_standards: selectedDocStandards,
    principles: selectedPrinciples,
    has_user_customizations: Object.keys(userConfig).length > 0,
  };

  // Convert to YAML string with nice formatting
  return stringify(finalConfig, {
    indent: 2,
    lineWidth: 100,
    skipInvalid: true,
    sortKeys: false,
  });
}

/**
 * Extract just the methodology quick reference for the header
 */
export async function getMethodologyQuickReference(
  methodologiesPath: string,
  selected?: string[],
): Promise<string> {
  const allMethodologies = selected || getDefaultMethodologies();
  const quickRef: YamlConfig = { methodologies: {} };

  for (const methodology of allMethodologies) {
    const yamlPath = join(
      methodologiesPath,
      methodology,
      `${methodology}.yaml`,
    );
    const config = await readYamlFile(yamlPath);

    if (config?.summary) {
      if (quickRef.methodologies) {
        (quickRef.methodologies as any)[methodology.replace("-", "_")] = {
          triggers: (config.summary as any).triggers || [],
          best_for: (config.summary as any).best_for || "",
        };
      }
    }
  }

  return stringify(quickRef, {
    indent: 2,
    lineWidth: 80,
    skipInvalid: true,
  });
}
