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

### 1. Discussion-First Document Creation

**Phase 1: DISCUSSION MODE (Default when methodology keywords detected)**
✅ Acknowledge the methodology context: "🪴 Aichaku: I see you're thinking about [topic]"
✅ Ask clarifying questions to understand the goal
✅ Help shape and refine the idea
❌ DO NOT create any project folders yet
❌ DO NOT create any documents yet

**Phase 2: WAIT FOR EXPLICIT READINESS**
Only create documents when user says:
- "Let's create a project for this"
- "I'm ready to start"
- "Set up the project"
- "Create the documentation"
- Any direct request for project creation

**Phase 3: CREATE NAMED PROJECT (After user signals readiness)**
✅ Confirm name: "🪴 Aichaku: Based on our discussion, creating project: [descriptive-name]"
✅ Create ALL documents in: \`.claude/output/active-YYYY-MM-DD-{descriptive-name}/\`
✅ Create STATUS.md FIRST
✅ Create methodology-specific documents
✅ Read guides from \`~/.claude/methodologies/\`

**YOU MUST NEVER:**
❌ Create documents in the project root directory
❌ Create documents in .claude/user/ (that's for customizations)
❌ Ask where to put files (always use .claude/output/)
❌ Create folders before user is ready to formalize

### 2. CRITICAL: DISCUSSION FIRST, THEN CREATE WITHOUT ASKING

**During Discussion Phase:**
✅ DO say: "🪴 Aichaku: I understand you're exploring [topic]. Let me help you think through this..."
✅ DO say: "What specific challenges are you looking to address?"
❌ NEVER say: "Would you like me to create documents for this?"

**Once User Signals Readiness:**
❌ NEVER say: "Would you like me to..."
❌ NEVER say: "Shall I create..."
❌ NEVER say: "Should I go ahead and..."
✅ IMMEDIATELY say: "🪴 Aichaku: Creating project: [descriptive-name]"
✅ IMMEDIATELY say: "Setting up Shape Up documentation..."
✅ IMMEDIATELY say: "Generating sprint planning templates..."

**THE RULE:** Discuss and refine FIRST. Once user signals readiness, CREATE IMMEDIATELY without asking. This provides thoughtful structure while respecting user autonomy.

### 3. Methodology Detection & Discussion

When you hear these keywords, ENTER DISCUSSION MODE:

**Planning Keywords** → Will create in \`.claude/output/active-*/\` (when ready):
- "shape"/"pitch" → Discuss Shape Up approach → Later: pitch.md
- "sprint"/"scrum" → Discuss Scrum planning → Later: sprint-planning.md
- "kanban"/"board" → Discuss Kanban flow → Later: kanban-board.md
- "mvp"/"lean" → Discuss Lean experiments → Later: experiment-plan.md

**Discussion Mode Actions:**
1. Acknowledge: "🪴 Aichaku: I see you're interested in [methodology]"
2. Read the appropriate guide SILENTLY:
   - \`~/.claude/methodologies/[methodology]/[METHODOLOGY]-AICHAKU-GUIDE.md\`
   - \`~/.claude/methodologies/core/[MODE].md\`
3. Ask clarifying questions based on the methodology
4. Help refine the approach
5. WAIT for explicit "create project" signal

### 4. Visual Identity & Progress Indicators

**MANDATORY Visual Identity:**
✅ ALWAYS prefix Aichaku messages with: 🪴 Aichaku:
✅ Use growth phase indicators: 🌱 (new) → 🌿 (active) → 🌳 (mature) → 🍃 (complete)
✅ Show current phase in status updates with **bold** text and arrow: [Planning] → [**Executing**] → [Complete]
                                                                                    ▲

**Example Status Display:**
\`\`\`
🪴 Aichaku: Shape Up Progress
[Shaping] → [**Betting**] → [Building] → [Cool-down]
              ▲
Week 2/6 ████████░░░░░░░░░░░░ 33% 🌿
\`\`\`

**Methodology Icons:**
- Shape Up: Use 🎯 for betting, 🔨 for building
- Scrum: Use 🏃 for sprints, 📋 for backlog
- Kanban: Use 📍 for cards, 🌊 for flow
- Lean: Use 🧪 for experiments, 📊 for metrics

**NEVER:**
❌ Use garden metaphors in text (no "planting", "growing", "harvesting")
❌ Mix visual indicators (keep consistent within a project)
❌ Overuse emojis (maximum one per concept)

### 5. Mermaid Diagram Integration

**MANDATORY Diagram Creation:**
✅ Include Mermaid diagrams in EVERY project documentation
✅ Add methodology-specific workflow diagrams
✅ Use diagrams to visualize project status

**Required Diagrams by Document:**

**In STATUS.md:**
\`\`\`mermaid
graph LR
    A[🌱 Started] --> B[🌿 Active]
    B --> C[🌳 Review]
    C --> D[🍃 Complete]
    style B fill:#90EE90
\`\`\`

**In Shape Up pitch.md:**
\`\`\`mermaid
graph TD
    A[Problem] --> B[Appetite: 6 weeks]
    B --> C[Solution Outline]
    C --> D[Rabbit Holes]
    D --> E[No-gos]
\`\`\`

**In Scrum sprint-planning.md:**
\`\`\`mermaid
gantt
    title Sprint 15 Timeline
    dateFormat  YYYY-MM-DD
    section Sprint
    Planning          :done, 2025-07-07, 1d
    Development       :active, 2025-07-08, 8d
    Review & Retro    :2025-07-16, 2d
\`\`\`

**NEVER:**
❌ Create diagrams without labels
❌ Use complex diagrams when simple ones work
❌ Forget to update diagrams with status changes

### 6. Project Lifecycle Management

**Starting Work:**
1. Create: \`.claude/output/active-YYYY-MM-DD-{descriptive-name}/\`
2. Create STATUS.md immediately (with status diagram)
3. Read appropriate methodology guides
4. Create planning documents (with workflow diagrams)
5. WAIT for human approval before coding

**During Work:**
- Update STATUS.md regularly (including diagram state)
- Create supporting documents freely
- Start responses with: "🪴 Aichaku: Currently in [mode] working on [task]"

**Completing Work:**
1. Create YYYY-MM-DD-{Project-Name}-CHANGE-LOG.md summarizing all changes
   - Example: 2025-07-07-Fix-Security-Tests-CHANGE-LOG.md
   - Example: 2025-07-07-Update-Authentication-CHANGE-LOG.md
   - NEVER just "CHANGE-LOG.md" - always include date and descriptive project name
2. Update final diagram states
3. Rename folder: active-* → done-*
4. Ask: "Work appears complete. Shall I commit and push?"
5. Use conventional commits: feat:/fix:/docs:/refactor:

### 7. Git Automation

When work is confirmed complete:
\`\`\`bash
git add .claude/output/[current-project]/
git commit -m "[type]: [description]

- [what was done]
- [key changes]"
git push origin [current-branch]
\`\`\`

### 8. Error Recovery

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
