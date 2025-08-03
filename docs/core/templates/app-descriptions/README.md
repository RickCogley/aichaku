# App Description Templates

This directory contains templates for describing applications to provide Claude Code with rich context about your
specific project.

## Available Templates

- **base-template.yaml** - Comprehensive template with all available options
- **web-app-template.yaml** - Optimized for web applications (React, Vue, Angular, etc.)
- **api-service-template.yaml** - For REST APIs, GraphQL services, and microservices
- **static-site-template.yaml** - For static sites, blogs, and JAMstack applications
- **cli-tool-template.yaml** - For command-line tools and utilities

## Usage

These templates are automatically copied during:

- `aichaku init` - When setting up a new project
- `aichaku upgrade` - When upgrading to a version with app descriptions
- `aichaku app-description init` - Manual initialization

## Template Structure

All templates follow a standards-based structure inspired by:

- OpenAPI for API descriptions
- Docker Compose for service definitions
- Kubernetes for metadata patterns
- C4 Model for architecture documentation

## Customization

After copying a template:

1. Edit `.claude/aichaku/user/app-description.yaml`
2. Fill in your application-specific details
3. Remove or comment out sections that don't apply
4. Run `aichaku integrate` to merge into CLAUDE.md

## Validation

Templates include:

- Required fields marked clearly
- Extensive inline examples
- Comments explaining each section
- Valid enum values for constrained fields

## Best Practices

1. Start with basic required fields
2. Add sections as your application grows
3. Keep descriptions concise but informative
4. Update when architecture changes significantly
5. Use examples from templates as guidance
