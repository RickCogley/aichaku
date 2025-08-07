# TypeScript Safety Improvements

## Problem

Aichaku currently has **21+ type assertions** and multiple uses of **`any` types** that bypass TypeScript's type
checking system, creating potential runtime errors and reducing code maintainability. Our analysis found:

- **Type assertions (`as`)**: Bypassing compiler checks in critical CLI parsing code
- **Explicit `any` usage**: Complete loss of type safety in configuration parsing
- **Missing return types**: Reduced type inference and documentation
- **Non-null assertions**: Unsafe assumptions about data presence

This technical debt undermines the reliability promises we make to users and increases debugging time when issues arise.

## Appetite

**6 weeks** (one full Shape Up cycle)

This is substantial refactoring work that touches core functionality, but it's essential for long-term maintainability
and user trust.

## Solution

We implement a **three-layer defense strategy** against TypeScript antipatterns:

### Layer 1: Tooling Configuration

- Enhance `deno.json` with stricter compiler options
- Add explicit linting rules against `any` and type assertions
- Configure CI/CD to fail on violations

### Layer 2: Code Refactoring

- Replace all type assertions with type guards
- Define proper interfaces for all external data
- Add return type annotations to all functions
- Implement runtime validation for YAML/CLI inputs

### Layer 3: Process & Documentation

- Add pre-commit hooks for type checking
- Create TypeScript best practices guide
- Implement automated type coverage reporting

## Rabbit Holes

### ❌ NOT Doing

- **Complete rewrite** of existing modules
- **Migration to different type system** (e.g., ReScript, PureScript)
- **Adding complex type-level programming** (keeping it pragmatic)
- **Changing core architecture** to accommodate types

### ⚠️ Watch Out For

- **Over-engineering type guards** - Keep them simple and testable
- **Breaking changes** to CLI interface - Maintain backward compatibility
- **Performance impacts** from runtime validation - Profile before/after

## No-gos

- ❌ **Breaking existing CLI commands** - All current commands must work identically
- ❌ **Requiring Node.js or Bun** - Stay Deno-native
- ❌ **Changing public API surface** - Internal improvements only
- ❌ **Slowing down CI by >20%** - Performance matters

## Success Criteria

By the end of this cycle, we will have:

1. **Zero `any` types** in production code (tests may have exceptions)
2. **Zero type assertions** without accompanying type guards
3. **100% return type coverage** on exported functions
4. **Runtime validation** for all external data inputs
5. **CI/CD enforcement** preventing regression
6. **Type coverage >95%** as measured by tooling
