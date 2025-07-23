# Documentation System Implementation Details

## Overview

This document provides comprehensive details about the documentation system
overhaul for Aichaku, including the implementation of Diátaxis framework, Google
style guide, documentation standards feature, and linting tools.

## 1. Diátaxis Framework Implementation

### Structure Created

````text
/references/  (to be renamed to /docs/)
├── README.md                    # Documentation hub
├── .diataxis                    # Linting configuration
├── tutorials/                   # Learning-oriented
│   ├── getting-started.md      # Installation and first steps
│   ├── first-project.md        # Creating first project
│   └── setup-mcp-server.md    # MCP server tutorial
├── how-to/                     # Task-oriented
│   ├── configure-project.md    # Configuration tasks
│   └── use-mcp-with-multiple-projects.md
├── reference/                  # Information-oriented
│   ├── cli-commands.md         # Complete CLI reference
│   ├── configuration-options.md # All config options
│   ├── file-structure.md       # Directory structure
│   └── mcp-api.md             # MCP API reference
└── explanation/                # Understanding-oriented
    ├── architecture.md         # System architecture
    ├── core-concepts.md        # Aichaku concepts
    ├── design-philosophy.md    # Design decisions
    └── mcp-architecture.md     # MCP architecture
```text

### Key Principles Applied

1. **Separation of Concerns**: Each document type serves one purpose

2. **User Journey**: Tutorials → How-to → Reference → Explanation

3. **No Mixed Documents**: Previously mixed documents were split appropriately

## 2. Google Style Guide Implementation

### Style Rules Applied

1. **Voice and Tone**

   - Conversational: "You can configure" not "One can configure"

   - Present tense: "Creates a file" not "Will create a file"

   - Active voice: "Aichaku processes" not "Files are processed by"

2. **Sentence Structure**

   - Maximum 20 words per sentence (warning at 25)

   - Short paragraphs (3-5 sentences)

   - Bulleted lists for clarity

3. **Examples First**

   - Show the command/code

   - Then explain what it does

   - Provide context last

4. **Forbidden Words**

   - "Please" (unnecessary politeness)

   - "Just" (minimizing complexity)

   - "Simply" (assuming ease)

   - "Easy" (subjective judgment)

## 3. MCP Documentation Enhancement

### Global Installation Model Clarified

The documentation now clearly explains:

1. **One Server, Many Projects**

   ```text
   ~/.aichaku/mcp-server/        # Global installation
   ├── bin/                     # Executable
   ├── src/                     # Source code
   └── config/                  # Global config
````

2. **No Port Conflicts**

   - Uses stdio (standard input/output)

   - Not network-based

   - No ports to configure

3. **Automatic Project Detection**

   - Finds `.claude/` directories

   - Loads project-specific standards

   - No per-project installation needed

### Documentation Created

1. **Tutorial**: Step-by-step first-time setup

2. **How-to**: Using with multiple projects

3. **Reference**: Complete API documentation

4. **Explanation**: Architecture and benefits

## 4. Documentation Standards Feature

### Command Structure

````bash
aichaku docs-standard [OPTIONS]

Options:

  --list                    # List all available standards
  --add <standards>         # Add standards to project
  --remove <standards>      # Remove standards from project
  --show                    # Show selected standards
  --search <keyword>        # Search for standards
```text

### Available Standards

1. **diataxis-google**

   - Combines Diátaxis framework with Google style

   - Includes four templates (tutorial, how-to, reference, explanation)

   - Most comprehensive option

2. **microsoft-style**

   - Microsoft Writing Style Guide

   - Warm, approachable tone

   - Good for user-facing docs

3. **writethedocs**

   - Community best practices

   - Version control friendly

   - Developer-focused

### Integration with CLAUDE.md

Standards are injected between markers:

```markdown
<!-- AICHAKU:DOC-STANDARDS:START -->

[Selected standards content]

<!-- AICHAKU:DOC-STANDARDS:END -->
```text

## 5. Documentation Linting Tools

### Linter Architecture

```text
BaseLinter (abstract)
├── DiátaxisLinter      # Structure compliance
├── GoogleStyleLinter   # Style guide compliance
└── MicrosoftStyleLinter # (placeholder)
```text

### Checks Performed

#### Diátaxis Linter

- Document type detection

- Mixed content detection

- Required section validation

- Heading hierarchy

- Focus validation

#### Google Style Linter

- Sentence length (max 20 words)

- Present tense usage

- Active voice detection

- Forbidden words

- Conversational tone

- Heading case (sentence case)

- Link text quality

### Output Format

```text
path/to/file.md
  error   line 15  Sentence too long (25 words, max 20)
  warning line 22  Use present tense: 'will create' → 'creates'
  info    line 30  Consider using contraction: 'do not' → 'don't'

✗ 1 error, 1 warning, 1 info issue
```text

## 6. Security Improvements

### Path Traversal Fixes

MCP review identified vulnerabilities:

**Before**:

```typescript
const filePath = join(projectPath, path); // Vulnerable
```text

**After**:

```typescript
const resolvedPath = resolve(path);
if (!resolvedPath.startsWith(resolve(projectPath))) {
  throw new Error("Path traversal detected");
}
```text

### Applied To

- docs-standard.ts: Fixed file path handling

- docs-lint.ts: Fixed directory traversal

- All path operations now use safe resolution

## 7. Testing Coverage

### Test Files Created

- /src/commands/docs-standard_test.ts (14 tests)

- /src/commands/docs-lint_test.ts (8 tests)

### Test Categories

1. Command functionality

2. File operations

3. Error handling

4. Security validation

5. Output formatting

## 8. CLI Integration

### New Commands Added

```typescript
// cli.ts additions
case "docs-standard":

  await docsStandardCommand(args);
  break;
case "docs-lint":

  await docsLintCommand(args);
  break;
```text

### New Tasks in deno.json

```json
{
  "tasks": {
    "docs:lint": "deno run --allow-read --allow-env src/commands/docs-lint.ts",
    "docs:check": "deno task docs:lint references/"
  }
}
```text

## 9. Future Improvements

### Planned Enhancements

1. **More Linters**

   - Microsoft style linter

   - Custom organization linters

   - Language-specific linters

2. **IDE Integration**

   - VS Code extension

   - Real-time linting

   - Quick fixes

3. **Metrics**

   - Documentation coverage

   - Quality scores

   - Trend analysis

### Proposed /docs Structure

Moving from /references to /docs:

```text
/docs/                    # More conventional location
├── [all current content]
└── api/                  # Auto-generated API docs
    └── index.html        # From deno doc
```text

Benefits:

- Matches GitHub Pages default

- Developer expectation

- Clear separation of generated content
````
