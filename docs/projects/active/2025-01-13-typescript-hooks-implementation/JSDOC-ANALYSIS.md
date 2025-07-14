# JSDoc Coverage Analysis

## Current State

Based on our grep analysis, we have **385 JSDoc blocks** across 44 files in the `/src` directory.

## Good Examples

### types.ts
✅ Excellent JSDoc coverage with proper Deno-style documentation:
```typescript
/**
 * Represents a project methodology that can be installed by aichaku
 *
 * @public
 */
export interface Methodology {
  /** The unique identifier name of the methodology (e.g., "shape-up") */
  name: string;
  /** Human-readable description of what the methodology provides */
  description: string;
  // ...
}
```

### Key Deno JSDoc Differences

1. **@public tag**: Used instead of @export for public APIs
2. **@module tag**: For file-level documentation
3. **Built-in generation**: Uses `deno doc` instead of external tools
4. **Type inference**: Better integration with TypeScript types

## Files Needing Improvement

Let me check a few files that might need better coverage:

### init.ts
- Has some function documentation
- Could use more @param and @returns tags
- Interface definitions need @public tags

### commands/hooks.ts
- Complex file with many functions
- Some JSDoc present but inconsistent
- Hook templates could use better documentation

## JSDoc Checker Hook Proposal

A `jsdoc-checker` hook could:

1. **Trigger**: PostToolUse on .ts files
2. **Check**: Missing documentation on exported functions/classes
3. **Validate**: Proper Deno JSDoc tags
4. **Report**: Coverage statistics

### Implementation Approach
```typescript
async function jsdocChecker(input: HookInput): Promise<void> {
  const filePath = input.tool_input?.file_path;
  
  if (filePath && filePath.endsWith('.ts')) {
    // Parse TypeScript file for exported items
    // Check for missing JSDoc blocks
    // Suggest improvements
    console.log('📝 Aichaku: JSDoc reminder for TypeScript file');
    console.log('   - Add /** */ blocks for exported functions');
    console.log('   - Use @public for public APIs');
    console.log('   - Include @param and @returns tags');
  }
}
```

This would help maintain documentation quality as we develop!

## Next Steps

1. Add JSDoc to any poorly documented functions we encounter
2. Consider implementing the jsdoc-checker hook
3. Run `deno doc` to generate API documentation and check coverage