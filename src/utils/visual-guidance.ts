/**
 * Visual guidance utilities for contextual command feedback
 *
 * Provides "what did I do and where", "what's next", and visual diagrams
 * to help users understand command results and next steps.
 */

export interface CommandContext {
  /** What was done (action performed) */
  action: string;
  /** Where it was done (file paths, directories) */
  location: string;
  /** Type of installation (global, project, etc) */
  installationType?: "global" | "project" | "custom";
  /** Version information */
  version?: string;
  /** Additional details about what changed */
  changes?: string[];
}

export interface NextSteps {
  /** Immediate next actions */
  immediate?: string[];
  /** Recommended follow-up actions */
  recommended?: string[];
  /** Optional enhancements */
  optional?: string[];
}

/**
 * Create a visual directory tree for a given path structure
 */
export function createDirectoryTree(
  basePath: string,
  structure: Record<string, string[]>,
  options: { highlight?: string[]; maxDepth?: number } = {},
): string {
  const { highlight = [], maxDepth: _maxDepth = 3 } = options;
  let tree = `📁 ${basePath}\n`;

  const entries = Object.entries(structure);
  for (let i = 0; i < entries.length; i++) {
    const [dir, files] = entries[i];
    const isLast = i === entries.length - 1;
    const prefix = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    const isHighlighted = highlight.includes(dir);
    const dirSymbol = isHighlighted ? "📂✨" : "📂";
    tree += `${prefix}${dirSymbol} ${dir}\n`;

    if (files.length > 0) {
      for (let j = 0; j < files.length; j++) {
        const file = files[j];
        const isLastFile = j === files.length - 1;
        const filePrefix = isLastFile ? "└── " : "├── ";
        const fileHighlighted = highlight.includes(file);
        const fileSymbol = fileHighlighted ? "📄✨" : "📄";
        tree += `${childPrefix}${filePrefix}${fileSymbol} ${file}\n`;
      }
    }
  }

  return tree;
}

/**
 * Create a simple process flow diagram
 */
export function createProcessFlow(steps: string[]): string {
  let flow = "🔄 Process Flow:\n";

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isLast = i === steps.length - 1;
    const connector = isLast ? "" : "\n   ↓\n";
    flow += `${i + 1}. ${step}${connector}`;
  }

  return flow;
}

/**
 * Generate contextual feedback for command completion
 */
export function generateContextualFeedback(
  context: CommandContext,
  nextSteps: NextSteps,
  _includeVisuals: boolean = true,
): string {
  let feedback = "";

  // What did I do and where
  feedback += "📋 **What I Did:**\n";
  feedback += `   ${context.action}\n`;
  feedback += `   📍 Location: ${context.location}\n`;

  if (context.installationType) {
    feedback += `   🎯 Type: ${context.installationType} installation\n`;
  }

  if (context.version) {
    feedback += `   📦 Version: ${context.version}\n`;
  }

  if (context.changes && context.changes.length > 0) {
    feedback += `\n🔧 **Changes Made:**\n`;
    context.changes.forEach((change) => {
      feedback += `   • ${change}\n`;
    });
  }

  // What's next
  feedback += `\n🎯 **What's Next:**\n`;

  if (nextSteps.immediate && nextSteps.immediate.length > 0) {
    feedback += `\n   ⚡ **Immediate Actions:**\n`;
    nextSteps.immediate.forEach((step, i) => {
      feedback += `   ${i + 1}. ${step}\n`;
    });
  }

  if (nextSteps.recommended && nextSteps.recommended.length > 0) {
    feedback += `\n   💡 **Recommended:**\n`;
    nextSteps.recommended.forEach((step) => {
      feedback += `   • ${step}\n`;
    });
  }

  if (nextSteps.optional && nextSteps.optional.length > 0) {
    feedback += `\n   ✨ **Optional Enhancements:**\n`;
    nextSteps.optional.forEach((step) => {
      feedback += `   • ${step}\n`;
    });
  }

  return feedback;
}

/**
 * Create installation location diagram
 */
export function createInstallationDiagram(
  installationType: "global" | "project",
  basePath: string,
  version: string,
): string {
  if (installationType === "global") {
    return `
🌍 **Global Installation Map:**

${
      createDirectoryTree("~/.claude/aichaku", {
        "methodologies": ["shape-up.yaml", "scrum.yaml", "kanban.yaml", "..."],
        "standards": ["nist-csf.yaml", "owasp-web.yaml", "tdd.yaml", "..."],
        "user": ["prompts/", "templates/", "methods/"],
      }, { highlight: ["methodologies", "standards"] })
    }

✅ **Installation Details:**
   📍 Base Path: ${basePath}
   📦 Version: ${version}
   🔗 Available to ALL projects on this system`;
  } else {
    return `
📁 **Project Installation Map:**

${
      createDirectoryTree(".claude", {
        "user": ["prompts/", "templates/", "methods/"],
        "output": ["active/", "done/"],
      }, { highlight: ["user"] })
    }

✅ **Installation Details:**
   📍 Base Path: ${basePath}
   📦 Version: ${version}
   🔗 Links to global: ~/.claude/aichaku
   🎯 Project-specific customizations only`;
  }
}

/**
 * Create upgrade summary with before/after comparison
 */
export function createUpgradeSummary(
  oldVersion: string,
  newVersion: string,
  changesCount: number,
): string {
  return `
🔄 **Upgrade Summary:**

   Before: v${oldVersion}
      ↓
   After:  v${newVersion}

📊 **Changes Applied:**
   • ${changesCount} files updated
   • Methodologies: ✅ Latest templates
   • Standards: ✅ Updated definitions
   • Configurations: ✅ Preserved`;
}
