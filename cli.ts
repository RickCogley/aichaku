#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

/**
 * aichaku CLI - Install AI-optimized methodologies for Claude Code
 *
 * @module
 *
 * @example
 * ```bash
 * # Install Shape Up methodology globally
 * aichaku install shape-up --global
 *
 * # Install to current project
 * aichaku install shape-up
 *
 * # List available methodologies
 * aichaku list
 * ```
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { install } from "./src/installer.ts";
import { VERSION } from "./mod.ts";

const args = parseArgs(Deno.args, {
  boolean: ["help", "version", "global", "force", "symlink", "silent"],
  string: ["path"],
  alias: {
    h: "help",
    v: "version",
    g: "global",
    f: "force",
    p: "path",
    s: "silent",
  },
});

// Show version
if (args.version) {
  console.log(`aichaku v${VERSION}`);
  Deno.exit(0);
}

// Show help
if (args.help || args._.length === 0) {
  console.log(`
aichaku (愛着) - AI-optimized project methodology installer for Claude Code
Version ${VERSION}

Usage:
  aichaku <methodology> [options]

Available methodologies:
  shape-up    Shape Up methodology optimized for AI execution

Options:
  -g, --global     Install globally to ~/.claude
  -p, --path      Project path for local installation (default: ./.claude)
  -f, --force     Force overwrite existing installation
  --symlink       Create symlinks instead of copying files
  -s, --silent    Silent mode - no console output
  -h, --help      Show this help message
  -v, --version   Show version number

Examples:
  # Install Shape Up globally
  aichaku shape-up --global

  # Install to current project
  aichaku shape-up

  # Install to specific path
  aichaku shape-up --path ./my-project/.claude

  # Force reinstall with symlinks
  aichaku shape-up --force --symlink
`);
  Deno.exit(0);
}

// Install methodology
const methodology = String(args._[0]);
const result = await install(methodology, {
  global: args.global,
  projectPath: args.path,
  force: args.force,
  symlink: args.symlink,
  silent: args.silent,
});

if (!result.success) {
  console.error(`❌ ${result.message}`);
  Deno.exit(1);
}

if (!args.silent) {
  console.log(`
🎉 ${methodology} installed successfully!

Next steps:
${
    result.path.includes(".claude")
      ? "- Start Claude Code in your project directory"
      : "- The methodology is now available globally"
  }
- Use /shape command to shape a new feature
- Check ${result.path} for all methodology files
`);
}
