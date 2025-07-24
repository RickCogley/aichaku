# Implementation Examples for Magical Aichaku

## 1. Enhanced Init Command with Behavioral Setup

```typescript
// cli/commands/init.ts

import { ensureDir } from "@std/fs";
import { join } from "@std/path";

const BEHAVIORAL_RULES = `# 🚨 CRITICAL: Document Creation Rules

BEFORE creating ANY file:
✅ Check: Is path .claude/output/active-*/?
✅ Check: Does STATUS.md exist there?
✅ Check: Is .aichaku-active up to date?

IF NOT → Create proper structure FIRST!`;

const OUTPUT_README = `# 📁 Output Directory

ALL documents MUST go here:
- active-[date]-[project]/ → Current work
- done-[date]-[project]/ → Completed work

Current active: See ../.aichaku-active`;

const DIRECTIVE*CLAUDE*INTEGRATION = `
## 🎯 MANDATORY: Aichaku Integration Rules

YOU ARE REQUIRED TO FOLLOW THESE RULES WITHOUT EXCEPTION:

### Document Creation
✅ ALL documents go in: .claude/output/active-[date]-[project]/
❌ NEVER in project root or .claude/user/

### Automatic Behaviors
When user says → You MUST create:
- "shape" → pitch.md in active directory
- "sprint" → sprint-plan.md in active directory  
- "done" → Move to done-*/ with retrospective.md

NO EXCEPTIONS. NO ASKING. JUST DO IT.`;

export async function initCommand(options: InitOptions) {
  console.log("🎉 Initializing magical Aichaku integration...\n");

  // Create behavioral structure
  const claudeDir = join(Deno.cwd(), ".claude");

  // 1. Create directories with examples
  const structure = {
    "AICHAKU-RULES.md": BEHAVIORAL_RULES,
    ".aichaku-active": `active-${formatDate(new Date())}-getting-started`,
    "output/": {
      "README.md": OUTPUT_README,
      "WHERE-FILES-GO.md": createWhereFilesGo(),
      "active-example-shape-up-project/": {
        "STATUS.md": createExampleStatus("Shape Up", "Feature"),
        "pitch.md": createExamplePitch(),
      },
      "done-example-completed-sprint/": {
        "retrospective.md": createExampleRetro(),
      },
    },
    "hooks/": {
      "pre-create-file.sh": createPreCreateHook(),
      "post-create-file.sh": createPostCreateHook(),
      "check-location.sh": createLocationChecker(),
    },
  };

  await createStructure(claudeDir, structure);

  // 2. Update CLAUDE.md with directive integration
  await updateClaudeMd(DIRECTIVE*CLAUDE*INTEGRATION);

  // 3. Create welcome message
  console.log(createWelcomeMessage());

  // 4. Set up git hooks for auto-correction
  await setupGitHooks();

  console.log("\n✅ Magical Aichaku integration complete!");
  console.log("🎯 Try saying: 'Let's shape up a new feature'");
}

function createPreCreateHook(): string {
  return `#!/bin/bash
# Auto-correct file paths to Aichaku conventions

FILE_PATH="$1"
ACTIVE=$(cat .claude/.aichaku-active 2>/dev/null || echo "active-$(date +%Y-%m-%d)-untitled")

# If not in correct location, fix it
if [[ ! "$FILE_PATH" =~ \\.claude/output/active-.* ]]; then
  echo "🔄 Correcting path to Aichaku convention..."
  mkdir -p ".claude/output/$ACTIVE"
  
  # Extract filename
  FILENAME=$(basename "$FILE_PATH")
  CORRECT_PATH=".claude/output/$ACTIVE/$FILENAME"
  
  echo "✅ Using: $CORRECT_PATH"
  
  # Ensure STATUS.md exists
  if [ ! -f ".claude/output/$ACTIVE/STATUS.md" ]; then
    echo "📝 Creating STATUS.md first..."
    cat > ".claude/output/$ACTIVE/STATUS.md" << EOF
# $(echo $ACTIVE | sed 's/active-[0-9-]*-//')

## Project Status
**Started**: $(date +%Y-%m-%d)
**Status**: Active

## Updates
### $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Created project structure
- Working on: $FILENAME
EOF
  fi
  
  # Return corrected path
  echo "$CORRECT_PATH"
fi`;
}

function createWelcomeMessage(): string {
  return `
🎉 Aichaku Magic is Active! 🎉

Just start talking naturally:

  📝 "Let's shape up a payment feature"
     → Creates pitch in .claude/output/active-*/
  
  🏃 "Start sprint planning for auth"
     → Creates sprint docs automatically
  
  📊 "Show me our kanban board"
     → Creates/updates board instantly
  
  ✅ "We're done with this feature"
     → Moves to done-*/ with retrospective

No configuration. No questions. Just magic. ✨`;
}
```

## 2. Natural Language Detection System

```typescript
// lib/intent-detection.ts

export interface Intent {
  methodology: string;
  action: string;
  projectName?: string;
  documents: string[];
}

export class IntentDetector {
  private patterns = {
    shapeUp: {
      triggers: /shape|shaping|pitch|appetite|bet/i,
      projectExtractor: /shape\s+(?:up\s+)?(?:a\s+)?(.+)/i,
      documents: ["pitch.md", "STATUS.md"],
    },
    scrum: {
      triggers: /sprint|scrum|story|backlog|planning/i,
      projectExtractor: /(?:sprint|plan)\s+(?:for\s+)?(.+)/i,
      documents: ["sprint-plan.md", "backlog.md", "STATUS.md"],
    },
    kanban: {
      triggers: /kanban|board|wip|flow/i,
      projectExtractor: /(?:kanban|board)\s+(?:for\s+)?(.+)/i,
      documents: ["kanban-board.md", "STATUS.md"],
    },
    completion: {
      triggers: /done|complete|finish|retrospective/i,
      projectExtractor: /(?:done|completed|finished)\s+(?:with\s+)?(.+)/i,
      documents: ["retrospective.md"],
    },
  };

  detect(input: string): Intent | null {
    for (const [methodology, config] of Object.entries(this.patterns)) {
      if (config.triggers.test(input)) {
        const projectMatch = input.match(config.projectExtractor);
        const projectName = projectMatch?.[1]?.trim() || "untitled";

        return {
          methodology,
          action: methodology === "completion" ? "complete" : "create",
          projectName: this.sanitizeProjectName(projectName),
          documents: config.documents,
        };
      }
    }
    return null;
  }

  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
  }
}

// Usage in CLAUDE.md context
export function createAutoResponse(userInput: string): string {
  const detector = new IntentDetector();
  const intent = detector.detect(userInput);

  if (!intent) return "";

  const date = formatDate(new Date());
  const projectDir = intent.action === "complete"
    ? `done-${date}-${intent.projectName}`
    : `active-${date}-${intent.projectName}`;

  return `
// Aichaku Auto-Response
// Detected: ${intent.methodology} methodology
// Action: ${intent.action}
// Creating in: .claude/output/${projectDir}/

mkdir -p .claude/output/${projectDir}
${
    intent.documents.map((doc) => `touch .claude/output/${projectDir}/${doc}`)
      .join("\n")
  }

echo "${projectDir}" > .claude/.aichaku-active`;
}
```

## 3. Self-Correcting File System Monitor

```typescript
// lib/file-monitor.ts

import { walk } from "@std/fs";
import { join, relative } from "@std/path";

export class AichakuFileMonitor {
  private watchedPaths = new Set<string>();
  private correctPath = /^\.claude\/output\/(active|done)-\d{4}-\d{2}-\d{2}-[\w-]+\//;

  async checkAndCorrect(filePath: string): Promise<string | null> {
    // Skip if already in correct location
    if (this.correctPath.test(filePath)) {
      return null;
    }

    // Skip if in allowed locations
    const allowed = [
      /^\.claude\/methodologies\//,
      /^\.claude\/scripts\//,
      /^src\//,
      /^tests?\//,
    ];

    if (allowed.some((pattern) => pattern.test(filePath))) {
      return null;
    }

    // Detect if this looks like a project document
    const docPatterns = [
      /\.(md|txt)$/i,
      /STATUS/i,
      /pitch/i,
      /sprint/i,
      /kanban/i,
      /retro/i,
    ];

    if (docPatterns.some((pattern) => pattern.test(filePath))) {
      return this.suggestCorrection(filePath);
    }

    return null;
  }

  private async suggestCorrection(wrongPath: string): Promise<string> {
    const activeProject = await this.getActiveProject();
    const filename = basename(wrongPath);
    const correctPath = join(".claude/output", activeProject, filename);

    // Auto-correct
    console.log(`🔄 Auto-correcting file location...`);
    console.log(`   From: ${wrongPath}`);
    console.log(`   To: ${correctPath}`);

    await ensureDir(dirname(correctPath));
    await Deno.rename(wrongPath, correctPath);

    // Update git
    await this.gitCorrection(wrongPath, correctPath);

    return correctPath;
  }

  private async gitCorrection(oldPath: string, newPath: string) {
    const commands = [
      `git add "${newPath}"`,
      `git rm "${oldPath}" 2>/dev/null || true`,
      `git commit -m "fix: move document to Aichaku location

- Moved from: ${oldPath}
- Moved to: ${newPath}
- Following Aichaku conventions" || true`,
    ];

    for (const cmd of commands) {
      await exec(cmd);
    }
  }

  private async getActiveProject(): Promise<string> {
    try {
      const active = await Deno.readTextFile(".claude/.aichaku-active");
      return active.trim();
    } catch {
      const defaultProject = `active-${formatDate(new Date())}-untitled`;
      await Deno.writeTextFile(".claude/.aichaku-active", defaultProject);
      return defaultProject;
    }
  }
}

// Auto-correction daemon
export async function startFileMonitor() {
  const monitor = new AichakuFileMonitor();

  // Watch for new files
  const watcher = Deno.watchFs(".", {
    recursive: true,
    exclude: ["node_modules", ".git", "target"],
  });

  for await (const event of watcher) {
    if (event.kind === "create" || event.kind === "modify") {
      for (const path of event.paths) {
        const relativePath = relative(Deno.cwd(), path);
        const correction = await monitor.checkAndCorrect(relativePath);

        if (correction) {
          console.log(`✅ File automatically moved to: ${correction}`);
        }
      }
    }
  }
}
```

## 4. Status Auto-Updater

```typescript
// lib/status-updater.ts

export class StatusUpdater {
  async updateStatus(action: string, details?: Record<string, any>) {
    const activeProject = await this.getActiveProject();
    const statusPath = join(".claude/output", activeProject, "STATUS.md");

    // Ensure STATUS.md exists
    if (!(await exists(statusPath))) {
      await this.createStatus(activeProject);
    }

    // Append update
    const timestamp = new Date().toISOString();
    const update = `
### ${timestamp}
- ${action}${details ? "\n" + this.formatDetails(details) : ""}
`;

    await Deno.appendTextFile(statusPath, update);

    // Auto-commit
    await this.commitUpdate(activeProject, action);
  }

  private formatDetails(details: Record<string, any>): string {
    return Object.entries(details)
      .map(([key, value]) => `  - ${key}: ${value}`)
      .join("\n");
  }

  private async commitUpdate(project: string, action: string) {
    const shortAction = action.slice(0, 50);
    await exec(`git add .claude/output/${project}/STATUS.md`);
    await exec(`git commit -m "docs: ${shortAction} [${project}]" || true`);
  }

  async transitionToComplete(reason?: string) {
    const activeProject = await this.getActiveProject();
    const date = formatDate(new Date());
    const projectName = activeProject.replace(/^active-\d{4}-\d{2}-\d{2}-/, "");
    const doneProject = `done-${date}-${projectName}`;

    // Move directory
    await Deno.rename(
      join(".claude/output", activeProject),
      join(".claude/output", doneProject),
    );

    // Create retrospective
    const retroPath = join(".claude/output", doneProject, "retrospective.md");
    await this.createRetrospective(retroPath, projectName, reason);

    // Update active tracker
    await Deno.remove(".claude/.aichaku-active");

    // Commit transition
    await exec(`git add -A .claude/output/`);
    await exec(`git commit -m "complete: ${projectName} moved to done

- Created retrospective
- Project completed successfully"`);
  }
}

// Hook into Claude Code operations
export function installStatusHooks() {
  // Override file write operations
  const originalWriteTextFile = Deno.writeTextFile;

  Deno.writeTextFile = async function (path: string, data: string) {
    const result = await originalWriteTextFile(path, data);

    // Auto-update status
    if (typeof path === "string" && path.includes(".claude/output/active-")) {
      const updater = new StatusUpdater();
      await updater.updateStatus(`Created/Updated ${basename(path)}`);
    }

    return result;
  };
}
```

## 5. Git Integration Hooks

```bash
#!/bin/bash
# .githooks/pre-commit

# Check for files in wrong locations
WRONG_LOCATIONS=$(git diff --cached --name-only | grep -E '^\w+\.md$|^docs/.*\.md$' | grep -v '^\.claude/output/')

if [ ! -z "$WRONG_LOCATIONS" ]; then
  echo "🚨 Aichaku: Files detected in wrong locations:"
  echo "$WRONG_LOCATIONS"
  echo ""
  echo "Moving to correct location..."

  ACTIVE=$(cat .claude/.aichaku-active 2>/dev/null || echo "active-$(date +%Y-%m-%d)-fixing")

  for file in $WRONG_LOCATIONS; do
    mkdir -p ".claude/output/$ACTIVE"
    git mv "$file" ".claude/output/$ACTIVE/" || true
  done

  echo "✅ Files moved to .claude/output/$ACTIVE/"
  echo "Please commit again."
  exit 1
fi
```

## 6. Testing the Magic

```typescript
// tests/magical-behavior.test.ts

Deno.test("Natural language creates correct structure", async () => {
  const testInputs = [
    {
      input: "Let's shape up a payment feature",
      expected: {
        dir: /active-\d{4}-\d{2}-\d{2}-payment-feature/,
        files: ["STATUS.md", "pitch.md"],
      },
    },
    {
      input: "Start sprint planning for authentication",
      expected: {
        dir: /active-\d{4}-\d{2}-\d{2}-authentication/,
        files: ["STATUS.md", "sprint-plan.md", "backlog.md"],
      },
    },
    {
      input: "We're done with the search feature",
      expected: {
        dir: /done-\d{4}-\d{2}-\d{2}-search-feature/,
        files: ["retrospective.md"],
      },
    },
  ];

  for (const test of testInputs) {
    // Simulate Claude Code processing
    const result = await processNaturalLanguage(test.input);

    // Check directory created
    assert(test.expected.dir.test(result.directory));

    // Check files created
    for (const file of test.expected.files) {
      const filePath = join(result.directory, file);
      assert(await exists(filePath), `Missing ${file}`);
    }
  }
});

Deno.test("Files in wrong location get auto-corrected", async () => {
  // Create file in wrong location
  await Deno.writeTextFile("./wrong-location.md", "# Test");

  // Run monitor
  const monitor = new AichakuFileMonitor();
  const corrected = await monitor.checkAndCorrect("./wrong-location.md");

  // Should be moved
  assert(corrected?.includes(".claude/output/active-"));
  assert(!(await exists("./wrong-location.md")));
  assert(await exists(corrected!));
});
```
