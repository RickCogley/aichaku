# Markdown Standards for Aichaku

**Universal formatting standards for all Markdown documentation in the Aichaku ecosystem.**

This document establishes mandatory formatting rules that ensure professional, consistent, and maintainable
documentation across all Aichaku projects, methodologies, and standards.

## Quick Reference Checklist

Before committing any Markdown file, ensure:

### ✅ Professional Standards (Mandatory)

- [ ] **Code blocks have language specified** (``bash`,``json``, `````text``)
- [ ] **Proper names capitalized** (GitHub, TypeScript, Markdown, JavaScript, Aichaku)
- [ ] **Emphasis uses underscores** (`_text_`) to match Prettier formatting
- [ ] **Strong emphasis uses double asterisks** (`**text**`) not underscores
- [ ] **Headings surrounded by blank lines** (before and after)
- [ ] **Lists surrounded by blank lines** (before and after each list)
- [ ] **Files end with single newline** (no trailing blank lines)
- [ ] **Fenced code blocks** (``````` not indented blocks)
- [ ] **Consistent horizontal rules** (use `---`)

## Detailed Standards

### Code Block Language Specification

**Why**: Language specification enables syntax highlighting on GitHub, improves readability, and looks professional.

**Rule**: Every fenced code block must specify a language.

```bash
# ✅ Good - specify bash for commands
aichaku init --global
```

```text
# ✅ Good - use 'text' for output/configuration examples
✅ Setup completed successfully
🪴 Aichaku: Ready to create documentation
```

```mermaid
# ✅ Good - specify mermaid for diagrams
graph TD
    A[Start] --> B[Process]
```

```Markdown
<!-- ❌ Bad - no language specified -->
```

### Proper Name Capitalization

**Why**: Consistent capitalization shows attention to detail and respects brand guidelines.

**Mandatory Names**:

- **Aichaku** (not aichaku)
- **GitHub** (not GitHub or GitHub)
- **TypeScript** (not TypeScript or TypeScript)
- **JavaScript** (not JavaScript or JavaScript)
- **Markdown** (not Markdown when referring to the language)

```Markdown
✅ Good: "Push your changes to GitHub and run TypeScript checks" ❌ Bad: "Push
your changes to GitHub and run TypeScript checks"
```

### Emphasis Style Consistency

**Why**: Consistency across all documentation improves readability and maintainability.

**Rule**: Always use asterisks for emphasis, never underscores.

```Markdown
✅ Good: Use _emphasis_ and **strong emphasis** with asterisks ❌ Bad: Don't use
_emphasis_ or **strong emphasis** with underscores
```

### Heading Spacing

**Why**: Proper spacing makes documents scannable and improves visual hierarchy.

**Rule**: Always surround headings with blank lines.

```Markdown
✅ Good: Previous paragraph content.

## Section Heading

Next paragraph content.

❌ Bad: Previous paragraph content.

## Section Heading

Next paragraph content.
```

### List Spacing

**Why**: Proper list spacing improves readability and prevents parsing issues.

**Rule**: Lists must be preceded and followed by blank lines.

```Markdown
✅ Good: This is a paragraph.

- List item 1
- List item 2
- List item 3

This is another paragraph.

❌ Bad: This is a paragraph.

- List item 1
- List item 2 This is another paragraph.
```

### File Structure Standards

**Rule**: All Markdown files must follow this structure:

```Markdown
# Document Title

Brief description or purpose statement.

## Prerequisites (if applicable)

- List requirements
- Include version numbers where relevant

## Main Content Sections

Use descriptive headings that follow logical hierarchy.

## Related Documentation (if applicable)

- [Link Text](url) - Brief description

---

_Created: YYYY-MM-DD_ _Last updated: YYYY-MM-DD_
```

## Content Quality Standards

### Clear, Descriptive Headings

- Use specific, action-oriented headings
- Avoid generic terms like "Overview" without context
- Follow logical hierarchy (H1 → H2 → H3)

### Code Examples

- All code examples must work as written
- Include error handling examples where relevant
- Provide expected output when helpful

### Links and References

- Use descriptive link text, never "click here" or bare URLs
- Include brief descriptions for external links
- Verify all links work before committing

## Automation Integration

### Pre-commit Hooks

This repository includes pre-commit hooks that automatically:

1. **Format** Markdown with Prettier
2. **Lint** with Markdownlint-cli2
3. **Validate** all standards compliance

### Editor Integration

The `.vscode/settings.json` and `.editorconfig` files ensure:

- Consistent indentation (2 spaces)
- Automatic formatting on save
- Real-time linting feedback
- Proper line endings (LF)

### Document Generation

Use the provided script for new documents:

```bash
# Create a new document with proper formatting
./scripts/new-doc.sh "Document Title" path/to/file.md

# For methodology-specific documents
./scripts/new-doc.sh "Feature Pitch" docs/projects/active/my-project/pitch.md shape-up
```

## Methodology-Specific Extensions

While these standards are universal, specific methodologies may add requirements:

### Shape Up Documents

- Include Appetite, Problem, Solution, Rabbit Holes, No-gos sections
- Use hill charts with Mermaid diagrams where applicable

### Scrum Documents

- Include Sprint Goals, User Stories, Acceptance Criteria
- Use consistent story format: "As a [user], I want [goal], so that [benefit]"

### Kanban Documents

- Include workflow states and WIP limits
- Use state diagrams to visualize flow

## Error Prevention

### Common Mistakes to Avoid

1. **Missing language specifications**
   ````Markdown
   ❌ Bad:
   ```text
   code here
   ````
   ✅ Good:
   ```bash
   code here
   ```

2. **Inconsistent emphasis**
   ```Markdown
   ❌ Bad: Mix of _underscores_ and _asterisks_ ✅ Good: Consistent _asterisks_
   throughout
   ```

3. **Poor heading hierarchy**
   ```Markdown
   ❌ Bad: Jump from H1 to H3

   # Title

   ### Subsection

   ✅ Good: Logical progression

   # Title

   ## Section

   ### Subsection
   ```

### Validation Commands

Before committing, run:

```bash
# Format all Markdown files
npx prettier --write "**/*.md"

# Lint all Markdown files
npx Markdownlint-cli2 "**/*.md"

# Check specific file
npx Markdownlint-cli2 "path/to/file.md"
```

## Integration with Aichaku Methodologies

These standards integrate seamlessly with all Aichaku methodologies:

- **Templates** are pre-formatted to meet these standards
- **Generated documents** automatically follow these rules
- **Methodology guides** demonstrate proper formatting
- **MCP servers** can validate compliance automatically

## Compliance Verification

Documents are automatically checked for:

- **MD040**: Code block language specification
- **MD044**: Proper name capitalization
- **MD049**: Asterisk emphasis style
- **MD022**: Heading spacing
- **MD032**: List spacing
- **MD046**: Fenced code block style

## Summary

These standards ensure that all Aichaku documentation:

1. **Looks professional** on GitHub and other platforms
2. **Maintains consistency** across all projects and methodologies
3. **Enables automation** through reliable formatting
4. **Improves maintainability** through clear structure
5. **Supports accessibility** through proper semantic markup

**Remember**: These are not optional guidelines but mandatory standards for all Markdown content in the Aichaku
ecosystem. The automated tooling enforces compliance, making it easy to maintain high-quality documentation without
manual effort.

---

_Created: 2025-07-23_\
_Last updated: 2025-07-23_\
_Standard: Universal (applies to all methodologies)_
