# Implementation Guide: PDF Generation Integration

## Prerequisites

- TypeScript/Deno development environment

- Understanding of PDF generation tools (pandoc, LaTeX)

- Knowledge of CLI command development

- Familiarity with file system operations

## Overview

This guide provides step-by-step instructions to integrate PDF generation
capabilities into Aichaku.

## Phase 1: Core PDF Module (2 hours)

### 1. Create PDF generator module

````typescript
// src/pdf/generator.ts
export class PDFGenerator {
  async generate(inputPath: string, outputPath?: string): Promise<PDFResult> {
    // Check dependencies
    const deps = await this.checkDependencies();
    if (!deps.ready) {
      return { success: false, error: deps.message };
    }

    // Determine output path
    const output = outputPath || inputPath.replace(".md", ".pdf");
    // Run pandoc with appropriate engine
    const result = await this.runPandoc(inputPath, output, deps.engine);
    return result;
  }

  private async checkDependencies(): Promise<DependencyCheck> {
    // Check for pandoc
    // Check for latex engines
    // Return best available option
  }

  private async runPandoc(
    input: string,
    output: string,
    engine: string,
  ): Promise<PDFResult> {
    // Execute pandoc with proper flags
    // Handle Unicode based on engine
    // Return success/failure with details
  }
}
```text

### 2. Create setup checker

```typescript
// src/pdf/setup.ts
export class PDFSetup {
  async check(): Promise<SetupStatus> {
    return {
      pandoc: await this.checkPandoc(),
      latex: await this.checkLatex(),
      fonts: await this.checkFonts(),
      ready: false, // true if all pass
    };
  }

  async showSetupGuide(): Promise<void> {
    const status = await this.check();
    // Show platform-specific installation instructions
    // Based on what's missing
  }
}
```text

## Phase 2: Settings Integration (1 hour)

### 1. Extend settings type

```typescript
// types.ts
export interface PDFSettings {
  enabled: boolean;
  autoGenerate: string[]; // ["final-summary", "change-summary"]
  engine?: "xelatex" | "pdflatex" | "auto";
  fonts?: {
    main?: string;
    mono?: string;
    sans?: string;
  };
  coverPage?: boolean;
  tableOfContents?: boolean;
}

export interface Settings {
  // ... existing settings
  pdf?: PDFSettings;
}
```text

### 2. Default PDF settings

```typescript
// src/config/defaults.ts
export const DEFAULT*PDF*SETTINGS: PDFSettings = {
  enabled: true,
  autoGenerate: ["final-summary", "change-summary"],
  engine: "auto",
  coverPage: false,
  tableOfContents: false,
};
```text

## Phase 3: CLI Integration (1 hour)

### 1. Add PDF subcommand

```typescript
// cli.ts
const pdfCommand = new Command()
  .name("pdf")
  .description("PDF generation utilities")
  .action(() => pdfCommand.showHelp());

pdfCommand
  .command("generate <file>")
  .description("Generate PDF from markdown file")
  .option("-o, --output <path>", "Output file path")
  .action(async (file: string, options: { output?: string }) => {
    const generator = new PDFGenerator();
    const result = await generator.generate(file, options.output);
    // Handle result
  });

pdfCommand
  .command("setup")
  .description("Check and setup PDF generation dependencies")
  .action(async () => {
    const setup = new PDFSetup();
    await setup.showSetupGuide();
  });

pdfCommand
  .command("check")
  .description("Check if PDF generation is ready")
  .action(async () => {
    const setup = new PDFSetup();
    const status = await setup.check();
    // Display status
  });
```text

## Phase 4: Auto-generation Integration (1 hour)

### 1. Hook into work completion

```typescript
// When moving to done or creating final summary
async function completeWork(workDir: string) {
  // Create final summary (existing)
  const summaryPath = join(workDir, "FINAL-SUMMARY.md");
  // Check PDF generation settings
  const settings = await loadSettings();
  if (
    settings.pdf?.enabled && settings.pdf.autoGenerate.includes("final-summary")
  ) {
    console.log("📄 Generating PDF...");
    const generator = new PDFGenerator();
    const result = await generator.generate(summaryPath);
    if (result.success) {
      console.log(`✅ PDF generated: ${result.path}`);
    } else {
      console.log(`⚠️  PDF generation failed: ${result.error}`);
      console.log("   Run 'aichaku pdf setup' for help");
    }
  }
}
```text

### 2. Add to relevant commands

- `aichaku complete` - When marking work as done

- `aichaku close` - When closing a work folder

- Manual trigger via `aichaku pdf generate`

## Phase 5: Documentation & Testing (1 hour)

### 1. Update documentation

- Add PDF section to README

- Create PDF-GUIDE.md with detailed setup

- Update CLAUDE.md with PDF conventions

### 2. Create templates

```markdown
<!-- templates/cover-page.md -->

# &#123;&#123;title&#125;&#125;

**Project**: &#123;&#123;project&#125;&#125; **Date**:
&#123;&#123;date&#125;&#125; **Version**: &#123;&#123;version&#125;&#125;
**Status**: &#123;&#123;status&#125;&#125;

---

Generated with Aichaku
```text

### 3. Test scenarios

- Missing dependencies handling

- Unicode character support

- Large document performance

- Cross-platform compatibility

## Migration Path

1. Move existing PDF scripts to legacy folder

2. Preserve compatibility during transition

3. Auto-detect existing scripts and suggest migration

4. Update methodologies to mention PDF generation

## Success Metrics

- PDF generation works on 3 major platforms

- Clear error messages for missing dependencies

- < 5 seconds for typical document

- Business-ready output quality
````
