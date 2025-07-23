# Standards Help Integration Design

🪴 Aichaku: Knowledge Base for Modern Development Standards

## Overview

Enhance `aichaku help` to provide comprehensive guidance on modular standards,
creating a valuable knowledge base for developers.

## Command Structure

### Current

````bash
aichaku help                    # General help
aichaku help shape-up          # Methodology help
aichaku help --list            # List methodologies
```text

### Enhanced

```bash
aichaku help                    # General help (shows both methodologies & standards)
aichaku help shape-up          # Methodology help
aichaku help owasp-web         # Standard help
aichaku help --list            # List methodologies
aichaku help --standards       # List all standards
aichaku help --security        # List security standards
aichaku help --all             # Everything available
```text

## Standard Help Format

Each standard gets comprehensive help similar to methodologies:

### Example: OWASP Web Help

```typescript
const STANDARDS_HELP = {
  "owasp-web": `
🔒 OWASP Top 10 Web Application Security
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

The most critical security risks to web applications, updated every
3-4 years by security experts worldwide. Essential for secure coding.

🎯 The Top 10 (2021)

A01. Broken Access Control
  • Unauthorized access to resources
  • Missing function level access control
  • Elevation of privilege

A02. Cryptographic Failures
  • Sensitive data exposure
  • Weak algorithms
  • Poor key management

A03. Injection
  • SQL, NoSQL, OS, LDAP injection
  • XSS (Cross-site Scripting)
  • Code injection

📊 Visual Overview
┌─────────────────────────────────────────┐
│           OWASP Top 10 Pyramid          │
├─────────────────────────────────────────┤
│ A01 │ Broken Access Control     │ 94%  │ ████████████
│ A02 │ Cryptographic Failures    │ 77%  │ ██████████
│ A03 │ Injection                 │ 77%  │ ██████████
│ A04 │ Insecure Design          │ 73%  │ █████████
│ A05 │ Security Misconfiguration │ 90%  │ ████████████
│ ... │                           │       │
└─────────────────────────────────────────┘
        % of apps with vulnerability

💻 Code Examples

❌ Vulnerable (SQL Injection):

  const query = \`SELECT * FROM users WHERE id = \${userId}\`;

✅ Secure (Parameterized):

  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId]);

🛡️ Implementation with Claude Code
  You: "Check this code for OWASP violations"
  You: "How do I prevent SQL injection here?"
  You: "Review auth implementation for A01"

📚 Resources
  • Full Guide: https://owasp.org/Top10/
  • Cheat Sheets: https://cheatsheetseries.owasp.org/
  • Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

💡 Quick Tips
  • Always validate input
  • Use parameterized queries
  • Implement proper access controls
  • Keep dependencies updated
  • Log security events
`,

  "15-factor": `
☁️ 15-Factor App Methodology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Beyond the original 12-factor, modern cloud-native best practices
for building scalable, maintainable applications.

📋 The 15 Factors

I. Codebase
   One codebase tracked in revision control, many deploys

II. Dependencies
   Explicitly declare and isolate dependencies

III. Config
   Store config in the environment

IV. Backing Services
   Treat backing services as attached resources

V. Build, Release, Run
   Strictly separate build and run stages

VI. Processes
   Execute the app as one or more stateless processes

VII. Port Binding
   Export services via port binding

VIII. Concurrency
   Scale out via the process model

IX. Disposability
   Maximize robustness with fast startup and graceful shutdown

X. Dev/Prod Parity
   Keep development, staging, and production as similar as possible

XI. Logs
   Treat logs as event streams

XII. Admin Processes
   Run admin/management tasks as one-off processes

XIII. API First 🆕
   Design API before implementation

XIV. Telemetry 🆕
   Gather metrics, logs, and traces

XV. Authentication & Authorization 🆕
   Security as a first-class concern

🔄 Visual Architecture
┌─────────────────────────────────────────────┐
│              Load Balancer                  │
├─────────────┬─────────────┬────────────────┤
│   Process   │   Process   │   Process      │
│  (Stateless)│  (Stateless)│  (Stateless)   │
├─────────────┴─────────────┴────────────────┤
│           Backing Services                  │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │Database│ │ Cache  │ │ Queue  │        │
│  └────────┘ └────────┘ └────────┘        │
└─────────────────────────────────────────────┘

💻 Implementation Examples

✅ Config (Factor III):

  // Good: Environment variables
  const dbUrl = process.env.DATABASE_URL;
  
  // Bad: Hardcoded values
  const dbUrl = "postgres://localhost/myapp";

✅ Logs (Factor XI):

  // Good: Write to stdout
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'User logged in',
    userId: user.id
  }));

🚀 With Claude Code
  You: "Make this app 15-factor compliant"
  You: "How should I handle configuration?"
  You: "Review for factor violations"

📚 Learn More
  • Original 12-Factor: https://12factor.net/
  • Cloud Native Patterns: https://www.cloudnativepatterns.org/
  • Container Best Practices: https://cloud.google.com/architecture/best-practices-for-building-containers
`,

  tdd: `
🧪 Test-Driven Development (TDD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Write tests first, then code. A discipline that leads to better
design, fewer bugs, and confidence in your codebase.

🔄 The TDD Cycle

┌─────────────────────────────────────────┐
│            RED-GREEN-REFACTOR           │
│                                         │
│     1. RED: Write failing test          │
│         ↓                               │
│     2. GREEN: Write minimal code        │
│         ↓                               │
│     3. REFACTOR: Improve the code       │
│         ↓                               │
│     ← ← ← ← ← ← ← ← ← ← ← ← ← ←       │
└─────────────────────────────────────────┘

📝 The Process

1️⃣ RED Phase
   • Write a test for the next bit of functionality
   • Run the test and watch it fail
   • Ensures test is actually testing something

2️⃣ GREEN Phase
   • Write the simplest code to make test pass
   • Don't worry about elegance yet
   • Just make it work

3️⃣ REFACTOR Phase
   • Clean up the code
   • Remove duplication
   • Improve design
   • Tests ensure nothing breaks

💻 Example: Calculator Addition

// 1. RED: Write failing test
test('adds 1 + 2 to equal 3', () => {
  const calc = new Calculator();
  expect(calc.add(1, 2)).toBe(3);
});
// ❌ Error: Calculator is not defined

// 2. GREEN: Minimal code to pass
class Calculator {
  add(a, b) {
    return a + b;
  }
}
// ✅ Test passes!

// 3. REFACTOR: Improve if needed
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

📊 Benefits Visualization
┌────────────────────────────────────┐
│     Traditional vs TDD Coverage    │
├────────────────────────────────────┤
│ Traditional:                       │
│ Code █████████░░░ 70%             │
│ Tests ████░░░░░░░ 40%             │
│                                    │
│ TDD:                              │
│ Code ████████████ 100%            │
│ Tests ████████████ 100%           │
└────────────────────────────────────┘

✅ Benefits
  • Forces good design (testable = good)
  • Provides living documentation
  • Catches regressions immediately
  • Gives confidence to refactor
  • Reduces debugging time

❌ Common Pitfalls
  • Writing tests after code (not TDD)
  • Testing implementation not behavior
  • Not refactoring in the third step
  • Writing too much code in green phase

🎯 With Claude Code
  You: "Help me TDD this feature"
  You: "Write a failing test for user login"
  You: "Now make this test pass"

📚 Resources
  • Kent Beck's "Test Driven Development"
  • Growing Object-Oriented Software (GOOS)
  • TDD By Example: https://github.com/tastejs/todomvc

💡 Pro Tips
  • Keep tests fast (milliseconds)
  • Test behavior, not implementation
  • One assertion per test (usually)
  • Use descriptive test names
  • Delete redundant tests
`,
};
```text

## Implementation Plan

### 1. Extend Help Command Options

```typescript
// In help.ts
const args = parseArgs(Deno.args, {
  boolean: [
    "list",
    "compare",
    "standards",
    "all",
    "security",
    "architecture",
    "development",
    "testing",
    "devops",
  ],
  string: ["methodology", "standard"],
});
```text

### 2. Create Help Content Map

```typescript
// Combine methodologies and standards
const ALL*HELP*CONTENT = {
  ...METHODOLOGY_HELP,
  ...STANDARDS_HELP,
};
```text

### 3. Add Category Filtering

```typescript
function listStandardsByCategory(category: string) {
  const standards = Object.entries(STANDARD_CATEGORIES[category].standards);
  console.log(`\n${STANDARD_CATEGORIES[category].name}`);
  console.log(`${STANDARD_CATEGORIES[category].description}\n`);

  for (const [id, standard] of standards) {
    console.log(`  • ${id} - ${standard.name}`);
    console.log(`    ${standard.description}`);
  }
}
```text

### 4. Enhanced Help Display

```typescript
function showGeneralHelp() {
  console.log(`
🪴 Aichaku Knowledge Base
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Development Methodologies
  • shape-up     - 6-week cycles, betting on ideas
  • scrum        - Sprints, ceremonies, agile teams
  • kanban       - Visual flow, WIP limits
  • lean         - MVP approach, validated learning
  • xp           - Extreme programming practices
  • scrumban     - Hybrid approach

🛡️ Standards & Best Practices
  
  Security:
  • owasp-web    - Top 10 web security risks
  • nist-csf     - Cybersecurity framework
  
  Architecture:
  • 15-factor    - Cloud-native app principles
  • ddd          - Domain-driven design
  
  Development:
  • tdd          - Test-driven development
  • solid        - Object-oriented principles

Usage:

  aichaku help <topic>        # Detailed help
  aichaku help --list         # List methodologies
  aichaku help --standards    # List all standards
  aichaku help --security     # Security standards
`);
}
```text

## Benefits

1. **Unified Knowledge Base**: One place for all development guidance

2. **Quick Reference**: Developers can learn standards without leaving terminal

3. **Visual Learning**: ASCII diagrams make concepts memorable

4. **Practical Examples**: Real code snippets for each standard

5. **Integration Tips**: How to use with Claude Code

## Future Enhancements

1. **Interactive Mode**: Browse standards with arrow keys

2. **Search**: Find standards by keyword

3. **Export**: Generate PDF reference guides

4. **Updates**: Pull latest standards from online sources

5. **Custom Standards**: Add organization-specific guides
````
