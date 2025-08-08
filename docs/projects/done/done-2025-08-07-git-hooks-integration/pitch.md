# Git Hooks Integration for Aichaku

## Problem

Currently, high-quality git hooks for TypeScript/Deno projects are maintained separately in dotfiles and manually copied
to each repository. This creates:

- Inconsistent code quality enforcement across projects
- Manual maintenance burden
- Lost opportunity to provide comprehensive methodology support
- Duplication of effort across teams

## Appetite

Small batch - 2-3 days of work. This is infrastructure that enhances aichaku's value proposition significantly.

## Solution

### Core Concept

Include battle-tested git hooks as part of aichaku's installation, making them available alongside methodologies,
standards, and agents. These hooks enforce code quality at commit time, preventing issues from entering the codebase.

### What We Ship

1. **Git Hooks Library** in `~/.claude/aichaku/githooks/`
   ```
   ~/.claude/aichaku/
   ├── githooks/
   │   ├── hooks.d/
   │   │   ├── 05-type-check
   │   │   ├── 06-no-any
   │   │   ├── 07-docs-check
   │   │   ├── 10-format-code
   │   │   ├── 15-lint-typescript
   │   │   ├── 20-lint-markdown
   │   │   ├── 30-run-tests
   │   │   └── 40-security-check
   │   └── pre-commit (orchestrator)
   ```

2. **New Command**: `aichaku githooks`
   ```bash
   aichaku githooks --install     # Install git hooks to current project
   aichaku githooks --list        # List available git hooks
   aichaku githooks --show        # Show current configuration
   aichaku githooks --enable all  # Enable ALL hooks (recommended)
   aichaku githooks --enable 05,10,30  # Enable specific hooks
   aichaku githooks --disable 40  # Disable specific hooks
   aichaku githooks --preset minimal   # Format + tests only
   aichaku githooks --preset standard  # All except security
   aichaku githooks --preset strict    # Everything enabled
   ```

3. **Safe Installation Strategy**
   - **Always** install to `.aichaku-githooks/` by default
   - Detect existing `core.hooksPath` setting
   - Never automatically change git config if hooks exist
   - Provide clear instructions for activation
   - Check MCP dependencies for security hook
   - Respect existing workflows - inform, don't override

4. **Project Integration**
   - Add hooks configuration to `.claude/aichaku/aichaku.json`
   - Allow per-project hook customization
   - Support hook ordering and dependencies

### Implementation Strategy

```typescript
interface HooksConfig {
  enabled: boolean;
  path: ".githooks" | ".aichaku-hooks" | string;
  selected: string[]; // Hook IDs like "05-type-check"
  custom: Record<string, string>; // User's custom hooks
}
```

### Namespace Strategy

1. Check if `.githooks/` exists
2. If yes, offer options:
   - Merge with existing (backup first)
   - Use `.aichaku-githooks/` instead
   - Skip git hooks installation
3. Update git config appropriately

### Hook Categories & Presets

**Individual Hooks:**

- **Type Safety** (05-06): TypeScript validation
- **Quality** (07-15): Documentation and linting
- **Formatting** (10, 20): Code and Markdown formatting
- **Testing** (30): Test execution
- **Security** (40): Security scanning (requires MCP server)

**Presets for Quick Setup:**

- **minimal**: Just formatting (10, 20) + tests (30)
- **standard**: Everything except security (05-30) - _Recommended_
- **strict**: All hooks enabled (05-40) - _Requires MCP setup_
- **custom**: User-defined combination

## Rabbit Holes

### NOT Doing

- Complex hook dependency management
- Cross-platform shell compatibility (use Deno where possible)
- Hook versioning system
- Remote hook updates
- Hook marketplace/registry

### Constraints

- Hooks must work with both Deno and Node projects
- Must not break existing git workflows
- Keep hooks simple and fast
- Clear error messages

## No-Gos

- Don't force hooks on users
- Don't modify `.git/` directory directly
- Don't override existing hooks without backup
- Don't require network access for hooks to work

## Nice-to-Haves

If time permits:

- Hook performance metrics
- Skip hooks with `--no-verify` detection
- Integration with CI/CD templates
- Project-specific hook templates
- Language-specific hook sets (Deno, Node, Python)

## Integration Points

### With Existing Aichaku Features

- `aichaku init`: Optionally install hooks
- `aichaku integrate`: Add hooks config to CLAUDE.md
- `aichaku upgrade`: Update hooks to latest versions

### With Standards

- TDD standard → prioritize test hooks
- Security standards → enable security scanning
- Code style standards → formatting hooks

## Success Criteria

1. Zero-friction installation of hooks
2. No disruption to existing git workflows
3. Clear value demonstration (caught errors)
4. Easy customization per project
5. Works on fresh projects and existing ones

## Risks & Mitigations

| Risk                          | Mitigation                         |
| ----------------------------- | ---------------------------------- |
| Conflicts with existing hooks | Namespace option & backup strategy |
| Performance impact            | Parallel execution & skip options  |
| Platform differences          | Deno-based hooks where possible    |
| User resistance               | Make it optional, show clear value |

## Example User Flow

```bash
# New project - Interactive setup
$ aichaku init --project
🪴 Initializing project configuration...
📝 Would you like to install git hooks? (Y/n) Y
🔍 No existing hooks found
Choose a preset:
1. minimal (formatting + tests)
2. standard (all except security) [recommended]
3. strict (everything)
4. custom (choose individually)
> 2
✅ Installed git hooks to .aichaku-githooks/ with 'standard' preset

To activate the hooks:
  cd /path/to/your/project
  git config core.hooksPath .aichaku-githooks

# Quick setup for CI/CD or automation
$ aichaku githooks --install --preset strict --yes
⚠️  Security hook (40) requires MCP server setup
   Run 'aichaku mcp --install' to set up the security reviewer
✅ Installed all git hooks to .githooks/

# Existing project with hooks
$ aichaku githooks --install
⚠️  Found existing hooks in: .githooks/
✅ Installed aichaku hooks to: .aichaku-githooks/

Your options:
1. Use aichaku hooks:
   cd /path/to/your/project
   git config core.hooksPath .aichaku-githooks
   
2. Keep existing hooks:
   No action needed
   
3. Manually merge:
   Copy desired hooks from .aichaku-githooks/ to .githooks/

# Customize hooks - Quick setup
$ aichaku githooks --enable all
✅ Enabled all 8 hooks

# Or use a preset
$ aichaku githooks --preset standard
✅ Applied 'standard' preset (7 hooks, skipping security)

# Fine-tune specific hooks
$ aichaku githooks --enable 40
⚠️  Security hook requires MCP server and HTTP bridge
   Prerequisites:
   • MCP server: Run 'aichaku mcp --install'
   • HTTP bridge: Must be running for security scans
   • See: 'aichaku mcp --help' for setup instructions
Continue anyway? (y/N) y
✅ Enabled security-check hook

$ aichaku githooks --disable 40-security-check
✅ Disabled security-check hook
```

## Why This Matters

Git hooks are the first line of defense for code quality. By including them in aichaku:

1. We provide complete methodology support (not just documentation)
2. Teams get immediate quality enforcement
3. Reduces cognitive load - no separate hook management
4. Ensures consistency across all aichaku projects
5. Makes best practices automatic, not optional

This positions aichaku as a comprehensive development environment enhancer, not just a methodology installer.
