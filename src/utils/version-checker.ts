/**
 * Version checking utilities for Aichaku CLI
 * Compares CLI version with global installation version
 */

import { exists } from "jsr:@std/fs@1";
import { VERSION } from "../../mod.ts";
import { getAichakuPaths } from "../paths.ts";
import { findMetadataPath } from "../commands/upgrade-fix.ts";

export interface VersionCheckResult {
  cliVersion: string;
  globalVersion?: string;
  hasGlobalInstallation: boolean;
  isVersionMatch: boolean;
  warningMessage?: string;
}

/**
 * Check if CLI version matches global installation version
 * @returns Version check result with warning message if applicable
 */
export async function checkVersionMatch(): Promise<VersionCheckResult> {
  const paths = getAichakuPaths();
  const cliVersion = VERSION;

  try {
    // Check if global installation exists
    const globalExists = await exists(paths.global.root);
    if (!globalExists) {
      return {
        cliVersion,
        hasGlobalInstallation: false,
        isVersionMatch: true, // No warning if no global installation
      };
    }

    // Find metadata in global installation
    const metadataInfo = await findMetadataPath(paths.global.root, true);
    if (!metadataInfo.path) {
      return {
        cliVersion,
        hasGlobalInstallation: true,
        isVersionMatch: true, // No warning if no metadata found
      };
    }

    // Read global version from metadata
    let globalVersion: string;
    try {
      const content = await Deno.readTextFile(metadataInfo.path);
      const metadata = JSON.parse(content);
      globalVersion = metadata.version || metadataInfo.version || "unknown";
    } catch {
      return {
        cliVersion,
        hasGlobalInstallation: true,
        isVersionMatch: true, // No warning if can't read metadata
      };
    }

    // Compare versions
    const isVersionMatch = cliVersion === globalVersion;
    let warningMessage: string | undefined;

    if (!isVersionMatch) {
      warningMessage = `⚠️  Version mismatch detected:
   CLI version:    v${cliVersion}
   Global files:   v${globalVersion}
   
   Run 'aichaku upgrade --global' to update global files to match CLI.`;
    }

    return {
      cliVersion,
      globalVersion,
      hasGlobalInstallation: true,
      isVersionMatch,
      warningMessage,
    };
  } catch {
    // If any error occurs, don't show warning
    return {
      cliVersion,
      hasGlobalInstallation: false,
      isVersionMatch: true,
    };
  }
}

/**
 * Display version check warning if needed
 * Non-blocking - just displays warning and continues
 * @param _command - Optional command name (unused, for compatibility)
 */
export async function displayVersionWarning(_command?: string): Promise<void> {
  try {
    const result = await checkVersionMatch();

    if (result.warningMessage) {
      console.warn(result.warningMessage);
      console.warn(""); // Empty line for readability
    }
  } catch {
    // Silently ignore any errors in version checking
    // This is a non-critical feature that shouldn't break the CLI
  }
}
