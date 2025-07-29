/**
 * Configuration Manager for Aichaku
 *
 * Handles consolidation of metadata from multiple files into a single aichaku.json
 * Provides backward compatibility during migration and type-safe configuration access
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

// Unified schema for Aichaku configuration
export interface AichakuConfig {
  version: string;
  installedAt?: string;
  installationType?: "global" | "local";
  lastUpgrade?: string;
  methodologies?: {
    selected: string[];
    default?: string;
  };
  standards?: {
    selected: string[];
    customStandards?: Record<string, unknown>;
  };
  project?: {
    created?: string;
    lastUpdated?: string;
  };
  config?: {
    outputPath?: string;
    enableHooks?: boolean;
    autoCommit?: boolean;
    gitIntegration?: boolean;
    customizations?: Record<string, unknown>;
  };
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
        const rawConfig = JSON.parse(content);

        // Migrate config if needed
        this.config = await this.migrateConfig(rawConfig);

        // Save if migration occurred
        if (rawConfig !== this.config) {
          await this.save();
        }
        return;
      } catch (e) {
        console.warn(
          "Failed to load config:",
          (e as Error).message,
        );
      }
    }

    // Initialize with default if no config exists
    await this.initializeDefault();
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
   * Initialize default configuration if none exists
   */
  async initializeDefault(): Promise<void> {
    this.config = {
      version: "0.36.2",
      installedAt: new Date().toISOString(),
      installationType: "local",
      methodologies: {
        selected: [],
      },
      standards: {
        selected: [],
      },
      project: {
        created: new Date().toISOString(),
      },
    };
    await this.save();
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

    this.config = this.deepMerge(this.config, updates) as AichakuConfig;

    // Clean up any legacy fields
    if (this.config.standards && "version" in this.config.standards) {
      delete (this.config.standards as any).version;
    }
    if (this.config.project && "methodology" in this.config.project) {
      delete (this.config.project as any).methodology;
    }

    await this.save();
  }

  /**
   * Create default configuration for new projects
   */
  static createDefault(methodologies?: string[]): AichakuConfig {
    return {
      version: "0.36.2",
      installedAt: new Date().toISOString(),
      installationType: "local",
      methodologies: {
        selected: methodologies || [],
        default: methodologies?.[0],
      },
      standards: {
        selected: [],
      },
      project: {
        created: new Date().toISOString(),
      },
    };
  }

  /**
   * Create global configuration
   */
  static createGlobal(version: string): AichakuConfig {
    const config = ConfigManager.createDefault();
    config.version = version;
    config.installationType = "global";
    return config;
  }

  // Convenience methods
  getStandards(): string[] {
    const config = this.get();
    return config.standards?.selected || [];
  }

  isAichakuProject(): boolean {
    return this.config !== null;
  }

  getMethodologies(): string[] {
    const config = this.get();
    return config.methodologies?.selected || [];
  }

  getDefaultMethodology(): string | undefined {
    const config = this.get();
    return config.methodologies?.default || config.methodologies?.selected?.[0];
  }

  getInstalledVersion(): string | undefined {
    return this.get().version;
  }

  getInstallationType(): "global" | "local" | undefined {
    return this.get().installationType;
  }

  getCustomizations(): Record<string, unknown> {
    return this.get().config?.customizations || {};
  }

  /**
   * Set the methodologies for the project
   */
  async setMethodologies(methodologies: string[]): Promise<void> {
    const config = this.get();
    await this.update({
      ...config,
      methodologies: {
        selected: methodologies,
        default: methodologies[0],
      },
      project: {
        ...config.project,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  /**
   * Add a methodology to the project
   */
  async addMethodology(methodology: string): Promise<void> {
    const config = this.get();
    const current = config.methodologies?.selected || [];
    if (!current.includes(methodology)) {
      await this.setMethodologies([...current, methodology]);
    }
  }

  /**
   * Remove a methodology from the project
   */
  async removeMethodology(methodology: string): Promise<void> {
    const config = this.get();
    const current = config.methodologies?.selected || [];
    const updated = current.filter((m) => m !== methodology);
    await this.setMethodologies(updated);
  }

  /**
   * Set standards for the project
   */
  async setStandards(standards: string[]): Promise<void> {
    const config = this.get();
    await this.update({
      ...config,
      standards: {
        ...config.standards,
        selected: standards,
      },
    });
  }

  /**
   * Add a standard to the project
   */
  async addStandard(standard: string): Promise<void> {
    const config = this.get();
    const current = config.standards?.selected || [];
    if (!current.includes(standard)) {
      await this.setStandards([...current, standard]);
    }
  }

  /**
   * Remove a standard from the project
   */
  async removeStandard(standard: string): Promise<void> {
    const config = this.get();
    const current = config.standards?.selected || [];
    const updated = current.filter((s) => s !== standard);
    await this.setStandards(updated);
  }

  /**
   * Update installed version
   */
  async setInstalledVersion(version: string): Promise<void> {
    const config = this.get();
    await this.update({
      ...config,
      version,
      lastUpgrade: new Date().toISOString(),
    });
  }

  /**
   * Migrate configuration to latest format
   */
  private async migrateConfig(rawConfig: any): Promise<AichakuConfig> {
    const config: AichakuConfig = {
      version: rawConfig.version || "0.36.2",
      installedAt: rawConfig.installedAt || rawConfig.installDate || new Date().toISOString(),
      installationType: rawConfig.installationType || "local",
      lastUpgrade: rawConfig.lastUpgrade || rawConfig.lastUpdated,
      methodologies: {
        selected: [],
      },
      standards: {
        selected: [],
      },
    };

    // Migrate methodologies
    if (rawConfig.methodologies?.selected) {
      config.methodologies!.selected = rawConfig.methodologies.selected;
    } else if (rawConfig.project?.methodology) {
      // Migrate from old single methodology format
      config.methodologies!.selected = [rawConfig.project.methodology];
    }

    // Set default methodology
    if (config.methodologies!.selected.length > 0) {
      config.methodologies!.default = rawConfig.methodologies?.default || config.methodologies!.selected[0];
    }

    // Migrate standards (remove version field)
    if (rawConfig.standards?.selected) {
      config.standards!.selected = rawConfig.standards.selected;
    } else if (rawConfig.standards?.development || rawConfig.standards?.documentation) {
      // Migrate from old split standards format
      config.standards!.selected = [
        ...(rawConfig.standards.development || []),
        ...(rawConfig.standards.documentation || []),
      ];
    }

    // Migrate project info
    if (rawConfig.project) {
      config.project = {
        created: rawConfig.project.created || rawConfig.installedAt,
        lastUpdated: rawConfig.project.lastUpdated,
      };
    }

    // Migrate config section if present
    if (rawConfig.config) {
      config.config = rawConfig.config;
    }

    return config;
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
   * Verify the integrity of the configuration
   */
  verifyIntegrity(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config) {
      errors.push("Configuration not loaded");
      return { valid: false, errors };
    }

    // Check required fields
    if (!this.config.version) {
      errors.push("Missing version field");
    }

    if (!this.config.methodologies) {
      errors.push("Missing methodologies section");
    }

    if (!this.config.standards) {
      errors.push("Missing standards section");
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
 * Utility function to get methodologies for a project
 */
export async function getProjectMethodologies(
  projectRoot?: string,
): Promise<string[]> {
  try {
    const manager = createProjectConfigManager(projectRoot);
    await manager.load();
    return manager.getMethodologies();
  } catch {
    return [];
  }
}

/**
 * Utility function to get default methodology for a project
 */
export async function getProjectDefaultMethodology(
  projectRoot?: string,
): Promise<string | undefined> {
  try {
    const manager = createProjectConfigManager(projectRoot);
    await manager.load();
    return manager.getDefaultMethodology();
  } catch {
    return undefined;
  }
}
