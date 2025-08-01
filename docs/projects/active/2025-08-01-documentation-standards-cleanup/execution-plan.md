# Execution Plan: Documentation and Standards Cleanup

## Phase 1: Fix Command Output Formatting (45 min)

### 1.1 Identify formatters and prevent Markdown leakage

- [ ] Find base formatter and all command-specific formatters
- [ ] Ensure NO Markdown syntax appears in CLI output
- [ ] Use terminal formatting (bold, colors, caps) instead of Markdown

### 1.2 Restructure ALL command outputs consistently

- [ ] Standards: Make categories clear section headers (not Markdown)
- [ ] Methodologies: Apply same formatting approach
- [ ] Principles: Consistent with others
- [ ] Agents: Same pattern
- [ ] Format pattern: Bold/caps for sections, ID first, clear hierarchy
- [ ] Test ALL switches: --list, --show, --current, --search, --add, --remove

## Phase 2: Rewrite README (45 min)

### 2.1 Structure new README

- [ ] Brief 3-line intro
- [ ] Keep updated Quick Start section
- [ ] Add "Common Tasks" section with practical examples
- [ ] Reorganize existing feature lists for complete coverage
- [ ] Natural organization by feature type (not by version)
- [ ] Add documentation links

### 2.2 Content guidelines

- [ ] Focus on natural feature organization
- [ ] Reuse existing feature descriptions
- [ ] OK to include "(as of vX.Y.Z)" inline for context
- [ ] Avoid "New in vX.Y.Z!" sections
- [ ] Minimal emoji usage
- [ ] Developer-focused tone
- [ ] Ensure ALL features are covered

## Phase 3: Expert Agent Directives (30 min)

### 3.1 Update expert templates

- [ ] Add behavioral_rules section to each expert agent
- [ ] Focus on advisory role, not autonomous rewriting
- [ ] Test with TypeScript-expert first

### 3.2 Templates to update

- [ ] TypeScript-expert
- [ ] python-expert
- [ ] golang-expert
- [ ] react-expert
- [ ] deno-expert
- [ ] postgres-expert
- [ ] tailwind-expert
- [ ] lume-expert
- [ ] vento-expert

## Phase 4: Documentation Updates (45 min)

### 4.1 Update mod.ts

- [ ] Update main JSDoc comment
- [ ] Reflect current features
- [ ] Keep it concise

### 4.2 Review ALL TypeScript files for Deno doc

- [ ] Check every .ts file for JSDoc comments
- [ ] Use all supported Deno doc tags from https://docs.deno.com/runtime/reference/cli/doc/
- [ ] Supported: @module, @param, @returns, @example, @deprecated, @since, @see, @throws, @typeParam, @default, @ignore,
      @internal, @public, @private, @protected, @readonly, @override, @virtual, @abstract, @static, @memberof,
      @namespace, @typedef, @callback, @constructor, @class, @function, @method, @mixin, @event, @fires, @listens,
      @variation, @kind, @this, @export, @template
- [ ] Fix any unsupported tags
- [ ] Ensure proper documentation for public APIs

## Testing Checklist

- [ ] ALL commands have consistent, clear formatting
- [ ] NO Markdown syntax appears in CLI output
- [ ] Categories/sections are visually distinct using terminal formatting
- [ ] IDs are clearly shown first for items
- [ ] Test all switches for each command: --list, --show, --current, --search, --add, --remove
- [ ] README has complete feature coverage
- [ ] README uses natural organization (not version-based)
- [ ] Expert agents suggest rather than rewrite
- [ ] JSDoc comments use only Deno-supported tags
- [ ] No breaking changes to commands
