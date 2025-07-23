# Release Notes - v0.4.2

## Overview

This release improves the user experience of the `aichaku init` command with
better messaging and helpful guidance.

## What's Changed

### Enhanced Init Command Output

- **Better visual presentation** with Unicode box borders for success message

- **Global detection** - Shows when global Aichaku is detected

- **Consistent terminology** - Changed "installed" to "initialized" to match
  command name

- **Helpful next steps** including:

  - Reminder to run `aichaku integrate` to add to CLAUDE.md

  - List of available commands with brief descriptions

  - Link to GitHub repository for more information

  - Help command reminder

### Improved User Guidance

The init command now provides a complete onboarding experience:

````text
🎯 Next steps:

   • Run 'aichaku integrate' to add Aichaku to your CLAUDE.md
   • Start Claude Code in your project
   • Customize in .claude/user/ (optional)

📚 Commands:

   • aichaku integrate - Add to project's CLAUDE.md
   • aichaku upgrade   - Update methodologies
   • aichaku --help    - Show all commands

💡 Aichaku adapts to your language - just start working naturally!

🔗 Learn more: https://github.com/RickCogley/aichaku
```text

## Technical Details

- Updated `cli.ts` to include command hints and GitHub link

- Improved visual hierarchy with emoji indicators

- Added box border for success message using Unicode characters

- Consistent messaging across init and fetcher modules

## Commit

- improve init command output with better messaging (c2edce4)

- add helpful command hints and GitHub link to init output

## Upgrade Instructions

```bash
# Update the CLI tool
deno install -g -A -n aichaku --force jsr:@rick/aichaku@0.4.2/cli

# Update methodologies (if needed)
aichaku upgrade --global
```text
````
