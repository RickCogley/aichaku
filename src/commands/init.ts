import { ensureDir, exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchMethodologies, fetchStandards } from "./content-fetcher.ts";

interface InitOptions {
  global?: boolean;
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
}

interface InitResult {
  success: boolean;
  path: string;
  message?: string;
  globalDetected?: boolean;
  action?: "created" | "exists" | "error";
}

/**
 * Initialize Aichaku - globally or in a project
 *
 * Global: Installs all methodologies to ~/.claude/
 * Project: Creates minimal structure and references global
 *
 * @param options - Initialization options
 * @returns Promise with initialization result
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
  const isGlobal = options.global || false;
  const home = Deno.env.get("HOME") || "";
  // codeql[js/path-injection] Safe because paths are validated and constrained to .claude directory
  const globalPath = join(home, ".claude");
  const projectPath = resolve(options.projectPath || ".");
  // codeql[js/path-injection] Safe because targetPath is always within .claude directory structure
  const targetPath = isGlobal ? globalPath : join(projectPath, ".claude");

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
    const globalExists = await exists(join(globalPath, ".aichaku.json"));
    if (!globalExists) {
      return {
        success: false,
        path: targetPath,
        message: "Please install Aichaku globally first: aichaku init --global",
        action: "error",
      };
    }
  }

  // Check if already initialized
  // codeql[js/path-injection] Safe because targetPath is validated and file names are hardcoded
  const aichakuJsonPath = join(targetPath, ".aichaku.json");
  // codeql[js/path-injection] Safe because targetPath is validated and file names are hardcoded
  const projectMarkerPath = join(targetPath, ".aichaku-project");

  if (isGlobal && await exists(aichakuJsonPath) && !options.force) {
    return {
      success: false,
      path: targetPath,
      message:
        `Global Aichaku already initialized. Use --force to reinstall or 'aichaku upgrade' to update.`,
      action: "exists",
    };
  }

  if (!isGlobal && await exists(projectMarkerPath) && !options.force) {
    return {
      success: false,
      path: targetPath,
      message: `Project already initialized. Use --force to reinitialize.`,
      action: "exists",
    };
  }

  try {
    if (!options.silent) {
      if (isGlobal) {
        console.log("\n🌍 Installing Aichaku globally...");
      } else {
        console.log("\n🔍 Checking requirements...");
        const globalMetadata = JSON.parse(
          await Deno.readTextFile(join(globalPath, ".aichaku.json")),
        );
        console.log(`✓ Global Aichaku found (v${globalMetadata.version})`);
        console.log("\n📁 Creating project structure...");
      }
    }

    // Create target directory
    await ensureDir(targetPath);

    // Global install: Copy all methodologies
    // Project install: Just create user dir
    // codeql[js/incomplete-url-substring-sanitization] Safe because import.meta.url is trusted and controlled by runtime
    const isJSR = import.meta.url.startsWith("https://jsr.io");

    if (isGlobal) {
      // Check if methodologies already exist
      // codeql[js/path-injection] Safe because targetPath is validated and "methodologies" is hardcoded
      const methodologiesPath = join(targetPath, "methodologies");
      const methodologiesExist = await exists(methodologiesPath);

      // Only copy/fetch methodologies for global install if they don't exist or force is used
      if (!methodologiesExist || options.force) {
        if (isJSR) {
          // Fetch from GitHub when running from JSR
          const fetchSuccess = await fetchMethodologies(targetPath, VERSION, {
            silent: options.silent,
            overwrite: options.force, // Only overwrite if user explicitly uses --force
          });

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
            "../../../methodologies",
          );
          // codeql[js/path-injection] Safe because targetPath is validated and "methodologies" is hardcoded
          const targetMethodologies = join(targetPath, "methodologies");

          if (!options.silent) {
            console.log("\n🔄 Installing adaptive methodologies...");
          }

          await copy(sourceMethodologies, targetMethodologies, {
            overwrite: options.force,
          });
        }
      }

      // Check if standards already exist
      const standardsPath = join(targetPath, "standards");
      const standardsExist = await exists(standardsPath);

      // Only copy/fetch standards for global install if they don't exist or force is used
      if (!standardsExist || options.force) {
        if (isJSR) {
          // Fetch from GitHub when running from JSR
          if (!options.silent) {
            console.log("\n🔄 Installing standards library...");
          }

          const fetchSuccess = await fetchStandards(targetPath, VERSION, {
            silent: options.silent,
            overwrite: options.force,
          });

          if (!fetchSuccess) {
            throw new Error(
              "Failed to fetch standards. Check network permissions.",
            );
          }
        } else {
          // Local development - copy from source
          const sourceStandards = join(
            new URL(".", import.meta.url).pathname,
            "../../../standards",
          );
          const targetStandards = join(targetPath, "standards");

          if (!options.silent) {
            console.log("\n🔄 Installing standards library...");
          }

          await copy(sourceStandards, targetStandards, {
            overwrite: options.force,
          });
        }

        if (!options.silent) {
          console.log("✓ Standards library installed");
        }
      }
    }

    // Create user directory structure
    // codeql[js/path-injection] Safe because targetPath is validated and subdirectory names are hardcoded
    const userDir = join(targetPath, "user");
    await ensureDir(join(userDir, "prompts"));
    await ensureDir(join(userDir, "templates"));
    await ensureDir(join(userDir, "methods"));

    // Create user README
    // codeql[js/path-injection] Safe because userDir is validated and "README.md" is hardcoded
    const userReadmePath = join(userDir, "README.md");
    await Deno.writeTextFile(userReadmePath, getUserReadmeContent(isGlobal));

    // Create .gitkeep files
    // codeql[js/path-injection] Safe because userDir is validated and all subdirectory/file names are hardcoded
    await Deno.writeTextFile(join(userDir, "prompts", ".gitkeep"), "");
    await Deno.writeTextFile(join(userDir, "templates", ".gitkeep"), "");
    await Deno.writeTextFile(join(userDir, "methods", ".gitkeep"), "");

    if (!options.silent) {
      console.log("✓ Created user customization directory");
    }

    // Create output directory structure (for both global and project)
    // codeql[js/path-injection] Safe because targetPath is validated and "output" is hardcoded
    const outputDir = join(targetPath, "output");
    await ensureDir(outputDir);

    // Create output README
    // codeql[js/path-injection] Safe because outputDir is validated and "README.md" is hardcoded
    const outputReadmePath = join(outputDir, "README.md");
    await Deno.writeTextFile(outputReadmePath, getOutputReadmeContent());

    // Create behavioral reinforcement files
    // codeql[js/path-injection] Safe because targetPath is validated and file names are hardcoded
    const aichakuBehaviorPath = join(targetPath, ".aichaku-behavior");
    await Deno.writeTextFile(aichakuBehaviorPath, getBehaviorContent());

    // codeql[js/path-injection] Safe because targetPath is validated and file names are hardcoded
    const rulesReminderPath = join(targetPath, "RULES-REMINDER.md");
    await Deno.writeTextFile(rulesReminderPath, getRulesReminderContent());

    if (!options.silent) {
      console.log("✓ Created output directory and behavioral guides");
    }

    // Create metadata file
    if (isGlobal) {
      // Global: Create .aichaku.json
      const metadata = {
        version: VERSION,
        initializedAt: new Date().toISOString(),
        installationType: "global",
        lastUpgrade: null,
      };
      await Deno.writeTextFile(
        aichakuJsonPath,
        JSON.stringify(metadata, null, 2),
      );
    } else {
      // Project: Create .aichaku-project marker
      // codeql[js/path-injection] Safe because globalPath is validated home/.claude and file name is hardcoded
      const globalMetadata = JSON.parse(
        await Deno.readTextFile(join(globalPath, ".aichaku.json")),
      );
      const projectMetadata = {
        version: VERSION,
        globalVersion: globalMetadata.version,
        createdAt: new Date().toISOString(),
        customizations: {
          userDir: "./user",
        },
      };
      await Deno.writeTextFile(
        projectMarkerPath,
        JSON.stringify(projectMetadata, null, 2),
      );
    }

    // For project init, prompt for integration
    if (!isGlobal && !options.silent) {
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
        console.log("\n✏️  Updating CLAUDE.md...");

        // Import integrate function and run it
        const { integrate } = await import("./integrate.ts");
        const integrateResult = await integrate({
          projectPath,
          silent: true,
        });

        if (integrateResult.success) {
          console.log("✓ CLAUDE.md updated with Aichaku reference");
        }
      }
    }

    return {
      success: true,
      path: targetPath,
      message: isGlobal
        ? `Global installation complete at ${targetPath}`
        : `Project initialized`,
      globalDetected: !isGlobal,
      action: "created",
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `${
        isGlobal ? "Global installation" : "Project initialization"
      } failed: ${error instanceof Error ? error.message : String(error)}`,
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
  return `# Aichaku Output Directory

This directory contains all project documentation organized by status and date.

## Structure

- \`active-*\` - Currently ongoing work
- \`complete-*\` - Successfully completed projects
- \`cancelled-*\` - Cancelled projects
- \`paused-*\` - Projects on hold

## Naming Convention

\`[status]-YYYY-MM-DD-[descriptive-kebab-case-name]\`

Examples:
- active-2025-01-07-user-authentication
- active-2025-01-07-fix-performance-issues
- complete-2025-01-06-global-project-redesign

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
1. Check .claude/output/ for existing active-* directories
2. Create new active-YYYY-MM-DD-{name} for new work
3. ALWAYS create STATUS.md first
4. Read methodology guides from ~/.claude/methodologies/

## Key Behaviors:
✅ Documents ALWAYS go in .claude/output/active-*/
✅ Update STATUS.md after each work session
✅ Create documents without asking permission
✅ Rename to complete-* when done

❌ NEVER create documents in project root
❌ NEVER use .claude/user/ for output
❌ NEVER wait for permission to create standard docs
❌ NEVER proceed with implementation without approval

## Status Transitions:
- active-* → Work in progress
- complete-* → Successfully finished
- cancelled-* → Work stopped
- paused-* → Temporarily on hold

IMPORTANT: Creating proper structure is AUTOMATIC, not optional.
`;
}

function getRulesReminderContent(): string {
  return `# 🚨 AICHAKU RULES REMINDER

## Before creating ANY file, check:

1. ✅ Is it going in \`.claude/output/active-*/\`?
2. ✅ Does STATUS.md exist there?
3. ✅ Have I updated STATUS.md recently?

If any answer is NO → FIX IT FIRST!

## Quick Fixes:

### Wrong location?
\`\`\`bash
mv [file] .claude/output/active-[current-project]/
\`\`\`

### No STATUS.md?
Create it immediately with project info.

### Not sure where to put files?
ALWAYS: \`.claude/output/active-YYYY-MM-DD-{project-name}/\`

## Remember:
- This is AUTOMATIC behavior
- Users expect files in the right place
- No asking, just doing
`;
}
