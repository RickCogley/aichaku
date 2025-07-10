/**
 * Migration command for aichaku CLI
 * 
 * Handles migration from old ~/.claude/ structure to new ~/.claude/aichaku/ structure
 * 
 * @module
 */

// import { Command, confirm } from "../../deps.ts";
import { Logger } from "../utils/logger.ts";
import { FolderMigration, MigrationConfig } from "../migration/folder-migration.ts";
import { getAichakuPaths } from "../paths.ts";

// Temporary placeholder for CLI command
class Command {
  name(name: string): Command { return this; }
  description(desc: string): Command { return this; }
  option(option: string, desc: string, config?: any): Command { return this; }
  action(fn: (options: any) => Promise<void>): Command { return this; }
  async parse(args: string[]): Promise<void> { 
    // Placeholder implementation
    console.log("Migration command executed with args:", args);
  }
}

// Temporary placeholder for confirm function
async function confirm(options: { message: string; default?: boolean }): Promise<boolean> {
  return options.default ?? false;
}

/**
 * Create the migrate command
 */
export function createMigrateCommand(): Command {
  return new Command()
    .name("migrate")
    .description("Migrate from old ~/.claude/ structure to new ~/.claude/aichaku/ structure")
    .option("-d, --dry-run", "Preview migration without making changes")
    .option("-f, --force", "Force migration even if target exists")
    .option("-b, --backup", "Create backup before migration", { default: true })
    .option("--no-backup", "Skip backup creation")
    .option("-p, --project [path:string]", "Migrate project at specified path (default: current directory)")
    .option("-g, --global", "Migrate global ~/.claude configuration", { default: true })
    .option("--no-global", "Skip global migration")
    .option("-v, --verbose", "Enable verbose logging")
    .option("-y, --yes", "Skip confirmation prompts")
    .action(async (options) => {
      const logger = new Logger({ 
        silent: false,
        verbose: options.verbose 
      });

      logger.info("🪴 Aichaku Folder Migration");
      logger.info("==========================");
      logger.info("");

      const migration = new FolderMigration(logger);
      const migrationConfig: MigrationConfig = {
        dryRun: options.dryRun,
        force: options.force,
        backup: options.backup,
        verbose: options.verbose,
      };

      // Determine what to migrate
      const migrateGlobal = options.global;
      const projectPath = options.project === true ? Deno.cwd() : options.project;
      
      // Check what needs migration
      const globalNeeded = migrateGlobal ? await migration.isMigrationNeeded() : false;
      const projectNeeded = projectPath ? await checkProjectMigration(projectPath) : false;

      if (!globalNeeded && !projectNeeded) {
        logger.info("✅ No migration needed - already using new structure!");
        return;
      }

      // Show what will be migrated
      const paths = getAichakuPaths();
      logger.info("Migration plan:");
      if (globalNeeded) {
        logger.info(`  • Global: ${paths.legacy.globalMethodologies.replace('/methodologies', '')} → ${paths.global.root}`);
        logger.info("    - methodologies/");
        logger.info("    - standards/");
        logger.info("    - scripts/");
        logger.info("    - commands.json");
        logger.info("    - .aichaku-project");
      }
      if (projectNeeded) {
        logger.info(`  • Project: ${paths.legacy.projectOutput.replace('/output', '')} → ${paths.project.root}`);
        logger.info("    - .aichaku-project");
        logger.info("    - methodologies/ (if exists)");
        logger.info("    - standards/ (if exists)");
      }
      logger.info("");
      logger.info("Files that will remain in original location:");
      logger.info("  • output/ (user work)");
      logger.info("  • user/ (customizations)");
      logger.info("  • CLAUDE.md (instructions)");
      logger.info("  • settings.local.json (settings)");
      logger.info("");

      if (options.dryRun) {
        logger.warn("🔍 DRY RUN MODE - No changes will be made");
      }

      if (options.backup && !options.dryRun) {
        logger.info("📦 Backup will be created before migration");
      }

      // Confirm with user
      if (!options.yes && !options.dryRun) {
        const confirmed = await confirm({
          message: "Proceed with migration?",
          default: true,
        });

        if (!confirmed) {
          logger.info("Migration cancelled");
          return;
        }
      }

      logger.info("");

      // Perform migrations
      let hasErrors = false;

      if (globalNeeded) {
        logger.info("Starting global migration...");
        const result = await migration.migrateGlobal(migrationConfig);
        
        if (result.success) {
          logger.success(`✅ Global migration completed: ${result.itemsMigrated} items migrated`);
          if (result.backupPath) {
            logger.info(`   Backup saved to: ${result.backupPath}`);
          }
        } else {
          logger.error(`❌ Global migration failed with ${result.errors.length} errors`);
          result.errors.forEach(err => logger.error(`   - ${err}`));
          hasErrors = true;
        }

        // Verify migration
        if (!options.dryRun && result.success) {
          const verified = await migration.verifyMigration();
          if (verified) {
            logger.success("✅ Global migration verified");
          } else {
            logger.error("❌ Global migration verification failed");
            hasErrors = true;
          }
        }
      }

      if (projectNeeded && projectPath) {
        logger.info("");
        logger.info(`Starting project migration for: ${projectPath}`);
        const result = await migration.migrateProject(projectPath, migrationConfig);
        
        if (result.success) {
          logger.success(`✅ Project migration completed: ${result.itemsMigrated} items migrated`);
          if (result.backupPath) {
            logger.info(`   Backup saved to: ${result.backupPath}`);
          }
        } else {
          logger.error(`❌ Project migration failed with ${result.errors.length} errors`);
          result.errors.forEach(err => logger.error(`   - ${err}`));
          hasErrors = true;
        }

        // Verify migration
        if (!options.dryRun && result.success) {
          const verified = await migration.verifyMigration(projectPath);
          if (verified) {
            logger.success("✅ Project migration verified");
          } else {
            logger.error("❌ Project migration verification failed");
            hasErrors = true;
          }
        }
      }

      logger.info("");
      
      if (options.dryRun) {
        logger.info("🔍 Dry run completed - no changes were made");
        logger.info("Run without --dry-run to perform actual migration");
      } else if (hasErrors) {
        logger.error("⚠️  Migration completed with errors");
        logger.error("Check the errors above and consider restoring from backup if needed");
      } else {
        logger.success("🎉 Migration completed successfully!");
        logger.info("");
        logger.info("Your aichaku files are now in the new structure:");
        if (globalNeeded) {
          logger.info(`  • Global: ${paths.global.root}`);
        }
        if (projectNeeded) {
          logger.info(`  • Project: ${paths.project.root}`);
        }
        logger.info("");
        logger.info("Your user files remain in their original locations.");
      }
    });
}

/**
 * Check if project needs migration
 */
async function checkProjectMigration(projectPath: string): Promise<boolean> {
  const { exists } = await import("../../deps.ts");
  const { join } = await import("@std/path");
  
  // Use paths module to get consistent paths
  const paths = getAichakuPaths();
  const oldProjectFile = join(projectPath, ".claude", ".aichaku-project");
  const newProjectRoot = paths.project.root;
  
  // Migration needed if old file exists and new structure doesn't
  const hasOldFile = await exists(oldProjectFile);
  const hasNewStructure = await exists(newProjectRoot);
  
  return hasOldFile && !hasNewStructure;
}