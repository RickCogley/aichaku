# Configuration as Code for aichaku

## Overview

Configuration as code transforms abstract coding standards into versioned,
reproducible project settings. For aichaku—a tool that helps developers maintain
standards through Claude Code integration—this approach provides consistency,
customization, and reliability that manual configuration cannot match.

## Why Configuration as Code Benefits aichaku

### The Standards Challenge

Traditional coding standards live in documentation that becomes stale, gets
interpreted differently by team members, and requires manual enforcement. It's
like having a style guide that exists only in people's heads—inconsistent and
unreliable.

Configuration as code solves this by making standards **executable and
explicit**. Instead of "use descriptive variable names," you define exactly what
that means:

```yaml
naming:
  variables:
    min_length: 3
    pattern: "camelCase"
    avoid_abbreviations: true
    examples:
      good: ["userAccountBalance", "isEmailValid"]
      bad: ["bal", "usr", "flag"]
```

### Key Benefits for Development Teams

**Project-Specific Customization**: A fintech application needs stricter
security standards than a prototype. Each project can inherit base standards
while overriding specific rules based on its requirements.

**Team Consistency**: New developers get identical review criteria. No more
discovering standards through trial and error or inconsistent feedback.

**Evolutionary Standards**: As teams learn better practices, changes to
standards are version-controlled. You can see exactly when and why certain
patterns were adopted.

**CI Integration**: The same configuration that drives local reviews integrates
with automated pipelines to maintain standards across the entire development
workflow.

## YAML vs Markdown for Rule Definition

### Why YAML Improves Rule Following

Claude Code processes structured formats more reliably than narrative text. The
difference resembles reading a grocery list (YAML) versus parsing cooking
instructions buried in a blog post (Markdown).

**Structured Parsing**: YAML's explicit hierarchy maps naturally to rule
priorities and categories:

```yaml
standards:
  critical:
    - no-hardcoded-secrets
    - input-validation
  preferred:
    - consistent-naming
    - documentation-coverage
  optional:
    - performance-optimizations
```

**Reduced Ambiguity**: Markdown leaves room for interpretation. YAML forces
specificity that improves consistency.

**Explicit Relationships**: Dependencies and rule hierarchies become clear
through structure rather than inferred from prose.

### The Human Readability Trade-off

YAML improves machine parsing but reduces human readability. Developers need to
understand the standards they're following, not just comply with them
mechanically.

## Ensuring Claude Code Reads Configuration Files

### File Placement Strategy

Place configuration files where Claude Code naturally discovers them:

```
.aichaku/
├── rules.yaml          # Primary rules file
├── context.md          # Human explanation
└── README.md           # Quick reference
```

The `.aichaku/` directory signals tool configuration and follows established
patterns for project-specific settings.

### Explicit References in CLAUDE.md

Don't rely on discovery alone. Direct Claude Code to the configuration:

```markdown
# Project Standards

This project uses aichaku for code quality. **Always check `.aichaku/rules.yaml`
before making changes.**

## Quick Reference

- Security rules: See `rules.yaml > security` section
- TypeScript patterns: See `rules.yaml > typescript` section
- Architecture guidelines: See `rules.yaml > architecture` section
```

### Self-Documenting Configuration

Include instructions directly in the YAML file:

```yaml
# IMPORTANT: Claude Code should validate all changes against these rules
# Read the entire file before suggesting code modifications

meta:
  version: "1.0"
  instructions: |
    Before making any code changes:
    1. Review applicable rules below
    2. Check examples for context
    3. Apply rules consistently across the codebase

security:
  critical_rules:
    - name: "no-hardcoded-secrets"
      description: "Never commit API keys, passwords, or tokens"
      examples:
        violation: "const API_KEY = 'sk-1234567890'"
        correct: "const API*KEY = process.env.API*KEY"
```

### Integration Through MCP

Since aichaku operates as an MCP tool, actively inject rules into Claude Code's
context:

```typescript
// In your MCP tool
export async function getProjectContext() {
  const rules = await readYamlFile(".aichaku/rules.yaml");
  return {
    instructions: "Apply these coding standards to all suggestions:",
    rules: rules,
    reminder: "Check each change against the rules above",
  };
}
```

## Recommended Implementation Strategy

### Hybrid Approach

Combine the benefits of both formats:

1. **Human-readable explanations** in CLAUDE.md
2. **Machine-readable rules** in `.aichaku/rules.yaml`
3. **Single source of truth** through aichaku's modular rule system generating
   both formats

This provides Claude Code consistency through structured rules while maintaining
developer comprehension through Markdown explanations.

### Project Structure

```
project-root/
├── CLAUDE.md                    # Human-readable context
├── .aichaku/
│   ├── config.ts               # Main aichaku configuration
│   ├── rules.yaml              # Structured rules for Claude Code
│   └── standards/
│       ├── typescript.yaml     # Language-specific standards
│       ├── security.yaml       # Security requirements
│       └── architecture.yaml   # Architectural patterns
└── src/
    └── ...
```

### Ensuring Adoption

**Prominence**: Make rules visible and central to the development workflow.

**Redundancy**: Include rule references in multiple locations—CLAUDE.md, the
YAML file itself, and through MCP injection.

**Integration**: Embed rule checking into the natural development process rather
than treating it as external documentation.

## Conclusion

Configuration as code transforms aichaku from a simple rule checker into a
comprehensive standards management system. The structured approach provides
consistency and customization that manual configuration cannot match, especially
for teams working across multiple projects.

The key success factor is making standards feel like part of the development
workflow rather than external compliance requirements. Through strategic file
placement, explicit references, and active MCP integration, configuration files
become living documentation that guides development decisions in real-time.
