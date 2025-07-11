import { exists } from "jsr:@std/fs@1";
import { isAbsolute, join, normalize, resolve } from "jsr:@std/path@1";
import { paths } from "../paths.ts";
import { resolveProjectPath } from "../utils/project-paths.ts";
import { safeReadTextFile, safeStat } from "../utils/path-security.ts";

// Type definitions
interface ProjectStandardsConfig {
  version?: string;
  selected: string[];
}

/**
 * Validate path to prevent directory traversal
 * InfoSec: Ensures paths stay within intended directories
 */
function _validatePath(basePath: string, ...segments: string[]): string {
  // Validate each segment
  for (const segment of segments) {
    if (segment.includes("..") || isAbsolute(segment)) {
      throw new Error("Invalid path segment: potential directory traversal");
    }
  }

  const fullPath = join(basePath, ...segments);
  const normalized = normalize(fullPath);
  const resolvedBase = resolve(basePath);

  // Ensure the path stays within the base directory
  if (!normalized.startsWith(resolvedBase)) {
    throw new Error("Path traversal attempt detected");
  }

  return normalized;
}

/**
 * Load project standards configuration with validation
 */
async function loadProjectStandards(projectPath: string): Promise<string[]> {
  const aichakuPaths = paths.get();
  // Check new path first, then legacy path
  const newConfigPath = join(aichakuPaths.project.root, "standards.json");
  const legacyConfigPath = join(
    projectPath,
    ".claude",
    ".aichaku-standards.json",
  );

  let configPath = newConfigPath;
  if (!(await exists(newConfigPath)) && (await exists(legacyConfigPath))) {
    configPath = legacyConfigPath;
  }

  if (!(await exists(configPath))) {
    return [];
  }

  try {
    // Security: Use safe file reading with validated path
    const content = await safeReadTextFile(configPath, projectPath);
    const config = JSON.parse(content) as ProjectStandardsConfig;

    // Validate and sanitize
    if (!Array.isArray(config.selected)) {
      console.warn("Invalid standards configuration: expected array");
      return [];
    }

    return config.selected.filter(
      (id: unknown) => typeof id === "string" && id.length > 0,
    );
  } catch (_error) {
    console.warn("Failed to load project standards configuration");
    return [];
  }
}

/**
 * Load content for a specific standard with security validation
 * InfoSec: Validates standard IDs to prevent path injection
 */
async function loadStandardContent(
  standardId: string,
): Promise<{ content: string; isCustom: boolean; sourcePath?: string } | null> {
  // Validate standardId to prevent path injection
  if (!/^[a-z0-9-]+$/.test(standardId)) {
    console.warn(`Invalid standard ID format: ${standardId}`);
    return null;
  }

  const categoryMappings: Record<string, string> = {
    "owasp-web": "security",
    "nist-csf": "security",
    "gdpr": "security",
    "pci-dss": "security",
    "15-factor": "architecture",
    "ddd": "architecture",
    "clean-arch": "architecture",
    "microservices": "architecture",
    "google-style": "development",
    "conventional-commits": "development",
    "solid": "development",
    "tdd": "development",
    "bdd": "testing",
    "test-pyramid": "testing",
    "sre": "devops",
    "gitops": "devops",
    "dora": "devops",
  };

  const aichakuPaths = paths.get();

  // Check for custom standards first (user-defined)
  const customStandardPath = join(
    aichakuPaths.global.user.standards,
    `${standardId.toUpperCase()}.md`,
  );

  if (await exists(customStandardPath)) {
    try {
      // Security: Use safe file reading with validated path
      const content = await safeReadTextFile(customStandardPath, aichakuPaths.global.user.root);
      return {
        content,
        isCustom: true,
        sourcePath: customStandardPath,
      };
    } catch (_error) {
      console.warn(`Failed to load custom standard content for ${standardId}`);
    }
  }

  // If not a custom standard, check built-in standards
  const category = categoryMappings[standardId];
  if (!category) {
    return null;
  }

  // Use paths module to resolve standard path with backward compatibility
  try {
    const newStandardPath = join(
      aichakuPaths.global.standards,
      category,
      `${standardId}.md`,
    );
    const legacyStandardPath = join(
      aichakuPaths.legacy.globalStandards,
      category,
      `${standardId}.md`,
    );

    // Check new path first, then legacy path
    let standardPath = newStandardPath;
    if (
      !(await exists(newStandardPath)) && (await exists(legacyStandardPath))
    ) {
      standardPath = legacyStandardPath;
    }

    if (!(await exists(standardPath))) {
      return null;
    }

    // Security: Use safe file reading with validated path
    // Determine the base directory based on the path
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    const baseDir = standardPath.includes(aichakuPaths.legacy.globalStandards) 
      ? join(home, ".claude") // Legacy global base
      : aichakuPaths.global.root;
    const content = await safeReadTextFile(standardPath, baseDir);
    return {
      content,
      isCustom: false,
      sourcePath: standardPath,
    };
  } catch (_error) {
    console.warn(`Failed to load standard content for ${standardId}`);
    return null;
  }
}

/**
 * Generate standards section for CLAUDE.md
 */
async function generateStandardsSection(projectPath: string): Promise<string> {
  const selectedStandards = await loadProjectStandards(projectPath);

  if (selectedStandards.length === 0) {
    return "";
  }

  let standardsContent = `## 📚 Selected Standards & Guidelines

🪴 Aichaku: Based on your project configuration, follow these standards when generating code:

`;

  for (const standardId of selectedStandards) {
    const result = await loadStandardContent(standardId);
    if (result) {
      standardsContent += `### ${standardId.toUpperCase()}\n\n`;

      // Add source attribution for custom standards
      if (result.isCustom && result.sourcePath) {
        const aichakuPaths = paths.get();
        const displayPath = result.sourcePath.replace(
          aichakuPaths.global.user.standards,
          "~/.claude/aichaku/user/standards",
        );
        standardsContent += `*Custom Standard from: ${displayPath}*\n\n`;
      }

      standardsContent += result.content;
      standardsContent += "\n\n---\n\n";
    } else {
      standardsContent += `### ${standardId.toUpperCase()}\n\n`;
      standardsContent +=
        `Standard content not found. Please ensure the standard is properly installed.\n\n---\n\n`;
    }
  }

  return standardsContent;
}

/**
 * Load project documentation standards configuration with validation
 */
async function loadProjectDocStandards(projectPath: string): Promise<string[]> {
  const aichakuPaths = paths.get();
  // Check new path first, then legacy path
  const newConfigPath = join(aichakuPaths.project.root, "doc-standards.json");
  const legacyConfigPath = join(
    projectPath,
    ".claude",
    ".aichaku-doc-standards.json",
  );

  let configPath = newConfigPath;
  if (!(await exists(newConfigPath)) && (await exists(legacyConfigPath))) {
    configPath = legacyConfigPath;
  }

  if (!(await exists(configPath))) {
    return [];
  }

  try {
    // Security: Use safe file reading with validated path
    const content = await safeReadTextFile(configPath, projectPath);
    const config = JSON.parse(content) as ProjectStandardsConfig;

    // Validate and sanitize
    if (!Array.isArray(config.selected)) {
      console.warn(
        "Invalid documentation standards configuration: expected array",
      );
      return [];
    }

    return config.selected.filter(
      (id: unknown) => typeof id === "string" && id.length > 0,
    );
  } catch (_error) {
    console.warn(
      "Failed to load project documentation standards configuration",
    );
    return [];
  }
}

/**
 * Load content for a specific documentation standard with security validation
 * InfoSec: Validates standard IDs to prevent path injection
 */
async function loadDocStandardContent(
  standardId: string,
): Promise<{ content: string; isCustom: boolean; sourcePath?: string } | null> {
  // Validate standardId to prevent path injection
  if (!/^[a-z0-9-]+$/.test(standardId)) {
    console.warn(`Invalid documentation standard ID format: ${standardId}`);
    return null;
  }

  const aichakuPaths = paths.get();

  // Check for custom documentation standards first (user-defined)
  const customStandardPath = join(
    aichakuPaths.global.user.standards,
    `${standardId.toUpperCase()}.md`,
  );

  if (await exists(customStandardPath)) {
    try {
      // Security: Use safe file reading with validated path
      const content = await safeReadTextFile(customStandardPath, aichakuPaths.global.user.root);
      return {
        content,
        isCustom: true,
        sourcePath: customStandardPath,
      };
    } catch (_error) {
      console.warn(
        `Failed to load custom documentation standard content for ${standardId}`,
      );
    }
  }

  // Documentation standards are all in the documentation directory
  try {
    const newStandardPath = join(
      aichakuPaths.global.standards,
      "documentation",
      `${standardId}.md`,
    );
    const legacyStandardPath = join(
      aichakuPaths.legacy.globalStandards,
      "documentation",
      `${standardId}.md`,
    );

    // Check new path first, then legacy path
    let standardPath = newStandardPath;
    if (
      !(await exists(newStandardPath)) && (await exists(legacyStandardPath))
    ) {
      standardPath = legacyStandardPath;
    }

    if (!(await exists(standardPath))) {
      return null;
    }

    // Security: Use safe file reading with validated path
    // Determine the base directory based on the path
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    const baseDir = standardPath.includes(aichakuPaths.legacy.globalStandards) 
      ? join(home, ".claude") // Legacy global base
      : aichakuPaths.global.root;
    const content = await safeReadTextFile(standardPath, baseDir);
    return {
      content,
      isCustom: false,
      sourcePath: standardPath,
    };
  } catch (_error) {
    console.warn(
      `Failed to load documentation standard content for ${standardId}`,
    );
    return null;
  }
}

/**
 * Generate documentation standards section for CLAUDE.md
 */
async function generateDocStandardsSection(
  projectPath: string,
): Promise<string> {
  const selectedStandards = await loadProjectDocStandards(projectPath);

  if (selectedStandards.length === 0) {
    return "";
  }

  let standardsContent = `## 📝 Selected Documentation Standards

🪴 Aichaku: Based on your project configuration, follow these documentation standards:

`;

  for (const standardId of selectedStandards) {
    const result = await loadDocStandardContent(standardId);
    if (result) {
      standardsContent += `### ${standardId.toUpperCase()}\n\n`;

      // Add source attribution for custom standards
      if (result.isCustom && result.sourcePath) {
        const aichakuPaths = paths.get();
        const displayPath = result.sourcePath.replace(
          aichakuPaths.global.user.standards,
          "~/.claude/aichaku/user/standards",
        );
        standardsContent +=
          `*Custom Documentation Standard from: ${displayPath}*\n\n`;
      }

      standardsContent += result.content;
      standardsContent += "\n\n---\n\n";
    } else {
      standardsContent += `### ${standardId.toUpperCase()}\n\n`;
      standardsContent +=
        `Documentation standard content not found. Please ensure the standard is properly installed.\n\n---\n\n`;
    }
  }

  return standardsContent;
}

interface IntegrateOptions {
  projectPath?: string;
  force?: boolean;
  silent?: boolean;
  dryRun?: boolean;
}

// Markers for surgical updates
const METHODOLOGY_MARKER_START = "<!-- AICHAKU:METHODOLOGY:START -->";
const METHODOLOGY_MARKER_END = "<!-- AICHAKU:METHODOLOGY:END -->";
const STANDARDS_MARKER_START = "<!-- AICHAKU:STANDARDS:START -->";
const STANDARDS_MARKER_END = "<!-- AICHAKU:STANDARDS:END -->";
const DOC_STANDARDS_MARKER_START = "<!-- AICHAKU:DOC-STANDARDS:START -->";
const DOC_STANDARDS_MARKER_END = "<!-- AICHAKU:DOC-STANDARDS:END -->";

// Legacy markers for backward compatibility (kept for reference)
// const LEGACY_MARKER_START = "<!-- AICHAKU:START -->";
// const LEGACY_MARKER_END = "<!-- AICHAKU:END -->";

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
1. ⚠️ **CHECK TODAY'S DATE**: Look for "Today's date:" in the environment info
2. Create: \`.claude/output/active-YYYY-MM-DD-{descriptive-name}/\`
   - YYYY-MM-DD must be TODAY'S actual date from environment
   - Common mistake: Using 01 instead of current month
   - Example if today is 2025-07-10: \`active-2025-07-10-project-name/\`
3. Create STATUS.md immediately (with status diagram)
4. Read appropriate methodology guides
5. Create planning documents (with workflow diagrams)
6. WAIT for human approval before coding

**During Work:**
- Update STATUS.md regularly (including diagram state)
- Create supporting documents freely
- Start responses with: "🪴 Aichaku: Currently in [mode] working on [task]"

**Completing Work:**
1. Create YYYY-MM-DD-{Project-Name}-CHANGE-LOG.md summarizing all changes
   - ⚠️ Use TODAY'S date from environment info (not example dates!)
   - Example format: 2025-07-10-Fix-Security-Tests-CHANGE-LOG.md
   - Example format: 2025-07-10-Update-Authentication-CHANGE-LOG.md
   - NEVER just "CHANGE-LOG.md" - always include TODAY'S date and descriptive project name
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
  // Security: Use safe project path resolution
  const projectPath = resolveProjectPath(options.projectPath);
  const claudeMdPath = join(projectPath, "CLAUDE.md");

  // Generate standards section
  const standardsSection = await generateStandardsSection(projectPath);
  const selectedStandards = await loadProjectStandards(projectPath);

  // Generate documentation standards section
  const docStandardsSection = await generateDocStandardsSection(projectPath);
  const selectedDocStandards = await loadProjectDocStandards(projectPath);

  if (options.dryRun) {
    const fileExists = await checkFileExists(claudeMdPath);
    console.log(
      `[DRY RUN] Would ${
        fileExists ? "update" : "create"
      } CLAUDE.md at: ${claudeMdPath}`,
    );
    console.log("[DRY RUN] Would add methodology section");
    if (selectedStandards.length > 0) {
      console.log(
        `[DRY RUN] Would add standards section with ${selectedStandards.length} standards`,
      );
    }
    if (selectedDocStandards.length > 0) {
      console.log(
        `[DRY RUN] Would add documentation standards section with ${selectedDocStandards.length} standards`,
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
      // File exists - update with surgical precision
      // Security: Use safe file reading with validated path
      const content = await safeReadTextFile(claudeMdPath, projectPath);
      let updatedContent = content;

      // Handle methodology section
      const methodologyStartIdx = content.indexOf(METHODOLOGY_MARKER_START);
      const methodologyEndIdx = content.indexOf(METHODOLOGY_MARKER_END);

      if (methodologyStartIdx !== -1 && methodologyEndIdx !== -1) {
        // Update existing methodology section
        const before = content.slice(0, methodologyStartIdx);
        const after = content.slice(
          methodologyEndIdx + METHODOLOGY_MARKER_END.length,
        );
        updatedContent =
          `${before}${METHODOLOGY_MARKER_START}\n${METHODOLOGY_SECTION}\n${METHODOLOGY_MARKER_END}${after}`;
      } else {
        // Add new methodology section
        const methodologyMarkedSection =
          `${METHODOLOGY_MARKER_START}\n${METHODOLOGY_SECTION}\n${METHODOLOGY_MARKER_END}`;

        // Check for legacy methodology section
        if (
          content.includes("## Methodologies") ||
          content.includes("## 🎯 MANDATORY: Aichaku Integration Rules")
        ) {
          if (!options.force) {
            return {
              success: true,
              path: claudeMdPath,
              message:
                "Legacy Aichaku methodology section found. Use --force to upgrade to marker-based format.",
              action: "skipped",
            };
          }
          // Replace legacy section
          const methodologiesRegex =
            /## (🎯 MANDATORY: Aichaku Integration Rules|Methodologies)[\s\S]*?(?=\n##|$)/;
          updatedContent = content.replace(
            methodologiesRegex,
            methodologyMarkedSection,
          );
        } else {
          // Insert methodology section after initial content
          const lines = content.split("\n");
          let insertIndex = lines.length;

          // Find the first section header to insert before it
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("## ")) {
              insertIndex = i;
              break;
            }
          }

          if (insertIndex === lines.length) {
            // No sections found, append at end
            updatedContent = content + "\n\n" + methodologyMarkedSection;
          } else {
            // Insert before the first section
            lines.splice(insertIndex, 0, "", methodologyMarkedSection, "");
            updatedContent = lines.join("\n");
          }
        }
      }

      // Handle standards section
      if (standardsSection) {
        const standardsStartIdx = updatedContent.indexOf(
          STANDARDS_MARKER_START,
        );
        const standardsEndIdx = updatedContent.indexOf(STANDARDS_MARKER_END);

        if (standardsStartIdx !== -1 && standardsEndIdx !== -1) {
          // Update existing standards section
          const before = updatedContent.slice(0, standardsStartIdx);
          const after = updatedContent.slice(
            standardsEndIdx + STANDARDS_MARKER_END.length,
          );
          updatedContent =
            `${before}${STANDARDS_MARKER_START}\n${standardsSection}\n${STANDARDS_MARKER_END}${after}`;
        } else {
          // Add new standards section after methodology section
          const standardsMarkedSection =
            `${STANDARDS_MARKER_START}\n${standardsSection}\n${STANDARDS_MARKER_END}`;

          // Insert after methodology section if it exists
          const methodologyEndIndex = updatedContent.indexOf(
            METHODOLOGY_MARKER_END,
          );
          if (methodologyEndIndex !== -1) {
            const insertPosition = methodologyEndIndex +
              METHODOLOGY_MARKER_END.length;
            updatedContent = updatedContent.slice(0, insertPosition) +
              "\n\n" + standardsMarkedSection +
              updatedContent.slice(insertPosition);
          } else {
            // Append at end
            updatedContent += "\n\n" + standardsMarkedSection;
          }
        }
      } else {
        // Remove standards section if no standards are selected
        const standardsStartIdx = updatedContent.indexOf(
          STANDARDS_MARKER_START,
        );
        const standardsEndIdx = updatedContent.indexOf(STANDARDS_MARKER_END);

        if (standardsStartIdx !== -1 && standardsEndIdx !== -1) {
          const before = updatedContent.slice(0, standardsStartIdx);
          const after = updatedContent.slice(
            standardsEndIdx + STANDARDS_MARKER_END.length,
          );
          updatedContent = before + after.replace(/^\n+/, ""); // Remove leading newlines
        }
      }

      // Handle documentation standards section
      if (docStandardsSection) {
        const docStandardsStartIdx = updatedContent.indexOf(
          DOC_STANDARDS_MARKER_START,
        );
        const docStandardsEndIdx = updatedContent.indexOf(
          DOC_STANDARDS_MARKER_END,
        );

        if (docStandardsStartIdx !== -1 && docStandardsEndIdx !== -1) {
          // Update existing documentation standards section
          const before = updatedContent.slice(0, docStandardsStartIdx);
          const after = updatedContent.slice(
            docStandardsEndIdx + DOC_STANDARDS_MARKER_END.length,
          );
          updatedContent =
            `${before}${DOC_STANDARDS_MARKER_START}\n${docStandardsSection}\n${DOC_STANDARDS_MARKER_END}${after}`;
        } else {
          // Add new documentation standards section after standards section
          const docStandardsMarkedSection =
            `${DOC_STANDARDS_MARKER_START}\n${docStandardsSection}\n${DOC_STANDARDS_MARKER_END}`;

          // Insert after standards section if it exists
          const standardsEndIndex = updatedContent.indexOf(
            STANDARDS_MARKER_END,
          );
          if (standardsEndIndex !== -1) {
            const insertPosition = standardsEndIndex +
              STANDARDS_MARKER_END.length;
            updatedContent = updatedContent.slice(0, insertPosition) +
              "\n\n" + docStandardsMarkedSection +
              updatedContent.slice(insertPosition);
          } else {
            // Insert after methodology section if it exists
            const methodologyEndIndex = updatedContent.indexOf(
              METHODOLOGY_MARKER_END,
            );
            if (methodologyEndIndex !== -1) {
              const insertPosition = methodologyEndIndex +
                METHODOLOGY_MARKER_END.length;
              updatedContent = updatedContent.slice(0, insertPosition) +
                "\n\n" + docStandardsMarkedSection +
                updatedContent.slice(insertPosition);
            } else {
              // Append at end
              updatedContent += "\n\n" + docStandardsMarkedSection;
            }
          }
        }
      } else {
        // Remove documentation standards section if no standards are selected
        const docStandardsStartIdx = updatedContent.indexOf(
          DOC_STANDARDS_MARKER_START,
        );
        const docStandardsEndIdx = updatedContent.indexOf(
          DOC_STANDARDS_MARKER_END,
        );

        if (docStandardsStartIdx !== -1 && docStandardsEndIdx !== -1) {
          const before = updatedContent.slice(0, docStandardsStartIdx);
          const after = updatedContent.slice(
            docStandardsEndIdx + DOC_STANDARDS_MARKER_END.length,
          );
          updatedContent = before + after.replace(/^\n+/, ""); // Remove leading newlines
        }
      }

      await Deno.writeTextFile(claudeMdPath, updatedContent);
      action = "updated";
    } else {
      // Create new CLAUDE.md with all sections
      const methodologyMarkedSection =
        `${METHODOLOGY_MARKER_START}\n${METHODOLOGY_SECTION}\n${METHODOLOGY_MARKER_END}`;
      const standardsMarkedSection = standardsSection
        ? `\n\n${STANDARDS_MARKER_START}\n${standardsSection}\n${STANDARDS_MARKER_END}`
        : "";
      const docStandardsMarkedSection = docStandardsSection
        ? `\n\n${DOC_STANDARDS_MARKER_START}\n${docStandardsSection}\n${DOC_STANDARDS_MARKER_END}`
        : "";

      const defaultContent = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this project.

${methodologyMarkedSection}${standardsMarkedSection}${docStandardsMarkedSection}

## Project Overview

[Add your project-specific information here]
`;

      await Deno.writeTextFile(claudeMdPath, defaultContent);
      action = "created";
    }

    // Find line number where we added the content
    // Security: Use safe file reading with validated path
    const fileContent = await safeReadTextFile(claudeMdPath, projectPath);
    const lines = fileContent.split("\n");
    let lineNumber = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("🎯 MANDATORY: Aichaku Integration Rules")) {
        lineNumber = i + 1;
        break;
      }
    }

    return {
      success: true,
      path: claudeMdPath,
      message: `${
        action === "created" ? "Created new" : "Updated"
      } project CLAUDE.md with methodology${
        selectedStandards.length > 0
          ? ` and ${selectedStandards.length} standards`
          : ""
      }`,
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
    // Security: Use safe stat check - path is always claudeMdPath
    // constructed from resolved projectPath and hardcoded "CLAUDE.md"
    const projectPath = path.replace(/\/CLAUDE\.md$/, "");
    await safeStat(path, projectPath);
    return true;
  } catch {
    return false;
  }
}
