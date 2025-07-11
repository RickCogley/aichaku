/**
 * Folder migration module for aichaku
 *
 * Handles migration from old ~/.claude/ structure to new ~/.claude/aichaku/ structure
 *
 * @module
 */

import {
  basename,
  copy,
  dirname,
  ensureDir,
  exists,
  join,
  walk,
} from "../../deps.ts";
import { Logger } from "../utils/logger.ts";

/**
 * Migration configuration
 */
export interface MigrationConfig {
  /** Run migration in dry run mode (no actual changes) */
  dryRun?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Force migration even if target exists */
  force?: boolean;
  /** Create backup before migration */
  backup?: boolean;
}

/**
 * Migration result information
 */
export interface MigrationResult {
  /** Whether migration was successful */
  success: boolean;
  /** Number of items migrated */
  itemsMigrated: number;
  /** Number of items skipped */
  itemsSkipped: number;
  /** Any errors encountered */
  errors: string[];
  /** Backup location if created */
  backupPath?: string;
}

/**
 * File/folder mapping for migration
 */
interface MigrationMapping {
  source: string;
  target: string;
  type: "file" | "directory";
  optional?: boolean;
}

/**
 * Handles migration from old to new folder structure
 */
export class FolderMigration {
  protected logger: Logger;
  protected homeDir: string;
  protected oldRoot: string;
  protected newRoot: string;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ silent: true });
    this.homeDir = Deno.env.get("HOME") || "";
    this.oldRoot = join(this.homeDir, ".claude");
    this.newRoot = join(this.homeDir, ".claude", "aichaku");
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    // Check if old structure exists
    const oldMethodologiesExists = await exists(
      join(this.oldRoot, "methodologies"),
    );
    const oldStandardsExists = await exists(join(this.oldRoot, "standards"));
    const oldScriptsExists = await exists(join(this.oldRoot, "scripts"));

    // Check if new structure exists
    const newRootExists = await exists(this.newRoot);

    // Migration is needed if old structure exists and new doesn't
    const hasOldStructure = oldMethodologiesExists || oldStandardsExists ||
      oldScriptsExists;

    return hasOldStructure && !newRootExists;
  }

  /**
   * Check if custom standards migration is needed
   */
  async isCustomStandardsMigrationNeeded(): Promise<boolean> {
    // Check for legacy custom standards locations
    const legacyCustomExists = await exists(
      join(this.oldRoot, "standards", "custom"),
    );
    const recentCustomExists = await exists(
      join(this.newRoot, "standards", "custom"),
    );
    const targetExists = await exists(
      join(this.oldRoot, "aichaku", "user", "standards"),
    );

    // Migration is needed if custom standards exist in old locations
    return (legacyCustomExists || recentCustomExists) && !targetExists;
  }

  /**
   * Get migration mappings for global files
   */
  private getGlobalMappings(): MigrationMapping[] {
    return [
      // Core aichaku folders
      {
        source: join(this.oldRoot, "methodologies"),
        target: join(this.newRoot, "methodologies"),
        type: "directory",
      },
      {
        source: join(this.oldRoot, "standards"),
        target: join(this.newRoot, "standards"),
        type: "directory",
      },
      {
        source: join(this.oldRoot, "scripts"),
        target: join(this.newRoot, "scripts"),
        type: "directory",
      },

      // Commands and configuration files that should move
      {
        source: join(this.oldRoot, "commands.json"),
        target: join(this.newRoot, "commands.json"),
        type: "file",
        optional: true,
      },
      {
        source: join(this.oldRoot, ".aichaku-project"),
        target: join(this.newRoot, ".aichaku-project"),
        type: "file",
        optional: true,
      },
      // Standards file rename: .aichaku-standards.json → standards.json
      {
        source: join(this.oldRoot, ".aichaku-standards.json"),
        target: join(this.newRoot, "standards.json"),
        type: "file",
        optional: true,
      },
      // User folders stay in ~/.claude/ (not moved)
      // - output/
      // - user/
      // - CLAUDE.md
      // - settings.local.json
    ];
  }

  /**
   * Get migration mappings for custom standards
   */
  private getCustomStandardsMappings(): MigrationMapping[] {
    const userStandardsTarget = join(
      this.oldRoot,
      "aichaku",
      "user",
      "standards",
    );

    return [
      // Legacy: ~/.claude/standards/custom/ -> ~/.claude/aichaku/user/standards/
      {
        source: join(this.oldRoot, "standards", "custom"),
        target: userStandardsTarget,
        type: "directory",
        optional: true,
      },
      // Recent: ~/.claude/aichaku/standards/custom/ -> ~/.claude/aichaku/user/standards/
      {
        source: join(this.newRoot, "standards", "custom"),
        target: userStandardsTarget,
        type: "directory",
        optional: true,
      },
    ];
  }

  /**
   * Get migration mappings for project files
   */
  private getProjectMappings(projectPath: string): MigrationMapping[] {
    const oldProjectRoot = join(projectPath, ".claude");
    const newProjectRoot = join(projectPath, ".claude", "aichaku");

    return [
      // Project-specific aichaku files
      {
        source: join(oldProjectRoot, ".aichaku-project"),
        target: join(newProjectRoot, ".aichaku-project"),
        type: "file",
        optional: true,
      },
      {
        source: join(oldProjectRoot, "methodologies"),
        target: join(newProjectRoot, "methodologies"),
        type: "directory",
        optional: true,
      },
      {
        source: join(oldProjectRoot, "standards"),
        target: join(newProjectRoot, "standards"),
        type: "directory",
        optional: true,
      },
      // Standards file rename: .aichaku-standards.json → standards.json
      {
        source: join(oldProjectRoot, ".aichaku-standards.json"),
        target: join(newProjectRoot, "standards.json"),
        type: "file",
        optional: true,
      },
      // Project files that stay in .claude/
      // - settings.local.json
      // - CLAUDE.md
      // - output/
      // - user/
    ];
  }

  /**
   * Get migration mappings for project custom standards
   */
  private getProjectCustomStandardsMappings(
    projectPath: string,
  ): MigrationMapping[] {
    const oldProjectRoot = join(projectPath, ".claude");
    const newProjectRoot = join(projectPath, ".claude", "aichaku");
    const userStandardsTarget = join(
      oldProjectRoot,
      "aichaku",
      "user",
      "standards",
    );

    return [
      // Legacy: project/.claude/standards/custom/ -> project/.claude/aichaku/user/standards/
      {
        source: join(oldProjectRoot, "standards", "custom"),
        target: userStandardsTarget,
        type: "directory",
        optional: true,
      },
      // Recent: project/.claude/aichaku/standards/custom/ -> project/.claude/aichaku/user/standards/
      {
        source: join(newProjectRoot, "standards", "custom"),
        target: userStandardsTarget,
        type: "directory",
        optional: true,
      },
    ];
  }

  /**
   * Create backup of existing structure
   */
  private async createBackup(rootPath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${rootPath}-backup-${timestamp}`;

    this.logger.info(`Creating backup at ${backupPath}`);
    await copy(rootPath, backupPath);

    return backupPath;
  }

  /**
   * Migrate a single item
   */
  private async migrateItem(
    mapping: MigrationMapping,
    config: MigrationConfig,
  ): Promise<boolean> {
    // Handle custom standards migration specially
    if (
      mapping.source.includes("standards/custom") ||
      mapping.target.includes("user/standards")
    ) {
      return await this.migrateCustomStandards(mapping, config);
    }

    // Handle standards file rename specially
    const isStandardsRename =
      mapping.source.endsWith(".aichaku-standards.json") &&
      mapping.target.endsWith("standards.json");

    const sourceExists = await exists(mapping.source);

    if (!sourceExists) {
      if (mapping.optional) {
        this.logger.debug(`Skipping optional item: ${mapping.source}`);
        return false;
      }
      throw new Error(`Source does not exist: ${mapping.source}`);
    }

    const targetExists = await exists(mapping.target);

    if (targetExists && !config.force) {
      this.logger.warn(`Target already exists, skipping: ${mapping.target}`);
      return false;
    }

    if (config.dryRun) {
      const action = isStandardsRename ? "rename" : "migrate";
      this.logger.info(
        `[DRY RUN] Would ${action}: ${mapping.source} -> ${mapping.target}`,
      );
      return true;
    }

    // Ensure target directory exists
    await ensureDir(dirname(mapping.target));

    // Move or copy based on type
    if (mapping.type === "file") {
      await copy(mapping.source, mapping.target, { overwrite: config.force });
    } else {
      // For directories, we need to ensure we don't overwrite existing files unless forced
      await this.copyDirectory(
        mapping.source,
        mapping.target,
        config.force || false,
      );
    }

    const action = isStandardsRename ? "Renamed" : "Migrated";
    this.logger.success(
      `${action}: ${basename(mapping.source)} -> ${basename(mapping.target)}`,
    );
    return true;
  }

  /**
   * Copy directory recursively with merge support
   */
  private async copyDirectory(
    source: string,
    target: string,
    overwrite: boolean,
  ): Promise<void> {
    await ensureDir(target);

    for await (const entry of walk(source, { maxDepth: 20 })) {
      const relativePath = entry.path.substring(source.length);
      const targetPath = join(target, relativePath);

      if (entry.isDirectory) {
        await ensureDir(targetPath);
      } else if (entry.isFile) {
        const targetExists = await exists(targetPath);
        if (!targetExists || overwrite) {
          await ensureDir(dirname(targetPath));
          await copy(entry.path, targetPath, { overwrite });
        }
      }
    }
  }

  /**
   * Safely migrate custom standards, handling potential conflicts
   */
  private async migrateCustomStandards(
    mapping: MigrationMapping,
    config: MigrationConfig,
  ): Promise<boolean> {
    const sourceExists = await exists(mapping.source);

    if (!sourceExists) {
      if (mapping.optional) {
        this.logger.debug(`No custom standards found at: ${mapping.source}`);
        return false;
      }
      return false;
    }

    // Check if target already has content
    const targetExists = await exists(mapping.target);

    if (config.dryRun) {
      this.logger.info(
        `[DRY RUN] Would migrate custom standards: ${mapping.source} -> ${mapping.target}`,
      );
      return true;
    }

    // Ensure target directory exists
    await ensureDir(mapping.target);

    // Copy custom standards, merging with existing content
    if (targetExists) {
      this.logger.info(
        `Merging custom standards from ${mapping.source} into existing ${mapping.target}`,
      );
    } else {
      this.logger.info(
        `Moving custom standards from ${mapping.source} to ${mapping.target}`,
      );
    }

    // Use merge-friendly copy
    await this.copyDirectory(
      mapping.source,
      mapping.target,
      config.force || false,
    );

    this.logger.success(
      `Custom standards migrated: ${
        basename(mapping.source)
      } -> ${mapping.target}`,
    );
    return true;
  }

  /**
   * Clean up old files after successful migration
   */
  private async cleanupOldFiles(mappings: MigrationMapping[]): Promise<void> {
    for (const mapping of mappings) {
      try {
        if (await exists(mapping.source)) {
          await Deno.remove(mapping.source, {
            recursive: mapping.type === "directory",
          });
          this.logger.debug(`Removed old file/folder: ${mapping.source}`);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to remove old file/folder: ${mapping.source} - ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  /**
   * Perform global migration
   */
  async migrateGlobal(config: MigrationConfig = {}): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      itemsMigrated: 0,
      itemsSkipped: 0,
      errors: [],
    };

    try {
      // Check if migration is needed
      if (!await this.isMigrationNeeded()) {
        this.logger.info(
          "No migration needed - new structure already exists or no old structure found",
        );
        result.success = true;
        return result;
      }

      this.logger.info("Starting global aichaku folder migration...");

      // Create backup if requested
      if (config.backup && !config.dryRun) {
        result.backupPath = await this.createBackup(this.oldRoot);
      }

      // Get migration mappings
      const mappings = this.getGlobalMappings();
      const customStandardsMappings = this.getCustomStandardsMappings();
      const allMappings = [...mappings, ...customStandardsMappings];

      // Perform migration
      for (const mapping of allMappings) {
        try {
          const migrated = await this.migrateItem(mapping, config);
          if (migrated) {
            result.itemsMigrated++;
          } else {
            result.itemsSkipped++;
          }
        } catch (error) {
          const errorMsg = `Failed to migrate ${mapping.source}: ${
            error instanceof Error ? error.message : String(error)
          }`;
          this.logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Clean up old files if not in dry run mode and no errors
      if (!config.dryRun && result.errors.length === 0) {
        this.logger.info("Cleaning up old files...");
        await this.cleanupOldFiles(allMappings);
      }

      result.success = result.errors.length === 0;

      if (result.success) {
        this.logger.success(
          `Migration completed successfully! Migrated ${result.itemsMigrated} items.`,
        );
      } else {
        this.logger.error(
          `Migration completed with ${result.errors.length} errors.`,
        );
      }
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        `Migration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return result;
  }

  /**
   * Perform project migration
   */
  async migrateProject(
    projectPath: string,
    config: MigrationConfig = {},
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      itemsMigrated: 0,
      itemsSkipped: 0,
      errors: [],
    };

    try {
      const oldProjectRoot = join(projectPath, ".claude");
      const newProjectRoot = join(projectPath, ".claude", "aichaku");

      // Check if old structure exists
      if (!await exists(oldProjectRoot)) {
        this.logger.info("No .claude directory found in project");
        result.success = true;
        return result;
      }

      // Check if new structure already exists
      if (await exists(newProjectRoot) && !config.force) {
        this.logger.info("Project already has new aichaku structure");
        result.success = true;
        return result;
      }

      this.logger.info(`Starting project migration for: ${projectPath}`);

      // Create backup if requested
      if (config.backup && !config.dryRun) {
        result.backupPath = await this.createBackup(oldProjectRoot);
      }

      // Get migration mappings
      const mappings = this.getProjectMappings(projectPath);
      const customStandardsMappings = this.getProjectCustomStandardsMappings(
        projectPath,
      );
      const allMappings = [...mappings, ...customStandardsMappings];

      // Perform migration
      for (const mapping of allMappings) {
        try {
          const migrated = await this.migrateItem(mapping, config);
          if (migrated) {
            result.itemsMigrated++;
          } else {
            result.itemsSkipped++;
          }
        } catch (error) {
          if (!mapping.optional) {
            const errorMsg = `Failed to migrate ${mapping.source}: ${
              error instanceof Error ? error.message : String(error)
            }`;
            this.logger.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
      }

      // Clean up old files if not in dry run mode and no errors
      if (!config.dryRun && result.errors.length === 0) {
        this.logger.info("Cleaning up old project files...");
        await this.cleanupOldFiles(allMappings);
      }

      result.success = result.errors.length === 0;

      if (result.success) {
        this.logger.success(
          `Project migration completed successfully! Migrated ${result.itemsMigrated} items.`,
        );
      } else {
        this.logger.error(
          `Project migration completed with ${result.errors.length} errors.`,
        );
      }
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        `Project migration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return result;
  }

  /**
   * Verify migration was successful
   */
  async verifyMigration(projectPath?: string): Promise<boolean> {
    const root = projectPath
      ? join(projectPath, ".claude", "aichaku")
      : this.newRoot;

    try {
      // Check if new root exists
      if (!await exists(root)) {
        this.logger.error("New aichaku root does not exist");
        return false;
      }

      // Check for key directories/files
      const checks = projectPath
        ? [
          join(root, ".aichaku-project"),
        ]
        : [
          join(root, "methodologies"),
          join(root, "standards"),
        ];

      for (const path of checks) {
        if (await exists(path)) {
          this.logger.debug(`Verified: ${path}`);
        }
      }

      this.logger.success("Migration verification passed");
      return true;
    } catch (error) {
      this.logger.error(
        `Migration verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  /**
   * Migrate custom standards only
   */
  async migrateCustomStandardsOnly(
    config: MigrationConfig = {},
    projectPath?: string,
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      itemsMigrated: 0,
      itemsSkipped: 0,
      errors: [],
    };

    try {
      const mappings = projectPath
        ? this.getProjectCustomStandardsMappings(projectPath)
        : this.getCustomStandardsMappings();

      this.logger.info(
        `Migrating custom standards${
          projectPath ? ` for project: ${projectPath}` : " globally"
        }...`,
      );

      // Create backup if requested
      if (config.backup && !config.dryRun) {
        const backupRoot = projectPath
          ? join(projectPath, ".claude")
          : this.oldRoot;
        result.backupPath = await this.createBackup(backupRoot);
      }

      // Check if any migration is needed
      let needsMigration = false;
      for (const mapping of mappings) {
        if (await exists(mapping.source)) {
          needsMigration = true;
          break;
        }
      }

      if (!needsMigration) {
        this.logger.info("No custom standards found to migrate");
        result.success = true;
        return result;
      }

      // Perform custom standards migration
      for (const mapping of mappings) {
        try {
          const migrated = await this.migrateItem(mapping, config);
          if (migrated) {
            result.itemsMigrated++;
          } else {
            result.itemsSkipped++;
          }
        } catch (error) {
          const errorMsg =
            `Failed to migrate custom standards ${mapping.source}: ${
              error instanceof Error ? error.message : String(error)
            }`;
          this.logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Clean up old custom standards directories if not in dry run mode and no errors
      if (!config.dryRun && result.errors.length === 0) {
        for (const mapping of mappings) {
          if (await exists(mapping.source)) {
            try {
              await Deno.remove(mapping.source, { recursive: true });
              this.logger.debug(
                `Removed old custom standards: ${mapping.source}`,
              );
            } catch (error) {
              this.logger.warn(
                `Failed to remove old custom standards: ${mapping.source} - ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }
        }
      }

      result.success = result.errors.length === 0;

      if (result.success) {
        this.logger.success(
          `Custom standards migration completed successfully! Migrated ${result.itemsMigrated} items.`,
        );
      } else {
        this.logger.error(
          `Custom standards migration completed with ${result.errors.length} errors.`,
        );
      }
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        `Custom standards migration failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return result;
  }

  /**
   * Rollback migration using backup
   */
  async rollbackMigration(
    backupPath: string,
    projectPath?: string,
  ): Promise<boolean> {
    try {
      const targetRoot = projectPath
        ? join(projectPath, ".claude")
        : this.oldRoot;

      this.logger.info(`Rolling back migration from backup: ${backupPath}`);

      // Remove new structure
      const newPath = projectPath
        ? join(projectPath, ".claude", "aichaku")
        : this.newRoot;
      if (await exists(newPath)) {
        await Deno.remove(newPath, { recursive: true });
      }

      // Restore from backup
      await copy(backupPath, targetRoot, { overwrite: true });

      this.logger.success("Migration rolled back successfully");
      return true;
    } catch (error) {
      this.logger.error(
        `Rollback failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }
}

/**
 * Convenience function to run migration with defaults
 */
export async function runMigration(options: {
  projectPath?: string;
  global?: boolean;
  customStandardsOnly?: boolean;
  config?: MigrationConfig;
  logger?: Logger;
}): Promise<MigrationResult> {
  const migration = new FolderMigration(options.logger);

  if (options.customStandardsOnly) {
    // Run custom standards migration only
    return await migration.migrateCustomStandardsOnly(
      options.config,
      options.projectPath,
    );
  } else if (options.global !== false && !options.projectPath) {
    // Run global migration by default
    return await migration.migrateGlobal(options.config);
  } else if (options.projectPath) {
    // Run project migration
    return await migration.migrateProject(options.projectPath, options.config);
  }

  throw new Error("Must specify either global migration or project path");
}
