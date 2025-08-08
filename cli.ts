#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net

/**
 * aichaku CLI - Adaptive methodology support for Claude Code
 */

import { parseArgs } from "@std/cli/parse-args";
import { CommandExecutor } from "./src/utils/command-executor.ts";
import { parseCommonArgs } from "./src/utils/parseCommonArgs.ts";
import { init } from "./src/commands/init.ts";
import { upgrade } from "./src/commands/upgrade.ts";
import { uninstall } from "./src/commands/uninstall.ts";
import { integrate } from "./src/commands/integrate.ts";
import { help as _help } from "./src/commands/help.ts";
import { learn } from "./src/commands/learn.ts";
import { hooks } from "./src/commands/hooks.ts";
import { testPrinciples } from "./src/commands/test-principles.ts";
import { mergeDocs } from "./src/commands/merge-docs.ts";
import { runMCPCommand } from "./src/commands/mcp.ts";
import { createMigrateCommand, showMigrateHelp } from "./src/commands/migrate.ts";
import { runReviewCommand } from "./src/commands/review.ts";
import { runGitHubCommand } from "./src/commands/github.ts";
import { cleanup } from "./src/commands/cleanup.ts";
import { appDescription } from "./src/commands/app-description.ts";
import { runGitHooksCommand } from "./src/commands/githooks-command.ts";
import { VERSION } from "./mod.ts";
import { displayVersionWarning } from "./src/utils/version-checker.ts";
import { Brand } from "./src/utils/branded-messages.ts";
import { printFormatted } from "./src/utils/terminal-formatter.ts";

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
    "show",
    "compare",
    "stats",
    "validate",
    "init",
    "categories",
    "config",
    "status",
    "start",
    "stop",
    "restart",
    "upgrade",
    "server-start",
    "server-stop",
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
    "reset",
    "install",
    "install-aichaku-reviewer",
    "install-github-operations",
    "enable-all",
    "disable-all",
    "start-all",
    "stop-all",
    "restart-all",
    "tools",
    "quiet",
    "fix",
    "backup",
    "simulate",
    "delete-custom",
    "add-interactive",
    "current",
    "verbose",
  ],
  string: [
    "path",
    "type",
    "description",
    "set",
    "add",
    "remove",
    "search",
    "hook",
    "disable",
    "enable",
    "run",
    "edit",
    "template",
    "rename",
    "create-custom",
    "edit-custom",
    "copy-custom",
    "source",
    "destination",
    "project",
    "standard",
    "format",
    "body",
    "title",
    "generateNotes",
    "owner",
    "repo",
    "tag",
    "workflow",
    "runId",
    "artifact",
    "branch",
    "pattern",
    "latest",
    "upload",
    "download",
    "files",
    "author",
    "token",
    "state",
    "labels",
    "assignee",
    "milestone",
    "limit",
    "direction",
    "sort",
    "visibility",
    "affiliation",
    "since",
    "file",
    "methodology",
    "includeExternal",
    "projectPath",
    "question",
    "detailed",
    "outputPath",
    "includeDiagrams",
    "includeExamples",
    "overwrite",
    "customFields",
    "templateType",
    "projectName",
    "pollInterval",
    "timeout",
    "ghVersion",
    "test",
  ],
  alias: {
    h: "help",
    v: "version",
    g: "global",
    p: "path",
    f: "force",
    s: "silent",
    d: "dry-run",
    c: "check",
  },
  collect: ["add", "remove", "search", "assets"],
  default: {
    path: Deno.cwd(),
  },
});

const command = args._[0] as string | undefined;

// Handle version flag
if (args.version) {
  console.log(`${Brand.shortName} v${VERSION}`);
  Deno.exit(0);
}

// Commands that handle their own help
const commandsWithOwnHelp = ["mcp", "hooks", "review", "github", "migrate", "githooks"];

// Handle help flag or no command (but not for commands that handle their own help)
if ((args.help && !commandsWithOwnHelp.includes(command || "")) || !command) {
  const helpContent = `
${Brand.tagline}

## Commands

### Setup & Maintenance
- **init** - Initialize ${Brand.shortName} configuration
- **integrate** - Add ${Brand.shortName} to project's CLAUDE.md
- **upgrade** - Upgrade to latest version
- **uninstall** - Remove ${Brand.shortName}
- **version** - Show version number
- **help** - Show this help message

### Learning & Configuration
- **learn** - Learn about methodologies and standards (dynamically from YAML)
- **methodologies** - Choose development methodologies for focused context
- **standards** - Choose modular guidance standards for your project
- **principles** - Select guiding philosophies (Unix, DRY, YAGNI, etc.)
- **hooks** - Manage Claude Code hooks for automation

### Development Tools
- **mcp** - Manage MCP (Model Context Protocol) server for code review
- **review** - Review files using MCP server (seamless hook integration)
- **github** - GitHub operations via MCP (releases, workflows, repos)
- **githooks** - Install and manage git hooks for code quality
- **docs:lint** - Lint documentation against selected standards

### Maintenance
- **migrate** - Migrate from old ~/.claude/ to new ~/.claude/aichaku/ structure
- **merge-docs** - Merge completed project documentation back to central docs
- **cleanup** - Clean up legacy files
- **app-description** - Manage application description for Claude Code context

## Options
- **-g, --global** - Apply to global installation (~/.claude)
- **-p, --path** - Project path (default: ./.claude)
- **-f, --force** - Force overwrite existing files
- **-s, --silent** - Silent mode - minimal output
- **-d, --dry-run** - Preview changes without applying them
- **-c, --check** - Check for updates without installing
- **-h, --help** - Show this help message
- **-v, --version** - Show version number

## Examples

### Getting Started
\`\`\`bash
# Initialize in current project
aichaku init

# Initialize globally for all projects
aichaku init --global

# Add Aichaku to project's CLAUDE.md
aichaku integrate
\`\`\`

### Learning & Configuration
\`\`\`bash
# Learn about methodologies & standards
aichaku learn
aichaku learn shape-up
aichaku learn owasp-web
aichaku learn --methodologies
aichaku learn --standards

# Choose methodologies for focused context
aichaku methodologies --list
aichaku methodologies --set shape-up

# Choose standards for your project
aichaku standards --list
aichaku standards --add owasp-web,15-factor

# Select guiding principles
aichaku principles --list
aichaku principles --add unix-philosophy,dry,yagni
aichaku principles --show unix-philosophy --verbose

# Manage specialized agents
aichaku agents --list
aichaku agents --add typescript-expert,react-expert
aichaku agents --show test-expert
\`\`\`

### Development Tools
\`\`\`bash
# Install and configure MCP server
aichaku mcp --install
aichaku mcp --config

# Review code files with MCP
aichaku review src/main.ts
aichaku review --stats

# GitHub operations
aichaku github release upload dist/*
aichaku github run list

# Install git hooks for code quality
aichaku githooks --install
aichaku githooks --list
aichaku githooks --enable-all
\`\`\`

### Maintenance
\`\`\`bash
# Check for updates
aichaku upgrade --check

# Upgrade to latest version
aichaku upgrade

# Clean up legacy files
aichaku cleanup

# Remove Aichaku
aichaku uninstall

# Migrate to new folder structure
aichaku migrate --dry-run
\`\`\`

Learn more: [github.com/RickCogley/aichaku](https://github.com/RickCogley/aichaku)
`;

  printFormatted(helpContent);
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

// Create command executor for shared commands
const commandExecutor = new CommandExecutor();

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

🔧 Configuration: ${result.path}
📚 Your selections will be loaded from global installation

🎯 Next steps:
   1. Choose methodologies: aichaku methodologies --list
   2. Select standards: aichaku standards --list  
   3. Run: aichaku integrate (adds to CLAUDE.md)

💡 Pro tip: Claude Code will create docs/projects/ automatically
`);
        }
      }
      break;
    }
    case "upgrade": {
      await displayVersionWarning("upgrade");
      const result = await upgrade(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      if (!args.silent) {
        console.log(`✅ ${result.message}`);
        if (result.version && result.latestVersion) {
          console.log(`📦 Upgraded from v${result.version} to v${result.latestVersion}`);
        }
        // Details not available in current UpgradeResult interface
      }
      break;
    }
    case "uninstall": {
      const result = await uninstall(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      console.log(`✅ ${result.message}`);
      break;
    }
    case "integrate": {
      const result = await integrate(options);
      if (!result.success) {
        console.error(`❌ ${result.message}`);
        Deno.exit(1);
      }
      console.log(`✅ ${result.message}`);
      break;
    }
    case "help": {
      await _help();
      break;
    }
    case "learn": {
      const item = args._[1] as string | undefined;
      const learnOptions = {
        methodologies: args.methodologies as boolean | undefined,
        standards: args.standards as boolean | undefined,
        categories: args.categories as boolean | undefined,
        search: args.search as string | undefined,
        principles: args.principles as boolean | undefined,
        topic: item,
      };
      await learn(learnOptions);
      break;
    }
    case "hooks": {
      const hooksOptions = {
        list: args.list as boolean | undefined,
        validate: args.validate as boolean | undefined,
        edit: args.edit as string | undefined,
        disable: args.disable as string | undefined,
        enable: args.enable as string | undefined,
        run: args.run as string | undefined,
        template: args.template as string | undefined,
        global: args.global as boolean | undefined,
        projectPath: args.path as string | undefined,
      };
      await hooks(hooksOptions);
      break;
    }

    // Use CommandExecutor for shared commands
    case "standards":
    case "methodologies":
    case "principles":
    case "agents": {
      const commonOptions = parseCommonArgs(args);
      await commandExecutor.execute(command, commonOptions);
      break;
    }

    case "test-principles": {
      await testPrinciples({});
      break;
    }
    case "merge-docs": {
      const mergeOptions = {
        source: args.source as string | undefined || args._[1] as string | undefined,
        destination: args.destination as string | undefined,
        methodology: args.methodology as string | undefined,
        backup: args.backup as boolean | undefined,
        simulate: args.simulate as boolean | undefined,
        projectPath: args.path as string | undefined,
      };
      await mergeDocs(mergeOptions);
      break;
    }
    case "mcp": {
      const mcpOptions = {
        install: args.install as boolean | undefined,
        installReviewer: args["install-aichaku-reviewer"] as boolean | undefined,
        installGithub: args["install-github-operations"] as boolean | undefined,
        config: args.config as boolean | undefined,
        status: args.status as boolean | undefined,
        help: args.help as boolean | undefined,
        start: args.start as boolean | undefined,
        stop: args.stop as boolean | undefined,
        restart: args.restart as boolean | undefined,
        upgrade: args.upgrade as boolean | undefined,
        startAll: args["start-all"] as boolean | undefined,
        stopAll: args["stop-all"] as boolean | undefined,
        restartAll: args["restart-all"] as boolean | undefined,
        startServer: args["server-start"] as boolean | undefined,
        stopServer: args["server-stop"] as boolean | undefined,
        serverStatus: args["server-status"] as boolean | undefined,
        tools: args.tools as boolean | undefined,
      };
      await runMCPCommand(mcpOptions);
      break;
    }
    case "migrate": {
      if (args.help) {
        showMigrateHelp();
        break;
      }
      const migrateOptions = {
        dryRun: args["dry-run"] as boolean | undefined,
        force: args.force as boolean | undefined,
        check: args.check as boolean | undefined,
      };
      // The migrate command uses cliffy's Command interface
      // We need to build the args array from our options
      const migrateArgs: string[] = [];
      if (migrateOptions.dryRun) migrateArgs.push("--dry-run");
      if (migrateOptions.force) migrateArgs.push("--force");
      if (migrateOptions.check) migrateArgs.push("--check");

      const migrateCommand = createMigrateCommand();
      await migrateCommand.parse(migrateArgs);
      break;
    }
    case "review": {
      const reviewFiles = args._.slice(1).map(String);
      const reviewOptions = {
        stats: args.stats as boolean | undefined,
        all: args.all as boolean | undefined,
        standards: args.standards as boolean | undefined,
        security: args.security as boolean | undefined,
        architecture: args.architecture as boolean | undefined,
        development: args.development as boolean | undefined,
        testing: args.testing as boolean | undefined,
        devops: args.devops as boolean | undefined,
        methodologies: args.methodologies as boolean | undefined,
        projectPath: args.path as string | undefined,
      };
      await runReviewCommand(reviewOptions, reviewFiles);
      break;
    }
    case "github": {
      const subcommand = args._[1] as string | undefined;
      const githubOptions = {
        subcommand,
        help: args.help as boolean | undefined,
      };
      await runGitHubCommand(githubOptions, args._.slice(1).map(String));
      break;
    }
    case "cleanup": {
      const cleanupOptions = {
        global: args.global as boolean | undefined,
        dryRun: args["dry-run"] as boolean | undefined,
        projectPath: args.path as string | undefined,
      };
      await cleanup(cleanupOptions);
      break;
    }
    case "app-description": {
      const appDescOptions = {
        init: args.init as boolean | undefined,
        validate: args.validate as boolean | undefined,
        show: args.show as boolean | undefined,
        projectPath: args.path as string | undefined,
        silent: args.silent as boolean | undefined,
        type: args.type as string | undefined,
      };
      const result = await appDescription(appDescOptions);
      if (!result.success) {
        console.error(result.message);
        Deno.exit(1);
      }
      break;
    }
    case "githooks": {
      const githooksOptions = {
        path: args.path as string | undefined,
        install: args.install as boolean | undefined,
        uninstall: args.uninstall as boolean | undefined,
        list: args.list as boolean | undefined,
        enable: args.enable as string | undefined,
        disable: args.disable as string | undefined,
        enableAll: args["enable-all"] as boolean | undefined,
        disableAll: args["disable-all"] as boolean | undefined,
        test: args.test as boolean | string | undefined,
        force: args.force as boolean | undefined,
        help: args.help as boolean | undefined,
      };
      await runGitHooksCommand(githooksOptions);
      break;
    }
    case "version": {
      console.log(`${Brand.shortName} v${VERSION}`);
      break;
    }
    default: {
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "aichaku help" for usage information.');
      Deno.exit(1);
    }
  }
} catch (error) {
  if (error instanceof Error) {
    console.error(`❌ Error: ${error.message}`);
    if (args.verbose) {
      console.error(error.stack);
    }
  } else {
    console.error(`❌ An unexpected error occurred`);
  }
  Deno.exit(1);
}
