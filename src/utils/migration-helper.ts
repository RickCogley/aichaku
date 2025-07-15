/**
 * Migration Helper for Aichaku Metadata Consolidation
 * 
 * This utility helps migrate existing Aichaku installations from the legacy
 * multiple-file format to the new consolidated aichaku.json format.
 */

import { exists } from "jsr:@std/fs@1.0.0";
import { join } from "jsr:@std/path@1.0.0";
import { getAichakuPaths } from "../paths.ts";
import { ConfigManager, globalConfig, getProjectConfig } from "./config-manager.ts";
import { Brand } from "./branded-messages.ts";

interface MigrationStatus {
  /** Whether the installation needs migration */
  needsMigration: boolean;
  /** Whether this is a global or project installation */
  type: "global" | "project" | "none";
  /** Path to the installation */
  path: string;
  /** List of legacy files found */
  legacyFiles: string[];
  /** Whether new format already exists */
  hasNewFormat: boolean;
}

interface MigrationResult {
  /** Whether migration was successful */
  success: boolean;
  /** List of files that were migrated */
  migratedFiles: string[];
  /** List of files that were cleaned up */
  cleanedFiles: string[];
  /** Error message if failed */
  error?: string;
}

/**
 * Check if a given path needs metadata migration
 */
export async function checkMigrationStatus(
  installationPath: string,
  isGlobal = false,
): Promise<MigrationStatus> {
  const aichakuDir = isGlobal 
    ? installationPath 
    : join(installationPath, ".claude", "aichaku");

  const status: MigrationStatus = {
    needsMigration: false,
    type: "none",
    path: installationPath,
    legacyFiles: [],
    hasNewFormat: false,
  };

  // Check if new format exists
  const newConfigPath = join(aichakuDir, "aichaku.json");
  status.hasNewFormat = await exists(newConfigPath);

  // Check for legacy files
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

  for (const file of legacyFiles) {
    const filePath = join(aichakuDir, file);
    if (await exists(filePath)) {
      status.legacyFiles.push(file);
    }
  }

  // Determine if migration is needed
  if (status.legacyFiles.length > 0) {
    status.needsMigration = !status.hasNewFormat; // Only migrate if new format doesn't exist
    status.type = isGlobal ? "global" : "project";
  }

  return status;
}

/**
 * Scan for all Aichaku installations that need migration
 */
export async function scanForMigrations(): Promise<{
  global: MigrationStatus;
  projects: MigrationStatus[];
}> {
  const paths = getAichakuPaths();
  const result = {
    global: await checkMigrationStatus(paths.global.root, true),
    projects: [] as MigrationStatus[],
  };

  // For now, we only check the current project
  // In the future, this could scan for multiple projects
  const currentProject = await checkMigrationStatus(Deno.cwd(), false);
  if (currentProject.needsMigration || currentProject.hasNewFormat) {
    result.projects.push(currentProject);
  }

  return result;
}

/**
 * Migrate a specific installation to the new format
 */
export async function migrateInstallation(
  installationPath: string,
  isGlobal = false,
  options: {
    dryRun?: boolean;
    silent?: boolean;
    cleanupLegacy?: boolean;
  } = {},
): Promise<MigrationResult> {
  const configManager = isGlobal 
    ? globalConfig 
    : getProjectConfig(installationPath);

  const result: MigrationResult = {
    success: false,
    migratedFiles: [],
    cleanedFiles: [],
  };

  try {
    if (options.dryRun) {
      if (!options.silent) {
        console.log(`[DRY RUN] Would migrate ${isGlobal ? "global" : "project"} installation at: ${installationPath}`);
      }
      
      // Check what would be migrated
      const status = await checkMigrationStatus(installationPath, isGlobal);
      
      if (status.needsMigration) {
        if (!options.silent) {
          console.log("[DRY RUN] Would migrate these legacy files:");
          for (const file of status.legacyFiles) {
            console.log(`  - ${file}`);
          }
          console.log("[DRY RUN] Would create: aichaku.json");
          
          if (options.cleanupLegacy) {
            console.log("[DRY RUN] Would clean up legacy files after migration");
          }
        }
        result.migratedFiles = status.legacyFiles;
      } else {
        if (!options.silent) {
          console.log("[DRY RUN] No migration needed");
        }
      }
      
      result.success = true;
      return result;
    }

    // Perform actual migration
    if (!options.silent) {
      Brand.progress(
        `Migrating ${isGlobal ? "global" : "project"} configuration...`,
        "active"
      );
    }

    const migrated = await configManager.migrate();
    
    if (migrated) {
      // Get the list of files that were migrated
      const status = await checkMigrationStatus(installationPath, isGlobal);
      result.migratedFiles = status.legacyFiles;
      
      if (!options.silent) {
        Brand.success("Configuration migrated to aichaku.json");
      }

      // Clean up legacy files if requested
      if (options.cleanupLegacy) {
        if (!options.silent) {
          Brand.progress("Cleaning up legacy files...", "active");
        }
        
        await configManager.cleanupLegacyFiles();
        result.cleanedFiles = status.legacyFiles;
        
        if (!options.silent) {
          Brand.success("Legacy files cleaned up");
        }
      }
      
      result.success = true;
    } else {
      result.error = "Migration was not needed or failed";
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Migrate all found installations
 */
export async function migrateAll(options: {
  dryRun?: boolean;
  silent?: boolean;
  cleanupLegacy?: boolean;
  includeProjects?: boolean;
} = {}): Promise<{
  global: MigrationResult;
  projects: MigrationResult[];
  summary: {
    totalMigrated: number;
    totalCleaned: number;
    errors: string[];
  };
}> {
  const installations = await scanForMigrations();
  const results = {
    global: { success: false, migratedFiles: [], cleanedFiles: [] } as MigrationResult,
    projects: [] as MigrationResult[],
    summary: {
      totalMigrated: 0,
      totalCleaned: 0,
      errors: [] as string[],
    },
  };

  // Migrate global installation
  if (installations.global.needsMigration) {
    if (!options.silent) {
      Brand.header("Migrating Global Installation");
    }
    
    results.global = await migrateInstallation(
      installations.global.path,
      true,
      options
    );
    
    if (results.global.success) {
      results.summary.totalMigrated += results.global.migratedFiles.length;
      results.summary.totalCleaned += results.global.cleanedFiles.length;
    } else if (results.global.error) {
      results.summary.errors.push(`Global: ${results.global.error}`);
    }
  } else if (!options.silent && installations.global.type !== "none") {
    Brand.info("Global installation already migrated");
  }

  // Migrate project installations
  if (options.includeProjects) {
    for (const project of installations.projects) {
      if (project.needsMigration) {
        if (!options.silent) {
          Brand.header(`Migrating Project: ${project.path}`);
        }
        
        const projectResult = await migrateInstallation(
          project.path,
          false,
          options
        );
        
        results.projects.push(projectResult);
        
        if (projectResult.success) {
          results.summary.totalMigrated += projectResult.migratedFiles.length;
          results.summary.totalCleaned += projectResult.cleanedFiles.length;
        } else if (projectResult.error) {
          results.summary.errors.push(`${project.path}: ${projectResult.error}`);
        }
      } else if (!options.silent) {
        Brand.info(`Project ${project.path} already migrated`);
      }
    }
  }

  return results;
}

/**
 * Generate a migration report
 */
export async function generateMigrationReport(): Promise<string> {
  const installations = await scanForMigrations();
  const lines: string[] = [];

  lines.push("# Aichaku Migration Report");
  lines.push(`Generated on: ${new Date().toISOString()}`);
  lines.push("");

  // Global installation
  lines.push("## Global Installation");
  if (installations.global.type === "none") {
    lines.push("- No global installation found");
  } else {
    lines.push(`- Path: ${installations.global.path}`);
    lines.push(`- Status: ${installations.global.hasNewFormat ? "✅ Migrated" : "🔄 Needs migration"}`);
    
    if (installations.global.legacyFiles.length > 0) {
      lines.push("- Legacy files found:");
      for (const file of installations.global.legacyFiles) {
        lines.push(`  - ${file}`);
      }
    }
  }

  lines.push("");

  // Project installations
  lines.push("## Project Installations");
  if (installations.projects.length === 0) {
    lines.push("- No project installations found in current directory");
  } else {
    for (const project of installations.projects) {
      lines.push(`### ${project.path}`);
      lines.push(`- Status: ${project.hasNewFormat ? "✅ Migrated" : "🔄 Needs migration"}`);
      
      if (project.legacyFiles.length > 0) {
        lines.push("- Legacy files found:");
        for (const file of project.legacyFiles) {
          lines.push(`  - ${file}`);
        }
      }
      lines.push("");
    }
  }

  // Summary
  const needsMigration = [installations.global, ...installations.projects]
    .filter(install => install.needsMigration);
    
  lines.push("## Summary");
  lines.push(`- Installations needing migration: ${needsMigration.length}`);
  
  if (needsMigration.length > 0) {
    lines.push("");
    lines.push("### Recommended Actions");
    lines.push("1. Run `aichaku migrate --dry-run` to preview changes");
    lines.push("2. Run `aichaku migrate` to perform migration");
    lines.push("3. Run `aichaku migrate --cleanup` to remove legacy files");
  }

  return lines.join("\n");
}

/**
 * Verify that a migration was successful
 */
export async function verifyMigration(
  installationPath: string,
  isGlobal = false,
): Promise<{
  success: boolean;
  newFormatExists: boolean;
  legacyFilesRemain: boolean;
  configValid: boolean;
  error?: string;
}> {
  const result = {
    success: false,
    newFormatExists: false,
    legacyFilesRemain: false,
    configValid: false,
  };

  try {
    // Check if new format exists and is valid
    const configManager = isGlobal 
      ? globalConfig 
      : getProjectConfig(installationPath);

    await configManager.load();
    const config = configManager.get();
    
    result.newFormatExists = true;
    result.configValid = config.version === "2.0.0" && config.markers.isAichakuProject;

    // Check if legacy files still exist
    const status = await checkMigrationStatus(installationPath, isGlobal);
    result.legacyFilesRemain = status.legacyFiles.length > 0;

    result.success = result.newFormatExists && result.configValid;

    return result;
  } catch (error) {
    return {
      ...result,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}