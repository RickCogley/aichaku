# Agent Architecture Design

## Overview

Sub-agents provide specialized expertise with dedicated context windows, solving the context bloat problem by loading
only relevant methodology and standard information based on active project configuration.

## File Structure

```
~/.claude/
├── agents/                        # Claude Code agents location
│   ├── aichaku-orchestrator.md    # General workflow coordinator
│   ├── aichaku-security-reviewer.md
│   ├── aichaku-methodology-coach.md
│   └── aichaku-documenter.md      # Documentation specialist
└── aichaku/                       # Aichaku configuration
    └── aichaku.json              # Selected methodologies & standards
```

## Core Agents

**Note**: After testing, we discovered:

- Agents work behind-the-scenes to enhance Claude Code responses
- No direct user interaction with agents
- Learning-mentor and development-logger removed as impractical
- Added orchestrator for general coordination
- Added documenter for documentation workflows

### 1. security-reviewer

**Purpose**: InfoSec/OWASP/NIST-CSF specialist\
**Context**: OWASP Top 10, NIST-CSF, security standards based on project config\
**Triggers**: Security-related code, auth, crypto, input validation\
**Tools**: All (needs to review code, update logs, suggest fixes)\
**Responsibilities**:

- Review code for security vulnerabilities
- Add InfoSec annotations to commits
- Enforce OWASP Top 10 compliance
- Update development log with security findings

### 2. aichaku-orchestrator (NEW)

**Purpose**: General workflow coordinator for all aichaku agents\
**Context**: Project lifecycle, agent capabilities, delegation patterns\
**Triggers**: Project events, completion signals, complex workflows\
**Tools**: Task, TodoWrite, all delegation capabilities\
**Responsibilities**:

- Coordinate multi-agent workflows
- Route tasks to appropriate specialists
- Monitor project lifecycle events
- Manage agent handoffs and communication

### 3. methodology-coach (Adaptive)

**Purpose**: Methodology-specific guidance based on active configuration\
**Context**: Loads only active methodologies (Shape Up, Scrum, etc.)\
**Triggers**: Methodology keywords, project lifecycle events\
**Tools**: Read, Write, Glob, development logging\
**Responsibilities**:

- Guide methodology-specific workflows
- Create/update methodology artifacts (pitches, sprints, etc.)
- Enforce methodology best practices
- Adapt advice based on active methodologies

### 4. aichaku-documenter (NEW)

**Purpose**: Documentation generation and integration specialist\
**Context**: Documentation standards, methodology templates, project artifacts\
**Triggers**: Documentation tasks, project completion, merge workflows\
**Tools**: Read, Write, Edit, MultiEdit\
**Responsibilities**:

- Generate documentation following selected standards
- Create methodology-specific artifacts
- Merge project docs into central documentation
- Maintain version control and change tracking

## Agent Configuration Format

Each agent defined as Markdown file:

````markdown
---
name: "security-reviewer"
description: "InfoSec specialist for OWASP and security compliance"
triggers: ["auth", "crypto", "security", "validation", "injection"]
tools: ["*"]
methodology_aware: true
---

# System Prompt

You are a security specialist focused on OWASP Top 10 and NIST-CSF compliance.

## Context Loading Rules

Based on active project methodologies from active-methodologies.yaml:

- Load relevant security standards only
- Focus on methodology-specific security patterns

## Responsibilities

1. Review all code for security vulnerabilities
2. Add InfoSec annotations to security-related changes
3. Update development log with security findings
4. Enforce security best practices for active methodologies

## Response Format

Always update development log entry at top:

```markdown
## 2025-07-25 HH:MM - security-reviewer

- [What was reviewed/changed]
- [Security findings/recommendations]
- HANDOFF: [What main context should focus on next]
```
````

...

````
## Integration with Existing System

### Command Structure
Mirror the existing `aichaku standards` pattern:

```bash
# Methodology management (new commands)
aichaku methodologies --list
aichaku methodologies --add shape-up,scrum
aichaku methodologies --remove kanban
aichaku methodologies --show

# Agent invocation (existing Claude Code feature)
Use the methodology-coach to refine this pitch
Have the security-reviewer check this authentication flow
Ask the learning-mentor to explain Shape Up betting process
````

### Configuration Integration

Extend ConfigManager to support methodology configuration:

```typescript
interface AichakuConfig {
  // ... existing fields
  methodologies: {
    active: string[]; // Currently active methodologies
    default: string; // Default for new projects
    settings: {
      allowMultiple: boolean; // Can use multiple methodologies
      enforceStrict: boolean; // Strict mode vs. adaptive
    };
  };
  agents: {
    enabled: string[]; // Which agents are active
    customizations: Record<string, unknown>;
  };
}
```

### Context Loading Strategy

#### Installation Prompts

```
🪴 Aichaku: Setting up your project...

What type of development are you doing?
1. Solo development (recommended: shape-up)
2. Small team (2-5 people) (recommended: scrum, shape-up)  
3. Large team (6+ people) (recommended: safe, scrum)
4. Custom selection

Methodology(ies) to enable: [shape-up] ▌
```

#### Context Size Optimization

- Base CLAUDE.md: ~2000 tokens (core directives only)
- Per methodology: ~1500 tokens (only when active)
- Per standard: ~800 tokens (only selected standards)
- Total typical project: ~4000 tokens vs current ~12000 tokens

## Development Log Format

```markdown
# Development Log - Project Name

## 2025-07-25 16:45 - methodology-coach

- Refined pitch.md appetite from "big bet" to "small bet"
- Updated problem statement for clarity
- RECOMMENDATION: Get betting-advisor input on Q3 roadmap alignment
- HANDOFF: Main should focus on implementation planning

## 2025-07-25 16:30 - security-reviewer

- Reviewed UserService.ts:45-67 authentication flow
- Added InfoSec annotation for OAuth2 implementation
- FINDING: Missing rate limiting for brute force protection
- HANDOFF: Main should implement rate limiting before deployment

## 2025-07-25 16:15 - learning-mentor

- Explained Shape Up betting process with visual examples
- Connected to current pitch development workflow
- LEARNING: User now understands appetite vs. capacity distinction
- HANDOFF: Ready to proceed with pitch finalization
```

## Implementation Strategy

### Phase 1: Core Infrastructure

1. Create agent file structure and definitions
2. Build `aichaku methodologies` command
3. Extend ConfigManager for methodology support
4. Test agent invocation manually

### Phase 2: Integration

1. Modify install flow to prompt for methodologies
2. Update `aichaku integrate` to be methodology-aware
3. Implement development logging system
4. Test complete workflow

### Phase 3: Refinement

1. Optimize context loading based on usage
2. Add methodology-specific agent variations
3. Implement agent customization options
4. Performance optimization and caching

## Success Metrics

- **Context Efficiency**: 60%+ reduction in context size for focused projects
- **Learning Continuity**: Maintain decision history across sessions
- **Agent Effectiveness**: Clear, actionable guidance from specialized agents
- **Developer Experience**: Smooth workflow without manual agent management

## Security Considerations

- Agent files stored in project/.claude/ with proper permissions (644)
- No sensitive data in agent definitions
- Safe file operations for log management
- Validate agent invocations to prevent injection
