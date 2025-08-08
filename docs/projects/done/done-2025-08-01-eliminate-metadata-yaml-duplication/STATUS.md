# 🪴 Aichaku: Eliminate metadata.yaml Duplication

**Project Status:** 🌱 New **Methodology:** Shape Up **Created:** 2025-08-01 **Phase:** Shaping

## Current State

- **Active Phase:** Shaping (understanding the problem)
- **Next Phase:** Betting (decision to proceed)
- **Appetite:** 1-2 weeks (small batch)

## Problem Statement

The standards loader architecture contains a significant DRY principle violation: metadata.yaml files duplicate
information already present in individual standard YAML files, creating confusion and maintenance overhead.

## Key Issues Identified

1. **Duplication**: Each metadata.yaml contains name, description, and tags that already exist in individual .yaml files
2. **CLI Confusion**: "(metadata)" entries appear in CLI output, confusing users
3. **Inconsistent Patterns**: Standards use metadata.yaml, but principles and methodologies load directly from files
4. **Maintenance Burden**: Two places to update for each standard change

## Analysis Completed

- ✅ Loader implementation analysis complete
- ✅ DRY principle violation confirmed
- ✅ Alternative patterns identified (principles, methodologies)
- ✅ Impact assessment complete

## Next Steps

- [ ] Complete shaping phase with detailed technical approach
- [ ] Present findings for betting decision
- [ ] If approved, implement direct YAML loading like principles

## Resources

- **Technical Analysis**: See pitch.md for detailed findings
- **Implementation Examples**: principle-loader.ts, methodologies.ts
- **Standards**: DRY principle, clean architecture
