# Runtime Validation Strategy with Zod

## Overview

Aichaku uses [Zod](https://zod.dev) for runtime validation of external data inputs, providing type safety beyond
TypeScript's compile-time checks. This document explains our validation strategy and implementation decisions.

## Why Zod?

### The Problem

TypeScript only provides compile-time type checking. When Aichaku:

- Loads configuration files from disk
- Parses YAML/JSON content
- Processes CLI arguments
- Receives data from external sources

...there's no guarantee the data matches our expected types at runtime. Users might manually edit config files, or files
might become corrupted.

### Why We Chose Zod

After evaluating alternatives (see
[Deno Validation Libraries Report](../reference/deno-validation-libraries-report.md)), we selected Zod because:

1. **Best Developer Experience**
   - Exceptional TypeScript inference
   - Single source of truth (schema generates types)
   - Extensive documentation
   - Large, active community

2. **Perfect Fit for CLI Tools**
   - Bundle size (60kb) irrelevant for CLI applications
   - Server-side focus matches our use case
   - Mature, stable, production-ready

3. **Ecosystem Compatibility**
   - Works seamlessly with Deno via `npm:` specifier
   - Already using npm packages (MCP SDK)
   - Rich ecosystem of integrations

4. **Superior to Alternatives**
   - **Typebox**: More verbose, less intuitive API
   - **Valibot**: Younger ecosystem, limited documentation
   - **ArkType**: Still in beta, too risky
   - **Native validation**: Would require excessive boilerplate

## Implementation Strategy

### Boundary Validation Pattern

```
External World → [Zod Validation] → Your Code → [TypeScript Types] → Internal Logic
```

We validate data at system boundaries, not everywhere:

### ✅ Where We Use Zod

1. **Configuration Files** (`src/utils/config-manager.ts`)
   ```typescript
   const rawConfig = JSON.parse(content);
   const config = AichakuConfigSchema.parse(rawConfig); // Validated!
   ```

2. **YAML Parsing** (`src/utils/yaml-config-reader.ts`)
   ```typescript
   const parsed = parse(yamlContent);
   return YamlConfigSchema.parse(parsed); // Safe parsing
   ```

3. **CLI Arguments** (`src/utils/config-schemas.ts`)
   ```typescript
   export const CLIArgsSchema = z.object({
     help: z.boolean().optional(),
     version: z.boolean().optional(),
     // ... validated argument structure
   });
   ```

### ❌ Where We Don't Use Zod

- Internal function calls between modules
- Test code
- Generated or computed data
- Type-safe builder patterns

## Schema Definitions

All Zod schemas are centralized in `src/utils/config-schemas.ts`:

```typescript
// Example: Project Configuration Schema
export const ProjectConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  selected: z.object({
    methodologies: z.array(z.string()).default([]),
    standards: z.array(z.string()).default([]),
    principles: z.array(z.string()).default([]),
    agents: z.array(z.string()).default([]),
  }),
  metadata: z.object({
    lastUpdated: z.string().datetime().optional(),
    projectPath: z.string().optional(),
  }).optional(),
});

// Type inference - no duplication!
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
```

## Best Practices

### 1. Fail Fast with Clear Errors

```typescript
try {
  const config = ConfigSchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Invalid configuration:", error.format());
  }
}
```

### 2. Use Safe Parsing When Appropriate

```typescript
const result = ConfigSchema.safeParse(data);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

### 3. Provide Defaults

```typescript
const ConfigSchema = z.object({
  theme: z.string().default("light"),
  items: z.array(z.string()).default([]),
});
```

### 4. Compose Schemas

```typescript
const BaseSchema = z.object({ id: z.string() });
const ExtendedSchema = BaseSchema.extend({
  name: z.string(),
  description: z.string(),
});
```

## Performance Considerations

- **Overhead**: <5ms for typical config validation
- **Bundle Size**: 60kb (acceptable for CLI tools)
- **Runtime Impact**: Negligible for non-hot-path validation

## Migration Guide

When adding validation to existing code:

1. **Identify External Data Entry Points**
   - File reads
   - User inputs
   - Network responses

2. **Create Schema**
   ```typescript
   const DataSchema = z.object({
     // Define expected structure
   });
   ```

3. **Replace Type Assertions**
   ```typescript
   // Before (unsafe)
   const data = JSON.parse(content) as DataType;

   // After (safe)
   const data = DataSchema.parse(JSON.parse(content));
   ```

4. **Handle Validation Errors**
   ```typescript
   try {
     const data = DataSchema.parse(input);
   } catch (error) {
     // Provide user-friendly error message
   }
   ```

## Security Benefits

Zod validation helps prevent:

- **Injection Attacks** (OWASP A03): Validates and sanitizes inputs
- **Data Integrity Issues** (OWASP A08): Ensures data structure compliance
- **Type Confusion Vulnerabilities**: Runtime type enforcement

## Future Considerations

Potential areas for expanded validation:

- MCP server responses
- File system operation results
- Plugin/extension data
- Network API responses

## References

- [Zod Documentation](https://zod.dev)
- [Deno Validation Libraries Report](../reference/deno-validation-libraries-report.md)
- [TypeScript Safety Improvements](../projects/active/2025-08-06-typescript-safety-improvements/implementation-results.md)
