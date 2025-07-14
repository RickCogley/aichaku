# JSDoc Improvement Plan for Aichaku

## Current State Summary

### Well-Documented ✅
- `/src/types.ts` - All interfaces documented
- `/src/utils/path-security.ts` - Comprehensive docs with examples
- `/src/utils/project-paths.ts` - Good module and function docs
- `/src/mod.ts` - Excellent module documentation

### Needs Improvement ❌

#### Priority 1: Core Command Functions
These are the main API surface and need immediate attention:

1. **`/src/commands/hooks.ts`**
   - Missing: JSDoc for `hooks()` function
   - Missing: Documentation for `HookConfig`, `HookTemplate` interfaces
   - Missing: Helper function documentation

2. **`/src/commands/standards.ts`**
   - Missing: JSDoc for `standards()` function
   - Missing: Documentation for `Standard`, `StandardCategory` interfaces
   - Missing: Helper function documentation

3. **`/src/commands/init.ts`**
   - Has basic JSDoc but missing `@param`, `@returns`
   - Missing: Interface documentation
   - Missing: Examples

4. **`/src/commands/review.ts`**
   - Almost no JSDoc
   - Missing: All function documentation

5. **`/src/commands/integrate.ts`**
   - Only security comments
   - Missing: Complete JSDoc

#### Priority 2: Utility Functions

1. **`/src/utils/logger.ts`**
   - Has JSDoc but missing `@param` and `@returns` tags
   - Missing: Examples

2. **`/src/utils/ui.ts`**
   - Minimal documentation
   - Missing: Module-level docs
   - Missing: Function documentation

## Deno JSDoc Standards

For Deno's `deno doc` command, we should follow these patterns:

```typescript
/**
 * Brief description of the function
 * 
 * @module
 */

/**
 * Detailed function description
 * 
 * @param {string} param - Parameter description
 * @returns {Promise<Result>} What the function returns
 * 
 * @example
 * ```ts
 * const result = await myFunction("value");
 * ```
 * 
 * @public
 */
export function myFunction(param: string): Promise<Result> {
  // ...
}
```

## Action Items

### 1. Document hooks.ts
```typescript
/**
 * Manages Claude Code hooks for the Aichaku CLI
 * 
 * @module
 */

/**
 * Configure and manage Claude Code hooks
 * 
 * Hooks allow you to run custom scripts at various points in Claude Code's lifecycle.
 * This command helps install, uninstall, and list available hooks.
 * 
 * @param {HooksOptions} options - Configuration options for hook management
 * @returns {Promise<void>}
 * 
 * @example
 * ```ts
 * // Install essential hooks globally
 * await hooks({ install: ["essential"], global: true });
 * 
 * // List installed hooks
 * await hooks({ list: true });
 * ```
 * 
 * @public
 */
export async function hooks(options: HooksOptions = {}): Promise<void> {
```

### 2. Document standards.ts
```typescript
/**
 * Browse and copy development standards and guidelines
 * 
 * Provides access to a curated collection of industry standards including
 * NIST-CSF, TDD, Clean Architecture, and more.
 * 
 * @param {StandardsOptions} options - Options for browsing standards
 * @returns {Promise<void>}
 * 
 * @example
 * ```ts
 * // List all available standards
 * await standards({ list: true });
 * 
 * // Search for security-related standards
 * await standards({ search: "security" });
 * ```
 * 
 * @public
 */
```

### 3. Update mod.ts exports
Add proper JSDoc for all exported functions that are missing it.

## Validation Process

After adding JSDoc:
1. Run `deno doc src/mod.ts` to generate documentation
2. Check output in `/docs/api/`
3. Verify all exported functions appear
4. Ensure examples render correctly

## Expected Outcome

Complete API documentation with:
- All exported functions documented
- All public interfaces documented
- Examples for common use cases
- Proper Deno-style JSDoc tags