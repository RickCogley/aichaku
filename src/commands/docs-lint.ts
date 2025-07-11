#!/usr/bin/env -S deno run --allow-read --allow-env

/**
 * Documentation linting command for Aichaku
 * Lints documentation against selected standards (Diátaxis, Google Style, Microsoft Style)
 *
 * @module
 */

import { parseArgs } from "@std/cli/parse-args";
import { walk } from "@std/fs/walk";
import { join, relative } from "@std/path";
import { exists } from "@std/fs/exists";
import type { DocumentationStandardConfig } from "../types.ts";
import type { LintIssue, LintResult } from "../linters/base-linter.ts";
import { DiátaxisLinter } from "../linters/diataxis-linter.ts";
import { GoogleStyleLinter } from "../linters/google-style-linter.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { safeReadTextFile } from "../utils/path-security.ts";

/**
 * Colors for terminal output
 */
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

/**
 * Icons for different severity levels
 */
const icons = {
  error: "❌",
  warning: "⚠️ ",
  info: "💡",
  success: "✅",
};

/**
 * Load documentation standards configuration
 */
async function loadDocumentationConfig(
  projectPath: string,
): Promise<DocumentationStandardConfig | null> {
  // Check new path first, then legacy path
  const newConfigPath = join(
    projectPath,
    ".claude",
    "aichaku",
    "docs-standards.json",
  );
  const legacyConfigPath = join(projectPath, ".claude", "docs-standards.json");

  const configPath = (await exists(newConfigPath))
    ? newConfigPath
    : legacyConfigPath;

  if (!await exists(configPath)) {
    return null;
  }

  try {
    // Security: Use safe file reading
    const content = await safeReadTextFile(configPath, projectPath);
    return JSON.parse(content) as DocumentationStandardConfig;
  } catch (error) {
    console.error(colors.red(`Error loading documentation config: ${error}`));
    return null;
  }
}

/**
 * Get linters based on selected standards
 */
function getLinters(
  selectedStandards: string[],
): Array<DiátaxisLinter | GoogleStyleLinter> {
  const linters: Array<DiátaxisLinter | GoogleStyleLinter> = [];

  selectedStandards.forEach((standard) => {
    switch (standard) {
      case "diataxis":
        linters.push(new DiátaxisLinter());
        break;
      case "google-style":
        linters.push(new GoogleStyleLinter());
        break;
        // Microsoft style linter can be added later
        // case "microsoft-style":
        //   linters.push(new MicrosoftStyleLinter());
        //   break;
    }
  });

  return linters;
}

/**
 * Format lint issue for display
 */
function formatIssue(issue: LintIssue, filePath: string): string {
  const icon = icons[issue.severity];
  const color = issue.severity === "error"
    ? colors.red
    : issue.severity === "warning"
    ? colors.yellow
    : colors.blue;

  let location = `${filePath}:${issue.line}`;
  if (issue.column) {
    location += `:${issue.column}`;
  }

  let output = `  ${icon} ${color(location)} ${colors.bold(issue.rule)}\n`;
  output += `     ${issue.message}\n`;

  if (issue.suggestion) {
    output += `     ${colors.gray("→")} ${colors.gray(issue.suggestion)}\n`;
  }

  return output;
}

/**
 * Lint a single file
 */
async function lintFile(
  filePath: string,
  linters: Array<DiátaxisLinter | GoogleStyleLinter>,
): Promise<LintResult[]> {
  // Security: Use safe file reading - file should be within cwd
  const content = await safeReadTextFile(filePath, Deno.cwd());
  const results: LintResult[] = [];

  for (const linter of linters) {
    const result = await linter.lint(filePath, content);
    results.push(result);
  }

  return results;
}

/**
 * Find markdown files to lint
 */
async function findMarkdownFiles(paths: string[]): Promise<string[]> {
  const files: string[] = [];

  for (const path of paths) {
    // Security: Validate path to prevent traversal
    const absPath = resolveProjectPath(path);
    const stat = await Deno.stat(absPath);

    if (stat.isFile && (path.endsWith(".md") || path.endsWith(".markdown"))) {
      files.push(absPath);
    } else if (stat.isDirectory) {
      for await (
        const entry of walk(absPath, {
          exts: ["md", "markdown"],
          skip: [/node_modules/, /\.git/, /\.claude\/output/],
        })
      ) {
        files.push(entry.path);
      }
    }
  }

  return files;
}

/**
 * Main command function
 */
export async function main(cliArgs?: string[]) {
  const args = parseArgs(cliArgs || Deno.args, {
    boolean: ["help", "quiet", "fix"],
    string: ["standards", "config"],
    default: {
      quiet: false,
      fix: false,
    },
  });

  if (args.help) {
    console.log(`
🪴 Aichaku Documentation Linter

Usage: aichaku docs:lint [options] [paths...]

Lint documentation files against selected standards.

Options:
  --help              Show this help message
  --standards <list>  Comma-separated list of standards to use
                      (overrides project configuration)
  --config <path>     Path to configuration file
  --quiet             Only show errors
  --fix               Automatically fix issues (not yet implemented)

Examples:
  # Lint all markdown files in current directory
  aichaku docs:lint

  # Lint specific files
  aichaku docs:lint README.md docs/guide.md

  # Use specific standards
  aichaku docs:lint --standards diataxis,google-style

  # Lint a specific directory
  aichaku docs:lint docs/
`);
    Deno.exit(0);
  }

  const projectPath = Deno.cwd();

  // Load configuration
  const config = await loadDocumentationConfig(projectPath);

  // Determine which standards to use
  let selectedStandards: string[] = [];

  if (args.standards) {
    selectedStandards = args.standards.split(",").map((s: string) => s.trim());
  } else if (config?.selected) {
    selectedStandards = config.selected;
  } else {
    console.log(colors.yellow("No documentation standards configured."));
    console.log("Run 'aichaku docs:standard' to select standards.\n");
    console.log("Using default standards: diataxis, google-style");
    selectedStandards = ["diataxis", "google-style"];
  }

  // Get linters
  const linters = getLinters(selectedStandards);

  if (linters.length === 0) {
    console.error(colors.red("No valid linters found for selected standards."));
    Deno.exit(1);
  }

  console.log(colors.bold("🪴 Aichaku Documentation Linter"));
  console.log(colors.gray(`Standards: ${selectedStandards.join(", ")}\n`));

  // Determine files to lint
  const paths = args._.length > 0 ? args._.map(String) : ["."];
  const files = await findMarkdownFiles(paths);

  if (files.length === 0) {
    console.log(colors.yellow("No markdown files found to lint."));
    Deno.exit(0);
  }

  // Lint files
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;
  let filesWithIssues = 0;

  for (const file of files) {
    const relativePath = relative(projectPath, file);
    const results = await lintFile(file, linters);

    let fileHasIssues = false;
    const fileIssues: Array<{ linter: string; issue: LintIssue }> = [];

    // Collect all issues from all linters
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const linterName = linters[i].name;

      for (const issue of result.issues) {
        if (!args.quiet || issue.severity === "error") {
          fileIssues.push({ linter: linterName, issue });
          fileHasIssues = true;
        }

        switch (issue.severity) {
          case "error":
            totalErrors++;
            break;
          case "warning":
            totalWarnings++;
            break;
          case "info":
            totalInfos++;
            break;
        }
      }
    }

    if (fileHasIssues) {
      filesWithIssues++;
      console.log(colors.bold(`\n${relativePath}`));

      // Group issues by linter
      const issuesByLinter = new Map<string, LintIssue[]>();
      for (const { linter, issue } of fileIssues) {
        if (!issuesByLinter.has(linter)) {
          issuesByLinter.set(linter, []);
        }
        issuesByLinter.get(linter)!.push(issue);
      }

      // Display issues grouped by linter
      for (const [linterName, issues] of issuesByLinter) {
        if (issuesByLinter.size > 1) {
          console.log(colors.gray(`  [${linterName}]`));
        }

        // Sort issues by line number
        issues.sort((a, b) => a.line - b.line);

        for (const issue of issues) {
          console.log(formatIssue(issue, relativePath));
        }
      }
    }
  }

  // Summary
  console.log("\n" + colors.bold("Summary:"));
  console.log(`  Files checked: ${files.length}`);
  console.log(`  Files with issues: ${filesWithIssues}`);

  if (totalErrors > 0) {
    console.log(
      `  ${icons.error} Errors: ${colors.red(totalErrors.toString())}`,
    );
  }
  if (totalWarnings > 0) {
    console.log(
      `  ${icons.warning} Warnings: ${colors.yellow(totalWarnings.toString())}`,
    );
  }
  if (totalInfos > 0 && !args.quiet) {
    console.log(
      `  ${icons.info} Suggestions: ${colors.blue(totalInfos.toString())}`,
    );
  }

  if (filesWithIssues === 0) {
    console.log(
      `\n${icons.success} ${colors.green("All files passed linting!")}`,
    );
    Deno.exit(0);
  } else {
    console.log(
      `\n${
        colors.gray(
          "Run with --fix to automatically fix some issues (coming soon).",
        )
      }`,
    );
    Deno.exit(totalErrors > 0 ? 1 : 0);
  }
}

// Run the command
if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(
      colors.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
    Deno.exit(1);
  }
}
