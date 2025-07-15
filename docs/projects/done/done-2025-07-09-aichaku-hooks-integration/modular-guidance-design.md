# Modular Guidance System Design

## Overview

Based on analysis of existing security implementations in Nagare and Salty, plus the new 15-factor app guidelines, this document outlines how Aichaku can provide modular, reusable guidance sections.

## Guidance Categories

### 1. **Security Standards**

#### OWASP Top 10
- **Source**: Extracted from Nagare and Salty CLAUDE.md files
- **Variations**: 
  - Generic (all projects)
  - Web application specific
  - CLI tool specific
  - Library specific
- **Integration**: Can be included via `--sections=owasp` flag

#### ISO 27001 Compliance
- **Key Requirements**:
  - Document all security decisions
  - Maintain audit trails
  - Security review processes
  - Compliance checks
- **Integration**: Pairs well with OWASP for full compliance

### 2. **Application Architecture**

#### 15-Factor Apps (Cloud-Native)
- **Source**: fifteen_factor_claude_code_guide.md
- **Covers**: Modern cloud-native application patterns
- **Implementation Phases**: 4 phases over 8 weeks
- **Best For**: SaaS, microservices, containerized apps

#### 15-Factor Static Sites
- **Source**: static_website_factors_checklist.md  
- **Covers**: Static site best practices
- **Implementation Phases**: 5 weeks
- **Best For**: Documentation sites, marketing sites, blogs

#### 12-Factor Apps (Classic)
- **Backward Compatibility**: For teams using original 12-factor
- **Subset**: Of the 15-factor approach

### 3. **Development Standards**

#### Conventional Commits
- **Format**: `type(scope): description`
- **InfoSec Extension**: Security impact documentation
- **Integration**: Hook-based enforcement possible

#### Code Style Guidelines
- **Language Specific**: TypeScript, Python, Go, etc.
- **Tool Integration**: Prettier, Black, gofmt
- **Hook Support**: Auto-format on commit

### 4. **Team Practices**

#### Security Review Process
- **5-Step Process**: From global CLAUDE.md
- **Customizable**: Per team requirements
- **Checklist Format**: Easy to follow

#### DevSkim/CodeQL Configuration
- **Suppression Syntax**: Detailed guidance
- **False Positive Handling**: Best practices
- **Directory Exclusions**: Common patterns

## Implementation Architecture

```
.claude/
├── methodologies/          # Existing methodology files
├── standards/              # New modular guidance
│   ├── security/
│   │   ├── owasp-generic.md
│   │   ├── owasp-webapp.md
│   │   ├── owasp-cli.md
│   │   ├── iso-27001.md
│   │   └── security-review-process.md
│   ├── architecture/
│   │   ├── 15-factor-apps.md
│   │   ├── 15-factor-static.md
│   │   └── 12-factor-apps.md
│   ├── development/
│   │   ├── conventional-commits.md
│   │   ├── code-style-typescript.md
│   │   └── code-style-python.md
│   └── compliance/
│       ├── devskim-config.md
│       └── codeql-config.md
└── user/
    └── standards/          # Custom team standards

```

## Modular Section Format

Each guidance module follows this structure:

```markdown
---
id: owasp-webapp
title: OWASP Top 10 for Web Applications
tags: [security, webapp, compliance]
methodologies: [all]  # or specific ones
requires: []  # dependencies on other modules
---

<!-- MODULE:START -->
## [Title]

### Quick Reference
[Checklist or summary]

### Detailed Guidelines
[Full content]

### Integration with Methodologies
[How it works with Shape Up, Scrum, etc.]
<!-- MODULE:END -->
```

## CLI Integration

### New Commands

```bash
# List available guidance modules
aichaku guidance --list

# Show specific guidance
aichaku guidance owasp
aichaku guidance 15-factor

# Integrate specific modules
aichaku integrate --sections=methodology,owasp,15-factor

# Create custom guidance
aichaku guidance create my-team-standards
```

### Integration Flags

```bash
# Basic (just methodologies)
aichaku integrate

# With security
aichaku integrate --with-security

# With architecture standards  
aichaku integrate --with-architecture

# Custom selection
aichaku integrate --sections=methodology,owasp,15-factor,conventional-commits

# Everything
aichaku integrate --all
```

## CLAUDE.md Structure

The integrated CLAUDE.md would have clearly marked sections:

```markdown
# CLAUDE.md

<!-- AICHAKU:METHODOLOGY:START -->
[Methodology rules as current]
<!-- AICHAKU:METHODOLOGY:END -->

<!-- AICHAKU:SECURITY:START -->
[OWASP Top 10, ISO 27001, Security Review Process]
<!-- AICHAKU:SECURITY:END -->

<!-- AICHAKU:ARCHITECTURE:START -->
[15-factor or 12-factor guidelines]
<!-- AICHAKU:ARCHITECTURE:END -->

<!-- AICHAKU:DEVELOPMENT:START -->
[Conventional commits, code style, etc.]
<!-- AICHAKU:DEVELOPMENT:END -->

<!-- AICHAKU:CUSTOM:START -->
[Team-specific standards from user/docs/standards/]
<!-- AICHAKU:CUSTOM:END -->
```

## Hook Integration

Hooks can enforce these standards:

```json
{
  "PreToolUse": [
    {
      "name": "Security Check",
      "matcher": "Write|Edit",
      "command": "aichaku check-security '${TOOL_INPUT_FILE_PATH}'"
    }
  ],
  "PostToolUse": [
    {
      "name": "15-Factor Compliance",
      "matcher": "Write",
      "command": "aichaku check-factors '${TOOL_INPUT_FILE_PATH}'"
    }
  ]
}
```

## Benefits

1. **Modularity**: Pick only what you need
2. **Maintainability**: Update sections independently
3. **Customization**: Add team-specific guidance
4. **Evolution**: Easy to add new standards
5. **Integration**: Works with hooks and methodologies

## Implementation Priority

1. **Phase 1**: Core module system and CLI commands
2. **Phase 2**: Security modules (OWASP, ISO 27001)
3. **Phase 3**: Architecture modules (15-factor, 12-factor)
4. **Phase 4**: Development standards and team customization

## Next Steps

1. Create module templates from existing content
2. Design module discovery and loading system
3. Update integrate.ts to support multiple sections
4. Create guidance command for CLI
5. Document module creation for teams