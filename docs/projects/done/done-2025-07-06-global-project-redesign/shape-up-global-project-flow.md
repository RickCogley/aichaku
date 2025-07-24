# Shape Up: Global vs Project Init Flow

## Problem

The current implementation copies all methodology files into each project, defeating the purpose of a global install.
This creates:

- File duplication across projects
- Complex .gitignore requirements
- Confusion about updates (which files are source of truth?)
- Poor developer experience

## Appetite

2-3 hours of focused work to redesign the init flow.

## Solution

### New Architecture

```
~/.claude/                    # Global installation
├── methodologies/           # All methodology files (source of truth)
├── .aichaku.json           # Global install metadata
└── user/                   # Global customizations

/project/.claude/            # Project-specific files only
├── user/                   # Project customizations
└── .aichaku-project       # Marker file with config
```

### Command Behaviors

#### 1. Global Install (unchanged)

```bash
aichaku init --global
```

- Installs all methodologies to `~/.claude/`
- Creates global user customization directory
- One-time setup

#### 2. Project Init (redesigned)

```bash
aichaku init
```

**New behavior**:

1. Check if global Aichaku exists
   - If not: Error message: "Please install Aichaku globally first: aichaku init --global"

2. Create minimal project structure:

   ```
   .claude/
   ├── user/              # Project-specific customizations
   └── .aichaku-project   # Marker file
   ```

3. Interactive prompt:

   ```
   ✓ Created project customization directory

   Would you like to add Aichaku to this project's CLAUDE.md? (Y/n): _
   ```

4. If yes: Run integrate command automatically
5. If no: Show message about running `aichaku integrate` later

**Marker file content** (`.aichaku-project`):

```json
{
  "version": "0.5.0",
  "globalVersion": "0.5.0",
  "createdAt": "2025-07-06T20:00:00Z",
  "customizations": {
    "userDir": "./user"
  }
}
```

#### 3. Integrate Command (enhanced)

```bash
aichaku integrate
```

**Updated CLAUDE.md section**:

```markdown
## Methodologies

This project uses the Aichaku adaptive methodology system.

Aichaku is installed globally and provides adaptive methodology support that blends approaches based on your natural
language:

- Say "sprint" → Scrum practices activate
- Say "shape" → Shape Up principles engage
- Say "kanban" → Flow-based practices emerge

Global methodologies location: ~/.claude/methodologies/ Project customizations: ./.claude/user/

Learn more: https://github.com/RickCogley/aichaku
```

### Benefits

1. **No duplication** - Methodologies exist in one place
2. **Clean git** - Only track project customizations
3. **Clear mental model** - Global install, project customization
4. **Easy updates** - Update global, all projects benefit
5. **Interactive guidance** - Helps users with next steps

### Rabbit Holes (NOT doing)

- Symlinks (compatibility issues)
- Complex version management between global/project
- Auto-detection of global install location
- Multiple global install locations

### No-gos

- Don't copy methodology files to projects
- Don't create complex dependency chains
- Don't require network access

## Implementation Steps

1. Modify `init` command to check for global install
2. Change project init to create minimal structure
3. Add interactive prompt for integrate
4. Update integrate command with better CLAUDE.md content
5. Create `.aichaku-project` marker file format
6. Update documentation

## Success Criteria

- Running `aichaku init` in a project doesn't copy methodologies
- Clear error if global not installed
- Interactive prompt guides users
- Git status stays clean (only user customizations)
- Claude Code can find and use global methodologies
