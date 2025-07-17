/**
 * Path security utilities for preventing directory traversal attacks
 *
 * This module provides utilities to safely validate and resolve file paths,
 * ensuring they remain within allowed directories and preventing malicious
 * path traversal attempts.
 *
 * @module
 */

import { normalize, resolve } from "jsr:@std/path@1";

/**
 * Validates that a path stays within the allowed base directory
 *
 * @param userPath - The user-provided path (potentially malicious)
 * @param baseDir - The base directory that the path must stay within
 * @returns The validated absolute path
 * @throws Error if path traversal is attempted
 *
 * @example
 * ```typescript
 * // Safe usage
 * const safePath = validatePath("docs/readme.md", "/project");
 * // Returns: "/project/docs/readme.md"
 *
 * // Throws error - attempted traversal
 * const maliciousPath = validatePath("../../../etc/passwd", "/project");
 * // Throws: Error: Invalid path: attempted directory traversal
 * ```
 */
export function validatePath(userPath: string, baseDir: string): string {
  // Normalize the base directory to get absolute path
  const absoluteBase = resolve(baseDir);

  // Join and normalize the full path
  const normalizedPath = normalize(userPath);
  const fullPath = resolve(absoluteBase, normalizedPath);

  // Security check: ensure the resolved path is within the base directory
  if (!fullPath.startsWith(absoluteBase)) {
    throw new Error("Invalid path: attempted directory traversal");
  }

  return fullPath;
}

/**
 * Safely reads a text file after validating the path
 *
 * @param filePath - The file path to read
 * @param baseDir - The base directory that the file must be within
 * @returns The file contents
 * @throws Error if path traversal is attempted or file cannot be read
 */
export async function safeReadTextFile(
  filePath: string,
  baseDir: string,
): Promise<string> {
  const validatedPath = validatePath(filePath, baseDir);
  return await Deno.readTextFile(validatedPath);
}

/**
 * Safely reads a file after validating the path
 *
 * @param filePath - The file path to read
 * @param baseDir - The base directory that the file must be within
 * @returns The file contents as Uint8Array
 * @throws Error if path traversal is attempted or file cannot be read
 */
export async function safeReadFile(
  filePath: string,
  baseDir: string,
): Promise<Uint8Array> {
  const validatedPath = validatePath(filePath, baseDir);
  return await Deno.readFile(validatedPath);
}

/**
 * Safely gets file stats after validating the path
 *
 * @param filePath - The file path to stat
 * @param baseDir - The base directory that the file must be within
 * @returns The file stats
 * @throws Error if path traversal is attempted or file cannot be accessed
 */
export async function safeStat(
  filePath: string,
  baseDir: string,
): Promise<Deno.FileInfo> {
  const validatedPath = validatePath(filePath, baseDir);
  return await Deno.stat(validatedPath);
}

/**
 * Safely reads a directory after validating the path
 *
 * @param dirPath - The directory path to read
 * @param baseDir - The base directory that the directory must be within
 * @returns An async iterator of directory entries
 * @throws Error if path traversal is attempted or directory cannot be read
 */
export async function* safeReadDir(
  dirPath: string,
  baseDir: string,
): AsyncIterable<Deno.DirEntry> {
  const validatedPath = validatePath(dirPath, baseDir);
  for await (const entry of Deno.readDir(validatedPath)) {
    yield entry;
  }
}

/**
 * Safely removes a file or directory after validating the path
 *
 * @param targetPath - The path to remove
 * @param baseDir - The base directory that the target must be within
 * @param options - Optional removal options
 * @throws Error if path traversal is attempted or removal fails
 */
export async function safeRemove(
  targetPath: string,
  baseDir: string,
  options?: Deno.RemoveOptions,
): Promise<void> {
  const validatedPath = validatePath(targetPath, baseDir);
  await Deno.remove(validatedPath, options);
}

/**
 * Validates multiple paths to ensure they all stay within their allowed directories
 *
 * @param paths - Array of {path, baseDir} objects to validate
 * @returns Array of validated absolute paths
 * @throws Error if any path attempts traversal
 */
export function validatePaths(
  paths: Array<{ path: string; baseDir: string }>,
): string[] {
  return paths.map(({ path, baseDir }) => validatePath(path, baseDir));
}

/**
 * Checks if a path is safe without throwing an error
 *
 * @param userPath - The user-provided path to check
 * @param baseDir - The base directory that the path must stay within
 * @returns True if path is safe, false if it attempts traversal
 */
export function isPathSafe(userPath: string, baseDir: string): boolean {
  try {
    validatePath(userPath, baseDir);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely reads a text file synchronously after validating the path
 *
 * @param filePath - The file path to read
 * @param baseDir - The base directory that the file must be within
 * @returns The file contents
 * @throws Error if path traversal is attempted or file cannot be read
 */
export function safeReadTextFileSync(
  filePath: string,
  baseDir: string,
): string {
  const validatedPath = validatePath(filePath, baseDir);
  return Deno.readTextFileSync(validatedPath);
}

/**
 * Safely writes text to a file synchronously after validating the path
 *
 * @param filePath - The file path to write to
 * @param data - The text data to write
 * @param baseDir - The base directory that the file must be within
 * @throws Error if path traversal is attempted or file cannot be written
 */
export function safeWriteTextFileSync(
  filePath: string,
  data: string,
  baseDir: string,
): void {
  const validatedPath = validatePath(filePath, baseDir);
  Deno.writeTextFileSync(validatedPath, data);
}

/**
 * Safely gets file stats synchronously after validating the path
 *
 * @param filePath - The file path to stat
 * @param baseDir - The base directory that the file must be within
 * @returns The file stats
 * @throws Error if path traversal is attempted or file cannot be accessed
 */
export function safeStatSync(
  filePath: string,
  baseDir: string,
): Deno.FileInfo {
  const validatedPath = validatePath(filePath, baseDir);
  return Deno.statSync(validatedPath);
}

/**
 * Safely writes text to a file after validating the path
 *
 * @param filePath - The file path to write to
 * @param data - The text data to write
 * @param baseDir - The base directory that the file must be within
 * @param options - Optional write options
 * @throws Error if path traversal is attempted or file cannot be written
 */
export async function safeWriteTextFile(
  filePath: string,
  data: string,
  baseDir: string,
  options?: Deno.WriteFileOptions,
): Promise<void> {
  const validatedPath = validatePath(filePath, baseDir);
  await Deno.writeTextFile(validatedPath, data, options);
}

/**
 * Safely writes data to a file after validating the path
 *
 * @param filePath - The file path to write to
 * @param data - The data to write
 * @param baseDir - The base directory that the file must be within
 * @param options - Optional write options
 * @throws Error if path traversal is attempted or file cannot be written
 */
export async function safeWriteFile(
  filePath: string,
  data: Uint8Array,
  baseDir: string,
  options?: Deno.WriteFileOptions,
): Promise<void> {
  const validatedPath = validatePath(filePath, baseDir);
  await Deno.writeFile(validatedPath, data, options);
}
