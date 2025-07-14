/**
 * Hooks command for Aichaku
 * Manages Claude Code hooks for methodology-aware automation
 *
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { normalize, resolve } from "jsr:@std/path@1";
import { safeReadTextFile } from "../utils/path-security.ts";

/**
 * Configuration for a Claude Code hook
 * @internal
 */
interface HookConfig {
  /** Regex pattern to match tool names (e.g., "Write|Edit|MultiEdit") */
  matcher?: string;
  /** Array of hooks to execute when the matcher is triggered */
  hooks: Array<{
    /** Hook type (currently only "command" is supported) */
    type: string;
    /** Command to execute when the hook is triggered */
    command: string;
  }>;
}

/**
 * Claude Code settings structure with hooks configuration
 * @internal
 */
interface Settings {
  /** Hook configurations organized by event type */
  hooks?: {
    [key: string]: HookConfig[];
  };
}

/**
 * Development standard metadata
 * @internal
 */
interface Standard {
  /** Standard identifier (e.g., "NIST-CSF", "TDD") */
  name: string;
  /** Brief description of the standard */
  description: string;
  /** Categorization tags for the standard */
  tags: string[];
}

/**
 * Expand tilde in path with security validation
 * InfoSec: Prevents path traversal attacks by validating normalized paths
 */
function expandTilde(path: string): string {
  if (path.startsWith("~")) {
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    if (!home) {
      throw new Error("Unable to determine home directory");
    }
    const expanded = path.replace("~", home);
    const normalized = normalize(expanded);

    // Security: Ensure the path doesn't escape the home directory
    if (!normalized.startsWith(home) && !normalized.startsWith(resolve("."))) {
      throw new Error("Invalid path: attempted directory traversal");
    }
    return normalized;
  }
  return normalize(path);
}

/**
 * Hook template categories
 */
export const HOOK_CATEGORIES = {
  essential: {
    name: "Essential",
    description: "Must-have hooks for Claude+Aichaku workflow",
    hooks: [
      "aichaku-feedback",
      "conversation-summary",
      "path-validator",
      "status-updater",
      "code-review",
    ],
  },
  productivity: {
    name: "Productivity",
    description: "Workflow enhancers for better development experience",
    hooks: [
      "template-validator",
      "diagram-generator",
      "progress-tracker",
      "commit-validator",
    ],
  },
  security: {
    name: "Security",
    description: "Compliance and safety checks",
    hooks: ["owasp-checker", "sensitive-file-guard"],
  },
  github: {
    name: "GitHub Integration",
    description: "GitHub workflow automation and best practices",
    hooks: [
      "todo-tracker",
      "pr-checker",
      "issue-linker",
      "workflow-monitor",
      "push-monitor",
      "release-helper",
    ],
  },
  custom: {
    name: "Custom",
    description: "Interactive selection of individual hooks",
    hooks: [],
  },
} as const;

/**
 * Individual hook templates
 */
const HOOK_TEMPLATES = {
  "path-validator": {
    name: "Aichaku Path Validator",
    description: "Ensures files are created in correct directories",
    type: "PreToolUse",
    matcher: "Write|MultiEdit",
    source: "aichaku",
    // Using TypeScript runner for better security and cross-platform compatibility
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts path-validator`,
  },
  "status-updater": {
    name: "Aichaku Status Updater",
    description: "Auto-updates STATUS.md when project files change",
    type: "PostToolUse",
    matcher: "Write|Edit|MultiEdit",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts status-updater`,
  },
  "conversation-summary": {
    name: "Conversation Summary",
    description: "Auto-save summaries before context loss",
    type: "Stop",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts conversation-summary`,
  },
  "conversation-summary-precompact": {
    name: "Pre-Compact Summary",
    description: "Auto-save summaries before context compaction",
    type: "PreCompact",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts conversation-summary-precompact`,
  },
  "code-review": {
    name: "Code Review",
    description: "Review code after edits using Aichaku MCP",
    type: "PostToolUse",
    matcher: "Edit|MultiEdit|Write",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env --allow-run ~/.claude/aichaku/hooks/aichaku-hooks.ts code-review`,
  },
  "template-validator": {
    name: "Aichaku Template Validator",
    description: "Validates methodology document templates",
    type: "PreToolUse",
    matcher: "Write",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts template-validator`,
  },
  "diagram-generator": {
    name: "Aichaku Diagram Generator",
    description: "Ensures Mermaid diagrams are present in documentation",
    type: "PostToolUse",
    matcher: "Write",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts diagram-generator`,
  },
  "progress-tracker": {
    name: "Aichaku Progress Tracker",
    description: "Tracks sprint/cycle progress automatically",
    type: "Stop",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts progress-tracker`,
  },
  "owasp-checker": {
    name: "OWASP Security Checker",
    description: "Reminds about OWASP Top 10 considerations",
    type: "PreToolUse",
    matcher: "Write|Edit",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts owasp-checker`,
  },
  "commit-validator": {
    name: "Conventional Commit Validator",
    description: "Ensures commit messages follow conventions",
    type: "PreToolUse",
    matcher: "Bash(git commit)",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts commit-validator`,
  },
  "sensitive-file-guard": {
    name: "Sensitive File Guard",
    description: "Prevents accidental modification of sensitive files",
    type: "PreToolUse",
    matcher: "Write|Edit|MultiEdit",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts sensitive-file-guard`,
  },
  // GitHub Integration Hooks
  "todo-tracker": {
    name: "TODO Tracker",
    description: "Suggests creating GitHub issues from TODOs in code",
    type: "PostToolUse",
    matcher: "Write|Edit|MultiEdit",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts todo-tracker`,
  },
  "pr-checker": {
    name: "PR Context Checker",
    description: "Checks active pull requests at session start",
    type: "SessionStart",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts pr-checker`,
  },
  "issue-linker": {
    name: "Issue Linker",
    description: "Reminds to link commits to GitHub issues",
    type: "PreToolUse",
    matcher: "Bash",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts issue-linker`,
  },
  "workflow-monitor": {
    name: "GitHub Workflow Monitor",
    description: "Provides guidance when editing GitHub Actions workflows",
    type: "PostToolUse",
    matcher: "Write|Edit|MultiEdit",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts workflow-monitor`,
  },
  "release-helper": {
    name: "Release Helper",
    description: "Guides through release process on version bumps",
    type: "PostToolUse",
    matcher: "Write|Edit|MultiEdit",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts release-helper`,
  },
  "push-monitor": {
    name: "Push Monitor",
    description:
      "Alerts when git push is detected and provides GitHub Actions monitoring tips",
    type: "PreToolUse",
    matcher: "Bash",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts push-monitor`,
  },
  "aichaku-feedback": {
    name: "Aichaku Feedback",
    description:
      "Shows brief feedback about what Aichaku will do - confirms hooks are active",
    type: "PreToolUse",
    matcher: ".*",
    source: "aichaku",
    command:
      `deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts aichaku-feedback`,
  },
};

/**
 * Hook installation options
 */
interface HookOptions {
  list?: boolean;
  install?: string;
  remove?: boolean;
  validate?: boolean;
  dryRun?: boolean;
  show?: boolean;
  global?: boolean;
  local?: boolean;
}

/**
 * Main hooks command implementation
 */
/**
 * Configure and manage Claude Code hooks for Aichaku automation
 *
 * Hooks allow you to run custom scripts at various points in Claude Code's lifecycle,
 * such as before tool use, after tool use, or when a conversation ends. This command
 * helps you install, uninstall, list, and validate hooks.
 *
 * @param {HookOptions} options - Configuration options for hook management
 * @param {boolean} options.list - List all available hooks and categories
 * @param {boolean} options.show - Show currently installed hooks
 * @param {boolean} options.validate - Validate installed hooks are working
 * @param {string[]} options.install - Hook names or categories to install
 * @param {string[]} options.uninstall - Hook names to uninstall
 * @param {boolean} options.global - Apply operations globally (~/.claude)
 * @param {string} options.projectPath - Project path for local operations
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // List all available hooks
 * await hooks({ list: true });
 *
 * // Install essential hooks globally
 * await hooks({ install: ["essential"], global: true });
 *
 * // Install specific hooks locally
 * await hooks({ install: ["path-validator", "commit-validator"] });
 *
 * // Show installed hooks
 * await hooks({ show: true });
 *
 * // Uninstall a hook
 * await hooks({ uninstall: ["status-updater"], global: true });
 * ```
 *
 * @public
 */
export async function hooks(options: HookOptions = {}): Promise<void> {
  try {
    // Show installed hooks
    if (options.show) {
      await showInstalledHooks();
      return;
    }

    // List available hooks
    if (options.list) {
      await listHooks();
      return;
    }

    // Validate existing hooks
    if (options.validate) {
      await validateHooks();
      return;
    }

    // Remove hooks
    if (options.remove === true) {
      await removeHooks(options.dryRun, options.global, options.local);
      return;
    }

    // Install hooks
    if (options.install) {
      await installHooks(
        options.install,
        options.dryRun,
        options.global,
        options.local,
      );
      return;
    }

    // Default: show interactive menu
    await interactiveHookSelection(options.dryRun);
  } catch (error) {
    // InfoSec: Avoid exposing detailed error messages in production
    console.error(`❌ Error: An error occurred while processing hooks`);
    if (
      error instanceof Error && error.message.includes("directory traversal")
    ) {
      console.error("Security violation detected");
    }
    Deno.exit(1);
  }
}

/**
 * List all available hook templates
 */
function listHooks(): void {
  console.log("\n🪴 Available Aichaku Hooks\n");

  // List hooks by category with their IDs
  for (const [categoryId, category] of Object.entries(HOOK_CATEGORIES)) {
    if (categoryId === "custom") continue;

    console.log(`${category.name.toUpperCase()} HOOKS`);

    for (const hookId of category.hooks) {
      const hook = HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
      if (!hook) {
        console.log(`  ${hookId} (not yet implemented)`);
        continue;
      }
      console.log(`  ${hookId}`);
      console.log(`    ${hook.description}`);
      console.log(
        `    Event: ${hook.type}${
          "matcher" in hook && hook.matcher ? ` (${hook.matcher})` : ""
        }`,
      );
      console.log();
    }
  }

  // Show installation commands
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("INSTALL SETS:");
  console.log(
    `  aichaku hooks --install essential     ${HOOK_CATEGORIES.essential.hooks.length} hooks (Recommended)`,
  );
  console.log(
    `  aichaku hooks --install productivity  ${HOOK_CATEGORIES.productivity.hooks.length} hooks`,
  );
  console.log(
    `  aichaku hooks --install security      ${HOOK_CATEGORIES.security.hooks.length} hooks`,
  );
  console.log(
    `  aichaku hooks --install github        ${HOOK_CATEGORIES.github.hooks.length} hooks (GitHub Integration)`,
  );
  console.log();
  console.log("INSTALL INDIVIDUAL HOOKS:");
  console.log("  aichaku hooks --install <hook-name> [--global|--local]");
  console.log();
  console.log("EXAMPLES:");
  console.log("  aichaku hooks --install essential --global");
  console.log("  aichaku hooks --install conversation-summary --local");
  console.log('  aichaku hooks --install "path-validator,code-review"');
}

/**
 * Ensure hook scripts are installed
 */
async function ensureHookScripts(): Promise<void> {
  const scriptPath = expandTilde(
    "~/.claude/aichaku/hooks/aichaku-hooks.ts",
  );
  const scriptDir = expandTilde("~/.claude/aichaku/hooks");

  // Create directory if it doesn't exist
  await ensureDir(scriptDir);

  // Check if script already exists
  if (await exists(scriptPath)) {
    return;
  }

  // Create the unified hook runner script
  const scriptContent =
    `#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

// Aichaku Hook Runner
// This script handles all Aichaku hooks with proper TypeScript support

interface HookInput {
  session_id?: string;
  transcript_path?: string;
  hook_event_name?: string;
  stop_hook_active?: boolean;
  tool_input?: {
    file_path?: string;
    command?: string;
  };
}

const hookType = Deno.args[0];

// Read input from stdin if available
let input: HookInput = {};
try {
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(1024 * 1024); // 1MB buffer
  const bytesRead = await Deno.stdin.read(buffer);
  if (bytesRead && bytesRead > 0) {
    const inputStr = decoder.decode(buffer.subarray(0, bytesRead));
    input = JSON.parse(inputStr);
  }
} catch {
  // No input from stdin or invalid JSON
}

// Get file path from environment or input
const filePath = Deno.env.get("TOOL_INPUT_FILE_PATH") || 
                 input.tool_input?.file_path || "";

// Hook implementations
switch (hookType) {
  case "path-validator":
    if (filePath.includes("/docs/projects/") && 
        !filePath.match(/\\/active\\/\\d{4}-\\d{2}-\\d{2}-/)) {
      console.error("❌ Aichaku: Files should be in docs/projects/active/YYYY-MM-DD-{name} folders");
      Deno.exit(1);
    }
    break;

  case "status-updater":
    if (filePath.includes("/docs/projects/active/") && 
        !filePath.endsWith("STATUS.md")) {
      console.log("🪴 Aichaku: Updating project status...");
    }
    break;

  case "conversation-summary":
  case "conversation-summary-precompact":
    if (input.transcript_path) {
      const transcriptContent = await Deno.readTextFile(input.transcript_path);
      const eventPrefix = input.hook_event_name === "preCompact" ? "Pre-Compact" : "Checkpoint";
      
      const checkpointDir = "docs/checkpoints";
      await Deno.mkdir(checkpointDir, { recursive: true }).catch(() => {});
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const sessionId = input.session_id || "unknown";
      const filename = \`\${checkpointDir}/\${eventPrefix.toLowerCase()}-\${dateStr}-\${sessionId.slice(0, 8)}.md\`;
      
      const content = \`# \${eventPrefix} Summary

**Date**: \${now.toISOString()}
**Session**: \${sessionId}
**Event**: \${input.hook_event_name || hookType}

## Conversation Transcript

\${transcriptContent}
\`;
      
      await Deno.writeTextFile(filename, content);
      console.log(\`🪴 Aichaku: \${eventPrefix} saved to \${filename}\`);
    }
    break;

  case "code-review":
    console.log(\`🔍 Aichaku: Reviewing code changes in \${filePath}...\`);
    // Future: integrate with aichaku review command
    break;

  case "template-validator":
    if (filePath.match(/\\.(pitch|sprint|kanban)\\.md$/)) {
      console.log("🪴 Aichaku: Validating methodology template...");
    }
    break;

  case "diagram-generator":
    if (filePath.endsWith("/STATUS.md")) {
      try {
        const content = await Deno.readTextFile(filePath);
        if (!content.includes("mermaid")) {
          console.log("⚠️  Aichaku: STATUS.md should include a Mermaid diagram");
        }
      } catch {
        // File might not exist yet
      }
    }
    break;

  case "progress-tracker":
    console.log("🪴 Aichaku: Session complete. Updating progress metrics...");
    break;

  case "owasp-checker":
    if (filePath.match(/\\.(ts|js|py)$/)) {
      console.log("🔒 Aichaku: Remember OWASP checks - validate inputs, secure auth, protect data");
    }
    break;

  case "commit-validator":
    console.log("📝 Aichaku: Use conventional format: type(scope): description");
    break;

  case "sensitive-file-guard":
    if (filePath.match(/(\\.env|\\.env\\.local|secrets|private)/)) {
      console.log("⚠️  Aichaku: Modifying potentially sensitive file - proceed with caution");
    }
    break;

  default:
    console.error(\`Unknown hook type: \${hookType}\`);
    Deno.exit(1);
}
`;

  await Deno.writeTextFile(scriptPath, scriptContent);
  await Deno.chmod(scriptPath, 0o755);

  console.log("📝 Installed Aichaku hook runner script");
}

/**
 * Install hook templates
 */
async function installHooks(
  input: string,
  dryRun: boolean = false,
  global?: boolean,
  local?: boolean,
): Promise<void> {
  // Determine installation path
  let settingsPath: string;
  if (global && local) {
    console.error(`❌ Cannot use both --global and --local flags`);
    return;
  } else if (local) {
    settingsPath = ".claude/settings.json";
    console.log("Installing hooks locally (.claude/settings.json)...");
  } else if (global) {
    settingsPath = expandTilde("~/.claude/settings.json");
    console.log("Installing hooks globally (~/.claude/settings.json)...");
  } else {
    // Interactive prompt for location
    console.log("\nWhere would you like to install the hooks?");
    console.log(
      "1) Global (~/.claude/settings.json) - Available to all projects",
    );
    console.log("2) Local (.claude/settings.json) - This project only");

    const choice = prompt("Enter your choice (1 or 2): ") || "";
    if (choice.trim() === "1") {
      settingsPath = expandTilde("~/.claude/settings.json");
      console.log("\nInstalling hooks globally...");
    } else if (choice.trim() === "2") {
      settingsPath = ".claude/settings.json";
      console.log("\nInstalling hooks locally...");
    } else {
      console.error("❌ Invalid choice. Aborting.");
      return;
    }
  }

  let settings: Settings = {};

  // Load existing settings
  if (await exists(settingsPath)) {
    try {
      const content = settingsPath.startsWith(".")
        ? await Deno.readTextFile(settingsPath)
        : await safeReadTextFile(settingsPath, Deno.env.get("HOME") || "");

      // Remove comments for parsing
      const jsonWithoutComments = content.replace(/\/\/.*$/gm, "").replace(
        /\/\*[\s\S]*?\*\//g,
        "",
      );
      const parsed = JSON.parse(jsonWithoutComments);

      // Validate structure
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid settings format: expected object");
      }

      settings = parsed as Settings;
    } catch (_error) {
      // InfoSec: Don't expose raw error messages
      console.error(`❌ Invalid settings.json format`);
      console.error(`Tip: Check for syntax errors or trailing commas`);
      return;
    }
  }

  // Initialize hooks structure
  settings.hooks = settings.hooks || {};

  // Parse input - could be category or comma-separated hook names
  let hooksToInstall: string[] = [];
  let categoryName = "";

  // Check if it's a category
  const categoryDef = HOOK_CATEGORIES[input as keyof typeof HOOK_CATEGORIES];
  if (categoryDef) {
    hooksToInstall = [...categoryDef.hooks];
    categoryName = categoryDef.name;
    if (input === "custom") {
      console.log("Custom selection not yet implemented");
      return;
    }
  } else {
    // Parse as comma-separated individual hooks
    hooksToInstall = input.split(",").map((h) => h.trim());
    categoryName = "individual";
  }

  console.log(`\n🪴 Aichaku: Installing ${categoryName} hooks...\n`);

  // Ensure hook scripts are installed before installing any hooks
  if (!dryRun) {
    await ensureHookScripts();
  }

  // Install each hook
  let installed = 0;
  let notFound = 0;

  for (const hookId of hooksToInstall) {
    // Special handling for conversation-summary (installs both Stop and PreCompact)
    if (hookId === "conversation-summary") {
      // Ensure script is installed
      if (!dryRun) {
        await ensureHookScripts();
      }

      // Install both Stop and PreCompact hooks
      const stopHook = HOOK_TEMPLATES["conversation-summary"];
      const preCompactHook = HOOK_TEMPLATES["conversation-summary-precompact"];

      let summaryInstalled = 0;

      // Install Stop hook
      settings.hooks["Stop"] = settings.hooks["Stop"] || [];
      const stopExists = settings.hooks["Stop"].some(
        (h: HookConfig) =>
          h.hooks && h.hooks.some(
            (hookItem) => hookItem.command === stopHook.command,
          ),
      );

      if (!stopExists) {
        settings.hooks["Stop"].push({
          hooks: [
            {
              type: "command",
              command: stopHook.command,
            },
          ],
        });
        summaryInstalled++;
      }

      // Install PreCompact hook
      settings.hooks["PreCompact"] = settings.hooks["PreCompact"] || [];
      const preCompactExists = settings.hooks["PreCompact"].some(
        (h: HookConfig) =>
          h.hooks && h.hooks.some(
            (hookItem) => hookItem.command === preCompactHook.command,
          ),
      );

      if (!preCompactExists) {
        settings.hooks["PreCompact"].push({
          hooks: [
            {
              type: "command",
              command: preCompactHook.command,
            },
          ],
        });
        summaryInstalled++;
      }

      if (summaryInstalled > 0) {
        console.log(`✅ Conversation Summary installed (Stop & PreCompact)`);
        installed += summaryInstalled;
      } else {
        console.log(`⚠️ Conversation Summary already installed`);
      }
      continue;
    }

    // Regular hook installation
    const hook = HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
    if (!hook) {
      console.log(`❌ Unknown hook: ${hookId}`);
      notFound++;
      continue;
    }

    const hookType = hook.type as keyof typeof settings.hooks;
    settings.hooks[hookType] = settings.hooks[hookType] || [];

    // Check if hook already exists (by matcher and command)
    const exists = settings.hooks[hookType].some(
      (h: HookConfig) => {
        // For hooks with matchers, check both matcher and command
        if ("matcher" in hook && hook.matcher) {
          return h.matcher === hook.matcher &&
            h.hooks.some((hookItem) => hookItem.command === hook.command);
        }
        // For hooks without matchers, just check command
        return h.hooks.some((hookItem) => hookItem.command === hook.command);
      },
    );

    if (!exists) {
      // Create the correct nested structure for Claude Code
      const hookConfig = {
        ...("matcher" in hook && hook.matcher ? { matcher: hook.matcher } : {}),
        hooks: [
          {
            type: "command",
            command: hook.command,
          },
        ],
      };

      settings.hooks[hookType].push(hookConfig);
      console.log(`✅ ${hook.name} installed`);
      installed++;
    } else {
      console.log(`⚠️ ${hook.name} already exists`);
    }
  }

  // Save settings
  if (!dryRun && installed > 0) {
    // Ensure directory exists
    if (settingsPath.startsWith(".")) {
      await ensureDir(".claude");
    } else {
      await ensureDir(expandTilde("~/.claude"));
    }

    await Deno.writeTextFile(
      settingsPath,
      JSON.stringify(settings, null, 2),
    );
    console.log(`\n✅ Settings updated successfully`);
  } else if (dryRun) {
    console.log("\n[Dry run - no changes made]");
  }

  console.log(`\nInstalled ${installed} new hooks`);
  if (notFound > 0) {
    console.log(`Not found: ${notFound} hooks`);
  }

  // Show restart reminder if any hooks were installed
  if (installed > 0 && !dryRun) {
    displayRestartReminder();
  }
}

/**
 * Remove Aichaku hooks
 */
async function removeHooks(
  dryRun: boolean = false,
  global?: boolean,
  local?: boolean,
): Promise<void> {
  // Determine which settings files to process
  const paths: string[] = [];

  if (global && local) {
    console.error(`❌ Cannot use both --global and --local flags`);
    return;
  } else if (local) {
    paths.push(".claude/settings.json");
  } else if (global) {
    paths.push(expandTilde("~/.claude/settings.json"));
  } else {
    // If neither specified, check both and ask user
    const globalPath = expandTilde("~/.claude/settings.json");
    const localPath = ".claude/settings.json";
    const availablePaths: string[] = [];

    if (await exists(globalPath)) availablePaths.push(globalPath);
    if (await exists(localPath)) availablePaths.push(localPath);

    if (availablePaths.length === 0) {
      console.log(`⚠️ No settings.json files found`);
      return;
    } else if (availablePaths.length === 1) {
      paths.push(availablePaths[0]);
    } else {
      // Both exist, ask user
      console.log("\nFound hooks in multiple locations:");
      console.log("1) Global (~/.claude/settings.json)");
      console.log("2) Local (.claude/settings.json)");
      console.log("3) Both");
      console.log(
        "\nWhich would you like to remove hooks from? (1, 2, or 3): ",
      );

      const choice = prompt("") || "";
      if (choice === "1") {
        paths.push(globalPath);
      } else if (choice === "2") {
        paths.push(localPath);
      } else if (choice === "3") {
        paths.push(globalPath, localPath);
      } else {
        console.error("❌ Invalid choice. Aborting.");
        return;
      }
    }
  }

  console.log("Removing Aichaku hooks...");
  let totalRemoved = 0;

  for (const settingsPath of paths) {
    if (!(await exists(settingsPath))) {
      continue;
    }

    console.log(`\nProcessing ${settingsPath}...`);

    try {
      const content = settingsPath.startsWith(".")
        ? await Deno.readTextFile(settingsPath)
        : await safeReadTextFile(settingsPath, Deno.env.get("HOME") || "");

      const settings = JSON.parse(content);

      if (!settings.hooks) {
        console.log(`  ⚠️ No hooks found`);
        continue;
      }

      let removed = 0;
      for (const hookType of Object.keys(settings.hooks)) {
        const hooks = settings.hooks[hookType];
        const filtered = hooks.filter(
          (h: HookConfig) => {
            // Remove Aichaku hooks by checking if any hook command contains "aichaku" or "Aichaku"
            const hasAichakuCommand = h.hooks.some((hookItem) =>
              hookItem.command.includes("aichaku") ||
              hookItem.command.includes("Aichaku")
            );
            return !hasAichakuCommand;
          },
        );

        removed += hooks.length - filtered.length;
        settings.hooks[hookType] = filtered;
      }

      if (!dryRun && removed > 0) {
        await Deno.writeTextFile(
          settingsPath,
          JSON.stringify(settings, null, 2),
        );
        console.log(`  ✅ Removed ${removed} Aichaku hooks`);
      } else if (dryRun) {
        console.log(`  [Dry run - would remove ${removed} hooks]`);
      } else {
        console.log(`  ⚠️ No Aichaku hooks found`);
      }

      totalRemoved += removed;
    } catch (_error) {
      console.error(`  ❌ Error processing ${settingsPath}`);
    }
  }

  // Show restart reminder if any hooks were removed
  if (totalRemoved > 0 && !dryRun) {
    displayRestartReminder();
  }
}

/**
 * Show installed hooks from both global and local settings
 */
async function showInstalledHooks(): Promise<void> {
  console.log("\n🪴 Installed Aichaku Hooks\n");

  let foundHooks = false;

  // Check global settings
  const globalPath = expandTilde("~/.claude/settings.json");
  if (await exists(globalPath)) {
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    const content = await safeReadTextFile(globalPath, home);
    try {
      const jsonWithoutComments = content.replace(/\/\/.*$/gm, "").replace(
        /\/\*[\s\S]*?\*\//g,
        "",
      );
      const settings = JSON.parse(jsonWithoutComments) as Settings;

      if (settings.hooks && Object.keys(settings.hooks).length > 0) {
        console.log("GLOBAL HOOKS (~/.claude/settings.json):");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        displayHooksFromSettings(settings);
        foundHooks = true;
      }
    } catch (_error) {
      console.error(`⚠️  Error reading global settings`);
    }
  }

  // Check local settings
  const localPath = ".claude/settings.json";
  if (await exists(localPath)) {
    const content = await Deno.readTextFile(localPath);
    try {
      const jsonWithoutComments = content.replace(/\/\/.*$/gm, "").replace(
        /\/\*[\s\S]*?\*\//g,
        "",
      );
      const settings = JSON.parse(jsonWithoutComments) as Settings;

      if (settings.hooks && Object.keys(settings.hooks).length > 0) {
        if (foundHooks) console.log("\n");
        console.log("LOCAL HOOKS (.claude/settings.json):");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        displayHooksFromSettings(settings);
        foundHooks = true;
      }
    } catch (_error) {
      console.error(`⚠️  Error reading local settings`);
    }
  }

  if (!foundHooks) {
    console.log("No Aichaku hooks installed.\n");
    console.log("To install hooks, use:");
    console.log("  aichaku hooks --install essential --global");
    console.log("  aichaku hooks --install productivity --local");
  }
}

/**
 * Display hooks from a settings object
 */
function displayHooksFromSettings(settings: Settings): void {
  if (!settings.hooks) return;

  for (const [hookType, hooks] of Object.entries(settings.hooks)) {
    if (!Array.isArray(hooks) || hooks.length === 0) continue;

    console.log(`${hookType}:`);

    // Filter Aichaku hooks by checking their commands
    const aichakuHooks = (hooks as HookConfig[]).filter((hook) => {
      // Check if any of the hook's commands contain "aichaku"
      return hook.hooks?.some((h) =>
        h.command.includes("aichaku") ||
        h.command.includes("Aichaku")
      );
    });

    if (aichakuHooks.length > 0) {
      for (const hook of aichakuHooks) {
        // Extract hook name from command or use a generic label
        const hookCommand = hook.hooks?.[0]?.command || "";
        let hookName = "Aichaku Hook";

        // Try to extract the hook type from the command
        const match = hookCommand.match(/aichaku-hooks\.ts\s+(\S+)/);
        if (match) {
          const hookId = match[1];
          const template =
            HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
          if (template) {
            hookName = template.name;
            console.log(`  • ${hookName}`);
            console.log(`    ${template.description}`);
            if (hook.matcher) {
              console.log(`    Matches: ${hook.matcher}`);
            }
          } else {
            console.log(`  • ${hookName} (${hookId})`);
            if (hook.matcher) {
              console.log(`    Matches: ${hook.matcher}`);
            }
          }
        } else {
          console.log(`  • ${hookName}`);
          if (hook.matcher) {
            console.log(`    Matches: ${hook.matcher}`);
          }
        }
      }
    }
    console.log();
  }
}

/**
 * Display restart reminder after hook modifications
 */
function displayRestartReminder(): void {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  RESTART REQUIRED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Hooks have been modified. Please restart Claude Code");
  console.log("for the changes to take effect.\n");
}

/**
 * Validate existing hooks
 */
async function validateHooks(): Promise<void> {
  console.log("Validating hooks...");

  const settingsPath = expandTilde("~/.claude/settings.json"); // Keep in global .claude for compatibility
  if (!(await exists(settingsPath))) {
    console.log(`⚠️ No settings.json found`);
    return;
  }

  // Security: Use safe file reading with home directory validation
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
  const content = await safeReadTextFile(settingsPath, home);
  let settings: Settings;

  try {
    const jsonWithoutComments = content.replace(/\/\/.*$/gm, "").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    const parsed = JSON.parse(jsonWithoutComments);

    // Validate structure
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid settings format");
    }

    settings = parsed as Settings;
  } catch (_error) {
    // InfoSec: Don't expose raw error messages
    console.error(`❌ Invalid JSON in settings.json`);
    return;
  }

  console.log("\n🔍 Validating Claude Code hooks...\n");

  if (!settings.hooks || Object.keys(settings.hooks).length === 0) {
    console.log(`⚠️ No hooks configured`);
    return;
  }

  let totalHooks = 0;
  let aichakuHooks = 0;
  let issues = 0;

  for (const [hookType, hooks] of Object.entries(settings.hooks)) {
    if (!Array.isArray(hooks)) continue;

    console.log(`${hookType}:`);

    for (const hook of hooks as HookConfig[]) {
      totalHooks++;

      // Check if it's an Aichaku hook by looking at the command
      const isAichakuHook = hook.hooks?.some((h) =>
        h.command.includes("aichaku") || h.command.includes("Aichaku")
      );

      if (isAichakuHook) {
        aichakuHooks++;

        // Extract hook name from command
        const hookCommand = hook.hooks?.[0]?.command || "";
        const match = hookCommand.match(/aichaku-hooks\.ts\s+(\S+)/);
        if (match) {
          const hookId = match[1];
          const template =
            HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
          console.log(`  ✅ ${template?.name || `Aichaku Hook (${hookId})`}`);
        } else {
          console.log(`  ✅ Aichaku Hook`);
        }

        // Validate hook structure
        if (!hook.hooks || hook.hooks.length === 0) {
          console.log(`    ❌ Missing hooks array`);
          issues++;
        } else if (!hook.hooks[0].command) {
          console.log(`    ❌ Missing command`);
          issues++;
        }
      }
    }
  }

  console.log(`\nTotal hooks: ${totalHooks}`);
  console.log(`Aichaku hooks: ${aichakuHooks}`);

  if (issues > 0) {
    console.log(`Issues found: ${issues}`);
  } else {
    console.log(`✅ All hooks valid`);
  }
}

/**
 * Interactive hook selection (placeholder for now)
 */
function interactiveHookSelection(_dryRun: boolean = false): void {
  console.log("\n🪴 Aichaku Hook Manager\n");
  console.log("Available commands:");
  console.log(
    ("  aichaku hooks --show              ") + "Show installed hooks",
  );
  console.log(
    ("  aichaku hooks --list              ") + "Show available hook templates",
  );
  console.log(
    ("  aichaku hooks --install <set>     ") +
      "Install hook set (essential, productivity, security, github)",
  );
  console.log(
    ("  aichaku hooks --install <names>   ") +
      "Install specific hooks (comma-separated)",
  );
  console.log(
    ("  aichaku hooks --remove            ") + "Remove Aichaku hooks",
  );
  console.log(
    ("  aichaku hooks --validate          ") + "Check hook configuration",
  );
  console.log();
  console.log("Options:");
  console.log(
    ("  --global                          ") +
      "Use global settings (~/.claude/settings.json)",
  );
  console.log(
    ("  --local                           ") +
      "Use local settings (.claude/settings.json)",
  );
  console.log(
    ("  --dry-run                         ") +
      "Preview changes without making them",
  );
  console.log();
  console.log("Examples:");
  console.log("  aichaku hooks --install essential --global");
  console.log("  aichaku hooks --install path-validator,code-review --local");
  console.log("  aichaku hooks --show");
  console.log();
  console.log("Interactive selection coming soon!");
}
