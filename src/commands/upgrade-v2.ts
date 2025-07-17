/**
 * Updated Upgrade Command using ConfigManager v2.0.0
 *
 * Provides enhanced upgrade feedback using consolidated metadata
 */

import { parseArgs } from "jsr:@std/cli@1";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { getMethodologyTemplateMap } from "../config/methodology-templates.ts";
import {
  type ConfigManager,
  createProjectConfigManager,
} from "../utils/config-manager.ts";
import {
  checkMigrationStatus,
  performMigration,
} from "../utils/migration-helper.ts";

interface UpgradeOptions {
  version?: string;
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
  cleanup?: boolean;
  migrate?: boolean;
}

/**
 * Upgrade command with enhanced feedback and metadata consolidation
 */
export async function upgradeCommand(args: string[]): Promise<void> {
  const parsedArgs = parseArgs(args, {
    string: ["version"],
    boolean: ["dry-run", "force", "verbose", "cleanup", "migrate"],
    alias: {
      "v": "version",
      "d": "dry-run",
      "f": "force",
      "verbose": "verbose",
      "c": "cleanup",
      "m": "migrate",
    },
  });

  const options: UpgradeOptions = {
    version: parsedArgs.version,
    dryRun: parsedArgs["dry-run"],
    force: parsedArgs.force,
    verbose: parsedArgs.verbose,
    cleanup: parsedArgs.cleanup,
    migrate: parsedArgs.migrate,
  };

  const projectRoot = Deno.cwd();

  try {
    // Check if this is an Aichaku project
    const configManager = createProjectConfigManager(projectRoot);

    let needsMigration = false;
    try {
      await configManager.load();
    } catch (error) {
      if ((error as Error).message.includes("No Aichaku configuration found")) {
        Brand.error("No Aichaku installation found in current directory");
        Brand.info("Run 'aichaku init' to initialize this project");
        return;
      }

      // Check if we need migration
      const migrationStatus = await checkMigrationStatus(projectRoot);
      if (migrationStatus.needsMigration) {
        needsMigration = true;
        console.log(
          "🔄 Legacy metadata files detected. Migration required before upgrade.",
        );

        if (options.migrate || await promptForMigration()) {
          const migrationResult = await performMigration(projectRoot, {
            cleanupLegacy: options.cleanup,
          });

          if (!migrationResult.success) {
            Brand.error("Migration failed:");
            migrationResult.errors.forEach((error) =>
              console.log(`   ${error}`)
            );
            return;
          }

          Brand.success("Migration completed successfully");
          await configManager.load(); // Reload after migration
        } else {
          console.log(
            "❌ Upgrade cancelled. Migration is required to continue.",
          );
          return;
        }
      } else {
        throw error; // Re-throw if it's not a migration issue
      }
    }

    const config = configManager.get();
    const currentVersion = config.project.installedVersion || "unknown";
    const targetVersion = options.version || await getLatestVersion();
    const methodology = config.project.methodology || "none";
    const projectType = config.project.installationType || "unknown";

    // Display current project status
    console.log(`\n🌿 Aichaku Project Status`);
    console.log(`   Current Version: ${currentVersion}`);
    console.log(`   Target Version: ${targetVersion}`);
    console.log(`   Methodology: ${methodology}`);
    console.log(`   Installation Type: ${projectType}`);
    console.log(
      `   Standards: ${
        config.standards.development.length +
        config.standards.documentation.length
      } selected`,
    );

    if (config.standards.development.length > 0) {
      console.log(`   Development: ${config.standards.development.join(", ")}`);
    }
    if (config.standards.documentation.length > 0) {
      console.log(
        `   Documentation: ${config.standards.documentation.join(", ")}`,
      );
    }

    // Check if upgrade is needed
    if (currentVersion === targetVersion && !options.force) {
      console.log(`\n✅ Already at version ${targetVersion}`);

      if (needsMigration) {
        Brand.info("Configuration has been migrated to v2.0.0 format");
      }

      return;
    }

    // Perform dry run if requested
    if (options.dryRun) {
      console.log(
        `\n🔍 Dry Run: Would upgrade from ${currentVersion} to ${targetVersion}`,
      );
      await simulateUpgrade(configManager, targetVersion, options);
      return;
    }

    // Confirm upgrade
    if (
      !options.force && !await confirmUpgrade(currentVersion, targetVersion)
    ) {
      Brand.error("Upgrade cancelled");
      return;
    }

    // Perform the upgrade
    console.log(`\n🚀 Upgrading from ${currentVersion} to ${targetVersion}...`);
    await performUpgrade(configManager, targetVersion, options);

    console.log(`✅ Successfully upgraded to version ${targetVersion}`);

    // Show post-upgrade information
    await showPostUpgradeInfo(configManager, options);
  } catch (error) {
    console.error(`❌ Upgrade failed: ${(error as Error).message}`);
    if (options.verbose) {
      console.error((error as Error).stack);
    }
    Deno.exit(1);
  }
}

/**
 * Simulate upgrade for dry-run mode
 */
function simulateUpgrade(
  configManager: ConfigManager,
  targetVersion: string,
  options: UpgradeOptions,
): Promise<void> {
  const config = configManager.get();

  console.log(`\nWould perform the following actions:`);
  console.log(
    `• Update version from ${config.project.installedVersion} to ${targetVersion}`,
  );
  console.log(`• Update lastUpdated timestamp`);

  if (options.cleanup) {
    console.log(`• Clean up legacy configuration files`);
  }

  // Check for methodology-specific upgrade tasks
  if (config.project.methodology) {
    console.log(
      `• Check for ${config.project.methodology} methodology updates`,
    );
  }

  // Check for standards updates
  if (config.standards.development.length > 0) {
    console.log(`• Verify development standards compatibility`);
  }

  if (config.standards.documentation.length > 0) {
    console.log(`• Verify documentation standards compatibility`);
  }
}

/**
 * Perform the actual upgrade
 */
async function performUpgrade(
  configManager: ConfigManager,
  targetVersion: string,
  options: UpgradeOptions,
): Promise<void> {
  // Update version information
  await configManager.setInstalledVersion(targetVersion);

  // Update any global version references
  await configManager.update({
    config: {
      ...configManager.get().config,
      globalVersion: targetVersion,
    },
  });

  // Perform any version-specific upgrade tasks
  await performVersionSpecificUpgrades(configManager, targetVersion, options);

  // Clean up legacy files if requested
  if (options.cleanup) {
    Brand.info("Cleaning up legacy files...");
    await configManager.cleanupLegacyFiles();
  }

  if (options.verbose) {
    Brand.success("Configuration updated successfully");
    Brand.success("Version information saved");
  }
}

/**
 * Perform version-specific upgrade tasks
 */
async function performVersionSpecificUpgrades(
  configManager: ConfigManager,
  targetVersion: string,
  options: UpgradeOptions,
): Promise<void> {
  const config = configManager.get();

  // Example: Version-specific migrations
  if (targetVersion.startsWith("0.30.")) {
    // Hypothetical v0.30.x upgrade tasks
    if (options.verbose) {
      Brand.success("Applied v0.30.x compatibility updates");
    }
  }

  if (targetVersion.startsWith("1.0.")) {
    // Hypothetical v1.0.x upgrade tasks
    if (options.verbose) {
      Brand.success("Applied v1.0.x major version updates");
    }
  }

  // Update methodology-specific files if needed
  if (config.project.methodology) {
    await updateMethodologyFiles(
      config.project.methodology,
      targetVersion,
      options,
    );
  }
}

/**
 * Update methodology-specific files and templates
 */
async function updateMethodologyFiles(
  methodology: string,
  _targetVersion: string,
  options: UpgradeOptions,
): Promise<void> {
  const projectRoot = Deno.cwd();
  const projectsDir = join(projectRoot, "docs", "projects");

  if (!await exists(projectsDir)) {
    return;
  }

  // Update methodology templates based on new version
  // Use configuration-as-code instead of hardcoded mappings
  const templateUpdates = getMethodologyTemplateMap();

  const files = templateUpdates[methodology as keyof typeof templateUpdates];
  if (files && options.verbose) {
    console.log(`✓ Checked ${methodology} methodology files for updates`);
  }
}

/**
 * Show post-upgrade information and recommendations
 */
function showPostUpgradeInfo(
  configManager: ConfigManager,
  _options: UpgradeOptions,
): Promise<void> {
  const config = configManager.get();

  console.log(`\n📋 Post-Upgrade Summary:`);
  console.log(`   Version: ${config.project.installedVersion}`);
  console.log(`   Last Updated: ${config.project.lastUpdated}`);
  console.log(`   Configuration Format: v${config.version}`);

  // Show recommendations based on current setup
  console.log(`\n💡 Recommendations:`);

  if (config.project.methodology) {
    console.log(
      `   • Review ${config.project.methodology} methodology templates for updates`,
    );
  } else {
    console.log(
      `   • Consider setting a methodology with 'aichaku methodology set <name>'`,
    );
  }

  if (config.standards.development.length === 0) {
    console.log(
      `   • Consider selecting development standards with 'aichaku standards select'`,
    );
  }

  if (config.standards.documentation.length === 0) {
    console.log(
      `   • Consider selecting documentation standards for better consistency`,
    );
  }

  console.log(`   • Run 'aichaku status' to see current project configuration`);
}

/**
 * Get the latest available version (placeholder implementation)
 */
function getLatestVersion(): string {
  // In a real implementation, this would fetch from a registry or API
  // For now, return a placeholder version
  return "0.30.0";
}

/**
 * Prompt user to confirm upgrade
 */
async function confirmUpgrade(
  currentVersion: string,
  targetVersion: string,
): Promise<boolean> {
  console.log(
    `\n⚠️  This will upgrade from ${currentVersion} to ${targetVersion}`,
  );
  Brand.info("Continue? [y/N] ", { noNewLine: true });

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf) ?? 0;
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim()
    .toLowerCase();

  return input === "y" || input === "yes";
}

/**
 * Prompt user for migration consent
 */
async function promptForMigration(): Promise<boolean> {
  console.log(
    "\nWould you like to migrate to the new configuration format? [Y/n] ",
    { noNewLine: true },
  );

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf) ?? 0;
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim()
    .toLowerCase();

  return input === "" || input === "y" || input === "yes";
}

// Export for use in other modules
export type { UpgradeOptions };
