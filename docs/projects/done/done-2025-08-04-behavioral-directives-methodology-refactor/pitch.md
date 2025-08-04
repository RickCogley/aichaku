# Behavioral Directives & Methodology Refactor

## Problem

The current Aichaku system has conceptual inconsistencies:

1. **Language mismatch**: Documentation talks about "detecting" methodologies, but users explicitly select them
2. **Redundant directives**: The behavioral-directives.yaml has overlapping rules and complex phases
3. **Wrong priorities**: Application context appears late in CLAUDE.md, but it's the most important
4. **Misplaced data**: Methodology triggers are in behavioral directives instead of methodology files

## Appetite

6 weeks - This is foundational work that affects how Claude Code understands and responds to Aichaku projects.

## Solution

### 1. Move Triggers to Methodologies

Each methodology YAML file now contains its own triggers:

- shape-up.yaml: shape, pitch, appetite, betting, cool-down
- scrum.yaml: sprint, scrum, backlog, velocity, standup
- kanban.yaml: kanban, board, WIP, flow, continuous
- lean.yaml: mvp, lean, experiment, validate, pivot

### 2. Simplify Behavioral Directives

Redesigned with 4 clear rules in priority order:

1. **Context Awareness** (HIGHEST) - Read CLAUDE.md files first
2. **Respect User Selection** (CRITICAL) - Work within their choices
3. **Project Creation** - Simple discuss → create workflow
4. **Automation** - Handle the boring stuff automatically

### 3. Reorder CLAUDE.md

Application info now appears first because:

- It's the most important context (what kind of app is this?)
- Large CLAUDE.md files might get truncated
- Claude Code needs this context immediately

### 4. Update Language

Changed all "detection" language to "selection":

- Users select methodologies with `aichaku methodologies --set`
- Claude Code responds within their selection
- No magical detection, just respectful response

## Rabbit Holes

### Avoided

- Complete methodology system redesign
- Adding new features
- Over-engineering the behavioral system

### Identified

- MultiEdit tool can double language specifiers (documented in KNOWN_ISSUES.md)

## No-gos

- Don't change the core methodology files beyond adding triggers
- Don't alter the fundamental Aichaku architecture
- Don't break existing user configurations
