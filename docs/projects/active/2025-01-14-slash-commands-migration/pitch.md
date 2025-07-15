# Migrate Slash Commands to New Markdown Format

## Problem

Claude Code has introduced a new way to define slash commands using markdown files in `~/.claude/commands/`, but we're still using the old JSON format in `settings.json`. This creates several issues:

1. **Outdated approach**: Our 10 slash commands are defined in a 228-line JSON file, making them hard to maintain
2. **No version control**: Individual commands can't be tracked separately in git
3. **Limited capabilities**: The new format supports YAML frontmatter with tool permissions
4. **Potential conflicts**: Claude now has built-in GitHub commands that may overlap with our MCP
5. **Poor discoverability**: Commands buried in JSON are hard to find and understand

### Evidence from Current State

**Current commands in settings.json**:
- `/memin` - Load memory files
- `/security-rules` - DevSkim/CodeQL syntax
- `/preflight` - Project-specific checks
- `/owasp` - Security checklist
- `/commit-style` - Conventional commits
- `/directory-structure` - Project organization
- `/checkpoint` - Save session summary
- `/project` - Manage project memory
- `/commands` - List all commands
- `/addglobal` - Add global config

**New built-in commands** (potential overlaps):
- `/review` - Code review (overlaps with our MCP reviewer?)
- `/init` - Initialize project (overlaps with Aichaku init?)
- `/config` - View/modify config (overlaps with our settings?)

## Appetite

**3 weeks** - This is a medium-sized migration that improves maintainability and aligns with Claude's new standards.

## Solution

Migrate all slash commands to individual markdown files with proper metadata and organization.

### Directory Structure

```
~/.claude/commands/
├── aichaku/
│   ├── memin.md          # Memory loading
│   ├── checkpoint.md     # Session checkpoints
│   └── project.md        # Project memory management
├── security/
│   ├── rules.md          # DevSkim/CodeQL syntax
│   ├── owasp.md          # OWASP checklist
│   └── commit-style.md   # InfoSec commit guidelines
├── dev/
│   ├── preflight.md      # Pre-commit checks
│   └── structure.md      # Directory structure
└── utils/
    ├── commands.md       # List all commands
    └── addglobal.md      # Quick global config add
```

### Example Migration: `/checkpoint` Command

**Before** (in settings.json):
```json
{
  "name": "checkpoint",
  "description": "Save session summary to docs/checkpoints/checkpoint-YYYY-MM-DD-{descriptive-name}.md",
  "prompt": "Create a session checkpoint by following these steps..."
}
```

**After** (`~/.claude/commands/aichaku/checkpoint.md`):
```markdown
---
allowed-tools: Write, Bash(mkdir:*), Bash(date:*)
description: Save session summary to docs/checkpoints with timestamp
---

Create a session checkpoint by following these steps:

1. CREATE CHECKPOINT FILE:
   - Get today's date: !date +%Y-%m-%d
   - Path: `docs/checkpoints/checkpoint-$ARGUMENTS.md`
   - Create directory if needed: !mkdir -p docs/checkpoints
   - Use descriptive name from $ARGUMENTS or generate from work done

2. CHECKPOINT CONTENT (use these exact sections):
   # Session Checkpoint - {date} - {name}
   
   ## Summary of Work Accomplished
   List main tasks completed
   
   ## Key Technical Decisions
   Document architectural choices
   
   ## Files Created/Modified
   ### Created
   - New files with purpose
   ### Modified  
   - Changed files with changes
   
   ## Problems Solved
   Issues resolved and solutions
   
   ## Lessons Learned
   Key insights discovered
   
   ## Next Steps
   Future work or improvements

Show the checkpoint path after creation.
```

### Migration Script

Create `migrate-slash-commands.ts`:

```typescript
interface OldSlashCommand {
  name: string;
  description: string;
  prompt: string;
}

async function migrateCommands() {
  // Read old settings
  const settings = JSON.parse(
    await Deno.readTextFile("~/.claude/settings.json")
  );
  
  // Create directories
  const categories = {
    memin: "aichaku",
    checkpoint: "aichaku", 
    project: "aichaku",
    "security-rules": "security",
    owasp: "security",
    "commit-style": "security",
    preflight: "dev",
    "directory-structure": "dev",
    commands: "utils",
    addglobal: "utils"
  };
  
  // Migrate each command
  for (const cmd of settings.slashCommands) {
    const category = categories[cmd.name] || "misc";
    const dir = `~/.claude/commands/${category}`;
    await Deno.mkdir(dir, { recursive: true });
    
    // Determine allowed tools
    const allowedTools = detectRequiredTools(cmd.prompt);
    
    // Create markdown file
    const content = `---
allowed-tools: ${allowedTools.join(", ")}
description: ${cmd.description}
---

${improvePrompt(cmd.prompt)}
`;
    
    await Deno.writeTextFile(
      `${dir}/${cmd.name}.md`,
      content
    );
  }
  
  // Update settings.json
  delete settings.slashCommands;
  await Deno.writeTextFile(
    "~/.claude/settings.json",
    JSON.stringify(settings, null, 2)
  );
}
```

### Enhanced Commands with New Features

#### 1. **Dynamic Arguments** (`$ARGUMENTS`)

```markdown
---
allowed-tools: Grep, Read
description: Search for a pattern in the codebase
---

Search for "$ARGUMENTS" across the codebase:

!grep -r "$ARGUMENTS" --include="*.ts" --include="*.js"

Show the first 5 matches with context.
```

#### 2. **Bash Execution** (`!command`)

```markdown
---
allowed-tools: Bash(git:*)
description: Show git status with branch info
---

Current git status:
!git status --porcelain

Current branch:
!git branch --show-current

Recent commits:
!git log --oneline -5
```

#### 3. **File References** (`@file`)

```markdown
---
allowed-tools: Read
description: Load project configuration files
---

Load key project files:

1. Project memory: @CLAUDE.md
2. Package config: @package.json or @deno.json
3. TypeScript config: @tsconfig.json

Summarize the project setup based on these files.
```

### Deduplication Strategy

Since Claude now has built-in commands, we should:

1. **Remove duplicates**: 
   - Our `/commands` → Use Claude's `/help` instead
   - Consider if `/review` replaces our MCP reviewer

2. **Namespace our commands**:
   - `/aichaku:checkpoint` instead of `/checkpoint`
   - `/aichaku:memin` instead of `/memin`

3. **Focus on Aichaku-specific needs**:
   - Keep security-focused commands (OWASP, InfoSec)
   - Keep Aichaku workflow commands (checkpoint, project)
   - Remove generic dev commands covered by Claude

### Benefits

1. **Version Control**: Each command is a separate file, easy to track changes
2. **Discoverability**: Browse commands in filesystem, better organization
3. **Modularity**: Share command sets between projects
4. **Tool Permissions**: Fine-grained control over what each command can do
5. **Dynamic Content**: Use `$ARGUMENTS`, `!bash`, and `@files` for flexibility

## Rabbit Holes

- **Over-engineering permissions**: Start with simple tool lists, refine later
- **Complex command logic**: Keep commands focused on single tasks
- **Trying to preserve all commands**: Some may be better as documentation

## No-Gos

- **Breaking existing workflows**: Keep command names the same during migration
- **Losing command history**: Archive the old settings.json section
- **Auto-migration without review**: Each command should be manually verified
- **Mixing concerns**: Keep security, dev, and Aichaku commands separate

## Success Metrics

- All 10 commands migrated to markdown format
- Commands organized into logical categories
- No functionality lost during migration
- Improved command discoverability
- Easier to add new commands going forward