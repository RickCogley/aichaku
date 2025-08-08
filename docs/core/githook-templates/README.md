# Git Hook Templates

This directory contains the git hook templates that are installed by the `aichaku githooks` command.

## Structure

```
githook-templates/
├── pre-commit         # Main orchestrator script
├── lib/
│   └── common.sh      # Shared functions for all hooks
└── hooks.d/           # Individual hook scripts (numbered for order)
    ├── 01-check-branch
    ├── 02-format-deno
    ├── 03-check-conventional-commits
    ├── 05-type-check
    ├── 06-no-any
    ├── 10-detect-todos
    ├── 15-lint-typescript
    ├── 20-lint-markdown
    ├── 25-security-check
    ├── 30-run-tests
    └── 40-owasp-scan
```

## Hook Categories

### Formatting (01-02)

- **01-check-branch**: Prevent commits to protected branches
- **02-format-deno**: Auto-format code with deno fmt

### Quality Checks (03-06)

- **03-check-conventional-commits**: Enforce conventional commit format
- **05-type-check**: TypeScript type checking (excludes test files)
- **06-no-any**: Prevent 'any' types (excludes test files)

### Linting (10-20)

- **10-detect-todos**: Find TODO/FIXME comments
- **15-lint-TypeScript**: Deno linter (excludes test files)
- **20-lint-Markdown**: Markdown linting with markdownlint-cli2

### Security (25, 40)

- **25-security-check**: MCP-based security review
- **40-owasp-scan**: OWASP pattern detection

### Testing (30)

- **30-run-tests**: Run test suite (**DISABLED BY DEFAULT** - see note below)

## Installation

These templates are automatically copied when you run:

```bash
aichaku githooks --install
```

They are installed to `.aichaku-githooks/` in your project to avoid conflicts with existing git hooks.

## Customization

After installation, hooks can be:

- **Enabled**: `chmod +x .aichaku-githooks/hooks.d/HOOK_NAME`
- **Disabled**: `chmod -x .aichaku-githooks/hooks.d/HOOK_NAME`

Or use the CLI:

- **Enable all**: `aichaku githooks --enable-all`
- **Disable specific**: `aichaku githooks --disable 30-run-tests`

## Important: Test Hook is Disabled by Default

The **30-run-tests** hook is intentionally disabled when installed. This is because:

- Test suites often have environment-specific issues
- Flaky tests can block legitimate releases
- Test failures during pre-commit can be frustrating when iterating quickly
- Different repos have different test stability levels

**To enable tests if your suite is stable:**

```bash
aichaku githooks --enable 30-run-tests
```

## Test File Exclusions

The following hooks exclude test files from strict checking:

- **05-type-check**: Skips `*_test.ts`, `*.test.ts`, `tests/`
- **06-no-any**: Skips test files where 'any' is often needed for mocks
- **15-lint-TypeScript**: Excludes test files from strict linting

This allows more flexibility in test code while maintaining strict standards in production code.

## Platform Support

All hooks are POSIX-compliant shell scripts that work on:

- macOS
- Linux
- Windows (Git Bash/WSL)

The hooks automatically detect the project type (Deno, Node.js, Rust, etc.) and use appropriate tools.
