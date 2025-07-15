/**
 * Migration command for Aichaku metadata consolidation
 *
 * This command helps users migrate from the legacy multiple-file format
 * to the new consolidated aichaku.json format.
 */

import { AichakuBrand as Brand } from "../utils/branded-messages.ts";
import {
  checkMigrationStatus,
  generateMigrationReport,
  performMigration,
  validateConfiguration,
} from "../utils/migration-helper.ts";
import { join } from "jsr:@std/path@1";

interface MigrateOptions {
  /** Preview what would be migrated without making changes */
  dryRun?: boolean;
  /** Clean up legacy files after successful migration */
  cleanup?: boolean;
  /** Include project installations in migration */
  includeProjects?: boolean;
  /** Suppress output messages */
  silent?: boolean;
  /** Generate a migration report */
  report?: boolean;
  /** Verify migration was successful */
  verify?: boolean;
  /** Force migration even if new format exists */
  force?: boolean;
  /** Only migrate global installation */
  global?: boolean;
  /** Only migrate current project */
  project?: boolean;
}

interface MigrateResult {
  success: boolean;
  message?: string;
  action?: "migrated" | "verified" | "report" | "nothing" | "error";
  details?: {
    globalMigrated?: boolean;
    projectsMigrated?: number;
    filesCleanedUp?: number;
  };
}

/**
 * Migrate Aichaku metadata to consolidated format
 *
 * This command helps transition from the legacy multiple metadata files
 * to the new single aichaku.json format introduced in v2.0.0.
 *
 * @param options Migration options
 * @returns Promise with migration result
 */
export async function migrate(
  options: MigrateOptions = {},
): Promise<MigrateResult> {
  try {
    const projectRoot = Deno.cwd();

    // Handle report generation
    if (options.report) {
      if (!options.silent) {
        Brand.log("Migration Report");
      }

      const report = await generateMigrationReport(projectRoot);
      console.log(report);

      return {
        success: true,
        action: "report",
        message: "Migration report generated",
      };
    }

    // Handle verification
    if (options.verify) {
      if (!options.silent) {
        Brand.log("Verifying Migration");
      }

      const configPath = join(
        projectRoot,
        ".claude",
        "aichaku",
        "aichaku.json",
      );
      const validation = await validateConfiguration(configPath);

      if (!options.silent) {
        console.log(
          `Configuration: ${validation.valid ? "✅ Valid" : "❌ Invalid"}`,
        );
        if (!validation.valid) {
          validation.errors.forEach((error) => console.log(`  - ${error}`));
        }
      }

      return {
        success: validation.valid,
        action: "verified",
        message: validation.valid
          ? "Configuration verified successfully"
          : "Configuration has issues",
      };
    }

    // Check migration status
    const status = await checkMigrationStatus(projectRoot);

    if (!status.needsMigration) {
      if (!options.silent) {
        Brand.success("Already using the consolidated format!");
      }

      return {
        success: true,
        action: "nothing",
        message: "No migration needed",
      };
    }

    // Show what will be migrated
    if (!options.silent && !options.dryRun) {
      Brand.log("\n=== Metadata Migration ===");
      console.log(`📁 Legacy files found: ${status.legacyFilesFound.length}`);
      status.legacyFilesFound.forEach((file) => console.log(`   - ${file}`));
      console.log();
    }

    // Perform migration
    const result = await performMigration(projectRoot, {
      createBackup: true,
      cleanupLegacy: options.cleanup ?? false,
      dryRun: options.dryRun ?? false,
    });

    if (!result.success) {
      return {
        success: false,
        action: "error",
        message: result.errors.join("; "),
      };
    }

    if (!options.silent) {
      if (options.dryRun) {
        Brand.success("Dry run completed successfully!");
      } else {
        Brand.success("Migration completed successfully!");
        console.log(`✅ Migrated ${result.migratedFiles.length} files`);
        if (options.cleanup) {
          console.log(`🧹 Cleaned up legacy files`);
        }
      }
    }

    return {
      success: true,
      action: options.dryRun ? "report" : "migrated",
      message: options.dryRun
        ? "Dry run completed"
        : "Migration completed successfully",
      details: {
        filesCleanedUp: result.migratedFiles.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      action: "error",
      message: `Migration failed: ${(error as Error).message}`,
    };
  }
}

/**
 * CLI entry point for the migrate command
 */
export async function migrateCommand(args: string[]): Promise<void> {
  // Parse command line arguments
  const options: MigrateOptions = {
    dryRun: args.includes("--dry-run") || args.includes("-d"),
    cleanup: args.includes("--cleanup") || args.includes("-c"),
    silent: args.includes("--silent") || args.includes("-s"),
    report: args.includes("--report") || args.includes("-r"),
    verify: args.includes("--verify") || args.includes("-v"),
    force: args.includes("--force") || args.includes("-f"),
    global: args.includes("--global") || args.includes("-g"),
    project: args.includes("--project") || args.includes("-p"),
  };

  const result = await migrate(options);

  if (!result.success) {
    console.error(`❌ ${result.message}`);
    Deno.exit(1);
  }
}
