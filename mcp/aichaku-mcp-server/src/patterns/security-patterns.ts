/**
 * Security patterns for code review
 */

import type { SecurityPattern } from "../types.ts";

export class SecurityPatterns {
  static getPatterns(): SecurityPattern[] {
    return [
      // Command Injection
      {
        id: "sec-command-injection",
        name: "Command Injection",
        pattern: /bash\s+-c\s+['"][^'"]*\$[^{]/,
        severity: "critical",
        description: "Potential command injection - use parameter expansion",
        fix:
          'Use bash parameter expansion: bash -c \'command "$1"\' -- "${VARIABLE}"',
        category: "security",
        owaspMapping: "A03",
      },
      {
        id: "sec-command-injection-exec",
        name: "Command Injection in exec()",
        pattern: /exec\s*\([^)]*\$\{?[^}]*\}?\s*[^)]*\)/,
        severity: "critical",
        description: "Potential command injection in exec() call",
        fix: "Use array arguments or sanitize input",
        category: "security",
        owaspMapping: "A03",
      },

      // Path Traversal
      {
        id: "sec-path-traversal",
        name: "Path Traversal",
        pattern: /\.\.(?:\/|\\)/,
        severity: "high",
        description: "Potential path traversal vulnerability",
        fix: "Validate and normalize paths before use",
        category: "security",
        owaspMapping: "A01",
      },
      {
        id: "sec-path-traversal-join",
        name: "Path Traversal in join()",
        pattern: /join\s*\([^)]*\.\.[^)]*\)/,
        severity: "high",
        description: "Path.join with '..' can lead to directory traversal",
        fix: "Validate path segments before joining",
        category: "security",
        owaspMapping: "A01",
      },

      // SQL Injection
      {
        id: "sql-injection-concat",
        name: "Potential SQL injection",
        pattern: /query\s*\([^)]*\+[^)]*\)/,
        severity: "critical",
        description: "Potential SQL injection - string concatenation in query",
        fix: "Use parameterized queries",
        category: "security",
        owaspMapping: "A03",
      },
      {
        id: "sql-injection-template",
        name: "Potential SQL injection",
        pattern: /query\s*\([^)]*\$\{[^}]*\}[^)]*\)/,
        severity: "critical",
        description: "Potential SQL injection - template literal in query",
        fix: "Use parameterized queries or prepared statements",
        category: "security",
        owaspMapping: "A03",
      },

      // Sensitive Data Exposure
      {
        id: "hardcoded-password",
        name: "Hardcoded password detected",
        pattern: /password\s*[:=]\s*["'][^"']+["']/i,
        severity: "critical",
        description: "Hardcoded password detected",
        fix: "Use environment variables or secure credential storage",
        category: "security",
        owaspMapping: "A02",
      },
      {
        id: "hardcoded-api-key",
        name: "Hardcoded API key detected",
        pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
        severity: "critical",
        description: "Hardcoded API key detected",
        fix: "Use environment variables for API keys",
        category: "security",
        owaspMapping: "A02",
      },
      {
        id: "hardcoded-token",
        name: "Hardcoded token detected",
        pattern: /token\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']/,
        severity: "critical",
        description: "Hardcoded token detected",
        fix: "Use environment variables for tokens",
        category: "security",
        owaspMapping: "A02",
      },

      // Unsafe Deserialization
      {
        id: "unsafe-type-assertion",
        name: "Unsafe type assertion after JSON.parse",
        pattern: /JSON\.parse\s*\([^)]*\)\s*as\s+\w+/,
        severity: "medium",
        description: "Unsafe type assertion after JSON.parse",
        fix: "Validate parsed data structure before type assertion",
        category: "security",
        owaspMapping: "A08",
      },
      {
        id: "eval-usage",
        name: "eval() usage is dangerous and can lead to code injection",
        pattern: /eval\s*\(/,
        severity: "critical",
        description: "eval() usage is dangerous and can lead to code injection",
        fix: "Use safer alternatives like JSON.parse or Function constructor",
        category: "security",
        owaspMapping: "A03",
      },

      // Broken Access Control
      {
        id: "missing-auth-check",
        name: "Direct parameter usage without visible authorization check",
        pattern: /req\.params\.[a-zA-Z]+(?!.*(?:auth|permission|role|access))/,
        severity: "high",
        description:
          "Direct parameter usage without visible authorization check",
        fix: "Add authorization middleware or checks",
        category: "security",
        owaspMapping: "A01",
      },

      // Security Misconfiguration
      {
        id: "cors-wildcard",
        name: "CORS configured with wildcard origin",
        pattern: /cors\s*\(\s*\{\s*origin\s*:\s*(?:true|["']\*["'])/,
        severity: "high",
        description: "CORS configured with wildcard origin",
        fix: "Specify allowed origins explicitly",
        category: "security",
        owaspMapping: "A05",
      },
      {
        id: "csp-disabled",
        name: "Content Security Policy disabled",
        pattern: /helmet\s*\(\s*\{\s*contentSecurityPolicy\s*:\s*false/,
        severity: "medium",
        description: "Content Security Policy disabled",
        fix: "Configure CSP appropriately instead of disabling",
        category: "security",
        owaspMapping: "A05",
      },

      // Logging Sensitive Data
      {
        id: "logging-password",
        name: "Potentially logging sensitive data (password)",
        pattern: /console\.(log|info|error|warn)\s*\([^)]*password[^)]*\)/i,
        severity: "high",
        description: "Potentially logging sensitive data (password)",
        fix: "Never log passwords or sensitive information",
        category: "security",
        owaspMapping: "A09",
      },
      {
        id: "logging-token",
        name: "Potentially logging sensitive data (token)",
        pattern: /console\.(log|info|error|warn)\s*\([^)]*token[^)]*\)/i,
        severity: "high",
        description: "Potentially logging sensitive data (token)",
        fix: "Avoid logging authentication tokens",
        category: "security",
        owaspMapping: "A09",
      },

      // Insufficient Cryptography
      {
        id: "weak-hash-md5",
        name: "MD5 is a weak hashing algorithm",
        pattern: /crypto\.createHash\s*\(\s*["']md5["']\s*\)/,
        severity: "high",
        description: "MD5 is a weak hashing algorithm",
        fix: "Use SHA-256 or stronger hashing algorithms",
        category: "security",
        owaspMapping: "A02",
      },
      {
        id: "weak-hash-sha1",
        name: "SHA1 is deprecated for security use",
        pattern: /crypto\.createHash\s*\(\s*["']sha1["']\s*\)/,
        severity: "medium",
        description: "SHA1 is deprecated for security use",
        fix: "Use SHA-256 or stronger hashing algorithms",
        category: "security",
        owaspMapping: "A02",
      },
    ];
  }
}
