#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net

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
 *
 * # Add Aichaku to project's CLAUDE.md
 * aichaku integrate
 * ```
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { init } from "./src/commands/init.ts";
import { upgrade } from "./src/commands/upgrade.ts";
import { uninstall } from "./src/commands/uninstall.ts";
import { integrate } from "./src/commands/integrate.ts";
import { help } from "./src/commands/help.ts";
import { VERSION } from "./mod.ts";

const args = parseArgs(Deno.args, {
  boolean: ["help", "version", "global", "force", "silent", "dry-run", "check", "list", "compare"],
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
    l: "list",
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
  init        Initialize Aichaku (global: install, project: setup)
  upgrade     Upgrade methodologies to latest version
  uninstall   Remove Aichaku from your system
  integrate   Add Aichaku reference to project's CLAUDE.md
  help        Show methodology information and guidance

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

  # Add Aichaku to project's CLAUDE.md
  aichaku integrate

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
        if (result.action === "exists") {
          console.log(`\nℹ️  ${result.message}`);
        } else if (options.global) {
          // Global installation success
          console.log(`
✅ Global installation complete!

📁 Installed to: ${result.path}
📚 Methodologies: Shape Up, Scrum, Kanban, Lean, XP, Scrumban
🎯 Next: Run 'aichaku init' (new) or 'aichaku upgrade' (existing) in your Claude Code projects

💡 Claude Code will now automatically:
   • Create documents in .claude/output/
   • Follow methodology patterns
   • Respond to "shape", "sprint", "kanban", etc.
   
   Just start talking naturally!
`);
        } else {
          // Project initialization success
          console.log(`
✅ Project initialized with Aichaku!

Your project now has:
  • Access to all global methodologies
  • Pre-created output directory for documents
  • Behavioral guidelines for Claude Code
  ${
            result.message?.includes("CLAUDE.md")
              ? "• CLAUDE.md integration with clear directives"
              : ""
          }

💡 Just start talking! Say things like:
   • "Let's shape a new feature"
   • "Plan our next sprint"
   • "Show me our kanban board"
   
   Documents will automatically appear in .claude/output/
`);
        }
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
        if (result.action === "check") {
          // Just checking, no action taken
          console.log(`\n🔍 Checking for updates...\n\n${result.message}`);
        } else if (result.action === "upgraded") {
          // Actually upgraded
          console.log(`\n✅ ${result.message}`);

          // Show next steps for project upgrades
          if (options.global) {
            console.log(`
📚 Next steps for your projects:
   • Run 'aichaku upgrade' in each project to update everything
            `);
          }
        } else {
          // Already up to date
          console.log(`\nℹ️  ${result.message}`);
        }
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
        console.log(`\n✅ ${result.message}`);

        if (result.claudeMdReferences && result.claudeMdReferences.length > 0) {
          console.log(`
ℹ️  CLAUDE.md still contains Aichaku references:
${
            result.claudeMdReferences.map((ref) =>
              `    Line ${ref.line}: "${ref.text}"`
            ).join("\n")
          }
    
    Remove these manually if no longer needed.`);
        }
      }
      break;
    }

    case "integrate": {
      const result = await integrate(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      if (!args.silent) {
        if (result.action === "skipped") {
          console.log(`\nℹ️  Aichaku reference already exists in CLAUDE.md`);
        } else {
          console.log(`
📄 Analyzing CLAUDE.md...
✏️  Adding Aichaku methodology section...

✅ Integration complete!

📍 ${result.action === "created" ? "Created" : "Added"} at line ${
            result.lineNumber || "N/A"
          }
📚 Methodologies available: 6
🔗 Using global: ~/.claude/

✨ Claude Code now understands your methodology preferences!
`);
        }
      }
      break;
    }

    case "help": {
      // Parse methodology from remaining args
      const methodology = args._[1]?.toString();
      
      const helpOptions = {
        methodology,
        list: args.list,
        compare: args.compare,
        silent: args.silent,
      };
      
      const result = await help(helpOptions);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      
      if (result.content && !args.silent) {
        console.log(result.content);
      }
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log(`Run 'aichaku --help' for usage information.`);
      Deno.exit(1);
  }
} catch (error) {
  console.error(
    `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
  );
  Deno.exit(1);
}
