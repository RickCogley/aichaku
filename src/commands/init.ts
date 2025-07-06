import { ensureDir, exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";
import { copy } from "jsr:@std/fs@1/copy";
import { VERSION } from "../../mod.ts";
import { fetchMethodologies } from "./methodology-fetcher.ts";

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
}

/**
 * Initialize Aichaku with all methodologies
 *
 * @param options - Initialization options
 * @returns Promise with initialization result
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
  const isGlobal = options.global || false;
  const targetPath = isGlobal
    ? join(Deno.env.get("HOME") || "", ".claude")
    : resolve(options.projectPath || "./.claude");

  // Check if already initialized
  const aichakuJsonPath = join(targetPath, ".aichaku.json");
  if (await exists(aichakuJsonPath) && !options.force) {
    return {
      success: false,
      path: targetPath,
      message:
        `Aichaku is already initialized at ${targetPath}. Use --force to reinitialize or 'aichaku upgrade' to update.`,
    };
  }

  if (options.dryRun) {
    console.log(`[DRY RUN] Would initialize Aichaku at: ${targetPath}`);
    console.log("[DRY RUN] Would create:");
    console.log("  - methodologies/ (all methodology files)");
    console.log("  - user/ (customization directory)");
    console.log("  - .aichaku.json (metadata)");
    return {
      success: true,
      path: targetPath,
      message: "Dry run completed. No files were modified.",
    };
  }

  try {
    // Check if global Aichaku exists
    const globalPath = join(Deno.env.get("HOME") || "", ".claude");
    const globalAichakuExists = !isGlobal &&
      await exists(join(globalPath, ".aichaku.json"));

    // Create target directory
    await ensureDir(targetPath);

    // Copy all methodologies
    const isJSR = import.meta.url.startsWith("https://jsr.io");

    if (isJSR) {
      // Fetch from GitHub when running from JSR
      await fetchMethodologies(targetPath, VERSION, { silent: options.silent });
    } else {
      // Local development - copy from source
      const sourceMethodologies = join(
        new URL(".", import.meta.url).pathname,
        "../../../methodologies",
      );
      const targetMethodologies = join(targetPath, "methodologies");

      if (!options.silent) {
        console.log("\n🔄 Initializing adaptive methodologies...");
      }

      await copy(sourceMethodologies, targetMethodologies, {
        overwrite: options.force,
      });
    }

    // Create user directory structure
    const userDir = join(targetPath, "user");
    await ensureDir(join(userDir, "prompts"));
    await ensureDir(join(userDir, "templates"));
    await ensureDir(join(userDir, "methods"));

    // Create user README
    const userReadmePath = join(userDir, "README.md");
    await Deno.writeTextFile(userReadmePath, getUserReadmeContent());

    // Create .gitkeep files
    await Deno.writeTextFile(join(userDir, "prompts", ".gitkeep"), "");
    await Deno.writeTextFile(join(userDir, "templates", ".gitkeep"), "");
    await Deno.writeTextFile(join(userDir, "methods", ".gitkeep"), "");

    // Create .aichaku.json
    const metadata = {
      version: VERSION,
      initializedAt: new Date().toISOString(),
      installationType: isGlobal ? "global" : "local",
      lastUpgrade: null,
      globalAichakuDetected: globalAichakuExists,
    };
    await Deno.writeTextFile(
      aichakuJsonPath,
      JSON.stringify(metadata, null, 2),
    );

    return {
      success: true,
      path: targetPath,
      message: `Initialized at ${targetPath}`,
      globalDetected: globalAichakuExists,
    };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      message: `Installation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

function getUserReadmeContent(): string {
  return `# Aichaku User Customizations

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
