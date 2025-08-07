# Standards-Based Design for App Description YAML

## Overview

Rather than inventing a new format, the app description YAML structure leverages established industry standards and
patterns, combining the best aspects of each while maintaining consistency with Aichaku's principles.

## Standards We're Leveraging

### 1. **OpenAPI Specification** (Primary Influence)

The OpenAPI spec provides excellent patterns for describing APIs and services:

- **Info section**: Standard metadata (name, version, description)
- **Components**: Reusable definitions
- **Servers**: Environment configurations
- **Security schemes**: Authentication patterns

**What we adopt:**

```yaml
application:
  # OpenAPI-style info section
  name: "My Application"
  version: "1.0.0"
  description: "Application description"

  # OpenAPI-style API documentation
  api:
    style: "rest"
    base_url: "/api/v1"
    documentation:
      format: "openapi"
      url: "/docs"
```

### 2. **Docker Compose** (Service Architecture)

Docker Compose excels at describing multi-service applications:

- Service definitions with dependencies
- Environment-specific configurations
- Technology stack specifications

**What we adopt:**

```yaml
# Docker Compose-inspired service relationships
architecture:
  services:
    - name: "web-frontend"
      description: "React application"
      dependencies: ["api-backend"]
    - name: "api-backend"
      description: "Express API"
      dependencies: ["database", "cache"]
```

### 3. **Kubernetes Manifests** (Metadata Standards)

Kubernetes provides excellent patterns for resource metadata:

- Standard metadata fields
- Label-based organization
- Resource specifications

**What we adopt:**

```yaml
# Kubernetes-style resource identification
application:
  name: "my-application"
  type: "web-application" # Similar to K8s 'kind'
  version: "1.0.0"
```

### 4. **C4 Model** (Architecture Documentation)

The C4 model provides hierarchy for software architecture:

- System Context → Container → Component → Code
- Clear boundaries and relationships
- Technology choices at appropriate levels

**What we adopt:**

```yaml
# C4-inspired architectural layers
architecture:
  pattern: "clean-architecture"
  layers: # C4 component-level view
    - name: "presentation"
      description: "User interface components"
    - name: "domain"
      description: "Business logic"
```

### 5. **CloudFormation/Terraform** (Infrastructure as Code)

IaC tools provide patterns for:

- Resource dependencies
- Environment-specific parameters
- Output definitions

**What we adopt:**

```yaml
# IaC-inspired deployment configuration
deployment:
  environments:
    - name: "production"
      url: "https://app.example.com"
      scaling:
        min_instances: 2
        max_instances: 10
```

## Aichaku Principles Applied

### **15-Factor App Methodology**

The structure directly supports 15-factor principles:

```yaml
# Factor III: Store config in environment
deployment:
  environments:
    - name: "production"
      variables:
        DATABASE_URL: "${DATABASE_URL}"

# Factor IX: Maximize robustness
practices:
  ci_cd:
    deployment_strategy: "blue-green"
```

### **Clean Architecture**

Clear separation of concerns:

```yaml
architecture:
  pattern: "clean-architecture"
  layers:
    - name: "domain"
      description: "Business rules"
      technologies: ["typescript"] # Framework-agnostic
```

### **OWASP Security Standards**

Built-in security considerations:

```yaml
security:
  standards: ["owasp-web", "nist-csf"]
  authentication:
    primary: "oauth2"
    mfa_required: true
```

## Design Rationale

### Why This Hybrid Approach?

1. **Familiarity**: Developers already know these patterns
2. **Tooling**: Existing tools can partially validate/parse
3. **Completeness**: Each standard contributes missing pieces
4. **Flexibility**: Can evolve without breaking changes

### Mapping to Existing Standards

| Our Section              | Primary Influence         | Secondary Influence      |
| ------------------------ | ------------------------- | ------------------------ |
| `application` (metadata) | OpenAPI `info`            | K8s `metadata`           |
| `stack`                  | Docker Compose `services` | CloudFormation resources |
| `architecture`           | C4 Model                  | Clean Architecture       |
| `api`                    | OpenAPI `paths`           | -                        |
| `domain`                 | Domain-Driven Design      | C4 Model                 |
| `security`               | OWASP/NIST                | OpenAPI `security`       |
| `deployment`             | K8s/Docker                | CloudFormation           |

## Validation Using Standards

We can leverage existing schema validators:

1. **OpenAPI sections**: Use OpenAPI validators for API descriptions
2. **Docker Compose patterns**: Validate service dependencies
3. **JSON Schema**: Overall structure validation

## Example: Standards in Practice

```yaml
# This example shows how multiple standards inform the structure

application:
  # OpenAPI-style info
  name: "E-Commerce Platform"
  version: "2.0.0"
  description: "Multi-tenant e-commerce SaaS"

  # Docker Compose-style stack
  stack:
    language: "typescript"
    runtime: "node"
    framework: "nestjs"
    database: "postgresql"

  # C4 Model-style architecture
  architecture:
    pattern: "microservices"
    services: # Docker Compose service pattern
      - name: "catalog-service"
        description: "Product catalog management"
        endpoints: ["/products", "/categories"]
        dependencies: ["database", "search"]

  # OpenAPI-style API definition
  api:
    style: "rest"
    base_url: "/api/v1"
    authentication: "jwt"
    documentation:
      format: "openapi"
      url: "/api-docs"

  # 15-Factor deployment config
  deployment:
    environments:
      - name: "production"
        url: "https://api.example.com"
        variables: # Factor III: Config
          DATABASE_URL: "${DATABASE_URL}"
          REDIS_URL: "${REDIS_URL}"
```

## Benefits of Standards-Based Approach

1. **Learning Curve**: Developers recognize patterns from tools they use
2. **Validation**: Can reuse existing validation tools
3. **Evolution**: Standards evolve based on community needs
4. **Interoperability**: Easier to integrate with other tools
5. **Documentation**: Extensive resources already exist

## Future Extensibility

By following established standards, we can:

- Add new sections following the same patterns
- Integrate with standard tooling
- Export to other formats (OpenAPI, Docker Compose, etc.)
- Maintain backward compatibility

This standards-based approach ensures the app description YAML feels familiar while serving Aichaku's specific needs for
providing rich application context to Claude Code.
