/**
 * Configuration Manager for Aichaku
 *
 * Handles consolidation of metadata from multiple files into a single aichaku.json
 * Provides backward compatibility during migration and type-safe configuration access
 */

import { exists } from "jsr:@std/fs@1";
import { join, SEPARATOR as sep } from "jsr:@std/path@1";
import { safeReadTextFile, safeWriteTextFile, validatePath } from "./path-security.ts";
import { z } from "zod";

// Zod schema for runtime validation
const AichakuConfigSchema = z.object({
  version: z.string(),
  installedAt: z.string().optional(),
  installationType: z.enum(["global", "local"]).optional(),
  lastUpgrade: z.string().optional(),
  methodologies: z.object({
    selected: z.array(z.string()),
    default: z.string().optional(),
  }).optional(),
  standards: z.object({
    selected: z.array(z.string()),
    customStandards: z.record(z.unknown()).optional(),
  }).optional(),
  principles: z.object({
    selected: z.array(z.string()),
    customPrinciples: z.record(z.unknown()).optional(),
  }).optional(),
  agents: z.object({
    selected: z.array(z.string()),
  }).optional(),
  config: z.object({
    outputPath: z.string().optional(),
    enableHooks: z.boolean().optional(),
    autoCommit: z.boolean().optional(),
    gitIntegration: z.boolean().optional(),
    customizations: z.record(z.unknown()).optional(),
  }).optional(),
});

// Unified schema for Aichaku configuration
export type AichakuConfig = z.infer<typeof AichakuConfigSchema>;

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
    // InfoSec: Validate project root to prevent path traversal (OWASP A01)
    this.projectRoot = validatePath(projectRoot, Deno.cwd());
    this.aichakuDir = join(this.projectRoot, ".claude", "aichaku");
    this.configPath = join(this.aichakuDir, "aichaku.json");
  }

  /**
   * Load configuration from consolidated file or migrate from legacy files
   */
  async load(): Promise<void> {
    // Try to load from consolidated file first
    if (await exists(this.configPath)) {
      try {
        // InfoSec: Use safe file read to prevent path traversal (OWASP A01)
        const content = await safeReadTextFile(this.configPath, this.projectRoot);
        const rawConfig = JSON.parse(content);

        // Validate and migrate config
        const validatedConfig = AichakuConfigSchema.safeParse(rawConfig);
        if (validatedConfig.success) {
          this.config = await this.migrateConfig(validatedConfig.data);
        } else {
          // Attempt migration first, then validate
          const migrated = await this.migrateConfig(rawConfig);
          this.config = AichakuConfigSchema.parse(migrated);
        }

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
      principles: {
        selected: [],
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
    } catch (_error) {
      // Directory already exists
    }

    // InfoSec: Use safe file write to prevent path traversal (OWASP A01)
    await safeWriteTextFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
      this.projectRoot,
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
      delete (this.config.standards as { version?: string }).version;
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
      principles: {
        selected: [],
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
   * Get selected principles
   */
  getPrinciples(): string[] {
    const config = this.get();
    return config.principles?.selected || [];
  }

  /**
   * Set principles for the project
   */
  async setPrinciples(principles: string[]): Promise<void> {
    const config = this.get();
    await this.update({
      ...config,
      principles: {
        ...config.principles,
        selected: principles,
      },
    });
  }

  /**
   * Add a principle to the project
   */
  async addPrinciple(principle: string): Promise<void> {
    const config = this.get();
    const current = config.principles?.selected || [];
    if (!current.includes(principle)) {
      await this.setPrinciples([...current, principle]);
    }
  }

  /**
   * Remove a principle from the project
   */
  async removePrinciple(principle: string): Promise<void> {
    const config = this.get();
    const current = config.principles?.selected || [];
    const updated = current.filter((p) => p !== principle);
    await this.setPrinciples(updated);
  }

  /**
   * Add agents to the project
   */
  async addAgents(agents: string[]): Promise<void> {
    const config = this.get();
    const current = config.agents?.selected || [];
    const newAgents = agents.filter((a) => !current.includes(a));
    if (newAgents.length > 0) {
      await this.update({
        ...config,
        agents: {
          selected: [...current, ...newAgents],
        },
      });
    }
  }

  /**
   * Remove agents from the project
   */
  async removeAgents(agents: string[]): Promise<void> {
    const config = this.get();
    const current = config.agents?.selected || [];
    const updated = current.filter((a) => !agents.includes(a));
    await this.update({
      ...config,
      agents: {
        selected: updated,
      },
    });
  }

  /**
   * Get selected agents
   */
  getSelectedAgents(): string[] {
    return this.get().agents?.selected || [];
  }

  /**
   * Migrate configuration to latest format
   */
  private migrateConfig(rawConfig: unknown): AichakuConfig {
    const typedConfig = rawConfig as {
      version?: string;
      installedAt?: string;
      installDate?: string;
      installationType?: "global" | "local";
      lastUpgrade?: string;
      lastUpdated?: string;
      methodologies?: {
        selected?: string[];
        default?: string;
      };
      standards?: {
        selected?: string[];
        development?: string[];
        documentation?: string[];
      };
      principles?: {
        selected?: string[];
      };
      agents?: {
        selected?: string[];
      };
      project?: {
        methodology?: string;
        created?: string;
        lastUpdated?: string;
      };
      config?: unknown;
    };
    const config: AichakuConfig = {
      version: typedConfig.version || "0.36.2",
      installedAt: typedConfig.installedAt || typedConfig.installDate || new Date().toISOString(),
      installationType: (typedConfig.installationType || "local") as "global" | "local",
      lastUpgrade: typedConfig.lastUpgrade || typedConfig.lastUpdated,
      methodologies: {
        selected: [],
      },
      standards: {
        selected: [],
      },
      principles: {
        selected: [],
      },
      agents: {
        selected: [],
      },
    };

    // Migrate methodologies
    if (typedConfig.methodologies?.selected) {
      config.methodologies!.selected = typedConfig.methodologies.selected;
    } else if (typedConfig.project?.methodology) {
      // Migrate from old single methodology format
      config.methodologies!.selected = [typedConfig.project.methodology];
    }

    // Set default methodology
    if (config.methodologies!.selected.length > 0) {
      config.methodologies!.default = typedConfig.methodologies?.default || config.methodologies!.selected[0];
    }

    // Migrate standards (remove version field)
    if (typedConfig.standards?.selected) {
      config.standards!.selected = typedConfig.standards.selected;
    } else if (typedConfig.standards?.development || typedConfig.standards?.documentation) {
      // Migrate from old split standards format
      config.standards!.selected = [
        ...(typedConfig.standards.development || []),
        ...(typedConfig.standards.documentation || []),
      ];
    }

    // Migrate principles if present
    if (typedConfig.principles?.selected) {
      config.principles!.selected = typedConfig.principles.selected;
    }

    // Migrate agents if present
    if (typedConfig.agents?.selected) {
      config.agents!.selected = typedConfig.agents.selected;
    }

    // Skip migrating project info - no longer needed

    // Migrate config section if present
    if (typedConfig.config) {
      config.config = typedConfig.config;
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

    if (!this.config.principles) {
      errors.push("Missing principles section");
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
  let root = projectRoot || Deno.cwd();

  // Prevent nested .claude/aichaku structures
  // If we're inside a .claude/aichaku directory, find the actual project root
  const pathParts = root.split(sep);
  const claudeIndex = pathParts.lastIndexOf(".claude");

  if (claudeIndex !== -1 && claudeIndex < pathParts.length - 1 && pathParts[claudeIndex + 1] === "aichaku") {
    // We're inside .claude/aichaku, go back to the actual project root
    root = pathParts.slice(0, claudeIndex).join(sep);
  }

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
