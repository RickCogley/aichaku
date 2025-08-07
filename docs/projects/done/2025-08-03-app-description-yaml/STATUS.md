# App Description YAML Feature - Project Status

🍃 **Status**: COMPLETE **Created**: 2025-08-03 **Completed**: 2025-08-05 **Methodology**: Shape Up **Phase**: Shaping →
Betting → Building → [**Cool-down**] ✓ **Appetite**: 6 weeks (delivered in ~2 days)

## Overview

Enable users to create structured YAML descriptions of their applications that integrate into CLAUDE.md, providing
Claude Code with rich application-specific context.

## Problem

Claude Code lacks essential context about the specific application it's working on:

- Tech stack and frameworks
- Architecture patterns
- API endpoints and services
- Database schemas
- Security requirements
- Business domain context

## Solution

Create a YAML-based application description system:

- Template file: `.claude/aichaku/user/templates/app-description-template.yaml`
- User file: `.claude/aichaku/user/app-description.yaml`
- Integration via `aichaku integrate` command
- Merges into CLAUDE.md's YAML block

## Key Deliverables

1. YAML template structure design
2. Integration mechanism with `aichaku integrate`
3. User documentation and examples
4. Testing strategy for YAML validation

## Success Criteria

- Users can describe their app in <15 minutes
- Claude Code receives richer context automatically
- Zero breaking changes to existing workflows
- Clear migration path for existing users

## Risk Assessment

- **Technical Risk**: Low - YAML parsing is well-understood
- **User Adoption Risk**: Medium - Need approachable template
- **Integration Risk**: Low - Leverages existing patterns
