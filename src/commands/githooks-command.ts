import { colors } from "../utils/ui.ts";
import { GitHookManager } from "../utils/githook-manager.ts";
import { exists } from "@std/fs";
import { join } from "@std/path";

export interface GitHooksOptions {
  path?: string;
  install?: boolean;
  uninstall?: boolean;
  list?: boolean;
  enable?: string;
  disable?: string;
  enableAll?: boolean;
  disableAll?: boolean;
  test?: boolean | string;
  force?: boolean;
  help?: boolean;
}

/**
 * Git hooks management command for Aichaku
 * Installs and manages git hooks in the .aichaku-githooks/ directory
 */
export async function runGitHooksCommand(options: GitHooksOptions): Promise<void> {
  // Show help if requested
  if (options.help) {
    showGitHooksHelp();
    return;
  }

  const projectPath = options.path || Deno.cwd();

  // Check if this is a git repository
  if (!await exists(join(projectPath, ".git"))) {
    console.error(colors.red("❌ Error: Not a git repository"));
    console.log("Please run this command from the root of a git repository");
    Deno.exit(1);
  }

  const manager = new GitHookManager(projectPath);

  // Handle installation
  if (options.install) {
    console.log(colors.blue("🪝 Aichaku Git Hooks Installer\n"));

    if (await manager.isInstalled()) {
      console.log(colors.yellow("⚠️  Git hooks are already installed"));
      console.log("Use --uninstall first to remove existing hooks");
      Deno.exit(1);
    }

    console.log("Installing git hooks to: .aichaku-githooks/");
    console.log("This will:");
    console.log("  • Create .aichaku-githooks/ directory");
    console.log("  • Copy hook templates");
    console.log("  • Set git core.hooksPath to .aichaku-githooks");
    console.log("");

    await manager.install({ force: options.force });

    console.log("\nNext steps:");
    console.log("  1. Review the hooks: aichaku githooks --list");
    console.log("  2. Test the hooks: aichaku githooks --test");
    console.log("  3. Commit your changes");

    if (!options.force) {
      console.log("\n💡 Tip: For security checks, also install:");
      console.log("  • Aichaku MCP server: aichaku mcp --install");
      console.log("  • Bridge server for external tools");
    }

    return;
  }

  // Handle uninstallation
  if (options.uninstall) {
    if (!await manager.isInstalled()) {
      console.log(colors.yellow("⚠️  Git hooks are not installed"));
      Deno.exit(0);
    }

    console.log(colors.blue("🗑️  Uninstalling git hooks..."));
    await manager.uninstall();
    return;
  }

  // Check if hooks are installed for other operations
  if (!await manager.isInstalled()) {
    console.error(colors.red("❌ Git hooks are not installed"));
    console.log("\nTo install: aichaku githooks --install");
    Deno.exit(1);
  }

  // Handle listing
  if (options.list) {
    const hooks = await manager.list();

    if (hooks.length === 0) {
      console.log(colors.yellow("No hooks found"));
      return;
    }

    console.log(colors.blue("🪝 Installed Git Hooks:\n"));

    // Group by category
    const categories = new Map<string, typeof hooks>();
    for (const hook of hooks) {
      if (!categories.has(hook.category)) {
        categories.set(hook.category, []);
      }
      categories.get(hook.category)!.push(hook);
    }

    // Display by category
    for (const [category, categoryHooks] of categories) {
      console.log(colors.bold(`${category.charAt(0).toUpperCase() + category.slice(1)}:`));
      for (const hook of categoryHooks) {
        const status = hook.enabled ? colors.green("✓") : colors.gray("○");
        const name = hook.enabled ? colors.white(hook.name) : colors.gray(hook.name);
        console.log(`  ${status} ${name} - ${colors.gray(hook.description)}`);
      }
      console.log("");
    }

    const enabledCount = hooks.filter((h) => h.enabled).length;
    console.log(colors.gray(`${enabledCount} of ${hooks.length} hooks enabled`));

    if (enabledCount === 0) {
      console.log("\n💡 Enable all hooks: aichaku githooks --enable-all");
    }

    return;
  }

  // Handle enable/disable operations
  if (options.enable) {
    await manager.enable(options.enable);
    return;
  }

  if (options.disable) {
    await manager.disable(options.disable);
    return;
  }

  if (options.enableAll) {
    await manager.enableAll();
    return;
  }

  if (options.disableAll) {
    await manager.disableAll();
    return;
  }

  // Handle testing
  if (options.test !== undefined) {
    const hookName = typeof options.test === "string" ? options.test : undefined;
    await manager.test(hookName);
    return;
  }

  // Default: show status
  const hooks = await manager.list();
  const enabledCount = hooks.filter((h) => h.enabled).length;

  console.log(colors.blue("🪝 Git Hooks Status"));
  console.log(`\nInstalled: ${colors.green("Yes")}`);
  console.log(`Location: .aichaku-githooks/`);
  console.log(`Enabled hooks: ${enabledCount} of ${hooks.length}`);

  console.log("\nAvailable commands:");
  console.log("  --list        List all hooks and their status");
  console.log("  --enable-all  Enable all hooks");
  console.log("  --test        Test run all enabled hooks");
  console.log("  --uninstall   Remove git hooks");
}

function showGitHooksHelp(): void {
  console.log(colors.blue("🪝 Aichaku Git Hooks Management"));
  console.log("\nManage git hooks for code quality and security checks");
  console.log("\nUsage: aichaku githooks [options]");
  console.log("\nOptions:");
  console.log("  --install         Install git hooks to the project");
  console.log("  --uninstall       Remove git hooks from the project");
  console.log("  --list            List all hooks and their status");
  console.log("  --enable <hook>   Enable a specific hook");
  console.log("  --disable <hook>  Disable a specific hook");
  console.log("  --enable-all      Enable all hooks");
  console.log("  --disable-all     Disable all hooks");
  console.log("  --test [hook]     Test run hook(s) without committing");
  console.log("  --force           Force installation even if conflicts exist");
  console.log("  --path <path>     Project path (defaults to current directory)");
  console.log("  --help            Show this help message");
  console.log("\nExamples:");
  console.log("  aichaku githooks --install       # Install hooks");
  console.log("  aichaku githooks --list           # List all hooks");
  console.log("  aichaku githooks --enable-all     # Enable all hooks");
  console.log("  aichaku githooks --test           # Test all enabled hooks");
  console.log("  aichaku githooks --disable 05-type-check  # Disable type checking hook");
}

export default runGitHooksCommand;
