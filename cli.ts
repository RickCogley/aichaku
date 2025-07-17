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

import { parseArgs } from "@std/cli/parse-args";
import { init } from "./src/commands/init.ts";
import { upgrade } from "./src/commands/upgrade.ts";
import { uninstall } from "./src/commands/uninstall.ts";
import { integrate } from "./src/commands/integrate.ts";
import { help } from "./src/commands/help.ts";
import { learn } from "./src/commands/learn.ts";
import { hooks } from "./src/commands/hooks.ts";
import { standards } from "./src/commands/standards.ts";
import { docsStandard } from "./src/commands/docs-standard.ts";
import { runMCPCommand } from "./src/commands/mcp.ts";
import {
  createMigrateCommand,
  showMigrateHelp,
} from "./src/commands/migrate.ts";
import { runReviewCommand } from "./src/commands/review.ts";
import { runGitHubCommand } from "./src/commands/github.ts";
import { cleanup } from "./src/commands/cleanup.ts";
import { VERSION } from "./mod.ts";
import { displayVersionWarning } from "./src/utils/version-checker.ts";
import { Brand } from "./src/utils/branded-messages.ts";

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
    "stats",
    "validate",
    "categories",
    "select",
    "show",
    "config",
    "status",
    "start",
    "stop",
    "restart",
    "upgrade",
    "start-server",
    "stop-server",
    "server-status",
    "authStatus",
    "authLogin",
    "releaseUpload",
    "releaseView",
    "runList",
    "runView",
    "runWatch",
    "repoView",
    "repoList",
    "draft",
    "prerelease",
    "overwrite",
    "standards",
    "all",
    "security",
    "architecture",
    "development",
    "testing",
    "devops",
    "methodologies",
    "config",
    "status",
    "install-mcp",
    "quiet",
    "fix",
    "backup",
    "no-backup",
    "verbose",
    "yes",
    "no-global",
    "local",
  ],
  string: [
    "path",
    "file",
    "install",
    "add",
    "remove",
    "search",
    "project",
    "create-custom",
    "delete-custom",
    "edit-custom",
    "copy-custom",
    "tag",
    "owner",
    "repository",
    "workflow",
    "title",
    "body",
    "runId",
    "limit",
    "timeout",
    "pollInterval",
  ],
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
    q: "quiet",
    b: "backup",
    y: "yes",
  },
  default: {
    help: false,
    version: false,
    global: false,
    force: false,
    silent: false,
    check: false,
  },
});

// Show version
if (args.version) {
  console.log(`${Brand.PREFIX} v${VERSION}`);
  Deno.exit(0);
}

// Get command
const command = args._[0]?.toString().toLowerCase();

// Check version compatibility (non-blocking)
// Skip for version, help, and certain commands to avoid noise
if (command && !["version", "help", "init"].includes(command)) {
  await displayVersionWarning();
}

// Show help only if no command or general help requested
if (!command || (args.help && !command)) {
  console.log(`
${Brand.PREFIX} (愛着) - Adaptive Methodology Support for Claude Code
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
  help        Show methodology information and guidance (deprecated - use learn)
  learn       Learn about methodologies and standards (dynamically from YAML)
  hooks       Manage Claude Code hooks for automation
  standards   Choose modular guidance standards for your project
  docs-standard Choose documentation writing style guides for your project
  docs:lint   Lint documentation against selected standards
  mcp         Manage MCP (Model Context Protocol) server for code review
  review      Review files using MCP server (seamless hook integration)
  github      GitHub operations via MCP (releases, workflows, repos)
  migrate     Migrate from old ~/.claude/ to new ~/.claude/aichaku/ structure

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
  aichaku learn
  aichaku learn shape-up
  aichaku learn owasp-web
  aichaku learn --methodologies
  aichaku learn --standards
  
  # Install and configure MCP server
  aichaku mcp --install
  aichaku mcp --config
  aichaku help --all

  # Remove Aichaku
  aichaku uninstall

  # Clean up legacy files
  aichaku cleanup

  # Add Aichaku to project's CLAUDE.md
  aichaku integrate

  # Manage Claude Code hooks
  aichaku hooks --list
  aichaku hooks --install basic

  # Choose standards for your project
  aichaku standards --list
  aichaku standards --add owasp-web,15-factor

  # Choose documentation standards
  aichaku docs-standard --list
  aichaku docs-standard --add diataxis-google

  # Lint documentation files
  aichaku docs:lint
  aichaku docs:lint README.md docs/
  aichaku docs:lint --standards diataxis,google-style

  # Review code files with MCP
  aichaku review src/main.ts
  aichaku review --stats

  # GitHub operations
  aichaku github release upload dist/*
  aichaku github run list

  # Migrate to new folder structure
  aichaku migrate
  aichaku migrate --dry-run
  aichaku migrate --project .

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
  help: args.help,
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
   • Create documents in docs/projects/
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
   
   Documents will automatically appear in docs/projects/
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

    case "cleanup": {
      const result = await cleanup(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      if (!args.silent) {
        console.log(`\n✅ ${result.message}`);
        if (result.filesRemoved && result.filesRemoved.length > 0) {
          console.log("\nFiles removed:");
          result.filesRemoved.forEach((file) => console.log(`  - ${file}`));
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
        show: args.show as boolean | undefined,
        global: args.global as boolean | undefined,
        local: args.local as boolean | undefined,
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

    case "learn": {
      // Parse topic from remaining args
      const topic = args._[1]?.toString();

      const learnOptions = {
        topic,
        list: args.list as boolean | undefined,
        all: args.all as boolean | undefined,
        methodologies: args.methodologies as boolean | undefined,
        standards: args.standards as boolean | undefined,
        category: args.category as string | undefined,
        compare: args.compare as boolean | undefined,
        silent: args.silent as boolean | undefined,
      };

      const result = await learn(learnOptions);
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
        createCustom: args["create-custom"] as string | undefined,
        deleteCustom: args["delete-custom"] as string | undefined,
        editCustom: args["edit-custom"] as string | undefined,
        copyCustom: args["copy-custom"] && args._[1]
          ? {
            source: args["copy-custom"] as string,
            target: args._[1] as string,
          }
          : undefined,
      };

      await standards(standardsOptions);
      break;
    }

    case "docs-standard":
    case "doc-standard":
    case "docstandard": {
      const docStandardsOptions = {
        list: args.list as boolean | undefined,
        show: args.show as boolean | undefined,
        add: args.add as string | undefined,
        remove: args.remove as string | undefined,
        search: args.search as string | undefined,
        projectPath: args.path as string | undefined,
        dryRun: args["dry-run"] as boolean | undefined,
      };

      await docsStandard(docStandardsOptions);
      break;
    }

    case "mcp": {
      const mcpOptions = {
        install: args.install as boolean | undefined ||
          (args._[1] === "install"),
        config: args.config as boolean | undefined || (args._[1] === "config"),
        status: args.status as boolean | undefined || (args._[1] === "status"),
        start: args.start as boolean | undefined || (args._[1] === "start"),
        stop: args.stop as boolean | undefined || (args._[1] === "stop"),
        restart: args.restart as boolean | undefined ||
          (args._[1] === "restart"),
        upgrade: args.upgrade as boolean | undefined ||
          (args._[1] === "upgrade"),
        startServer: args["start-server"] as boolean | undefined,
        stopServer: args["stop-server"] as boolean | undefined,
        serverStatus: args["server-status"] as boolean | undefined,
        help: args.help as boolean | undefined,
      };

      await runMCPCommand(mcpOptions);
      break;
    }

    case "docs:lint": {
      // Dynamically import docs-lint command with its permissions
      const { main: docsLint } = await import("./src/commands/docs-lint.ts");

      // Pass args through to the lint command
      const subArgs = parseArgs(args._.slice(1).map(String), {
        boolean: ["help", "quiet", "fix"],
        string: ["standards", "config"],
      });

      const lintArgs = subArgs._.map(String).concat(
        subArgs.standards ? [`--standards=${subArgs.standards}`] : [],
        subArgs.quiet ? ["--quiet"] : [],
        subArgs.fix ? ["--fix"] : [],
        subArgs.help ? ["--help"] : [],
      );

      await docsLint(lintArgs);
      break;
    }

    case "review": {
      const reviewOptions = {
        help: args.help as boolean | undefined,
        file: args.file as string | undefined,
        stats: args.stats as boolean | undefined,
      };

      // Get files from remaining arguments
      const files = args._.slice(1).map(String);

      await runReviewCommand(reviewOptions, files);
      break;
    }

    case "github": {
      const githubOptions = {
        help: args.help as boolean | undefined,
        // Auth
        authStatus: args.authStatus as boolean | undefined,
        authLogin: (typeof args.authLogin === 'string') ? args.authLogin : undefined,
        // Release
        releaseUpload: args.releaseUpload as boolean | undefined,
        releaseView: args.releaseView as boolean | undefined,
        // Workflow
        runList: args.runList as boolean | undefined,
        runView: args.runView as boolean | undefined,
        runWatch: args.runWatch as boolean | undefined,
        // Repository
        repoView: args.repoView as boolean | undefined,
        repoList: args.repoList as boolean | undefined,
        // Common
        tag: args.tag as string | undefined,
        owner: args.owner as string | undefined,
        repository: args.repository as string | undefined,
        runId: args.runId ? Number(args.runId) : undefined,
        workflow: args.workflow as string | undefined,
        status: (typeof args.status === 'string') ? args.status : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
        timeout: args.timeout ? Number(args.timeout) : undefined,
        pollInterval: args.pollInterval ? Number(args.pollInterval) : undefined,
        overwrite: args.overwrite as boolean | undefined,
        draft: args.draft as boolean | undefined,
        prerelease: args.prerelease as boolean | undefined,
      };

      // Get remaining arguments
      const githubArgs = args._.slice(1).map(String);

      await runGitHubCommand(githubOptions, githubArgs);
      break;
    }

    case "migrate": {
      // Use Cliffy command for migration
      const migrateCommand = createMigrateCommand();

      // Check if help is requested at the top level
      if (args.help) {
        showMigrateHelp();
        break;
      }

      // Parse subargs first
      const subArgs = parseArgs(args._.slice(1).map(String), {
        boolean: [
          "dry-run",
          "force",
          "global",
          "no-global",
          "backup",
          "no-backup",
          "verbose",
          "yes",
        ],
        string: ["path", "project"],
      });

      // Build args for Cliffy
      const migrateArgs: string[] = [];
      if (subArgs["dry-run"]) migrateArgs.push("--dry-run");
      if (subArgs.force) migrateArgs.push("--force");
      if (subArgs.global) migrateArgs.push("--global");
      if (subArgs["no-global"]) migrateArgs.push("--no-global");
      if (subArgs.path) migrateArgs.push("--project", subArgs.path);
      if (subArgs.project) migrateArgs.push("--project", subArgs.project);
      if (subArgs.backup) migrateArgs.push("--backup");
      if (subArgs["no-backup"]) migrateArgs.push("--no-backup");
      if (subArgs.verbose) migrateArgs.push("--verbose");
      if (subArgs.yes) migrateArgs.push("--yes");
      if (subArgs.help) migrateArgs.push("--help");

      // Parse and execute
      await migrateCommand.parse(migrateArgs);
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
