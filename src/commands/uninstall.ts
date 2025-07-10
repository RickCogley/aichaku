import { exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { getAichakuPaths } from "../paths.ts";

interface UninstallOptions {
  global?: boolean;
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
}

interface UninstallResult {
  success: boolean;
  path: string;
  message?: string;
  claudeMdReferences?: { line: number; text: string }[];
}

/**
 * Uninstall Aichaku from the system
 *
 * @param options - Uninstall options
 * @returns Promise with uninstall result
 */
export async function uninstall(
  options: UninstallOptions = {},
): Promise<UninstallResult> {
  const isGlobal = options.global || false;
  const paths = getAichakuPaths();
  
  // codeql[js/path-injection] Safe because paths are validated and constrained to .claude directory
  const targetPath = isGlobal
    ? paths.global.root
    : paths.project.root;

  // Check if Aichaku is installed
  // codeql[js/path-injection] Safe because targetPath is validated and file name is hardcoded
  const aichakuJsonPath = isGlobal ? paths.global.config : paths.project.config;
  if (!await exists(aichakuJsonPath)) {
    return {
      success: false,
      path: targetPath,
      message: `No Aichaku installation found at ${targetPath}.`,
    };
  }

  // Check for user customizations
  // codeql[js/path-injection] Safe because targetPath is validated and "user" is hardcoded
  const userDir = join(targetPath, "user");
  const hasCustomizations = await exists(userDir);

  if (options.dryRun) {
    console.log(`[DRY RUN] Would uninstall Aichaku from: ${targetPath}`);
    console.log("[DRY RUN] Would remove:");
    console.log("  - methodologies/ (all methodology files)");
    console.log("  - user/ (all customizations)");
    console.log("  - .aichaku.json (metadata)");
    if (hasCustomizations) {
      console.log(
        "\n⚠️  [DRY RUN] Warning: User customizations exist and would be deleted!",
      );
    }
    return {
      success: true,
      path: targetPath,
      message: "Dry run completed. No files were modified.",
    };
  }

  // Confirm if not forced and has customizations
  if (!options.force && hasCustomizations && !options.silent) {
    console.log("\n⚠️  Warning: User customizations detected in:");
    console.log(`   ${userDir}`);
    console.log("\nThese will be permanently deleted!");
    console.log("\nPress Enter to continue or Ctrl+C to cancel...");

    // Wait for user confirmation
    const buf = new Uint8Array(1);
    await Deno.stdin.read(buf);
  }

  try {
    // Check for CLAUDE.md references
    const projectPath = isGlobal
      ? Deno.cwd()
      : resolve(options.projectPath || ".");
    const claudeMdPath = join(projectPath, "CLAUDE.md");
    const claudeMdReferences: { line: number; text: string }[] = [];

    if (await exists(claudeMdPath)) {
      // Security: claudeMdPath is safe - constructed from resolved projectPath and hardcoded "CLAUDE.md"
      const content = await Deno.readTextFile(claudeMdPath);
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (
          line.toLowerCase().includes("aichaku") ||
          line.includes("## Methodologies")
        ) {
          claudeMdReferences.push({ line: index + 1, text: line.trim() });
        }
      });
    }

    if (!options.silent) {
      console.log("🗑️  Removing Aichaku...");
    }

    // Remove the entire .claude directory if it only contains Aichaku files
    const methodologiesDir = isGlobal ? paths.global.methodologies : paths.project.root;
    const hasOnlyAichaku = await exists(methodologiesDir) &&
      await exists(aichakuJsonPath);

    if (hasOnlyAichaku) {
      // Check if there are other files in .claude besides Aichaku
      const entries = [];
      // Security: targetPath is safe - validated to be .claude directory
      for await (const entry of Deno.readDir(targetPath)) {
        if (
          entry.name !== "methodologies" && entry.name !== "user" &&
          entry.name !== ".aichaku.json"
        ) {
          entries.push(entry.name);
        }
      }

      if (entries.length === 0) {
        // Only Aichaku files, safe to remove entire directory
        // Security: targetPath is safe - validated to be .claude directory
        await Deno.remove(targetPath, { recursive: true });
        if (!options.silent) {
          console.log(`✓ Removed ${targetPath}`);
        }
      } else {
        // Other files exist, only remove Aichaku files
        // Security: methodologiesDir is safe - constructed from validated targetPath and hardcoded "methodologies"
        await Deno.remove(methodologiesDir, { recursive: true });
        if (hasCustomizations) {
          // Security: userDir is safe - constructed from validated targetPath and hardcoded "user"
          await Deno.remove(userDir, { recursive: true });
        }
        // Security: aichakuJsonPath is safe - constructed from validated targetPath and hardcoded ".aichaku.json"
        await Deno.remove(aichakuJsonPath);
        if (!options.silent) {
          console.log("✓ Removed Aichaku files");
          console.log(`✓ Other files in ${targetPath} were preserved`);
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      message: `Uninstalled Aichaku from ${targetPath}`,
      claudeMdReferences,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `Uninstall failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
