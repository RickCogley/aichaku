/**
 * Proof of Concept: Metadata Consolidation for Aichaku
 * 
 * This demonstrates how to consolidate 6+ metadata files into a single aichaku.json
 * Following the pattern of modern tools like pyproject.toml and package.json
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";

// Define the unified schema for the single configuration file
interface AichakuConfig {
  // Version of the config schema itself
  version: "2.0.0";
  
  // Project metadata (from .aichaku.json)
  project: {
    created: string;
    installedVersion?: string;
    lastUpdated?: string;
    methodology?: string;
    type?: "global" | "project";
  };
  
  // Selected standards (from standards.json + doc-standards.json)
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
    // Add other config options as needed
  };
  
  // Legacy markers (replacing .aichaku-project file)
  markers: {
    isAichakuProject: boolean;
    migrationVersion?: string;
  };
}

// Legacy file interfaces
interface LegacyAichakuJson {
  version?: string;
  installedVersion?: string;
  installDate?: string;
  lastUpdated?: string;
  type?: "global" | "project";
}

interface LegacyStandardsJson {
  version?: string;
  selected: string[];
}

interface LegacyConfigJson {
  outputPath?: string;
  enableHooks?: boolean;
  // ... other config fields
}

/**
 * Migrate from multiple metadata files to single aichaku.json
 */
export async function consolidateMetadata(projectRoot: string): Promise<void> {
  const aichakuDir = join(projectRoot, ".claude", "aichaku");
  const newConfigPath = join(aichakuDir, "aichaku.json");
  
  // Check if already migrated
  if (await exists(newConfigPath)) {
    console.log("✅ Already using consolidated aichaku.json");
    return;
  }
  
  console.log("🔄 Migrating to consolidated metadata format...");
  
  // Initialize the new config
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
      isAichakuProject: true,
    },
  };
  
  // Migrate .aichaku.json
  const legacyAichakuPath = join(aichakuDir, ".aichaku.json");
  if (await exists(legacyAichakuPath)) {
    try {
      const content = await Deno.readTextFile(legacyAichakuPath);
      const legacy: LegacyAichakuJson = JSON.parse(content);
      
      config.project.installedVersion = legacy.installedVersion;
      config.project.created = legacy.installDate || config.project.created;
      config.project.lastUpdated = legacy.lastUpdated;
      config.project.type = legacy.type;
      
      console.log("  ✓ Migrated .aichaku.json");
    } catch (e) {
      console.warn("  ⚠️ Failed to migrate .aichaku.json:", e.message);
    }
  }
  
  // Migrate standards.json (dev standards)
  const standardsPath = join(aichakuDir, "standards.json");
  const legacyStandardsPath = join(aichakuDir, ".aichaku-standards.json");
  
  for (const path of [standardsPath, legacyStandardsPath]) {
    if (await exists(path)) {
      try {
        const content = await Deno.readTextFile(path);
        const legacy: LegacyStandardsJson = JSON.parse(content);
        config.standards.development = legacy.selected || [];
        console.log(`  ✓ Migrated ${path.split("/").pop()}`);
        break;
      } catch (e) {
        console.warn(`  ⚠️ Failed to migrate ${path.split("/").pop()}:`, e.message);
      }
    }
  }
  
  // Migrate doc-standards.json
  const docStandardsPath = join(aichakuDir, "doc-standards.json");
  const legacyDocStandardsPath = join(aichakuDir, ".aichaku-doc-standards.json");
  
  for (const path of [docStandardsPath, legacyDocStandardsPath]) {
    if (await exists(path)) {
      try {
        const content = await Deno.readTextFile(path);
        const legacy: LegacyStandardsJson = JSON.parse(content);
        config.standards.documentation = legacy.selected || [];
        console.log(`  ✓ Migrated ${path.split("/").pop()}`);
        break;
      } catch (e) {
        console.warn(`  ⚠️ Failed to migrate ${path.split("/").pop()}:`, e.message);
      }
    }
  }
  
  // Migrate aichaku.config.json
  const configPath = join(aichakuDir, "aichaku.config.json");
  if (await exists(configPath)) {
    try {
      const content = await Deno.readTextFile(configPath);
      const legacy: LegacyConfigJson = JSON.parse(content);
      config.config = legacy;
      console.log("  ✓ Migrated aichaku.config.json");
    } catch (e) {
      console.warn("  ⚠️ Failed to migrate aichaku.config.json:", e.message);
    }
  }
  
  // Check for .aichaku-project marker
  const projectMarkerPath = join(aichakuDir, ".aichaku-project");
  if (await exists(projectMarkerPath)) {
    config.markers.isAichakuProject = true;
    console.log("  ✓ Detected .aichaku-project marker");
  }
  
  // Detect methodology from project structure
  const projectsDir = join(projectRoot, "docs", "projects");
  if (await exists(projectsDir)) {
    // Look for methodology-specific files
    const methodologyFiles = {
      "shape-up": ["pitch.md", "STATUS.md"],
      "scrum": ["sprint-planning.md", "retrospective.md"],
      "kanban": ["kanban-board.md"],
      "lean": ["experiment-plan.md"],
    };
    
    for (const [methodology, files] of Object.entries(methodologyFiles)) {
      for (const file of files) {
        try {
          const pattern = join(projectsDir, "**", file);
          // Simple check - in real implementation use glob
          if (await exists(join(projectsDir, "active", file))) {
            config.project.methodology = methodology;
            console.log(`  ✓ Detected ${methodology} methodology`);
            break;
          }
        } catch {
          // Continue checking
        }
      }
      if (config.project.methodology) break;
    }
  }
  
  // Write the consolidated config
  await Deno.writeTextFile(
    newConfigPath,
    JSON.stringify(config, null, 2)
  );
  
  console.log("\n✅ Created consolidated aichaku.json");
  
  // Clean up old files (in real implementation, do this after verification)
  if (await promptUser("Remove old metadata files?")) {
    await cleanupLegacyFiles(aichakuDir);
  }
}

/**
 * Clean up legacy metadata files after successful migration
 */
async function cleanupLegacyFiles(aichakuDir: string): Promise<void> {
  const filesToRemove = [
    ".aichaku.json",
    ".aichaku-project",
    ".aichaku-standards.json",
    "standards.json",
    ".aichaku-doc-standards.json", 
    "doc-standards.json",
    "aichaku.config.json",
  ];
  
  console.log("\n🧹 Cleaning up legacy files...");
  
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

/**
 * Load configuration from the consolidated file
 */
export async function loadConfig(projectRoot: string): Promise<AichakuConfig | null> {
  const configPath = join(projectRoot, ".claude", "aichaku", "aichaku.json");
  
  // Check new consolidated file first
  if (await exists(configPath)) {
    try {
      const content = await Deno.readTextFile(configPath);
      return JSON.parse(content) as AichakuConfig;
    } catch (e) {
      console.error("Failed to load aichaku.json:", e.message);
    }
  }
  
  // Fallback: try to load from legacy files
  console.log("⚠️ No consolidated config found, attempting legacy load...");
  return await loadLegacyConfig(projectRoot);
}

/**
 * Load configuration from legacy files (backward compatibility)
 */
async function loadLegacyConfig(projectRoot: string): Promise<AichakuConfig | null> {
  const aichakuDir = join(projectRoot, ".claude", "aichaku");
  
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
  
  // Try to load each legacy file
  // ... (similar to consolidateMetadata but just reading)
  
  return config;
}

/**
 * Update configuration in the consolidated file
 */
export async function updateConfig(
  projectRoot: string,
  updates: Partial<AichakuConfig>
): Promise<void> {
  const config = await loadConfig(projectRoot);
  if (!config) {
    throw new Error("No configuration found");
  }
  
  // Deep merge updates
  const updated = deepMerge(config, updates);
  
  const configPath = join(projectRoot, ".claude", "aichaku", "aichaku.json");
  await Deno.writeTextFile(
    configPath,
    JSON.stringify(updated, null, 2)
  );
}

/**
 * Example usage in commands
 */
export class ConfigManager {
  private config: AichakuConfig | null = null;
  private projectRoot: string;
  
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }
  
  async load(): Promise<void> {
    this.config = await loadConfig(this.projectRoot);
    if (!this.config) {
      throw new Error("Failed to load configuration");
    }
  }
  
  get(): AichakuConfig {
    if (!this.config) {
      throw new Error("Configuration not loaded");
    }
    return this.config;
  }
  
  async save(): Promise<void> {
    if (!this.config) {
      throw new Error("No configuration to save");
    }
    
    const configPath = join(this.projectRoot, ".claude", "aichaku", "aichaku.json");
    await Deno.writeTextFile(
      configPath,
      JSON.stringify(this.config, null, 2)
    );
  }
  
  // Convenience methods
  getStandards(): string[] {
    return [
      ...this.get().standards.development,
      ...this.get().standards.documentation,
    ];
  }
  
  isAichakuProject(): boolean {
    return this.get().markers.isAichakuProject;
  }
  
  getMethodology(): string | undefined {
    return this.get().project.methodology;
  }
}

// Helper functions
async function promptUser(message: string): Promise<boolean> {
  // In real implementation, use proper prompt
  console.log(`\n${message} [y/N]`);
  return false; // For POC, always return false
}

function deepMerge(target: any, source: any): any {
  // Simple deep merge implementation
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Example: How commands would use the new consolidated config
export async function exampleUpgradeCommand(projectRoot: string): Promise<void> {
  const configManager = new ConfigManager(projectRoot);
  
  try {
    await configManager.load();
  } catch {
    // No config found - not an Aichaku project
    console.log("No Aichaku installation found");
    return;
  }
  
  const config = configManager.get();
  
  console.log(`🌿 Upgrading Aichaku project (v${config.project.installedVersion || "unknown"})`);
  console.log(`   Methodology: ${config.project.methodology || "none"}`);
  console.log(`   Standards: ${config.standards.development.length + config.standards.documentation.length} selected`);
  
  // Perform upgrade...
  
  // Update version
  config.project.installedVersion = "0.29.0";
  config.project.lastUpdated = new Date().toISOString();
  
  await configManager.save();
}