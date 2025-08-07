# Week 1 Implementation Plan: Principles Guidance System

## Overview

This plan breaks down the first week's implementation tasks for the principles guidance system, focusing on establishing
the foundation for the CLI command structure, data models, and basic functionality.

## Day-by-Day Breakdown

### Day 1 (Monday): Command Structure & Registration

**Goal**: Create the principles command and integrate it into the CLI

**Tasks**:

1. **Create principles command file** (2 hours)
   - [ ] Create `src/commands/principles.ts`
   - [ ] Define command interface matching existing patterns
   - [ ] Import `printFormatted` utility
   - [ ] Set up command option parsing

2. **Register command in CLI** (1 hour)
   - [ ] Import principles command in `cli.ts`
   - [ ] Add command case in switch statement
   - [ ] Add necessary CLI flags and aliases
   - [ ] Add help text for principles command

3. **Implement help functionality** (1 hour)
   - [ ] Create `showPrinciplesHelp()` function
   - [ ] Use 🌸 emoji for principles branding
   - [ ] Follow existing help format patterns
   - [ ] Include usage examples

### Day 2 (Tuesday): Data Models & TypeScript Interfaces

**Goal**: Define the complete data structure for principles

**Tasks**:

1. **Create principle interfaces** (3 hours)
   - [ ] Create `src/types/principle.ts`
   - [ ] Define `Principle` interface with all fields
   - [ ] Define `PrincipleWithDocs` interface
   - [ ] Define `CompatibilityReport` interface
   - [ ] Export all types for use in other modules

2. **Create directory structure** (1 hour)
   - [ ] Create `docs/principles/` directory
   - [ ] Create category subdirectories:
     - [ ] `software-development/`
     - [ ] `organizational/`
     - [ ] `engineering/`
     - [ ] `human-centered/`
   - [ ] Create placeholder `index.yaml`

### Day 3 (Wednesday): Principle Loader Implementation

**Goal**: Build the infrastructure to load principles from YAML files

**Tasks**:

1. **Create principle loader** (4 hours)
   - [ ] Create `src/utils/principle-loader.ts`
   - [ ] Implement `PrincipleLoader` class
   - [ ] Add YAML parsing with validation
   - [ ] Implement caching mechanism
   - [ ] Add error handling for malformed files
   - [ ] Create fallback documentation generator

### Day 4 (Thursday): List & Show Commands

**Goal**: Implement the --list and --show functionality

**Tasks**:

1. **Implement list command** (2 hours)
   - [ ] Create `listPrinciples()` function
   - [ ] Format output with categories
   - [ ] Use consistent emoji patterns:
     - 💻 Software Development
     - 🏢 Organizational
     - ⚙️ Engineering
     - 👥 Human-Centered
   - [ ] Show principle count and descriptions

2. **Implement show command** (2 hours)
   - [ ] Create `showPrinciple()` function
   - [ ] Add `--verbose` flag support
   - [ ] Format principle details clearly
   - [ ] Show compatibility information
   - [ ] Handle principle not found errors

### Day 5 (Friday): Selection & Storage

**Goal**: Implement principle selection and configuration storage

**Tasks**:

1. **Update configuration schema** (2 hours)
   - [ ] Extend `AichakuConfig` interface for principles
   - [ ] Update config validation
   - [ ] Ensure backward compatibility
   - [ ] Add migration for existing configs

2. **Implement selection commands** (2 hours)
   - [ ] Create `selectPrinciples()` function
   - [ ] Implement comma-separated value parsing
   - [ ] Validate principle names
   - [ ] Update `.claude/aichaku/aichaku.json`
   - [ ] Show success messages with ✅

## Code Templates

### Command Structure Template

```typescript
// src/commands/principles.ts
import { printFormatted } from "../utils/terminal-formatter.ts";
import { PrincipleLoader } from "../utils/principle-loader.ts";
import { createProjectConfigManager } from "../utils/config-manager.ts";

export interface PrinciplesOptions {
  list?: boolean;
  show?: string;
  select?: string;
  selectInteractive?: boolean;
  current?: boolean;
  remove?: string;
  clear?: boolean;
  compatibility?: string;
  verbose?: boolean;
  projectPath?: string;
  dryRun?: boolean;
}

export async function principles(options: PrinciplesOptions = {}): Promise<void> {
  try {
    if (options.list) {
      await listPrinciples(options);
      return;
    }

    // ... other command routing

    // Default: show help
    showPrinciplesHelp();
  } catch (error) {
    console.error(`❌ Error: Failed to process principles command`);
    Deno.exit(1);
  }
}
```

### Branding Pattern

```typescript
function listPrinciples(): void {
  const content = [`# 🌸 Aichaku Principles - Guiding Philosophies\n`];
  content.push(`Select from timeless principles to guide your development.\n`);

  content.push(`## 💻 Software Development\n`);
  // ... list principles

  printFormatted(content.join("\n"));
}
```

## Testing Strategy

For each implemented feature:

1. **Manual Testing**:
   - Test command execution
   - Verify output formatting
   - Check error handling
   - Validate file operations

2. **Integration Points**:
   - Ensure CLI registration works
   - Verify config updates persist
   - Check printFormatted output

## Dependencies

- Existing utilities to leverage:
  - `printFormatted` for consistent output
  - `createProjectConfigManager` for config management
  - `resolveProjectPath` for path validation
  - YAML parsing from existing deps

## Success Criteria for Week 1

By end of week:

- [ ] `aichaku principles --help` shows command help
- [ ] `aichaku principles --list` displays available principles
- [ ] `aichaku principles --show <name>` shows principle details
- [ ] `aichaku principles --select <names>` saves selections
- [ ] Configuration properly stores principle selections
- [ ] All output follows aichaku branding guidelines
- [ ] Error handling is comprehensive

## Notes

- Follow existing command patterns from `methodologies.ts`
- Maintain consistent emoji usage throughout
- Use `printFormatted` for all user-facing output
- Keep functions focused and testable
- Document all public interfaces
