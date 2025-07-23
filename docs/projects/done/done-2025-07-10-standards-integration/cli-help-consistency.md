# CLI Help Output Consistency

## Issue Description

There's an inconsistency between `aichaku --help` and `aichaku help` outputs:

### Current Behavior

- `aichaku --help`: Shows standard CLI help with basic formatting

  - Plain text without visual hierarchy

  - Looks "bare bones" compared to the branded experience

  - Example section shows:

    ```text
    Examples:
      # Initialize in current project
      aichaku init

      # Initialize globally for all projects
      aichaku init --global
    ```

- `aichaku help`: Shows beautifully branded knowledge base

  - Nice emoji usage (📚, 🛡️, 📋)

  - Clear visual sections with dividers

  - Consistent with Aichaku's 🪴 branding

  - Example output:

    ```text
    🪴 Aichaku Knowledge Base
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📚 Development Methodologies
      aichaku help shape-up     Learn about Shape Up
    ```

### Expected Behavior

Both commands should provide a consistent, polished experience that reflects
Aichaku's brand identity.

## Proposed Solution

### Option 1: Enhance --help output

- Strip any Markdown that might be leaking through

- Add consistent branding elements

- Ensure emoji and formatting match the overall Aichaku style

### Option 2: Redirect --help to help subcommand

- Make `--help` show the same output as `help`

- Add a `--cli-help` flag for those who need the raw CLI syntax

### Option 3: Two-tier help system

- `--help`: Quick reference with consistent branding

- `help`: Full knowledge base and learning system

## Implementation Notes

- Check `src/cli.ts` for --help flag handling

- Ensure consistent use of Aichaku branding (🪴)

- Test on different terminal types for compatibility

- Consider terminal width for formatting

## Priority

Medium - This affects first impressions and user experience consistency

---

_Added: 2025-01-13_
