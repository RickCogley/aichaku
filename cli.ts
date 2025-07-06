#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

/**
 * aichaku CLI - Adaptive methodology support for Claude Code
 *
 * @module
 *
 * @example
 * ```bash
 * # Initialize Aichaku in current project
 * aichaku init
 *
 * # Initialize globally
 * aichaku init --global
 *
 * # Upgrade to latest version
 * aichaku upgrade
 *
 * # Uninstall
 * aichaku uninstall
 * ```
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { init } from "./src/commands/init.ts";
import { upgrade } from "./src/commands/upgrade.ts";
import { uninstall } from "./src/commands/uninstall.ts";
import { VERSION } from "./mod.ts";

const args = parseArgs(Deno.args, {
  boolean: ["help", "version", "global", "force", "silent", "dry-run", "check"],
  string: ["path"],
  alias: {
    h: "help",
    v: "version",
    g: "global",
    f: "force",
    s: "silent",
    p: "path",
    d: "dry-run",
    c: "check",
  },
});

// Show version
if (args.version) {
  console.log(`aichaku v${VERSION}`);
  Deno.exit(0);
}

// Get command
const command = args._[0]?.toString().toLowerCase();

// Show help
if (args.help || !command) {
  console.log(`
aichaku (愛着) - Adaptive methodology support for Claude Code
Version ${VERSION}

Aichaku provides context-aware methodology guidance that adapts to your needs.
It doesn't force you to choose - it blends methodologies based on your language.

Usage:
  aichaku <command> [options]

Commands:
  init        Initialize Aichaku with all methodologies
  upgrade     Upgrade to latest version (preserves customizations)
  uninstall   Remove Aichaku from your system

Options:
  -g, --global     Apply to global installation (~/.claude)
  -p, --path       Project path (default: ./.claude)
  -f, --force      Force overwrite existing files
  -s, --silent     Silent mode - minimal output
  -d, --dry-run    Preview changes without applying them
  -c, --check      Check for updates without installing
  -h, --help       Show this help message
  -v, --version    Show version number

Examples:
  # Initialize in current project
  aichaku init

  # Initialize globally for all projects
  aichaku init --global

  # Check for updates
  aichaku upgrade --check

  # Upgrade to latest version
  aichaku upgrade

  # Remove Aichaku
  aichaku uninstall

Learn more: https://github.com/RickCogley/aichaku
`);
  Deno.exit(0);
}

// Common options for all commands
const options = {
  global: args.global,
  projectPath: args.path,
  force: args.force,
  silent: args.silent,
  dryRun: args["dry-run"],
  check: args.check,
};

// Execute command
try {
  switch (command) {
    case "init":
    case "initialize": {
      const result = await init(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      if (!args.silent) {
        console.log(`
✅ Aichaku initialized successfully!

${result.message}

Next steps:
- Start Claude Code in your project
- The AI now has adaptive methodology support
- Customize in ${result.path}/user/ (optional)

Aichaku adapts to your language - just start working naturally!
`);
      }
      break;
    }

    case "upgrade":
    case "update": {
      const result = await upgrade(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      if (!args.silent) {
        console.log(`
✅ Aichaku upgraded successfully!

${result.message}
`);
      }
      break;
    }

    case "uninstall":
    case "remove": {
      const result = await uninstall(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      if (!args.silent) {
        console.log(`
✅ Aichaku uninstalled successfully!

${result.message}
`);
      }
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log(`Run 'aichaku --help' for usage information.`);
      Deno.exit(1);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  Deno.exit(1);
}
