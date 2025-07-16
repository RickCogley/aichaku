# MCP Code Reviewer - Consolidated Design Summary

🪴 Aichaku: Unified Security, Standards & Methodology Review

## Overview

This MCP server combines the best of both design efforts:

1. **Security & Standards Review** (from the manual review example)
2. **Methodology Compliance** (from the earlier conceptual design)

## What It Reviews

### 1. Security Issues (Like We Did Manually)

- Command injection vulnerabilities
- Path traversal attacks
- TypeScript `any` usage
- Unsafe JSON parsing
- SQL injection risks
- And more via CodeQL, DevSkim, Semgrep

### 2. Standards Compliance

Based on your selected standards in `.aichaku-standards.json`:

- OWASP Top 10 (A01-A10)
- 15-Factor Apps principles
- Test-Driven Development practices
- NIST Cybersecurity Framework
- Google Style Guides
- Any custom standards

### 3. Methodology Compliance

Automatically detected or configured:

- **Shape Up**: Appetite limits, pitch completeness, scope creep
- **Scrum**: Sprint goals, story points, velocity tracking
- **Kanban**: WIP limits, flow metrics
- **Lean**: MVP validation, build-measure-learn cycles
- **General**: TODOs, documentation, complexity

## Architecture (Consolidated)

```
┌─────────────────────────────────────┐
│         Claude Code                 │
│  ┌─────────────┐  ┌──────────────┐ │
│  │   Hooks     │  │ On-Demand    │ │
│  │ (automatic) │  │  Commands    │ │
│  └──────┬──────┘  └──────┬───────┘ │
└─────────┼────────────────┼─────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────┐
│      MCP Code Reviewer Server       │
│  ┌─────────────────────────────┐   │
│  │      Review Engine           │   │
│  │  ┌─────────┐ ┌────────────┐ │   │
│  │  │Security │ │Methodology │ │   │
│  │  │Scanner  │ │ Checker    │ │   │
│  │  └────┬────┘ └─────┬──────┘ │   │
│  └───────┼────────────┼────────┘   │
└──────────┼────────────┼────────────┘
           ▼            ▼
    ┌──────────┐  ┌──────────────┐
    │ External │  │   Aichaku    │
    │  Tools   │  │ Config/Rules │
    │ -CodeQL  │  │ -Standards   │
    │ -DevSkim │  │ -Methodologies│
    │ -Semgrep │  │ -Custom Rules│
    └──────────┘  └──────────────┘
```

## Configuration (Unified)

### Project Level (.claude/.aichaku-standards.json)

```json
{
  "version": "1.0.0",
  "selected": ["owasp-web", "15-factor", "tdd"],
  "methodologies": ["shape-up"], // Optional, auto-detected if not specified
  "customStandards": {}
}
```

### System Level (~/.config/mcp-code-reviewer.json)

```json
{
  "scanners": {
    "devskim": { "enabled": true },
    "codeql": { "enabled": false },
    "semgrep": { "enabled": true }
  },
  "review": {
    "automatic": true,
    "includeMethodologyChecks": true,
    "strictness": "normal"
  }
}
```

## Example Output (Complete Review)

```
🔍 Code Review Results for auth.ts
==================================================

✅ Shape Up Compliance: PASSED
   - Implementation fits within 6-week appetite
   - No scope creep detected

⚠️ Scrum Compliance: WARNINGS
   - Missing story point estimate in commit message

📊 Summary:
   🔴 Critical: 1
   🟠 High: 2
   🟡 Medium: 3
   ℹ️  Info: 2

📋 Findings:

🔴 CRITICAL
   auth.ts:42:15
   Rule: command-injection (via pattern-scanner)
   Issue: Potential command injection - use parameter expansion ${VAR}
   💡 Fix: Use bash parameter expansion: bash -c 'command "$1"' -- "${VARIABLE}"

🟠 HIGH
   auth.ts:78:8
   Rule: OWASP-A01 (via owasp-analyzer)
   Issue: Potential broken access control - verify authorization
   💡 Fix: Add authorization checks before accessing resources

   auth.ts:92:12
   Rule: path-traversal (via devskim)
   Issue: Potential path traversal vulnerability
   💡 Fix: Validate and normalize paths before use

💡 Recommendations:
   1. Address critical security issues immediately
   2. Review and fix high-severity findings before deployment
   3. Consider adding unit tests for authorization logic

🌱 Learning Opportunity:
Reminder: 📝 Your CLAUDE.md explicitly states to avoid 'any' types, but you used it 5 times.
Pattern: Using 'any' instead of proper TypeScript types
How to fix: Determine the actual type from context and use it.
Example: Change: const data: any = response
To: const data: ApiResponse = response

Note to self: I should follow the TypeScript standards in CLAUDE.md and avoid using 'any' types.
```

## Key Benefits

1. **Comprehensive**: Reviews security, standards, AND methodology compliance
2. **Automated**: Runs on save, commit, or on-demand via hooks
3. **Local-First**: 🔒 **Your code NEVER leaves your machine** - complete
   privacy
4. **Configurable**: Adapts to your project's specific needs
5. **Actionable**: Provides specific fixes, not just problems
6. **Manual PR Creation**: No automatic PR spam - you decide when to fix
7. **Educational Feedback**: Helps Claude learn from mistakes within the session

## Implementation Status

- ✅ Architecture designed
- ✅ Security scanning patterns defined
- ✅ Methodology compliance rules created
- ✅ Example implementation provided
- ✅ Aichaku integration planned
- ✅ Distribution strategy (GitHub releases)
- ✅ Privacy-first approach documented
- ⏳ Full implementation pending

## Key Design Decisions

### 1. Tool Integration

- **External tools** (DevSkim, CodeQL) installed separately
- **Smart detection** - works with whatever's available
- **Progressive enhancement** - better with more tools
- **Built-in patterns** always available

### 2. PR Creation

- **Manual only** - no automatic PRs
- **User initiated** - "Create a PR to fix these"
- **Avoids spam** - conscious decision required

### 3. Distribution

- **Compiled binaries** via `deno compile`
- **GitHub releases** for easy download
- **Cross-platform** - macOS (Intel/ARM), Linux, Windows
- **One-line installer** for convenience

This consolidated design brings together the automated security review
capabilities you demonstrated with the methodology-aware guidance from the
earlier concept, creating a powerful unified tool for code quality.
