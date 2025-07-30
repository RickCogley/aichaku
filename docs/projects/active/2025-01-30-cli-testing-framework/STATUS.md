# CLI Testing Framework - Status

🌱 **Phase**: Shaping → [**Building**] → Cool-down\
📅 **Timeline**: Week 1/6 (2025-01-30)\
🎯 **Confidence**: High - Clear problem, known solution

## Current Status

### 🔥 Immediate Fix Required

The `--show <id>` regression is caused by parseArgs configuration. When `show` is only in the boolean array, it cannot
accept string values. This causes `--show agile-manifesto` to be parsed incorrectly.

**Root Cause Identified**:

```javascript
// Current (BROKEN)
boolean: ["show", ...],
string: [/* show is missing */]

// Fixed
boolean: ["show", ...],  
string: ["show", ...]  // Must be in BOTH arrays
```

### Week 1-2: Foundation (Current)

- [x] Diagnose the parseArgs issue
- [ ] Fix parseArgs configuration
- [ ] Create test utilities for output capture
- [ ] Write argument parsing tests
- [ ] Test the fix manually with all variants

### Week 3-4: Command Tests

- [ ] Principles command full test suite
- [ ] Methodologies command full test suite
- [ ] Standards command full test suite
- [ ] Negative assertion patterns
- [ ] Error case testing

### Week 5-6: Integration & Polish

- [ ] CLI integration test harness
- [ ] CI/CD test integration
- [ ] Test documentation
- [ ] Release checklist update

## Discovered Issues

1. **parseArgs Dual Declaration**: Flags that can be both boolean (bare) and string (with value) must be declared in
   BOTH arrays
2. **Missing Test Coverage**: No existing tests for methodologies/standards commands
3. **Weak Assertions**: Current tests don't use negative assertions

## Next Actions

1. **Fix the regression** (TODAY)
   - Add "show" to string array in cli.ts
   - Test all three commands with all --show variants
   - Verify no other flags have this issue

2. **Create test infrastructure**
   - Output capture utilities
   - Test data fixtures
   - Assertion helpers

3. **Write comprehensive tests**
   - Start with the broken functionality
   - Expand to full command coverage

## Success Metrics

- [ ] All 28 command variants have tests
- [ ] Zero regressions in next release
- [ ] Tests run in < 30 seconds
- [ ] 100% command coverage (not line coverage)

## Risk Register

| Risk                         | Impact | Mitigation               |
| ---------------------------- | ------ | ------------------------ |
| More hidden parseArgs issues | High   | Audit all dual-use flags |
| Test suite too slow          | Medium | Parallel execution       |
| False positives              | High   | Negative assertions      |
