/**
 * Project path utilities for validating and resolving project directories
 *
 * This module provides utilities specifically for command-line operations
 * that need to validate project paths from user input.
 *
 * @module
 */

import { normalize, resolve } from "@std/path";

/**
 * Validates and resolves a project path from user input
 *
 * @param userPath - The user-provided project path (or undefined for current directory)
 * @returns The validated absolute project path
 * @throws Error if path traversal is attempted
 *
 * @example
 * ```typescript
 * // Returns current working directory
 * const projectPath = resolveProjectPath();
 *
 * // Returns absolute path if valid
 * const projectPath = resolveProjectPath("./my-project");
 *
 * // Throws error - attempted traversal
 * const projectPath = resolveProjectPath("../../../etc");
 * ```
 */
export function resolveProjectPath(userPath?: string): string {
  const basePath = userPath || ".";
  const normalized = normalize(basePath);
  const resolved = resolve(normalized);

  // Security check: ensure the path doesn't try to escape using ..
  // This is a simpler check for project paths that should be relative to cwd
  if (normalized.includes("..")) {
    throw new Error(
      "Invalid project path: parent directory references not allowed",
    );
  }

  return resolved;
}

/**
 * Validates that a file path stays within a project directory
 *
 * @param filePath - The file path to validate
 * @param projectPath - The project directory that the file must be within
 * @returns The validated absolute file path
 * @throws Error if the file path escapes the project directory
 */
export function validateProjectFile(
  filePath: string,
  projectPath: string,
): string {
  const absoluteProject = resolve(projectPath);
  const normalizedFile = normalize(filePath);
  const absoluteFile = resolve(absoluteProject, normalizedFile);

  // Security check: ensure the resolved path is within the project
  if (!absoluteFile.startsWith(absoluteProject)) {
    throw new Error("Invalid file path: attempted directory traversal");
  }

  return absoluteFile;
}
