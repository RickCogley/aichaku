/**
 * Migration command for Aichaku metadata consolidation
 *
 * This command helps users migrate from the legacy multiple-file format
 * to the new consolidated aichaku.json format.
 */

import { Brand } from "../utils/branded-messages.ts";
import {
  checkMigrationStatus,
  generateMigrationReport,
  migrateAll,
  migrateInstallation,
  scanForMigrations,
  verifyMigration,
} from "../utils/migration-helper.ts";
import { getAichakuPaths } from "../paths.ts";

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
    // Handle report generation
    if (options.report) {
      if (!options.silent) {
        Brand.header("Migration Report");
      }

      const report = await generateMigrationReport();
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
        Brand.header("Verifying Migration");
      }

      const paths = getAichakuPaths();
      const results = [];

      // Verify global installation
      const globalVerification = await verifyMigration(paths.global.root, true);
      results.push({
        type: "global",
        path: paths.global.root,
        ...globalVerification,
      });

      if (!options.silent) {
        console.log(
          `Global installation: ${
            globalVerification.success ? "✅ Valid" : "❌ Issues found"
          }`,
        );
        if (globalVerification.error) {
          console.log(`  Error: ${globalVerification.error}`);
        }
        if (!globalVerification.newFormatExists) {
          console.log("  - New format file (aichaku.json) not found");
        }
        if (!globalVerification.configValid) {
          console.log("  - Configuration is invalid");
        }
        if (globalVerification.legacyFilesRemain) {
          console.log("  - Legacy files still present");
        }
      }

      // Verify current project if it has Aichaku
      const projectVerification = await verifyMigration(Deno.cwd(), false);
      if (
        projectVerification.newFormatExists ||
        projectVerification.legacyFilesRemain
      ) {
        results.push({
          type: "project",
          path: Deno.cwd(),
          ...projectVerification,
        });

        if (!options.silent) {
          console.log(
            `\nCurrent project: ${
              projectVerification.success ? "✅ Valid" : "❌ Issues found"
            }`,
          );
          if (projectVerification.error) {
            console.log(`  Error: ${projectVerification.error}`);
          }
          if (!projectVerification.newFormatExists) {
            console.log("  - New format file (aichaku.json) not found");
          }
          if (!projectVerification.configValid) {
            console.log("  - Configuration is invalid");
          }
          if (projectVerification.legacyFilesRemain) {
            console.log("  - Legacy files still present");
          }
        }
      } else if (!options.silent) {
        console.log("\nCurrent project: No Aichaku installation found");
      }

      const allValid = results.every((r) => r.success);

      return {
        success: allValid,
        action: "verified",
        message: allValid
          ? "All installations verified successfully"
          : "Some installations have issues",
      };
    }

    // Scan for installations that need migration
    const installations = await scanForMigrations();
    const needsGlobalMigration = installations.global.needsMigration;
    const needsProjectMigration = installations.projects.some((p) =>
      p.needsMigration
    );

    if (!needsGlobalMigration && !needsProjectMigration) {
      if (!options.silent) {
        Brand.success(
          "All installations are already using the consolidated format!",
        );
      }

      return {
        success: true,
        action: "nothing",
        message: "No migration needed",
      };
    }

    // Show what will be migrated
    if (!options.silent && !options.dryRun) {
      Brand.header("Metadata Migration");

      if (needsGlobalMigration && (!options.project)) {
        console.log("🌍 Global installation needs migration");
        console.log(`   Path: ${installations.global.path}`);
        console.log(
          `   Legacy files: ${installations.global.legacyFiles.length}`,
        );
      }

      if (needsProjectMigration && (!options.global)) {
        for (
          const project of installations.projects.filter((p) =>
            p.needsMigration
          )
        ) {
          console.log("📁 Project installation needs migration");
          console.log(`   Path: ${project.path}`);
          console.log(`   Legacy files: ${project.legacyFiles.length}`);
        }
      }

      console.log();
    }

    // Determine migration scope
    let includeProjects = options.includeProjects ?? !options.global;
    if (options.project) {
      includeProjects = true;
    }

    // Perform migration
    if (options.global && !options.project) {
      // Only migrate global
      const result = await migrateInstallation(
        installations.global.path,
        true,
        {
          dryRun: options.dryRun,
          silent: options.silent,
          cleanupLegacy: options.cleanup,
        },
      );

      if (!result.success && result.error) {
        return {
          success: false,
          action: "error",
          message: result.error,
        };
      }

      return {
        success: true,
        action: options.dryRun ? "report" : "migrated",
        message: options.dryRun
          ? "Dry run completed for global installation"
          : "Global installation migrated successfully",
        details: {
          globalMigrated: true,
          filesCleanedUp: result.cleanedFiles.length,
        },
      };
    } else if (options.project && !options.global) {
      // Only migrate current project
      const project = installations.projects.find((p) => p.path === Deno.cwd());
      if (!project?.needsMigration) {
        return {
          success: true,
          action: "nothing",
          message: "Current project doesn't need migration",
        };
      }

      const result = await migrateInstallation(
        project.path,
        false,
        {
          dryRun: options.dryRun,
          silent: options.silent,
          cleanupLegacy: options.cleanup,
        },
      );

      if (!result.success && result.error) {
        return {
          success: false,
          action: "error",
          message: result.error,
        };
      }

      return {
        success: true,
        action: options.dryRun ? "report" : "migrated",
        message: options.dryRun
          ? "Dry run completed for current project"
          : "Current project migrated successfully",
        details: {
          projectsMigrated: 1,
          filesCleanedUp: result.cleanedFiles.length,
        },
      };
    } else {
      // Migrate all
      const results = await migrateAll({
        dryRun: options.dryRun,
        silent: options.silent,
        cleanupLegacy: options.cleanup,
        includeProjects,
      });

      if (!options.silent) {
        if (options.dryRun) {
          Brand.header("Migration Summary (Dry Run)");
        } else {
          Brand.header("Migration Summary");
        }

        console.log(
          `Global installation: ${
            results.global.success ? "✅ Migrated" : "❌ Failed"
          }`,
        );
        console.log(
          `Project installations: ${results.projects.length} processed`,
        );
        console.log(`Total files migrated: ${results.summary.totalMigrated}`);

        if (options.cleanup) {
          console.log(
            `Legacy files cleaned up: ${results.summary.totalCleaned}`,
          );
        }

        if (results.summary.errors.length > 0) {
          console.log("\n❌ Errors:");
          for (const error of results.summary.errors) {
            console.log(`   ${error}`);
          }
        }
      }

      const success = results.summary.errors.length === 0;

      return {
        success,
        action: options.dryRun ? "report" : "migrated",
        message: success
          ? `Successfully ${
            options.dryRun ? "analyzed" : "migrated"
          } all installations`
          : "Migration completed with some errors",
        details: {
          globalMigrated: results.global.success,
          projectsMigrated: results.projects.filter((p) => p.success).length,
          filesCleanedUp: results.summary.totalCleaned,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      action: "error",
      message: Brand.errorWithSolution(
        "Migration failed",
        error instanceof Error ? error.message : String(error),
      ),
    };
  }
}
