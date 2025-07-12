# MCP Tools Documentation

> **Note**: This document describes planned future MCP tools for Aichaku. Currently, the MCP server provides security review capabilities. The tools described here (analyze_project, create_doc_template, generate_documentation) are on the roadmap for future implementation.

This document describes the planned Model Context Protocol (MCP) tools for enhanced project analysis and documentation generation.

## Current Status

**Currently Available:**
- `review_file` - Security and standards review for individual files
- `review_methodology` - Check project methodology compliance
- `get_standards` - Retrieve project standards configuration
- `get_statistics` - Get usage statistics and analytics

See [MCP-SERVER.md](./MCP-SERVER.md) for documentation of currently available tools.

## Planned Tools (Future Implementation)

The following tools are planned for future releases to provide automated capabilities for:
- Analyzing project structure and dependencies
- Creating documentation templates based on project type
- Generating comprehensive documentation automatically

These tools will work seamlessly with Aichaku's existing methodology support and will be accessed through the `mcp__aichaku__` prefix when implemented.

## Tools Reference

### 1. analyze_project

Analyzes a project directory to understand its structure, technologies, and patterns.

#### Description
This tool performs deep analysis of a codebase to identify:
- Programming languages and frameworks used
- Project structure and organization
- Dependencies and package managers
- Build tools and configuration
- Testing frameworks
- Documentation patterns
- Potential methodology alignment

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | string | Yes | Absolute or relative path to the project directory |
| `depth` | number | No | How deep to analyze (1-5, default: 3) |
| `includeTests` | boolean | No | Whether to analyze test files (default: true) |
| `includeDocs` | boolean | No | Whether to analyze documentation (default: true) |

#### Return Schema

```typescript
interface ProjectAnalysis {
  projectPath: string;
  name: string;
  type: 'application' | 'library' | 'tool' | 'mixed';
  languages: Array<{
    name: string;
    percentage: number;
    files: number;
  }>;
  frameworks: string[];
  structure: {
    hasSrc: boolean;
    hasTests: boolean;
    hasDocs: boolean;
    hasCI: boolean;
    directories: string[];
  };
  dependencies: {
    manager: string;
    count: number;
    dev: number;
    outdated?: number;
  };
  methodology: {
    detected: string[];
    confidence: number;
    suggestions: string[];
  };
  metrics: {
    totalFiles: number;
    totalLines: number;
    testCoverage?: number;
  };
}
```

#### Usage Examples

**Basic Project Analysis:**
```bash
# Analyze current directory
mcp__aichaku__analyze_project --projectPath .

# Analyze specific project
mcp__aichaku__analyze_project --projectPath /path/to/my-project
```

**Deep Analysis with Options:**
```bash
# Maximum depth analysis including all files
mcp__aichaku__analyze_project \
  --projectPath ./my-app \
  --depth 5 \
  --includeTests true \
  --includeDocs true
```

**Integration with Aichaku Workflow:**
```typescript
// In a Claude conversation or script
const analysis = await mcp__aichaku__analyze_project({
  projectPath: './my-project',
  depth: 3
});

// Use analysis to determine documentation needs
if (analysis.structure.hasTests && !analysis.structure.hasDocs) {
  console.log("Project has tests but lacks documentation");
  // Trigger documentation generation
}

// Check methodology alignment
if (analysis.methodology.detected.includes('shape-up')) {
  console.log("Project appears to follow Shape Up methodology");
  // Create Shape Up specific documentation
}
```

### 2. create_doc_template

Generates documentation templates based on project type and detected patterns.

#### Description
Creates customized documentation templates that match your project's:
- Technology stack
- Project structure
- Detected methodology
- Documentation standards (from Aichaku configuration)

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | string | Yes | Path to the project |
| `templateType` | string | Yes | Type of template: 'readme', 'api', 'architecture', 'contributing', 'testing' |
| `format` | string | No | Output format: 'markdown', 'asciidoc', 'rst' (default: 'markdown') |
| `analysis` | object | No | Pre-computed project analysis (to avoid re-analysis) |
| `standards` | string[] | No | Documentation standards to follow |

#### Return Schema

```typescript
interface DocTemplate {
  type: string;
  format: string;
  path: string;
  content: string;
  sections: Array<{
    name: string;
    content: string;
    required: boolean;
  }>;
  metadata: {
    created: string;
    projectType: string;
    technologies: string[];
    standards: string[];
  };
}
```

#### Usage Examples

**Generate README Template:**
```bash
# Basic README for current project
mcp__aichaku__create_doc_template \
  --projectPath . \
  --templateType readme

# README with specific standards
mcp__aichaku__create_doc_template \
  --projectPath ./my-api \
  --templateType readme \
  --standards '["conventional-commits", "semver"]'
```

**Create API Documentation Template:**
```javascript
// For a REST API project
const apiTemplate = await mcp__aichaku__create_doc_template({
  projectPath: './api-service',
  templateType: 'api',
  format: 'markdown'
});

// Template will include sections for:
// - API Overview
// - Authentication
// - Endpoints
// - Request/Response Examples
// - Error Codes
// - Rate Limiting
```

**Architecture Documentation:**
```typescript
// Use with pre-computed analysis
const analysis = await mcp__aichaku__analyze_project({
  projectPath: './microservices'
});

const archTemplate = await mcp__aichaku__create_doc_template({
  projectPath: './microservices',
  templateType: 'architecture',
  analysis: analysis,  // Reuse analysis
  standards: ['c4-model', 'adr']
});

// Creates template with:
// - System Context
// - Container Diagram sections
// - Component descriptions
// - ADR template references
```

### 3. generate_documentation

Automatically generates complete documentation by analyzing code and existing docs.

#### Description
This tool goes beyond templates to generate actual documentation content by:
- Extracting information from code comments
- Analyzing function signatures and types
- Reading configuration files
- Incorporating existing documentation
- Following specified standards

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | string | Yes | Path to the project |
| `outputPath` | string | No | Where to save documentation (default: './docs') |
| `types` | string[] | No | Documentation types to generate: ['api', 'readme', 'guides', 'all'] |
| `format` | string | No | Output format (default: 'markdown') |
| `includeExamples` | boolean | No | Generate usage examples (default: true) |
| `analysis` | object | No | Pre-computed project analysis |
| `standards` | string[] | No | Documentation standards to follow |
| `methodology` | string | No | Specific methodology to align with |

#### Return Schema

```typescript
interface GeneratedDocs {
  success: boolean;
  outputPath: string;
  files: Array<{
    path: string;
    type: string;
    size: number;
    sections: number;
  }>;
  summary: {
    totalFiles: number;
    totalSections: number;
    coverage: {
      functions: number;
      classes: number;
      modules: number;
    };
    standards: string[];
  };
  warnings: string[];
}
```

#### Usage Examples

**Generate Complete Documentation:**
```bash
# Generate all documentation types
mcp__aichaku__generate_documentation \
  --projectPath . \
  --types '["all"]' \
  --includeExamples true

# This creates:
# - README.md (project overview)
# - docs/API.md (API reference)
# - docs/ARCHITECTURE.md (system design)
# - docs/CONTRIBUTING.md (contribution guide)
# - docs/examples/ (code examples)
```

**API-Only Documentation:**
```typescript
// Generate API docs for a TypeScript project
const apiDocs = await mcp__aichaku__generate_documentation({
  projectPath: './typescript-api',
  outputPath: './docs/api',
  types: ['api'],
  format: 'markdown',
  includeExamples: true,
  standards: ['openapi', 'jsdoc']
});

// Generates:
// - API reference from JSDoc comments
// - OpenAPI specification
// - Request/response examples
// - Type definitions documentation
```

**Methodology-Aligned Documentation:**
```javascript
// For a Shape Up project
const shapeUpDocs = await mcp__aichaku__generate_documentation({
  projectPath: './my-project',
  types: ['guides', 'readme'],
  methodology: 'shape-up',
  standards: ['shape-up', 'conventional-commits']
});

// Creates Shape Up aligned docs:
// - README with pitch-style overview
// - docs/CYCLES.md (development cycles)
// - docs/COOLDOWN.md (cooldown activities)
// - Integration with .claude/output/ structure
```

## Integration with Aichaku Features

### Workflow Integration

The MCP tools integrate seamlessly with Aichaku's methodology support:

```typescript
// 1. Analyze project to detect methodology
const analysis = await mcp__aichaku__analyze_project({
  projectPath: '.'
});

// 2. Create appropriate templates
if (analysis.methodology.detected.includes('scrum')) {
  // Generate Scrum-aligned documentation
  const template = await mcp__aichaku__create_doc_template({
    projectPath: '.',
    templateType: 'contributing',
    analysis: analysis,
    standards: ['scrum', 'agile']
  });
}

// 3. Generate complete documentation
const docs = await mcp__aichaku__generate_documentation({
  projectPath: '.',
  analysis: analysis,
  methodology: analysis.methodology.detected[0],
  types: ['all']
});
```

### Standards Compliance

The tools respect Aichaku's configured documentation standards:

```typescript
// Read configured standards
const standards = await mcp__aichaku__get_standards({
  projectPath: '.'
});

// Generate docs following those standards
const docs = await mcp__aichaku__generate_documentation({
  projectPath: '.',
  standards: standards.selected,
  includeExamples: true
});
```

### Output Structure

Documentation is generated following Aichaku's directory structure:

```
project/
├── .claude/
│   ├── output/
│   │   └── active-*/
│   │       └── project-docs/
│   └── docs/
│       └── generated/
├── docs/
│   ├── README.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── examples/
```

## Best Practices

### 1. Sequential Tool Usage

Use the tools in sequence for best results:

```typescript
// Step 1: Analyze
const analysis = await mcp__aichaku__analyze_project({
  projectPath: './my-project',
  depth: 4
});

// Step 2: Create templates based on analysis
const templates = await Promise.all([
  mcp__aichaku__create_doc_template({
    projectPath: './my-project',
    templateType: 'readme',
    analysis: analysis
  }),
  mcp__aichaku__create_doc_template({
    projectPath: './my-project',
    templateType: 'api',
    analysis: analysis
  })
]);

// Step 3: Generate documentation
const docs = await mcp__aichaku__generate_documentation({
  projectPath: './my-project',
  analysis: analysis,
  types: ['all']
});
```

### 2. Caching Analysis Results

Reuse analysis results to improve performance:

```typescript
// Cache analysis for large projects
const analysisCache = new Map();

async function getProjectAnalysis(path) {
  if (!analysisCache.has(path)) {
    const analysis = await mcp__aichaku__analyze_project({
      projectPath: path,
      depth: 5
    });
    analysisCache.set(path, analysis);
  }
  return analysisCache.get(path);
}
```

### 3. Incremental Documentation

Generate documentation incrementally:

```typescript
// Start with essential docs
await mcp__aichaku__generate_documentation({
  projectPath: '.',
  types: ['readme'],
  includeExamples: false
});

// Add API docs when ready
await mcp__aichaku__generate_documentation({
  projectPath: '.',
  types: ['api'],
  includeExamples: true
});

// Add guides as project matures
await mcp__aichaku__generate_documentation({
  projectPath: '.',
  types: ['guides'],
  methodology: 'shape-up'
});
```

### 4. Custom Standards Integration

Define custom standards for your organization:

```typescript
// Use custom standards
const customDocs = await mcp__aichaku__generate_documentation({
  projectPath: './enterprise-app',
  standards: ['iso-27001', 'company-style-guide'],
  types: ['all']
});

// Template will include security sections
// and follow company style guidelines
```

## Tips and Tricks

### Handling Large Projects

For large codebases, use selective analysis:

```bash
# Shallow analysis first
mcp__aichaku__analyze_project --projectPath . --depth 1

# Deep dive into specific areas
mcp__aichaku__analyze_project --projectPath ./src/core --depth 5
```

### Multi-Language Projects

The tools handle polyglot projects intelligently:

```typescript
// Generates appropriate docs for each language
const docs = await mcp__aichaku__generate_documentation({
  projectPath: './fullstack-app',
  types: ['api'],
  // Tool detects:
  // - TypeScript frontend → TSDoc
  // - Python backend → Sphinx
  // - Go microservices → godoc
});
```

### CI/CD Integration

Automate documentation generation:

```yaml
# .github/workflows/docs.yml
name: Generate Documentation
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'docs/**'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Aichaku
        run: npm install -g aichaku
      
      - name: Analyze Project
        run: |
          aichaku mcp analyze_project \
            --projectPath . \
            --depth 3 > analysis.json
      
      - name: Generate Documentation
        run: |
          aichaku mcp generate_documentation \
            --projectPath . \
            --types '["all"]' \
            --analysis analysis.json
      
      - name: Commit Documentation
        run: |
          git add docs/
          git commit -m "docs: auto-generate documentation"
          git push
```

### Validation and Quality Checks

Use analysis to validate documentation coverage:

```typescript
// Check documentation coverage
const analysis = await mcp__aichaku__analyze_project({
  projectPath: '.',
  includeDocs: true
});

const docs = await mcp__aichaku__generate_documentation({
  projectPath: '.',
  analysis: analysis
});

// Validate coverage
if (docs.summary.coverage.functions < 80) {
  console.warn("Function documentation coverage below 80%");
}

// Check for missing sections
const requiredSections = ['installation', 'usage', 'api', 'contributing'];
const missingSections = requiredSections.filter(section => 
  !docs.files.some(f => f.type === section)
);

if (missingSections.length > 0) {
  console.error(`Missing documentation sections: ${missingSections.join(', ')}`);
}
```

## Error Handling

All tools provide detailed error information:

```typescript
try {
  const docs = await mcp__aichaku__generate_documentation({
    projectPath: './my-project',
    types: ['all']
  });
} catch (error) {
  if (error.code === 'PROJECT_NOT_FOUND') {
    console.error("Project directory not found");
  } else if (error.code === 'NO_SOURCE_FILES') {
    console.error("No source files found to document");
  } else if (error.code === 'PERMISSION_DENIED') {
    console.error("Cannot write to output directory");
  }
  
  // All errors include:
  // - error.code: Machine-readable error code
  // - error.message: Human-readable description
  // - error.details: Additional context
  // - error.suggestions: How to fix the issue
}
```

## Conclusion

The Aichaku MCP tools provide powerful automation for project analysis and documentation generation. By combining these tools with Aichaku's methodology support and standards configuration, you can maintain high-quality, consistent documentation across all your projects with minimal manual effort.

For more information on configuring standards and methodologies, see the main Aichaku documentation.