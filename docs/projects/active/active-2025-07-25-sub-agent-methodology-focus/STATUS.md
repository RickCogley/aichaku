# Sub-Agent Methodology Focus

**Project Status:** 🌿 Active\
**Started:** 2025-07-25\
**Updated:** 2025-07-28 **Methodology:** Shape Up\
**Type:** Feature Development

## Problem Statement

Context window limitations kill continuity in long development sessions with Aichaku. Current approach loads all
methodologies into context regardless of relevance, causing bloat and losing historical decisions.

## Solution

Implement specialized sub-agents with methodology-focused context management:

- Users select specific methodologies per project
- Agents maintain their own context windows
- Orchestrator coordinates workflows
- Focused context loading based on active methodologies

## Key Deliverables (Updated)

1. **4 Core Agents**:
   - ✅ security-reviewer
   - ✅ methodology-coach
   - ✅ orchestrator (NEW - general coordinator)
   - ✅ documenter (NEW - documentation specialist)
   - ❌ ~~learning-mentor~~ (removed - too interactive)
   - ❌ ~~development-logger~~ (removed - Claude maintains context)

2. **Methodology Management**: ✅ `aichaku methodologies` command suite
3. **Smart Install**: 🔄 Prompt for methodology selection with defaults
4. **Context Optimization**: 🔄 Load only relevant methodology content

## Current Sprint Progress

🔄 **In Progress:**

- Implementing orchestrator agent
- Enhancing documenter with merge capabilities
- Adding delegation patterns

✅ **Completed:**

- Agent architecture design (updated)
- Basic agent templates
- Methodology command implementation
- Agent generation logic

📋 **Next:**

- Test multi-agent workflows
- Implement documentation merge
- Deploy and test

## Architecture Files

1. **IMPLEMENTATION.md** - Consolidated implementation guide (START HERE)
2. **agent-architecture.md** - Original technical architecture (historical context)
3. **comprehensive-agent-system-plan.md** - Expanded system vision (future roadmap)

## Success Criteria

- Development sessions maintain context over extended periods
- Users can focus on specific methodologies without bloat
- Agents coordinate effectively through delegation
- Professional documentation lifecycle managed automatically

## Key Decisions

- Agents work behind-the-scenes (no direct user interaction)
- Orchestrator serves as general coordinator, not just for docs
- User maintains control over all operations
- Leverage existing template infrastructure

## Notes

- Testing approach: ~/.claude/agents/ with "aichaku-" prefix
- MVP focus: Core agents first, expand based on usage
- Documentation merge requires user approval
- Expanded vision: Complete development assistant platform for aichaku users
- Development agents: code-archaeologist, code-reviewer, api-architect, etc.
- Technology experts: deno-expert, TypeScript-expert, bash-expert, etc.
