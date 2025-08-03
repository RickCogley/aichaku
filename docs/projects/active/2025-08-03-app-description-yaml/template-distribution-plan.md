# Template Distribution Plan

## Overview

This document outlines how app description templates will be distributed during `aichaku init` and `aichaku upgrade`
commands.

## Template Storage Location

Templates should be stored in the Aichaku package at:

```
docs/core/templates/app-descriptions/
├── base-template.yaml          # Comprehensive template with all options
├── web-app-template.yaml       # Web application focused
├── api-service-template.yaml   # API/microservice focused
├── static-site-template.yaml   # Static site (SSG) focused
├── cli-tool-template.yaml      # CLI tool focused
└── README.md                   # Template documentation
```

## User Flow

### During `aichaku init`

```
$ aichaku init

🪴 Aichaku: Initializing Aichaku configuration...
✅ Created .claude/aichaku/aichaku.json
✅ Installed methodologies and standards

Would you like to describe your application for better Claude Code context? (Y/n) y

What type of application is this?
1) Web Application (React, Vue, etc.)
2) API Service (REST, GraphQL, microservice)
3) Static Site (Blog, docs, marketing)
4) CLI Tool (Command line application)
5) General/Other

Selection: 1

🪴 Aichaku: Creating app description template...
✅ Created .claude/aichaku/user/app-description.yaml (web application template)

📝 Next steps:
1. Edit .claude/aichaku/user/app-description.yaml to describe your app
2. Run 'aichaku integrate' to update your CLAUDE.md
3. See the template for examples and documentation

💡 Tip: The app description helps Claude Code understand your specific tech stack,
   architecture patterns, and business domain.
```

### During `aichaku upgrade`

```
$ aichaku upgrade

🪴 Aichaku: Checking for updates...
✅ Upgraded from v0.40.1 to v0.41.0

🆕 New feature available: App Description YAML
   Provide Claude Code with rich context about your application.

Would you like to add an app description? (Y/n) y

[Same flow as init...]
```

### For Existing Users Without Prompt

```
$ aichaku app-description init

🪴 Aichaku: Setting up app description...

What type of application is this?
[... same flow ...]
```

## Implementation Details

### Template Selection Logic

```typescript
// src/commands/init.ts (pseudo-code)
async function promptForAppDescription(): Promise<void> {
  const wantsAppDesc = await confirm(
    "Would you like to describe your application for better Claude Code context?",
  );

  if (!wantsAppDesc) return;

  const appType = await select({
    message: "What type of application is this?",
    options: [
      { value: "web-app", label: "Web Application (React, Vue, etc.)" },
      { value: "api-service", label: "API Service (REST, GraphQL, microservice)" },
      { value: "static-site", label: "Static Site (Blog, docs, marketing)" },
      { value: "cli-tool", label: "CLI Tool (Command line application)" },
      { value: "general", label: "General/Other" },
    ],
  });

  await copyAppDescriptionTemplate(appType);
}

async function copyAppDescriptionTemplate(type: string): Promise<void> {
  const templateName = type === "general" ? "base" : type;
  const sourcePath = `docs/core/templates/app-descriptions/${templateName}-template.yaml`;
  const destPath = ".claude/aichaku/user/app-description.yaml";

  // Create user directory if needed
  await fs.ensureDir(".claude/aichaku/user");

  // Copy template
  await fs.copy(sourcePath, destPath);

  console.log(`✅ Created ${destPath} (${type} template)`);
}
```

### Upgrade Detection

```typescript
// src/commands/upgrade.ts
async function checkNewFeatures(oldVersion: string, newVersion: string) {
  const features = [];

  // App description feature added in v0.41.0
  if (semver.lt(oldVersion, "0.41.0") && semver.gte(newVersion, "0.41.0")) {
    features.push({
      name: "App Description YAML",
      description: "Provide Claude Code with rich context about your application",
      setup: promptForAppDescription,
    });
  }

  return features;
}
```

## Template Structure

### Base Template (Comprehensive)

- All possible sections with extensive comments
- Examples for each field
- Links to documentation

### Specialized Templates

Each template is pre-configured for its use case:

**Web App Template:**

- Frontend framework options prominent
- UI/UX related fields
- Browser-specific concerns

**API Service Template:**

- API documentation sections expanded
- Microservice patterns
- Database focus

**Static Site Template:**

- SSG-specific fields
- No database/backend sections
- CDN and build optimization focus

**CLI Tool Template:**

- Command structure documentation
- Package distribution info
- Minimal web-related fields

## User Experience Considerations

### Smart Defaults

- Pre-fill common choices based on app type
- Comment out optional sections
- Include inline examples

### Progressive Disclosure

```yaml
# Basic fields (uncommented by default)
application:
  name: "My Application"
  type: "web-application"
  description: "Brief description here"

# Advanced fields (commented by default)
# stack:
#   language: "typescript"
#   framework: "react"
```

### Validation Feedback

```
$ aichaku integrate

🪴 Aichaku: Validating app description...
⚠️  Missing required field: application.name
⚠️  Invalid value for application.type (use: web-application, api-service, etc.)

Please fix these issues in .claude/aichaku/user/app-description.yaml
```

## Migration Strategy

### For Existing Aichaku Users

1. Show notification on next `aichaku integrate`
2. Offer one-time prompt to add app description
3. Can skip and add later with `aichaku app-description init`

### Backwards Compatibility

- App description is completely optional
- Missing file doesn't break anything
- Existing CLAUDE.md files work unchanged

## Documentation Updates

### Help Text

```
$ aichaku help app-description

Manage application description for Claude Code context

Commands:
  init      Create a new app description from template
  validate  Check app description for errors
  show      Display current app description

Examples:
  aichaku app-description init
  aichaku app-description validate
  aichaku app-description show
```

### README Updates

- New section: "Describing Your Application"
- Quick start guide
- Link to full documentation

## Success Metrics

- 80% of new users create app description during init
- 50% of existing users add app description after upgrade
- <5 minutes to complete basic app description
- Zero breaking changes to existing workflows

## Future Enhancements

1. **Auto-detection** (v0.42.0)
   - Detect framework from package.json
   - Suggest values based on file structure

2. **Template Gallery** (v0.43.0)
   - Community-contributed templates
   - Industry-specific templates

3. **Interactive Editor** (v0.44.0)
   - TUI for editing YAML
   - Real-time validation
