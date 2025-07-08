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
  const targetPath = isGlobal
    ? join(Deno.env.get("HOME") || "", ".claude")
    : resolve(options.projectPath || "./.claude");

  // Check if Aichaku is installed
  const aichakuJsonPath = join(targetPath, ".aichaku.json");
  if (!await exists(aichakuJsonPath)) {
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
    const content = await Deno.readTextFile(aichakuJsonPath);
    metadata = JSON.parse(content);
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

    // Update methodologies only
    const isJSR = import.meta.url.startsWith("https://jsr.io");
    const targetMethodologies = join(targetPath, "methodologies");

    // Remove old methodologies
    if (await exists(targetMethodologies)) {
      await Deno.remove(targetMethodologies, { recursive: true });
    }

    if (isJSR) {
      // Fetch from GitHub when running from JSR
      await fetchMethodologies(targetPath, VERSION, { silent: options.silent });
    } else {
      // Local development - copy from source
      const sourceMethodologies = join(
        new URL(".", import.meta.url).pathname,
        "../../../methodologies",
      );

      if (!options.silent) {
        console.log("📚 Updating methodology files...");
      }

      await copy(sourceMethodologies, targetMethodologies);
    }

    // Show what's new in this version
    if (!options.silent && metadata.version !== VERSION) {
      // Type assertion to handle const literal type
      const currentVersion = VERSION as string;

      if (currentVersion === "0.8.0") {
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
      aichakuJsonPath,
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
