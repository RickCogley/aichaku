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
import {
  createInstallationDiagram,
  createUpgradeSummary,
  generateContextualFeedback,
} from "../utils/visual-guidance.ts";
import { printFormatted } from "../utils/terminal-formatter.ts";

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
 * Enhanced upgrade function with contextual guidance
 */
export function createEnhancedUpgradeMessage(
  metadata: AichakuMetadata,
  isGlobal: boolean,
  targetPath: string,
): string {
  // Generate enhanced contextual feedback
  const contextualFeedback = generateContextualFeedback(
    {
      action: `Upgraded Aichaku from v${metadata.version} to v${VERSION}`,
      location: targetPath,
      installationType: isGlobal ? "global" : "project",
      version: VERSION,
      changes: [
        "Updated methodology templates to latest versions",
        "Refreshed standards library with current definitions",
        "Preserved all user customizations",
        isGlobal ? "Made available to all projects" : "Updated project-specific configuration",
      ],
    },
    {
      immediate: isGlobal
        ? [
          "Run 'aichaku upgrade' in your project directories to update them",
          "Projects will inherit the new methodologies automatically",
        ]
        : [
          "Changes are immediately available to Claude Code",
          "Run 'aichaku status' to verify current configuration",
        ],
      recommended: [
        "Test the updated features with your team",
        "Review new methodology templates if applicable",
        "Run 'aichaku integrate' to refresh CLAUDE.md if needed",
      ],
      optional: [
        "Explore new standards with 'aichaku standards --list'",
        "Set up MCP integration with 'aichaku mcp --install'",
        "Configure hooks for automated workflows: 'aichaku hooks --list'",
      ],
    },
  );

  const installationDiagram = createInstallationDiagram(
    isGlobal ? "global" : "project",
    targetPath,
    VERSION,
  );

  const upgradeSummary = createUpgradeSummary(
    metadata.version,
    VERSION,
    2, // methodologies + standards
  );

  return Brand.completed(`Upgrade to v${VERSION}`) +
    "\n" + upgradeSummary +
    "\n" + installationDiagram +
    "\n" + contextualFeedback;
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

  if (!metadataInfo.path) {
    return {
      success: false,
      path: targetPath,
      message: `🪴 Aichaku: No installation found at ${targetPath}. Run 'aichaku init' first.`,
    };
  }

  const metadataPath = metadataInfo.path;

  // Read current metadata
  let metadata: AichakuMetadata;
  try {
    // Security: metadataPath is safe - validated to be either .aichaku.json or .aichaku-project in .claude directory
    const content = await Deno.readTextFile(metadataPath);
    const rawMetadata = JSON.parse(content);

    // Handle both old and new metadata formats - preserve all existing fields
    metadata = {
      ...rawMetadata, // Preserve all existing fields (including standards)
      version: rawMetadata.version || metadataInfo.version || VERSION,
      installedAt: rawMetadata.installedAt || rawMetadata.createdAt ||
        new Date().toISOString(),
      installationType: rawMetadata.installationType ||
        (isGlobal ? "global" : "local"),
      lastUpgrade: rawMetadata.lastUpgrade || null,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `Failed to read installation metadata: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  // Check version
  if (options.check) {
    if (metadata.version === VERSION) {
      return {
        success: true,
        path: targetPath,
        message: `ℹ️  Current version: v${VERSION}\n    Latest version:  v${VERSION}\n    \n✓ You're up to date!`,
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
      message: `🪴 Aichaku: Already on latest version (v${VERSION}). Use --force to reinstall.`,
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

    // Migrate metadata to new location if needed
    if (isGlobal && metadataInfo.needsMigration) {
      const newPath = paths.global.config;
      await migrateMetadata(metadataPath, newPath, metadata);
      if (!options.silent) {
        Brand.success("Migrated configuration to new location");
      }
    } else {
      // Update existing metadata file
      await Deno.writeTextFile(
        metadataPath,
        JSON.stringify(metadata, null, 2),
      );
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
      message: createEnhancedUpgradeMessage(metadata, isGlobal, targetPath),
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
  printFormatted(`# 🪴 Aichaku Upgrade - Update to latest version

Updates Aichaku methodologies, standards, and core functionality to the latest version.
Automatically migrates configurations and preserves customizations.

## Usage
\`aichaku upgrade [options]\`

## Options
- **-g, --global** - Upgrade global installation (~/.claude)
- **-f, --force** - Force upgrade even if already at latest version
- **-s, --silent** - Upgrade silently with minimal output
- **-d, --dry-run** - Preview what would be upgraded without applying changes
- **-c, --check** - Check for available updates without installing
- **-h, --help** - Show this help message

## Examples

\`\`\`bash
aichaku upgrade                    # Upgrade current project
aichaku upgrade --global           # Upgrade global installation
aichaku upgrade --check            # Check for updates
aichaku upgrade --dry-run          # Preview upgrade changes
aichaku upgrade --force            # Force upgrade
\`\`\`

## Notes
- Preserves all user customizations and configurations
- Automatically migrates legacy file formats
- Updates methodology templates and standards library
- Creates backup before making changes
`);
}
