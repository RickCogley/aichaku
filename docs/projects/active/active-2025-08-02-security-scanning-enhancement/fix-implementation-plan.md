# Security Scanner Display Fix - Implementation Plan

## Problem Summary

Security scanners (DevSkim, Semgrep, CodeQL) are installed and working, but findings aren't displayed in the MCP tool
output. The issue stems from having two different MCP server implementations with different architectures.

## Immediate Fix Plan (Week 1)

### Option A: Fix Original Implementation (Recommended)

Since the original `scanner-controller.ts` is working, we should fix the display pipeline:

```typescript
// Current flow that needs fixing:
MCP Tool Request → review-file.ts → ReviewEngine → ScannerController → Scanners
                                                          ↓
                                                   [Findings Lost Here]
                                                          ↓
                                    FeedbackSystem ← (empty results)
```

#### Steps:

1. **Verify which implementation is being used**
   ```bash
   # Check which scanner-controller is imported in review-engine.ts
   grep -n "scanner-controller" src/review-engine.ts
   ```

2. **Update imports to use working implementation**
   ```typescript
   // Change from:
   import { ScannerController } from "./scanners/scanner-controller.ts";
   // To:
   import { ScannerController } from "./scanner-controller.ts";
   ```

3. **Test the fix**
   ```bash
   # Run direct test
   deno run --allow-all test-basic-scanners.ts

   # Test through MCP
   mcp__aichaku-reviewer__review_file test-security-basic.ts
   ```

### Option B: Fix New Implementation

If we must use the new architecture:

1. **Add missing dependencies**
   ```json
   {
     "dependencies": {
       "eslint": "^8.57.0",
       "eslint-plugin-security": "^1.7.1"
     }
   }
   ```

2. **Fix scanner implementations**
   - Update file paths in scanner commands
   - Fix parsing logic to match actual output
   - Add better error handling

3. **Verify scanner availability**
   - Update isAvailable() checks
   - Add fallback for missing dependencies

## Testing Plan

### 1. Create Test File

```typescript
// test-security.ts
const password = "hardcoded-password"; // Should trigger
eval(userInput); // Should trigger
document.innerHTML = input; // Should trigger
```

### 2. Test Each Layer

```bash
# Test scanner directly
deno run --allow-all src/scanner-controller.ts test-security.ts

# Test review engine
deno run --allow-all src/review-engine.ts test-security.ts

# Test MCP tool
mcp__aichaku-reviewer__review_file test-security.ts
```

### 3. Verify Output

Expected output should show:

- Security findings with severity
- Scanner that found each issue
- Line numbers and suggestions
- Proper formatting

## Quick Fix Script

```bash
#!/bin/bash
# fix-scanner-display.sh

echo "🔧 Fixing Security Scanner Display Issue"

# 1. Check current implementation
echo "Checking which scanner controller is used..."
grep -n "scanner-controller" src/review-engine.ts

# 2. Update to working implementation
echo "Updating to use original scanner-controller..."
sed -i.bak 's|./scanners/scanner-controller|./scanner-controller|g' src/review-engine.ts

# 3. Test the fix
echo "Testing security scanning..."
cat > test-security-issue.ts << 'EOF'
const password = "secret123";
eval(userInput);
EOF

# 4. Run through MCP
echo "Running MCP security review..."
deno run --allow-all src/tools/review-file.ts test-security-issue.ts

echo "✅ Fix applied. Test the MCP tool to verify."
```

## Validation Checklist

- [ ] Scanner controller imports corrected
- [ ] Test file triggers security findings
- [ ] Direct scanner test shows findings
- [ ] Review engine receives findings
- [ ] Feedback system formats findings
- [ ] MCP tool displays findings
- [ ] Git hook integration works

## Rollback Plan

If the fix causes issues:

1. Restore original imports:
   ```bash
   mv src/review-engine.ts.bak src/review-engine.ts
   ```

2. Document the issue for deeper investigation

3. Use direct scanner commands as workaround

## Success Criteria

✅ Running `mcp__aichaku-reviewer__review_file` on a file with security issues shows:

- List of security findings
- Severity levels
- Scanner attribution
- Actionable recommendations

✅ Git hooks successfully use MCP reviewer when available

✅ Performance remains under 5 seconds for typical files

---

_This plan focuses on the quickest path to fixing the display issue while maintaining system stability._
