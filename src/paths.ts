/**
 * Centralized path management for Aichaku
 * Handles both global (~/.claude/aichaku/) and project (.claude/aichaku/) paths
 */

import { join } from "jsr:@std/path@1.0.0";
import { ensureDir } from "jsr:@std/fs@1.0.0";

/**
 * Path configuration interface
 */
export interface AichakuPaths {
  // Global paths (~/.claude/aichaku/)
  global: {
    root: string;
    methodologies: string;
    standards: string;
    core: string;
    config: string;
    cache: string;
    user: {
      root: string;
      methodologies: string;
      standards: string;
      templates: string;
      config: string;
    };
  };

  // Project paths (.claude/aichaku/)
  project: {
    root: string;
    output: string;
    config: string;
    active: string;
    done: string;
  };

  // Legacy paths for migration
  legacy: {
    globalMethodologies: string; // ~/.claude/methodologies/
    globalStandards: string; // ~/.claude/standards/
    projectOutput: string; // .claude/output/
    customStandards: string; // ~/.claude/aichaku/standards/custom/
  };
}

/**
 * Get the user's home directory
 */
function getHomeDir(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!home) {
    throw new Error("Unable to determine home directory");
  }
  return home;
}

/**
 * Get the current working directory
 */
function getCwd(): string {
  return Deno.cwd();
}

/**
 * Get all Aichaku paths
 */
export function getAichakuPaths(): AichakuPaths {
  const home = getHomeDir();
  const cwd = getCwd();

  return {
    // Global paths under ~/.claude/aichaku/
    global: {
      root: join(home, ".claude", "aichaku"),
      methodologies: join(home, ".claude", "aichaku", "docs", "methodologies"),
      standards: join(home, ".claude", "aichaku", "docs", "standards"),
      core: join(home, ".claude", "aichaku", "docs", "core"),
      config: join(home, ".claude", "aichaku", "config.json"),
      cache: join(home, ".claude", "aichaku", "cache"),
      user: {
        root: join(home, ".claude", "aichaku", "user"),
        methodologies: join(
          home,
          ".claude",
          "aichaku",
          "user",
          "methodologies",
        ),
        standards: join(home, ".claude", "aichaku", "user", "standards"),
        templates: join(home, ".claude", "aichaku", "user", "templates"),
        config: join(home, ".claude", "aichaku", "user", "config"),
      },
    },

    // Project paths - config in .claude/aichaku/, docs in docs/projects/
    project: {
      root: join(cwd, ".claude", "aichaku"),
      output: join(cwd, "docs", "projects"),
      config: join(cwd, ".claude", "aichaku", "aichaku.json"),
      active: join(cwd, "docs", "projects", "active"),
      done: join(cwd, "docs", "projects", "done"),
    },

    // Legacy paths for backward compatibility
    legacy: {
      globalMethodologies: join(home, ".claude", "methodologies"),
      globalStandards: join(home, ".claude", "standards"),
      projectOutput: join(cwd, ".claude", "output"),
      customStandards: join(
        home,
        ".claude",
        "aichaku",
        "docs",
        "standards",
        "custom",
      ),
    },
  };
}

/**
 * Ensure all required directories exist
 */
export async function ensureAichakuDirs(): Promise<void> {
  const paths = getAichakuPaths();

  // Ensure global directories
  await ensureDir(paths.global.root);
  await ensureDir(paths.global.methodologies);
  await ensureDir(paths.global.standards);
  await ensureDir(paths.global.core);
  await ensureDir(paths.global.cache);

  // Ensure user directories
  await ensureDir(paths.global.user.root);
  await ensureDir(paths.global.user.methodologies);
  await ensureDir(paths.global.user.standards);
  await ensureDir(paths.global.user.templates);
  await ensureDir(paths.global.user.config);

  // Ensure project directories
  await ensureDir(paths.project.root);
  await ensureDir(paths.project.output);
  await ensureDir(paths.project.active);
  await ensureDir(paths.project.done);
}

/**
 * Get the path for a specific methodology
 */
export function getMethodologyPath(methodology: string): string {
  const paths = getAichakuPaths();
  return join(paths.global.methodologies, methodology.toLowerCase());
}

/**
 * Get the path for a specific standard
 */
export function getStandardPath(standard: string): string {
  const paths = getAichakuPaths();
  return join(paths.global.standards, `${standard.toUpperCase()}.md`);
}

/**
 * Get the path for a user custom standard
 */
export function getUserStandardPath(standard: string): string {
  const paths = getAichakuPaths();
  return join(paths.global.user.standards, `${standard.toUpperCase()}.md`);
}

/**
 * Get the path for a user custom methodology
 */
export function getUserMethodologyPath(methodology: string): string {
  const paths = getAichakuPaths();
  return join(paths.global.user.methodologies, methodology.toLowerCase());
}

/**
 * Get the path for a user template
 */
export function getUserTemplatePath(template: string): string {
  const paths = getAichakuPaths();
  return join(paths.global.user.templates, template);
}

/**
 * Get the path for a project output folder
 */
export function getProjectOutputPath(
  projectName: string,
  isActive = true,
): string {
  const paths = getAichakuPaths();
  const baseDir = isActive ? paths.project.active : paths.project.done;
  return join(baseDir, projectName);
}

/**
 * Check if legacy paths exist (for migration)
 */
export async function checkLegacyPaths(): Promise<{
  hasLegacyGlobal: boolean;
  hasLegacyProject: boolean;
}> {
  const paths = getAichakuPaths();

  try {
    const [globalMethodologies, globalStandards, projectOutput] = await Promise
      .all([
        Deno.stat(paths.legacy.globalMethodologies).then(() => true).catch(() => false),
        Deno.stat(paths.legacy.globalStandards).then(() => true).catch(() => false),
        Deno.stat(paths.legacy.projectOutput).then(() => true).catch(() => false),
      ]);

    return {
      hasLegacyGlobal: globalMethodologies || globalStandards,
      hasLegacyProject: projectOutput,
    };
  } catch {
    return {
      hasLegacyGlobal: false,
      hasLegacyProject: false,
    };
  }
}

/**
 * Resolve a path that might be in either new or legacy location
 */
export async function resolveAichakuPath(
  type: "methodology" | "standard" | "output",
  name?: string,
): Promise<string | null> {
  const paths = getAichakuPaths();

  // Define potential paths for each type
  const pathsToCheck: string[] = [];

  switch (type) {
    case "methodology":
      if (name) {
        pathsToCheck.push(
          // Check user custom methodologies first
          getUserMethodologyPath(name),
          // Then built-in methodologies
          getMethodologyPath(name),
          // Legacy location
          join(paths.legacy.globalMethodologies, name.toLowerCase()),
        );
      }
      break;

    case "standard":
      if (name) {
        pathsToCheck.push(
          // Check user custom standards first
          getUserStandardPath(name),
          // Then built-in standards
          getStandardPath(name),
          // Legacy global standards
          join(paths.legacy.globalStandards, `${name.toUpperCase()}.md`),
          // Legacy custom standards
          join(paths.legacy.customStandards, `${name.toUpperCase()}.md`),
        );
      }
      break;

    case "output":
      pathsToCheck.push(
        paths.project.output,
        paths.legacy.projectOutput,
      );
      break;
  }

  // Check each path and return the first one that exists
  for (const path of pathsToCheck) {
    try {
      await Deno.stat(path);
      return path;
    } catch {
      // Path doesn't exist, continue
    }
  }

  return null;
}

/**
 * Format a path for display (replace home directory with ~)
 */
export function formatPathForDisplay(path: string): string {
  const home = getHomeDir();
  if (path.startsWith(home)) {
    return path.replace(home, "~");
  }
  return path;
}

/**
 * Validate that a path is within allowed boundaries
 */
export function isPathSafe(path: string): boolean {
  const paths = getAichakuPaths();
  const resolvedPath = join(path);

  // Check if path is within allowed directories
  const allowedPaths = [
    paths.global.root,
    paths.project.root,
    paths.legacy.globalMethodologies,
    paths.legacy.globalStandards,
    paths.legacy.projectOutput,
    paths.legacy.customStandards,
  ];

  return allowedPaths.some((allowed) => resolvedPath.startsWith(allowed));
}

/**
 * Export convenience functions for common operations
 */
export const paths = {
  get: getAichakuPaths,
  ensure: ensureAichakuDirs,
  methodology: getMethodologyPath,
  standard: getStandardPath,
  userStandard: getUserStandardPath,
  userMethodology: getUserMethodologyPath,
  userTemplate: getUserTemplatePath,
  projectOutput: getProjectOutputPath,
  checkLegacy: checkLegacyPaths,
  resolve: resolveAichakuPath,
  format: formatPathForDisplay,
  isSafe: isPathSafe,
} as const;

// Types are already exported above
