#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env
/**
 * Cleanup script for global aichaku installation
 *
 * This script removes unnecessary directories and files from the global
 * aichaku installation, keeping only what the CLI needs at runtime.
 *
 * Creates a backup before removing anything for safety.
 */

import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1";

interface CleanupResult {
  success: boolean;
  backupPath?: string;
  removed: string[];
  kept: string[];
  errors: string[];
}

/**
 * Get the global aichaku installation path
 */
function getGlobalPath(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!home) {
    throw new Error("Unable to determine home directory");
  }
  return join(home, ".claude", "aichaku");
}

/**
 * Create a timestamped backup of the global installation
 */
async function createBackup(globalPath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(globalPath, "..", `aichaku-backup-${timestamp}`);

  console.log(`📦 Creating backup at: ${backupPath}`);
  await copy(globalPath, backupPath);

  return backupPath;
}

/**
 * Main cleanup function
 */
export async function cleanupGlobalInstallation(options: {
  dryRun?: boolean;
  createBackup?: boolean;
} = {}): Promise<CleanupResult> {
  const { dryRun = false, createBackup: shouldBackup = true } = options;

  const result: CleanupResult = {
    success: false,
    removed: [],
    kept: [],
    errors: [],
  };

  try {
    const globalPath = getGlobalPath();

    // Check if global installation exists
    if (!await exists(globalPath)) {
      throw new Error(
        `Global aichaku installation not found at: ${globalPath}`,
      );
    }

    console.log(`🔍 Analyzing global installation at: ${globalPath}`);

    // Create backup if requested
    if (shouldBackup && !dryRun) {
      result.backupPath = await createBackup(globalPath);
      console.log(`✅ Backup created successfully`);
    }

    // Define what to remove
    const toRemove = [
      // Old/unused directories
      "archive",
      "cache",
      "core",
      "output",
      "standards", // duplicate of docs/standards
      // NOTE: "hooks" directory is ESSENTIAL - contains aichaku-hooks.ts runner

      // Documentation-only directories under docs/
      "docs/checkpoints",
      "docs/projects",
      "docs/api",
      "docs/explanation",
      "docs/how-to",
      "docs/reference",
      "docs/tutorials",
      "docs/hooks",

      // Static files not used by CLI
      "RULES-REMINDER.md",
      "README.md", // if it exists at root
      ".aichaku-behavior", // old file
    ];

    // Define what to keep (for verification)
    const toKeep = [
      "docs/core",
      "docs/methodologies",
      "docs/standards",
      "user",
      "config.json",
      "hooks", // ESSENTIAL: Contains aichaku-hooks.ts runner
    ];

    console.log(
      `\n🧹 ${
        dryRun ? "[DRY RUN] Would remove" : "Removing"
      } unnecessary files and directories:`,
    );

    // Remove unnecessary items
    for (const item of toRemove) {
      const itemPath = join(globalPath, item);

      if (await exists(itemPath)) {
        console.log(`  🗑️  ${item}`);
        result.removed.push(item);

        if (!dryRun) {
          try {
            await Deno.remove(itemPath, { recursive: true });
          } catch (error) {
            const errorMsg = `Failed to remove ${item}: ${
              error instanceof Error ? error.message : String(error)
            }`;
            console.error(`    ❌ ${errorMsg}`);
            result.errors.push(errorMsg);
          }
        }
      } else {
        console.log(`  ⏭️  ${item} (not found)`);
      }
    }

    console.log(
      `\n✅ ${
        dryRun ? "[DRY RUN] Would keep" : "Keeping"
      } essential directories:`,
    );

    // Verify essential items exist
    for (const item of toKeep) {
      const itemPath = join(globalPath, item);

      if (await exists(itemPath)) {
        console.log(`  📁 ${item}`);
        result.kept.push(item);
      } else {
        const warningMsg = `Warning: Essential item not found: ${item}`;
        console.warn(`  ⚠️  ${warningMsg}`);
        result.errors.push(warningMsg);
      }
    }

    // Summary
    console.log(`\n📊 Cleanup Summary:`);
    console.log(
      `  🗑️  ${result.removed.length} items ${
        dryRun ? "would be " : ""
      }removed`,
    );
    console.log(`  📁 ${result.kept.length} essential items verified`);
    console.log(`  ❌ ${result.errors.length} errors/warnings`);

    if (result.backupPath) {
      console.log(`  📦 Backup saved to: ${result.backupPath}`);
    }

    if (dryRun) {
      console.log(
        `\n💡 This was a dry run. Run without --dry-run to actually remove files.`,
      );
    } else if (result.errors.length === 0) {
      console.log(`\n🎉 Cleanup completed successfully!`);
    } else {
      console.log(
        `\n⚠️  Cleanup completed with ${result.errors.length} issues.`,
      );
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    const errorMsg = `Cleanup failed: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
    return result;
  }
}

/**
 * CLI interface when run directly
 */
if (import.meta.main) {
  const args = Deno.args;
  const dryRun = args.includes("--dry-run") || args.includes("-n");
  const noBackup = args.includes("--no-backup");
  const help = args.includes("--help") || args.includes("-h");

  if (help) {
    console.log(`
🧹 Aichaku Global Installation Cleanup Script

Usage: deno run --allow-read --allow-write --allow-env cleanup-global-installation.ts [options]

Options:
  --dry-run, -n     Show what would be removed without actually removing
  --no-backup       Skip creating backup (not recommended)
  --help, -h        Show this help message

This script removes unnecessary files and directories from the global
aichaku installation (~/.claude/aichaku/), keeping only what the CLI
needs at runtime.

Creates a timestamped backup by default for safety.

What gets removed:
  - Old directories: archive/, cache/, core/, output/, standards/
  - Documentation: docs/checkpoints/, docs/projects/, docs/api/, etc.
  - Static files: RULES-REMINDER.md, README.md, .aichaku-behavior

What gets kept:
  - docs/core/ (behavioral configuration)
  - docs/methodologies/ (methodology definitions)
  - docs/standards/ (standards definitions)
  - user/ (user customizations)
  - config.json (version metadata)
`);
    Deno.exit(0);
  }

  console.log("🧹 Aichaku Global Installation Cleanup");
  console.log("=====================================\n");

  const result = await cleanupGlobalInstallation({
    dryRun,
    createBackup: !noBackup,
  });

  if (!result.success) {
    console.error(`\n❌ Cleanup failed. See errors above.`);
    Deno.exit(1);
  }

  if (dryRun) {
    console.log(`\n💡 Run without --dry-run to perform the actual cleanup.`);
  }
}
