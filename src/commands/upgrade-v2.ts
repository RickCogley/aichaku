import { exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchMethodologies, fetchStandards } from "./content-fetcher.ts";
import { getAichakuPaths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { safeRemove } from "../utils/path-security.ts";
import { Brand } from "../utils/branded-messages.ts";
import {
  ConfigManager,
  getProjectConfig,
  globalConfig,
} from "../utils/config-manager.ts";

interface UpgradeOptions {
  global?: boolean;
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
  check?: boolean;
}

interface UpgradeResult {
  success: boolean;
  path: string;
  message?: string;
  action?: "check" | "upgraded" | "current" | "error";
  version?: string;
  latestVersion?: string;
}

/**
 * Upgrade Aichaku to the latest version (v2 with ConfigManager)
 *
 * @param options - Upgrade options
 * @returns Promise with upgrade result
 */
export async function upgrade(
  options: UpgradeOptions = {},
): Promise<UpgradeResult> {
  const isGlobal = options.global || false;
  const paths = getAichakuPaths();

  // Use centralized path management
  const targetPath = isGlobal ? paths.global.root : paths.project.root;
  // Security: Use safe project path resolution
  const _projectPath = resolveProjectPath(options.projectPath);

  // Use ConfigManager instead of direct metadata reading
  const configManager = isGlobal ? globalConfig : getProjectConfig(targetPath);

  // Try to load configuration
  let hasConfig = false;
  let needsMigration = false;

  try {
    await configManager.load();
    hasConfig = true;
  } catch {
    // Check if legacy files exist
    const legacyFiles = [
      join(targetPath, ".aichaku.json"),
      join(targetPath, ".aichaku-project"),
      join(targetPath, "aichaku-standards.json"),
      join(targetPath, "aichaku.config.json"),
    ];

    for (const file of legacyFiles) {
      if (await exists(file)) {
        needsMigration = true;
        break;
      }
    }

    if (!needsMigration) {
      return {
        success: false,
        path: targetPath,
        message:
          `🪴 Aichaku: No installation found at ${targetPath}. Run 'aichaku init' first.`,
      };
    }
  }

  // Migrate if needed
  if (needsMigration && !hasConfig) {
    if (!options.silent) {
      Brand.progress(
        "Migrating to consolidated configuration format...",
        "active",
      );
    }

    const migrated = await configManager.migrate();
    if (migrated) {
      await configManager.load();
      hasConfig = true;

      if (!options.silent) {
        Brand.success("Configuration migrated to aichaku.json");
      }
    } else {
      return {
        success: false,
        path: targetPath,
        message: "Failed to migrate configuration",
      };
    }
  }

  const config = configManager.get();
  const currentVersion = config.project.installedVersion || VERSION;

  // Check version
  if (options.check) {
    if (currentVersion === VERSION) {
      return {
        success: true,
        path: targetPath,
        message:
          `ℹ️  Current version: v${VERSION}\n    Latest version:  v${VERSION}\n    \n✓ You're up to date!`,
        action: "check",
        version: currentVersion,
        latestVersion: VERSION,
      };
    } else {
      return {
        success: true,
        path: targetPath,
        message:
          `📦 Update available: v${currentVersion} → v${VERSION}\n\nRun 'aichaku upgrade' to install the latest version.`,
        action: "check",
        version: currentVersion,
        latestVersion: VERSION,
      };
    }
  }

  // Check if already on latest version
  if (currentVersion === VERSION && !options.force) {
    return {
      success: true,
      path: targetPath,
      message:
        `🪴 Aichaku: Already on latest version (v${VERSION}). Use --force to reinstall.`,
      action: "current",
    };
  }

  if (options.dryRun) {
    console.log(`[DRY RUN] Would upgrade Aichaku at: ${targetPath}`);
    console.log(`[DRY RUN] Current version: v${currentVersion}`);
    console.log(`[DRY RUN] New version: v${VERSION}`);
    console.log("[DRY RUN] Would update:");
    console.log("  - methodologies/ (latest methodology files)");
    console.log("  - standards/ (latest standards library)");
    console.log("[DRY RUN] Would preserve:");
    console.log("  - user/ (all customizations)");
    console.log("  - aichaku.json (with updated version)");
    console.log("[DRY RUN] Would migrate:");
    console.log("  - Legacy metadata files to consolidated aichaku.json");
    return {
      success: true,
      path: targetPath,
      message: "Dry run completed. No files were modified.",
    };
  }

  try {
    if (!options.silent) {
      console.log(Brand.upgrading(currentVersion, VERSION));
    }

    // Check for user customizations
    const userDir = join(targetPath, "user");
    const hasCustomizations = await exists(userDir);
    if (hasCustomizations && !options.silent) {
      Brand.success("User customizations detected - will be preserved");
    }

    // Update methodologies
    // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted and controlled by runtime
    const isJSR = import.meta.url.startsWith("https://jsr.io");

    if (!options.silent) {
      Brand.progress("Updating methodology files...", "active");
    }

    if (isJSR) {
      // Fetch from GitHub when running from JSR
      // First try to update in place (preserves any user modifications)
      const fetchSuccess = await fetchMethodologies(
        paths.global.root,
        VERSION,
        {
          silent: options.silent,
          overwrite: true, // Always overwrite during upgrades to get latest content
        },
      );

      if (!fetchSuccess) {
        // If fetch fails completely, try removing and re-fetching
        const targetMethodologies = paths.global.methodologies;
        if (await exists(targetMethodologies)) {
          // Security: Use safe remove
          await safeRemove(targetMethodologies, paths.global.root, {
            recursive: true,
          });
        }

        const retrySuccess = await fetchMethodologies(
          paths.global.root,
          VERSION,
          {
            silent: options.silent,
            overwrite: true,
          },
        );

        if (!retrySuccess) {
          throw new Error(
            "Failed to update methodologies. Check network permissions.",
          );
        }
      }
    } else {
      // Local development - copy from source
      const sourceMethodologies = join(
        new URL(".", import.meta.url).pathname,
        "../../../docs/methodologies",
      );
      const targetMethodologies = paths.global.methodologies;

      // Remove old methodologies for clean copy
      if (await exists(targetMethodologies)) {
        // Security: Use safe remove
        await safeRemove(targetMethodologies, targetPath, { recursive: true });
      }

      await copy(sourceMethodologies, targetMethodologies);
    }

    // Update standards
    if (!options.silent) {
      Brand.progress("Updating standards library...", "active");
    }

    if (isJSR) {
      // Fetch from GitHub when running from JSR
      const fetchSuccess = await fetchStandards(paths.global.root, VERSION, {
        silent: options.silent,
        overwrite: true, // Always overwrite during upgrades to get latest content
      });

      if (!fetchSuccess) {
        // If fetch fails completely, try removing and re-fetching
        const targetStandards = paths.global.standards;
        if (await exists(targetStandards)) {
          // Security: Use safe remove
          await safeRemove(targetStandards, paths.global.root, {
            recursive: true,
          });
        }

        const retrySuccess = await fetchStandards(paths.global.root, VERSION, {
          silent: options.silent,
          overwrite: true,
        });

        if (!retrySuccess) {
          throw new Error(
            "Failed to update standards. Check network permissions.",
          );
        }
      }
    } else {
      // Local development - copy from source
      const sourceStandards = join(
        new URL(".", import.meta.url).pathname,
        "../../../standards",
      );
      const targetStandards = paths.global.standards;

      // Remove old standards for clean copy
      if (await exists(targetStandards)) {
        // Security: Use safe remove
        await safeRemove(targetStandards, targetPath, { recursive: true });
      }

      await copy(sourceStandards, targetStandards);
    }

    if (!options.silent) {
      Brand.success("Standards library updated");
    }

    // Show what's new in this version
    if (!options.silent && currentVersion !== VERSION) {
      showWhatsNew(VERSION, currentVersion);
    }

    // Update configuration with new version
    await configManager.update({
      project: {
        installedVersion: VERSION,
        lastUpdated: new Date().toISOString(),
      },
    });

    // Clean up legacy files if this was a migration
    if (needsMigration && !options.dryRun) {
      if (!options.silent) {
        Brand.progress("Cleaning up legacy metadata files...", "active");
      }

      await configManager.cleanupLegacyFiles();

      if (!options.silent) {
        Brand.success("Legacy files cleaned up");
      }
    }

    // NEW: If upgrading a project (not global), also update CLAUDE.md
    if (!isGlobal && !options.dryRun) {
      const projectPath = resolve(targetPath, "..");
      const claudeMdPath = join(projectPath, "CLAUDE.md");

      if (await exists(claudeMdPath)) {
        if (!options.silent) {
          Brand.progress(
            "Updating CLAUDE.md with latest directives...",
            "active",
          );
        }

        // Import integrate function
        const { integrate } = await import("./integrate.ts");

        const integrateResult = await integrate({
          projectPath,
          force: true,
          silent: options.silent,
        });

        if (integrateResult.success && !options.silent) {
          Brand.success("CLAUDE.md updated successfully");
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      message: Brand.completed(`Upgrade to v${VERSION}`) +
        "\n\n💡 All your projects now have the latest methodologies!" +
        (needsMigration
          ? "\n✨ Configuration migrated to consolidated format!"
          : ""),
      action: "upgraded",
      version: VERSION,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: Brand.errorWithSolution(
        "Upgrade failed",
        error instanceof Error ? error.message : String(error),
      ),
      action: "error",
    };
  }
}

/**
 * Show what's new in the current version
 */
function showWhatsNew(version: string, previousVersion: string) {
  // Type assertion to handle const literal type
  const currentVersion = version as string;

  console.log(`\n✨ What's new in v${currentVersion}:`);

  // Add version-specific changelogs here
  if (currentVersion === "0.30.0") {
    console.log("   • 📦 Consolidated metadata into single aichaku.json");
    console.log("   • 🔄 Automatic migration from legacy file formats");
    console.log("   • 🧹 Cleaner .claude/aichaku directory structure");
    console.log("   • ⚡ Improved configuration management");
  } else if (currentVersion === "0.11.0") {
    console.log("   • 🔄 Automatic methodology updates during upgrade");
    console.log("   • 📁 Downloads new files added in releases");
    console.log("   • ✨ Overwrites existing files with latest content");
    console.log("   • 🚫 No more confusing network permission warnings");
  } else if (currentVersion === "0.9.1") {
    console.log("   • 🔧 Fixed installer upgrade verification");
    console.log("   • 📁 Support for new project marker format");
    console.log("   • 🚀 Better error handling during upgrades");
  } else if (currentVersion === "0.9.0") {
    console.log(
      "   • 🎯 Unified upgrade command (no more integrate --force!)",
    );
    console.log("   • ✂️  Surgical CLAUDE.md updates with markers");
    console.log("   • 🔄 Automatic project updates during upgrade");
  } else if (currentVersion === "0.8.0") {
    console.log("   • 🚀 Ultra-simple installation: deno run -A init.ts");
    console.log("   • 📦 Enhanced install script with version feedback");
    console.log("   • 🔄 Improved upgrade experience");
    console.log("   • 💡 Clear next steps after installation");
  } else if (currentVersion === "0.7.0") {
    console.log("   • 🪴 Visual identity with progress indicators");
    console.log("   • 💬 Discussion-first document creation");
    console.log("   • 📊 Mermaid diagram integration");
    // codeql[js/todo-comment] - This is a changelog message, not a TODO comment
    console.log("   • ✅ Fixed TODO lists and formatting"); // DevSkim: ignore DS176209 - This is a changelog message, not a TODO comment
  }

  // Show migration notice if upgrading from pre-consolidation version
  const preConsolidationVersion = "0.29.0";
  if (compareVersions(previousVersion, preConsolidationVersion) <= 0) {
    console.log("\n🔄 Migration Notice:");
    console.log(
      "   Your metadata files have been consolidated into a single aichaku.json",
    );
    console.log("   Legacy files have been cleaned up automatically");
  }
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}
