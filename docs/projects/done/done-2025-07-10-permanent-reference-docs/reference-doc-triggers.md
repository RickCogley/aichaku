# Reference Document Generation Triggers

## 🎯 User Scenarios & Commands

### Scenario 1: Fresh Installation

**User**: New to Aichaku, clean project **Command**: `aichaku init`

````bash
# Enhanced init process
aichaku init
# 🪴 Aichaku: Initializing project...
# 🔍 Analyzing existing codebase...
# 📊 Found: 15 TypeScript files, 3 API endpoints, 2 data models
# 📚 Generate permanent reference documents? [Y/n]: Y
# ✅ Created /references with architecture, API, and data documentation
# 🎯 Aichaku ready! Try: aichaku help
```text

### Scenario 2: Existing Aichaku User (Clean Upgrade)

**User**: Has Aichaku, wants permanent docs, no historical analysis **Command**:
`aichaku references init`

```bash
# Bootstrap permanent docs for existing users
aichaku references init
# 🪴 Aichaku: Bootstrapping permanent reference documents...
# 🔍 Analyzing current codebase...
# 📊 Analysis complete: 25 files, 8 endpoints, 4 data models, 2 security patterns
# 📚 Creating permanent documentation structure...
# ✅ Generated /references folder with comprehensive documentation
# 🔗 Created GitHub-discoverable pointer files (originals backed up)
# 📖 Updated README.md with documentation architecture
```text

### Scenario 3: Existing User with Rich History

**User**: Has lots of `.claude/output/` projects, wants to extract all learnings
**Command**: `aichaku references bootstrap --include-history`

```bash
# Full bootstrap with historical analysis
aichaku references bootstrap --include-history
# 🪴 Aichaku: Full historical analysis and permanent doc generation...
# 📂 Found 12 completed projects in .claude/output/
# 🔍 Analyzing current codebase...
# 📚 Extracting learnings from historical projects...
#   ✅ done-2025-07-01-aichaku-creation (Shape Up)
#   ✅ done-2025-07-06-aichaku-refactor (Shape Up)
#   ✅ test-2025-07-01-api-refactor (TDD)
#   ✅ test-2025-07-01-marketplace-mvp (Lean)
# 🏗️ Generating comprehensive permanent documentation...
# ✅ Created /references with insights from 12 projects + current codebase
# 📋 Generated 23 Architecture Decision Records from historical decisions
# 🔒 Created comprehensive security documentation from security patterns
```text

### Scenario 4: Selective Historical Analysis

**User**: Wants to pick which projects to analyze **Command**:
`aichaku references bootstrap --interactive`

```bash
# Interactive selection of projects to analyze
aichaku references bootstrap --interactive
# 🪴 Aichaku: Interactive permanent documentation generation...
# 📂 Found 12 completed projects. Select projects to analyze:
#
# Shape Up Projects:
#  [✓] done-2025-07-01-aichaku-creation
#  [✓] done-2025-07-06-aichaku-refactor
#  [ ] done-2025-07-07-visual-ux
#
# Lean Experiments:
#  [✓] test-2025-07-01-marketplace-mvp
#  [ ] test-2025-07-01-mobile-app
#
# Continue? [Y/n]: Y
# 🔍 Analyzing selected projects and current codebase...
```text

### Scenario 5: Quick Start (Minimal)

**User**: Just wants basic structure, will fill in manually **Command**:
`aichaku references init --minimal`

```bash
# Minimal structure without analysis
aichaku references init --minimal
# 🪴 Aichaku: Creating minimal permanent documentation structure...
# 📁 Created /references folder structure
# 📝 Generated template documents (not populated)
# 🔗 Created GitHub pointer files
# ✅ Ready for manual documentation
```text

### Scenario 6: Fix Missing/Broken Standards

**User**: Has Aichaku but some standards are missing or duplicated (like
TEST-PYRAMID, SOLID, CONVENTIONAL-COMMITS) **Command**: `aichaku standards fix`

```bash
# Fix missing or broken standards
aichaku standards fix
# 🪴 Aichaku: Checking standards integrity...
# ❌ Found missing standards: TEST-PYRAMID, SOLID, CONVENTIONAL-COMMITS
# ❌ Found duplicate content: OWASP section repeated in CLAUDE.md
# 🔧 Fixing missing standards...
# 🧹 Cleaning up duplicate content...
# ✅ Standards integrity restored
```text

## 🛠️ Technical Implementation

### Enhanced Init Command

```typescript
// aichaku init enhancement
class InitCommand {
  async execute(options: InitOptions): Promise<void> {
    await this.setupMethodologies();

    // NEW: Permanent docs integration
    if (await this.shouldGeneratePermanentDocs()) {
      const analysis = await this.analyzeCodebase();
      await this.generatePermanentDocs(analysis);
    }

    await this.setupComplete();
  }

  async shouldGeneratePermanentDocs(): Promise<boolean> {
    const hasCode = await this.detectExistingCode();
    if (!hasCode) return false;

    return await this.promptUser(
      "🪴 Aichaku: Generate permanent reference documents from your codebase? [Y/n]",
    );
  }
}
```text

### New References Command

```typescript
// New dedicated references command
class ReferencesCommand {
  async init(options: ReferencesInitOptions): Promise<void> {
    if (options.includeHistory) {
      await this.analyzeHistoricalProjects();
    }

    if (options.interactive) {
      await this.interactiveProjectSelection();
    }

    if (options.minimal) {
      await this.createMinimalStructure();
      return;
    }

    // Full analysis and generation
    await this.analyzeCodebaseAndGenerate();
  }

  async analyzeHistoricalProjects(): Promise<void> {
    const projects = await this.findCompletedProjects();
    console.log(`📂 Found ${projects.length} completed projects`);

    for (const project of projects) {
      const methodology = await this.detectMethodology(project);
      const learnings = await this.extractLearnings(project, methodology);
      await this.integrateIntoPermamentDocs(learnings);
    }
  }
}
```text

### New Standards Command

```typescript
// New standards management command
class StandardsCommand {
  async fix(): Promise<void> {
    console.log("🪴 Aichaku: Checking standards integrity...");

    const issues = await this.checkStandardsIntegrity();

    if (issues.missing.length > 0) {
      console.log(`❌ Found missing standards: ${issues.missing.join(", ")}`);
      await this.installMissingStandards(issues.missing);
    }

    if (issues.duplicates.length > 0) {
      console.log(
        `❌ Found duplicate content: ${issues.duplicates.join(", ")}`,
      );
      await this.removeDuplicateContent(issues.duplicates);
    }

    console.log("✅ Standards integrity restored");
  }

  async checkStandardsIntegrity(): Promise<StandardsIssues> {
    const claudemd = await this.readClaudeMd();
    const missing = await this.findMissingStandards(claudemd);
    const duplicates = await this.findDuplicateContent(claudemd);

    return { missing, duplicates };
  }

  async installMissingStandards(standards: string[]): Promise<void> {
    for (const standard of standards) {
      const content = await this.loadStandardContent(standard);
      await this.insertStandardIntoClaudeMd(standard, content);
    }
  }

  async removeDuplicateContent(duplicates: string[]): Promise<void> {
    // Remove content outside of AICHAKU:STANDARDS tags that duplicates
    // content inside the tags
    await this.cleanupDuplicateSections(duplicates);
  }
}
```text

### Command Structure

```bash
# New command hierarchy
aichaku references
├── init                    # Bootstrap permanent docs
├── bootstrap              # Full bootstrap with options
├── update                 # Update permanent docs from recent projects
├── validate               # Check permanent docs for consistency
└── migrate                # Migrate from other documentation systems

aichaku standards
├── fix                     # Fix missing/broken standards
├── list                    # List all available standards
├── add                     # Add a new standard
└── remove                  # Remove a standard
```text

## 🎮 User Experience Flows

### Flow 1: Fresh Install with Analysis

```mermaid
flowchart TD
    A[aichaku init] --> B[Detect existing code]
    B --> C{Code found?}
    C -->|Yes| D[Prompt: Generate docs?]
    C -->|No| E[Skip permanent docs]
    D -->|Yes| F[Analyze codebase]
    D -->|No| E
    F --> G[Generate permanent docs]
    G --> H[Setup complete]
    E --> H
```text

### Flow 2: Existing User Bootstrap

```mermaid
flowchart TD
    A[aichaku references bootstrap] --> B[Check for /references]
    B --> C{Already exists?}
    C -->|Yes| D[Backup existing]
    C -->|No| E[Create new]
    D --> E
    E --> F[Analyze codebase]
    F --> G{Include history?}
    G -->|Yes| H[Analyze .claude/output/]
    G -->|No| I[Generate from current code]
    H --> J[Merge historical learnings]
    I --> K[Generate permanent docs]
    J --> K
    K --> L[Bootstrap complete]
```text

### Flow 3: Interactive Historical Analysis

```mermaid
flowchart TD
    A[aichaku references bootstrap --interactive] --> B[Scan .claude/output/]
    B --> C[Present project checklist]
    C --> D[User selects projects]
    D --> E[Analyze selected projects]
    E --> F[Extract methodology-specific learnings]
    F --> G[Generate comprehensive docs]
    G --> H[Show summary of integrated learnings]
```text

## 📋 Command Options & Flags

### `aichaku init`

- **Default**: Includes permanent docs generation if code detected

- **`--no-references`**: Skip permanent docs generation

- **`--minimal`**: Create basic structure only

### `aichaku references init`

- **Default**: Analyze current codebase only

- **`--minimal`**: Create empty structure

- **`--backup-existing`**: Backup existing /references before generating

### `aichaku references bootstrap`

- **`--include-history`**: Analyze all .claude/output/ projects

- **`--interactive`**: Choose which projects to analyze

- **`--from-date DATE`**: Only analyze projects after date

- **`--methodology TYPE`**: Only analyze specific methodology projects

### `aichaku references update`

- **Default**: Update from recently completed projects

- **`--project PATH`**: Update from specific project

- **`--force`**: Overwrite existing sections

## 🔄 Automatic Triggers

### Project Completion Auto-Update

```typescript
// Automatic permanent doc updates on project completion
class ProjectCompletionHandler {
  async onProjectComplete(projectPath: string): Promise<void> {
    if (await this.permanentDocsExist()) {
      const learnings = await this.extractProjectLearnings(projectPath);
      const updates = await this.suggestPermanentDocUpdates(learnings);

      if (updates.length > 0) {
        console.log(
          `🪴 Aichaku: Found ${updates.length} potential updates to permanent docs`,
        );
        await this.promptUserForUpdates(updates);
      }
    }
  }
}
```text

### Upgrade Path Integration

```typescript
// Integration with aichaku upgrade
class UpgradeCommand {
  async execute(): Promise<void> {
    await this.performUpgrade();

    // NEW: Offer permanent docs on upgrade
    if (await this.isNewFeature("permanent-references")) {
      const shouldBootstrap = await this.promptUser(
        "🪴 Aichaku: New feature available! Generate permanent reference documents? [Y/n]",
      );

      if (shouldBootstrap) {
        await this.runCommand("references", ["bootstrap"]);
      }
    }
  }
}
```text

## 🎯 Migration Strategy

### For Existing Users

1. **Soft Introduction**: Mention in upgrade notes

2. **Optional Bootstrap**: Never force, always ask

3. **Gradual Adoption**: Can start with minimal and build up

4. **Historical Integration**: Option to extract from past work

### For New Users

1. **Default Behavior**: Generate if code detected

2. **Educational**: Explain what's being created

3. **Customizable**: Easy to skip or modify

This comprehensive trigger system ensures that both new and existing users can
easily adopt permanent reference documentation, with flexibility for different
needs and preferences!
````
