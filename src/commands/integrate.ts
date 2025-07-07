import { exists } from "jsr:@std/fs@1";
import { join, resolve } from "jsr:@std/path@1";

interface IntegrateOptions {
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
}

interface IntegrateResult {
  success: boolean;
  path: string;
  message?: string;
  action?: "created" | "updated" | "skipped";
  lineNumber?: number;
}

const METHODOLOGY_SECTION = `## 🎯 MANDATORY: Aichaku Integration Rules

YOU ARE REQUIRED TO FOLLOW THESE RULES WITHOUT EXCEPTION:

### 1. AUTOMATIC Document Creation Behavior

**YOU MUST ALWAYS:**
✅ Create ALL documents in: \`.claude/output/active-YYYY-MM-DD-{descriptive-name}/\`
✅ Create STATUS.md FIRST for every new project
✅ Update STATUS.md after EVERY significant action
✅ Read methodology guides from \`~/.claude/methodologies/\`

**YOU MUST NEVER:**
❌ Create documents in the project root directory
❌ Create documents in .claude/user/ (that's for customizations)
❌ Ask the user where to put files
❌ Wait for permission to create standard documents

### 2. AUTOMATIC Methodology Activation

When you hear these keywords, IMMEDIATELY create the appropriate structure and documents:

**Planning Keywords** → Create in \`.claude/output/active-*/\`:
- "shape"/"pitch" → Read \`~/.claude/methodologies/shape-up/SHAPE-UP-AICHAKU-GUIDE.md\` → Create pitch.md
- "sprint"/"scrum" → Read \`~/.claude/methodologies/scrum/SCRUM-AICHAKU-GUIDE.md\` → Create sprint-planning.md
- "kanban"/"board" → Read \`~/.claude/methodologies/kanban/KANBAN-AICHAKU-GUIDE.md\` → Create kanban-board.md
- "mvp"/"lean" → Read \`~/.claude/methodologies/lean/LEAN-AICHAKU-GUIDE.md\` → Create experiment-plan.md

**ALWAYS** read the mode guide first:
- Planning: \`~/.claude/methodologies/core/PLANNING-MODE.md\`
- Execution: \`~/.claude/methodologies/core/EXECUTION-MODE.md\`
- Improvement: \`~/.claude/methodologies/core/IMPROVEMENT-MODE.md\`

### 3. Project Lifecycle Management

**Starting Work:**
1. Create: \`.claude/output/active-YYYY-MM-DD-{descriptive-name}/\`
2. Create STATUS.md immediately
3. Read appropriate methodology guides
4. Create planning documents
5. WAIT for human approval before coding

**During Work:**
- Update STATUS.md regularly
- Create supporting documents freely
- Start responses with: "📍 Currently in [mode] working on [task]"

**Completing Work:**
1. Create CHANGE-LOG.md summarizing all changes
2. Rename folder: active-* → complete-*
3. Ask: "Work appears complete. Shall I commit and push?"
4. Use conventional commits: feat:/fix:/docs:/refactor:

### 4. Git Automation

When work is confirmed complete:
\`\`\`bash
git add .claude/output/[current-project]/
git commit -m "[type]: [description]

- [what was done]
- [key changes]"
git push origin [current-branch]
\`\`\`

### 5. Error Recovery

If you accidentally create a file in the wrong location:
1. Move it immediately: \`mv [file] .claude/output/active-*/\`
2. Update STATUS.md noting the correction
3. Continue without asking

REMEMBER: This is AUTOMATIC behavior. Users expect documents to appear in the right place without asking.

Methodologies: Shape Up, Scrum, Kanban, Lean, XP, Scrumban
Learn more: https://github.com/RickCogley/aichaku
`;

/**
 * Integrate Aichaku reference into project's CLAUDE.md
 *
 * @param options - Integration options
 * @returns Promise with integration result
 */
export async function integrate(
  options: IntegrateOptions = {},
): Promise<IntegrateResult> {
  const projectPath = resolve(options.projectPath || ".");
  const claudeMdPath = join(projectPath, "CLAUDE.md");

  if (options.dryRun) {
    const fileExists = await checkFileExists(claudeMdPath);
    console.log(
      `[DRY RUN] Would ${
        fileExists ? "update" : "create"
      } CLAUDE.md at: ${claudeMdPath}`,
    );
    if (fileExists) {
      console.log(
        "[DRY RUN] Would check if methodology section exists and add if missing",
      );
    } else {
      console.log(
        "[DRY RUN] Would create new CLAUDE.md with Aichaku methodology section",
      );
    }
    return {
      success: true,
      path: claudeMdPath,
      message: "Dry run completed. No files were modified.",
      action: "skipped",
    };
  }

  try {
    let action: "created" | "updated" | "skipped" = "skipped";

    if (await exists(claudeMdPath)) {
      // File exists - check if methodology section already present
      const content = await Deno.readTextFile(claudeMdPath);

      // Check if Aichaku is already mentioned
      if (content.includes("Aichaku") || content.includes("aichaku")) {
        if (!options.force) {
          return {
            success: true,
            path: claudeMdPath,
            message:
              "CLAUDE.md already contains Aichaku reference. Use --force to add anyway.",
            action: "skipped",
          };
        }
      }

      // Check if there's already a ## Methodologies section
      if (content.includes("## Methodologies")) {
        // Append to existing section
        const updatedContent = content.replace(
          /## Methodologies\n/,
          `## Methodologies\n\n${
            METHODOLOGY_SECTION.split("\n").slice(2).join("\n")
          }\n\n`,
        );
        await Deno.writeTextFile(claudeMdPath, updatedContent);
        action = "updated";
      } else {
        // Add new section after the first paragraph or at the beginning
        const lines = content.split("\n");
        let insertIndex = 0;

        // Find the first empty line after initial content
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("#")) {
            // Found a section, insert before it
            insertIndex = i;
            break;
          }
        }

        if (insertIndex === 0) {
          // No sections found, append at end
          await Deno.writeTextFile(
            claudeMdPath,
            content + "\n\n" + METHODOLOGY_SECTION,
          );
        } else {
          // Insert before the first section
          lines.splice(insertIndex, 0, "", METHODOLOGY_SECTION, "");
          await Deno.writeTextFile(claudeMdPath, lines.join("\n"));
        }
        action = "updated";
      }

      // Console output removed - CLI handles messaging
    } else {
      // Create new CLAUDE.md
      const defaultContent = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this project.

${METHODOLOGY_SECTION}

## Project Overview

[Add your project-specific information here]
`;

      await Deno.writeTextFile(claudeMdPath, defaultContent);
      action = "created";

      // Console output removed - CLI handles messaging
    }

    // Find line number where we added the content
    const fileContent = await Deno.readTextFile(claudeMdPath);
    const lines = fileContent.split("\n");
    let lineNumber = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("## Methodologies")) {
        lineNumber = i + 1;
        break;
      }
    }

    return {
      success: true,
      path: claudeMdPath,
      message: `${
        action === "created" ? "Created new" : "Updated"
      } project CLAUDE.md`,
      action,
      lineNumber,
    };
  } catch (error) {
    return {
      success: false,
      path: claudeMdPath,
      message: `Failed to integrate: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

async function checkFileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
