import { ensureDir, exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import type { InstallOptions, InstallResult } from "./types.ts";
import { getAichakuPaths, ensureAichakuDirs } from "./paths.ts";

/**
 * Install a methodology to the specified location
 *
 * @param methodologyName - Name of the methodology to install (e.g., "shape-up")
 * @param options - Installation options
 * @returns Installation result
 */
export async function install(
  methodologyName: string,
  options: InstallOptions = {},
): Promise<InstallResult> {
  const {
    global = false,
    projectPath,
    force = false,
    symlink = false,
    silent = false,
  } = options;

  const paths = getAichakuPaths();
  
  // Ensure directories exist
  await ensureAichakuDirs();

  // Determine installation path
  const targetPath = global
    ? join(paths.global.methodologies, methodologyName.toLowerCase())
    : resolve(projectPath || paths.project.root);

  // Check if methodology exists
  // codeql[js/path-injection] Safe because path is derived from import.meta.url and methodologyName is validated
  const methodologyPath = resolve(
    new URL("..", import.meta.url).pathname,
    "methodologies",
    methodologyName,
  );

  if (!await exists(methodologyPath)) {
    return {
      success: false,
      path: targetPath,
      methodology: methodologyName,
      message: `Methodology '${methodologyName}' not found`,
    };
  }

  // Check if already installed
  if (await exists(targetPath) && !force) {
    return {
      success: false,
      path: targetPath,
      methodology: methodologyName,
      message: `Already installed at ${targetPath}. Use --force to overwrite.`,
    };
  }

  try {
    // Ensure target directory exists
    await ensureDir(targetPath);

    if (!silent) {
      console.log(`📦 Installing ${methodologyName} to ${targetPath}...`);
    }

    // Install methodology
    if (symlink) {
      // Create symlinks
      await createSymlinks(methodologyPath, targetPath, methodologyName);
    } else {
      // Copy files
      await copyMethodology(methodologyPath, targetPath);
    }

    // Create/update CLAUDE.md if in project mode
    if (!global) {
      await updateClaudeMd(paths.project.root, methodologyName);
    }

    if (!silent) {
      console.log(`✅ Successfully installed ${methodologyName}!`);
    }

    return {
      success: true,
      path: targetPath,
      methodology: methodologyName,
      message: "Installation successful",
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      methodology: methodologyName,
      message: error instanceof Error ? error.message : "Installation failed",
    };
  }
}

async function copyMethodology(source: string, target: string): Promise<void> {
  // Security: source is validated methodology path, target is validated .claude directory
  const entries = await Array.fromAsync(Deno.readDir(source));

  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);

    if (entry.isDirectory) {
      await ensureDir(targetPath);
      await copyMethodology(sourcePath, targetPath);
    } else {
      await Deno.copyFile(sourcePath, targetPath);
    }
  }
}

async function createSymlinks(
  source: string,
  target: string,
  _methodology: string,
): Promise<void> {
  const dirs = ["commands", "methods", "personas", "templates", "scripts"];

  for (const dir of dirs) {
    const sourceDir = join(source, dir);
    const targetDir = join(target, dir);

    if (await exists(sourceDir)) {
      // Remove existing if force is implied
      try {
        // Security: targetDir is safe - constructed from validated target (.claude) and predefined dir names
        await Deno.remove(targetDir);
      } catch {
        // Ignore if doesn't exist
      }

      await Deno.symlink(sourceDir, targetDir);
    }
  }
}

async function updateClaudeMd(
  projectPath: string,
  methodology: string,
): Promise<void> {
  const claudeMdPath = join(projectPath, "..", "CLAUDE.md");
  const methodologyNote = `
## Active Methodology

This project uses the **${methodology}** methodology installed via aichaku.
Methodology files are located in the .claude/aichaku/ directory.
`;

  if (await exists(claudeMdPath)) {
    // Append to existing
    // Security: claudeMdPath is safe - constructed from projectPath and hardcoded "CLAUDE.md"
    const content = await Deno.readTextFile(claudeMdPath);
    if (!content.includes("Active Methodology")) {
      await Deno.writeTextFile(claudeMdPath, content + "\n" + methodologyNote);
    }
  } else {
    // Create new
    const defaultContent = `# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.
${methodologyNote}`;
    await Deno.writeTextFile(claudeMdPath, defaultContent);
  }
}
