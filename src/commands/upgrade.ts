import { exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchMethodologies, fetchStandards } from "./content-fetcher.ts";
import { getAichakuPaths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { safeRemove } from "../utils/path-security.ts";
import { findMetadataPath, migrateMetadata } from "./upgrade-fix.ts";
import { Brand } from "../utils/branded-messages.ts";
// Visual guidance utilities available if needed for enhanced feedback
// import {
//   createInstallationDiagram,
//   createUpgradeSummary,
//   generateContextualFeedback,
// } from "../utils/visual-guidance.ts";

interface UpgradeOptions {
  global?: boolean;
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
  check?: boolean;
  help?: boolean;
}

interface UpgradeResult {
  success: boolean;
  path: string;
  message?: string;
  action?: "check" | "upgraded" | "current" | "error";
  version?: string;
  latestVersion?: string;
}

interface AichakuMetadata {
  version: string;
  installedAt: string;
  installationType: "global" | "local";
  lastUpgrade: string | null;
}

/**
 * Upgrade Aichaku to the latest version
 *
 * @param options - Upgrade options
 * @returns Promise with upgrade result
 */
export async function upgrade(
  options: UpgradeOptions = {},
): Promise<UpgradeResult> {
  // Show help if requested
  if (options.help) {
    showUpgradeHelp();
    return {
      success: true,
      path: "",
      message: "Help displayed",
      action: "check",
    };
  }
  const isGlobal = options.global || false;
  const paths = getAichakuPaths();

  // Use centralized path management
  const targetPath = isGlobal ? paths.global.root : paths.project.root;
  // Security: Use safe project path resolution
  const _projectPath = resolveProjectPath(options.projectPath);

  // Find metadata in any of the possible locations
  const metadataInfo = await findMetadataPath(targetPath, isGlobal);

  // If no metadata found but we're in a project with legacy files, create minimal metadata
  if (!metadataInfo.path && !isGlobal) {
    const legacyFiles = [
      join(targetPath, "RULES-REMINDER.md"),
      join(targetPath, "aichaku-standards.json"),
      join(targetPath, "doc-standards.json"),
      join(targetPath, ".aichaku-behavior"),
      join(targetPath, "aichaku.config.json"),
    ];

    const hasLegacyFiles = await Promise.all(legacyFiles.map((f) => exists(f)));
    const hasAnyLegacy = hasLegacyFiles.some(Boolean);

    if (hasAnyLegacy) {
      // Create minimal metadata for legacy installation
      metadataInfo.path = join(targetPath, "aichaku.json");
      metadataInfo.version = "0.0.0"; // Will be upgraded
      metadataInfo.needsMigration = false;

      if (!options.silent) {
        Brand.info("Detected legacy Aichaku installation - upgrading...");
      }
    } else {
      return {
        success: false,
        path: targetPath,
        message:
          `🪴 Aichaku: No installation found at ${targetPath}. Run 'aichaku init' first.`,
      };
    }
  } else if (!metadataInfo.path) {
    return {
      success: false,
      path: targetPath,
      message:
        `🪴 Aichaku: No installation found at ${targetPath}. Run 'aichaku init' first.`,
    };
  }

  const metadataPath = metadataInfo.path;

  // Read current metadata
  let metadata: AichakuMetadata;
  try {
    let rawMetadata: Record<string, unknown> = {};

    // Check if metadata file actually exists
    if (await exists(metadataPath)) {
      // Security: metadataPath is safe - validated to be either .aichaku.json or .aichaku-project in .claude directory
      const content = await Deno.readTextFile(metadataPath);
      rawMetadata = JSON.parse(content);
    }
    // If file doesn't exist (legacy detection), create minimal metadata

    // Handle both old and new metadata formats - preserve all existing fields
    metadata = {
      ...rawMetadata, // Preserve all existing fields (including standards)
      version: (rawMetadata.version as string) || metadataInfo.version ||
        "0.0.0",
      installedAt: (rawMetadata.installedAt as string) ||
        (rawMetadata.createdAt as string) ||
        new Date().toISOString(),
      installationType: (rawMetadata.installationType as "global" | "local") ||
        (isGlobal ? "global" : "local"),
      lastUpgrade: (rawMetadata.lastUpgrade as string) || null,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `Failed to read installation metadata: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  // Check version
  if (options.check) {
    if (metadata.version === VERSION) {
      return {
        success: true,
        path: targetPath,
        message:
          `ℹ️  Current version: v${VERSION}\n    Latest version:  v${VERSION}\n    \n✓ You're up to date!`,
        action: "check",
        version: metadata.version,
        latestVersion: VERSION,
      };
    } else {
      return {
        success: true,
        path: targetPath,
        message:
          `📦 Update available: v${metadata.version} → v${VERSION}\n\nRun 'aichaku upgrade' to install the latest version.`,
        action: "check",
        version: metadata.version,
        latestVersion: VERSION,
      };
    }
  }

  // Check if already on latest version
  if (metadata.version === VERSION && !options.force) {
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
    console.log(`[DRY RUN] Current version: v${metadata.version}`);
    console.log(`[DRY RUN] New version: v${VERSION}`);
    console.log("[DRY RUN] Would update:");
    console.log("  - methodologies/ (latest methodology files)");
    console.log("[DRY RUN] Would preserve:");
    console.log("  - user/ (all customizations)");
    console.log("  - .aichaku.json (with updated version)");
    return {
      success: true,
      path: targetPath,
      message: "Dry run completed. No files were modified.",
    };
  }

  try {
    if (!options.silent) {
      console.log(Brand.upgrading(metadata.version, VERSION));
    }

    // Check for user customizations
    const userDir = join(targetPath, "user");
    const hasCustomizations = await exists(userDir);
    if (hasCustomizations && !options.silent) {
      Brand.success("User customizations detected - will be preserved");
    }

    // Update methodologies
    // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted and controlled by runtime
    const isJSR = import.meta.url.startsWith("https://jsr.io") ||
      !import.meta.url.includes("/aichaku/");

    if (!options.silent) {
      Brand.progress("Updating methodology files...", "active");
    }

    if (isJSR) {
      // Fetch from GitHub when running from JSR
      // First try to update in place (preserves any user modifications)
      const fetchSuccess = await fetchMethodologies(
        paths.global.methodologies,
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
          paths.global.methodologies,
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
      const fetchSuccess = await fetchStandards(
        paths.global.standards,
        VERSION,
        {
          silent: options.silent,
          overwrite: true, // Always overwrite during upgrades to get latest content
        },
      );

      if (!fetchSuccess) {
        // If fetch fails completely, try removing and re-fetching
        const targetStandards = paths.global.standards;
        if (await exists(targetStandards)) {
          // Security: Use safe remove
          await safeRemove(targetStandards, paths.global.root, {
            recursive: true,
          });
        }

        const retrySuccess = await fetchStandards(
          paths.global.standards,
          VERSION,
          {
            silent: options.silent,
            overwrite: true,
          },
        );

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
        "../../../docs/standards",
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
    if (!options.silent && metadata.version !== VERSION) {
      // Type assertion to handle const literal type
      const currentVersion = VERSION as string;

      if (currentVersion === "0.11.0") {
        console.log("\n✨ What's new in v0.11.0:");
        console.log("   • 🔄 Automatic methodology updates during upgrade");
        console.log("   • 📁 Downloads new files added in releases");
        console.log("   • ✨ Overwrites existing files with latest content");
        console.log("   • 🚫 No more confusing network permission warnings");
      } else if (currentVersion === "0.9.1") {
        console.log("\n✨ What's new in v0.9.1:");
        console.log("   • 🔧 Fixed installer upgrade verification");
        console.log("   • 📁 Support for new project marker format");
        console.log("   • 🚀 Better error handling during upgrades");
      } else if (currentVersion === "0.9.0") {
        console.log("\n✨ What's new in v0.9.0:");
        console.log(
          "   • 🎯 Unified upgrade command (no more integrate --force!)",
        );
        console.log("   • ✂️  Surgical CLAUDE.md updates with markers");
        console.log("   • 🔄 Automatic project updates during upgrade");
      } else if (currentVersion === "0.8.0") {
        console.log("\n✨ What's new in v0.8.0:");
        console.log("   • 🚀 Ultra-simple installation: deno run -A init.ts");
        console.log("   • 📦 Enhanced install script with version feedback");
        console.log("   • 🔄 Improved upgrade experience");
        console.log("   • 💡 Clear next steps after installation");
      } else if (currentVersion === "0.7.0") {
        console.log("\n✨ What's new in v0.7.0:");
        console.log("   • 🪴 Visual identity with progress indicators");
        console.log("   • 💬 Discussion-first document creation");
        console.log("   • 📊 Mermaid diagram integration");
        // codeql[js/todo-comment] - This is a changelog message, not a TODO comment
        console.log("   • ✅ Fixed TODO lists and formatting"); // DevSkim: ignore DS176209 - This is a changelog message, not a TODO comment
      }
    }

    // Update metadata
    metadata.version = VERSION;
    metadata.lastUpgrade = new Date().toISOString();

    // Determine correct metadata file location
    let finalMetadataPath: string;

    if (isGlobal) {
      if (metadataInfo.needsMigration) {
        const newPath = paths.global.config;
        await migrateMetadata(metadataPath, newPath, metadata);
        finalMetadataPath = newPath;
        if (!options.silent) {
          Brand.success("Migrated configuration to new location");
        }
      } else {
        finalMetadataPath = metadataPath;
      }
    } else {
      // PROJECT UPGRADES: Always use aichaku.json in the project directory
      finalMetadataPath = join(targetPath, "aichaku.json");

      // Clean up legacy project files if they exist
      const legacyFiles = [
        join(targetPath, "RULES-REMINDER.md"),
        join(targetPath, "aichaku-standards.json"),
        join(targetPath, "doc-standards.json"),
        join(targetPath, ".aichaku-behavior"),
        join(targetPath, "aichaku.config.json"), // Old naming
      ];

      for (const legacyFile of legacyFiles) {
        if (await exists(legacyFile)) {
          try {
            await Deno.remove(legacyFile);
            if (!options.silent) {
              Brand.success(
                `Cleaned up legacy file: ${legacyFile.split("/").pop()}`,
              );
            }
          } catch {
            // Don't fail upgrade if cleanup fails
          }
        }
      }

      if (
        !options.silent &&
        legacyFiles.some((f) => metadataPath.includes(f.split("/").pop() || ""))
      ) {
        Brand.success("Cleaned up legacy configuration files");
      }
    }

    // Write the metadata to the correct location
    await Deno.writeTextFile(
      finalMetadataPath,
      JSON.stringify(metadata, null, 2),
    );

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
        "\n\n💡 All your projects now have the latest methodologies!",
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
 * Show help information for the upgrade command
 */
function showUpgradeHelp(): void {
  console.log(`
🪴 Aichaku Upgrade - Update to latest version

Updates Aichaku methodologies, standards, and core functionality to the latest version.
Automatically migrates configurations and preserves customizations.

Usage:
  aichaku upgrade [options]

Options:
  -g, --global     Upgrade global installation (~/.claude)
  -f, --force      Force upgrade even if already at latest version
  -s, --silent     Upgrade silently with minimal output
  -d, --dry-run    Preview what would be upgraded without applying changes
  -c, --check      Check for available updates without installing
  -h, --help       Show this help message

Examples:
  aichaku upgrade                    # Upgrade current project
  aichaku upgrade --global           # Upgrade global installation
  aichaku upgrade --check            # Check for updates
  aichaku upgrade --dry-run          # Preview upgrade changes
  aichaku upgrade --force            # Force upgrade

Notes:
  • Preserves all user customizations and configurations
  • Automatically migrates legacy file formats
  • Updates methodology templates and standards library
  • Creates backup before making changes
`);
}
