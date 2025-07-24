# How to Manage Custom Standards

Custom standards allow you to define organization-specific or project-specific guidelines that complement Aichaku's
built-in standards. They integrate seamlessly with the standard selection system and appear in your CLAUDE.md alongside
official standards.

## Before you begin

Ensure you have:

- Aichaku installed and configured
- Access to your `~/.claude/aichaku/user/docs/standards/` directory
- A text editor for creating standard files
- Basic understanding of Markdown syntax

## Quick Start

```bash
# Create a new custom standard
aichaku standards --create-custom "Team Guidelines"

# Add it to your project
aichaku standards --add custom:team-guidelines

# Apply to CLAUDE.md
aichaku integrate
```

## Understanding Custom Standards

### What Are Custom Standards?

Custom standards are user-defined development guidelines that:

- Capture your team's specific practices and conventions
- Extend or specialize existing standards for your domain
- Document organizational requirements not covered by built-in standards
- Integrate seamlessly with Aichaku's standard management system

### How They Differ from Built-in Standards

| Aspect   | Built-in Standards                                | Custom Standards                           |
| -------- | ------------------------------------------------- | ------------------------------------------ |
| Location | `~/.claude/aichaku/methodologies/docs/standards/` | `~/.claude/aichaku/user/docs/standards/`   |
| Prefix   | None (e.g., `tdd`)                                | `custom:` (e.g., `custom:team-guidelines`) |
| Icon     | 📚                                                | 🛠️                                         |
| Updates  | Aichaku updates them                              | You maintain them                          |
| Scope    | Universal best practices                          | Organization/project specific              |

### Storage and Discovery

Custom standards are:

- Stored in `~/.claude/aichaku/user/docs/standards/`
- Automatically discovered on startup
- Named using UPPER-KEBAB-CASE.md convention
- Loaded alongside built-in standards

## Creating Custom Standards

### Using the CLI (Recommended)

The easiest way to create a custom standard:

```bash
aichaku standards --create-custom "Security Hardening"
```

This command:

1. Prompts for the standard name if not provided
2. Converts to UPPER-KEBAB-CASE filename
3. Creates a pre-formatted template
4. Opens in your default editor (if available)

### Manual Creation

You can also create standards manually:

1. Navigate to the custom standards directory:

   ```bash
   cd ~/.claude/aichaku/user/docs/standards/
   ```

2. Create a new file using UPPER-KEBAB-CASE:

   ```bash
   touch SECURITY-HARDENING.md
   ```

3. Add required frontmatter:
   ```yaml
   ---
   title: "Security Hardening Guidelines"
   description: "Additional security measures for production"
   tags: ["security", "production", "custom"]
   ---
   ```

### Template Structure

When you use `--create-custom`, Aichaku generates this template:

````markdown
---
title: "Security Hardening Guidelines"
description: "Additional security measures for production"
tags: ["security", "production", "custom"]
---

# Security Hardening Guidelines

## Overview

Brief description of what this standard covers and why it's important for your organization.

## Core Principles

List the fundamental principles this standard is based on:

1. **Principle One** - Explanation
2. **Principle Two** - Explanation
3. **Principle Three** - Explanation

## Guidelines

### Category One

#### Rule 1.1

Clear, actionable guideline.

```typescript
// ✅ Good example
const secureConfig = {
  encryption: "AES-256",
  timeout: 30000,
};

// ❌ Bad example
const config = {
  encryption: "weak",
  timeout: null,
};
```
````

#### Rule 1.2

Another guideline with examples.

### Category Two

Structure your guidelines in logical categories...

## Implementation Checklist

- [ ] Item one to verify
- [ ] Item two to verify
- [ ] Item three to verify

## References

- [Internal Wiki Link](https://wiki.company.com/security)
- [External Best Practices](https://example.com)

````
## Managing Custom Standards

### List Custom Standards

View all standards including custom ones:

```bash
# Show all standards with categories
aichaku standards --list

# Filter to show only custom standards
aichaku standards --list | grep "🛠️"

# Show detailed view with descriptions
aichaku standards --list --detailed
````

Output example:

```text
Available Standards:

Built-in Standards:
📚 nist-csf          - NIST Cybersecurity Framework
📚 tdd               - Test-Driven Development
📚 solid             - SOLID principles

Custom Standards:
🛠️ custom:team-guidelines    - Our team's coding guidelines
🛠️ custom:security-hardening - Additional security measures
```

### Edit Custom Standards

Edit your existing custom standards:

```bash
# Open in default editor
aichaku standards --edit-custom security-hardening

# Or edit directly
vim ~/.claude/aichaku/user/docs/standards/SECURITY-HARDENING.md

# On macOS, open in default app
open ~/.claude/aichaku/user/docs/standards/SECURITY-HARDENING.md
```

### Copy Custom Standards

Create variants of your existing standards:

```bash
# Copy to create a specialized version
aichaku standards --copy-custom security-hardening security-production

# This creates a new file with the same content
# Edit the new file to specialize it
aichaku standards --edit-custom security-production
```

### Delete Custom Standards

Remove your custom standards when you no longer need them:

```bash
# Remove the standard file
aichaku standards --delete-custom old-guidelines

# Also remove from any projects using it
aichaku standards --remove custom:old-guidelines

# Confirm deletion when prompted
# Use --force to skip confirmation
aichaku standards --delete-custom old-guidelines --force
```

## Using Custom Standards in Projects

### Add to Project

Add your custom standards to your project:

```bash
# Add a single custom standard
aichaku standards --add custom:team-guidelines

# Add multiple standards including custom
aichaku standards --add tdd,custom:security-hardening,clean-arch

# Add all standards from a category
aichaku standards --add-category security
```

### View Project Standards

Check which standards are active:

```bash
# Show current project standards
aichaku standards --show

# Show with full descriptions
aichaku standards --show --detailed
```

Output example:

```text
Current Project Standards:
- 📚 tdd (Built-in)
- 🛠️ custom:team-guidelines (Custom)
- 📚 solid (Built-in)
- 🛠️ custom:security-hardening (Custom)
```

## Integration with CLAUDE.md

When you run `aichaku integrate`, custom standards appear in CLAUDE.md with clear attribution:

`````markdown
<!-- AICHAKU:STANDARDS:START -->

## 📚 Selected Standards & Guidelines

🪴 Aichaku: Based on your project configuration, follow these standards when generating code:

### TDD

[Built-in standard content...]

---

### TEAM-GUIDELINES

> 📍 **Source**: Custom standard from ~/.claude/aichaku/user/docs/standards/TEAM-GUIDELINES.md

[Your custom standard content...]

---

<!-- AICHAKU:STANDARDS:END -->

````markdown
## Best Practices

### Use Clear Naming Conventions

- **Use descriptive names**: `api-design-patterns` not `api`
- **Include scope**: `mobile-security` vs generic `security`
- **Avoid conflicts**: Don't use names similar to built-in standards
- **Be consistent**: Establish team naming patterns

### Follow Content Guidelines

Write effective custom standards:

```text
## DO:
✅ Provide clear, actionable rules
✅ Include both good and bad examples
✅ Reference official documentation
✅ Keep focused on specific domain
✅ Use consistent formatting

## DON'T:
❌ Duplicate built-in standards
❌ Write vague guidelines
❌ Include outdated practices
❌ Mix unrelated concerns
```
````
`````

### Organize Your Standards

Structure your custom standards library:

```text
~/.claude/aichaku/user/docs/standards/
├── API-DESIGN.md              # REST API conventions
├── DATABASE-PATTERNS.md       # Data layer guidelines
├── MOBILE-SECURITY.md         # Mobile-specific security
├── REACT-COMPONENTS.md        # Frontend patterns
└── TEAM-CONVENTIONS.md        # General team rules
```

Use consistent tags for easy filtering:

- `team` - Team-wide conventions
- `frontend` - UI/UX guidelines
- `backend` - Server-side patterns
- `security` - Security enhancements
- `testing` - Test strategies

## Sharing Custom Standards

### Version Control

Track standards in your team repository:

```bash
# Create standards directory in your repo
mkdir -p .team/standards
cp ~/.claude/aichaku/user/docs/standards/*.md .team/docs/standards/

# Add to git
git add .team/standards
git commit -m "Add team development standards"
```

### Choose Distribution Methods

1. **Git Repository**

   ```bash
   # Clone team standards
   git clone https://github.com/team/standards.git
   cp standards/*.md ~/.claude/aichaku/user/docs/standards/
   ```

2. **Shared Drive**
   - Store in team shared folder
   - Document installation process
   - Version with dates

3. **Installation Script**

   ```bash
   #!/bin/bash
   # install-standards.sh
   STANDARDS_DIR="$HOME/.claude/aichaku/user/standards"
   mkdir -p "$STANDARDS_DIR"

   curl -o "$STANDARDS_DIR/API-DESIGN.md" \
     https://standards.company.com/API-DESIGN.md
   ```

## Troubleshooting

### Common Issues

#### Standard Not Showing Up

**Problem**: Your created standard doesn't appear in `--list`

**Solutions**:

- Check filename uses UPPER-KEBAB-CASE.md
- Verify location: `~/.claude/aichaku/user/docs/standards/`
- Ensure valid frontmatter (YAML format)
- Look for parsing errors in the file

#### Integration Not Including Custom Standard

**Problem**: `aichaku integrate` doesn't add your custom standard

**Solutions**:

- Confirm standard is added to project: `aichaku standards --show`
- Check for typos in standard name
- Use full prefix: `custom:standard-name`
- Run with debug: `AICHAKU_DEBUG=1 aichaku integrate`

#### File Naming Issues

**Problem**: Your standard has wrong name or format

**Solutions**:

```bash
# Rename to correct format
mv wrong-name.md CORRECT-NAME.md

# Remove spaces and special characters
mv "My Standard.md" MY-STANDARD.md
```

#### Migration from Old Structure

**Problem**: Your standards in old location aren't recognized

**Solution**: Run migration

```bash
# Automatic migration
aichaku migrate --custom-standards-only

# Manual migration
mv ~/.claude/docs/standards/custom/* ~/.claude/aichaku/user/docs/standards/
```

### Use Debug Commands

Troubleshoot issues with these commands:

```bash
# Check if standard is discovered
aichaku standards --list --debug

# Verify file location and permissions
ls -la ~/.claude/aichaku/user/docs/standards/

# Check specific standard loading
AICHAKU_DEBUG=1 aichaku standards --show

# Validate standard format
aichaku standards --validate custom:my-standard

# Show full paths
aichaku standards --list --show-paths
```

## Migration from Legacy Custom Standards

If you have custom standards from older Aichaku versions:

### Use Automatic Migration

```bash
# Migrate only custom standards
aichaku migrate --custom-standards-only

# Full migration including all settings
aichaku migrate
```

### Use Manual Migration

1. **Locate old standards**:

   ```bash
   # Common legacy locations
   ~/.claude/docs/standards/custom/
   ~/.claude/.aichaku/docs/standards/
   ~/Documents/aichaku-standards/
   ```

2. **Copy to new location**:

   ```bash
   # Create directory if needed
   mkdir -p ~/.claude/aichaku/user/standards

   # Copy standards
   cp ~/.claude/docs/standards/custom/*.md \
      ~/.claude/aichaku/user/docs/standards/
   ```

3. **Update names if needed**:

   ```bash
   # Rename to UPPER-KEBAB-CASE
   cd ~/.claude/aichaku/user/standards
   for f in *.md; do
     new_name=$(echo "$f" | tr '[:lower:]' '[:upper:]' | tr ' ' '-')
     mv "$f" "$new_name"
   done
   ```

4. **Update project references**:
   ```bash
   # In each project using custom standards
   aichaku standards --refresh
   aichaku integrate
   ```

### Verify After Migration

```bash
# Verify all standards are available
aichaku standards --list

# Check specific migrated standard
aichaku standards --info custom:my-standard

# Test in a project
aichaku standards --add custom:my-standard
aichaku integrate
```

---

Remember: Custom standards are a powerful way to codify your team's specific practices while leveraging Aichaku's
integration capabilities. Keep them focused, well-documented, and actively maintained for maximum benefit.
