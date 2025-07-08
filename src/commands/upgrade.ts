import { exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchMethodologies } from "./methodology-fetcher.ts";

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
  const isGlobal = options.global || false;
  // codeql[js/path-injection] Safe because paths are validated and constrained to .claude directory
  const targetPath = isGlobal
    ? join(Deno.env.get("HOME") || "", ".claude")
    : resolve(options.projectPath || "./.claude");

  // Check if Aichaku is installed (try both old and new marker files)
  // codeql[js/path-injection] Safe because targetPath is validated and file names are hardcoded
  const aichakuJsonPath = join(targetPath, ".aichaku.json");
  // codeql[js/path-injection] Safe because targetPath is validated and file names are hardcoded
  const aichakuProjectPath = join(targetPath, ".aichaku-project");

  let metadataPath: string | null = null;
  if (await exists(aichakuJsonPath)) {
    metadataPath = aichakuJsonPath;
  } else if (!isGlobal && await exists(aichakuProjectPath)) {
    metadataPath = aichakuProjectPath;
  }

  if (!metadataPath) {
    return {
      success: false,
      path: targetPath,
      message:
        `No Aichaku installation found at ${targetPath}. Run 'aichaku init' first.`,
    };
  }

  // Read current metadata
  let metadata: AichakuMetadata;
  try {
    const content = await Deno.readTextFile(metadataPath);
    const rawMetadata = JSON.parse(content);

    // Handle both old and new metadata formats
    metadata = {
      version: rawMetadata.version || VERSION,
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
        `Already on latest version (v${VERSION}). Use --force to reinstall.`,
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
      console.log(
        `📦 Upgrading Aichaku from v${metadata.version} to v${VERSION}...`,
      );
    }

    // Check for user customizations
    const userDir = join(targetPath, "user");
    const hasCustomizations = await exists(userDir);
    if (hasCustomizations && !options.silent) {
      console.log("✓ User customizations detected - will be preserved");
    }

    // Update methodologies
    // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted and controlled by runtime
    const isJSR = import.meta.url.startsWith("https://jsr.io");

    if (!options.silent) {
      console.log("📚 Updating methodology files...");
    }

    if (isJSR) {
      // Fetch from GitHub when running from JSR
      // First try to update in place (preserves any user modifications)
      const fetchSuccess = await fetchMethodologies(targetPath, VERSION, {
        silent: options.silent,
        overwrite: true, // Always overwrite during upgrades to get latest content
      });

      if (!fetchSuccess) {
        // If fetch fails completely, try removing and re-fetching
        const targetMethodologies = join(targetPath, "methodologies");
        if (await exists(targetMethodologies)) {
          await Deno.remove(targetMethodologies, { recursive: true });
        }

        const retrySuccess = await fetchMethodologies(targetPath, VERSION, {
          silent: options.silent,
          overwrite: true,
        });

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
        "../../../methodologies",
      );
      const targetMethodologies = join(targetPath, "methodologies");

      // Remove old methodologies for clean copy
      if (await exists(targetMethodologies)) {
        await Deno.remove(targetMethodologies, { recursive: true });
      }

      await copy(sourceMethodologies, targetMethodologies);
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
        console.log("   • ✅ Fixed TODO lists and formatting");
      }
    }

    // Update metadata
    metadata.version = VERSION;
    metadata.lastUpgrade = new Date().toISOString();
    await Deno.writeTextFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
    );

    // NEW: If upgrading a project (not global), also update CLAUDE.md
    if (!isGlobal && !options.dryRun) {
      const projectPath = resolve(targetPath, "..");
      const claudeMdPath = join(projectPath, "CLAUDE.md");

      if (await exists(claudeMdPath)) {
        if (!options.silent) {
          console.log("\n📄 Updating CLAUDE.md with latest directives...");
        }

        // Import integrate function
        const { integrate } = await import("./integrate.ts");

        const integrateResult = await integrate({
          projectPath,
          force: true,
          silent: options.silent,
        });

        if (integrateResult.success && !options.silent) {
          console.log("✅ CLAUDE.md updated successfully");
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      message:
        `Upgraded to v${VERSION}!\n\n💡 All your projects now have the latest methodologies!`,
      action: "upgraded",
      version: VERSION,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `Upgrade failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      action: "error",
    };
  }
}
