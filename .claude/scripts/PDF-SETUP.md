# PDF Generation Setup

## Overview

The PDF generator script converts markdown documents (especially change summaries) to professional PDFs at the end of each project phase.

## Prerequisites

### macOS

```bash
# Install pandoc
brew install pandoc

# Install BasicTeX (lightweight TeX distribution)
brew install --cask basictex

# Add TeX to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/Library/TeX/texbin:$PATH"

# Install required LaTeX packages
sudo tlmgr update --self
sudo tlmgr install collection-fontsrecommended
```

### Linux (Debian/Ubuntu)

```bash
# Install pandoc and texlive
sudo apt-get update
sudo apt-get install pandoc texlive-xetex texlive-fonts-recommended
```

### Windows

1. Install [Pandoc](https://pandoc.org/installing.html)
2. Install [MiKTeX](https://miktex.org/download)
3. Packages will auto-install on first use

## Usage

### Basic Usage

```bash
# From project root
.claude/scripts/generate-pdf.sh .claude/output/done-*/change-summary.md
```

### Global Installation (Recommended)

```bash
# Copy to global location
sudo cp .claude/scripts/generate-pdf.sh /usr/local/bin/claude-pdf
sudo chmod +x /usr/local/bin/claude-pdf

# Now use from anywhere
claude-pdf change-summary.md
```

## Integration with Claude Code

Claude Code should automatically generate PDFs when:

1. A project phase completes
2. A change summary is finalized
3. Moving from `active-*` to `done-*` status

Example workflow:

```
1. Complete project work
2. Generate change-summary.md
3. Review with stakeholder
4. Run: claude-pdf change-summary.md
5. Archive PDF with project
```

## Font Configuration

The script uses system fonts for better appearance:

- **Main font**: Helvetica Neue (or fallback)
- **Monospace**: Menlo (or Courier)

To use custom fonts, edit the script:

```bash
--variable mainfont="Your Font"
--variable monofont="Your Mono Font"
```

## Troubleshooting

### "pandoc: command not found"

Install pandoc using the instructions above.

### "xelatex: command not found"

Install BasicTeX or texlive-xetex.

### Unicode/Emoji Warnings

Normal with xelatex. The PDF will still generate correctly.

### Missing LaTeX packages

```bash
sudo tlmgr install [package-name]
```

## Best Practices

1. **Always review** markdown before generating PDF
2. **Use descriptive filenames** with dates
3. **Store PDFs** with project archives
4. **Include metadata** in markdown (date, project, version)

## Example Change Summary Template

```markdown
# Change Summary: [Project Name]

**Date**: 2025-01-05  
**Version**: 1.0.0  
**Status**: Complete

## Overview

[Executive summary]

## Changes Implemented

- [Major change 1]
- [Major change 2]

## Technical Details

[As needed]

## Next Steps

[If applicable]

---

Generated with Claude Code + Aichaku
```
