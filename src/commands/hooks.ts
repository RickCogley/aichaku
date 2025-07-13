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

// Type definitions for better type safety
interface HookConfig {
  name: string;
  command: string;
  description: string;
  matcher?: string;
}

interface Settings {
  hooks?: {
    [key: string]: HookConfig[];
  };
}

interface Standard {
  name: string;
  description: string;
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
    // InfoSec: Using parameter expansion to prevent command injection
    command:
      `bash -c 'file_path="$1"; if [[ "$file_path" =~ /\\.claude/output/ ]] && [[ ! "$file_path" =~ /active-[0-9]{4}-[0-9]{2}-[0-9]{2}/ ]]; then echo "❌ Aichaku: Files should be in active-YYYY-MM-DD-{name} folders"; exit 1; fi' -- "\${TOOL_INPUT_FILE_PATH}"`,
  },
  "status-updater": {
    name: "Aichaku Status Updater",
    description: "Auto-updates STATUS.md when project files change",
    type: "PostToolUse",
    matcher: "Write|Edit|MultiEdit",
    // InfoSec: Using parameter expansion to prevent command injection
    command:
      `bash -c 'file_path="$1"; if [[ "$file_path" =~ /\\.claude/output/active- ]] && [[ ! "$file_path" =~ STATUS\\.md$ ]]; then echo "🪴 Aichaku: Updating project status..."; fi' -- "\${TOOL_INPUT_FILE_PATH}"`,
  },
  "conversation-summary": {
    name: "Conversation Summary",
    description: "Auto-save summaries before context loss",
    type: "Stop",
    command:
      `echo "🪴 Aichaku: Consider creating a checkpoint with /checkpoint command before stopping."`,
  },
  "conversation-summary-precompact": {
    name: "Pre-Compact Summary",
    description: "Auto-save summaries before context compaction",
    type: "PreCompact",
    command:
      `echo "⚠️  Aichaku: Context will be compacted. Use /checkpoint to save important context."`,
  },
  "code-review": {
    name: "Code Review",
    description: "Review code after edits using Aichaku MCP",
    type: "PostToolUse",
    matcher: "Edit|MultiEdit|Write",
    command: `aichaku review "\${file_path}" 2>&1 | head -20`,
  },
  "template-validator": {
    name: "Aichaku Template Validator",
    description: "Validates methodology document templates",
    type: "PreToolUse",
    matcher: "Write",
    // InfoSec: Using parameter expansion to prevent command injection
    command:
      `bash -c 'file_path="$1"; if [[ "$file_path" =~ \\.(pitch|sprint|kanban)\\.md$ ]]; then echo "🪴 Aichaku: Validating methodology template..."; fi' -- "\${TOOL_INPUT_FILE_PATH}"`,
  },
  "diagram-generator": {
    name: "Aichaku Diagram Generator",
    description: "Ensures Mermaid diagrams are present in documentation",
    type: "PostToolUse",
    matcher: "Write",
    // InfoSec: Using parameter expansion and quoted grep pattern to prevent command injection
    command:
      `bash -c 'file_path="$1"; if [[ "$file_path" =~ /STATUS\\.md$ ]] && ! grep -q "mermaid" "$file_path" 2>/dev/null; then echo "⚠️  Aichaku: STATUS.md should include a Mermaid diagram"; fi' -- "\${TOOL_INPUT_FILE_PATH}"`,
  },
  "progress-tracker": {
    name: "Aichaku Progress Tracker",
    description: "Tracks sprint/cycle progress automatically",
    type: "Stop",
    command:
      `echo "🪴 Aichaku: Session complete. Updating progress metrics..."`,
  },
  "owasp-checker": {
    name: "OWASP Security Checker",
    description: "Reminds about OWASP Top 10 considerations",
    type: "PreToolUse",
    matcher: "Write|Edit",
    // InfoSec: Using parameter expansion to prevent command injection
    command:
      `bash -c 'file_path="$1"; if [[ "$file_path" =~ \\.(ts|js|py)$ ]]; then echo "🔒 Aichaku: Remember OWASP checks - validate inputs, secure auth, protect data"; fi' -- "\${TOOL_INPUT_FILE_PATH}"`,
  },
  "commit-validator": {
    name: "Conventional Commit Validator",
    description: "Ensures commit messages follow conventions",
    type: "PreToolUse",
    matcher: "Bash(git commit)",
    command:
      `echo "📝 Aichaku: Use conventional format: type(scope): description"`,
  },
  "sensitive-file-guard": {
    name: "Sensitive File Guard",
    description: "Prevents accidental modification of sensitive files",
    type: "PreToolUse",
    matcher: "Write|Edit|MultiEdit",
    // InfoSec: Using parameter expansion to prevent command injection
    command:
      `bash -c 'file_path="$1"; if [[ "$file_path" =~ (\\.env|\\.env\\.local|secrets|private) ]]; then echo "⚠️  Aichaku: Modifying potentially sensitive file - proceed with caution"; fi' -- "\${TOOL_INPUT_FILE_PATH}"`,
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
        `    Event: ${hook.type}${hook.matcher ? ` (${hook.matcher})` : ""}`,
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
    hooksToInstall = categoryDef.hooks;
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

  // Install each hook
  let installed = 0;
  let notFound = 0;

  for (const hookId of hooksToInstall) {
    const hook = HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
    if (!hook) {
      console.log(`❌ Unknown hook: ${hookId}`);
      notFound++;
      continue;
    }

    const hookType = hook.type as keyof typeof settings.hooks;
    settings.hooks[hookType] = settings.hooks[hookType] || [];

    // Check if hook already exists
    const exists = settings.hooks[hookType].some(
      (h: HookConfig) => h.name === hook.name,
    );

    if (!exists) {
      const hookConfig: HookConfig = {
        name: hook.name,
        command: hook.command,
        description: hook.description,
      };

      if ("matcher" in hook) {
        hookConfig.matcher = hook.matcher;
      }

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
          (h: HookConfig) => !h.name || !h.name.includes("Aichaku"),
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
    const aichakuHooks = (hooks as HookConfig[]).filter((hook) =>
      hook.name?.includes("Aichaku") ||
      hook.description?.includes("Aichaku") ||
      hook.name === "Conversation Summary" ||
      hook.name === "Code Review" ||
      hook.name === "Path Validator" ||
      hook.name === "Status Updater" ||
      hook.name === "Template Validator" ||
      hook.name === "Diagram Generator" ||
      hook.name === "Progress Tracker" ||
      hook.name === "OWASP Security Checker" ||
      hook.name === "Sensitive File Guard" ||
      hook.name === "Conventional Commit Validator"
    );

    if (aichakuHooks.length > 0) {
      for (const hook of aichakuHooks) {
        console.log(`  • ${hook.name}`);
        if (hook.description) {
          console.log(`    ${hook.description}`);
        }
        if (hook.matcher) {
          console.log(`    Matches: ${hook.matcher}`);
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

      if (hook.name?.startsWith("Aichaku")) {
        aichakuHooks++;
        console.log(`  ✅ ${hook.name}`);

        // Validate hook structure
        if (!hook.command) {
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
      "Install hook set (essential, productivity, security)",
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
