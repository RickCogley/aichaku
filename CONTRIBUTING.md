# Contributing to Aichaku

Thank you for your interest in contributing to Aichaku! This document provides
guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/aichaku.git
   cd aichaku
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Make your changes** following our guidelines below
5. **Test your changes** thoroughly
6. **Submit a pull request**

## 📝 Commit Message Guidelines

Aichaku follows [Conventional Commits](https://www.conventionalcommits.org/)
specification. This helps with automated changelog generation and semantic
versioning.

### Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Purpose                  | Example                                |
| ---------- | ------------------------ | -------------------------------------- |
| `feat`     | New features             | `feat: add Kanban methodology support` |
| `fix`      | Bug fixes                | `fix: resolve path validation error`   |
| `docs`     | Documentation changes    | `docs: update methodology templates`   |
| `style`    | Code style changes       | `style: fix linting issues`            |
| `refactor` | Code refactoring         | `refactor: simplify mode detection`    |
| `perf`     | Performance improvements | `perf: optimize file copying`          |
| `test`     | Adding/updating tests    | `test: add installer test suite`       |
| `build`    | Build system/tooling     | `build: add JSR publishing workflow`   |
| `ci`       | CI/CD changes            | `ci: add security scanning`            |
| `chore`    | Maintenance tasks        | `chore: update dependencies`           |
| `revert`   | Reverting changes        | `revert: undo breaking API change`     |
| `security` | Security fixes           | `security: validate file paths`        |

### Configuration Files

Configuration files require special attention to commit types:

#### Build System Configuration

```bash
# deno.json, tsconfig.json
git commit -m "build: configure Deno project settings

- Set up TypeScript compiler options with strict mode
- Add development and testing tasks
- Configure JSR publishing settings
- Enable documentation generation"
```

#### Feature Configuration

```bash
# nagare.config.ts, methodology files
git commit -m "feat: add XP methodology templates

- Create planning mode templates for user stories
- Add execution mode TDD workflow guides
- Include improvement mode refactoring checklists
- Configure AI command suggestions"
```

#### CI/CD Configuration

```bash
# .github/workflows/, security configs
git commit -m "ci: add automated testing and security scanning

- Configure GitHub Actions for PR testing
- Add CodeQL and DevSkim security analysis
- Set up JSR publishing on release tags"
```

### Scopes (Optional)

Use scopes to indicate which part of the codebase is affected:

```bash
feat(cli): add --dry-run flag for preview mode
fix(installer): handle symlink creation on Windows
docs(shape-up): update bet template examples
test(lister): add methodology detection tests
```

### Breaking Changes

For breaking changes, add `!` after the type or add `BREAKING CHANGE:` in the
footer:

```bash
feat!: redesign InstallOptions interface

BREAKING CHANGE: The projectPath option now requires absolute paths
```

### Examples of Good Commits

```bash
# Feature addition
feat: add Lean methodology support

- Implement MVP templates for planning mode
- Add hypothesis validation guides for execution
- Include pivot decision trees for improvement
- Support A/B testing documentation templates

# Bug fix
fix: resolve directory traversal vulnerability in path validation

- Update path validation to prevent ../ sequences
- Add absolute path requirement checks
- Include test cases for malicious paths
- Follow OWASP path validation guidelines

# Documentation
docs: add AI collaboration best practices

- Include mode detection examples
- Provide Claude Code integration tips
- Add methodology selection guide
- Update security considerations

# Security
security: implement strict path validation

InfoSec: Prevents directory traversal attacks in file operations
- Validate all user-provided paths
- Restrict operations to allowed directories
- Add comprehensive security tests
```

### Examples of Poor Commits

```bash
# Too vague
fix: bug fix

# Missing context
feat: add feature

# Wrong type
chore: add new methodology  # Should be feat:

# Missing description
build: deno.json  # Should describe what the config enables
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
deno task test

# Run tests in watch mode
deno task test:watch

# Run specific test file
deno test src/installer_test.ts
```

### Writing Tests

- **Unit tests** for individual functions
- **Integration tests** for installation workflows
- **Security tests** for path validation
- **Mock file system operations** when possible
- **Test both success and failure scenarios**
- **Use descriptive test names**

Example test structure:

```typescript
import { assertEquals, assertRejects } from "jsr:@std/assert";
import { install } from "../src/installer.ts";

Deno.test("installer - should reject directory traversal attempts", async () => {
  await assertRejects(
    async () => await install("../../../etc/passwd", { global: true }),
    Error,
    "Invalid path",
  );
});
```

## 🏗️ Code Style Guidelines

### TypeScript Style

- **Use TypeScript strict mode** - No implicit any
- **Prefer interfaces over types** for object shapes
- **Use const assertions** for immutable data: `as const`
- **Avoid `any`** - Use proper types or `unknown`
- **Export types** from `types.ts` for reusability

### File Organization

- **One main export per file** following single responsibility
- **Group related utilities** in the same file
- **Use barrel exports** in `mod.ts` for clean public API
- **Keep security validations** centralized

### Naming Conventions

#### File Names

```bash
# Use kebab-case with meaningful names
installer.ts       # Installation logic
lister.ts         # Listing methodologies
updater.ts        # Update functionality
types.ts          # Type definitions
```

#### Function Names

```typescript
// Use camelCase with verb-noun patterns
async function validatePath(path: string): Promise<void>;
function detectMethodology(content: string): string;
async function copyMethodologyFiles(from: string, to: string): Promise<void>;
```

### Error Handling

- **Use descriptive error messages** with context
- **Never expose system paths** in errors
- **Provide actionable suggestions** when possible
- **Fail fast with validation** - Check preconditions early

```typescript
// Good error handling
if (path.includes("..")) {
  throw new Error("Invalid path: Directory traversal attempts are not allowed");
}

// Security-conscious error
throw new Error("Installation failed: Invalid methodology name");
// Not: "Failed to read /home/user/.claude/methodologies/shape-up"
```

## 📋 Pull Request Guidelines

### Before Submitting

- ✅ **Run all tests** and ensure they pass
- ✅ **Run linting** with `deno task lint`
- ✅ **Format code** with `deno task fmt`
- ✅ **Update documentation** if needed
- ✅ **Add tests** for new functionality
- ✅ **Follow commit message guidelines**
- ✅ **Check security implications** of changes

### Pull Request Template

Use this template for your PR description:

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to
      not work as expected)
- [ ] Documentation update
- [ ] Security fix

## Testing

- [ ] New tests added for new functionality
- [ ] All existing tests pass
- [ ] Security tests added/updated if needed
- [ ] Manual testing completed

## Security Checklist

- [ ] No sensitive information in code or logs
- [ ] Path validation implemented for file operations
- [ ] No new external dependencies added
- [ ] Error messages don't expose system information

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
- [ ] No new warnings introduced
```

## 🐛 Reporting Issues

### Bug Reports

Include the following information:

- **Aichaku version** you're using
- **Deno version** (`deno --version`)
- **Operating system** and version
- **Claude Code version** (if applicable)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Error messages** (sanitized of paths)

### Feature Requests

- **Clear description** of the feature
- **Use case** - which methodology and mode?
- **AI collaboration benefits** - how does it help Claude Code?
- **Proposed solution** if you have ideas
- **Security considerations**

## 🔒 Security

If you discover a security vulnerability, please **do not** open a public issue.
Instead:

1. **Open a GitHub Issue** with `[SECURITY]` tag
2. **Provide detailed information** about the vulnerability
3. **Include proof of concept** if possible
4. **Allow time for a fix** before public disclosure

## 📄 License

By contributing to Aichaku, you agree that your contributions will be licensed
under the [MIT License](LICENSE).

## ❓ Questions

- **GitHub Discussions** - For general questions and methodology ideas
- **GitHub Issues** - For bug reports and feature requests
- **Documentation** - Check [README.md](./README.md) and
  [CLAUDE.md](./CLAUDE.md) first

Thank you for contributing to Aichaku! 🤖✨
