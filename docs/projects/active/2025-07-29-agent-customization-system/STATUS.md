# Agent Customization System - Status

## Project Overview

Implementing a layered customization system for aichaku agents that preserves user modifications while allowing core
updates.

## Status: 🌱 Planning

**Created**: 2025-01-29 **Appetite**: 3 weeks **State**: Shaping

## Problem Statement

Current agent system destructively overwrites user customizations during updates, forcing users to choose between
customization and staying current.

## Proposed Solution

Three-layer architecture:

1. Core templates (shipped)
2. User customizations (preserved)
3. Generated agents (computed)

## Key Outcomes

- [ ] Non-destructive agent updates
- [ ] Clear customization path via YAML overlays
- [ ] Version compatibility and migration
- [ ] Improved developer experience

## Next Steps

1. Review and refine the pitch
2. Technical spike on merge algorithm
3. Design YAML schema for customizations
4. Get user feedback on customization needs

## Related Documents

- [Pitch](pitch.md) - Full Shape Up pitch with problem, solution, and constraints
