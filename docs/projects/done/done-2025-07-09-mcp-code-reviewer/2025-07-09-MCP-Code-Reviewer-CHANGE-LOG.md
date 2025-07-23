# MCP Code Reviewer Design - Change Log

**Date**: 2025-07-09\
**Project**: MCP Code Reviewer for Automated Security & Standards Review

## Summary

Designed a comprehensive Model Context Protocol (MCP) server that performs
automated security and standards review, exactly as Rick requested: "what you
just did, is what I want the mcp to be doing, either by command or automatically
as code is produced."

**Update**: Consolidated with earlier MCP design (2025-01-09) to include both
security/standards review AND methodology compliance checking.

## Key Accomplishments

### 1. Architecture Design

- Created complete MCP server architecture with review engine, scanner
  controller, and standards manager

- Designed integration with local security tools (CodeQL, DevSkim, Semgrep)

- Mapped Aichaku standards to concrete review rules

### 2. Implementation Example

- Built working example MCP server demonstrating key concepts

- Implemented pattern-based security scanning (command injection, path
  traversal, TypeScript any)

- Added OWASP Top 10 checks (A01 Access Control, A03 Injection)

- Created comprehensive result formatting with severity levels

### 3. Aichaku Integration

- Designed seamless integration with existing Aichaku standards system

- MCP automatically reads `.claude/.aichaku-standards.json`

- Provides both proactive (via CLAUDE.md) and reactive (via MCP) guidance

### 4. Implementation Plan

- 4-week development roadmap with clear milestones

- Phase-by-phase implementation guide

- Test suite and deployment strategy

## Technical Highlights

### Security Patterns Implemented

````typescript
// Example: Command injection detection
{
  pattern: /bash\s+-c\s+['"][^'"]*\$[^{]/,
  severity: 'critical',
  rule: 'command-injection',
  message: 'Potential command injection - use parameter expansion ${VAR}'
}
```text

### OWASP Integration

```typescript
// A01 Broken Access Control
if (line.includes("req.params") && !content.includes("authorize")) {
  findings.push({
    severity: "high",
    rule: "OWASP-A01",
    message: "Potential broken access control",
  });
}
```text

### Review Output Format

```text
🔍 Code Review Results for file.ts
==================================================

📊 Summary:

   🔴 Critical: 2
   🟠 High: 3
   🟡 Medium: 1

📋 Findings:

🔴 CRITICAL
   file.ts:42:15
   Rule: command-injection (via pattern-scanner)
   Issue: Potential command injection
   💡 Fix: Use bash parameter expansion
```text

## Benefits Delivered

1. **Automated Security Review**: Performs the same security analysis
   demonstrated manually

2. **Local-First**: Uses local tools for fast "first line of defence"

3. **Standards Integration**: Leverages Aichaku's selected standards

4. **Consistent Application**: Applies rules uniformly across all code

5. **Actionable Feedback**: Provides specific fixes, not just problems

## Next Steps

The MCP server design is ready for implementation. Key tasks:

1. Set up MCP SDK project structure

2. Implement scanner abstraction layer

3. Build standards rule engine

4. Create comprehensive test suite

5. Package for easy installation

## Files Created/Updated

1. `STATUS.md` - Project tracking and overview (updated with consolidation)

2. `mcp-architecture.md` - Complete technical architecture (added methodology
   components)

3. `implementation-plan.md` - 4-week development roadmap (included methodology
   engine)

4. `example-mcp-server.ts` - Working example implementation (added methodology
   checks)

5. `aichaku-integration.md` - Integration with Aichaku ecosystem (expanded
   review types)

6. `consolidated-design-summary.md` - Unified design overview (new)

This design fulfills Rick's vision of automated security review that runs
locally, integrates with existing tools, and provides consistent, actionable
feedback based on selected standards.

## Consolidation Notes

Merged two design efforts:

1. **Earlier (2025-01-09)**: General methodology-based code review concept

2. **New (2025-07-09)**: Security and standards-focused implementation

The consolidated design now includes:

- **Security scanning** with local tools (CodeQL, DevSkim, Semgrep)

- **Standards compliance** (OWASP, 15-factor, TDD, etc.)

- **Methodology review** (Shape Up, Scrum, Kanban compliance)

- **Unified configuration** using actual .aichaku-standards.json

- **Hybrid approach**: System-wide MCP with per-project configuration

Key improvements:

- Uses real Aichaku configuration files (not theoretical ones)

- Combines proactive (CLAUDE.md) and reactive (MCP) guidance

- Supports both security rules AND methodology patterns

- Provides comprehensive review in a single tool

## Additional Enhancements

### Educational Feedback System

- Created `mcp-feedback-loop.md` - Dynamic guidance based on violation patterns

- MCP helps Claude learn from mistakes and adjust behavior within sessions

- Generates targeted prompts to reinforce correct practices

### Advanced Prompting Techniques

- Created `mcp-advanced-prompting.md` - Leverages proven LLM prompting
  strategies

- Implements multi-shot examples (showing bad vs good code)

- Provides context about WHY rules exist (not just what's wrong)

- Breaks complex fixes into manageable subtasks

- Includes self-reflection questions to build awareness

- Guides step-by-step through fixes

These enhancements transform the MCP from a simple reviewer into an effective
teacher that helps Claude internalize best practices and produce better code
throughout the session.
````
