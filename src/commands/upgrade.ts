import { exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";

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
      if (!options.silent) {
        console.log(`✓ Aichaku is up to date (v${VERSION})`);
      }
      return {
        success: true,
        path: targetPath,
        message: `Already on latest version (v${VERSION})`,
      };
    } else {
      if (!options.silent) {
        console.log(`Update available: v${metadata.version} → v${VERSION}`);
      }
      return {
        success: true,
        path: targetPath,
        message: `Update available: v${metadata.version} → v${VERSION}`,
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
    const sourceMethodologies = join(
      new URL(".", import.meta.url).pathname,
      "../../../methodologies",
    );
    const targetMethodologies = join(targetPath, "methodologies");

    if (!options.silent) {
      console.log("📚 Updating methodology files...");
    }

    // Remove old methodologies and copy new ones
    if (await exists(targetMethodologies)) {
      await Deno.remove(targetMethodologies, { recursive: true });
    }
    await copy(sourceMethodologies, targetMethodologies);

    // Update metadata
    metadata.version = VERSION;
    metadata.lastUpgrade = new Date().toISOString();
    await Deno.writeTextFile(
      aichakuJsonPath,
      JSON.stringify(metadata, null, 2),
    );

    return {
      success: true,
      path: targetPath,
      message: `Upgraded to v${VERSION} at ${targetPath}`,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `Upgrade failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
