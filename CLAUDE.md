# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
the Aichaku methodology library.

## Security & Compliance Standards

Following the security-first approach established in
[Salty](https://github.com/eSolia/salty.esolia.pro) and
[Nagare](https://github.com/rick-cogley/nagare), Aichaku maintains strict
security standards adapted for a methodology support library.

### OWASP Top 10 Compliance for Methodology Libraries

While Aichaku doesn't handle cryptographic operations or release management,
security principles still apply:

#### A01 - Broken Access Control ✅

- **File System Safety**: Validate all paths for output generation
- **Directory Traversal Prevention**: Use absolute paths with validation
- **Principle of Least Privilege**: Only write to designated output directories

#### A02 - Cryptographic Failures ✅

- **No Secrets in Code**: Never store API keys or tokens in methodology files
- **Secure Examples**: When providing examples, use placeholder values
- **Environment Variables**: Document secure practices in templates

#### A03 - Injection ✅

- **Template Safety**: Sanitize all user inputs in generated documents
- **Command Injection Prevention**: Never execute user-provided commands
- **Path Sanitization**: Validate file names and paths rigorously

#### A04 - Insecure Design ✅

- **Separation of Concerns**: Methodologies separate from implementation
- **Fail-Safe Defaults**: Conservative file permissions on generated output
- **Minimal Attack Surface**: No network operations, no external dependencies

#### A05 - Security Misconfiguration ✅

- **Secure Defaults**: Generated files with appropriate permissions
- **Error Handling**: No sensitive information in error messages
- **Documentation**: Clear security guidelines in all templates

#### A06 - Vulnerable Components ✅

- **Zero Dependencies**: Pure Deno implementation
- **No npm Packages**: Reduced supply chain risks
- **Version Pinning**: Lock Deno standard library versions

#### A07 - Authentication Failures ✅

- **No Authentication Required**: Design eliminates auth vulnerabilities
- **Stateless Operation**: No session management needed
- **Local-Only**: No network authentication risks

#### A08 - Software/Data Integrity ✅

- **Version Tracking**: Clear version information in generated files
- **No Auto-Updates**: Static installation prevents injection
- **Checksum Validation**: Verify file integrity when needed

#### A09 - Logging/Monitoring ✅

- **Activity Tracking**: Log methodology usage without sensitive data
- **No Personal Information**: Never log user details or project specifics
- **Audit Trail**: Clear history in output directories

#### A10 - SSRF ✅

- **No Network Operations**: Completely offline operation
- **No External Resources**: All templates bundled
- **No URL Processing**: Eliminates SSRF risks entirely

### Security Principles as Rules

Following Salty's security-first approach:

1. **Never Trust User Input**: Validate all paths, names, and content
2. **Fail Securely**: Invalid operations should fail safely with clear messages
3. **Minimize Privileges**: Only request necessary file system permissions
4. **Defense in Depth**: Multiple validation layers for file operations
5. **Secure by Default**: Conservative settings out of the box
6. **No Sensitive Data**: Never store or log personal/project information

## Initial Setup

### Development Setup

```bash
# Clone repository
git clone https://github.com/RickCogley/aichaku.git
cd aichaku

# IMPORTANT: Setup git hooks for automatic formatting
git config core.hooksPath .githooks
```

This ensures all commits are properly formatted, preventing CI failures.

### Installation

```bash
# Install globally from JSR
deno install -A -n aichaku jsr:@aichaku/aichaku

# Or add to import map
{
  "imports": {
    "@aichaku/aichaku": "jsr:@aichaku/aichaku@^1.0.0"
  }
}
```

### Directory Structure

```
.claude/
├── methodologies/      # Core methodology files (from Aichaku)
├── output/            # Your generated documents
│   ├── active-*/      # Current projects
│   └── done-*/        # Completed projects
├── commands.json      # Quick access commands
└── scripts/           # Helper scripts (PDF generation, etc.)
```

## Development Commands

### Core Tasks

```bash
# Development
deno task dev           # Run with watch mode
deno task test          # Run all tests
deno task test:watch    # Run tests in watch mode

# Code Quality
deno task fmt           # Format code
deno task lint          # Run linter
deno task check         # Type check all TypeScript files
deno task preflight     # Run all checks before commit

# Release Management (using Nagare)
deno task release:patch # Patch release (1.0.0 -> 1.0.1)
deno task release:minor # Minor release (1.0.0 -> 1.1.0)
deno task release:major # Major release (1.0.0 -> 2.0.0)
```

### Non-Interactive Releases

Always use `--skip-confirmation` for automation:

```bash
deno task release:patch -- --skip-confirmation
deno task release:minor -- --skip-confirmation
deno task release:major -- --skip-confirmation
```

## Architecture Overview

### Core Design Principles

1. **Simplicity First**: 3 modes instead of complex personas
2. **Natural Language**: Detection based on user intent
3. **Methodology Agnostic**: Support multiple approaches equally
4. **Zero Configuration**: Works out of the box
5. **Security by Design**: Safe file operations only

### Mode System

```
User Input → Context Detection → Mode Selection → Methodology Rules → Output
```

- **PLANNING MODE**: When starting something new
- **EXECUTION MODE**: When actively working
- **IMPROVEMENT MODE**: When reflecting and optimizing

### File Organization

Following Nagare's convention:

- **Root Directory**: Entry points and configuration
  - `cli.ts` - Command line interface
  - `mod.ts` - Library exports
  - `deno.json` - Configuration
  - `version.ts` - Auto-generated by Nagare

- **/methodologies**: Core methodology rules
  - `/core` - Universal mode definitions
  - `/[methodology]` - Specific methodology rules

- **/scripts**: Development tools (not distributed)
  - Helper utilities
  - Build scripts

## Programming Paradigm

Following the hybrid approach established in Salty and Nagare:

### Functional Core

- Pure functions for rule processing
- Immutable methodology definitions
- Predictable transformations

### Object-Oriented Shell

- CLI handling with classes
- File operations encapsulation
- Clear interfaces

### TypeScript Requirements

- **NO `any` types**: Full type safety required
- **Strict mode**: All strict checks enabled
- **Explicit types**: No implicit any
- **Type imports**: Use proper imports from types.ts

## Critical Development Notes

1. **Security First**: Every file operation must be validated
2. **Path Safety**: Always use absolute paths with validation
3. **Error Messages**: Generic messages, no path disclosure
4. **No Network**: This library should never make network requests
5. **Testing**: Security tests for all file operations
6. **Documentation**: Update README.md after changes
7. **Attribution**: Don't add "Generated with Claude Code" to commits
8. **Conventional Commits**: Use clear, descriptive commit messages with InfoSec
   notes when applicable:
   ```
   feat: add path validation to output generation

   InfoSec: Prevents directory traversal attacks in file generation
   ```

## Methodology-Specific Guidelines

### Shape Up Support

- 6-week cycles with betting
- Shaping before building
- Fixed time, variable scope

### Scrum Support

- Sprint-based planning
- Standard ceremonies
- Velocity tracking

### Kanban Support

- Continuous flow
- WIP limits
- Visual board generation

### Lean Support

- MVP focus
- Build-measure-learn
- Hypothesis testing

### XP Support

- TDD templates
- Pair programming logs
- Continuous integration

## Security Testing

Run security-focused tests:

```bash
# Test path validation
deno test --allow-read --allow-write tests/security/

# Test input sanitization
deno test tests/validation/

# Full security suite
deno task test:security
```

## Common Issues and Solutions

### Issue: Output directory not created

**Solution**: Aichaku creates directories as needed, ensure write permissions

### Issue: Methodology not detected

**Solution**: Use clear keywords like "sprint", "cycle", "kanban board"

### Issue: PDF generation fails

**Solution**: Ensure pandoc is installed: `brew install pandoc`

## InfoSec Considerations

When modifying Aichaku:

1. **File Operations**: Validate all paths against traversal attacks
2. **Template Processing**: Sanitize user inputs in templates
3. **Error Handling**: Never expose system paths in errors
4. **Generated Content**: Set appropriate file permissions
5. **Documentation**: No sensitive examples in docs

## Contribution Guidelines

1. Read this CLAUDE.md thoroughly
2. Follow security principles from Salty's SECURITY.md
3. Use Nagare's commit conventions
4. Add tests for security-relevant changes
5. Update documentation accordingly

---

**References**:

- [Salty CLAUDE.md](https://github.com/eSolia/salty.esolia.pro/blob/main/CLAUDE.md)
- [Salty SECURITY.md](https://github.com/eSolia/salty.esolia.pro/blob/main/SECURITY.md)
- [Nagare CLAUDE.md](https://github.com/rick-cogley/nagare/blob/main/CLAUDE.md)

**Security Contact**: Report issues via GitHub Issues with [SECURITY] tag
