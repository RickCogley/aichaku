/**
 * Help information for app-description command
 */

export function showAppDescriptionHelp(): void {
  console.log(`
🪴 Aichaku App Description - Provide Claude Code with application context

Manage application descriptions that help Claude Code understand your specific
tech stack, architecture, and business domain.

## Usage

  aichaku app-description [options]

## Options

  --validate    Validate the current app description YAML
  --show        Display the current app description
  --type        Specify template type (web-app, api-service, static-site, cli-tool)
  -p, --path    Project path (default: current directory)
  -s, --silent  Silent mode - minimal output

## Examples

  # Create new app description (interactive)
  aichaku app-description

  # Create with specific type
  aichaku app-description --type static-site

  # Validate existing description
  aichaku app-description --validate

  # Show current description
  aichaku app-description --show

## Template Types

  - web-app      Web applications (React, Vue, Angular, etc.)
  - api-service  REST APIs, GraphQL services, microservices
  - static-site  Static sites, blogs, JAMstack applications
  - cli-tool     Command-line tools and utilities
  - base         General purpose template (default)

## Workflow

  1. Run 'aichaku app-description' to create template
  2. Edit .claude/aichaku/user/app-description.yaml
  3. Run 'aichaku app-description --validate' to check
  4. Run 'aichaku integrate' to update CLAUDE.md
  5. Claude Code now has rich application context!

The app description is completely optional but helps Claude Code provide
more relevant and accurate assistance for your specific application.
`);
}
