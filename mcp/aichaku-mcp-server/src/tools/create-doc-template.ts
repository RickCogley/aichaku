/**
 * Create Documentation Template Tool
 *
 * MCP tool for creating specific documentation templates
 */

import { feedbackSystem } from "../feedback/feedback-system.ts";
import { safeWriteTextFileSync, validatePath } from "../utils/path-security.ts";
import { existsSync } from "@std/fs/exists";
import { ensureDir } from "@std/fs/ensure-dir";
import { dirname, resolve } from "@std/path";

export interface CreateDocTemplateArgs {
  outputPath: string;
  templateType: TemplateType;
  title?: string;
  projectName?: string;
  customFields?: Record<string, string>;
}

export type TemplateType =
  | "tutorial"
  | "how-to"
  | "reference"
  | "explanation"
  | "api"
  | "architecture"
  | "contributing"
  | "changelog"
  | "security"
  | "readme";

export interface CreateDocTemplateResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

const TEMPLATES: Record<TemplateType, (args: CreateDocTemplateArgs) => string> =
  {
    tutorial: createTutorialTemplate,
    "how-to": createHowToTemplate,
    reference: createReferenceTemplate,
    explanation: createExplanationTemplate,
    api: createApiTemplate,
    architecture: createArchitectureTemplate,
    contributing: createContributingTemplate,
    changelog: createChangelogTemplate,
    security: createSecurityTemplate,
    readme: createReadmeTemplate,
  };

export const createDocTemplateTool = {
  name: "create_doc_template",
  description:
    "Create a documentation template file for tutorials, how-tos, references, etc.",
  inputSchema: {
    type: "object",
    properties: {
      outputPath: {
        type: "string",
        description: "Path where the template file should be created",
      },
      templateType: {
        type: "string",
        enum: Object.keys(TEMPLATES),
        description: "Type of documentation template to create",
      },
      title: {
        type: "string",
        description: "Title for the document",
      },
      projectName: {
        type: "string",
        description: "Name of the project (used in templates)",
      },
      customFields: {
        type: "object",
        description: "Custom fields to replace in the template",
        additionalProperties: { type: "string" },
      },
    },
    required: ["outputPath", "templateType"],
  },

  async execute(args: CreateDocTemplateArgs): Promise<CreateDocTemplateResult> {
    const operationId = feedbackSystem.startOperation(
      "create_doc_template",
      args as unknown as Record<string, unknown>,
    );

    try {
      // Validate output path
      const resolvedPath = resolve(args.outputPath);
      try {
        validatePath(resolvedPath, Deno.cwd());
      } catch (error) {
        throw new Error(
          `Invalid output path: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      // Ensure directory exists
      const dir = dirname(resolvedPath);
      await ensureDir(dir);

      // Check if file already exists
      if (existsSync(resolvedPath) && !resolvedPath.endsWith(".md")) {
        throw new Error(
          `Path exists and is not a markdown file: ${resolvedPath}`,
        );
      }

      feedbackSystem.updateProgress(
        operationId,
        "creating",
        `Creating ${args.templateType} template...`,
      );

      // Generate template content
      const templateGenerator = TEMPLATES[args.templateType];
      if (!templateGenerator) {
        throw new Error(`Unknown template type: ${args.templateType}`);
      }

      let content = templateGenerator(args);

      // Replace custom fields if provided
      if (args.customFields) {
        for (const [key, value] of Object.entries(args.customFields)) {
          content = content.replace(new RegExp(`{${key}}`, "g"), value);
        }
      }

      // Write the template file
      safeWriteTextFileSync(resolvedPath, content, Deno.cwd());

      feedbackSystem.completeOperation(operationId, {
        file: resolvedPath,
        findings: [],
        summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        },
        filePath: resolvedPath,
        templateType: args.templateType,
      });

      return {
        success: true,
        filePath: resolvedPath,
        content,
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      feedbackSystem.reportError(operationId, new Error(errorMessage));

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

// Template generation functions

function createTutorialTemplate(args: CreateDocTemplateArgs): string {
  const title = args.title || "Getting Started";
  const projectName = args.projectName || "Project";

  return `# Tutorial: ${title}

## Overview

This tutorial will guide you through the basics of using ${projectName}.

## Prerequisites

Before starting this tutorial, you should have:

- [ ] ${projectName} installed
- [ ] Basic knowledge of [relevant technology]
- [ ] A development environment set up

## Learning Objectives

By the end of this tutorial, you will:

1. Understand the core concepts of ${projectName}
2. Be able to create a basic example
3. Know how to run and test your code

## Step 1: Setting Up

First, let's set up our project:

\`\`\`bash
# Create a new directory
mkdir my-${projectName.toLowerCase()}-project
cd my-${projectName.toLowerCase()}-project

# Initialize the project
[initialization command]
\`\`\`

### What's happening here?

[Explain what each command does]

## Step 2: Creating Your First Example

Now let's create a simple example:

\`\`\`[language]
// example.[ext]
[code example]
\`\`\`

### Understanding the code

Let's break down what this code does:

- **Line 1**: [Explanation]
- **Line 2-3**: [Explanation]
- **Line 4**: [Explanation]

## Step 3: Running the Example

To run our example:

\`\`\`bash
[run command]
\`\`\`

You should see:

\`\`\`
[expected output]
\`\`\`

## Step 4: Modifying the Example

Now try modifying the example:

1. [First modification task]
2. [Second modification task]

<details>
<summary>Solution</summary>

\`\`\`[language]
[solution code]
\`\`\`

</details>

## Common Issues

### Issue: [Common problem]

**Solution**: [How to fix it]

### Issue: [Another problem]

**Solution**: [How to fix it]

## Summary

In this tutorial, you learned:

- ✅ How to set up ${projectName}
- ✅ How to create a basic example
- ✅ How to run and test your code

## Next Steps

Now that you've completed this tutorial:

- Try the [Next Tutorial Name](next-tutorial.md)
- Explore the [How-to Guides](../how-to/index.md)
- Read about [Core Concepts](../explanation/concepts.md)

## Additional Resources

- [Official Documentation](https://example.com/docs)
- [Community Forum](https://example.com/forum)
- [Example Repository](https://github.com/example/repo)
`;
}

function createHowToTemplate(args: CreateDocTemplateArgs): string {
  const title = args.title || "Perform a Specific Task";
  const projectName = args.projectName || "Project";

  return `# How to ${title}

## Goal

This guide shows you how to ${title.toLowerCase()} in ${projectName}.

## Prerequisites

Before you begin, ensure you have:

- [ ] ${projectName} version X.X or higher
- [ ] [Specific requirement]
- [ ] [Another requirement]

## Steps

### 1. Prepare Your Environment

First, ensure your environment is ready:

\`\`\`bash
# Check version
[version command]

# Verify requirements
[verification command]
\`\`\`

### 2. [First Main Step]

[Explanation of what this step does]

\`\`\`[language]
[code for step 1]
\`\`\`

**Important**: [Any warnings or important notes]

### 3. [Second Main Step]

[Explanation of what this step does]

\`\`\`[language]
[code for step 2]
\`\`\`

### 4. Verify the Result

To confirm everything worked:

\`\`\`bash
[verification command]
\`\`\`

You should see:

\`\`\`
[expected output]
\`\`\`

## Configuration Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| \`--option1\` | Description | \`default\` | \`example\` |
| \`--option2\` | Description | \`default\` | \`example\` |

## Troubleshooting

### Problem: [Common issue]

**Symptoms**: [What user sees]

**Solution**: 
1. [First step to fix]
2. [Second step to fix]

### Problem: [Another issue]

**Symptoms**: [What user sees]

**Solution**: [How to fix]

## Advanced Usage

### Using with [Feature]

\`\`\`[language]
[advanced example]
\`\`\`

### Automation

To automate this process:

\`\`\`bash
[automation script]
\`\`\`

## Related Guides

- [Related How-to 1](related-1.md)
- [Related How-to 2](related-2.md)
- [Troubleshooting Guide](../troubleshooting.md)

## See Also

- [Reference Documentation](../reference/feature.md)
- [Conceptual Overview](../explanation/concept.md)
`;
}

function createReferenceTemplate(args: CreateDocTemplateArgs): string {
  const title = args.title || "Component Name";

  return `# ${title} Reference

## Overview

[Brief description of what this component/module/class does]

## Synopsis

\`\`\`[language]
[Basic usage example]
\`\`\`

## Description

[Detailed description of the component, its purpose, and when to use it]

## API Reference

### Constructor / Initialization

\`\`\`[language]
[Constructor signature]
\`\`\`

**Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| \`param1\` | \`type\` | Yes | Description | - |
| \`param2\` | \`type\` | No | Description | \`default\` |

### Methods

#### \`methodName(param1, param2)\`

[Description of what the method does]

**Parameters:**

- \`param1\` (\`type\`): Description
- \`param2\` (\`type\`, optional): Description

**Returns:** \`ReturnType\` - Description of return value

**Throws:**

- \`ErrorType\`: When this error occurs
- \`AnotherError\`: When this error occurs

**Example:**

\`\`\`[language]
[Example usage]
\`\`\`

### Properties

#### \`propertyName\`

- **Type**: \`type\`
- **Access**: read-only | read-write
- **Description**: What this property represents

### Events

#### \`eventName\`

Fired when [condition].

**Event Data:**

\`\`\`[language]
{
  property1: value,
  property2: value
}
\`\`\`

## Examples

### Basic Usage

\`\`\`[language]
[Complete basic example]
\`\`\`

### Advanced Usage

\`\`\`[language]
[More complex example]
\`\`\`

### Error Handling

\`\`\`[language]
[Example with error handling]
\`\`\`

## Configuration

### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| \`option1\` | \`type\` | Description | \`default\` |
| \`option2\` | \`type\` | Description | \`default\` |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`ENV_VAR_1\` | Description | \`default\` |
| \`ENV_VAR_2\` | Description | \`default\` |

## Best Practices

1. [Best practice 1]
2. [Best practice 2]
3. [Best practice 3]

## Performance Considerations

- [Performance tip 1]
- [Performance tip 2]

## Security Considerations

- [Security consideration 1]
- [Security consideration 2]

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history.

## See Also

- [Related Component](related.md)
- [Tutorial](../tutorials/using-component.md)
- [Conceptual Guide](../explanation/concept.md)
`;
}

function createExplanationTemplate(args: CreateDocTemplateArgs): string {
  const title = args.title || "Concept Name";
  const projectName = args.projectName || "Project";

  return `# Understanding ${title}

## Introduction

[High-level introduction to the concept and why it matters in ${projectName}]

## Background

[Historical context or background information that helps understand why this concept exists]

## Core Concepts

### [Subconcept 1]

[Detailed explanation of the first key aspect]

\`\`\`mermaid
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
\`\`\`

### [Subconcept 2]

[Detailed explanation of the second key aspect]

### [Subconcept 3]

[Detailed explanation of the third key aspect]

## How It Works

[Step-by-step explanation of how the concept works in practice]

1. **Step 1**: [What happens first]
2. **Step 2**: [What happens next]
3. **Step 3**: [Final step]

### Example Scenario

Let's walk through a concrete example:

[Describe a real-world scenario]

\`\`\`[language]
// Example code demonstrating the concept
[code example]
\`\`\`

## Design Decisions

### Why [Decision 1]?

**Context**: [What problem needed solving]

**Considered Options**:
1. [Option 1] - Pros and cons
2. [Option 2] - Pros and cons
3. [Option 3] - Pros and cons

**Decision**: We chose [option] because [reasoning]

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| Current approach | [Advantages] | [Disadvantages] |
| Alternative 1 | [Advantages] | [Disadvantages] |
| Alternative 2 | [Advantages] | [Disadvantages] |

## Common Misconceptions

### Misconception 1: [Statement]

**Reality**: [Correct understanding]

**Why this matters**: [Implications]

### Misconception 2: [Statement]

**Reality**: [Correct understanding]

## Comparison with Similar Concepts

### ${title} vs [Similar Concept]

| Aspect | ${title} | [Similar Concept] |
|--------|----------|-------------------|
| Purpose | [Description] | [Description] |
| Use Case | [When to use] | [When to use] |
| Performance | [Characteristics] | [Characteristics] |

## Real-World Applications

1. **[Application 1]**: [How it's used]
2. **[Application 2]**: [How it's used]
3. **[Application 3]**: [How it's used]

## Further Reading

### Internal Resources

- [Tutorial: Getting Started with ${title}](../tutorials/getting-started.md)
- [How-to: Implement ${title}](../how-to/implement-concept.md)
- [Reference: ${title} API](../reference/api.md)

### External Resources

- [Academic Paper](https://example.com/paper)
- [Blog Post](https://example.com/blog)
- [Video Tutorial](https://example.com/video)

## Summary

Key takeaways:

- ${title} is [one-sentence summary]
- It's useful when [use case]
- The main benefits are [benefits]
- The main limitations are [limitations]

## Questions for Reflection

1. How does ${title} apply to your use case?
2. What trade-offs are most important for your project?
3. How might ${title} evolve in the future?
`;
}

function createApiTemplate(args: CreateDocTemplateArgs): string {
  const title = args.title || "API";
  const projectName = args.projectName || "Project";

  return `# ${projectName} ${title} Reference

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication

${projectName} uses [authentication method] for API authentication.

### Getting an API Key

1. Sign up at [https://example.com/signup](https://example.com/signup)
2. Navigate to API Keys in your dashboard
3. Generate a new API key

### Using the API Key

Include your API key in the request headers:

\`\`\`http
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Rate Limiting

- **Rate Limit**: 1000 requests per hour
- **Rate Limit Headers**:
  - \`X-RateLimit-Limit\`: Maximum requests per hour
  - \`X-RateLimit-Remaining\`: Requests remaining
  - \`X-RateLimit-Reset\`: Unix timestamp when limit resets

## Endpoints

### GET /endpoint

[Description of what this endpoint does]

#### Request

\`\`\`http
GET /endpoint HTTP/1.1
Host: api.example.com
Authorization: Bearer YOUR_API_KEY
\`\`\`

#### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| \`param1\` | string | No | Description | \`value\` |
| \`param2\` | integer | No | Description | \`123\` |

#### Response

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": {
    "id": "123",
    "name": "Example",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| \`status\` | string | Request status |
| \`data\` | object | Response data |
| \`data.id\` | string | Unique identifier |
| \`data.name\` | string | Name field |
| \`data.created_at\` | string | ISO 8601 timestamp |

### POST /endpoint

[Description of what this endpoint does]

#### Request

\`\`\`http
POST /endpoint HTTP/1.1
Host: api.example.com
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Example",
  "type": "sample"
}
\`\`\`

#### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| \`name\` | string | Yes | Name field | \`"Example"\` |
| \`type\` | string | No | Type field | \`"sample"\` |

#### Response

\`\`\`http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "data": {
    "id": "124",
    "name": "Example",
    "type": "sample",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

## Error Responses

### Error Format

\`\`\`json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
\`\`\`

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| \`INVALID_REQUEST\` | 400 | Request validation failed |
| \`UNAUTHORIZED\` | 401 | Missing or invalid API key |
| \`FORBIDDEN\` | 403 | Access denied |
| \`NOT_FOUND\` | 404 | Resource not found |
| \`RATE_LIMITED\` | 429 | Too many requests |
| \`SERVER_ERROR\` | 500 | Internal server error |

## Pagination

List endpoints support pagination:

\`\`\`http
GET /endpoint?page=2&limit=50
\`\`\`

### Pagination Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| \`page\` | integer | 1 | - | Page number |
| \`limit\` | integer | 20 | 100 | Items per page |

### Pagination Response

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 500,
    "pages": 10,
    "next": "/endpoint?page=3&limit=50",
    "prev": "/endpoint?page=1&limit=50"
  }
}
\`\`\`

## Webhooks

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| \`resource.created\` | Resource was created | [Payload structure] |
| \`resource.updated\` | Resource was updated | [Payload structure] |
| \`resource.deleted\` | Resource was deleted | [Payload structure] |

### Webhook Security

Webhooks are signed using HMAC-SHA256. Verify the signature:

\`\`\`[language]
[Signature verification example]
\`\`\`

## SDKs and Libraries

Official SDKs:

- [JavaScript/TypeScript](https://github.com/example/js-sdk)
- [Python](https://github.com/example/python-sdk)
- [Go](https://github.com/example/go-sdk)

## Code Examples

### JavaScript

\`\`\`javascript
const client = new APIClient('YOUR_API_KEY');

// Get resource
const resource = await client.getResource('123');

// Create resource
const newResource = await client.createResource({
  name: 'Example',
  type: 'sample'
});
\`\`\`

### Python

\`\`\`python
client = APIClient('YOUR_API_KEY')

# Get resource
resource = client.get_resource('123')

# Create resource
new_resource = client.create_resource(
    name='Example',
    type='sample'
)
\`\`\`

### cURL

\`\`\`bash
# Get resource
curl -X GET https://api.example.com/v1/endpoint/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Create resource
curl -X POST https://api.example.com/v1/endpoint \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Example", "type": "sample"}'
\`\`\`

## Changelog

### Version 1.1.0 (2024-01-15)
- Added pagination support
- New webhook events
- Improved error messages

### Version 1.0.0 (2024-01-01)
- Initial API release

## Support

- Email: api-support@example.com
- Documentation: https://docs.example.com
- Status Page: https://status.example.com
`;
}

function createArchitectureTemplate(args: CreateDocTemplateArgs): string {
  const title = args.title || "System Architecture";
  const projectName = args.projectName || "Project";

  return `# ${projectName} ${title}

## Overview

[High-level description of the system architecture]

## Architecture Principles

1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

## System Components

\`\`\`mermaid
graph TB
    subgraph "Frontend"
        UI[User Interface]
        PWA[Progressive Web App]
    end
    
    subgraph "API Gateway"
        GW[API Gateway]
        AUTH[Auth Service]
    end
    
    subgraph "Services"
        SVC1[Service 1]
        SVC2[Service 2]
        SVC3[Service 3]
    end
    
    subgraph "Data Layer"
        DB[(Primary Database)]
        CACHE[(Cache)]
        QUEUE[Message Queue]
    end
    
    UI --> GW
    PWA --> GW
    GW --> AUTH
    GW --> SVC1
    GW --> SVC2
    GW --> SVC3
    SVC1 --> DB
    SVC2 --> DB
    SVC3 --> QUEUE
    SVC1 --> CACHE
\`\`\`

## Component Details

### Frontend Layer

**Technologies**: [List technologies]

**Responsibilities**:
- User interface rendering
- State management
- API communication

**Key Design Decisions**:
- [Decision 1]
- [Decision 2]

### API Gateway

**Technologies**: [List technologies]

**Responsibilities**:
- Request routing
- Authentication/authorization
- Rate limiting
- Request/response transformation

### Service Layer

#### Service 1: [Name]

**Purpose**: [What this service does]

**Technologies**: [List technologies]

**API Endpoints**:
- \`GET /api/v1/resource\`
- \`POST /api/v1/resource\`

**Dependencies**:
- Database
- Cache
- [Other services]

### Data Layer

#### Primary Database

**Type**: [Database type]

**Schema Design**:

\`\`\`mermaid
erDiagram
    User ||--o{ Order : places
    User {
        string id
        string email
        string name
        datetime created_at
    }
    Order ||--|{ OrderItem : contains
    Order {
        string id
        string user_id
        decimal total
        string status
        datetime created_at
    }
    OrderItem {
        string id
        string order_id
        string product_id
        int quantity
        decimal price
    }
\`\`\`

## Data Flow

### Request Flow

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant Service
    participant Database
    
    Client->>Gateway: Request
    Gateway->>Auth: Validate Token
    Auth-->>Gateway: Token Valid
    Gateway->>Service: Forward Request
    Service->>Database: Query Data
    Database-->>Service: Return Data
    Service-->>Gateway: Response
    Gateway-->>Client: Response
\`\`\`

## Deployment Architecture

\`\`\`mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Region 1"
            LB1[Load Balancer]
            APP1[App Instances]
            DB1[(Database Primary)]
        end
        
        subgraph "Region 2"
            LB2[Load Balancer]
            APP2[App Instances]
            DB2[(Database Replica)]
        end
        
        CDN[CDN]
        DNS[DNS]
    end
    
    Users --> DNS
    DNS --> CDN
    CDN --> LB1
    CDN --> LB2
    LB1 --> APP1
    LB2 --> APP2
    APP1 --> DB1
    APP2 --> DB2
    DB1 -.-> DB2
\`\`\`

## Security Architecture

### Security Layers

1. **Network Security**
   - Firewall rules
   - VPC isolation
   - DDoS protection

2. **Application Security**
   - Input validation
   - Output encoding
   - CSRF protection

3. **Data Security**
   - Encryption at rest
   - Encryption in transit
   - Key management

### Authentication & Authorization

\`\`\`mermaid
graph LR
    User --> Login
    Login --> IDP[Identity Provider]
    IDP --> Token[JWT Token]
    Token --> API
    API --> Validate
    Validate --> Authorize
    Authorize --> Resource
\`\`\`

## Scalability Strategies

### Horizontal Scaling

- Application servers: Auto-scaling groups
- Database: Read replicas
- Caching: Distributed cache

### Vertical Scaling

- Database: Increase instance size
- Compute: GPU instances for ML workloads

## Performance Optimization

1. **Caching Strategy**
   - CDN for static assets
   - Redis for session data
   - Database query caching

2. **Database Optimization**
   - Indexing strategy
   - Query optimization
   - Connection pooling

## Monitoring and Observability

### Metrics

- Application metrics
- Infrastructure metrics
- Business metrics

### Logging

- Centralized logging
- Log aggregation
- Log analysis

### Tracing

- Distributed tracing
- Performance profiling

## Disaster Recovery

### Backup Strategy

- Database: Daily backups, 30-day retention
- Files: Object storage with versioning
- Configuration: Git repository

### Recovery Procedures

1. **RTO**: 4 hours
2. **RPO**: 1 hour

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | [Technology] | [Purpose] |
| Backend | [Technology] | [Purpose] |
| Database | [Technology] | [Purpose] |
| Cache | [Technology] | [Purpose] |
| Queue | [Technology] | [Purpose] |
| Monitoring | [Technology] | [Purpose] |

## Future Considerations

1. **[Consideration 1]**: [Description]
2. **[Consideration 2]**: [Description]
3. **[Consideration 3]**: [Description]

## References

- [Architecture Decision Records](adr/)
- [Security Documentation](security.md)
- [Operations Runbook](runbook.md)
`;
}

function createContributingTemplate(args: CreateDocTemplateArgs): string {
  const projectName = args.projectName || "Project";

  return `# Contributing to ${projectName}

Thank you for your interest in contributing to ${projectName}! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**How to Submit a Good Bug Report:**

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the problem
3. Provide specific examples
4. Describe the behavior you observed and expected
5. Include screenshots if applicable
6. Include system information

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**How to Submit a Good Enhancement Suggestion:**

1. Use a clear and descriptive title
2. Provide a detailed description of the proposed feature
3. Explain why this enhancement would be useful
4. List any alternative solutions you've considered

### Pull Requests

1. Fork the repository
2. Create a new branch from \`main\`
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

## Development Setup

### Prerequisites

- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

### Setup Steps

1. Clone your fork:
   \`\`\`bash
   git clone https://github.com/your-username/${projectName.toLowerCase()}.git
   cd ${projectName.toLowerCase()}
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   [install command]
   \`\`\`

3. Set up development environment:
   \`\`\`bash
   [setup command]
   \`\`\`

4. Run tests:
   \`\`\`bash
   [test command]
   \`\`\`

## Development Workflow

### 1. Create a Branch

\`\`\`bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
\`\`\`

### 2. Make Changes

- Write clear, concise commit messages
- Follow the coding style guide
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`bash
# Features
git commit -m "feat: add new feature"

# Bug fixes
git commit -m "fix: resolve issue with X"

# Documentation
git commit -m "docs: update installation guide"
\`\`\`

### 4. Push Changes

\`\`\`bash
git push origin feature/your-feature-name
\`\`\`

### 5. Create Pull Request

1. Go to the repository on GitHub
2. Click "New pull request"
3. Select your branch
4. Fill in the PR template
5. Submit the PR

## Coding Standards

### Style Guide

- [Language-specific style guide]
- Use consistent naming conventions
- Write self-documenting code
- Add comments for complex logic

### Code Quality

- Write unit tests for new code
- Maintain test coverage above X%
- Run linters before committing
- No commented-out code

### Documentation

- Update README.md if needed
- Add JSDoc/docstrings for public APIs
- Update changelog
- Include examples for new features

## Testing

### Running Tests

\`\`\`bash
# Run all tests
[test command]

# Run specific test
[specific test command]

# Run with coverage
[coverage command]
\`\`\`

### Writing Tests

- Follow the AAA pattern (Arrange, Act, Assert)
- Test edge cases
- Use descriptive test names
- Mock external dependencies

## Pull Request Process

1. **Before Submitting**
   - [ ] Tests pass locally
   - [ ] Code follows style guide
   - [ ] Documentation is updated
   - [ ] Commit messages follow convention

2. **PR Description**
   - Describe what changes were made
   - Explain why changes were needed
   - Reference related issues
   - Include screenshots for UI changes

3. **Review Process**
   - Address reviewer feedback
   - Make requested changes
   - Keep PR updated with main branch

4. **After Merge**
   - Delete your feature branch
   - Update your local main branch

## Release Process

1. Features are merged to \`main\`
2. Releases are tagged with semantic versioning
3. Changelog is automatically generated
4. Release notes are published

## Getting Help

- Read the [documentation](docs/)
- Check [existing issues](https://github.com/org/repo/issues)
- Ask in [discussions](https://github.com/org/repo/discussions)
- Contact maintainers at [email]

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project website

Thank you for contributing to ${projectName}!
`;
}

function createChangelogTemplate(args: CreateDocTemplateArgs): string {
  const projectName = args.projectName || "Project";

  return `# Changelog

All notable changes to ${projectName} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features that have been added

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security fixes and improvements

## [1.0.0] - ${new Date().toISOString().split("T")[0]}

### Added
- Initial release of ${projectName}
- Core functionality implementation
- Documentation and examples
- Test suite

### Security
- Security audit completed
- Dependencies updated to latest versions

## [0.2.0] - YYYY-MM-DD

### Added
- Feature X with Y capability
- Support for Z configuration

### Changed
- Improved performance of A by 50%
- Updated B to use new C API

### Fixed
- Fixed issue where D would fail under E conditions
- Resolved memory leak in F

## [0.1.0] - YYYY-MM-DD

### Added
- Initial beta release
- Basic functionality for G
- Preliminary documentation

### Known Issues
- H feature is experimental
- I may have performance issues with large datasets

[Unreleased]: https://github.com/org/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/org/repo/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/org/repo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/org/repo/releases/tag/v0.1.0
`;
}

function createSecurityTemplate(args: CreateDocTemplateArgs): string {
  const projectName = args.projectName || "Project";

  return `# Security Policy

## Supported Versions

The following versions of ${projectName} are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| 0.x.x   | :x:                |

## Reporting a Vulnerability

We take the security of ${projectName} seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Security vulnerabilities should not be reported through public GitHub issues.

### 2. Email Security Team

Send details to: security@example.com

Include:
- Type of vulnerability
- Full paths of affected source files
- Steps to reproduce
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Timeline**: Depends on severity

## Security Measures

### Code Security

- All code is reviewed before merging
- Dependencies are regularly updated
- Security scanning in CI/CD pipeline
- Static code analysis

### Runtime Security

- Input validation on all endpoints
- Output encoding to prevent XSS
- SQL injection prevention
- CSRF protection

### Infrastructure Security

- HTTPS/TLS for all communications
- Secrets managed via secure vault
- Regular security audits
- Principle of least privilege

## Security Best Practices

### For Users

1. **Keep ${projectName} Updated**
   - Always use the latest version
   - Subscribe to security announcements

2. **Secure Configuration**
   - Use strong authentication
   - Enable all security features
   - Follow deployment guide

3. **Monitor Your Installation**
   - Enable logging
   - Set up alerts
   - Regular security reviews

### For Contributors

1. **Secure Coding**
   - Follow OWASP guidelines
   - Never commit secrets
   - Validate all inputs
   - Use parameterized queries

2. **Dependency Management**
   - Check for vulnerabilities
   - Keep dependencies minimal
   - Regular updates

3. **Testing**
   - Include security tests
   - Test edge cases
   - Verify error handling

## Known Security Considerations

### [Consideration 1]

**Risk**: [Description]

**Mitigation**: [How to mitigate]

### [Consideration 2]

**Risk**: [Description]

**Mitigation**: [How to mitigate]

## Security Checklist

### Deployment

- [ ] HTTPS enabled
- [ ] Secrets properly managed
- [ ] Access controls configured
- [ ] Logging enabled
- [ ] Monitoring active

### Configuration

- [ ] Default passwords changed
- [ ] Unnecessary features disabled
- [ ] File permissions restricted
- [ ] Network access limited

### Maintenance

- [ ] Regular updates applied
- [ ] Logs reviewed
- [ ] Backups tested
- [ ] Incidents documented

## Security Headers

Recommended security headers for web deployments:

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
\`\`\`

## Compliance

${projectName} aims to help with compliance for:

- OWASP Top 10
- GDPR (data protection)
- SOC 2 (where applicable)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Best Practices](docs/security-best-practices.md)
- [Deployment Guide](docs/deployment.md)

## Contact

- Security Email: security@example.com
- Security GPG Key: [Link to key]
- Bug Bounty Program: [Link if applicable]

## Acknowledgments

We thank the following for responsible disclosure:

- [Researcher Name] - [Issue type] (Date)
`;
}

function createReadmeTemplate(args: CreateDocTemplateArgs): string {
  const projectName = args.projectName || "Project Name";
  const title = args.title || projectName;

  return `# ${title}

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/org/repo/actions)

[Brief description of what ${projectName} does and why it's useful]

## Features

- ✨ Feature 1: [Description]
- 🚀 Feature 2: [Description]
- 🔧 Feature 3: [Description]
- 📦 Feature 4: [Description]

## Quick Start

### Installation

\`\`\`bash
# Using npm
npm install ${projectName.toLowerCase()}

# Using yarn
yarn add ${projectName.toLowerCase()}

# Using pip
pip install ${projectName.toLowerCase()}
\`\`\`

### Basic Usage

\`\`\`[language]
// Import the library
import { Component } from '${projectName.toLowerCase()}';

// Use it
const result = Component.doSomething();
console.log(result);
\`\`\`

## Documentation

- 📚 [Full Documentation](docs/)
- 🎓 [Tutorials](docs/tutorials/)
- 🛠️ [API Reference](docs/reference/)
- 💡 [Examples](examples/)

## Requirements

- [Requirement 1] version X.X or higher
- [Requirement 2] version Y.Y or higher
- [Optional requirement]

## Installation

### From Package Manager

\`\`\`bash
[package manager] install ${projectName.toLowerCase()}
\`\`\`

### From Source

\`\`\`bash
git clone https://github.com/org/${projectName.toLowerCase()}.git
cd ${projectName.toLowerCase()}
[build command]
\`\`\`

## Configuration

Create a configuration file:

\`\`\`[language]
{
  "option1": "value1",
  "option2": "value2"
}
\`\`\`

## Examples

### Example 1: [Basic Example]

\`\`\`[language]
[code example]
\`\`\`

### Example 2: [Advanced Example]

\`\`\`[language]
[code example]
\`\`\`

More examples in the [examples directory](examples/).

## Development

### Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/org/${projectName.toLowerCase()}.git
cd ${projectName.toLowerCase()}

# Install dependencies
[install command]

# Run tests
[test command]
\`\`\`

### Running Tests

\`\`\`bash
# Run all tests
[test command]

# Run with coverage
[coverage command]
\`\`\`

### Building

\`\`\`bash
[build command]
\`\`\`

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## Roadmap

- [ ] Upcoming feature 1
- [ ] Upcoming feature 2
- [ ] Performance improvements
- [ ] Additional language support

See the [open issues](https://github.com/org/repo/issues) for a full list of proposed features.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

See also the list of [contributors](https://github.com/org/repo/contributors) who participated in this project.

## Acknowledgments

- Thanks to [Person/Project] for [inspiration/code/etc]
- [Library] for [what it provides]
- The awesome community for feedback and contributions

## Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/org/repo/issues)

## Related Projects

- [Related Project 1](https://github.com/org/related1) - [Description]
- [Related Project 2](https://github.com/org/related2) - [Description]

---

Made with ❤️ by [Your Team/Organization](https://example.com)
`;
}
