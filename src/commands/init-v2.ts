import { ensureDir, exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchMethodologies, fetchStandards } from "./content-fetcher.ts";
import { ensureAichakuDirs, getAichakuPaths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { Brand } from "../utils/branded-messages.ts";
import {
  ConfigManager,
  createDefaultConfig,
  getProjectConfig,
  globalConfig,
} from "../utils/config-manager.ts";

/**
 * Options for initializing Aichaku
 * @public
 */
interface InitOptions {
  /** Initialize globally in ~/.claude instead of current project */
  global?: boolean;
  /** Project path for local initialization (defaults to current directory) */
  projectPath?: string;
  /** Force overwrite existing initialization */
  force?: boolean;
  /** Suppress output messages */
  silent?: boolean;
  /** Preview what would be done without making changes */
  dryRun?: boolean;
}

/**
 * Result of initialization operation
 * @public
 */
interface InitResult {
  /** Whether initialization succeeded */
  success: boolean;
  /** Path where Aichaku was initialized */
  path: string;
  /** Optional message describing the result */
  message?: string;
  /** Whether global installation was detected */
  globalDetected?: boolean;
  /** Action that was taken */
  action?: "created" | "exists" | "error";
}

/**
 * Initialize Aichaku globally or in a project (v2 with ConfigManager)
 *
 * This command sets up Aichaku for use with Claude. Global installation is required
 * before project-specific initialization can be done.
 *
 * **Global initialization** (`--global`):
 * - Installs all methodologies to ~/.claude/
 * - Downloads standards library
 * - Creates user customization directory
 * - Required before any project initialization
 *
 * **Project initialization** (default):
 * - Creates minimal .claude/ structure in project
 * - References global methodologies
 * - Creates project-specific customization area
 * - Requires global installation first
 *
 * @param {InitOptions} options - Initialization options
 * @returns {Promise<InitResult>} Result indicating success and what was done
 *
 * @example
 * ```ts
 * // First time setup - install globally
 * await init({ global: true });
 *
 * // Initialize in a project
 * await init({ projectPath: "/path/to/project" });
 *
 * // Preview what would be done
 * await init({ dryRun: true });
 *
 * // Force reinstall
 * await init({ global: true, force: true });
 * ```
 *
 * @public
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
  const isGlobal = options.global || false;
  const paths = getAichakuPaths();
  // Security: Use safe project path resolution
  const projectPath = resolveProjectPath(options.projectPath);

  // Use centralized path management
  const targetPath = isGlobal ? paths.global.root : paths.project.root;
  const _globalPath = paths.global.root;

  // Check for dry-run first, before any filesystem checks
  if (options.dryRun) {
    if (isGlobal) {
      console.log(
        `[DRY RUN] Would initialize global Aichaku at: ${targetPath}`,
      );
      console.log("[DRY RUN] Would create:");
      console.log("  - methodologies/ (all methodology files)");
      console.log("  - user/ (global customization directory)");
      console.log("  - aichaku.json (consolidated configuration)");
      console.log("[DRY RUN] Would download content from GitHub");
    } else {
      console.log(
        `[DRY RUN] Would initialize Aichaku project at: ${projectPath}`,
      );
      console.log("[DRY RUN] Would create:");
      console.log("  - .claude/aichaku/aichaku.json (project configuration)");
      console.log("  - .claude/aichaku/user/ (project customizations)");
      console.log("  - docs/projects/active/ (project documentation)");
    }
    return {
      success: true,
      path: targetPath,
      message: "Dry run completed. No files were created.",
    };
  }

  // For project init, check if global is installed first
  if (!isGlobal) {
    // Check using ConfigManager
    let globalExists = false;
    try {
      await globalConfig.load();
      globalExists = globalConfig.isAichakuProject();
    } catch {
      globalExists = false;
    }

    if (!globalExists) {
      return {
        success: false,
        path: projectPath,
        message: Brand.errorWithSolution(
          "Global installation required",
          "Run 'aichaku init --global' first to install Aichaku globally.",
        ),
        globalDetected: false,
      };
    }
  }

  // Check if already initialized
  const configManager = isGlobal ? globalConfig : getProjectConfig(targetPath);
  let alreadyInitialized = false;

  try {
    await configManager.load();
    alreadyInitialized = configManager.isAichakuProject();
  } catch {
    // Not initialized yet, which is fine
  }

  if (alreadyInitialized && !options.force) {
    if (!options.silent) {
      console.log(
        `🪴 Aichaku is already initialized at ${targetPath}. Use --force to reinitialize.`,
      );
    }
    return {
      success: true,
      path: targetPath,
      message: "Already initialized",
      action: "exists",
    };
  }

  try {
    if (!options.silent) {
      Brand.header(isGlobal ? "Global Setup" : "Project Setup");
    }

    // Ensure all required directories exist
    await ensureAichakuDirs();

    if (isGlobal) {
      // Global initialization
      if (!options.silent) {
        Brand.progress("Creating directory structure...", "active");
      }

      // Create directory structure
      await ensureDir(paths.global.root);
      await ensureDir(paths.global.methodologies);
      await ensureDir(paths.global.standards);
      await ensureDir(paths.global.user.root);
      await ensureDir(paths.global.user.methodologies);
      await ensureDir(paths.global.user.standards);
      await ensureDir(paths.global.user.templates);
      await ensureDir(paths.global.user.config);

      if (!options.silent) {
        Brand.success("Directory structure created");
      }

      // Copy or fetch methodologies
      if (!options.silent) {
        Brand.progress("Installing methodologies...", "active");
      }

      // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted and controlled by runtime
      const isJSR = import.meta.url.startsWith("https://jsr.io");

      let methodologySuccess = false;
      if (isJSR) {
        // Fetch from GitHub when running from JSR
        methodologySuccess = await fetchMethodologies(
          paths.global.root,
          VERSION,
          {
            silent: options.silent,
          },
        );
      } else {
        // Local development - copy from source
        const sourceMethodologies = join(
          new URL(".", import.meta.url).pathname,
          "../../../docs/methodologies",
        );
        if (await exists(sourceMethodologies)) {
          await copy(sourceMethodologies, paths.global.methodologies);
          methodologySuccess = true;
        }
      }

      if (!methodologySuccess) {
        throw new Error(
          "Failed to install methodologies. Check network permissions.",
        );
      }

      if (!options.silent) {
        Brand.success("Methodologies installed");
      }

      // Install standards library
      if (!options.silent) {
        Brand.progress("Installing standards library...", "active");
      }

      let standardsSuccess = false;
      if (isJSR) {
        // Fetch from GitHub when running from JSR
        standardsSuccess = await fetchStandards(paths.global.root, VERSION, {
          silent: options.silent,
        });
      } else {
        // Local development - copy from source
        const sourceStandards = join(
          new URL(".", import.meta.url).pathname,
          "../../../standards",
        );
        if (await exists(sourceStandards)) {
          await copy(sourceStandards, paths.global.standards);
          standardsSuccess = true;
        }
      }

      if (!standardsSuccess) {
        throw new Error(
          "Failed to install standards. Check network permissions.",
        );
      }

      if (!options.silent) {
        Brand.success("Standards library installed");
      }

      // Create or update configuration
      const config = createDefaultConfig("global");
      config.project.installedVersion = VERSION;
      config.project.created = new Date().toISOString();
      config.project.installationType = "global";

      // Save configuration
      const configPath = join(paths.global.root, "aichaku.json");
      await Deno.writeTextFile(
        configPath,
        JSON.stringify(config, null, 2),
      );

      if (!options.silent) {
        Brand.completed("Global Aichaku initialization");
        console.log(
          "\n💡 Next: Navigate to a project and run 'aichaku init' to set it up",
        );
      }
    } else {
      // Project initialization
      if (!options.silent) {
        Brand.progress("Setting up project structure...", "active");
      }

      // Create project directories
      await ensureDir(paths.project.root);
      await ensureDir(join(paths.project.root, "user"));
      await ensureDir(paths.project.output);
      await ensureDir(paths.project.active);

      // Create or update project configuration
      const config = createDefaultConfig("project");
      config.project.installedVersion = VERSION;
      config.project.created = new Date().toISOString();
      config.project.installationType = "local";

      // Save configuration
      const configPath = join(paths.project.root, "aichaku.json");
      await Deno.writeTextFile(
        configPath,
        JSON.stringify(config, null, 2),
      );

      if (!options.silent) {
        Brand.success("Project structure created");
      }

      // Check if CLAUDE.md exists
      const claudeMdPath = join(projectPath, "CLAUDE.md");
      const hasClaudeMd = await exists(claudeMdPath);

      if (!hasClaudeMd && !options.silent) {
        Brand.info(
          "No CLAUDE.md found - run 'aichaku integrate' to add Aichaku directives",
        );
      }

      if (!options.silent) {
        Brand.completed("Project Aichaku initialization");
        if (!hasClaudeMd) {
          console.log(
            "\n💡 Next: Run 'aichaku integrate' to add Aichaku directives to your project",
          );
        } else {
          console.log(
            "\n💡 Aichaku is ready! Claude will now recognize methodology commands in this project.",
          );
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      action: "created",
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: Brand.errorWithSolution(
        "Initialization failed",
        error instanceof Error ? error.message : String(error),
      ),
      action: "error",
    };
  }
}
