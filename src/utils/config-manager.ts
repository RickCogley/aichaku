/**
 * Configuration Manager for Aichaku
 * Handles the consolidated aichaku.json metadata format
 *
 * This module manages the transition from multiple metadata files to a single
 * consolidated aichaku.json file, providing backward compatibility during migration.
 */

import { exists } from "jsr:@std/fs@1.0.0";
import { join } from "jsr:@std/path@1.0.0";
import { getAichakuPaths } from "../paths.ts";

/**
 * Unified schema for the consolidated configuration file
 * Version 2.0.0 introduces the consolidated format
 */
export interface AichakuConfig {
  // Version of the config schema itself
  version: "2.0.0";

  // Project metadata (from .aichaku.json and .aichaku-project)
  project: {
    created: string;
    installedVersion?: string;
    lastUpdated?: string;
    methodology?: string;
    type?: "global" | "project";
    installationType?: "global" | "local";
  };

  // Selected standards (from standards.json + aichaku-standards.json)
  standards: {
    development: string[];
    documentation: string[];
    custom: Record<string, any>;
  };

  // Configuration settings (from aichaku.config.json)
  config: {
    outputPath?: string;
    enableHooks?: boolean;
    autoCommit?: boolean;
    gitIntegration?: boolean;
    customizations?: {
      userDir?: string;
    };
    globalVersion?: string;
  };

  // Legacy markers (replacing .aichaku-project file)
  markers: {
    isAichakuProject: boolean;
    migrationVersion?: string;
  };
}

// Legacy file interfaces for backward compatibility
interface LegacyAichakuJson {
  version?: string;
  installedVersion?: string;
  installedAt?: string;
  installDate?: string;
  lastUpdated?: string;
  lastUpgrade?: string;
  type?: "global" | "project";
  installationType?: "global" | "local";
}

interface LegacyStandardsJson {
  version?: string;
  selected: string[];
}

interface LegacyConfigJson {
  version?: string;
  globalVersion?: string;
  createdAt?: string;
  customizations?: {
    userDir?: string;
  };
  outputPath?: string;
  enableHooks?: boolean;
  autoCommit?: boolean;
  gitIntegration?: boolean;
}

interface LegacyProjectMarker {
  version?: string;
  installedAt?: string;
  installationType?: string;
  lastUpgrade?: string;
}

/**
 * Configuration Manager class for working with Aichaku metadata
 */
export class ConfigManager {
  private config: AichakuConfig | null = null;
  private projectRoot: string;
  private configPath: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || Deno.cwd();
    const paths = getAichakuPaths();
    this.configPath = join(
      this.projectRoot,
      ".claude",
      "aichaku",
      "aichaku.json",
    );
  }

  /**
   * Load configuration from disk (new format or legacy)
   */
  async load(): Promise<void> {
    // Try loading the consolidated config first
    this.config = await this.loadConsolidatedConfig();

    // If not found, try loading from legacy files
    if (!this.config) {
      this.config = await this.loadLegacyConfig();
    }

    // If still no config, this isn't an Aichaku project
    if (!this.config) {
      throw new Error("No Aichaku configuration found");
    }
  }

  /**
   * Get the loaded configuration
   */
  get(): AichakuConfig {
    if (!this.config) {
      throw new Error("Configuration not loaded. Call load() first.");
    }
    return this.config;
  }

  /**
   * Save the current configuration to disk
   */
  async save(): Promise<void> {
    if (!this.config) {
      throw new Error("No configuration to save");
    }

    // Ensure directory exists
    const dir = join(this.projectRoot, ".claude", "aichaku");
    await Deno.mkdir(dir, { recursive: true });

    // Write the consolidated config
    await Deno.writeTextFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
    );
  }

  /**
   * Update configuration with partial changes
   */
  async update(updates: DeepPartial<AichakuConfig>): Promise<void> {
    if (!this.config) {
      await this.load();
    }

    this.config = deepMerge(this.config!, updates) as AichakuConfig;
    await this.save();
  }

  /**
   * Check if this is an Aichaku project
   */
  isAichakuProject(): boolean {
    return this.config?.markers.isAichakuProject ?? false;
  }

  /**
   * Get the project methodology
   */
  getMethodology(): string | undefined {
    return this.config?.project.methodology;
  }

  /**
   * Get all selected standards (development + documentation)
   */
  getStandards(): string[] {
    if (!this.config) return [];
    return [
      ...this.config.standards.development,
      ...this.config.standards.documentation,
    ];
  }

  /**
   * Get development standards only
   */
  getDevelopmentStandards(): string[] {
    return this.config?.standards.development ?? [];
  }

  /**
   * Get documentation standards only
   */
  getDocumentationStandards(): string[] {
    return this.config?.standards.documentation ?? [];
  }

  /**
   * Get the installed version
   */
  getInstalledVersion(): string | undefined {
    return this.config?.project.installedVersion;
  }

  /**
   * Get the project type (global or project)
   */
  getProjectType(): "global" | "project" | undefined {
    return this.config?.project.type;
  }

  /**
   * Migrate from legacy format to consolidated format
   */
  async migrate(): Promise<boolean> {
    // Check if already migrated
    if (await exists(this.configPath)) {
      console.log("✅ Already using consolidated aichaku.json");
      return false;
    }

    console.log("🔄 Migrating to consolidated metadata format...");

    // Load from legacy files
    const legacyConfig = await this.loadLegacyConfig();
    if (!legacyConfig) {
      console.log("❌ No legacy configuration found to migrate");
      return false;
    }

    // Save as consolidated format
    this.config = legacyConfig;
    await this.save();

    console.log("✅ Created consolidated aichaku.json");

    // Optionally clean up old files
    // This should be done carefully after verification
    // await this.cleanupLegacyFiles();

    return true;
  }

  /**
   * Load configuration from the consolidated file
   */
  private async loadConsolidatedConfig(): Promise<AichakuConfig | null> {
    if (!await exists(this.configPath)) {
      return null;
    }

    try {
      const content = await Deno.readTextFile(this.configPath);
      const config = JSON.parse(content);

      // Validate version
      if (config.version !== "2.0.0") {
        console.warn(`Warning: Unknown config version ${config.version}`);
      }

      return config as AichakuConfig;
    } catch (e) {
      console.error("Failed to load aichaku.json:", e.message);
      return null;
    }
  }

  /**
   * Load configuration from legacy files (backward compatibility)
   */
  private async loadLegacyConfig(): Promise<AichakuConfig | null> {
    const aichakuDir = join(this.projectRoot, ".claude", "aichaku");

    // Initialize with defaults
    const config: AichakuConfig = {
      version: "2.0.0",
      project: {
        created: new Date().toISOString(),
      },
      standards: {
        development: [],
        documentation: [],
        custom: {},
      },
      config: {},
      markers: {
        isAichakuProject: false,
      },
    };

    // Check for any legacy files to determine if this is an Aichaku project
    let foundLegacyFiles = false;

    // Load from .aichaku.json
    const aichakuJsonPath = join(aichakuDir, ".aichaku.json");
    if (await exists(aichakuJsonPath)) {
      foundLegacyFiles = true;
      try {
        const content = await Deno.readTextFile(aichakuJsonPath);
        const legacy: LegacyAichakuJson = JSON.parse(content);

        config.project.installedVersion = legacy.version ||
          legacy.installedVersion;
        config.project.created = legacy.installedAt || legacy.installDate ||
          config.project.created;
        config.project.lastUpdated = legacy.lastUpdated || legacy.lastUpgrade;
        config.project.type = legacy.type;
        config.project.installationType = legacy.installationType;
        config.markers.isAichakuProject = true;
      } catch (e) {
        console.warn("Failed to load .aichaku.json:", e.message);
      }
    }

    // Load from .aichaku-project (older marker file)
    const projectMarkerPath = join(aichakuDir, ".aichaku-project");
    if (await exists(projectMarkerPath)) {
      foundLegacyFiles = true;
      config.markers.isAichakuProject = true;

      try {
        const content = await Deno.readTextFile(projectMarkerPath);
        const legacy: LegacyProjectMarker = JSON.parse(content);

        // Only update if not already set from .aichaku.json
        if (!config.project.installedVersion) {
          config.project.installedVersion = legacy.version;
        }
        if (!config.project.created) {
          config.project.created = legacy.installedAt || config.project.created;
        }
        if (!config.project.lastUpdated) {
          config.project.lastUpdated = legacy.lastUpgrade;
        }
        if (!config.project.installationType) {
          config.project.installationType = legacy.installationType as
            | "global"
            | "local";
        }
      } catch (e) {
        // It might be an empty marker file
        console.warn("Failed to parse .aichaku-project:", e.message);
      }
    }

    // Load development standards
    const standardsFiles = [
      join(aichakuDir, "aichaku-standards.json"),
      join(aichakuDir, ".aichaku-standards.json"),
      join(aichakuDir, "standards.json"),
    ];

    for (const path of standardsFiles) {
      if (await exists(path)) {
        foundLegacyFiles = true;
        try {
          const content = await Deno.readTextFile(path);
          const legacy: LegacyStandardsJson = JSON.parse(content);
          if (legacy.selected && legacy.selected.length > 0) {
            config.standards.development = legacy.selected;
            break; // Use the first file found with standards
          }
        } catch (e) {
          console.warn(`Failed to load ${path}:`, e.message);
        }
      }
    }

    // Load documentation standards
    const docStandardsFiles = [
      join(aichakuDir, "doc-standards.json"),
      join(aichakuDir, ".aichaku-doc-standards.json"),
    ];

    for (const path of docStandardsFiles) {
      if (await exists(path)) {
        foundLegacyFiles = true;
        try {
          const content = await Deno.readTextFile(path);
          const legacy: LegacyStandardsJson = JSON.parse(content);
          config.standards.documentation = legacy.selected || [];
          break;
        } catch (e) {
          console.warn(`Failed to load ${path}:`, e.message);
        }
      }
    }

    // Load configuration
    const configPath = join(aichakuDir, "aichaku.config.json");
    if (await exists(configPath)) {
      foundLegacyFiles = true;
      try {
        const content = await Deno.readTextFile(configPath);
        const legacy: LegacyConfigJson = JSON.parse(content);

        config.config = {
          outputPath: legacy.outputPath,
          enableHooks: legacy.enableHooks,
          autoCommit: legacy.autoCommit,
          gitIntegration: legacy.gitIntegration,
          customizations: legacy.customizations,
          globalVersion: legacy.globalVersion,
        };

        // If createdAt exists in config, use it
        if (legacy.createdAt && !config.project.created) {
          config.project.created = legacy.createdAt;
        }
      } catch (e) {
        console.warn("Failed to load aichaku.config.json:", e.message);
      }
    }

    // Detect methodology from project structure
    if (foundLegacyFiles && !config.project.methodology) {
      config.project.methodology = await this.detectMethodology();
    }

    return foundLegacyFiles ? config : null;
  }

  /**
   * Detect methodology from project structure
   */
  private async detectMethodology(): Promise<string | undefined> {
    const projectsDir = join(this.projectRoot, "docs", "projects");

    if (!await exists(projectsDir)) {
      return undefined;
    }

    // Look for methodology-specific files
    const methodologyPatterns = {
      "shape-up": ["pitch.md", "hill-chart.md", "cycle-plan.md"],
      "scrum": [
        "sprint-planning.md",
        "sprint-retrospective.md",
        "user-story.md",
      ],
      "kanban": ["kanban-board.md", "flow-metrics.md"],
      "lean": ["experiment-plan.md", "hypothesis.md"],
      "xp": ["user-story.md", "test-plan.md"],
      "scrumban": ["planning-trigger.md", "kanban-board.md"],
    };

    // Check active and done directories
    for (const dir of ["active", "done"]) {
      const searchDir = join(projectsDir, dir);
      if (!await exists(searchDir)) continue;

      // Read directory contents
      try {
        for await (const entry of Deno.readDir(searchDir)) {
          if (entry.isDirectory) {
            const projectDir = join(searchDir, entry.name);

            // Check each methodology's signature files
            for (
              const [methodology, files] of Object.entries(methodologyPatterns)
            ) {
              for (const file of files) {
                if (await exists(join(projectDir, file))) {
                  return methodology;
                }
              }
            }
          }
        }
      } catch {
        // Continue checking
      }
    }

    return undefined;
  }

  /**
   * Clean up legacy metadata files after successful migration
   * This should be called carefully after verifying the migration worked
   */
  async cleanupLegacyFiles(): Promise<void> {
    const aichakuDir = join(this.projectRoot, ".claude", "aichaku");

    const filesToRemove = [
      ".aichaku.json",
      ".aichaku-project",
      ".aichaku-standards.json",
      "aichaku-standards.json",
      "standards.json",
      ".aichaku-doc-standards.json",
      "doc-standards.json",
      "aichaku.config.json",
    ];

    console.log("🧹 Cleaning up legacy metadata files...");

    for (const file of filesToRemove) {
      const path = join(aichakuDir, file);
      if (await exists(path)) {
        try {
          await Deno.remove(path);
          console.log(`  ✓ Removed ${file}`);
        } catch (e) {
          console.warn(`  ⚠️ Failed to remove ${file}:`, e.message);
        }
      }
    }
  }
}

/**
 * Deep partial type helper
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge two objects
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] && typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Create a default configuration for new projects
 */
export function createDefaultConfig(
  type: "global" | "project" = "project",
): AichakuConfig {
  return {
    version: "2.0.0",
    project: {
      created: new Date().toISOString(),
      type,
    },
    standards: {
      development: [],
      documentation: [],
      custom: {},
    },
    config: {},
    markers: {
      isAichakuProject: true,
    },
  };
}

/**
 * Export a singleton instance for global configuration
 */
export const globalConfig = new ConfigManager(getAichakuPaths().global.root);

/**
 * Export a factory function for project configuration
 */
export function getProjectConfig(projectRoot?: string): ConfigManager {
  return new ConfigManager(projectRoot);
}
