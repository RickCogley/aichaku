# TypeScript vs Binary Performance Analysis for Hooks

## Performance Comparison

### TypeScript (Current Implementation)

```bash
deno run --allow-read --allow-write --allow-env ~/.claude/aichaku/hooks/aichaku-hooks.ts [hook-name]
```

**Startup Time:**

- First run: ~200-300ms (includes TypeScript compilation)
- Subsequent runs: ~50-100ms (cached)
- Memory usage: ~30-50MB

**Pros:**

- ✅ Zero installation complexity
- ✅ Easy to update/modify
- ✅ Cross-platform without compilation
- ✅ Source code visible for debugging
- ✅ Deno caches compiled version automatically

**Cons:**

- ❌ Slightly slower cold start
- ❌ Requires Deno runtime

### Compiled Binary

```bash
~/.claude/aichaku/hooks/aichaku-hooks [hook-name]
```

**Startup Time:**

- All runs: ~10-30ms
- Memory usage: ~15-25MB

**Pros:**

- ✅ Faster startup (3-5x faster)
- ✅ No Deno dependency at runtime
- ✅ Single file distribution

**Cons:**

- ❌ Platform-specific binaries needed
- ❌ Larger file size (~50-80MB per platform)
- ❌ Complex update process
- ❌ Compilation time during development
- ❌ Harder to debug issues

## Real-World Impact

### Hook Execution Frequency

- PreToolUse/PostToolUse: ~10-50 times per session
- Stop/PreCompact: 1-2 times per session
- Total: ~50-100 hook executions per session

### Time Difference Per Session

- TypeScript: 50 executions × 75ms = 3.75 seconds
- Binary: 50 executions × 20ms = 1 second
- **Difference: ~2.75 seconds per session**

## Recommendation

**Stick with TypeScript** for now because:

1. **Negligible Performance Impact**: 2-3 seconds over an entire session is imperceptible
2. **Deno Caching**: After first run, TypeScript is nearly as fast
3. **Maintenance Simplicity**: One codebase, no platform builds
4. **User Experience**: Easy updates, visible source code
5. **Distribution**: Simple file copy vs complex binary management

## Future Optimization Path

If performance becomes critical:

1. Start with TypeScript (current approach) ✅
2. Monitor real-world usage
3. If users report slowness, then consider:
   - Binary compilation for v0.30+
   - Provide both options
   - Benchmark with real workloads

## Conclusion

The ~50ms overhead per hook execution is a reasonable tradeoff for the significant simplicity gains. Users are unlikely
to notice the difference, but they will definitely notice if binary distribution is complex or buggy.

**Recommendation: Ship v0.29.0 with TypeScript hooks** and revisit binary compilation only if performance complaints
arise.
