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
import { hooks } from "./src/commands/hooks.ts";
import { standards } from "./src/commands/standards.ts";
import { runMCPCommand } from "./src/commands/mcp.ts";
import { VERSION } from "./mod.ts";

const args = parseArgs(Deno.args, {
  boolean: [
    "help",
    "version",
    "global",
    "force",
    "silent",
    "dry-run",
    "check",
    "list",
    "compare",
    "validate",
    "categories",
    "select",
    "show",
    "standards",
    "all",
    "security",
    "architecture",
    "development",
    "testing",
    "devops",
    "config",
    "status",
    "install-mcp",
  ],
  string: ["path", "install", "add", "remove", "search"],
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
    i: "install",
  },
});

// Show version
if (args.version) {
  console.log(`aichaku v${VERSION}`);
  Deno.exit(0);
}

// Get command
const command = args._[0]?.toString().toLowerCase();

// Show help only if no command or general help requested
if (!command || (args.help && !command)) {
  console.log(`
🪴 aichaku (愛着) - Adaptive Methodology Support for Claude Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version ${VERSION} | MIT License | github.com/RickCogley/aichaku

Bringing affection (愛着) to your development workflow by adapting
methodologies to how YOU naturally work. Say "sprint" → get Scrum.
Say "shape" → get Shape Up. It's that simple!

Usage:
  aichaku <command> [options]

Commands:
  init        Initialize Aichaku (global: install, project: setup)
  upgrade     Upgrade methodologies to latest version
  uninstall   Remove Aichaku from your system
  integrate   Add Aichaku reference to project's CLAUDE.md
  help        Show methodology information and guidance
  hooks       Manage Claude Code hooks for automation
  standards   Choose modular guidance standards for your project
  mcp         Manage MCP (Model Context Protocol) server for code review

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

  # Learn about methodologies & standards
  aichaku help
  aichaku help shape-up
  aichaku help owasp-web
  aichaku help --list
  aichaku help --standards
  
  # Install and configure MCP server
  aichaku mcp --install
  aichaku mcp --config
  aichaku help --all

  # Remove Aichaku
  aichaku uninstall

  # Add Aichaku to project's CLAUDE.md
  aichaku integrate

  # Manage Claude Code hooks
  aichaku hooks --list
  aichaku hooks --install basic

  # Choose standards for your project
  aichaku standards --list
  aichaku standards --add owasp-web,15-factor

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

    case "hooks": {
      const hooksOptions = {
        list: args.list as boolean | undefined,
        install: args.install as string | undefined,
        validate: args.validate as boolean | undefined,
        remove: args.remove as boolean | undefined,
        dryRun: args["dry-run"] as boolean | undefined,
      };

      await hooks(hooksOptions);
      break;
    }

    case "help": {
      // Parse topic from remaining args
      const topic = args._[1]?.toString();

      // Check if it's a standard or methodology
      const isStandard = topic &&
        (topic.includes("owasp") || topic.includes("factor") ||
          topic === "tdd" || topic === "nist" || topic === "ddd" ||
          topic === "solid");

      const helpOptions = {
        methodology: !isStandard ? topic : undefined,
        standard: isStandard ? topic : undefined,
        list: args.list as boolean | undefined,
        standards: args.standards as boolean | undefined,
        compare: args.compare as boolean | undefined,
        all: args.all as boolean | undefined,
        security: args.security as boolean | undefined,
        architecture: args.architecture as boolean | undefined,
        development: args.development as boolean | undefined,
        testing: args.testing as boolean | undefined,
        devops: args.devops as boolean | undefined,
        silent: args.silent as boolean | undefined,
      };

      const result = help(helpOptions);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }

      if (result.content && !args.silent) {
        console.log(result.content);
      }
      break;
    }

    case "standards": {
      const standardsOptions = {
        list: args.list as boolean | undefined,
        categories: args.categories as boolean | undefined,
        select: args.select as boolean | undefined,
        show: args.show as boolean | undefined,
        add: args.add as string | undefined,
        remove: args.remove as string | undefined,
        search: args.search as string | undefined,
        projectPath: args.path as string | undefined,
        dryRun: args["dry-run"] as boolean | undefined,
      };

      await standards(standardsOptions);
      break;
    }

    case "mcp": {
      const mcpOptions = {
        install: args["install-mcp"] as boolean | undefined ||
          (args._[1] === "install"),
        config: args.config as boolean | undefined || (args._[1] === "config"),
        status: args.status as boolean | undefined || (args._[1] === "status"),
        help: args.help as boolean | undefined,
      };

      await runMCPCommand(mcpOptions);
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
