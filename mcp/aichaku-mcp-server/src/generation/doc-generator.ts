/**
 * Documentation Generator
 *
 * Generates comprehensive documentation following various standards
 */

import { ensureDir } from "@std/fs/ensure-dir";
import { dirname, join, normalize } from "@std/path";
import type { DirectoryStructure, ProjectAnalysis, ProjectType } from "../analysis/project-analyzer.ts";
import { safeWriteTextFileSync, validatePath } from "../utils/path-security.ts";
import process from "node:process";

export interface GenerationOptions {
  standard: DocumentationStandard;
  projectAnalysis: ProjectAnalysis;
  outputPath: string;
  overwrite?: boolean;
  includeExamples?: boolean;
  includeDiagrams?: boolean;
}

export type DocumentationStandard =
  | "diataxis"
  | "diataxis-google"
  | "google"
  | "microsoft"
  | "readme-first"
  | "api-first";

export interface GeneratedDoc {
  path: string;
  content: string;
  type: string;
}

export class DocGenerator {
  private templates = new Map<string, string>();

  constructor() {
    this.loadTemplates();
  }

  async generate(options: GenerationOptions): Promise<GeneratedDoc[]> {
    const docs: GeneratedDoc[] = [];

    // Validate and normalize output path
    const normalizedOutputPath = normalize(options.outputPath);
    try {
      validatePath(normalizedOutputPath, options.projectAnalysis.rootPath);
    } catch (error) {
      throw new Error(
        `Invalid output path: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Ensure output directory exists
    await ensureDir(normalizedOutputPath);

    // Generate main README if it doesn't exist
    const readmePath = join(dirname(normalizedOutputPath), "README.md");
    try {
      validatePath(readmePath, options.projectAnalysis.rootPath);
    } catch (error) {
      throw new Error(
        `Invalid README path: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const readme = this.generateReadme(options.projectAnalysis);
    docs.push({ path: readmePath, content: readme, type: "readme" });

    // Generate documentation structure based on standard
    switch (options.standard) {
      case "diataxis":
      case "diataxis-google":
        docs.push(...this.generateDiataxisDocs(options));
        break;

      case "google":
        docs.push(...this.generateGoogleStyleDocs(options));
        break;

      case "microsoft":
        docs.push(...this.generateMicrosoftStyleDocs(options));
        break;

      case "readme-first":
        docs.push(...this.generateReadmeFirstDocs(options));
        break;

      case "api-first":
        docs.push(...this.generateApiFirstDocs(options));
        break;
    }

    // Generate architecture diagrams if requested
    if (options.includeDiagrams) {
      docs.push(...this.generateArchitectureDiagrams(options));
    }

    // Write all documents
    for (const doc of docs) {
      const fullPath = normalize(
        join(options.projectAnalysis.rootPath, doc.path),
      );
      try {
        validatePath(fullPath, options.projectAnalysis.rootPath);
      } catch (error) {
        console.error(
          `Skipping invalid path: ${fullPath} - ${error instanceof Error ? error.message : String(error)}`,
        );
        continue;
      }

      await ensureDir(dirname(fullPath));
      safeWriteTextFileSync(
        fullPath,
        doc.content,
        options.projectAnalysis.rootPath,
      );
    }

    return docs;
  }

  private loadTemplates() {
    // Tutorial template
    this.templates.set(
      "tutorial",
      `# Tutorial: {title}

## Overview

This tutorial will guide you through {description}.

## Prerequisites

Before starting this tutorial, you should:

- Have {language} installed
- Be familiar with {concepts}
- Have completed {previous_tutorial}

## Learning Objectives

By the end of this tutorial, you will:

1. Understand {concept1}
2. Be able to {skill1}
3. Know how to {skill2}

## Step 1: {step1_title}

{step1_description}

\`\`\`{language}
{step1_code}
\`\`\`

### What's happening here?

{step1_explanation}

## Step 2: {step2_title}

{step2_description}

\`\`\`{language}
{step2_code}
\`\`\`

## Try it yourself

Now that you've learned {concept}, try:

1. {exercise1}
2. {exercise2}

## Next steps

- Continue with [Next Tutorial]({next_tutorial_link})
- Explore the [How-to Guides](../how-to/index.md)
- Read the [Concepts](../explanation/index.md)
`,
    );

    // How-to guide template
    this.templates.set(
      "how-to",
      `# How to {task}

## Goal

This guide shows you how to {task_description}.

## Before you start

You need:

- {requirement1}
- {requirement2}

## Steps

### 1. {step1}

{step1_instructions}

\`\`\`{language}
{step1_code}
\`\`\`

### 2. {step2}

{step2_instructions}

\`\`\`{language}
{step2_code}
\`\`\`

## Verification

To verify {task} worked:

\`\`\`{language}
{verification_code}
\`\`\`

## Troubleshooting

### Problem: {problem1}

**Solution**: {solution1}

### Problem: {problem2}

**Solution**: {solution2}

## Related guides

- [How to {related_task1}]({link1})
- [How to {related_task2}]({link2})
`,
    );

    // Reference template
    this.templates.set(
      "reference",
      `# {component} Reference

## Overview

{component_description}

## API

### {method_or_class}

{api_description}

#### Syntax

\`\`\`{language}
{syntax}
\`\`\`

#### Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| {param1} | {type1} | {desc1} | {req1} |
| {param2} | {type2} | {desc2} | {req2} |

#### Returns

{return_description}

#### Examples

##### Basic usage

\`\`\`{language}
{basic_example}
\`\`\`

##### Advanced usage

\`\`\`{language}
{advanced_example}
\`\`\`

#### Errors

| Error | Description | How to fix |
|-------|-------------|------------|
| {error1} | {error_desc1} | {fix1} |
| {error2} | {error_desc2} | {fix2} |

## See also

- [{related1}]({link1})
- [{related2}]({link2})
`,
    );

    // Explanation template
    this.templates.set(
      "explanation",
      `# Understanding {concept}

## Introduction

{concept_introduction}

## Background

{background_context}

## Core concepts

### {subconcept1}

{subconcept1_explanation}

\`\`\`mermaid
{concept_diagram}
\`\`\`

### {subconcept2}

{subconcept2_explanation}

## How it works

{detailed_explanation}

### Example scenario

{scenario_description}

\`\`\`{language}
{example_code}
\`\`\`

## Design decisions

### Why {decision1}?

{decision1_rationale}

### Trade-offs

- **Pros**: {pros}
- **Cons**: {cons}

## Common misconceptions

### Misconception: {misconception1}

**Reality**: {reality1}

## Further reading

- {resource1}
- {resource2}
- {resource3}
`,
    );

    // Architecture template
    this.templates.set(
      "architecture",
      `# Architecture Overview

## System Architecture

{architecture_description}

### Architecture Pattern: {pattern}

\`\`\`mermaid
graph TB
    subgraph "Presentation Layer"
        A[Controllers]
        B[Views]
    end
    
    subgraph "Business Layer"
        C[Services]
        D[Domain Logic]
    end
    
    subgraph "Data Layer"
        E[Repositories]
        F[Database]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
\`\`\`

## Components

### {component1}

**Purpose**: {component1_purpose}

**Responsibilities**:
- {responsibility1}
- {responsibility2}

**Dependencies**:
- {dependency1}
- {dependency2}

## Data Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Controller
    participant S as Service
    participant R as Repository
    participant D as Database
    
    U->>C: Request
    C->>S: Process
    S->>R: Query
    R->>D: SQL
    D-->>R: Data
    R-->>S: Entity
    S-->>C: Response
    C-->>U: Result
\`\`\`

## Key Design Decisions

### {decision1}

**Context**: {context1}

**Decision**: {decision1_text}

**Consequences**: {consequences1}

## Security Considerations

{security_overview}

## Performance Considerations

{performance_overview}

## Deployment Architecture

\`\`\`mermaid
graph LR
    subgraph "Production Environment"
        LB[Load Balancer]
        S1[Server 1]
        S2[Server 2]
        DB[(Database)]
        C[Cache]
    end
    
    U[Users] --> LB
    LB --> S1
    LB --> S2
    S1 --> DB
    S2 --> DB
    S1 --> C
    S2 --> C
\`\`\`
`,
    );
  }

  private generateReadme(analysis: ProjectAnalysis): string {
    const { type, languages, architecture } = analysis;
    const mainLanguage = languages[0]?.language || "Unknown";

    let readme = `# ${analysis.rootPath.split("/").pop()}

## Overview

This is a ${type} project written primarily in ${mainLanguage}.

`;

    if (architecture.pattern) {
      readme += `The project follows the **${architecture.pattern}** architecture pattern.\n\n`;
    }

    readme += `## Getting Started

### Prerequisites

`;

    // Add language-specific prerequisites
    if (type.includes("typescript") || type.includes("javascript")) {
      readme += `- Node.js (v16 or higher)
- npm or yarn
`;
    } else if (type.includes("python")) {
      readme += `- Python 3.8 or higher
- pip
`;
    } else if (type.includes("go")) {
      readme += `- Go 1.19 or higher
`;
    }

    readme += `
### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd ${analysis.rootPath.split("/").pop()}
   \`\`\`

2. Install dependencies:
`;

    if (type.includes("typescript") || type.includes("javascript")) {
      readme += `   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`
`;
    } else if (type.includes("python")) {
      readme += `   \`\`\`bash
   pip install -r requirements.txt
   # or with poetry
   poetry install
   \`\`\`
`;
    } else if (type.includes("go")) {
      readme += `   \`\`\`bash
   go mod download
   \`\`\`
`;
    }

    readme += `
### Running the Project

`;

    if (analysis.entryPoints.length > 0) {
      readme += `Run the main application:

\`\`\`bash
`;
      const mainEntry = analysis.entryPoints[0];
      if (type.includes("typescript")) {
        readme += `npm run dev
# or
deno run --allow-read --allow-write --allow-env --allow-net ${mainEntry}`;
      } else if (type.includes("javascript")) {
        readme += `node ${mainEntry}`;
      } else if (type.includes("python")) {
        readme += `python ${mainEntry}`;
      } else if (type.includes("go")) {
        readme += `go run ${mainEntry}`;
      }
      readme += `
\`\`\`
`;
    }

    readme += `
## Project Structure

\`\`\`
${this.generateTreeView(analysis.structure)}
\`\`\`

## Documentation

- [Tutorials](docs/tutorials/index.md) - Start here if you're new
- [How-to Guides](docs/how-to/index.md) - Specific tasks and recipes
- [Reference](docs/reference/index.md) - Technical reference
- [Explanation](docs/explanation/index.md) - Concepts and design decisions

`;

    if (analysis.apiEndpoints.length > 0) {
      readme += `## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
`;
      for (const endpoint of analysis.apiEndpoints.slice(0, 5)) {
        readme += `| ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.description || "TBD"} |\n`;
      }

      if (analysis.apiEndpoints.length > 5) {
        readme += `\n[View all endpoints](docs/api/endpoints.md)\n`;
      }
      readme += `\n`;
    }

    if (analysis.testFiles.length > 0) {
      readme += `## Testing

Run the test suite:

\`\`\`bash
`;
      if (type.includes("typescript") || type.includes("javascript")) {
        readme += `npm test`;
      } else if (type.includes("python")) {
        readme += `pytest`;
      } else if (type.includes("go")) {
        readme += `go test ./...`;
      }
      readme += `
\`\`\`

`;
    }

    readme += `## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`;

    return readme;
  }

  private generateTreeView(structure: DirectoryStructure, indent = ""): string {
    let result = "";

    if (structure.children) {
      const sorted = structure.children.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      for (let i = 0; i < sorted.length; i++) {
        const child = sorted[i];
        const isLast = i === sorted.length - 1;
        const prefix = isLast ? "└── " : "├── ";
        const childIndent = isLast ? "    " : "│   ";

        result += indent + prefix + child.name;
        if (child.purpose) {
          result += ` # ${child.purpose}`;
        }
        result += "\n";

        if (
          child.type === "directory" && child.children &&
          child.children.length > 0
        ) {
          // Only show first level of subdirectories
          if (indent.length < 8) {
            result += this.generateTreeView(child, indent + childIndent);
          }
        }
      }
    }

    return result;
  }

  private generateDiataxisDocs(
    options: GenerationOptions,
  ): GeneratedDoc[] {
    const docs: GeneratedDoc[] = [];
    const { projectAnalysis, outputPath } = options;
    const normalizedOutputPath = normalize(outputPath);

    // Create main index
    docs.push({
      path: join(normalizedOutputPath, "index.md"),
      content: this.generateDocsIndex(projectAnalysis, "diataxis"),
      type: "index",
    });

    // Generate tutorial structure
    const tutorialPath = join(normalizedOutputPath, "tutorials");
    docs.push({
      path: join(tutorialPath, "index.md"),
      content: this.generateTutorialIndex(projectAnalysis),
      type: "tutorial-index",
    });

    docs.push({
      path: join(tutorialPath, "getting-started.md"),
      content: this.generateGettingStartedTutorial(projectAnalysis),
      type: "tutorial",
    });

    // Generate how-to guides
    const howToPath = join(normalizedOutputPath, "how-to");
    docs.push({
      path: join(howToPath, "index.md"),
      content: this.generateHowToIndex(projectAnalysis),
      type: "how-to-index",
    });

    // Generate specific how-to guides based on project
    if (projectAnalysis.apiEndpoints.length > 0) {
      docs.push({
        path: join(howToPath, "use-api.md"),
        content: this.generateApiHowTo(projectAnalysis),
        type: "how-to",
      });
    }

    if (projectAnalysis.testFiles.length > 0) {
      docs.push({
        path: join(howToPath, "run-tests.md"),
        content: this.generateTestingHowTo(projectAnalysis),
        type: "how-to",
      });
    }

    // Generate reference documentation
    const referencePath = join(normalizedOutputPath, "reference");
    docs.push({
      path: join(referencePath, "index.md"),
      content: this.generateReferenceIndex(projectAnalysis),
      type: "reference-index",
    });

    // Generate API reference if applicable
    if (projectAnalysis.apiEndpoints.length > 0) {
      docs.push({
        path: join(referencePath, "api.md"),
        content: this.generateApiReference(projectAnalysis),
        type: "reference",
      });
    }

    // Generate explanation/conceptual docs
    const explanationPath = join(normalizedOutputPath, "explanation");
    docs.push({
      path: join(explanationPath, "index.md"),
      content: this.generateExplanationIndex(projectAnalysis),
      type: "explanation-index",
    });

    if (projectAnalysis.architecture.pattern) {
      docs.push({
        path: join(explanationPath, "architecture.md"),
        content: this.generateArchitectureExplanation(projectAnalysis),
        type: "explanation",
      });
    }

    return docs;
  }

  private generateDocsIndex(
    analysis: ProjectAnalysis,
    standard: string,
  ): string {
    return `# Documentation

Welcome to the ${analysis.rootPath.split("/").pop()} documentation!

This documentation follows the **${
      standard === "diataxis" ? "Diátaxis" : standard
    }** framework to help you find exactly what you need.

## Documentation Structure

### 🎓 [Tutorials](tutorials/index.md)
**Learning-oriented** - Start here if you're new to the project

- [Getting Started](tutorials/getting-started.md)
- [Your First ${analysis.type.includes("library") ? "Integration" : "Application"}](tutorials/first-app.md)

### 🛠️ [How-to Guides](how-to/index.md)
**Task-oriented** - Guides for specific tasks

- [Common Tasks](how-to/common-tasks.md)
${analysis.apiEndpoints.length > 0 ? "- [Using the API](how-to/use-api.md)" : ""}
${analysis.testFiles.length > 0 ? "- [Running Tests](how-to/run-tests.md)" : ""}

### 📖 [Reference](reference/index.md)
**Information-oriented** - Technical descriptions

${analysis.apiEndpoints.length > 0 ? "- [API Reference](reference/api.md)" : ""}
- [Configuration Reference](reference/configuration.md)
- [Architecture Reference](reference/architecture.md)

### 💡 [Explanation](explanation/index.md)
**Understanding-oriented** - Discussions and concepts

- [Key Concepts](explanation/concepts.md)
${analysis.architecture.pattern ? `- [${analysis.architecture.pattern} Architecture](explanation/architecture.md)` : ""}
- [Design Decisions](explanation/decisions.md)

## Quick Links

- [Installation Guide](tutorials/getting-started.md#installation)
- [API Documentation](reference/api.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)

## Getting Help

- 📋 [Issue Tracker](https://github.com/user/repo/issues)
- 💬 [Discussions](https://github.com/user/repo/discussions)
- 📧 [Contact](mailto:support@example.com)
`;
  }

  private generateTutorialIndex(analysis: ProjectAnalysis): string {
    return `# Tutorials

Learn how to use ${analysis.rootPath.split("/").pop()} with these step-by-step tutorials.

## Getting Started

1. **[Getting Started](getting-started.md)** - Set up your environment and run your first example
2. **[Basic Concepts](basic-concepts.md)** - Understand the fundamental concepts
3. **[Your First ${
      analysis.type.includes("library") ? "Integration" : "Application"
    }](first-app.md)** - Build something real

## Intermediate Tutorials

4. **[Working with ${
      analysis.architecture.components[0]?.type || "Components"
    }](intermediate/components.md)** - Deep dive into components
5. **[Testing Your Code](intermediate/testing.md)** - Write and run tests
6. **[Best Practices](intermediate/best-practices.md)** - Learn recommended patterns

## Advanced Tutorials

7. **[Performance Optimization](advanced/performance.md)** - Make your code faster
8. **[Security Hardening](advanced/security.md)** - Secure your application
9. **[Deployment Guide](advanced/deployment.md)** - Deploy to production

## Tutorial Format

Each tutorial:
- Takes 15-30 minutes to complete
- Builds on previous tutorials
- Includes working code examples
- Has exercises to practice

## Prerequisites

Before starting, ensure you have:
${analysis.languages.map((lang) => `- ${lang.language} installed`).join("\n")}
- A code editor (VS Code recommended)
- Basic command line knowledge

Ready? [Start with Getting Started →](getting-started.md)
`;
  }

  private generateGettingStartedTutorial(analysis: ProjectAnalysis): string {
    const projectName = analysis.rootPath.split("/").pop() || "project";
    const mainLanguage = analysis.languages[0]?.language ||
      "the programming language";

    return `# Getting Started with ${projectName}

In this tutorial, you'll set up ${projectName} and run your first example in about 15 minutes.

## What You'll Learn

- How to install ${projectName}
- How to set up your development environment
- How to run a basic example
- How to verify everything is working

## Prerequisites

Before you begin, make sure you have:

- ${mainLanguage} installed on your system
- A terminal or command prompt
- A text editor (we recommend VS Code)

## Step 1: Installation

First, let's get ${projectName} installed on your system.

${this.generateInstallationInstructions(analysis)}

## Step 2: Verify Installation

Let's make sure everything is installed correctly:

${this.generateVerificationInstructions(analysis)}

## Step 3: Your First Example

Now let's create a simple example to see ${projectName} in action.

### Create a new file

Create a new file called \`example.${this.getFileExtension(analysis.type)}\`:

\`\`\`${this.getLanguageForHighlight(analysis.type)}
${this.generateExampleCode(analysis)}
\`\`\`

### Run the example

\`\`\`bash
${this.generateRunCommand(analysis)}
\`\`\`

You should see:

\`\`\`
Hello from ${projectName}!
${analysis.type.includes("library") ? "Library loaded successfully" : "Application started successfully"}
\`\`\`

## Step 4: Understanding the Code

Let's break down what just happened:

${this.generateCodeExplanation(analysis)}

## Exercises

Now try these exercises to reinforce what you've learned:

1. **Exercise 1**: Modify the example to ${this.generateExercise1(analysis)}
2. **Exercise 2**: Create a new file that ${this.generateExercise2(analysis)}
3. **Challenge**: ${this.generateChallenge(analysis)}

## Troubleshooting

### Common Issues

**Problem**: ${this.generateCommonProblem1(analysis)}

**Solution**: ${this.generateCommonSolution1(analysis)}

**Problem**: "Module not found" or similar import error

**Solution**: Make sure you've installed all dependencies and are running from the correct directory.

## Next Steps

Congratulations! You've successfully:
- ✅ Installed ${projectName}
- ✅ Created your first example
- ✅ Learned the basics

Ready to learn more? Continue with:
- [Basic Concepts](basic-concepts.md) - Understand core concepts
- [Your First ${analysis.type.includes("library") ? "Integration" : "Application"}](first-app.md) - Build something real

## Getting Help

If you run into issues:
- Check the [Troubleshooting Guide](../reference/troubleshooting.md)
- Ask in [Discussions](https://github.com/user/repo/discussions)
- Report bugs in [Issues](https://github.com/user/repo/issues)
`;
  }

  private generateHowToIndex(analysis: ProjectAnalysis): string {
    return `# How-to Guides

Practical step-by-step guides for common tasks.

## Common Tasks

${this.generateHowToList(analysis)}

## Guide Categories

### Configuration
- [Configure for Production](configuration/production.md)
- [Set Up Environment Variables](configuration/environment.md)
- [Configure Logging](configuration/logging.md)

### Integration
- [Integrate with Express](integration/express.md)
- [Connect to Database](integration/database.md)
- [Add Authentication](integration/auth.md)

### Development
- [Debug Issues](development/debugging.md)
- [Profile Performance](development/profiling.md)
- [Write Tests](development/testing.md)

### Deployment
- [Deploy to Docker](deployment/docker.md)
- [Deploy to Cloud](deployment/cloud.md)
- [Set Up CI/CD](deployment/cicd.md)

## How to Use These Guides

Each guide:
- Focuses on a single task
- Lists prerequisites clearly
- Provides step-by-step instructions
- Includes verification steps
- Offers troubleshooting tips

## Can't Find What You Need?

- Check the [Reference Documentation](../reference/index.md)
- Search the [Tutorials](../tutorials/index.md)
- Ask in [Discussions](https://github.com/user/repo/discussions)
`;
  }

  private generateApiHowTo(analysis: ProjectAnalysis): string {
    const endpoints = analysis.apiEndpoints;

    return `# How to Use the API

This guide shows you how to interact with the ${analysis.rootPath.split("/").pop()} API.

## Prerequisites

- API endpoint URL
- Authentication credentials (if required)
- HTTP client (curl, Postman, or code library)

## Basic API Call

### Using curl

\`\`\`bash
curl -X GET $API_URL/api/health
\`\`\`

### Using JavaScript

\`\`\`javascript
const response = await fetch(\`\${Deno.env.get("API_URL")}/api/health\`);
const data = await response.json();
console.log(data);
\`\`\`

### Using Python

\`\`\`python
import requests
import os

response = requests.get(f"{os.environ['API_URL']}/api/health")
data = response.json()
print(data)
\`\`\`

## Common Operations

${
      endpoints.slice(0, 5).map((endpoint) => `
### ${endpoint.method} ${endpoint.path}

\`\`\`bash
curl -X ${endpoint.method} $API_URL${endpoint.path} \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'
\`\`\`
`).join("\n")
    }

## Authentication

If the API requires authentication:

\`\`\`bash
# Using Bearer token
curl -X GET $API_URL/api/protected \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Using API key
curl -X GET $API_URL/api/protected \\
  -H "X-API-Key: YOUR_API_KEY"
\`\`\`

## Error Handling

The API returns standard HTTP status codes:

- \`200\` - Success
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`404\` - Not Found
- \`500\` - Server Error

Example error response:

\`\`\`json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "The provided input is invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
\`\`\`

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per API key

## Next Steps

- [API Reference](../reference/api.md) - Complete API documentation
- [Authentication Guide](auth.md) - Detailed authentication setup
- [Error Codes](../reference/errors.md) - All error codes explained
`;
  }

  private generateReferenceIndex(analysis: ProjectAnalysis): string {
    return `# Reference Documentation

Technical reference for ${analysis.rootPath.split("/").pop()}.

## API Reference

${analysis.apiEndpoints.length > 0 ? `- [REST API](api.md) - Complete API documentation` : "- No API endpoints found"}
- [Configuration](configuration.md) - All configuration options
- [CLI Commands](cli.md) - Command-line interface reference

## Code Reference

${
      analysis.architecture.components.map((c) =>
        `- [${c.name}](components/${c.name.toLowerCase()}.md) - ${c.type} documentation`
      ).join("\n")
    }

## Architecture

- [System Architecture](architecture.md) - Overall system design
- [Data Models](models.md) - Data structures and schemas
- [Security Model](security.md) - Security architecture

## Configuration Files

${
      analysis.configFiles.map((config) => `- [\`${config.path}\`](configs/${config.type}.md) - ${config.purpose}`)
        .slice(0, 5).join("\n")
    }

## Error Reference

- [Error Codes](errors.md) - All error codes and meanings
- [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Development Reference

- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Code Style](style-guide.md) - Coding standards
- [Testing Guide](testing.md) - Testing practices

## Quick Links

Most commonly referenced:

1. [API Endpoints](api.md#endpoints)
2. [Configuration Options](configuration.md#options)
3. [Error Codes](errors.md#codes)
4. [Environment Variables](configuration.md#environment)
`;
  }

  private generateApiReference(analysis: ProjectAnalysis): string {
    const endpoints = analysis.apiEndpoints;

    return `# API Reference

Complete reference for all API endpoints.

## Base URL

\`\`\`
${process.env.API_URL || "http://localhost:3000"}/api // DevSkim: ignore DS137138
\`\`\`

## Authentication

Most endpoints require authentication. Include the authentication header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

${
      endpoints.map((endpoint) => `
### ${endpoint.method} ${endpoint.path}

**File**: \`${endpoint.file}\`${endpoint.line ? ` (line ${endpoint.line})` : ""}

#### Request

\`\`\`http
${endpoint.method} ${endpoint.path} HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer <token>
\`\`\`

#### Response

\`\`\`json
{
  "status": "success",
  "data": {}
}
\`\`\`

#### Status Codes

- \`200\` - Success
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`404\` - Not Found
`).join("\n---\n")
    }

## Common Headers

| Header | Description | Required |
|--------|-------------|----------|
| \`Authorization\` | Bearer token for authentication | Yes* |
| \`Content-Type\` | Request body format (usually \`application/json\`) | For POST/PUT |
| \`Accept\` | Response format (usually \`application/json\`) | No |

*Required for protected endpoints

## Rate Limiting

API calls are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

Rate limit headers:
- \`X-RateLimit-Limit\` - Request limit
- \`X-RateLimit-Remaining\` - Remaining requests
- \`X-RateLimit-Reset\` - Reset timestamp

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
\`\`\`

## Pagination

List endpoints support pagination:

\`\`\`
GET /api/items?page=2&limit=20
\`\`\`

Response includes:

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
\`\`\`
`;
  }

  private generateExplanationIndex(analysis: ProjectAnalysis): string {
    return `# Concepts and Explanation

Understanding the design and architecture of ${analysis.rootPath.split("/").pop()}.

## Core Concepts

- [Architecture Overview](architecture.md) - System design and patterns
- [Key Concepts](concepts.md) - Fundamental ideas explained
- [Design Philosophy](philosophy.md) - Why things work this way

## Technical Deep Dives

${
      analysis.architecture.layers.map((layer) =>
        `- [${layer.name}](layers/${layer.name.toLowerCase().replace(/\s+/g, "-")}.md) - ${layer.purpose}`
      ).join("\n")
    }

## Design Decisions

- [Technology Choices](decisions/technology.md) - Why we chose these tools
- [Architecture Patterns](decisions/patterns.md) - Pattern selection rationale
- [Trade-offs](decisions/tradeoffs.md) - Compromises and their reasons

## Background Reading

- [Problem Domain](background/domain.md) - Understanding the problem space
- [Prior Art](background/prior-art.md) - Related projects and inspiration
- [Future Vision](background/roadmap.md) - Where we're heading

## FAQ

### Why ${analysis.architecture.pattern || "this architecture"}?

${this.generateArchitectureRationale(analysis)}

### How does it scale?

${this.generateScalingExplanation(analysis)}

### What are the limitations?

${this.generateLimitationsExplanation(analysis)}

## Further Reading

- [Architecture Diagram](architecture.md#diagram)
- [Performance Considerations](performance.md)
- [Security Model](security.md)
`;
  }

  private generateArchitectureExplanation(analysis: ProjectAnalysis): string {
    const { architecture } = analysis;

    return `# Architecture Overview

## ${architecture.pattern || "System"} Architecture

${analysis.rootPath.split("/").pop()} follows the **${architecture.pattern || "modular"}** architecture pattern.

## Architecture Diagram

\`\`\`mermaid
graph TB
    subgraph "External Layer"
        U[Users]
        E[External Systems]
    end
    
    ${
      architecture.layers.map((layer, i) => `
    subgraph "${layer.name}"
        ${
        layer.directories.map((dir, j) => `L${i}${j}[${dir.split("/").pop()}]`)
          .join("\n        ")
      }
    end`).join("\n    ")
    }
    
    U --> L00
    ${
      architecture.layers.map((_, i) => {
        if (i < architecture.layers.length - 1) {
          return `L${i}0 --> L${i + 1}0`;
        }
        return "";
      }).filter(Boolean).join("\n    ")
    }
\`\`\`

## Layers

${
      architecture.layers.map((layer) => `
### ${layer.name}

**Purpose**: ${layer.purpose}

**Components**:
${layer.directories.map((dir) => `- \`${dir}\` - ${this.inferDirectoryPurpose(dir.split("/").pop() || "")}`).join("\n")}

**Responsibilities**:
- ${this.generateLayerResponsibilities(layer.name).join("\n- ")}
`).join("\n")
    }

## Components

${
      architecture.components.slice(0, 5).map((component) => `
### ${component.name}

- **Type**: ${component.type}
- **Location**: \`${component.path}\`
- **Purpose**: ${this.inferComponentPurpose(component)}
`).join("\n")
    }

## Data Flow

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant Database
    
    Client->>API: Request
    API->>Service: Process
    Service->>Database: Query
    Database-->>Service: Data
    Service-->>API: Response
    API-->>Client: JSON
\`\`\`

## Design Principles

1. **Separation of Concerns** - Each layer has a specific responsibility
2. **Dependency Inversion** - Dependencies point inward
3. **Single Responsibility** - Each component does one thing well
4. **Open/Closed** - Open for extension, closed for modification

## Security Considerations

- Input validation at API boundaries
- Authentication/authorization in service layer
- Data encryption at rest and in transit
- Principle of least privilege for database access

## Scalability

The architecture supports horizontal scaling:

\`\`\`mermaid
graph LR
    LB[Load Balancer]
    LB --> API1[API Instance 1]
    LB --> API2[API Instance 2]
    LB --> API3[API Instance 3]
    
    API1 --> DB[(Database)]
    API2 --> DB
    API3 --> DB
    
    API1 --> Cache[(Cache)]
    API2 --> Cache
    API3 --> Cache
\`\`\`

## Further Reading

- [Design Decisions](../decisions/architecture.md)
- [Performance Tuning](../how-to/optimize-performance.md)
- [Security Best Practices](../reference/security.md)
`;
  }

  // Helper methods for generating content

  private getFileExtension(projectType: string): string {
    if (projectType.includes("typescript")) return "ts";
    if (projectType.includes("javascript")) return "js";
    if (projectType.includes("python")) return "py";
    if (projectType.includes("go")) return "go";
    return "txt";
  }

  private getLanguageForHighlight(projectType: ProjectType): string {
    if (projectType.includes("typescript")) return "typescript";
    if (projectType.includes("javascript")) return "javascript";
    if (projectType.includes("python")) return "python";
    if (projectType.includes("go")) return "go";
    return "text";
  }

  private generateInstallationInstructions(analysis: ProjectAnalysis): string {
    const { type } = analysis;

    if (type.includes("typescript") || type.includes("javascript")) {
      return `### Using npm
\`\`\`bash
npm install ${analysis.rootPath.split("/").pop()}
\`\`\`

### Using yarn
\`\`\`bash
yarn add ${analysis.rootPath.split("/").pop()}
\`\`\`

### Using Deno
\`\`\`typescript
import { } from "https://deno.land/x/${analysis.rootPath.split("/").pop()}/mod.ts";
\`\`\``;
    }

    if (type.includes("python")) {
      return `### Using pip
\`\`\`bash
pip install ${analysis.rootPath.split("/").pop()}
\`\`\`

### Using poetry
\`\`\`bash
poetry add ${analysis.rootPath.split("/").pop()}
\`\`\``;
    }

    if (type.includes("go")) {
      return `### Using go get
\`\`\`bash
go get github.com/user/${analysis.rootPath.split("/").pop()}
\`\`\``;
    }

    return `### Clone the repository
\`\`\`bash
git clone <repository-url>
cd ${analysis.rootPath.split("/").pop()}
\`\`\``;
  }

  private generateVerificationInstructions(analysis: ProjectAnalysis): string {
    const { type } = analysis;

    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`bash
node --version
npm --version
\`\`\`

You should see version numbers for both Node.js and npm.`;
    }

    if (type.includes("python")) {
      return `\`\`\`bash
python --version
pip --version
\`\`\`

You should see Python 3.8 or higher.`;
    }

    if (type.includes("go")) {
      return `\`\`\`bash
go version
\`\`\`

You should see Go 1.19 or higher.`;
    }

    return `Verify your installation by checking the version.`;
  }

  private generateExampleCode(analysis: ProjectAnalysis): string {
    const { type } = analysis;
    const projectName = analysis.rootPath.split("/").pop() || "project";

    if (type.includes("typescript")) {
      return `import { greet } from "${projectName}";

const message = greet("World");
console.log(message);`;
    }

    if (type.includes("javascript")) {
      return `const { greet } = require("${projectName}");

const message = greet("World");
console.log(message);`;
    }

    if (type.includes("python")) {
      return `from ${projectName} import greet

message = greet("World")
print(message)`;
    }

    if (type.includes("go")) {
      return `package main

import (
    "fmt"
    "${projectName}"
)

func main() {
    message := ${projectName}.Greet("World")
    fmt.Println(message)
}`;
    }

    return `// Example code for ${projectName}`;
  }

  private generateRunCommand(analysis: ProjectAnalysis): string {
    const { type } = analysis;
    const ext = this.getFileExtension(type);

    if (type.includes("typescript")) return `deno run example.${ext}`;
    if (type.includes("javascript")) return `node example.${ext}`;
    if (type.includes("python")) return `python example.${ext}`;
    if (type.includes("go")) return `go run example.${ext}`;

    return `# Run the example`;
  }

  private generateCodeExplanation(analysis: ProjectAnalysis): string {
    const { type } = analysis;

    if (type.includes("typescript") || type.includes("javascript")) {
      return `1. **Import statement** - We import the \`greet\` function from the library
2. **Function call** - We call \`greet\` with "World" as the argument
3. **Output** - The result is printed to the console`;
    }

    if (type.includes("python")) {
      return `1. **Import statement** - We import the \`greet\` function from the package
2. **Function call** - We call \`greet\` with "World" as the argument
3. **Output** - The result is printed using \`print()\``;
    }

    if (type.includes("go")) {
      return `1. **Package declaration** - Every Go file starts with a package declaration
2. **Import statements** - We import both \`fmt\` for printing and our package
3. **Main function** - The entry point of our program
4. **Function call** - We call the \`Greet\` function and print the result`;
    }

    return `The code demonstrates basic usage of the library.`;
  }

  private generateExercise1(analysis: ProjectAnalysis): string {
    if (analysis.type.includes("library")) {
      return "use a different greeting message";
    }
    return "change the output message";
  }

  private generateExercise2(analysis: ProjectAnalysis): string {
    if (analysis.type.includes("library")) {
      return "uses multiple functions from the library";
    }
    return "accepts user input";
  }

  private generateChallenge(analysis: ProjectAnalysis): string {
    if (analysis.apiEndpoints.length > 0) {
      return "Create a simple API client that calls one of the endpoints";
    }
    if (analysis.type.includes("library")) {
      return "Build a small application using the library";
    }
    return "Extend the example to handle errors gracefully";
  }

  private generateCommonProblem1(analysis: ProjectAnalysis): string {
    const { type } = analysis;

    if (type.includes("typescript")) return '"Cannot find module" error';
    if (type.includes("javascript")) return '"Module not found" error';
    if (type.includes("python")) return '"ImportError: No module named..."';
    if (type.includes("go")) return '"cannot find package"';

    return "Import or module error";
  }

  private generateCommonSolution1(analysis: ProjectAnalysis): string {
    const { type } = analysis;

    if (type.includes("typescript") || type.includes("javascript")) {
      return "Run `npm install` to install dependencies";
    }
    if (type.includes("python")) {
      return "Make sure you've activated your virtual environment and run `pip install -r requirements.txt`";
    }
    if (type.includes("go")) {
      return "Run `go mod download` to download dependencies";
    }

    return "Install the required dependencies";
  }

  private generateHowToList(analysis: ProjectAnalysis): string {
    const tasks = [
      "- [Set Up Development Environment](setup-dev.md)",
      "- [Run in Production](run-production.md)",
    ];

    if (analysis.apiEndpoints.length > 0) {
      tasks.push("- [Use the API](use-api.md)");
      tasks.push("- [Authenticate API Requests](api-auth.md)");
    }

    if (analysis.testFiles.length > 0) {
      tasks.push("- [Run Tests](run-tests.md)");
      tasks.push("- [Write New Tests](write-tests.md)");
    }

    if (analysis.configFiles.some((c) => c.type === "docker")) {
      tasks.push("- [Run with Docker](docker.md)");
    }

    tasks.push("- [Debug Common Issues](debug.md)");
    tasks.push("- [Optimize Performance](optimize.md)");

    return tasks.join("\n");
  }

  private generateTestingHowTo(analysis: ProjectAnalysis): string {
    const { type, testFiles } = analysis;

    return `# How to Run Tests

This guide shows you how to run the test suite for the project.

## Prerequisites

- Development environment set up
- Dependencies installed
- Test runner installed

## Running All Tests

${this.generateTestCommand(type)}

## Running Specific Tests

### Run a single test file

${this.generateSingleTestCommand(type)}

### Run tests matching a pattern

${this.generatePatternTestCommand(type)}

## Test Coverage

Generate a coverage report:

${this.generateCoverageCommand(type)}

## Writing Tests

### Test Structure

${this.generateTestStructure(type)}

### Best Practices

1. **Test one thing** - Each test should verify a single behavior
2. **Use descriptive names** - Test names should explain what they test
3. **Follow AAA** - Arrange, Act, Assert pattern
4. **Keep tests independent** - Tests shouldn't depend on each other
5. **Use test data** - Don't rely on production data

## Debugging Tests

### Run tests in debug mode

${this.generateDebugTestCommand(type)}

### Common Issues

**Tests fail locally but pass in CI**
- Check environment variables
- Verify test data setup
- Look for timing issues

**Tests are slow**
- Use test databases
- Mock external services
- Parallelize where possible

## Test Files

Found ${testFiles.length} test files:

${testFiles.slice(0, 5).map((file) => `- \`${file}\``).join("\n")}
${testFiles.length > 5 ? `\n...and ${testFiles.length - 5} more` : ""}

## Next Steps

- [Write New Tests](write-tests.md)
- [Test Best Practices](../reference/testing.md)
- [CI/CD Setup](cicd.md)
`;
  }

  private generateTestCommand(type: ProjectType): string {
    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`bash
# Using npm
npm test

# Using yarn
yarn test

# Using Deno
deno test
\`\`\``;
    }

    if (type.includes("python")) {
      return `\`\`\`bash
# Using pytest
pytest

# Using unittest
python -m unittest discover
\`\`\``;
    }

    if (type.includes("go")) {
      return `\`\`\`bash
go test ./...
\`\`\``;
    }

    return `\`\`\`bash
# Run your test command
make test
\`\`\``;
  }

  private generateSingleTestCommand(type: ProjectType): string {
    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`bash
npm test -- path/to/test.spec.js
\`\`\``;
    }

    if (type.includes("python")) {
      return `\`\`\`bash
pytest path/to/test_file.py
\`\`\``;
    }

    if (type.includes("go")) {
      return `\`\`\`bash
go test ./pkg/module
\`\`\``;
    }

    return `\`\`\`bash
# Run specific test
\`\`\``;
  }

  private generatePatternTestCommand(type: ProjectType): string {
    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`bash
npm test -- --grep "should handle errors"
\`\`\``;
    }

    if (type.includes("python")) {
      return `\`\`\`bash
pytest -k "test_error_handling"
\`\`\``;
    }

    if (type.includes("go")) {
      return `\`\`\`bash
go test ./... -run TestErrorHandling
\`\`\``;
    }

    return `\`\`\`bash
# Run tests matching pattern
\`\`\``;
  }

  private generateCoverageCommand(type: ProjectType): string {
    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`bash
npm test -- --coverage
\`\`\``;
    }

    if (type.includes("python")) {
      return `\`\`\`bash
pytest --cov=. --cov-report=html
\`\`\``;
    }

    if (type.includes("go")) {
      return `\`\`\`bash
go test ./... -cover
\`\`\``;
    }

    return `\`\`\`bash
# Generate coverage report
\`\`\``;
  }

  private generateTestStructure(type: ProjectType): string {
    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`javascript
describe('Component', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = component.doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
\`\`\``;
    }

    if (type.includes("python")) {
      return `\`\`\`python
def test_component_does_something():
    # Arrange
    input_data = 'test'
    
    # Act
    result = component.do_something(input_data)
    
    # Assert
    assert result == 'expected'
\`\`\``;
    }

    if (type.includes("go")) {
      return `\`\`\`go
func TestComponentDoesSomething(t *testing.T) {
    // Arrange
    input := "test"
    
    // Act
    result := component.DoSomething(input)
    
    // Assert
    if result != "expected" {
        t.Errorf("expected %s, got %s", "expected", result)
    }
}
\`\`\``;
    }

    return `Structure your tests clearly`;
  }

  private generateDebugTestCommand(type: ProjectType): string {
    if (type.includes("typescript") || type.includes("javascript")) {
      return `\`\`\`bash
# Using VS Code debugger
# Add breakpoint and run "Debug: Jest Current File"

# Using node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
\`\`\``;
    }

    if (type.includes("python")) {
      return `\`\`\`bash
# Using pytest with pdb
pytest --pdb

# Using VS Code debugger
# Set breakpoints and run "Python: Debug Test"
\`\`\``;
    }

    if (type.includes("go")) {
      return `\`\`\`bash
# Using dlv
dlv test ./pkg/module

# Using VS Code debugger
# Set breakpoints and run "Go: Debug Test"
\`\`\``;
    }

    return `Use your debugger to step through tests`;
  }

  private inferDirectoryPurpose(dirName: string): string {
    const purposes: Record<string, string> = {
      "src": "Source code",
      "lib": "Library code",
      "test": "Test files",
      "tests": "Test files",
      "docs": "Documentation",
      "api": "API endpoints",
      "models": "Data models",
      "controllers": "Request handlers",
      "services": "Business logic",
      "utils": "Utility functions",
      "config": "Configuration",
      "public": "Static assets",
      "scripts": "Build scripts",
    };

    return purposes[dirName.toLowerCase()] || "Project files";
  }

  private inferComponentPurpose(
    component: { name: string; type: string },
  ): string {
    const { name, type } = component;

    const purposes: Record<string, string> = {
      "component": "UI component for rendering",
      "module": "Self-contained feature module",
      "service": "Business logic service",
      "controller": "HTTP request handler",
      "model": "Data model definition",
      "utility": "Shared utility functions",
      "middleware": "Request/response processor",
    };

    return purposes[type] || `${type} for ${name}`;
  }

  private generateLayerResponsibilities(layerName: string): string[] {
    const responsibilities: Record<string, string[]> = {
      "Presentation": [
        "Handle HTTP requests and responses",
        "Validate input data",
        "Transform data for clients",
        "Implement API versioning",
      ],
      "Business Logic": [
        "Implement core business rules",
        "Orchestrate workflows",
        "Handle business validation",
        "Manage transactions",
      ],
      "Domain Models": [
        "Define data structures",
        "Implement domain logic",
        "Enforce invariants",
        "Provide domain services",
      ],
      "Data Access": [
        "Interact with databases",
        "Implement repositories",
        "Handle data persistence",
        "Manage connections",
      ],
      "Middleware": [
        "Handle authentication",
        "Log requests",
        "Manage errors",
        "Implement rate limiting",
      ],
    };

    return responsibilities[layerName] || [
      "Handle layer-specific concerns",
      "Maintain separation of concerns",
      "Provide clean interfaces",
    ];
  }

  private generateArchitectureRationale(analysis: ProjectAnalysis): string {
    const { architecture } = analysis;

    if (architecture.pattern === "Clean Architecture") {
      return "Clean Architecture was chosen to maintain strict separation between business logic and infrastructure concerns, making the code more testable and maintainable.";
    }

    if (architecture.pattern === "MVC") {
      return "MVC provides a well-understood pattern that separates presentation, business logic, and data management, making it easier for teams to collaborate.";
    }

    if (architecture.pattern === "Microservices") {
      return "Microservices architecture allows independent deployment and scaling of different parts of the system, improving resilience and development velocity.";
    }

    return "This architecture provides clear separation of concerns and makes the codebase easier to understand and maintain.";
  }

  private generateScalingExplanation(analysis: ProjectAnalysis): string {
    if (analysis.architecture.pattern === "Microservices") {
      return "Each service can be scaled independently based on its specific load patterns. Services communicate asynchronously through message queues for better resilience.";
    }

    return "The application can be horizontally scaled by running multiple instances behind a load balancer. Stateless design ensures any instance can handle any request.";
  }

  private generateLimitationsExplanation(_analysis: ProjectAnalysis): string {
    return `Current limitations include:

- Database connections are limited by the connection pool size
- File uploads are limited to 10MB by default
- API rate limiting may affect high-volume clients
- Some operations are not yet optimized for large datasets

These limitations are documented in the [Performance Guide](../reference/performance.md).`;
  }

  private generateArchitectureDiagrams(
    options: GenerationOptions,
  ): GeneratedDoc[] {
    const docs: GeneratedDoc[] = [];
    const { projectAnalysis: _projectAnalysis } = options;

    // System overview diagram
    const systemDiagram = `# System Architecture Diagrams

## High-Level Overview

\`\`\`mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App]
        MOB[Mobile App]
        API_CLIENT[API Clients]
    end
    
    subgraph "Application Layer"
        LB[Load Balancer]
        APP1[App Server 1]
        APP2[App Server 2]
        APP3[App Server 3]
    end
    
    subgraph "Data Layer"
        CACHE[(Redis Cache)]
        DB[(Primary DB)]
        DB_R[(Read Replica)]
    end
    
    WEB --> LB
    MOB --> LB
    API_CLIENT --> LB
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> CACHE
    APP2 --> CACHE
    APP3 --> CACHE
    
    APP1 --> DB
    APP2 --> DB
    APP3 --> DB
    
    APP1 -.-> DB_R
    APP2 -.-> DB_R
    APP3 -.-> DB_R
\`\`\`

## Component Diagram

\`\`\`mermaid
graph LR
    subgraph "Frontend"
        UI[UI Components]
        STATE[State Management]
        API_SDK[API SDK]
    end
    
    subgraph "Backend"
        ROUTER[Router]
        AUTH[Auth Service]
        BIZ[Business Logic]
        DAL[Data Access Layer]
    end
    
    subgraph "External"
        AUTH_PROVIDER[Auth Provider]
        PAYMENT[Payment Gateway]
        EMAIL[Email Service]
    end
    
    UI --> STATE
    STATE --> API_SDK
    API_SDK --> ROUTER
    
    ROUTER --> AUTH
    ROUTER --> BIZ
    
    AUTH --> AUTH_PROVIDER
    BIZ --> DAL
    BIZ --> PAYMENT
    BIZ --> EMAIL
\`\`\`

## Deployment Diagram

\`\`\`mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "Public Subnet"
            ALB[Application Load Balancer]
            NAT[NAT Gateway]
        end
        
        subgraph "Private Subnet 1"
            EC2_1[EC2 Instance]
            EC2_2[EC2 Instance]
        end
        
        subgraph "Private Subnet 2"
            EC2_3[EC2 Instance]
            EC2_4[EC2 Instance]
        end
        
        subgraph "Data Subnet"
            RDS[(RDS PostgreSQL)]
            REDIS[(ElastiCache Redis)]
        end
    end
    
    subgraph "CDN"
        CF[CloudFront]
        S3[S3 Bucket]
    end
    
    USERS[Users] --> CF
    CF --> ALB
    CF --> S3
    
    ALB --> EC2_1
    ALB --> EC2_2
    ALB --> EC2_3
    ALB --> EC2_4
    
    EC2_1 --> RDS
    EC2_2 --> RDS
    EC2_3 --> RDS
    EC2_4 --> RDS
    
    EC2_1 --> REDIS
    EC2_2 --> REDIS
    EC2_3 --> REDIS
    EC2_4 --> REDIS
\`\`\`
`;

    docs.push({
      path: join(normalize(options.outputPath), "architecture", "diagrams.md"),
      content: systemDiagram,
      type: "diagram",
    });

    return docs;
  }

  // Additional standard-specific generators

  private generateGoogleStyleDocs(
    _options: GenerationOptions,
  ): GeneratedDoc[] {
    // Google style focuses on: Overview, Guides, Reference, Resources
    const docs: GeneratedDoc[] = [];

    // Similar structure but with Google's conventions
    // Implementation would follow Google's documentation style guide

    return docs;
  }

  private generateMicrosoftStyleDocs(
    _options: GenerationOptions,
  ): GeneratedDoc[] {
    // Microsoft style focuses on: Quickstarts, Tutorials, How-to, Reference, Resources
    const docs: GeneratedDoc[] = [];

    // Implementation would follow Microsoft's documentation conventions

    return docs;
  }

  private generateReadmeFirstDocs(
    _options: GenerationOptions,
  ): GeneratedDoc[] {
    // Focuses on a comprehensive README with linked detailed docs
    const docs: GeneratedDoc[] = [];

    // Everything starts from README

    return docs;
  }

  private generateApiFirstDocs(
    _options: GenerationOptions,
  ): GeneratedDoc[] {
    // Focuses on API documentation with OpenAPI/Swagger
    const docs: GeneratedDoc[] = [];

    // API-centric documentation

    return docs;
  }
}
