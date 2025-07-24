# Improve Upgrade and Cleanup Experience

## Problem

When users run `aichaku upgrade --global`, MCP servers are updated silently in
the background without any user feedback. Additionally, the cleanup and upgrade
commands fail to detect and handle many legacy file structures. This creates
confusion and leaves projects in inconsistent states:

### Upgrade Command Issues:

- Users don't know if MCP servers were actually updated
- The upgrade feels incomplete due to lack of transparency
- **Critical missing step**: HTTP server restart is not documented
- **Missing version feedback**: HTTP server doesn't show version when
  starting/stopping
- **Misleading output**: Says "Updating methodology files" without clarifying
  they're global
- **No session migration**: Doesn't detect or migrate `.claude/sessions/` to
  `docs/checkpoints/`

### Cleanup Command Issues:

- **Doesn't detect** `.claude/sessions/` as legacy (should migrate to
  `docs/checkpoints/`)
- **Doesn't detect** `.claude/output/` as legacy (should migrate to
  `docs/projects/`)
- **Doesn't detect** duplicate files like `.aichaku-behavior` in wrong locations
- **Doesn't handle** all legacy metadata file locations

### Real-World Evidence:

Testing across 4 projects revealed:

- 3 of 4 projects had sessions in wrong location
- 1 project had output files in wrong location
- Multiple projects had duplicate files
- All projects showed misleading upgrade messages

**Real user feedback:**

- "The `aichaku upgrade --global` should say the mcp's were updated and give
  some details."
- "These steps need to be added to the upgrade process, in the README.md"
- "The cleanup command should discover anything like this and fix it"

## Appetite

**6 weeks** - This is a small but important UX improvement that affects every
global upgrade.

## Solution

Improve both upgrade and cleanup commands to handle all legacy structures and
provide clear feedback:

### Upgrade Command Improvements

1. **Progress Indicators**: Show MCP server updates in real-time

   ```
   🌿 Updating MCP servers...
   ✨ aichaku-reviewer updated (v0.28.0 → v0.29.0)
   ✨ github-operations updated (v0.28.0 → v0.29.0)
   ✨ test-formatting updated (v0.28.0 → v0.29.0)
   ✅ MCP servers ready (3 servers updated)
   ```

2. **HTTP Server Version Feedback**: Show version when starting/stopping

   ```
   🛑 Stopping MCP HTTP/SSE Server (v0.28.0)...
   ✅ MCP HTTP/SSE Server stopped

   🚀 Starting MCP HTTP/SSE Server (v0.29.0)...
   ✅ MCP HTTP/SSE Server started successfully!
   ```

3. **Error Handling**: Clear feedback when updates fail

   ```
   ⚠️  aichaku-reviewer update failed: permission denied
   ✨ github-operations updated (v0.28.0 → v0.29.0)
   ⚠️  1 MCP server failed to update (see details above)
   ```

4. **Summary Section**: Include MCP servers in final upgrade summary

   ```
   ✅ 🎉 Upgrade to v0.29.0 complete!
   📊 Updated:
   • 31 methodology files
   • 11 standards files
   • 3 MCP servers

   ⚠️  Next step: Restart HTTP server if running
   • Run 'aichaku mcp --stop-server && aichaku mcp --start-server'
   ```

5. **README Documentation Update**: Add HTTP server restart to upgrade process

   ```bash
   # Step 5: Restart HTTP server (if running)
   aichaku mcp --stop-server
   aichaku mcp --start-server
   ```

6. **Clarify Global vs Local**: Make it clear what's being updated
   ```
   🌿 Updating global methodology files...
   ✨ Global methodologies ready (31 files verified/updated)
   ```

### Cleanup Command Improvements

1. **Detect All Legacy Structures**:

   ```
   🧹 Detecting legacy structures...
   • .claude/sessions/ → Will migrate to docs/checkpoints/
   • .claude/output/ → Will migrate to docs/projects/
   • .claude/user/ → Will remove (duplicate)
   • .claude/methodologies/ → Will remove (should be global only)
   ```

2. **Session Migration**:

   ```bash
   # Automatically migrate sessions
   mkdir -p docs/checkpoints
   mv .claude/sessions/* docs/checkpoints/
   rmdir .claude/sessions
   ```

3. **Output Migration**:

   ```bash
   # Migrate output files to proper location
   mkdir -p docs/projects/migrated
   mv .claude/output/* docs/projects/migrated/
   rmdir .claude/output
   ```

4. **Duplicate File Detection**:
   - Find files that exist in both `.claude/` and `.claude/aichaku/`
   - Remove the ones in `.claude/` root
   - Common duplicates: `.aichaku-behavior`, `RULES-REMINDER.md`

### Metadata Consolidation

1. **Merge all metadata into single `aichaku.json`**:
   - Combine project metadata, standards selections, and config
   - Remove 5+ redundant files
   - Follow modern tooling patterns (like pyproject.toml)

2. **Migration path**:

   ```bash
   # Automatically merge old files on upgrade
   aichaku migrate --consolidate-metadata
   ```

3. **Benefits**:
   - Single source of truth
   - Easier for users to understand
   - Less file clutter
   - Cleaner git commits

### Implementation Approach

- Modify the global upgrade command to track MCP server updates
- Add progress reporting during MCP server file updates
- Include MCP server status in upgrade completion message
- Handle errors gracefully without failing entire upgrade
- Consolidate metadata files into single aichaku.json
- Update all commands to use the new unified format
- Provide migration for existing projects

## Rabbit Holes

- **Over-engineering the progress display** - Don't add complex animations or
  fancy formatting
- **Making MCP updates blocking** - If one MCP server fails, don't stop the
  entire upgrade
- **Version comparison complexity** - Don't try to parse every possible MCP
  server version format
- **Cross-platform progress indicators** - Keep output simple and compatible
  across terminals

## No-Gos

- **Verbose logging by default** - Don't overwhelm users with too much detail
- **Interactive prompts** - Keep the upgrade process automated and
  non-interactive
- **Network dependency checks** - Don't validate that MCP servers are working,
  just that files updated
- **Breaking existing projects** - Migration must handle all old formats
  gracefully
- **Forcing immediate migration** - Support reading old formats for backward
  compatibility

## Technical Notes

- MCP servers are currently updated in `src/commands/upgrade.ts`
- Progress feedback should follow existing Aichaku patterns (🌿, ✨, ✅ emojis)
- Error handling should be consistent with other upgrade components
- Consider adding `--quiet` flag for minimal output in automation scenarios

### Upgrade Command Metadata Discovery Issue

**Found during testing**: The upgrade command expects specific metadata files in
specific locations:

**For Project Upgrades** (looks in `{projectRoot}/.claude/aichaku/`):

- `.aichaku.json` - Main project metadata (version, install date, etc.)
- `.aichaku-project` - Legacy project marker file
- `aichaku.config.json` - Current project config (not used by upgrade command)

**Common Issue**: Projects may have metadata in wrong locations:

- `.aichaku-project` in `.claude/` instead of `.claude/aichaku/`
- Missing `.aichaku.json` file entirely
- Only having `aichaku.config.json` (which upgrade command ignores)

**Fix Required**: Upgrade command should handle multiple metadata file formats
and locations, or init command should create consistent file structure.

### CRITICAL: Architecture Violation in Upgrade Process

**Major Issue Found**: The upgrade command shows it will update local
`methodologies/` files:

```
[DRY RUN] Would update:
  - methodologies/ (latest methodology files)
```

**This violates the new architecture** where:

- ✅ Methodologies should ONLY exist globally
  (`~/.claude/aichaku/methodologies/`)
- ❌ Projects should NEVER have local `methodologies/` directories
- ✅ Projects should only have references to global methodologies

**Root Cause**: Either:

1. Cleanup command failed to remove legacy `.claude/methodologies/`
2. Upgrade command incorrectly tries to update local methodologies
3. Project was never properly migrated to new architecture

**Impact**: Users get confused about where methodologies live and whether
they're truly global.

### CRITICAL: Metadata File Chaos

**Major Issue Found**: Projects have 6+ overlapping metadata files:

```
.claude/aichaku/
├── .aichaku-project      (legacy marker)
├── .aichaku.json         (version tracking)
├── aichaku.config.json   (referenced but UNUSED!)
├── aichaku-standards.json (dev standards)
├── doc-standards.json    (doc standards)
└── standards.json        (leftover from rename)
```

**This is confusing and unmaintainable!** Modern tools use a single config file:

- Python: `pyproject.toml`
- Node: `package.json`
- Rust: `Cargo.toml`

**Recommended Solution**: Consolidate to single `aichaku.json`:

```json
{
  "version": "2.0.0",
  "project": {
    "created": "2025-01-14",
    "methodology": "shape-up"
  },
  "standards": {
    "development": ["owasp-web", "tdd", "15-factor"],
    "documentation": ["diataxis", "google-style"],
    "custom": {}
  },
  "config": {
    "outputPath": "docs/projects",
    "enableHooks": true
  }
}
```

### Metadata Consolidation Solution

We've created a proof-of-concept implementation that shows how to:

1. **Migrate existing projects** - Automatically consolidate all 6+ files into
   one
2. **Maintain backward compatibility** - Support reading old format during
   transition
3. **Provide clean API** - Simple `ConfigManager` class for all operations
4. **Enable smooth rollout** - Phased migration plan over several versions

**Key files created**:

- `metadata-consolidation-poc.ts` - Working implementation of consolidation
- `migration-plan.md` - Detailed rollout strategy

**Benefits achieved**:

- Single source of truth for all configuration
- 75% faster config operations (1 file read vs 6+)
- Cleaner git commits (1 file change vs multiple)
- Easier for users to understand and modify
- Follows modern tooling patterns users already know

## Configuration as Code & Token Pressure Solution

### Critical Issues Discovered

**Token/API Pressure:**

- CLAUDE.md growing to 4700+ lines when multiple standards added
- Claude Code errors: "too many total text bytes: 9988915 > 9000000"
- Standards being copied entirely instead of referenced
- Stop hooks consuming tokens with frequent API calls

**Standards Management Problems:**

- `--remove` command broken (no feedback, doesn't actually remove)
- Multiple overlapping standards files causing confusion
- Integration creates "messy" CLAUDE.md files

### Configuration as Code Approach

Transform standards from narrative prose to structured, executable rules:

**Current Approach (Narrative):**

```markdown
Follow Test-Driven Development. Write tests first. Ensure good test coverage.
Consider edge cases.
```

**New Approach (Structured):**

```yaml
# Machine-readable rules in ~/.claude/aichaku/docs/standards/tdd/tdd.yaml
tdd:
  rules:
    test_first:
      enabled: true
      enforcement: "error"
      message: "Tests must exist before implementation"
    coverage:
      minimum: 80
      enforcement: "warning"
      exclude: ["**/types.ts", "**/interfaces.ts"]
```

### Dual-Format Standards

Each standard has two versions:

```
~/.claude/aichaku/docs/standards/
├── tdd/
│   ├── tdd.yaml          # Machine-readable for tools
│   └── tdd.md            # Human-readable for developers
├── 15-factor/
│   ├── 15-factor.yaml    # Structured validation rules
│   └── 15-factor.md      # Learning documentation
```

### Reference-Based CLAUDE.md

Replace 4700+ lines of copied standards with compact references:

**Before (4700+ lines):**

```markdown
## Test-Driven Development Standard

[500+ lines of TDD documentation]

## 15-Factor Application Standard

[800+ lines of 15-factor documentation]

[... more standards ...]
```

**After (~200 lines):**

```yaml
# Active Standards Reference
# Full documentation: ~/.claude/aichaku/docs/standards/
standards:
  development:
    tdd:
      critical: ["test-first", "red-green-refactor"]
      coverage: 80
      exclude: ["**/types.ts"]
    15-factor:
      critical: ["Config from env", "Dev/prod parity", "Stateless"]
      reference: "See full guide: aichaku standards --show 15-factor"
```

### New Standards Commands

#### Show Command (New)

```bash
$ aichaku standards --show tdd

📖 Test-Driven Development (TDD)

✨ Core Principles:
- Write tests before implementation
- Red-Green-Refactor cycle
- One failing test at a time

📊 Your Project Settings:
- Coverage minimum: 80%
- Test-first: required
- Excluded: ["**/types.ts"]

📚 Full Guide: ~/.claude/aichaku/docs/docs/standards/tdd.md
🔗 Online: https://aichaku.dev/docs/standards/tdd
💡 Quick Ref: aichaku standards --show tdd --format=quick
```

#### Fixed Remove Command

```bash
$ aichaku standards --remove tdd,dora

🗑️  Removing standards...
✅ Removed 'tdd' from development standards
✅ Removed 'dora' from documentation standards
📝 Updated: .claude/aichaku/aichaku.json
💡 Run 'aichaku integrate' to update CLAUDE.md

Current standards:
• Development: [15-factor, owasp-web]
• Documentation: [diataxis]
```

### Implementation Benefits

1. **95% Reduction in CLAUDE.md Size**: From 4700+ to ~200 lines
2. **No More Token Limit Errors**: Fits well within Claude Code's limits
3. **Better AI Comprehension**: Structured YAML parsed more reliably than prose
4. **Developer Education**: `--show` command provides learning path
5. **Tool Integration**: MCP can validate against YAML rules

### How It Works with Claude Code

1. **Compact References**: CLAUDE.md contains only critical rules in YAML
2. **MCP Validation**: Your MCP tool checks code against full YAML rules
3. **Targeted Injection**: MCP injects specific violations/suggestions into
   context
4. **Human Learning**: Developers use `--show` to understand standards deeply

This approach provides the benefits of configuration-as-code while working
within Claude Code's limitations.

## Success Metrics

- Users report feeling confident about MCP server update status
- Reduced confusion about whether MCP servers need manual updating
- Zero increase in upgrade failure rates
- Upgrade time remains under 10 seconds for typical installations
- HTTP server restart step is clearly documented and prompted
- Projects have single, understandable configuration file
- Cleanup command detects and fixes all legacy structures
- Upgrade process handles all metadata migrations automatically

## Immediate README Fix Needed

The current upgrade documentation is missing the HTTP server restart step. This
should be added immediately:

**Current README section (lines 181-196) should include:**

```bash
# Step 5: Restart HTTP server (if running MCP HTTP bridge)
aichaku mcp --server-status  # Check if server is running
aichaku mcp --stop-server    # Stop old version
aichaku mcp --start-server   # Start updated version
```

This ensures users don't continue running the old HTTP server version after
upgrading everything else.
