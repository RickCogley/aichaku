#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

/**
 * Demo script for the config consolidation functionality
 *
 * This script demonstrates how to use the ConfigManager to:
 * 1. Migrate from legacy files to consolidated format
 * 2. Read and update configuration
 * 3. Handle backward compatibility
 */

import { ConfigManager, getProjectConfig } from "./config-manager.ts";
import {
  generateMigrationReport,
  scanForMigrations,
} from "./migration-helper.ts";
import { AichakuBrand as Brand } from "./branded-messages.ts";

async function main() {
  console.log("🪴 Aichaku Configuration Consolidation Demo\n");

  // Scan for installations that need migration
  console.log("📊 Scanning for Installations");
  const installations = await scanForMigrations();

  console.log("Global installation:");
  if (installations.global.type === "none") {
    console.log("  ❌ No global installation found");
  } else {
    console.log(`  📁 Path: ${installations.global.path}`);
    console.log(
      `  🔄 Needs migration: ${
        installations.global.needsMigration ? "Yes" : "No"
      }`,
    );
    console.log(
      `  ✅ Has new format: ${
        installations.global.hasNewFormat ? "Yes" : "No"
      }`,
    );
    console.log(
      `  📄 Legacy files: ${installations.global.legacyFiles.length}`,
    );
  }

  console.log("\nProject installations:");
  if (installations.projects.length === 0) {
    console.log("  ❌ No project installations found");
  } else {
    for (const project of installations.projects) {
      console.log(`  📁 Path: ${project.path}`);
      console.log(
        `  🔄 Needs migration: ${project.needsMigration ? "Yes" : "No"}`,
      );
      console.log(
        `  ✅ Has new format: ${project.hasNewFormat ? "Yes" : "No"}`,
      );
      console.log(`  📄 Legacy files: ${project.legacyFiles.length}`);
    }
  }

  // Try loading current project configuration
  console.log("\n🔧 Current Project Configuration");
  const configManager = getProjectConfig();

  try {
    await configManager.load();
    const config = configManager.get();

    console.log("✅ Successfully loaded configuration:");
    console.log(`  📝 Version: ${config.version}`);
    console.log(`  🏷️  Project type: ${config.project.type || "unknown"}`);
    console.log(
      `  📦 Installed version: ${config.project.installedVersion || "unknown"}`,
    );
    console.log(`  📅 Created: ${config.project.created}`);
    console.log(`  🎯 Methodology: ${config.project.methodology || "none"}`);
    console.log(`  📋 Dev standards: ${config.standards.development.length}`);
    console.log(`  📚 Doc standards: ${config.standards.documentation.length}`);
    console.log(`  🔧 Config options: ${Object.keys(config.config).length}`);

    // Demonstrate convenience methods
    console.log("\n🔧 Convenience methods:");
    console.log(
      `  📊 All standards: [${configManager.getStandards().join(", ")}]`,
    );
    console.log(`  🔍 Is Aichaku project: ${configManager.isAichakuProject()}`);
    console.log(
      `  🎯 Methodology: ${configManager.getMethodology() || "none"}`,
    );
  } catch (error) {
    console.log("❌ Failed to load configuration:");
    console.log(
      `  Error: ${error instanceof Error ? error.message : String(error)}`,
    );

    // Check if this might be a legacy installation
    const currentProjectStatus = await installations.projects.find((p) =>
      p.path === Deno.cwd()
    );
    if (currentProjectStatus?.needsMigration) {
      console.log(
        "\n💡 This appears to be a legacy installation that needs migration.",
      );
      console.log("   Run the migration demo below to consolidate the files.");
    }
  }

  // Generate migration report
  console.log("\n📋 Migration Report");
  const report = await generateMigrationReport();
  console.log(report);

  // Demo dry-run migration
  if (
    installations.global.needsMigration ||
    installations.projects.some((p) => p.needsMigration)
  ) {
    console.log("\n🔄 Migration Preview (Dry Run)");
    console.log("This would be the migration process:");

    if (installations.global.needsMigration) {
      console.log("\n🌍 Global installation migration:");
      const globalManager = new ConfigManager(installations.global.path);
      const globalMigrated = await globalManager.migrate();
      console.log(
        `  Result: ${
          globalMigrated ? "Migration completed" : "Already migrated"
        }`,
      );
    }

    for (
      const project of installations.projects.filter((p) => p.needsMigration)
    ) {
      console.log(`\n📁 Project migration: ${project.path}`);
      const projectManager = getProjectConfig(project.path);
      const projectMigrated = await projectManager.migrate();
      console.log(
        `  Result: ${
          projectMigrated ? "Migration completed" : "Already migrated"
        }`,
      );
    }
  }

  console.log("\n✅ Demo Complete");
  console.log("This demo showed how the new ConfigManager:");
  console.log("  ✅ Detects legacy installations");
  console.log("  ✅ Migrates multiple files to single aichaku.json");
  console.log("  ✅ Provides backward compatibility");
  console.log("  ✅ Offers convenient access methods");
  console.log("  ✅ Handles both global and project configurations");
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error("Demo failed:", error);
    Deno.exit(1);
  }
}
