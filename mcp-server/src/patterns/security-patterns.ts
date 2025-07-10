/**
 * Security patterns for code review
 */

import type { SecurityPattern } from "../types.ts";

export class SecurityPatterns {
  static getPatterns(): SecurityPattern[] {
    return [
      // Command Injection
      {
        pattern: /bash\s+-c\s+['"][^'"]*\$[^{]/,
        severity: "critical",
        rule: "command-injection",
        message: "Potential command injection - use parameter expansion",
        suggestion:
          'Use bash parameter expansion: bash -c \'command "$1"\' -- "${VARIABLE}"',
        category: "security",
        owaspMapping: "A03",
      },
      {
        pattern: /exec\s*\([^)]*\$\{?[^}]*\}?\s*[^)]*\)/,
        severity: "critical",
        rule: "command-injection-exec",
        message: "Potential command injection in exec() call",
        suggestion: "Use array arguments or sanitize input",
        category: "security",
        owaspMapping: "A03",
      },

      // Path Traversal
      {
        pattern: /\.\.(?:\/|\\)/,
        severity: "high",
        rule: "path-traversal",
        message: "Potential path traversal vulnerability",
        suggestion: "Validate and normalize paths before use",
        category: "security",
        owaspMapping: "A01",
      },
      {
        pattern: /join\s*\([^)]*\.\.[^)]*\)/,
        severity: "high",
        rule: "path-traversal-join",
        message: "Path.join with '..' can lead to directory traversal",
        suggestion: "Validate path segments before joining",
        category: "security",
        owaspMapping: "A01",
      },

      // SQL Injection
      {
        pattern: /query\s*\([^)]*\+[^)]*\)/,
        severity: "critical",
        rule: "sql-injection-concat",
        message: "Potential SQL injection - string concatenation in query",
        suggestion: "Use parameterized queries",
        category: "security",
        owaspMapping: "A03",
      },
      {
        pattern: /query\s*\([^)]*\$\{[^}]*\}[^)]*\)/,
        severity: "critical",
        rule: "sql-injection-template",
        message: "Potential SQL injection - template literal in query",
        suggestion: "Use parameterized queries or prepared statements",
        category: "security",
        owaspMapping: "A03",
      },

      // Sensitive Data Exposure
      {
        pattern: /password\s*[:=]\s*["'][^"']+["']/i,
        severity: "critical",
        rule: "hardcoded-password",
        message: "Hardcoded password detected",
        suggestion: "Use environment variables or secure credential storage",
        category: "security",
        owaspMapping: "A02",
      },
      {
        pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
        severity: "critical",
        rule: "hardcoded-api-key",
        message: "Hardcoded API key detected",
        suggestion: "Use environment variables for API keys",
        category: "security",
        owaspMapping: "A02",
      },
      {
        pattern: /token\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']/,
        severity: "critical",
        rule: "hardcoded-token",
        message: "Hardcoded token detected",
        suggestion: "Use environment variables for tokens",
        category: "security",
        owaspMapping: "A02",
      },

      // Unsafe Deserialization
      {
        pattern: /JSON\.parse\s*\([^)]*\)\s*as\s+\w+/,
        severity: "medium",
        rule: "unsafe-type-assertion",
        message: "Unsafe type assertion after JSON.parse",
        suggestion: "Validate parsed data structure before type assertion",
        category: "security",
        owaspMapping: "A08",
      },
      {
        pattern: /eval\s*\(/,
        severity: "critical",
        rule: "eval-usage",
        message: "eval() usage is dangerous and can lead to code injection",
        suggestion:
          "Use safer alternatives like JSON.parse or Function constructor",
        category: "security",
        owaspMapping: "A03",
      },

      // Broken Access Control
      {
        pattern: /req\.params\.[a-zA-Z]+(?!.*(?:auth|permission|role|access))/,
        severity: "high",
        rule: "missing-auth-check",
        message: "Direct parameter usage without visible authorization check",
        suggestion: "Add authorization middleware or checks",
        category: "security",
        owaspMapping: "A01",
      },

      // Security Misconfiguration
      {
        pattern: /cors\s*\(\s*\{\s*origin\s*:\s*(?:true|["']\*["'])/,
        severity: "high",
        rule: "cors-wildcard",
        message: "CORS configured with wildcard origin",
        suggestion: "Specify allowed origins explicitly",
        category: "security",
        owaspMapping: "A05",
      },
      {
        pattern: /helmet\s*\(\s*\{\s*contentSecurityPolicy\s*:\s*false/,
        severity: "medium",
        rule: "csp-disabled",
        message: "Content Security Policy disabled",
        suggestion: "Configure CSP appropriately instead of disabling",
        category: "security",
        owaspMapping: "A05",
      },

      // Logging Sensitive Data
      {
        pattern: /console\.(log|info|error|warn)\s*\([^)]*password[^)]*\)/i,
        severity: "high",
        rule: "logging-password",
        message: "Potentially logging sensitive data (password)",
        suggestion: "Never log passwords or sensitive information",
        category: "security",
        owaspMapping: "A09",
      },
      {
        pattern: /console\.(log|info|error|warn)\s*\([^)]*token[^)]*\)/i,
        severity: "high",
        rule: "logging-token",
        message: "Potentially logging sensitive data (token)",
        suggestion: "Avoid logging authentication tokens",
        category: "security",
        owaspMapping: "A09",
      },

      // Insufficient Cryptography
      {
        pattern: /crypto\.createHash\s*\(\s*["']md5["']\s*\)/,
        severity: "high",
        rule: "weak-hash-md5",
        message: "MD5 is a weak hashing algorithm",
        suggestion: "Use SHA-256 or stronger hashing algorithms",
        category: "security",
        owaspMapping: "A02",
      },
      {
        pattern: /crypto\.createHash\s*\(\s*["']sha1["']\s*\)/,
        severity: "medium",
        rule: "weak-hash-sha1",
        message: "SHA1 is deprecated for security use",
        suggestion: "Use SHA-256 or stronger hashing algorithms",
        category: "security",
        owaspMapping: "A02",
      },
    ];
  }
}
