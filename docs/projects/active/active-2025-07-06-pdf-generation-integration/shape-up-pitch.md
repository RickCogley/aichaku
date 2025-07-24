# Pitch: Integrated PDF Generation for Business Communication

## Problem

Aichaku enforces good practices like creating final summaries, but stops short of making them shareable with business
stakeholders. Markdown files aren't suitable for:

- Executive presentations
- Client deliverables
- Archive documentation
- Non-technical stakeholders

The PDF generation capability exists but is hidden in scripts, requiring manual discovery and setup.

**Update**: We discovered SharePoint renders Markdown files natively, which provides an immediate solution for many
business users. However, PDF generation is still valuable for formal documents, offline sharing, and organizations
without SharePoint.

## Appetite

Medium batch - 4-6 hours. This is a core feature that completes the "professional output" story.

## Solution

### 1. Built-in PDF Generation

Make PDF generation a first-class feature:

```typescript
// In settings
{
  "pdf": {
    "enabled": true,
    "autoGenerate": ["final-summary", "change-summary"],
    "engine": "xelatex", // or "pdflatex"
    "fonts": {
      "main": "Helvetica Neue",
      "mono": "Menlo"
    }
  }
}
```

### 2. Smart PDF Commands

```bash
# Generate PDF for any markdown
aichaku pdf generate change-summary.md

# Setup PDF dependencies
aichaku pdf setup

# Check PDF readiness
aichaku pdf check
```

### 3. Automatic Generation

When completing work:

1. Create FINAL-SUMMARY.md (always)
2. If pdf.enabled && pdf.autoGenerate includes "final-summary"
3. Generate PDF automatically
4. Show success/failure message

### 4. Setup Wizard

```bash
$ aichaku pdf setup

📄 PDF Generation Setup
====================

Checking your system...
✅ pandoc: Found v3.1.9
❌ LaTeX: Not found

To generate PDFs, you need:

macOS:
  brew install pandoc basictex
  sudo tlmgr update --self
  sudo tlmgr install collection-fontsrecommended

Linux:
  sudo apt-get install pandoc texlive-xetex texlive-fonts-recommended

Windows:
  1. Install Pandoc: https://pandoc.org/installing.html
  2. Install MiKTeX: https://miktex.org/download

After installation, run 'aichaku pdf check' to verify.
```

### 5. Business-Friendly Features

- **Cover pages** with project metadata
- **Table of contents** for long documents
- **Professional styling** out of the box
- **Logo support** for branding
- **Batch generation** for multiple files

## Implementation Approach

1. **Core PDF module** (`src/pdf/`)
   - Generator class
   - Dependency checker
   - Template system

2. **CLI integration**
   - New `pdf` subcommand
   - Settings integration
   - Auto-generation hooks

3. **Smart defaults**
   - Detect best engine (xelatex > pdflatex)
   - Fallback for missing fonts
   - Handle Unicode gracefully

4. **Error handling**
   - Clear messages for missing dependencies
   - Suggestions for fixes
   - Partial success handling

## Nice-to-haves

- Custom templates for different document types
- Syntax highlighting in code blocks
- Watermarks for draft documents
- Email-ready PDF optimization

## Rabbit Holes (NOT doing)

- Building our own PDF engine
- Complex LaTeX customization UI
- Cloud-based PDF generation
- Real-time preview

## No-gos

- Don't require PDF generation (keep it optional)
- Don't bundle LaTeX (too large)
- Don't break existing workflows
