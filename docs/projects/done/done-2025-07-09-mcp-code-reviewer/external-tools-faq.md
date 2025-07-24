# External Tools FAQ

🪴 Aichaku: Understanding Security Scanner Integration

## Can We Bundle DevSkim/CodeQL?

**Short answer**: No, they must be installed separately.

**Why not?**

1. **Different languages**: DevSkim (C#), CodeQL (Java), Semgrep (Python)
2. **Different runtimes**: Each needs its own runtime environment
3. **Licensing**: Each has its own license terms
4. **Size**: Would make our binary huge (100s of MB)
5. **Updates**: They update independently

## How It Works Instead

### 1. Smart Detection

```typescript
// MCP detects what's available
Available tools:
✅ Built-in patterns (always)
❌ DevSkim (not installed)
✅ ESLint (found)
❌ CodeQL (not installed)

→ Review uses built-in + ESLint
```

### 2. Progressive Enhancement

- **No tools**: Still works with built-in patterns
- **Some tools**: Better coverage
- **All tools**: Maximum security coverage

### 3. Easy Installation

```bash
# One-time setup (optional)
npm install -g @microsoft/devskim-cli
brew install codeql
pip install semgrep
```

## What We CAN Bundle

✅ **Pattern matching** - Built into our Deno binary ✅ **OWASP rules** - Our own implementation ✅ **Methodology
checks** - Native TypeScript ✅ **Basic security scans** - No dependencies

## Distribution Approach

```
mcp-code-reviewer (5-10MB compiled)
├── Built-in security patterns
├── Methodology compliance rules
├── Standards checking logic
└── External tool integration
    ├── Detects: devskim, codeql, semgrep
    └── Uses if available
```

## User Experience

### First Run

```
$ mcp-code-reviewer
🪴 MCP Code Reviewer

Detected tools:
• Built-in scanner ✅
• DevSkim ❌ (npm install -g @microsoft/devskim-cli)
• CodeQL ❌ (brew install codeql)

You can use MCP now with built-in scanning, or install
optional tools for enhanced coverage.
```

### With Tools

```
$ mcp-code-reviewer
🪴 MCP Code Reviewer

Detected tools:
• Built-in scanner ✅
• DevSkim ✅
• CodeQL ✅
• Semgrep ✅

Maximum security coverage enabled!
```

## Why This Is Better

1. **Smaller binary**: 5-10MB vs 500MB+
2. **User choice**: Install only what you need
3. **Independent updates**: Tools update separately
4. **Legal clarity**: No bundled license conflicts
5. **Flexibility**: Add new tools anytime

## Installation Priority

For most users:

1. **Start with MCP only** (built-in patterns)
2. **Add DevSkim** if doing general development
3. **Add Semgrep** for custom rules
4. **Add CodeQL** for deep analysis (larger projects)

The MCP works great even with zero external tools!
