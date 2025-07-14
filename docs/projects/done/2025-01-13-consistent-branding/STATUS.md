# Consistent Aichaku Branding - Status

**Project**: Consistent CLI Branding for Aichaku  
**Status**: 🌱 Planning  
**Created**: 2025-01-13  
**Appetite**: 1 week  

## Current Status

Just created the pitch based on user feedback about missing branding in `aichaku init` output.

## Problem Summary

The init command (and potentially other commands) lack the distinctive 🪴 Aichaku branding, making the first user experience feel generic.

## Proposed Solution

Add consistent branding across all CLI commands with the 🪴 prefix and growth metaphors where appropriate.

## Implementation Notes

Key files to update:
- `src/commands/init.ts` - Add branding to all messages
- `src/commands/upgrade.ts` - Brand the upgrade experience  
- `src/commands/help.ts` - Welcome message needs branding
- `src/utils/ui.ts` - Consider centralizing brand messages

## Next Steps

1. Audit all CLI commands for branding consistency
2. Create message templates with proper branding
3. Implement changes across all commands
4. Test user experience flow

## Quick Wins

This is a high-impact, low-effort improvement that will make every interaction feel more cohesive and memorable.

## Additional Insights

User pointed out the connection to Google's documentation style guide - CLI messages ARE documentation. This led to incorporating established CLI messaging standards:

- Command Line Interface Guidelines (human-friendly errors)
- 12-Factor CLI Apps (machine-parseable output)
- Google's documentation principles (user-focused, clear, concise)
- Microsoft's CLI standards (predictable behavior)

This could potentially become a reusable module for other CLI projects - "Standards-based CLI messaging as a service".