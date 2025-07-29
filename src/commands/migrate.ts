/**
 * Migration command for aichaku CLI
 *
 * Handles migration from old ~/.claude/ structure to new ~/.claude/aichaku/ structure
 *
 * @module
 */

// import { Command, confirm } from "../../deps.ts";
import { Logger } from "../utils/logger.ts";
import { FolderMigration, type MigrationConfig } from "../migration/folder-migration.ts";
import { getAichakuPaths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";

export function showMigrateHelp(): void {
  printFormatted(`
# 🪴 Aichaku Migrate - Migrate from old structure to new structure

## Usage
\`aichaku migrate [options]\`

## Options
- **--dry-run** - Show what would be migrated without actually migrating
- **--force** - Force migration even if destination exists
- **--backup** - Create backup before migration (default: true)
- **--no-backup** - Skip creating backup
- **--global** - Migrate global installation only
- **--no-global** - Skip global migration
- **--project <path>** - Migrate specific project (default: current directory)
- **--verbose** - Show detailed migration information
- **--yes** - Skip confirmation prompts
- **--help** - Show this help message

## Examples

\`\`\`bash
# Preview migration
aichaku migrate --dry-run

# Migrate with backup
aichaku migrate --backup

# Migrate global installation only
aichaku migrate --global

# Migrate specific project
aichaku migrate --project /path/to/project

# Force migration without confirmation
aichaku migrate --force --yes
\`\`\`

## Migration Process
1. Backs up existing ~/.claude/ directory
2. Moves methodologies to ~/.claude/aichaku/docs/methodologies/
3. Moves standards to ~/.claude/aichaku/docs/standards/
4. Updates project configurations
5. Preserves user customizations

## ⚠️  WARNING
This will modify your existing ~/.claude/ directory structure.
A backup is created by default for safety.
`);
}

// Command options interface
interface MigrateCommandOptions {
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;
  project?: string | boolean;
  global?: boolean;
  customStandardsOnly?: boolean;
  verbose?: boolean;
  yes?: boolean;
  help?: boolean;
}

// Temporary placeholder for CLI command
class Command {
  name(_name: string): Command {
    return this;
  }
  description(_desc: string): Command {
    return this;
  }
  option(_option: string, _desc: string, _config?: unknown): Command {
    return this;
  }
  action(_fn: (options: unknown) => Promise<void>): Command {
    return this;
  }
  parse(args: string[]): void {
    // Check if help is requested
    if (args.includes("--help") || args.includes("-h")) {
      showMigrateHelp();
      return;
    }

    // Placeholder implementation
    console.log("Migration command executed with args:", args);
  }
}

// Temporary placeholder for confirm function
function confirm(
  options: { message: string; default?: boolean },
): Promise<boolean> {
  return Promise.resolve(options.default ?? false);
}

/**
 * Create the migrate command
 */
export function createMigrateCommand(): Command {
  return new Command()
    .name("migrate")
    .description(
      "Migrate from old ~/.claude/ structure to new ~/.claude/aichaku/ structure",
    )
    .option("-d, --dry-run", "Preview migration without making changes")
    .option("-f, --force", "Force migration even if target exists")
    .option("-b, --backup", "Create backup before migration", { default: true })
    .option("--no-backup", "Skip backup creation")
    .option(
      "-p, --project [path:string]",
      "Migrate project at specified path (default: current directory)",
    )
    .option("-g, --global", "Migrate global ~/.claude configuration", {
      default: true,
    })
    .option("--no-global", "Skip global migration")
    .option(
      "--custom-standards-only",
      "Migrate only custom standards to new user/ directory",
    )
    .option("-v, --verbose", "Enable verbose logging")
    .option("-y, --yes", "Skip confirmation prompts")
    .action(async (opts: unknown) => {
      const options = opts as MigrateCommandOptions;
      const logger = new Logger({
        silent: false,
        verbose: options.verbose,
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

      // Handle custom standards only migration
      if (options.customStandardsOnly) {
        logger.info("🔧 Custom Standards Migration");
        logger.info("============================");
        logger.info("");

        const projectPath = options.project === true
          ? Deno.cwd()
          : typeof options.project === "string"
          ? options.project
          : undefined;

        // Check what needs migration
        const customStandardsNeeded = await migration
          .isCustomStandardsMigrationNeeded();

        if (!customStandardsNeeded) {
          logger.info("✅ No custom standards migration needed!");
          return;
        }

        logger.info("Will migrate custom standards from:");
        logger.info(
          "  • ~/.claude/standards/custom/ → ~/.claude/aichaku/user/standards/",
        );
        logger.info(
          "  • ~/.claude/aichaku/standards/custom/ → ~/.claude/aichaku/user/standards/",
        );
        if (projectPath) {
          logger.info(
            `  • ${projectPath}/.claude/standards/custom/ → ${projectPath}/.claude/aichaku/user/standards/`,
          );
          logger.info(
            `  • ${projectPath}/.claude/aichaku/standards/custom/ → ${projectPath}/.claude/aichaku/user/standards/`,
          );
        }
        logger.info("");

        if (options.dryRun) {
          logger.warn("🔍 DRY RUN MODE - No changes will be made");
        }

        // Confirm with user
        if (!options.yes && !options.dryRun) {
          const confirmed = await confirm({
            message: "Proceed with custom standards migration?",
            default: true,
          });

          if (!confirmed) {
            logger.info("Migration cancelled");
            return;
          }
        }

        logger.info("");

        // Perform custom standards migration
        const result = await migration.migrateCustomStandardsOnly(
          migrationConfig,
          projectPath,
        );

        if (result.success) {
          logger.success(
            `✅ Custom standards migration completed: ${result.itemsMigrated} items migrated`,
          );
          if (result.backupPath) {
            logger.info(`   Backup saved to: ${result.backupPath}`);
          }
        } else {
          logger.error(
            `❌ Custom standards migration failed with ${result.errors.length} errors`,
          );
          result.errors.forEach((err) => logger.error(`   - ${err}`));
        }

        return;
      }

      // Determine what to migrate (regular migration)
      const migrateGlobal = options.global;
      const projectPath = options.project === true
        ? Deno.cwd()
        : typeof options.project === "string"
        ? options.project
        : undefined;

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
        logger.info(
          `  • Global: ${paths.legacy.globalMethodologies.replace("/methodologies", "")} → ${paths.global.root}`,
        );
        logger.info("    - methodologies/");
        logger.info("    - standards/");
        logger.info("    - scripts/");
        logger.info("    - commands.json");
        logger.info("    - .aichaku-project");
      }
      if (projectNeeded) {
        logger.info(
          `  • Project: ${paths.legacy.projectOutput.replace("/output", "")} → ${paths.project.root}`,
        );
        logger.info("    - .aichaku-project");
        logger.info(
          "    - .aichaku-standards.json → standards.json (if exists)",
        );
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
          logger.success(
            `✅ Global migration completed: ${result.itemsMigrated} items migrated`,
          );
          if (result.backupPath) {
            logger.info(`   Backup saved to: ${result.backupPath}`);
          }
        } else {
          logger.error(
            `❌ Global migration failed with ${result.errors.length} errors`,
          );
          result.errors.forEach((err) => logger.error(`   - ${err}`));
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
        const result = await migration.migrateProject(
          projectPath,
          migrationConfig,
        );

        if (result.success) {
          logger.success(
            `✅ Project migration completed: ${result.itemsMigrated} items migrated`,
          );
          if (result.backupPath) {
            logger.info(`   Backup saved to: ${result.backupPath}`);
          }
        } else {
          logger.error(
            `❌ Project migration failed with ${result.errors.length} errors`,
          );
          result.errors.forEach((err) => logger.error(`   - ${err}`));
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
        logger.error(
          "Check the errors above and consider restoring from backup if needed",
        );
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

  // Security: Validate project path
  const validatedPath = resolveProjectPath(projectPath);

  // Use paths module to get consistent paths
  const paths = getAichakuPaths();
  const oldProjectFile = join(validatedPath, ".claude", ".aichaku-project");
  const oldStandardsFile = join(
    validatedPath,
    ".claude",
    ".aichaku-standards.json",
  );
  const newProjectRoot = paths.project.root;

  // Migration needed if old files exist and new structure doesn't
  const hasOldFile = await exists(oldProjectFile);
  const hasOldStandardsFile = await exists(oldStandardsFile);
  const hasNewStructure = await exists(newProjectRoot);

  return (hasOldFile || hasOldStandardsFile) && !hasNewStructure;
}
