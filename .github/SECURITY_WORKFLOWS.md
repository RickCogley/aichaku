# GitHub Actions Security Workflows

This document explains the security and publishing workflows configured for Aichaku.

## Workflows Overview

### 1. **publish.yml** - JSR Publishing
- **Triggers**: Version tags (v*) and manual dispatch
- **Purpose**: Publish releases to JSR registry
- **Features**:
  - Multi-version testing (Deno 2.4.x and 2.x)
  - Runtime compatibility testing (Node.js 18/20/22, Bun)
  - Provenance attestation for supply chain security
  - Documentation generation

### 2. **security.yml** - Comprehensive Security Testing
- **Triggers**: Push, PR, daily schedule (2 AM UTC)
- **Purpose**: Run security-focused tests
- **Features**:
  - Format and lint checks
  - Type checking
  - Coverage reporting (Codecov)
  - Hardcoded secrets detection
  - Dangerous pattern detection
  - Path traversal vulnerability checks
  - Security audit reports

### 3. **codeql.yml** - Static Code Analysis
- **Triggers**: Push, PR, weekly (Monday 3 AM UTC)
- **Purpose**: Deep code analysis for vulnerabilities
- **Features**:
  - JavaScript/TypeScript analysis
  - Extended security queries
  - SARIF format results
  - GitHub Security tab integration

### 4. **devskim.yml** - Microsoft DevSkim Scanner
- **Triggers**: Push, PR, weekly (Tuesday 4:30 AM UTC)
- **Purpose**: Additional security pattern detection
- **Features**:
  - Cross-language security scanning
  - SARIF format results
  - Complements CodeQL analysis

### 5. **dependency-review.yml** - Supply Chain Security
- **Triggers**: Pull requests only
- **Purpose**: Check for vulnerable dependencies
- **Features**:
  - Fails on moderate+ severity vulnerabilities
  - Checks both runtime and dev dependencies
  - Comments results on PRs

## Security Considerations

### Why These Workflows?

1. **Defense in Depth**: Multiple scanners catch different issues
2. **Early Detection**: Run on every push/PR
3. **Continuous Monitoring**: Daily/weekly scheduled scans
4. **Supply Chain Security**: Dependency and provenance checks
5. **Compliance**: Demonstrates security commitment

### Aichaku-Specific Adaptations

Unlike Salty (cryptographic tool) or Nagare (release tool), Aichaku focuses on:
- **Path Security**: File system operations safety
- **Input Validation**: Preventing injection in generated files
- **No Network Operations**: Reduced attack surface
- **Documentation Security**: Safe template generation

### Security Testing Priorities

1. **Path Traversal**: Critical for file operations
2. **Input Sanitization**: Prevent injection in outputs
3. **No Secrets**: Ensure examples use placeholders
4. **Type Safety**: Prevent runtime errors

## Maintenance

- Review workflows quarterly
- Update scanner versions via Dependabot
- Monitor security alerts in GitHub Security tab
- Adjust schedules based on project activity

## Future Enhancements

- [ ] Add SAST tools when Deno support improves
- [ ] Implement security scorecards
- [ ] Add license compliance checking
- [ ] Create security dashboard