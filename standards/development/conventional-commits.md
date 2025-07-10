## Conventional Commits

### Quick Reference

Conventional Commits provide a standardized format for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Examples:**

- `feat: add user authentication`
- `fix(auth): resolve login validation issue`
- `docs: update installation guide`
- `refactor!: restructure database schema`

### Commit Types

#### Primary Types

- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes or bug fixes
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

#### Additional Types

- **perf**: Performance improvements
- **ci**: CI/CD configuration changes
- **build**: Build system or dependency changes
- **revert**: Reverting a previous commit

### Examples by Type

#### Feature Commits

```bash
# ✅ Good: Clear feature addition
feat: add password reset functionality

# ✅ Good: Feature with scope
feat(auth): implement two-factor authentication

# ✅ Good: Breaking change
feat!: change API response format

BREAKING CHANGE: API now returns data in 'result' field instead of root level
```

#### Bug Fix Commits

```bash
# ✅ Good: Clear bug fix
fix: resolve memory leak in file upload

# ✅ Good: Fix with scope and issue reference
fix(payment): handle timeout errors properly

Closes #123

# ✅ Good: Critical security fix
fix: prevent SQL injection in user search

InfoSec: Sanitize user input to prevent database attacks
```

#### Documentation Commits

```bash
# ✅ Good: Documentation updates
docs: add API authentication examples

# ✅ Good: README updates
docs(readme): update installation instructions for Windows

# ✅ Good: Code documentation
docs: add JSDoc comments to utility functions
```

#### Refactoring Commits

```bash
# ✅ Good: Code restructuring
refactor: extract user validation logic into separate module

# ✅ Good: Performance refactoring
refactor(database): optimize query performance

# ✅ Good: Breaking refactoring
refactor!: rename getUserData to fetchUserProfile

BREAKING CHANGE: Method name changed from getUserData to fetchUserProfile
```

### Scope Guidelines

#### Common Scopes

- **Component names**: `feat(header): add navigation menu`
- **Feature areas**: `fix(auth): resolve login issues`
- **File/Module names**: `refactor(utils): simplify date formatting`
- **Technology**: `ci(docker): update base image`

#### Scope Examples

```bash
# Frontend scopes
feat(header): add user avatar dropdown
fix(form): validate email format correctly
style(button): update hover states

# Backend scopes
feat(api): add user endpoints
fix(database): resolve connection pooling
perf(cache): implement Redis caching

# Infrastructure scopes
ci(github): add automated testing workflow
build(webpack): update configuration for production
chore(deps): update dependencies to latest versions
```

### Breaking Changes

#### Indicating Breaking Changes

```bash
# Method 1: Exclamation mark
feat!: change user API response format

# Method 2: BREAKING CHANGE footer
feat: update user authentication

BREAKING CHANGE: Authentication now requires API key in header
```

#### Breaking Change Examples

```bash
# ✅ Good: API change
feat!: change REST API response structure

BREAKING CHANGE: All API responses now wrapped in 'data' object

# ✅ Good: Configuration change
config!: update environment variable names

BREAKING CHANGE: 
- DATABASE_URL renamed to DB_CONNECTION_STRING
- API_KEY renamed to SERVICE_API_KEY

# ✅ Good: Library update
deps!: upgrade React to version 18

BREAKING CHANGE: React 18 requires Node.js 16 or higher
```

### Body and Footer Guidelines

#### Commit Body

```bash
feat: add user notification preferences

Allow users to customize which notifications they receive
via email, SMS, or push notifications. Preferences are
stored in user profile and can be updated through the
settings page.

# Multiple paragraphs for complex changes
refactor: restructure authentication system

Extract authentication logic into separate service layer
to improve testability and maintainability.

This change affects all authentication-related components
and requires updating import statements in affected files.
```

#### Footer Examples

```bash
# Issue references
fix: resolve login timeout issue

Closes #456
Fixes #123, #789

# Reviewer credits
feat: add dark mode theme

Co-authored-by: Jane Smith <jane@example.com>
Reviewed-by: John Doe <john@example.com>

# Security notes
fix: patch XSS vulnerability in comments

InfoSec: Sanitize HTML input to prevent script injection attacks
CVE-2023-12345
```

### Integration with Tools

#### Semantic Release

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/github"
    ]
  }
}
```

#### Version Bumping Rules

- **fix**: Patch version (1.0.0 → 1.0.1)
- **feat**: Minor version (1.0.0 → 1.1.0)
- **BREAKING CHANGE**: Major version (1.0.0 → 2.0.0)

#### Changelog Generation

```markdown
# Changelog

## [2.1.0] - 2023-07-10

### Features

- **auth**: implement two-factor authentication (#123)
- **dashboard**: add user analytics widget (#124)

### Bug Fixes

- **payment**: handle timeout errors properly (#125)
- resolve memory leak in file upload (#126)

### BREAKING CHANGES

- **api**: change response format for user endpoints
```

### Git Hooks Integration

#### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/prepare-commit-msg

# Check if commit message follows conventional format
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Commit message must follow Conventional Commits format"
    echo "Examples:"
    echo "  feat: add new feature"
    echo "  fix(auth): resolve login issue"
    echo "  docs: update README"
    exit 1
fi
```

#### Commitizen Integration

```bash
# Install commitizen
npm install -g commitizen cz-conventional-changelog

# Configure
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# Use interactive commit
git cz
```

### Team Guidelines

#### Commit Message Length

- **Subject line**: 50 characters or less
- **Body lines**: 72 characters or less
- **Clear and concise**: Focus on what and why, not how

#### Language Standards

- **Use imperative mood**: "Add feature" not "Added feature"
- **No trailing punctuation**: Don't end subject with period
- **Capitalize first letter**: "Add feature" not "add feature"

#### Review Checklist

```markdown
## Commit Message Review

- [ ] Follows conventional format
- [ ] Type is appropriate (feat, fix, docs, etc.)
- [ ] Scope is relevant and consistent
- [ ] Description is clear and concise
- [ ] Breaking changes are properly indicated
- [ ] Issue references are included
- [ ] Security implications are noted
```

### Advanced Features

#### Multi-line Subjects for Complex Changes

```bash
feat: implement user authentication system

- Add login/logout functionality
- Implement JWT token management  
- Add password reset flow
- Include email verification

Closes #100, #101, #102
```

#### Revert Commits

```bash
revert: "feat: add user preferences"

This reverts commit abc123def456.

Reason: Feature causing performance issues in production
```

#### Merge Commits

```bash
# Squash and merge with conventional format
feat: complete user management feature (#123)

* feat(users): add user creation
* feat(users): add user editing  
* feat(users): add user deletion
* test(users): add comprehensive test suite
```

### Benefits

1. **Automated Versioning**: Tools can automatically determine version bumps
2. **Changelog Generation**: Automatically generate release notes
3. **Better Collaboration**: Consistent format improves team communication
4. **Issue Tracking**: Easy to link commits to issues and pull requests
5. **Release Automation**: Enable automated releases based on commit types

### Common Mistakes

#### Vague Descriptions

```bash
# ❌ Bad: Too vague
fix: bug fix
feat: new feature
docs: update docs

# ✅ Good: Specific and clear
fix: resolve null pointer exception in user search
feat: add real-time notifications for new messages
docs: add authentication examples to API guide
```

#### Wrong Types

```bash
# ❌ Bad: Wrong type usage
feat: fix typo in README
fix: add new user registration form

# ✅ Good: Correct type usage
docs: fix typo in README
feat: add new user registration form
```

Remember: Conventional Commits create a shared language for your team and enable
powerful automation tools that can streamline your development workflow.
