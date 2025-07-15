/**
 * Configuration Manager for Aichaku
 *
 * Handles consolidation of metadata from multiple files into a single aichaku.json
 * Provides backward compatibility during migration and type-safe configuration access
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

// Unified schema for consolidated configuration (v2.0.0)
export interface AichakuConfig {
  version: "2.0.0";
  project: {
    created: string;
    installedVersion?: string;
    lastUpdated?: string;
    methodology?: string;
    type?: "global" | "project";
    installationType?: "global" | "local";
  };
  standards: {
    development: string[];
    documentation: string[];
    custom: Record<string, unknown>;
  };
  config: {
    outputPath?: string;
    enableHooks?: boolean;
    autoCommit?: boolean;
    gitIntegration?: boolean;
    customizations?: Record<string, unknown>;
    globalVersion?: string;
    createdAt?: string;
  };
  markers: {
    isAichakuProject: boolean;
    migrationVersion?: string;
  };
}

// Legacy file interfaces for backward compatibility
interface LegacyAichakuJson {
  version?: string;
  installedVersion?: string;
  installDate?: string;
  lastUpdated?: string;
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
  outputPath?: string;
  enableHooks?: boolean;
  autoCommit?: boolean;
  gitIntegration?: boolean;
  customizations?: Record<string, unknown>;
}

/**
 * Configuration Manager Class
 * Provides unified access to Aichaku configuration with automatic migration
 */
export class ConfigManager {
  private config: AichakuConfig | null = null;
  private projectRoot: string;
  private aichakuDir: string;
  private configPath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.aichakuDir = join(projectRoot, ".claude", "aichaku");
    this.configPath = join(this.aichakuDir, "aichaku.json");
  }

  /**
   * Load configuration from consolidated file or migrate from legacy files
   */
  async load(): Promise<void> {
    // Try to load from consolidated file first
    if (await exists(this.configPath)) {
      try {
        const content = await Deno.readTextFile(this.configPath);
        this.config = JSON.parse(content) as AichakuConfig;
        return;
      } catch (e) {
        console.warn(
          "Failed to load consolidated config:",
          (e as Error).message,
        );
      }
    }

    // Check if this is an Aichaku project by looking for any metadata files
    if (await this.hasLegacyFiles()) {
      console.log(
        "🔄 Detected legacy metadata files, performing automatic migration...",
      );
      await this.migrateFromLegacy();
    } else {
      throw new Error("No Aichaku configuration found");
    }
  }

  /**
   * Get the current configuration
   */
  get(): AichakuConfig {
    if (!this.config) {
      throw new Error("Configuration not loaded. Call load() first.");
    }
    return this.config;
  }

  /**
   * Save the current configuration to file
   */
  async save(): Promise<void> {
    if (!this.config) {
      throw new Error("No configuration to save");
    }

    // Ensure directory exists
    try {
      await Deno.mkdir(this.aichakuDir, { recursive: true });
    } catch {
      // Directory already exists
    }

    await Deno.writeTextFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
    );
  }

  /**
   * Update configuration with partial updates
   */
  async update(updates: Partial<AichakuConfig>): Promise<void> {
    if (!this.config) {
      throw new Error("Configuration not loaded");
    }

    this.config = this.deepMerge(this.config, updates);
    await this.save();
  }

  /**
   * Create default configuration for new projects
   */
  static createDefault(methodology?: string): AichakuConfig {
    return {
      version: "2.0.0",
      project: {
        created: new Date().toISOString(),
        methodology,
        type: "project",
        installationType: "local",
      },
      standards: {
        development: [],
        documentation: [],
        custom: {},
      },
      config: {
        customizations: {},
      },
      markers: {
        isAichakuProject: true,
      },
    };
  }

  /**
   * Create global configuration
   */
  static createGlobal(version: string): AichakuConfig {
    const config = ConfigManager.createDefault();
    config.project.type = "global";
    config.project.installationType = "global";
    config.project.installedVersion = version;
    config.config.globalVersion = version;
    return config;
  }

  // Convenience methods
  getStandards(): string[] {
    const config = this.get();
    return [
      ...config.standards.development,
      ...config.standards.documentation,
    ];
  }

  getDevelopmentStandards(): string[] {
    return this.get().standards.development;
  }

  getDocumentationStandards(): string[] {
    return this.get().standards.documentation;
  }

  isAichakuProject(): boolean {
    return this.get().markers.isAichakuProject;
  }

  getMethodology(): string | undefined {
    return this.get().project.methodology;
  }

  getInstalledVersion(): string | undefined {
    return this.get().project.installedVersion;
  }

  getInstallationType(): "global" | "local" | undefined {
    return this.get().project.installationType;
  }

  getCustomizations(): Record<string, unknown> {
    return this.get().config.customizations || {};
  }

  /**
   * Set the methodology for the project
   */
  async setMethodology(methodology: string): Promise<void> {
    await this.update({
      project: {
        ...this.get().project,
        methodology,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  /**
   * Add or update development standards
   */
  async setDevelopmentStandards(standards: string[]): Promise<void> {
    await this.update({
      standards: {
        ...this.get().standards,
        development: standards,
      },
    });
  }

  /**
   * Add or update documentation standards
   */
  async setDocumentationStandards(standards: string[]): Promise<void> {
    await this.update({
      standards: {
        ...this.get().standards,
        documentation: standards,
      },
    });
  }

  /**
   * Update installed version
   */
  async setInstalledVersion(version: string): Promise<void> {
    await this.update({
      project: {
        ...this.get().project,
        installedVersion: version,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  /**
   * Check if legacy files exist
   */
  private async hasLegacyFiles(): Promise<boolean> {
    const legacyFiles = [
      ".aichaku.json",
      ".aichaku-project",
      "aichaku-standards.json",
      "standards.json",
      "aichaku.config.json",
    ];

    for (const file of legacyFiles) {
      if (await exists(join(this.aichakuDir, file))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Migrate from legacy metadata files to consolidated format
   */
  private async migrateFromLegacy(): Promise<void> {
    // Initialize default config
    this.config = ConfigManager.createDefault();

    // Migrate from .aichaku.json
    await this.migrateLegacyAichakuJson();

    // Migrate from standards files
    await this.migrateLegacyStandards();

    // Migrate from config file
    await this.migrateLegacyConfig();

    // Check for project marker
    await this.checkProjectMarker();

    // Detect methodology from project structure
    await this.detectMethodology();

    // Save the consolidated configuration
    await this.save();
    console.log("✅ Successfully migrated to consolidated aichaku.json");
  }

  /**
   * Migrate from legacy .aichaku.json
   */
  private async migrateLegacyAichakuJson(): Promise<void> {
    const legacyPath = join(this.aichakuDir, ".aichaku.json");
    if (await exists(legacyPath)) {
      try {
        const content = await Deno.readTextFile(legacyPath);
        const legacy: LegacyAichakuJson = JSON.parse(content);

        if (this.config) {
          this.config.project.installedVersion = legacy.installedVersion;
          this.config.project.created = legacy.installDate ||
            this.config.project.created;
          this.config.project.lastUpdated = legacy.lastUpdated;
          this.config.project.type = legacy.type;
          this.config.project.installationType = legacy.installationType;
        }

        console.log("  ✓ Migrated .aichaku.json");
      } catch (e) {
        console.warn(
          "  ⚠️ Failed to migrate .aichaku.json:",
          (e as Error).message,
        );
      }
    }
  }

  /**
   * Migrate from legacy standards files
   */
  private async migrateLegacyStandards(): Promise<void> {
    // Migrate development standards
    const devStandardsPaths = [
      join(this.aichakuDir, "aichaku-standards.json"),
      join(this.aichakuDir, "standards.json"),
      join(this.aichakuDir, ".aichaku-standards.json"),
    ];

    for (const path of devStandardsPaths) {
      if (await exists(path)) {
        try {
          const content = await Deno.readTextFile(path);
          const legacy: LegacyStandardsJson = JSON.parse(content);
          if (this.config) {
            this.config.standards.development = legacy.selected || [];
          }
          console.log(`  ✓ Migrated ${path.split("/").pop()}`);
          break;
        } catch (e) {
          console.warn(
            `  ⚠️ Failed to migrate ${path.split("/").pop()}:`,
            (e as Error).message,
          );
        }
      }
    }

    // Migrate documentation standards
    const docStandardsPaths = [
      join(this.aichakuDir, "doc-standards.json"),
      join(this.aichakuDir, ".aichaku-doc-standards.json"),
    ];

    for (const path of docStandardsPaths) {
      if (await exists(path)) {
        try {
          const content = await Deno.readTextFile(path);
          const legacy: LegacyStandardsJson = JSON.parse(content);
          if (this.config) {
            this.config.standards.documentation = legacy.selected || [];
          }
          console.log(`  ✓ Migrated ${path.split("/").pop()}`);
          break;
        } catch (e) {
          console.warn(
            `  ⚠️ Failed to migrate ${path.split("/").pop()}:`,
            (e as Error).message,
          );
        }
      }
    }
  }

  /**
   * Migrate from legacy config file
   */
  private async migrateLegacyConfig(): Promise<void> {
    const configPath = join(this.aichakuDir, "aichaku.config.json");
    if (await exists(configPath)) {
      try {
        const content = await Deno.readTextFile(configPath);
        const legacy: LegacyConfigJson = JSON.parse(content);

        if (this.config) {
          this.config.config = {
            ...this.config.config,
            outputPath: legacy.outputPath,
            enableHooks: legacy.enableHooks,
            autoCommit: legacy.autoCommit,
            gitIntegration: legacy.gitIntegration,
            customizations: legacy.customizations,
            globalVersion: legacy.globalVersion,
            createdAt: legacy.createdAt,
          };
        }

        console.log("  ✓ Migrated aichaku.config.json");
      } catch (e) {
        console.warn(
          "  ⚠️ Failed to migrate aichaku.config.json:",
          (e as Error).message,
        );
      }
    }
  }

  /**
   * Check for .aichaku-project marker
   */
  private async checkProjectMarker(): Promise<void> {
    const markerPath = join(this.aichakuDir, ".aichaku-project");
    if (await exists(markerPath)) {
      if (this.config) {
        this.config.markers.isAichakuProject = true;
      }
      console.log("  ✓ Detected .aichaku-project marker");
    }
  }

  /**
   * Detect methodology from project structure
   */
  private async detectMethodology(): Promise<void> {
    const projectsDir = join(this.projectRoot, "docs", "projects");
    if (!await exists(projectsDir)) {
      return;
    }

    const methodologyIndicators = {
      "shape-up": ["pitch.md", "STATUS.md", "hill-chart.md"],
      "scrum": ["sprint-planning.md", "retrospective.md", "user-story.md"],
      "kanban": ["kanban-board.md", "flow-metrics.md"],
      "lean": ["experiment-plan.md"],
      "scrumban": ["planning-trigger.md"],
    };

    // Check active projects directory
    const activeDir = join(projectsDir, "active");
    if (await exists(activeDir)) {
      try {
        for await (const entry of Deno.readDir(activeDir)) {
          if (entry.isDirectory) {
            const projectDir = join(activeDir, entry.name);

            for (
              const [methodology, files] of Object.entries(
                methodologyIndicators,
              )
            ) {
              for (const file of files) {
                if (await exists(join(projectDir, file))) {
                  if (this.config) {
                    this.config.project.methodology = methodology;
                  }
                  console.log(
                    `  ✓ Detected ${methodology} methodology from ${file}`,
                  );
                  return;
                }
              }
            }
          }
        }
      } catch {
        // Continue without error if we can't read the directory
      }
    }

    // Fallback: check for methodology files in projects root
    for (const [methodology, files] of Object.entries(methodologyIndicators)) {
      for (const file of files) {
        if (await exists(join(projectsDir, file))) {
          if (this.config) {
            this.config.project.methodology = methodology;
          }
          console.log(`  ✓ Detected ${methodology} methodology from ${file}`);
          return;
        }
      }
    }
  }

  /**
   * Deep merge utility for configuration updates
   */
  private deepMerge(target: unknown, source: unknown): unknown {
    if (!target || typeof target !== "object") {
      return source;
    }
    if (!source || typeof source !== "object") {
      return target;
    }

    const targetObj = target as Record<string, unknown>;
    const sourceObj = source as Record<string, unknown>;
    const result = { ...targetObj };

    for (const key in sourceObj) {
      if (
        sourceObj[key] && typeof sourceObj[key] === "object" &&
        !Array.isArray(sourceObj[key])
      ) {
        result[key] = this.deepMerge(targetObj[key] || {}, sourceObj[key]);
      } else {
        result[key] = sourceObj[key];
      }
    }

    return result;
  }

  /**
   * Clean up legacy files after successful migration
   */
  async cleanupLegacyFiles(): Promise<void> {
    const legacyFiles = [
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
    let removedCount = 0;

    for (const file of legacyFiles) {
      const path = join(this.aichakuDir, file);
      if (await exists(path)) {
        try {
          await Deno.remove(path);
          console.log(`  ✓ Removed ${file}`);
          removedCount++;
        } catch (e) {
          console.warn(`  ⚠️ Failed to remove ${file}:`, (e as Error).message);
        }
      }
    }

    if (removedCount > 0) {
      console.log(`✅ Cleaned up ${removedCount} legacy files`);
    } else {
      console.log("✅ No legacy files to clean up");
    }
  }

  /**
   * Verify the integrity of the configuration
   */
  verifyIntegrity(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config) {
      errors.push("Configuration not loaded");
      return { valid: false, errors };
    }

    // Check required fields
    if (this.config.version !== "2.0.0") {
      errors.push("Invalid configuration version");
    }

    if (!this.config.project.created) {
      errors.push("Missing project creation date");
    }

    if (!this.config.markers) {
      errors.push("Missing markers section");
    }

    if (!this.config.standards) {
      errors.push("Missing standards section");
    }

    if (!this.config.config) {
      errors.push("Missing config section");
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Factory function to create ConfigManager for project root
 */
export function createProjectConfigManager(
  projectRoot?: string,
): ConfigManager {
  const root = projectRoot || Deno.cwd();
  return new ConfigManager(root);
}

/**
 * Factory function to create ConfigManager for global configuration
 */
export function createGlobalConfigManager(): ConfigManager {
  const globalRoot = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") ||
    "/tmp";
  return new ConfigManager(globalRoot);
}

/**
 * Utility function to check if a directory is an Aichaku project
 */
export async function isAichakuProject(projectRoot?: string): Promise<boolean> {
  try {
    const manager = createProjectConfigManager(projectRoot);
    await manager.load();
    return manager.isAichakuProject();
  } catch {
    return false;
  }
}

/**
 * Utility function to get methodology for a project
 */
export async function getProjectMethodology(
  projectRoot?: string,
): Promise<string | undefined> {
  try {
    const manager = createProjectConfigManager(projectRoot);
    await manager.load();
    return manager.getMethodology();
  } catch {
    return undefined;
  }
}
