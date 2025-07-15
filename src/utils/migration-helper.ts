/**
 * Migration Helper Utilities
 *
 * Provides utilities for migrating between different configuration formats
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { ConfigManager } from "./config-manager.ts";

export interface MigrationStatus {
  needsMigration: boolean;
  legacyFilesFound: string[];
  consolidatedExists: boolean;
  hasBackup: boolean;
}

export interface MigrationResult {
  success: boolean;
  migratedFiles: string[];
  errors: string[];
  consolidatedConfigPath: string;
}

/**
 * Check if a project needs migration from legacy files
 */
export async function checkMigrationStatus(
  projectRoot: string,
): Promise<MigrationStatus> {
  const aichakuDir = join(projectRoot, ".claude", "aichaku");
  const consolidatedPath = join(aichakuDir, "aichaku.json");

  const consolidatedExists = await exists(consolidatedPath);

  const legacyFiles = [
    ".aichaku.json",
    ".aichaku-project",
    "aichaku-standards.json",
    "standards.json",
    "aichaku.config.json",
    ".aichaku-standards.json",
    "doc-standards.json",
    ".aichaku-doc-standards.json",
  ];

  const legacyFilesFound: string[] = [];
  for (const file of legacyFiles) {
    const filePath = join(aichakuDir, file);
    if (await exists(filePath)) {
      legacyFilesFound.push(file);
    }
  }

  const backupPath = join(aichakuDir, "aichaku.json.backup");
  const hasBackup = await exists(backupPath);

  return {
    needsMigration: !consolidatedExists && legacyFilesFound.length > 0,
    legacyFilesFound,
    consolidatedExists,
    hasBackup,
  };
}

/**
 * Perform migration with backup and verification
 */
export async function performMigration(
  projectRoot: string,
  options: {
    createBackup?: boolean;
    cleanupLegacy?: boolean;
    dryRun?: boolean;
  } = {},
): Promise<MigrationResult> {
  const { createBackup = true, cleanupLegacy = false, dryRun = false } =
    options;

  const result: MigrationResult = {
    success: false,
    migratedFiles: [],
    errors: [],
    consolidatedConfigPath: join(
      projectRoot,
      ".claude",
      "aichaku",
      "aichaku.json",
    ),
  };

  try {
    const status = await checkMigrationStatus(projectRoot);

    if (!status.needsMigration) {
      result.success = true;
      result.errors.push(
        "No migration needed - consolidated config already exists or no legacy files found",
      );
      return result;
    }

    if (dryRun) {
      result.success = true;
      result.migratedFiles = status.legacyFilesFound;
      result.errors.push("Dry run - no actual migration performed");
      return result;
    }

    // Create backup of existing consolidated config if it exists
    if (createBackup && status.consolidatedExists) {
      await createBackupFile(result.consolidatedConfigPath);
    }

    // Perform migration using ConfigManager
    const configManager = new ConfigManager(projectRoot);
    await configManager.load();

    // Verify migration was successful
    const _config = configManager.get();
    const integrity = configManager.verifyIntegrity();

    if (!integrity.valid) {
      result.errors.push(
        `Migration verification failed: ${integrity.errors.join(", ")}`,
      );
      return result;
    }

    result.migratedFiles = status.legacyFilesFound;
    result.success = true;

    // Optionally clean up legacy files
    if (cleanupLegacy) {
      await configManager.cleanupLegacyFiles();
    }
  } catch (error) {
    result.errors.push(`Migration failed: ${(error as Error).message}`);
  }

  return result;
}

/**
 * Create a backup of a configuration file
 */
export async function createBackupFile(configPath: string): Promise<string> {
  if (!await exists(configPath)) {
    throw new Error(`Cannot backup file that doesn't exist: ${configPath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${configPath}.backup-${timestamp}`;

  const content = await Deno.readTextFile(configPath);
  await Deno.writeTextFile(backupPath, content);

  return backupPath;
}

/**
 * Restore from a backup file
 */
export async function restoreFromBackup(
  backupPath: string,
  targetPath: string,
): Promise<void> {
  if (!await exists(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  const content = await Deno.readTextFile(backupPath);
  await Deno.writeTextFile(targetPath, content);
}

/**
 * List available backup files for a configuration
 */
export async function listBackups(configPath: string): Promise<string[]> {
  const dir = configPath.substring(0, configPath.lastIndexOf("/"));
  const filename = configPath.substring(configPath.lastIndexOf("/") + 1);

  const backups: string[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.startsWith(`${filename}.backup-`)) {
        backups.push(join(dir, entry.name));
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return backups.sort().reverse(); // Most recent first
}

/**
 * Validate a configuration file against the schema
 */
export async function validateConfiguration(
  configPath: string,
): Promise<{ valid: boolean; errors: string[] }> {
  if (!await exists(configPath)) {
    return { valid: false, errors: ["Configuration file not found"] };
  }

  try {
    const content = await Deno.readTextFile(configPath);
    const config = JSON.parse(content);

    const errors: string[] = [];

    // Check basic structure
    if (config.version !== "2.0.0") {
      errors.push("Invalid or missing version field");
    }

    if (!config.project || typeof config.project !== "object") {
      errors.push("Missing or invalid project section");
    }

    if (!config.standards || typeof config.standards !== "object") {
      errors.push("Missing or invalid standards section");
    }

    if (!config.config || typeof config.config !== "object") {
      errors.push("Missing or invalid config section");
    }

    if (!config.markers || typeof config.markers !== "object") {
      errors.push("Missing or invalid markers section");
    }

    // Check required fields
    if (config.project && !config.project.created) {
      errors.push("Missing project.created field");
    }

    if (config.standards) {
      if (!Array.isArray(config.standards.development)) {
        errors.push("standards.development must be an array");
      }
      if (!Array.isArray(config.standards.documentation)) {
        errors.push("standards.documentation must be an array");
      }
      if (
        !config.standards.custom || typeof config.standards.custom !== "object"
      ) {
        errors.push("standards.custom must be an object");
      }
    }

    if (
      config.markers && typeof config.markers.isAichakuProject !== "boolean"
    ) {
      errors.push("markers.isAichakuProject must be a boolean");
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse configuration: ${(error as Error).message}`],
    };
  }
}

/**
 * Compare two configuration files and return differences
 */
export async function compareConfigurations(
  path1: string,
  path2: string,
): Promise<{ differences: string[]; identical: boolean }> {
  const differences: string[] = [];

  if (!await exists(path1)) {
    differences.push(`First file not found: ${path1}`);
  }

  if (!await exists(path2)) {
    differences.push(`Second file not found: ${path2}`);
  }

  if (differences.length > 0) {
    return { differences, identical: false };
  }

  try {
    const content1 = await Deno.readTextFile(path1);
    const content2 = await Deno.readTextFile(path2);

    const config1 = JSON.parse(content1);
    const config2 = JSON.parse(content2);

    // Deep comparison of configuration objects
    compareObjects(config1, config2, "", differences);

    return { differences, identical: differences.length === 0 };
  } catch (error) {
    differences.push(`Comparison failed: ${(error as Error).message}`);
    return { differences, identical: false };
  }
}

/**
 * Recursively compare two objects and record differences
 */
function compareObjects(
  obj1: unknown,
  obj2: unknown,
  path: string,
  differences: string[],
): void {
  const keys1 = Object.keys(obj1 || {});
  const keys2 = Object.keys(obj2 || {});
  const allKeys = new Set([...keys1, ...keys2]);

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in obj1)) {
      differences.push(
        `Missing in first: ${currentPath} = ${JSON.stringify(obj2[key])}`,
      );
    } else if (!(key in obj2)) {
      differences.push(
        `Missing in second: ${currentPath} = ${JSON.stringify(obj1[key])}`,
      );
    } else if (typeof obj1[key] !== typeof obj2[key]) {
      differences.push(
        `Type mismatch at ${currentPath}: ${typeof obj1[key]} vs ${typeof obj2[
          key
        ]}`,
      );
    } else if (
      typeof obj1[key] === "object" && obj1[key] !== null && obj2[key] !== null
    ) {
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          differences.push(
            `Array difference at ${currentPath}: ${
              JSON.stringify(obj1[key])
            } vs ${JSON.stringify(obj2[key])}`,
          );
        }
      } else if (!Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) {
        compareObjects(obj1[key], obj2[key], currentPath, differences);
      } else {
        differences.push(
          `Structure mismatch at ${currentPath}: array vs object`,
        );
      }
    } else if (obj1[key] !== obj2[key]) {
      differences.push(
        `Value difference at ${currentPath}: ${JSON.stringify(obj1[key])} vs ${
          JSON.stringify(obj2[key])
        }`,
      );
    }
  }
}

/**
 * Generate a migration report
 */
export async function generateMigrationReport(
  projectRoot: string,
): Promise<string> {
  const status = await checkMigrationStatus(projectRoot);
  const configPath = join(projectRoot, ".claude", "aichaku", "aichaku.json");

  let report = "# Aichaku Configuration Migration Report\n\n";
  report += `**Project Root:** ${projectRoot}\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n\n`;

  // Migration Status
  report += "## Migration Status\n\n";
  report += `- **Needs Migration:** ${status.needsMigration ? "Yes" : "No"}\n`;
  report += `- **Consolidated Config Exists:** ${
    status.consolidatedExists ? "Yes" : "No"
  }\n`;
  report += `- **Has Backup:** ${status.hasBackup ? "Yes" : "No"}\n`;
  report += `- **Legacy Files Found:** ${status.legacyFilesFound.length}\n\n`;

  if (status.legacyFilesFound.length > 0) {
    report += "### Legacy Files\n\n";
    for (const file of status.legacyFilesFound) {
      report += `- ${file}\n`;
    }
    report += "\n";
  }

  // Configuration Validation
  if (status.consolidatedExists) {
    report += "## Configuration Validation\n\n";
    const validation = await validateConfiguration(configPath);
    report += `- **Valid:** ${validation.valid ? "Yes" : "No"}\n`;

    if (validation.errors.length > 0) {
      report += "- **Errors:**\n";
      for (const error of validation.errors) {
        report += `  - ${error}\n`;
      }
    }
    report += "\n";
  }

  // Available Backups
  if (status.consolidatedExists) {
    const backups = await listBackups(configPath);
    if (backups.length > 0) {
      report += "## Available Backups\n\n";
      for (const backup of backups) {
        const filename = backup.substring(backup.lastIndexOf("/") + 1);
        report += `- ${filename}\n`;
      }
      report += "\n";
    }
  }

  // Recommendations
  report += "## Recommendations\n\n";
  if (status.needsMigration) {
    report += "- Run migration to consolidate legacy files\n";
    report += "- Create backup before migration\n";
    report += "- Verify configuration after migration\n";
  } else if (status.consolidatedExists) {
    report += "- Configuration is up to date\n";
    if (status.legacyFilesFound.length > 0) {
      report += "- Consider cleaning up remaining legacy files\n";
    }
  } else {
    report += "- No Aichaku configuration found\n";
    report += "- Initialize project with `aichaku init`\n";
  }

  return report;
}
