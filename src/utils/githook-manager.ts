import { exists } from "@std/fs";
import { dirname, join } from "@std/path";
import { ensureDir } from "@std/fs";
import { colors } from "./ui.ts";

export interface GitHook {
  name: string;
  path: string;
  description: string;
  enabled: boolean;
  category: "formatting" | "linting" | "security" | "testing" | "quality";
}

export class GitHookManager {
  private projectPath: string;
  private hooksDir: string;
  private templatesDir: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.hooksDir = join(projectPath, ".aichaku-githooks");
    this.templatesDir = join(dirname(dirname(dirname(import.meta.url))), "docs", "core", "githook-templates")
      .replace("file://", "");
  }

  /**
   * Check if git hooks are already installed in the project
   */
  async isInstalled(): Promise<boolean> {
    return await exists(this.hooksDir);
  }

  /**
   * Check for existing git hooks that might conflict
   */
  async checkConflicts(): Promise<{ hasConflicts: boolean; details: string[] }> {
    const conflicts: string[] = [];

    // Check for .githooks directory
    if (await exists(join(this.projectPath, ".githooks"))) {
      conflicts.push(".githooks directory already exists (possible conflict)");
    }

    // Check for .git/hooks directory with custom hooks
    const gitHooksPath = join(this.projectPath, ".git", "hooks");
    if (await exists(gitHooksPath)) {
      // Check if core.hooksPath is set
      try {
        const process = new Deno.Command("git", {
          args: ["config", "--get", "core.hooksPath"],
          cwd: this.projectPath,
          stdout: "piped",
          stderr: "piped",
        });
        const { stdout } = await process.output();
        const hooksPath = new TextDecoder().decode(stdout).trim();
        if (hooksPath && hooksPath !== ".aichaku-githooks") {
          conflicts.push(`Git core.hooksPath is set to: ${hooksPath}`);
        }
      } catch {
        // No core.hooksPath set, which is fine
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      details: conflicts,
    };
  }

  /**
   * Install git hooks to the project
   */
  async install(options: { force?: boolean } = {}): Promise<void> {
    // Check for conflicts unless force is specified
    if (!options.force) {
      const { hasConflicts, details } = await this.checkConflicts();
      if (hasConflicts) {
        console.log(colors.yellow("⚠️  Potential conflicts detected:"));
        details.forEach((detail) => console.log(`   ${detail}`));
        console.log("\nUse --force to install anyway, or resolve conflicts manually.");
        Deno.exit(1);
      }
    }

    // Create .aichaku-githooks directory structure
    await ensureDir(join(this.hooksDir, "hooks.d"));
    await ensureDir(join(this.hooksDir, "lib"));

    // Copy hooks from templates
    await this.copyHooksFromTemplates();

    // Set git core.hooksPath
    await this.setGitHooksPath();

    console.log(colors.green("✅ Git hooks installed successfully!"));
    console.log("\n" + colors.yellow("Note: Test hook (30-run-tests) is disabled by default"));
    console.log("      Tests often have issues that block releases unnecessarily.");
    console.log("      Enable only if your tests are stable: aichaku githooks --enable 30-run-tests");
    console.log("\nTo enable/disable specific hooks:");
    console.log("  • Enable:  aichaku githooks --enable HOOK_NAME");
    console.log("  • Disable: aichaku githooks --disable HOOK_NAME");
    console.log("  • Enable all: aichaku githooks --enable-all");
    console.log("\nTo uninstall: aichaku githooks --uninstall");
  }

  /**
   * Copy hook templates to project
   */
  private async copyHooksFromTemplates(): Promise<void> {
    // Copy pre-commit orchestrator
    const preCommitTemplate = join(this.templatesDir, "pre-commit");
    const preCommitDest = join(this.hooksDir, "pre-commit");

    if (await exists(preCommitTemplate)) {
      const content = await Deno.readTextFile(preCommitTemplate);
      // Update paths in the pre-commit script to use .aichaku-githooks
      const updatedContent = content
        .replace(/\.githooks\//g, ".aichaku-githooks/")
        .replace(/HOOKS_DIR="\.githooks\/hooks\.d"/, 'HOOKS_DIR=".aichaku-githooks/hooks.d"')
        .replace(/LIB_DIR="\.githooks\/lib"/, 'LIB_DIR=".aichaku-githooks/lib"');
      await Deno.writeTextFile(preCommitDest, updatedContent);
      await Deno.chmod(preCommitDest, 0o755);
    }

    // Copy common library
    const commonTemplate = join(this.templatesDir, "lib", "common.sh");
    const commonDest = join(this.hooksDir, "lib", "common.sh");

    if (await exists(commonTemplate)) {
      const content = await Deno.readTextFile(commonTemplate);
      await Deno.writeTextFile(commonDest, content);
    }

    // Copy individual hooks
    const hooksDir = join(this.templatesDir, "hooks.d");
    if (await exists(hooksDir)) {
      for await (const entry of Deno.readDir(hooksDir)) {
        if (entry.isFile) {
          const sourcePath = join(hooksDir, entry.name);
          const destPath = join(this.hooksDir, "hooks.d", entry.name);
          const content = await Deno.readTextFile(sourcePath);
          // Update any paths in hooks to use .aichaku-githooks
          const updatedContent = content.replace(/\.githooks\//g, ".aichaku-githooks/");
          await Deno.writeTextFile(destPath, updatedContent);

          // Make hook executable by default EXCEPT for test hook
          // Test hook (30-run-tests) is disabled by default due to common test issues
          if (entry.name === "30-run-tests") {
            await Deno.chmod(destPath, 0o644); // Not executable
          } else {
            await Deno.chmod(destPath, 0o755); // Executable
          }
        }
      }
    }
  }

  /**
   * Set git core.hooksPath configuration
   */
  private async setGitHooksPath(): Promise<void> {
    const process = new Deno.Command("git", {
      args: ["config", "core.hooksPath", ".aichaku-githooks"],
      cwd: this.projectPath,
    });
    await process.output();
  }

  /**
   * Uninstall git hooks from the project
   */
  async uninstall(): Promise<void> {
    // Remove git core.hooksPath setting
    const process = new Deno.Command("git", {
      args: ["config", "--unset", "core.hooksPath"],
      cwd: this.projectPath,
    });
    await process.output();

    // Remove .aichaku-githooks directory
    if (await exists(this.hooksDir)) {
      await Deno.remove(this.hooksDir, { recursive: true });
    }

    console.log(colors.green("✅ Git hooks uninstalled successfully!"));
  }

  /**
   * List all available hooks and their status
   */
  async list(): Promise<GitHook[]> {
    const hooks: GitHook[] = [];
    const hooksDir = join(this.hooksDir, "hooks.d");

    if (!await exists(hooksDir)) {
      return hooks;
    }

    for await (const entry of Deno.readDir(hooksDir)) {
      if (entry.isFile) {
        const hookPath = join(hooksDir, entry.name);
        const stat = await Deno.stat(hookPath);
        const isExecutable = (stat.mode ?? 0) & 0o111;

        // Parse hook metadata from comments
        const content = await Deno.readTextFile(hookPath);
        const descMatch = content.match(/^#\s*(.+?)(?:\s*-\s*(.+))?$/m);
        const description = descMatch ? descMatch[2] || descMatch[1] : "No description";

        // Categorize based on hook name
        let category: GitHook["category"] = "quality";
        if (entry.name.includes("format")) category = "formatting";
        else if (entry.name.includes("lint")) category = "linting";
        else if (entry.name.includes("security") || entry.name.includes("owasp")) category = "security";
        else if (entry.name.includes("test")) category = "testing";

        hooks.push({
          name: entry.name,
          path: hookPath,
          description,
          enabled: isExecutable > 0,
          category,
        });
      }
    }

    return hooks.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Enable a specific hook
   */
  async enable(hookName: string): Promise<void> {
    const hookPath = join(this.hooksDir, "hooks.d", hookName);
    if (!await exists(hookPath)) {
      throw new Error(`Hook not found: ${hookName}`);
    }
    await Deno.chmod(hookPath, 0o755);
    console.log(colors.green(`✅ Enabled hook: ${hookName}`));
  }

  /**
   * Disable a specific hook
   */
  async disable(hookName: string): Promise<void> {
    const hookPath = join(this.hooksDir, "hooks.d", hookName);
    if (!await exists(hookPath)) {
      throw new Error(`Hook not found: ${hookName}`);
    }
    await Deno.chmod(hookPath, 0o644);
    console.log(colors.yellow(`⏸️  Disabled hook: ${hookName}`));
  }

  /**
   * Enable all hooks
   */
  async enableAll(): Promise<void> {
    const hooks = await this.list();
    for (const hook of hooks) {
      if (!hook.enabled) {
        await Deno.chmod(hook.path, 0o755);
      }
    }
    console.log(colors.green(`✅ Enabled all ${hooks.length} hooks`));
  }

  /**
   * Disable all hooks
   */
  async disableAll(): Promise<void> {
    const hooks = await this.list();
    for (const hook of hooks) {
      if (hook.enabled) {
        await Deno.chmod(hook.path, 0o644);
      }
    }
    console.log(colors.yellow(`⏸️  Disabled all ${hooks.length} hooks`));
  }

  /**
   * Test run a specific hook
   */
  async test(hookName?: string): Promise<void> {
    if (hookName) {
      const hookPath = join(this.hooksDir, "hooks.d", hookName);
      if (!await exists(hookPath)) {
        throw new Error(`Hook not found: ${hookName}`);
      }

      console.log(colors.blue(`🧪 Testing hook: ${hookName}`));
      const process = new Deno.Command(hookPath, {
        cwd: this.projectPath,
        stdout: "inherit",
        stderr: "inherit",
      });
      const { code } = await process.output();

      if (code === 0) {
        console.log(colors.green(`✅ Hook ${hookName} passed`));
      } else {
        console.log(colors.red(`❌ Hook ${hookName} failed with code ${code}`));
      }
    } else {
      // Test all enabled hooks
      const hooks = await this.list();
      const enabledHooks = hooks.filter((h) => h.enabled);

      console.log(colors.blue(`🧪 Testing ${enabledHooks.length} enabled hooks...`));

      for (const hook of enabledHooks) {
        console.log(`\n▶️  Testing ${hook.name}...`);
        const process = new Deno.Command(hook.path, {
          cwd: this.projectPath,
          stdout: "inherit",
          stderr: "inherit",
        });
        const { code } = await process.output();

        if (code === 0) {
          console.log(colors.green(`  ✅ ${hook.name} passed`));
        } else {
          console.log(colors.red(`  ❌ ${hook.name} failed with code ${code}`));
        }
      }
    }
  }
}
