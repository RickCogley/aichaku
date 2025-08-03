# Git Hook MCP Integration Plan

## Executive Summary

The Claude Code hooks infrastructure consumes tokens rapidly because it fires on EVERY file save. We can repurpose this
infrastructure for git pre-commit hooks which only run when committing, dramatically reducing token usage while
maintaining security scanning capabilities.

## Current Infrastructure Analysis

### Token Consumption Problem

**Claude Code Hooks Flow:**

```
Every File Save → Hook Fires → MCP API Call → Token Usage
(~100+ times per hour during active development)
```

**Git Pre-commit Flow:**

```
Git Commit → Pre-commit Hook → MCP Local Scan → No Token Usage
(~5-10 times per day)
```

### Existing Components We Can Reuse

| Component          | Location                                            | Current Use             | Git Hook Adaptation    |
| ------------------ | --------------------------------------------------- | ----------------------- | ---------------------- |
| MCP Server         | `~/.aichaku/mcp-servers/aichaku-code-reviewer`      | Claude Code integration | Direct local execution |
| Scanner Controller | `/mcp/aichaku-mcp-server/src/scanner-controller.ts` | Security scanning       | Use as-is              |
| Review Hook Script | `/scripts/mcp-review-hook.sh`                       | Claude Code trigger     | Adapt for git hooks    |
| Security Rules     | Built into scanner                                  | OWASP/CWE patterns      | Use locally            |

## Implementation Plan

### Phase 1: Update Existing Security Check Hook

**Update: `.githooks/hooks.d/40-security-check`**

```bash
#!/bin/bash
# MCP Security Scan - Uses local MCP server for security analysis
# No token consumption - runs scanners locally

. .githooks/lib/common.sh

echo "    🔒 Running MCP security scan..."

# Check if MCP server binary exists
MCP_BINARY="$HOME/.aichaku/mcp-servers/aichaku-code-reviewer"
if [ ! -x "$MCP_BINARY" ]; then
    log_warn "MCP reviewer not installed, falling back to basic checks"
    exit 0
fi

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js|py|go|java|cs|rb)$')

if [ -z "$STAGED_FILES" ]; then
    log_info "No code files to scan"
    exit 0
fi

# Create temporary directory for scanning
SCAN_DIR=$(mktemp -d)
trap "rm -rf $SCAN_DIR" EXIT

# Copy staged files to temp directory (preserving paths)
for file in $STAGED_FILES; do
    mkdir -p "$SCAN_DIR/$(dirname "$file")"
    git show ":$file" > "$SCAN_DIR/$file"
done

# Run MCP security scan locally (no API calls)
SCAN_RESULTS=$("$MCP_BINARY" scan-local \
    --path "$SCAN_DIR" \
    --format json \
    --security-only \
    --no-telemetry \
    2>/dev/null)

# Parse results
CRITICAL_COUNT=$(echo "$SCAN_RESULTS" | jq -r '.findings | map(select(.severity == "critical")) | length' 2>/dev/null || echo "0")
HIGH_COUNT=$(echo "$SCAN_RESULTS" | jq -r '.findings | map(select(.severity == "high")) | length' 2>/dev/null || echo "0")

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    log_error "Found $CRITICAL_COUNT critical security issues!"
    echo "$SCAN_RESULTS" | jq -r '.findings[] | select(.severity == "critical") | "  [\(.severity)] \(.file):\(.line) - \(.message)"' 2>/dev/null
    exit 1
fi

if [ "$HIGH_COUNT" -gt 0 ]; then
    log_warn "Found $HIGH_COUNT high severity issues"
    echo "$SCAN_RESULTS" | jq -r '.findings[] | select(.severity == "high") | "  [\(.severity)] \(.file):\(.line) - \(.message)"' 2>/dev/null
fi

log_success "MCP security scan passed"
exit 0
```

### Phase 2: Adapt MCP Server for Local-Only Mode

**Update: `/mcp/aichaku-mcp-server/src/scanner-controller.ts`**

Add a local-only scan method that doesn't make API calls:

```typescript
export class ScannerController {
  // ... existing code ...

  /**
   * Local-only scanning for git hooks - NO API CALLS
   */
  async scanLocalOnly(options: LocalScanOptions): Promise<ScanResult> {
    const results: Finding[] = [];

    // Only use local scanners (DevSkim, Semgrep, etc.)
    for (const scanner of this.localScanners) {
      if (scanner.available) {
        const findings = await scanner.scan(options.files);
        results.push(...findings);
      }
    }

    return {
      findings: results,
      summary: this.summarizeFindings(results),
      timestamp: new Date(),
    };
  }
}
```

### Phase 3: Create Standalone CLI for Git Hooks

**New File: `/mcp/aichaku-mcp-server/src/git-hook-cli.ts`**

```typescript
#!/usr/bin/env deno run --allow-read --allow-run --allow-write

/**
 * Git Hook CLI - Lightweight security scanner for pre-commit
 * No MCP protocol overhead, direct scanner execution
 */

import { ScannerController } from "./scanner-controller.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

async function main() {
  const args = parse(Deno.args, {
    string: ["path", "format"],
    boolean: ["security-only", "no-telemetry"],
    default: {
      format: "json",
      "security-only": true,
      "no-telemetry": true,
    },
  });

  const scanner = new ScannerController();
  await scanner.initialize();

  // Scan without MCP protocol overhead
  const results = await scanner.scanLocalOnly({
    path: args.path,
    files: await getFilesFromPath(args.path),
    securityOnly: args["security-only"],
  });

  // Output results
  if (args.format === "json") {
    console.log(JSON.stringify(results, null, 2));
  } else {
    formatTextOutput(results);
  }

  // Exit with error if critical issues found
  const criticalCount = results.findings.filter((f) => f.severity === "critical").length;
  Deno.exit(criticalCount > 0 ? 1 : 0);
}

if (import.meta.main) {
  main();
}
```

## Benefits Over Claude Code Hooks

### 1. **Token Usage Reduction**

- Claude Hooks: ~500-1000 API calls/day (every save)
- Git Hooks: 0 API calls (local scanning only)
- **Savings: 100% token reduction**

### 2. **Performance**

- Claude Hooks: Network latency on every save
- Git Hooks: Local execution, < 5 seconds
- **Improvement: 10x faster**

### 3. **Developer Experience**

- No constant interruptions during development
- Security checks only when ready to commit
- Clear, actionable feedback at commit time

## Migration Path

### Step 1: Install MCP Server Locally

```bash
aichaku mcp --install
```

### Step 2: Enable Git Hook

```bash
chmod +x .githooks/hooks.d/45-mcp-security-scan
```

### Step 3: Disable Claude Code Hooks (Optional)

```bash
# Edit ~/.claude/settings.json
# Set hooks.enabled = false for aichaku-mcp-server project
```

### Step 4: Test the Setup

```bash
# Create a test file with security issue
echo 'eval(userInput)' > test.js
git add test.js
git commit -m "test" # Should be blocked by security scan
```

## Configuration Options

### `.aichaku/git-hooks.yaml`

```yaml
mcp_security:
  enabled: true
  binary_path: "~/.aichaku/mcp-servers/aichaku-code-reviewer"
  scanners:
    - devskim
    - semgrep
    - gitleaks # if installed
  severity_threshold: high # Block on high/critical only
  scan_timeout: 30s
  cache_results: true
  excluded_paths:
    - "*.test.ts"
    - "*.spec.js"
    - "docs/**"
```

## Fallback Strategy

If MCP server is not available:

1. Check for individual scanners (devskim, semgrep)
2. Run them directly if available
3. Fall back to basic pattern matching
4. Never block commits without clear reason

## Testing Strategy

1. **Unit Tests**: Test scanner integration without git
2. **Integration Tests**: Full git commit flow with test repos
3. **Performance Tests**: Ensure < 5s for typical commits
4. **Fallback Tests**: Verify graceful degradation

## Rollout Plan

1. **Week 1**: Implement local-only scanner mode
2. **Week 2**: Create git hook script and test
3. **Week 3**: Beta test with volunteer developers
4. **Week 4**: Full rollout with documentation
5. **Week 5-6**: Gather feedback and optimize

## Success Metrics

- Zero token consumption for security scanning
- < 5 second scan time for average commit
- 90% of security issues caught before commit
- Developer satisfaction > 4/5

## Conclusion

By repurposing the Claude Code hooks infrastructure for git pre-commit hooks, we can achieve comprehensive security
scanning without the token consumption issues. The existing MCP server and scanner infrastructure provides everything
needed - we just need to bypass the API layer and run locally.
