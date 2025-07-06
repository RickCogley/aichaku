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
}

const METHODOLOGY_SECTION = `## Methodologies

This project uses the globally installed Aichaku adaptive methodology system. Claude Code will automatically blend methodologies based on natural language:

- Say "sprint" for Scrum practices
- Say "shape" for Shape Up principles  
- Say "kanban board" for flow visualization
- Say "MVP" for Lean approaches

The methodologies are installed globally in ~/.claude/methodologies/ and will adapt to how you naturally talk about work.
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
    console.log(`[DRY RUN] Would ${fileExists ? "update" : "create"} CLAUDE.md at: ${claudeMdPath}`);
    if (fileExists) {
      console.log("[DRY RUN] Would check if methodology section exists and add if missing");
    } else {
      console.log("[DRY RUN] Would create new CLAUDE.md with Aichaku methodology section");
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
            message: "CLAUDE.md already contains Aichaku reference. Use --force to add anyway.",
            action: "skipped",
          };
        }
      }
      
      // Check if there's already a ## Methodologies section
      if (content.includes("## Methodologies")) {
        // Append to existing section
        const updatedContent = content.replace(
          /## Methodologies\n/,
          `## Methodologies\n\n${METHODOLOGY_SECTION.split('\n').slice(2).join('\n')}\n\n`
        );
        await Deno.writeTextFile(claudeMdPath, updatedContent);
        action = "updated";
      } else {
        // Add new section after the first paragraph or at the beginning
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the first empty line after initial content
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('#')) {
            // Found a section, insert before it
            insertIndex = i;
            break;
          }
        }
        
        if (insertIndex === 0) {
          // No sections found, append at end
          await Deno.writeTextFile(claudeMdPath, content + "\n\n" + METHODOLOGY_SECTION);
        } else {
          // Insert before the first section
          lines.splice(insertIndex, 0, "", METHODOLOGY_SECTION, "");
          await Deno.writeTextFile(claudeMdPath, lines.join('\n'));
        }
        action = "updated";
      }
      
      if (!options.silent) {
        console.log("📝 Updated existing CLAUDE.md with Aichaku methodology section");
      }
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
      
      if (!options.silent) {
        console.log("📝 Created new CLAUDE.md with Aichaku methodology section");
      }
    }

    return {
      success: true,
      path: claudeMdPath,
      message: `Successfully ${action} CLAUDE.md with Aichaku reference`,
      action,
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