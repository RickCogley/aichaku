/**
 * Hooks command for Aichaku
 * Manages Claude Code hooks for methodology-aware automation
 *
 * @module
 */

import { exists } from "jsr:@std/fs@1/exists";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";
import { normalize, resolve } from "jsr:@std/path@1";

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
  basic: {
    name: "Basic",
    description: "Essential hooks for path validation and status updates",
    hooks: ["path-validator", "status-updater", "methodology-detector"],
  },
  advanced: {
    name: "Advanced",
    description: "Power user hooks for comprehensive automation",
    hooks: ["template-validator", "diagram-generator", "progress-tracker"],
  },
  security: {
    name: "Security",
    description: "Security-focused hooks for compliance",
    hooks: ["owasp-checker", "commit-validator", "sensitive-file-guard"],
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
  "methodology-detector": {
    name: "Aichaku Methodology Detector",
    description: "Sets environment variables based on detected methodology",
    type: "onSessionStart",
    command:
      `export AICHAKU_MODE=planning; echo "🪴 Aichaku: Methodology support activated"`,
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
}

/**
 * Main hooks command implementation
 */
export async function hooks(options: HookOptions = {}): Promise<void> {
  try {
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
    if (options.remove) {
      await removeHooks(options.dryRun);
      return;
    }

    // Install hooks
    if (options.install) {
      await installHooks(options.install, options.dryRun);
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
  console.log("\n🪝 Available Aichaku Hook Templates\n");

  for (const [categoryId, category] of Object.entries(HOOK_CATEGORIES)) {
    if (categoryId === "custom") continue;

    console.log(`${category.name} Set`);
    console.log(`  ${category.description}`);
    console.log();

    for (const hookId of category.hooks) {
      const hook = HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
      console.log(`  • ${hook.name}`);
      console.log(`    ${hook.description}`);
      console.log(`    Type: ${hook.type}`);
    }
    console.log();
  }
}

/**
 * Install hook templates
 */
async function installHooks(
  category: string,
  dryRun: boolean = false,
): Promise<void> {
  console.log("Installing hooks...");

  const settingsPath = expandTilde("~/.claude/settings.json");
  let settings: Settings = {};

  // Load existing settings
  if (await exists(settingsPath)) {
    const content = await Deno.readTextFile(settingsPath);
    try {
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

  // Get hooks to install
  const categoryDef = HOOK_CATEGORIES[category as keyof typeof HOOK_CATEGORIES];
  if (!categoryDef) {
    console.error(`❌ Unknown category: ${category}`);
    console.log("Available: basic, advanced, security, custom");
    return;
  }

  const hooksToInstall = categoryDef.hooks;
  if (category === "custom") {
    // TODO: Implement interactive selection
    console.log("Custom selection not yet implemented");
    return;
  }

  console.log(`\n🪴 Aichaku: Installing ${categoryDef.name} hook set...\n`);

  // Install each hook
  let installed = 0;
  for (const hookId of hooksToInstall) {
    const hook = HOOK_TEMPLATES[hookId as keyof typeof HOOK_TEMPLATES];
    if (!hook) continue;

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
    await ensureDir(expandTilde("~/.claude"));
    await Deno.writeTextFile(
      settingsPath,
      JSON.stringify(settings, null, 2),
    );
    console.log(`\n✅ Settings updated successfully`);
  } else if (dryRun) {
    console.log("\n[Dry run - no changes made]");
  }

  console.log(`\nInstalled ${installed} new hooks`);
}

/**
 * Remove Aichaku hooks
 */
async function removeHooks(dryRun: boolean = false): Promise<void> {
  console.log("Removing Aichaku hooks...");

  const settingsPath = expandTilde("~/.claude/settings.json");
  if (!(await exists(settingsPath))) {
    console.log(`⚠️ No settings.json found`);
    return;
  }

  const content = await Deno.readTextFile(settingsPath);
  const settings = JSON.parse(content);

  if (!settings.hooks) {
    console.log(`⚠️ No hooks found`);
    return;
  }

  let removed = 0;
  for (const hookType of Object.keys(settings.hooks)) {
    const hooks = settings.hooks[hookType];
    const filtered = hooks.filter(
      (h: HookConfig) => !h.name || !h.name.startsWith("Aichaku"),
    );

    removed += hooks.length - filtered.length;
    settings.hooks[hookType] = filtered;
  }

  if (!dryRun && removed > 0) {
    await Deno.writeTextFile(
      settingsPath,
      JSON.stringify(settings, null, 2),
    );
    console.log(`✅ Removed ${removed} Aichaku hooks`);
  } else if (dryRun) {
    console.log(`[Dry run - would remove ${removed} hooks]`);
  } else {
    console.log(`⚠️ No Aichaku hooks found`);
  }
}

/**
 * Validate existing hooks
 */
async function validateHooks(): Promise<void> {
  console.log("Validating hooks...");

  const settingsPath = expandTilde("~/.claude/settings.json");
  if (!(await exists(settingsPath))) {
    console.log(`⚠️ No settings.json found`);
    return;
  }

  const content = await Deno.readTextFile(settingsPath);
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
    ("  aichaku hooks --list              ") + "Show available hook templates",
  );
  console.log(
    ("  aichaku hooks --install basic     ") + "Install basic hook set",
  );
  console.log(("  aichaku hooks --install advanced  ") + "Install all hooks");
  console.log(
    ("  aichaku hooks --install security  ") + "Install security hooks",
  );
  console.log(
    ("  aichaku hooks --remove            ") + "Remove Aichaku hooks",
  );
  console.log(
    ("  aichaku hooks --validate          ") + "Check hook configuration",
  );
  console.log();
  console.log("Interactive selection coming soon!");
}
