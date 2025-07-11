# Enhanced MCP Tool Descriptions

## Current vs Enhanced Tool Descriptions

### 1. review_file

**Current:**
```
Review a file for security, standards, and methodology compliance
```

**Enhanced:**
```
Automatically review code files for security vulnerabilities, coding standards, and best practices.
Detects: OWASP vulnerabilities, SQL injection, XSS, hardcoded secrets, code quality issues.
Standards: Checks compliance with SOLID, TDD, Clean Code, and your project's selected standards.
Auto-runs: After file edits, before commits, when security concerns are mentioned.
Keywords: review, audit, security, check, scan, vulnerabilities, quality, standards, compliance
Examples: "review this file", "check for security issues", "audit my code"
```

### 2. get_standards

**Current:**
```
Get currently selected standards for the project
```

**Enhanced:**
```
Get the coding and documentation standards configured for your project (OWASP, SOLID, TDD, etc).
Use this to: understand project requirements, ensure compliance, generate compliant code.
Auto-runs: When opening a project, before generating documentation, when standards are mentioned.
Keywords: standards, guidelines, requirements, conventions, style, configuration, rules
Examples: "what standards does this project use", "show coding guidelines"
```

### 3. review_methodology

**Current:**
```
Check if project follows selected methodology patterns
```

**Enhanced:**
```
Verify your project follows Shape Up, Scrum, Kanban, or other methodologies correctly.
Checks for: Required artifacts (pitches, sprints, boards), proper structure, process compliance.
Auto-runs: When methodology terms are used, during project planning, status checks.
Keywords: shape up, scrum, kanban, agile, methodology, process, pitch, sprint, workflow
Examples: "are we following shape up", "check scrum compliance", "review our process"
```

### 4. generate_documentation (NEW)

```
Generate comprehensive project documentation in /docs based on your selected standards.
Creates: Architecture diagrams, API documentation, user guides, concept explanations.
Follows: Diátaxis framework, Google style guide, or your configured documentation standards.
Auto-runs: When asked to document, create docs, generate guides, or explain the project.
Keywords: generate, create, write, documentation, docs, architecture, API, guide, comprehensive
Examples: "generate project documentation", "create docs in /docs", "document this codebase"
```

### 5. analyze_project (NEW)

```
Analyze your project's structure, dependencies, and architecture for documentation and insights.
Discovers: File organization, dependency graph, API endpoints, design patterns, entry points.
Auto-runs: Before generating documentation, when asked about architecture, for project overview.
Keywords: analyze, structure, architecture, dependencies, overview, understand, explore
Examples: "analyze this project", "what's the architecture", "show project structure"
```

### 6. create_doc_template (NEW)

```
Create documentation templates following Diátaxis or other selected standards.
Types: Tutorial (learning-oriented), How-to (task-oriented), Reference (information-oriented), Explanation (understanding-oriented).
Auto-runs: When creating new docs, starting documentation, following templates.
Keywords: template, tutorial, how-to, reference, explanation, guide, documentation type
Examples: "create a tutorial template", "new how-to guide", "reference documentation"
```

## Tool Metadata Structure

```typescript
interface EnhancedToolMetadata {
  // Identity
  id: string;
  name: string;
  category: "security" | "documentation" | "standards" | "analysis";
  
  // Discoverability
  shortDescription: string;  // One-line summary
  longDescription: string;   // Full description with keywords
  aliases: string[];         // Alternative names
  
  // Natural language
  keywords: string[];
  triggerPhrases: string[];
  examplePrompts: string[];
  
  // Behavior
  autoInvoke: {
    enabled: boolean;
    conditions: string[];    // When to auto-invoke
    afterActions?: string[]; // After these user actions
    beforeActions?: string[]; // Before these user actions
  };
  
  // Relationships
  chainWith: string[];       // Tools that work well together
  requiredBefore?: string[]; // Tools that must run first
  suggestedAfter?: string[]; // Tools to run after
}
```

## Example Enhanced Metadata

```typescript
const reviewFileMetadata: EnhancedToolMetadata = {
  id: "mcp__aichaku-reviewer__review_file",
  name: "Security & Standards Review",
  category: "security",
  
  shortDescription: "Review code for security vulnerabilities and standards compliance",
  
  longDescription: `Automatically review code files for security vulnerabilities, coding standards, and best practices.
Detects: OWASP vulnerabilities, SQL injection, XSS, hardcoded secrets, code quality issues.
Standards: Checks compliance with SOLID, TDD, Clean Code, and your project's selected standards.
Auto-runs: After file edits, before commits, when security concerns are mentioned.
Keywords: review, audit, security, check, scan, vulnerabilities, quality, standards, compliance
Examples: "review this file", "check for security issues", "audit my code"`,
  
  aliases: ["audit", "scan", "check", "review"],
  
  keywords: [
    "review", "audit", "security", "vulnerability", "scan",
    "check", "analyze", "owasp", "injection", "xss", "csrf",
    "quality", "standards", "compliance", "bugs", "issues"
  ],
  
  triggerPhrases: [
    "review this",
    "check for security",
    "audit the code",
    "find vulnerabilities",
    "is this secure",
    "scan for issues"
  ],
  
  examplePrompts: [
    "Review auth.ts for security vulnerabilities",
    "Check if this file has any security issues",
    "Audit my login code",
    "Is this payment processing secure?"
  ],
  
  autoInvoke: {
    enabled: true,
    conditions: [
      "After editing files matching: **/auth/**, **/security/**, **/login/**",
      "When security keywords are mentioned",
      "Before committing changes",
      "After generating new code"
    ],
    afterActions: ["Edit", "MultiEdit", "Write"],
    beforeActions: ["git commit", "git push"]
  },
  
  chainWith: ["get_standards"],
  suggestedAfter: ["Edit", "generate_documentation"]
};
```

## Natural Language Mapping

```typescript
const naturalLanguageMap = {
  // Security intentions
  "is this secure": ["review_file"],
  "check security": ["review_file"],
  "find bugs": ["review_file"],
  "audit code": ["review_file"],
  
  // Documentation intentions
  "generate docs": ["analyze_project", "generate_documentation"],
  "create documentation": ["generate_documentation"],
  "document this": ["analyze_project", "generate_documentation"],
  "write guides": ["create_doc_template", "generate_documentation"],
  
  // Standards intentions
  "what standards": ["get_standards"],
  "coding guidelines": ["get_standards"],
  "project rules": ["get_standards"],
  
  // Methodology intentions
  "following shape up": ["review_methodology"],
  "scrum compliance": ["review_methodology"],
  "check process": ["review_methodology"]
};
```

## Auto-Chain Definitions

```typescript
const autoChains = {
  "comprehensive-documentation": {
    trigger: /generate.*comprehensive.*docs/i,
    steps: [
      "get_standards",
      "analyze_project",
      "generate_documentation",
      "review_file" // For each generated file
    ]
  },
  
  "security-audit": {
    trigger: /security.*audit|audit.*security/i,
    steps: [
      "get_standards",
      "review_file", // For all source files
      "generate_security_report"
    ]
  },
  
  "project-setup": {
    trigger: /set.*up.*project|initialize/i,
    steps: [
      "get_standards",
      "review_methodology",
      "create_doc_template"
    ]
  }
};
```

These enhanced descriptions and metadata make the tools much more discoverable and likely to be used automatically when appropriate.