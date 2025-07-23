# Auto Version Check - Status

**Project**: Automatic Version Checking for Aichaku\
**Status**: 🌱 Planning\
**Created**: 2025-07-13\
**Appetite**: 2 weeks

## Current Status

Just created the pitch document. This feature would solve the confusion users
experience when the CLI and global files have different versions.

## Problem Summary

Users can have mismatched versions:

- CLI at v0.27.0

- Global files at v0.25.0

- No warning about the mismatch

## Proposed Solution

Check versions on CLI startup and warn users if they need to run
`aichaku upgrade --global`.

## Next Steps

1. Review and refine the pitch

2. Decide on implementation approach

3. Consider if this should be part of a larger "health check" feature
