/**
 * Centralized argument parser for Aichaku CLI commands
 * Handles parseArgs quirks and provides consistent argument handling
 *
 * InfoSec: Input validation for all command arguments
 *
 * @module
 */

import { parseArgs } from "@std/cli/parse-args";

/**
 * Standard parsed arguments structure for all commands
 */
export interface ParsedArgs {
  // Core operations
  list?: boolean;
  show?: boolean | string;
  add?: string;
  remove?: string;
  search?: string;
  current?: boolean;

  // Configuration options
  projectPath?: string;
  dryRun?: boolean;
  verbose?: boolean;
  categories?: boolean;
  help?: boolean;

  // Special operations
  createCustom?: string;
  deleteCustom?: string;
  editCustom?: string;
  copyCustom?: { source: string; target: string };

  // Command-specific
  set?: string;
  reset?: boolean;
  clear?: boolean;
  compatibility?: string;
  category?: string;
  addInteractive?: boolean;

  // Remaining arguments
  remaining: string[];
}

/**
 * Parse command arguments with consistent handling of parseArgs quirks
 *
 * @param rawArgs - Raw command line arguments
 * @param commandName - Name of the command for context
 * @returns Parsed arguments with consistent structure
 */
export function parseCommandArgs(rawArgs: string[], commandName: string): ParsedArgs {
  // InfoSec: Validate input arguments
  if (!Array.isArray(rawArgs)) {
    throw new Error("Invalid arguments: expected array");
  }

  if (typeof commandName !== "string" || !commandName.trim()) {
    throw new Error("Invalid command name");
  }

  const args = parseArgs(rawArgs, {
    boolean: [
      "help",
      "list",
      "show",
      "current",
      "categories",
      "verbose",
      "dry-run",
      "reset",
      "clear",
      "add-interactive",
    ],
    string: [
      "add",
      "remove",
      "search",
      "set",
      "show", // Also in boolean - supports both --show and --show <value>
      "path",
      "create-custom",
      "delete-custom",
      "edit-custom",
      "copy-custom",
      "compatibility",
      "category",
    ],
    alias: {
      h: "help",
      l: "list",
      s: "show",
      a: "add",
      r: "remove",
      p: "path",
      d: "dry-run",
      v: "verbose",
      c: "categories",
    },
    default: {
      help: false,
      list: false,
      show: false,
      current: false,
      categories: false,
      verbose: false,
      "dry-run": false,
    },
  });

  // Handle the parseArgs --show quirk
  let showValue: boolean | string | undefined = args.show as boolean | string | undefined;

  // Special handling for --show with values
  // parseArgs sets show="" when --show is followed by a value, value goes to args._
  if (typeof showValue === "string" && showValue === "" && args._.length > 0) {
    // Check if the first remaining arg looks like a flag or actual value
    const nextArg = args._[0]?.toString();
    if (nextArg && !nextArg.startsWith("-")) {
      showValue = nextArg;
      args._ = args._.slice(1); // Remove the consumed argument
    } else {
      // Just --show with no value, treat as boolean true
      showValue = true;
    }
  }

  // Handle copy-custom special case (takes two arguments)
  let copyCustom: { source: string; target: string } | undefined;
  if (args["copy-custom"] && args._.length > 0) {
    copyCustom = {
      source: args["copy-custom"] as string,
      target: args._[0] as string,
    };
    args._ = args._.slice(1); // Remove consumed argument
  }

  return {
    // Core operations
    list: args.list as boolean,
    show: showValue,
    add: args.add as string | undefined,
    remove: args.remove as string | undefined,
    search: args.search as string | undefined,
    current: args.current as boolean,

    // Configuration options
    projectPath: args.path as string | undefined,
    dryRun: args["dry-run"] as boolean,
    verbose: args.verbose as boolean,
    categories: args.categories as boolean,
    help: args.help as boolean,

    // Special operations
    createCustom: args["create-custom"] as string | undefined,
    deleteCustom: args["delete-custom"] as string | undefined,
    editCustom: args["edit-custom"] as string | undefined,
    copyCustom,

    // Command-specific
    set: args.set as string | undefined,
    reset: args.reset as boolean,
    clear: args.clear as boolean,
    compatibility: args.compatibility as string | undefined,
    category: args.category as string | undefined,
    addInteractive: args["add-interactive"] as boolean,

    // Remaining arguments (after processing special cases)
    remaining: args._.map((arg) => arg.toString()),
  };
}

/**
 * Validate common argument combinations
 *
 * @param args - Parsed arguments
 * @returns Validation result with any errors
 */
export function validateArguments(args: ParsedArgs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // InfoSec: Validate path arguments to prevent directory traversal
  if (args.projectPath) {
    if (args.projectPath.includes("..") || args.projectPath.includes("~")) {
      errors.push("Invalid project path: relative paths not allowed");
    }
  }

  // Validate mutually exclusive operations
  const operations = [
    args.list,
    args.show !== false && args.show !== undefined,
    !!args.add,
    !!args.remove,
    !!args.search,
    args.current,
    !!args.createCustom,
    !!args.deleteCustom,
    !!args.editCustom,
    !!args.copyCustom,
  ].filter(Boolean);

  if (operations.length > 1) {
    errors.push("Multiple operations specified - please use only one at a time");
  }

  // Validate required arguments for copy-custom
  if (args.copyCustom && (!args.copyCustom.source || !args.copyCustom.target)) {
    errors.push("copy-custom requires both source and target arguments");
  }

  // Validate string arguments are not empty
  const stringArgs = {
    add: args.add,
    remove: args.remove,
    search: args.search,
    set: args.set,
    createCustom: args.createCustom,
    deleteCustom: args.deleteCustom,
    editCustom: args.editCustom,
    compatibility: args.compatibility,
    category: args.category,
  };

  for (const [key, value] of Object.entries(stringArgs)) {
    if (value !== undefined && typeof value === "string" && value.trim() === "") {
      errors.push(`${key} cannot be empty`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse comma-separated list arguments safely
 *
 * @param value - String value that may contain comma-separated items
 * @returns Array of trimmed, non-empty strings
 */
export function parseListArgument(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Sanitize user input to prevent injection attacks
 * InfoSec: Input sanitization for command arguments
 *
 * @param input - User input string
 * @returns Sanitized string safe for use in commands
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[;&|`$(){}[\]\\]/g, "") // Remove shell special characters
    .replace(/\.\./g, "") // Remove directory traversal
    .trim();
}
