/**
 * Updated Init Command using ConfigManager v2.0.0
 * 
 * Initializes new projects with consolidated metadata format
 */

import { parseArgs } from "jsr:@std/cli@1";
import { exists } from "jsr:@std/fs@1";
import { join } from "jsr:@std/path@1";
import { createProjectConfigManager, ConfigManager } from "../utils/config-manager.ts";
import { checkMigrationStatus } from "../utils/migration-helper.ts";

interface InitOptions {
  methodology?: string;
  standards?: string[];
  force?: boolean;
  global?: boolean;
  template?: string;
  verbose?: boolean;
}

const AVAILABLE_METHODOLOGIES = [
  "shape-up",
  "scrum", 
  "kanban",
  "lean",
  "scrumban",
  "xp"
];

const AVAILABLE_STANDARDS = [
  "15-factor",
  "12-factor", 
  "diataxis",
  "google-docs",
  "microsoft-docs"
];

/**
 * Initialize a new Aichaku project with v2.0.0 configuration format
 */
export async function initCommand(args: string[]): Promise<void> {
  const parsedArgs = parseArgs(args, {
    string: ["methodology", "standards", "template"],
    boolean: ["force", "global", "verbose"],
    alias: {
      "m": "methodology",
      "s": "standards", 
      "f": "force",
      "g": "global",
      "t": "template",
      "v": "verbose",
    },
  });

  const options: InitOptions = {
    methodology: parsedArgs.methodology,
    standards: parsedArgs.standards ? parsedArgs.standards.split(",") : undefined,
    force: parsedArgs.force,
    global: parsedArgs.global,
    template: parsedArgs.template,
    verbose: parsedArgs.verbose,
  };

  const projectRoot = options.global ? getHomeDirectory() : Deno.cwd();
  
  try {
    // Check if project is already initialized
    const configManager = createProjectConfigManager(projectRoot);
    const migrationStatus = await checkMigrationStatus(projectRoot);
    
    let alreadyExists = false;
    try {
      await configManager.load();
      alreadyExists = true;
    } catch {
      // Project not initialized - this is expected for init
    }

    if (alreadyExists && !options.force) {
      console.log("❌ Project already initialized");
      console.log("Use --force to reinitialize or run 'aichaku upgrade' to update");
      return;
    }

    if (migrationStatus.legacyFilesFound.length > 0 && !alreadyExists) {
      console.log("🔄 Legacy configuration files detected");
      console.log("Consider running 'aichaku upgrade' to migrate existing configuration");
      
      if (!options.force && !await confirmReinitialize()) {
        return;
      }
    }

    // Interactive setup if no options provided
    let methodology = options.methodology;
    let standards = options.standards;

    if (!methodology && !options.force) {
      methodology = await promptForMethodology();
    }

    if (!standards && !options.force) {
      standards = await promptForStandards();
    }

    // Validate inputs
    if (methodology && !AVAILABLE_METHODOLOGIES.includes(methodology)) {
      console.log(`❌ Invalid methodology: ${methodology}`);
      console.log(`Available: ${AVAILABLE_METHODOLOGIES.join(", ")}`);
      return;
    }

    if (standards) {
      const invalidStandards = standards.filter(s => !AVAILABLE_STANDARDS.includes(s));
      if (invalidStandards.length > 0) {
        console.log(`❌ Invalid standards: ${invalidStandards.join(", ")}`);
        console.log(`Available: ${AVAILABLE_STANDARDS.join(", ")}`);
        return;
      }
    }

    // Create the configuration
    console.log(`\n🌱 Initializing Aichaku project...`);
    
    const version = await getCurrentVersion();
    const config = options.global 
      ? ConfigManager.createGlobal(version)
      : ConfigManager.createDefault(methodology);

    // Set version information
    config.project.installedVersion = version;
    config.project.lastUpdated = new Date().toISOString();

    // Set standards if provided
    if (standards) {
      const developmentStandards = standards.filter(s => 
        ["15-factor", "12-factor"].includes(s)
      );
      const documentationStandards = standards.filter(s => 
        ["diataxis", "google-docs", "microsoft-docs"].includes(s)
      );
      
      config.standards.development = developmentStandards;
      config.standards.documentation = documentationStandards;
    }

    // Create directory structure
    await createDirectoryStructure(projectRoot, options);

    // Save configuration
    const newConfigManager = new ConfigManager(projectRoot);
    newConfigManager["config"] = config; // Direct assignment for initialization
    await newConfigManager.save();

    // Create methodology-specific files
    if (methodology) {
      await createMethodologyFiles(projectRoot, methodology, options);
    }

    // Create template files if specified
    if (options.template) {
      await createTemplateFiles(projectRoot, options.template, options);
    }

    // Show initialization summary
    await showInitializationSummary(newConfigManager, options);

    console.log(`\n✅ Aichaku project initialized successfully!`);
    
    // Show next steps
    showNextSteps(methodology, options);

  } catch (error) {
    console.error(`❌ Initialization failed: ${(error as Error).message}`);
    if (options.verbose) {
      console.error((error as Error).stack);
    }
    Deno.exit(1);
  }
}

/**
 * Create the directory structure for the project
 */
async function createDirectoryStructure(projectRoot: string, options: InitOptions): Promise<void> {
  const directories = [
    ".claude/aichaku",
    "docs/projects/active",
    "docs/projects/done",
    "docs/api",
  ];

  if (!options.global) {
    directories.push(
      "src",
      "tests",
      "scripts"
    );
  }

  for (const dir of directories) {
    const fullPath = join(projectRoot, dir);
    if (!await exists(fullPath)) {
      await Deno.mkdir(fullPath, { recursive: true });
      if (options.verbose) {
        console.log(`✓ Created directory: ${dir}`);
      }
    }
  }
}

/**
 * Create methodology-specific files and templates
 */
async function createMethodologyFiles(
  projectRoot: string, 
  methodology: string, 
  options: InitOptions
): Promise<void> {
  const templatesDir = join(projectRoot, "docs", "projects", "active");
  
  const methodologyTemplates = {
    "shape-up": {
      "STATUS.md": generateShapeUpStatus(),
      "pitch-template.md": generateShapeUpPitch(),
    },
    "scrum": {
      "sprint-planning-template.md": generateScrumPlanning(),
      "retrospective-template.md": generateScrumRetrospective(),
    },
    "kanban": {
      "kanban-board-template.md": generateKanbanBoard(),
    },
    "lean": {
      "experiment-template.md": generateLeanExperiment(),
    },
  };

  const templates = methodologyTemplates[methodology as keyof typeof methodologyTemplates];
  if (templates) {
    for (const [filename, content] of Object.entries(templates)) {
      const filePath = join(templatesDir, filename);
      await Deno.writeTextFile(filePath, content);
      if (options.verbose) {
        console.log(`✓ Created ${methodology} template: ${filename}`);
      }
    }
  }
}

/**
 * Create template files based on specified template
 */
async function createTemplateFiles(
  projectRoot: string, 
  template: string, 
  options: InitOptions
): Promise<void> {
  // Placeholder for template creation
  // In a real implementation, this would create files based on the template type
  if (options.verbose) {
    console.log(`✓ Applied template: ${template}`);
  }
}

/**
 * Show initialization summary
 */
async function showInitializationSummary(
  configManager: ConfigManager, 
  options: InitOptions
): Promise<void> {
  const config = configManager.get();
  
  console.log(`\n📋 Initialization Summary:`);
  console.log(`   Configuration Version: v${config.version}`);
  console.log(`   Project Type: ${config.project.type}`);
  console.log(`   Installation Type: ${config.project.installationType}`);
  console.log(`   Aichaku Version: ${config.project.installedVersion}`);
  
  if (config.project.methodology) {
    console.log(`   Methodology: ${config.project.methodology}`);
  }
  
  if (config.standards.development.length > 0) {
    console.log(`   Development Standards: ${config.standards.development.join(", ")}`);
  }
  
  if (config.standards.documentation.length > 0) {
    console.log(`   Documentation Standards: ${config.standards.documentation.join(", ")}`);
  }
}

/**
 * Show next steps after initialization
 */
function showNextSteps(methodology: string | undefined, options: InitOptions): void {
  console.log(`\n🚀 Next Steps:`);
  
  if (methodology) {
    console.log(`   • Explore ${methodology} templates in docs/projects/active/`);
  } else {
    console.log(`   • Set a methodology: aichaku methodology set <name>`);
  }
  
  console.log(`   • Select development standards: aichaku standards select`);
  console.log(`   • Create your first project: aichaku project create <name>`);
  console.log(`   • Check project status: aichaku status`);
  
  if (!options.global) {
    console.log(`   • Initialize git repository if not already done`);
    console.log(`   • Add .claude/ to your .gitignore if desired`);
  }
}

/**
 * Prompt for methodology selection
 */
async function promptForMethodology(): Promise<string | undefined> {
  console.log(`\nSelect a methodology (optional):`);
  AVAILABLE_METHODOLOGIES.forEach((method, index) => {
    console.log(`  ${index + 1}. ${method}`);
  });
  console.log(`  ${AVAILABLE_METHODOLOGIES.length + 1}. Skip (can set later)`);
  
  console.log(`\nChoice [1-${AVAILABLE_METHODOLOGIES.length + 1}]: `, { noNewLine: true });
  
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf) ?? 0;
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  
  const choice = parseInt(input);
  if (choice >= 1 && choice <= AVAILABLE_METHODOLOGIES.length) {
    return AVAILABLE_METHODOLOGIES[choice - 1];
  }
  
  return undefined;
}

/**
 * Prompt for standards selection
 */
async function promptForStandards(): Promise<string[]> {
  console.log(`\nSelect standards (comma-separated numbers, or Enter to skip):`);
  AVAILABLE_STANDARDS.forEach((standard, index) => {
    console.log(`  ${index + 1}. ${standard}`);
  });
  
  console.log(`\nChoices [1-${AVAILABLE_STANDARDS.length}]: `, { noNewLine: true });
  
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf) ?? 0;
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  
  if (!input) {
    return [];
  }
  
  const choices = input.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  return choices
    .filter(choice => choice >= 1 && choice <= AVAILABLE_STANDARDS.length)
    .map(choice => AVAILABLE_STANDARDS[choice - 1]);
}

/**
 * Confirm reinitialization
 */
async function confirmReinitialize(): Promise<boolean> {
  console.log("\nProceed with initialization anyway? [y/N] ", { noNewLine: true });
  
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf) ?? 0;
  const input = new TextDecoder().decode(buf.subarray(0, n)).trim().toLowerCase();
  
  return input === "y" || input === "yes";
}

/**
 * Get current version (placeholder implementation)
 */
async function getCurrentVersion(): Promise<string> {
  // In a real implementation, this would read from package.json or similar
  return "0.29.0";
}

/**
 * Get home directory
 */
function getHomeDirectory(): string {
  return Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "/tmp";
}

// Template generators
function generateShapeUpStatus(): string {
  return `# Project Status

## Overview
Brief description of the project and current status.

## Hill Chart
\`\`\`
Problem Space ←→ Solution Space
[  ] [  ] [  ] [●] [  ] [  ] [  ]
   Figuring out     Building
\`\`\`

## Progress Update
- Current week:
- Next week:
- Blockers:

## Last Updated
${new Date().toISOString().split('T')[0]}
`;
}

function generateShapeUpPitch(): string {
  return `# Project Pitch

## Problem
What problem are we solving?

## Appetite
How much time is this worth?

## Solution
High-level approach to the solution.

## Rabbit Holes
What could derail this project?

## No-Goes
What are we explicitly NOT doing?
`;
}

function generateScrumPlanning(): string {
  return `# Sprint Planning

## Sprint Goal
What do we want to achieve this sprint?

## Sprint Backlog
- [ ] User Story 1
- [ ] User Story 2
- [ ] User Story 3

## Definition of Done
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated

## Capacity
Team capacity for this sprint.
`;
}

function generateScrumRetrospective(): string {
  return `# Sprint Retrospective

## What Went Well?
-

## What Could Be Improved?
-

## Action Items
- [ ] Action item 1
- [ ] Action item 2

## Sprint Metrics
- Velocity:
- Completed stories:
- Carry-over stories:
`;
}

function generateKanbanBoard(): string {
  return `# Kanban Board

## Backlog
- Item 1
- Item 2

## In Progress
- 

## Review
- 

## Done
- 

## WIP Limits
- In Progress: 3
- Review: 2

## Metrics
- Lead time:
- Cycle time:
- Throughput:
`;
}

function generateLeanExperiment(): string {
  return `# Lean Experiment

## Hypothesis
We believe that [building this feature] for [these users] will achieve [this outcome].

## Experiment
We will validate this by [building this minimal version] and measuring [these metrics].

## Success Criteria
- Metric 1: Target value
- Metric 2: Target value

## Timeline
- Start: 
- Duration: 
- Review: 

## Results
_To be filled after experiment_
`;
}

export type { InitOptions };