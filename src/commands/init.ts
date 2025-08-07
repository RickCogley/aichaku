import { ensureDir, exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchCore, fetchMethodologies, fetchStandards } from "./content-fetcher.ts";
import { ensureAichakuDirs, getAichakuPaths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { Brand } from "../utils/branded-messages.ts";

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
 * Initialize Aichaku globally or in a project
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
      console.log("  - .aichaku.json (metadata)");
    } else {
      console.log(`[DRY RUN] Would initialize project at: ${targetPath}`);
      console.log("[DRY RUN] Would create:");
      console.log("  - user/ (project customization directory)");
      console.log("  - .aichaku-project (marker file)");
      console.log("[DRY RUN] Would prompt to integrate with CLAUDE.md");
    }
    return {
      success: true,
      path: targetPath,
      message: "Dry run completed. No files were modified.",
    };
  }

  // For project init, check if global exists first
  if (!isGlobal) {
    const globalExists = await exists(paths.global.config);
    if (!globalExists) {
      return {
        success: false,
        path: targetPath,
        message: "🪴 Aichaku: Please install Aichaku globally first: aichaku init --global",
        action: "error",
      };
    }
  }

  // Check if already initialized
  const aichakuJsonPath = isGlobal ? paths.global.config : "";
  const projectMarkerPath = isGlobal ? "" : paths.project.config;

  if (
    isGlobal && aichakuJsonPath && await exists(aichakuJsonPath) &&
    !options.force
  ) {
    return {
      success: false,
      path: targetPath,
      message: `🪴 Aichaku: Already initialized globally. Use --force to reinstall or 'aichaku upgrade' to update.`,
      action: "exists",
    };
  }

  if (
    !isGlobal && projectMarkerPath && await exists(projectMarkerPath) &&
    !options.force
  ) {
    return {
      success: false,
      path: targetPath,
      message: `🪴 Aichaku: Project already initialized. Use --force to reinitialize.`,
      action: "exists",
    };
  }

  try {
    if (!options.silent) {
      if (isGlobal) {
        console.log(Brand.welcome(VERSION));
      } else {
        console.log(Brand.checkingRequirements());
        const globalMetadata = JSON.parse(
          await Deno.readTextFile(paths.global.config),
        );
        Brand.success(`Global installation found (v${globalMetadata.version})`);
        Brand.progress("Creating project structure...", "new");
      }
    }

    // Create target directory and ensure all required directories exist
    await ensureAichakuDirs();

    // Global install: Copy all methodologies
    // Project install: Just create user dir
    // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted and controlled by runtime
    const isJSR = import.meta.url.startsWith("https://jsr.io") ||
      !import.meta.url.includes("/aichaku/");

    if (isGlobal) {
      // Check if methodologies already exist
      const methodologiesPath = paths.global.methodologies;
      const methodologiesExist = await exists(methodologiesPath);

      // Only copy/fetch methodologies for global install if they don't exist or force is used
      if (!methodologiesExist || options.force) {
        if (isJSR) {
          // Fetch from GitHub when running from JSR - use global root path
          const fetchSuccess = await fetchMethodologies(
            paths.global.methodologies,
            VERSION,
            {
              silent: options.silent,
              overwrite: options.force, // Only overwrite if user explicitly uses --force
            },
          );

          if (!fetchSuccess) {
            throw new Error(
              "Failed to fetch methodologies. Check network permissions.",
            );
          }
        } else {
          // Local development - copy from source
          // codeql[js/path-injection] Safe because path is derived from import.meta.url and uses relative hardcoded path
          const sourceMethodologies = join(
            new URL(".", import.meta.url).pathname,
            "../../../docs/methodologies",
          );
          const targetMethodologies = paths.global.methodologies;

          if (!options.silent) {
            Brand.progress("Installing adaptive methodologies...", "active");
          }

          await copy(sourceMethodologies, targetMethodologies, {
            overwrite: options.force,
          });
        }
      }

      // Check if standards already exist
      const standardsPath = paths.global.standards;
      const standardsExist = await exists(standardsPath);

      // Only copy/fetch standards for global install if they don't exist or force is used
      if (!standardsExist || options.force) {
        if (isJSR) {
          // Fetch from GitHub when running from JSR - use global root path
          if (!options.silent) {
            Brand.progress("Installing standards library...", "active");
          }

          const fetchSuccess = await fetchStandards(
            paths.global.standards,
            VERSION,
            {
              silent: options.silent,
              overwrite: options.force,
            },
          );

          if (!fetchSuccess) {
            throw new Error(
              "Failed to fetch standards. Check network permissions.",
            );
          }
        } else {
          // Local development - copy from source
          const sourceStandards = join(
            new URL(".", import.meta.url).pathname,
            "../../../docs/standards",
          );
          const targetStandards = paths.global.standards;

          if (!options.silent) {
            Brand.progress("Installing standards library...", "active");
          }

          await copy(sourceStandards, targetStandards, {
            overwrite: options.force,
          });
        }

        if (!options.silent) {
          Brand.success("Standards library installed");
        }
      }

      // Check if core content already exists
      const corePath = paths.global.core;
      const coreExists = await exists(corePath);

      // Only copy/fetch core content for global install if they don't exist or force is used
      if (!coreExists || options.force) {
        if (isJSR) {
          // Fetch from GitHub when running from JSR - use global root path
          if (!options.silent) {
            Brand.progress("Installing core templates...", "active");
          }

          const fetchSuccess = await fetchCore(
            paths.global.core,
            VERSION,
            {
              silent: options.silent,
              overwrite: options.force,
            },
          );

          if (!fetchSuccess) {
            throw new Error(
              "Failed to fetch core templates. Check network permissions.",
            );
          }
        } else {
          // Local development - copy from source
          const sourceCore = join(
            new URL(".", import.meta.url).pathname,
            "../../../docs/core",
          );
          const targetCore = paths.global.core;

          if (!options.silent) {
            Brand.progress("Installing core templates...", "active");
          }

          await copy(sourceCore, targetCore, {
            overwrite: options.force,
          });
        }

        if (!options.silent) {
          Brand.success("Core templates installed");

          // Count available agents
          const agentTemplatesPath = join(paths.global.core, "agent-templates");
          let agentCount = 0;
          try {
            for await (const entry of Deno.readDir(agentTemplatesPath)) {
              if (entry.isDirectory) {
                agentCount++;
              }
            }
            if (agentCount > 0) {
              Brand.info(`🤖 Installed ${agentCount} Aichaku agents (aichaku-deno-expert, aichaku-test-expert, etc.)`);
              Brand.info(`   These will be available when you run 'aichaku integrate' in a project`);
            }
          } catch {
            // Silent fail if can't count agents
          }
        }
      }
    }

    // Create user directory structure
    const userDir = join(targetPath, "user");
    await ensureDir(join(userDir, "prompts"));
    await ensureDir(join(userDir, "templates"));
    await ensureDir(join(userDir, "methods"));

    // Create user README
    const userReadmePath = join(userDir, "README.md");
    await Deno.writeTextFile(userReadmePath, getUserReadmeContent(isGlobal));

    // Create .gitkeep files
    await Deno.writeTextFile(join(userDir, "prompts", ".gitkeep"), "");
    await Deno.writeTextFile(join(userDir, "templates", ".gitkeep"), "");
    await Deno.writeTextFile(join(userDir, "methods", ".gitkeep"), "");

    if (!options.silent) {
      Brand.success("Created user customization directory");
    }

    // Create output directory structure (only for projects)
    if (!isGlobal) {
      const outputDir = paths.project.output;
      await ensureDir(outputDir);

      // Create output README
      const outputReadmePath = join(outputDir, "README.md");
      await Deno.writeTextFile(outputReadmePath, getOutputReadmeContent());
    }

    // Prompt for app description (for both global and project init)
    if (!options.silent) {
      await promptForAppDescription(targetPath, isGlobal);
    }

    // Create behavioral reinforcement files
    const aichakuBehaviorPath = join(targetPath, ".aichaku-behavior");
    await Deno.writeTextFile(aichakuBehaviorPath, getBehaviorContent());

    // RULES-REMINDER.md removed as part of architecture consolidation
    // Legacy file creation eliminated per senior engineer audit

    if (!options.silent) {
      if (!isGlobal) {
        Brand.success("Created output directory and behavioral guides");
      } else {
        Brand.success("Created behavioral guides");
      }
    }

    // Create metadata file
    if (isGlobal && aichakuJsonPath) {
      // Global: Create config file with methodology selection
      const selectedMethodologies = await promptForMethodologies(options.silent);
      const selectedStandards = await promptForStandards(options.silent);

      const metadata = {
        version: VERSION,
        initializedAt: new Date().toISOString(),
        installationType: "global",
        lastUpgrade: null,
        methodologies: {
          selected: selectedMethodologies,
          default: selectedMethodologies[0] || "shape-up",
        },
        standards: {
          selected: selectedStandards,
        },
      };
      await Deno.writeTextFile(
        aichakuJsonPath,
        JSON.stringify(metadata, null, 2),
      );
    } else if (!isGlobal && projectMarkerPath) {
      // Project: Create project config file
      const globalMetadata = JSON.parse(
        await Deno.readTextFile(paths.global.config),
      );
      const projectMetadata = {
        version: VERSION,
        globalVersion: globalMetadata.version,
        createdAt: new Date().toISOString(),
        customizations: {
          userDir: "./user",
        },
        // Inherit methodologies from global by default
        methodologies: globalMetadata.methodologies || {
          selected: ["shape-up"],
          default: "shape-up",
        },
        standards: globalMetadata.standards || {
          selected: [],
        },
      };
      await Deno.writeTextFile(
        projectMarkerPath,
        JSON.stringify(projectMetadata, null, 2),
      );
    }

    // For project init, prompt for methodology selection
    if (!isGlobal && !options.silent) {
      // First, prompt for methodology selection
      console.log(
        "\n📚 Which methodology would you like to use as default?",
      );
      console.log("   Available methodologies:");
      console.log("   1. Shape Up (6-week cycles, complex features)");
      console.log("   2. Scrum (2-4 week sprints, predictable delivery)");
      console.log("   3. Kanban (Continuous flow, ongoing support)");
      console.log("   4. Lean (MVP focus, new products)");
      console.log("   5. XP (Code quality, pair programming)");
      console.log("   6. Scrumban (Hybrid approach)");
      console.log("\n[1-6, default=1]: ");

      const methodologyBuf = new Uint8Array(1024);
      const methodologyN = await Deno.stdin.read(methodologyBuf);
      const methodologyChoice = new TextDecoder().decode(methodologyBuf.subarray(0, methodologyN || 0)).trim();

      const methodologyMap: Record<string, string> = {
        "1": "shape-up",
        "2": "scrum",
        "3": "kanban",
        "4": "lean",
        "5": "xp",
        "6": "scrumban",
      };

      const selectedMethodology = methodologyMap[methodologyChoice] || "shape-up";

      // Update the project metadata with the selected methodology
      const projectMarkerPath = join(targetPath, "aichaku.json");
      const projectMetadata = JSON.parse(await Deno.readTextFile(projectMarkerPath));
      projectMetadata.methodologies = {
        selected: [selectedMethodology],
        default: selectedMethodology,
      };
      await Deno.writeTextFile(
        projectMarkerPath,
        JSON.stringify(projectMetadata, null, 2),
      );

      Brand.success(`Selected ${selectedMethodology} as default methodology`);

      // Then prompt for CLAUDE.md integration
      console.log(
        "\n🤔 Would you like to add Aichaku to this project's CLAUDE.md?",
      );
      console.log("   This helps Claude Code understand your methodologies.");
      console.log("\n[Y/n]: ");

      const buf = new Uint8Array(1024);
      const n = await Deno.stdin.read(buf);
      const answer = new TextDecoder().decode(buf.subarray(0, n || 0)).trim()
        .toLowerCase();

      if (answer === "" || answer === "y" || answer === "yes") {
        Brand.progress("Updating CLAUDE.md...", "active");

        // Import integrate function and run it
        const { integrate } = await import("./integrate.ts");
        const integrateResult = await integrate({
          projectPath,
          silent: true,
        });

        if (integrateResult.success) {
          Brand.success("CLAUDE.md updated with Aichaku reference");
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      message: isGlobal ? Brand.completed("Global installation") : Brand.completed("Project initialization"),
      globalDetected: !isGlobal,
      action: "created",
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: Brand.errorWithSolution(
        `${isGlobal ? "Global installation" : "Project initialization"} failed`,
        `${error instanceof Error ? error.message : String(error)}`,
      ),
      action: "error",
    };
  }
}

function getUserReadmeContent(isGlobal: boolean): string {
  const scope = isGlobal ? "Global" : "Project";
  return `# Aichaku ${scope} Customizations

This directory is yours to customize Aichaku's behavior. Files here are never modified during upgrades.

## Directory Structure

\`\`\`
user/
├── prompts/      # Custom AI prompts
├── templates/    # Custom document templates  
└── methods/      # Custom methodology extensions
\`\`\`

## How to Customize

### 1. Custom Prompts (prompts/)

Add files that extend or override default prompts:

**Example: prompts/standup-casual.md**
\`\`\`markdown
When conducting daily standups, use a more casual tone.
Focus on blockers and collaboration opportunities.
Keep updates brief and action-oriented.
\`\`\`

### 2. Custom Templates (templates/)

Add document templates for your organization:

**Example: templates/change-control.md**
\`\`\`markdown
# Change Control Document

**Change ID**: CC-{date}-{number}
**Requestor**: 
**Date**: 
**Impact**: Low | Medium | High

## Change Description

## Business Justification

## Technical Details

## Rollback Plan

## Approvals
- [ ] Technical Lead
- [ ] Product Owner
- [ ] Operations
\`\`\`

### 3. Custom Methods (methods/)

Extend methodologies with your practices:

**Example: methods/code-review-checklist.md**
\`\`\`markdown
## Code Review Checklist

Before marking PR as ready:
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Security considerations noted
- [ ] Performance impact assessed
- [ ] Breaking changes documented
\`\`\`

## Methodology Blending

You can influence how Aichaku blends methodologies:

**Example: methods/blending-preferences.md**
\`\`\`markdown
## Our Methodology Preferences

- Prefer Scrum terminology for ceremonies
- Use Shape Up for feature planning
- Apply XP practices for development
- Kanban for operational work
\`\`\`

## Organization-Specific Terms

Define your organization's vocabulary:

**Example: methods/vocabulary.md**
\`\`\`markdown
## Our Terms

- "Sprint" = 2-week iteration (not 3 weeks)
- "Epic" = Major feature (3-6 sprints)
- "Spike" = Research task (timeboxed)
- "Ship It Day" = Our hack day (monthly)
\`\`\`

## Tips

1. **Start small** - Add customizations as needs arise
2. **Document why** - Help future team members understand
3. **Share patterns** - If something works well, document it
4. **Iterate** - Refine based on what helps your team

## Need Ideas?

- Look at your team's recurring questions
- Document decisions that keep coming up
- Capture templates you use repeatedly
- Note terminology that's unique to your org

Remember: These customizations make Aichaku work better for YOUR team.
`;
}

function getOutputReadmeContent(): string {
  return `# Aichaku Project Documentation

This directory contains all project documentation organized by status and date.

## Structure

- \`active/\` - Currently ongoing work
- \`done/\` - Completed projects

## Naming Convention

\`YYYY-MM-DD-[descriptive-kebab-case-name]\`

Examples:
- active/2025-01-07-user-authentication
- active/2025-01-07-fix-performance-issues
- done/2025-01-06-global-project-redesign

## What Goes Here

Each project directory should contain:
- STATUS.md - Current status and progress (ALWAYS create this first)
- Planning documents (pitches, specs, backlogs)
- Progress updates
- Metrics and reviews
- CHANGE-LOG.md - Summary when complete

## For Claude Code

When users discuss new work, IMMEDIATELY create a new active-* directory here.
Don't wait to be asked. This is expected behavior.

### Quick Reference
- User says "let's shape X" → Create active-YYYY-MM-DD-shape-X/
- User says "plan sprint" → Create active-YYYY-MM-DD-sprint-planning/
- User says "fix bug" → Create active-YYYY-MM-DD-fix-[bug-description]/
`;
}

function getBehaviorContent(): string {
  return `# 🎯 Quick Reference for Claude Code

## Before ANY work:
1. Check docs/projects/active/ for existing project directories
2. Create new YYYY-MM-DD-{name} directory for new work
3. ALWAYS create STATUS.md first
4. Read methodology guides from ~/.claude/aichaku/methodologies/

## Key Behaviors:
✅ Documents ALWAYS go in docs/projects/active/*/
✅ Update STATUS.md after each work session
✅ Create documents without asking permission
✅ Move to docs/projects/done/ when complete

❌ NEVER create documents in project root
❌ NEVER use .claude/user/ for output
❌ NEVER wait for permission to create standard docs
❌ NEVER proceed with implementation without approval

## Project Structure:
- docs/projects/active/ → Work in progress
- docs/projects/done/ → Completed work

IMPORTANT: Creating proper structure is AUTOMATIC, not optional.
`;
}

// getRulesReminderContent function removed as part of architecture consolidation
// Legacy file creation eliminated per senior engineer audit

async function promptForMethodologies(silent?: boolean): Promise<string[]> {
  if (silent) {
    return ["shape-up"]; // Default to shape-up
  }

  console.log("\n🎯 Select your primary methodology:");
  console.log("   We recommend starting with one methodology.\n");

  console.log("1. 🏔️  Shape Up - 6-week cycles, complex features");
  console.log("2. 🏃  Scrum - Sprints, predictable delivery");
  console.log("3. 📊  Kanban - Continuous flow, ongoing support");
  console.log("4. 🚀  Lean Startup - MVPs, new products");
  console.log("5. 🔄  Scrumban - Hybrid approach");
  console.log("6. 💡  XP - Extreme Programming, code quality");

  console.log("\nEnter numbers (comma-separated, e.g., 1,2) [1]: ");

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  const answer = new TextDecoder().decode(buf.subarray(0, n || 0)).trim();

  const methodologyMap: Record<string, string> = {
    "1": "shape-up",
    "2": "scrum",
    "3": "kanban",
    "4": "lean",
    "5": "scrumban",
    "6": "xp",
  };

  if (!answer || answer === "") {
    return ["shape-up"]; // Default
  }

  const selections = answer.split(",").map((s) => s.trim());
  const selected: string[] = [];

  for (const selection of selections) {
    if (methodologyMap[selection]) {
      selected.push(methodologyMap[selection]);
    }
  }

  // If nothing valid selected, default to shape-up
  if (selected.length === 0) {
    selected.push("shape-up");
  }

  Brand.success(`Selected methodologies: ${selected.join(", ")}`);
  return selected;
}

async function promptForStandards(silent?: boolean): Promise<string[]> {
  if (silent) {
    return ["conventional-commits", "test-pyramid", "nist-csf"]; // Sensible defaults
  }

  console.log("\n📏 Select your standards:");
  console.log("   Standards help ensure quality and consistency.\n");

  console.log("1. 📝  Conventional Commits - Structured commit messages");
  console.log("2. 🔺  Test Pyramid - Testing strategy");
  console.log("3. 🔒  NIST CSF - Security framework");
  console.log("4. 🏗️  Clean Architecture - Code organization");
  console.log("5. 📚  Diataxis + Google - Documentation style");
  console.log("6. 🧪  TDD - Test-Driven Development");
  console.log("7. 🌐  OWASP Top 10 - Web security");
  console.log("8. 🔧  SOLID - OOP principles");
  console.log("9. 📊  DORA - DevOps metrics");

  console.log("\nEnter numbers (comma-separated) [1,2,3]: ");

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  const answer = new TextDecoder().decode(buf.subarray(0, n || 0)).trim();

  const standardsMap: Record<string, string> = {
    "1": "conventional-commits",
    "2": "test-pyramid",
    "3": "nist-csf",
    "4": "clean-arch",
    "5": "diataxis-google",
    "6": "tdd",
    "7": "owasp-web",
    "8": "solid",
    "9": "dora",
  };

  if (!answer || answer === "") {
    return ["conventional-commits", "test-pyramid", "nist-csf"]; // Defaults
  }

  const selections = answer.split(",").map((s) => s.trim());
  const selected: string[] = [];

  for (const selection of selections) {
    if (standardsMap[selection]) {
      selected.push(standardsMap[selection]);
    }
  }

  // If nothing valid selected, use defaults
  if (selected.length === 0) {
    selected.push("conventional-commits", "test-pyramid", "nist-csf");
  }

  Brand.success(`Selected standards: ${selected.join(", ")}`);
  return selected;
}

async function promptForAppDescription(targetPath: string, isGlobal: boolean): Promise<void> {
  console.log("\n📝 Would you like to describe your application for better Claude Code context?");
  console.log("   This helps Claude understand your tech stack, architecture, and business domain.");
  console.log("\n[Y/n]: ");

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  const answer = new TextDecoder().decode(buf.subarray(0, n || 0)).trim().toLowerCase();

  if (answer === "" || answer === "y" || answer === "yes") {
    console.log("\n🔍 What type of application is this?");
    console.log("1. Web Application (React, Vue, etc.)");
    console.log("2. API Service (REST, GraphQL, microservice)");
    console.log("3. Static Site (Blog, docs, marketing)");
    console.log("4. CLI Tool (Command line application)");
    console.log("5. General/Other");
    console.log("\n[1-5, default=5]: ");

    const typeBuf = new Uint8Array(1024);
    const typeN = await Deno.stdin.read(typeBuf);
    const typeChoice = new TextDecoder().decode(typeBuf.subarray(0, typeN || 0)).trim();

    const appTypeMap: Record<string, string> = {
      "1": "web-app",
      "2": "api-service",
      "3": "static-site",
      "4": "cli-tool",
      "5": "base",
    };

    const selectedType = appTypeMap[typeChoice] || "base";
    const templateName = selectedType === "base" ? "base" : selectedType;

    // Copy the appropriate template
    try {
      Brand.progress("Creating app description template...", "active");

      const userDir = join(targetPath, "user");
      const appDescPath = join(userDir, "app-description.yaml");

      // Check if running from JSR or local
      // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted
      const isJSR = import.meta.url.startsWith("https://jsr.io") ||
        !import.meta.url.includes("/aichaku/");

      if (isJSR) {
        // Fetch template from GitHub
        const templateUrl =
          `https://raw.githubusercontent.com/RickCogley/aichaku/v${VERSION}/docs/core/templates/app-descriptions/${templateName}-template.yaml`;

        try {
          const response = await fetch(templateUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.statusText}`);
          }
          const templateContent = await response.text();
          await Deno.writeTextFile(appDescPath, templateContent);
        } catch {
          // Fallback to basic template if fetch fails
          await Deno.writeTextFile(appDescPath, getBasicAppDescriptionTemplate());
          Brand.warning("Using basic template (network fetch failed)");
        }
      } else {
        // Local development - copy from source
        const sourceTemplate = join(
          new URL(".", import.meta.url).pathname,
          "../../../docs/core/templates/app-descriptions",
          `${templateName}-template.yaml`,
        );

        try {
          await copy(sourceTemplate, appDescPath);
        } catch {
          // Fallback to basic template if file not found
          await Deno.writeTextFile(appDescPath, getBasicAppDescriptionTemplate());
        }
      }

      Brand.success(
        `Created ${
          isGlobal ? "~/.claude/aichaku" : ".claude/aichaku"
        }/user/app-description.yaml (${selectedType} template)`,
      );

      console.log("\n📝 Next steps:");
      console.log(
        `1. Edit ${isGlobal ? "~/.claude/aichaku" : ".claude/aichaku"}/user/app-description.yaml to describe your app`,
      );
      console.log("2. Run 'aichaku integrate' to update your CLAUDE.md");
      console.log("3. See the template for examples and documentation");
      console.log("\n💡 Tip: The app description helps Claude Code understand your specific tech stack,");
      console.log("   architecture patterns, and business domain.");
    } catch (error) {
      Brand.warning(
        `Could not create app description template: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

function getBasicAppDescriptionTemplate(): string {
  return `# Aichaku App Description
# This file helps Claude Code understand your specific application context
# Fill out the sections that apply to your application

application:
  # === BASIC INFORMATION (Required) ===
  name: "My Application"  # Your application name
  type: "web-application" # web-application, api-service, cli-tool, mobile-app, desktop-app, library
  description: "Brief description of what this application does"
  version: "1.0.0"
  
  # === TECHNOLOGY STACK ===
  stack:
    language: "typescript"
    runtime: "node"
    framework: "express"
    database: "postgresql"
    
  # === ARCHITECTURE ===
  architecture:
    pattern: "monolith"  # monolith, microservices, serverless, jamstack
    
  # === API (if applicable) ===
  api:
    style: "rest"  # rest, graphql, grpc
    authentication: "jwt"
    
  # === SECURITY ===
  security:
    standards: ["owasp-web"]
    authentication:
      primary: "email-password"
      
  # === DEVELOPMENT PRACTICES ===
  practices:
    testing:
      frameworks: ["jest"]
      strategies: ["tdd"]
    version_control:
      branching: "git-flow"
      commit_style: "conventional-commits"

# Remove sections that don't apply
# See full template for more options
`;
}
