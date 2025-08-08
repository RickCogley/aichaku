# MCP Implementation Comparison

## Overview

During the security scanning enhancement project, we discovered two different MCP server implementations in the
codebase. This document compares them to inform the decision on which to use going forward.

## Implementation 1: Original Scanner Controller

**Location**: `/mcp/aichaku-mcp-server/src/scanner-controller.ts`

### Architecture

```typescript
export class ScannerController {
  private scanners: Map<string, Scanner> = new Map();
  private scannerDefinitions: Scanner[] = [];

  // Direct scanner command execution
  private async runScanner(scanner: Scanner, filePath: string, content: string);

  // Inline parsing methods
  private parseDevSkimOutput(output: string, filePath: string): Finding[];
  private parseSemgrepOutput(output: string, filePath: string): Finding[];
}
```

### Characteristics

- **Monolithic design** - All scanner logic in one file
- **Direct command execution** - Uses Deno.Command directly
- **Inline parsing** - Parse methods inside the controller
- **Working implementation** - Confirmed to detect security issues
- **Simple scanner addition** - Just add to scannerDefinitions array

### Pros

- ✅ Currently working and tested
- ✅ Simple to understand and modify
- ✅ All logic in one place
- ✅ Easy to add new scanners

### Cons

- ❌ Violates single responsibility principle
- ❌ Difficult to unit test
- ❌ Parsing logic tightly coupled
- ❌ No abstraction for scanner types

## Implementation 2: New Scanner Architecture

**Location**: `/mcp/aichaku-mcp-server/src/scanners/`

### Architecture

```typescript
// Base abstraction
abstract class BaseSecurityScanner {
  abstract get name(): string;
  abstract isAvailable(): Promise<boolean>;
  abstract scan(filePath: string): Promise<SecurityFinding[]>;
}

// Individual scanner implementations
class DevSkimScanner extends BaseSecurityScanner {}
class SemgrepScanner extends BaseSecurityScanner {}
class CodeQLScanner extends BaseSecurityScanner {}

// Controller orchestrates scanners
class ScannerController {
  private scanners: BaseSecurityScanner[] = [];
}
```

### Characteristics

- **Modular design** - Each scanner in its own file
- **Abstract base class** - Common interface for all scanners
- **Separation of concerns** - Each scanner handles its own logic
- **Not fully working** - Missing dependencies and integration

### Pros

- ✅ Better architecture and design patterns
- ✅ Easy to unit test individual scanners
- ✅ Follows SOLID principles
- ✅ Extensible for new scanner types

### Cons

- ❌ Not currently working
- ❌ Missing npm dependencies
- ❌ More complex file structure
- ❌ Requires more setup

## Feature Comparison

| Feature        | Original          | New Architecture |
| -------------- | ----------------- | ---------------- |
| Working state  | ✅ Yes            | ❌ No            |
| Scanner count  | 5 (including new) | 4                |
| Architecture   | Monolithic        | Modular          |
| Testing        | Difficult         | Easy             |
| Extensibility  | Medium            | High             |
| Dependencies   | Included          | Missing          |
| Error handling | Basic             | Better           |

## Dependencies Status

### Original Implementation

- Uses Deno's built-in command execution
- No npm dependencies required
- Expects CLI tools installed globally

### New Implementation

- Missing eslint and eslint-plugin-security in package.json
- Expects npm-based tool resolution
- Better dependency isolation

## Recommendation

### Short Term (This Cycle)

**Use the Original Implementation** with improvements:

1. It's already working and tested
2. Minimal changes needed to fix display issue
3. Can be enhanced without breaking changes
4. Faster to deliver value

### Long Term (Future Cycles)

**Migrate to New Architecture** gradually:

1. Port working scanner logic from original
2. Add proper dependencies
3. Implement comprehensive tests
4. Switch over when fully validated

## Migration Path

If we choose to migrate later:

1. **Phase 1**: Fix original implementation display issue
2. **Phase 2**: Add tests to original implementation
3. **Phase 3**: Port scanner logic to new architecture
4. **Phase 4**: Validate new implementation matches original
5. **Phase 5**: Switch MCP to use new implementation
6. **Phase 6**: Remove original implementation

## Decision Log

**Date**: 2025-08-02 **Decision**: [Pending] **Rationale**: [To be filled after team decision] **Participants**: [Team
members involved]

---

_This document will be updated with the final decision and implementation progress._
