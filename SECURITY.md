# Security Policy & Compliance

## 🛡️ Security Overview

Aichaku is designed with security as a fundamental principle. While it doesn't
handle cryptographic operations like Salty or release management like Nagare, it
maintains strict security standards for file operations, path validation, and
user input handling. This document outlines our security measures, compliance
status, and responsible disclosure process.

## ✅ OWASP Top 10 Compliance

Aichaku has been assessed against the OWASP Top 10 (2021) security risks,
adapted for a methodology support library context:

### A01: Broken Access Control ✅

- **Path Validation**: Strict validation of all file paths and output
  directories
- **Directory Traversal Protection**: Prevents `../` and absolute path exploits
- **Write Restrictions**: Only writes to designated `.claude/output/`
  directories
- **Read Limitations**: Only reads from bundled methodology files

### A02: Cryptographic Failures ✅

- **No Secrets Storage**: Never stores API keys, tokens, or credentials
- **Secure Examples**: All examples use placeholder values
- **Documentation**: Promotes secure practices in generated templates
- **Environment Variables**: Encourages proper secret management

### A03: Injection ✅

- **Path Sanitization**: All file paths validated and sanitized
- **Template Safety**: No dynamic code execution in templates
- **Command Prevention**: Never executes shell commands from user input
- **Markdown Escaping**: Proper escaping in generated documentation

### A04: Insecure Design ✅

- **Minimal Attack Surface**: No network operations, no database
- **Separation of Concerns**: Methodologies isolated from implementation
- **Fail-Safe Defaults**: Conservative file permissions (0644)
- **Stateless Design**: No persistent state or sessions

### A05: Security Misconfiguration ✅

- **Secure Defaults**: Safe configuration out of the box
- **Error Handling**: Generic error messages without system details
- **No Debug Info**: No stack traces or paths in production
- **Clear Documentation**: Security guidelines in all templates

### A06: Vulnerable and Outdated Components ✅

- **Zero Dependencies**: Pure Deno implementation
- **No npm Packages**: Eliminates supply chain risks
- **Deno Runtime**: Secure-by-default permissions model
- **Version Pinning**: Locked Deno standard library versions

### A07: Identification and Authentication Failures ✅

- **No Authentication**: Design eliminates auth vulnerabilities
- **Local-Only Operation**: No network authentication needed
- **No User Management**: No accounts or sessions to compromise
- **Stateless Architecture**: No session hijacking risks

### A08: Software and Data Integrity Failures ✅

- **Version Tracking**: Clear version info via Nagare
- **No Auto-Updates**: Static installation prevents tampering
- **File Integrity**: Generated files include metadata
- **Reproducible Output**: Same input produces same output

### A09: Security Logging and Monitoring Failures ✅

- **Activity Logging**: Tracks methodology usage patterns
- **No Sensitive Data**: Never logs personal or project details
- **Audit Trail**: Clear history in output directory structure
- **Error Tracking**: Logs failures without exposing details

### A10: Server-Side Request Forgery (SSRF) ✅

- **No Network Operations**: Completely offline functionality
- **No External Resources**: All templates bundled
- **No URL Processing**: Eliminates SSRF entirely
- **Local File System Only**: No remote file access

## 🔐 Security Features

### Safe File Operations

All file operations are protected by multiple validation layers:

1. **Path Validation**: Reject suspicious patterns
2. **Directory Constraints**: Only write to allowed directories
3. **Name Sanitization**: Safe file naming conventions
4. **Permission Control**: Conservative file permissions

### Input Validation

- File name validation (alphanumeric + safe characters)
- Path traversal prevention
- Size limits on generated content
- Template variable sanitization

### Error Handling

- Generic error messages for users
- Detailed logging for developers (without sensitive data)
- Graceful failure modes
- No system information disclosure

## 🔍 Security Testing

### Test Suite

```bash
# Run security-focused tests
deno task test:security

# Test path validation
deno test tests/security/path-validation_test.ts

# Test input sanitization
deno test tests/security/input-sanitization_test.ts

# Full test suite with coverage
deno task test:coverage
```

### Manual Security Testing

1. **Path Traversal Testing**:

   ```bash
   # Attempt directory traversal
   aichaku generate "../../../etc/passwd"
   # Expected: Error - Invalid path
   ```

2. **Input Validation Testing**:

   ```bash
   # Test with special characters
   aichaku create "project'; rm -rf /"
   # Expected: Sanitized to "project-rm-rf"
   ```

3. **File Permission Testing**:
   ```bash
   # Check generated file permissions
   ls -la .claude/output/
   # Expected: -rw-r--r-- (0644)
   ```

## 🐛 Responsible Disclosure

We appreciate responsible disclosure of security vulnerabilities.

### Reporting Process

1. **Create Issue**: Use GitHub Issues with [SECURITY] tag
2. **Email**: security@aichaku.dev (if available)
3. **Include**:
   - Detailed description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested remediation (if any)

### Our Commitment

- Acknowledge receipt within 48 hours
- Provide updates on remediation progress
- Credit researchers (if desired) in release notes
- No legal action against good-faith researchers

### Out of Scope

- Denial of Service attacks on local file system
- Social engineering
- Physical access attacks
- Issues requiring root/admin privileges

## 📊 Security Metrics

Aichaku tracks:

- Failed path validation attempts
- Invalid input patterns
- File operation errors
- Unusual usage patterns

## 🏆 Compliance & Standards

- **OWASP Top 10 (2021)**: Adapted for local tools
- **File System Security**: Best practices for path handling
- **Input Validation**: Industry standard sanitization
- **Error Handling**: Security-conscious messaging

## 📝 Security Changelog

### Version 1.0.0 (2025-01-05)

**Initial Security Implementation**:

- Path traversal protection with comprehensive validation
- Input sanitization for file names and content
- Secure file permissions (0644) for all generated files
- Error messages that don't expose system information
- Zero network operations by design
- No dependency vulnerabilities (zero dependencies)
- Comprehensive security test suite
- Documentation emphasizing security practices

**InfoSec**: Establishes security-first foundation for methodology support

### Security Principles Applied

Following security principles from
[Salty](https://github.com/eSolia/salty.esolia.pro/blob/main/SECURITY.md):

1. **Never Trust User Input**: All paths and names validated
2. **Fail Securely**: Safe defaults and graceful failures
3. **Minimize Privileges**: Only necessary file permissions
4. **Defense in Depth**: Multiple validation layers
5. **Secure by Default**: No configuration needed for safety
6. **No Sensitive Data**: Never store personal information

---

**Last Security Review**: 2025-01-05\
**Next Scheduled Review**: 2025-04-05\
**Security Contact**:
[Create Issue](https://github.com/YOUR_ORG/aichaku/issues/new?labels=security)
