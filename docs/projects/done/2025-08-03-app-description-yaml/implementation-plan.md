# Implementation Plan: App Description YAML

## Overview

This document outlines the technical implementation approach for integrating application descriptions into Aichaku's
CLAUDE.md generation system.

## Architecture Design

### File Structure

```
.claude/aichaku/user/
├── templates/
│   ├── app-description-template.yaml
│   ├── web-app-template.yaml
│   ├── api-service-template.yaml
│   └── cli-tool-template.yaml
├── app-description.yaml    # User's customized description
└── README.md              # Instructions for users
```

### Integration Flow

1. **User Setup**
   - Copy template to `app-description.yaml`
   - Fill out relevant sections
   - Run `aichaku integrate`

2. **Integration Process**
   ```
   aichaku integrate
   ├── Load existing CLAUDE.md YAML
   ├── Check for app-description.yaml
   ├── Validate YAML structure
   ├── Merge application section
   └── Write updated CLAUDE.md
   ```

3. **Error Handling**
   - Missing file: Continue without app context (no error)
   - Invalid YAML: Show helpful error with line numbers
   - Schema violations: Suggest corrections

## YAML Schema

### Required Fields

```yaml
application:
  name: string # Application name
  type: enum # Application type
  description: string # Brief description
```

### Optional Sections

- `stack`: Technology choices
- `architecture`: Design patterns
- `api`: API specifications
- `domain`: Business context
- `security`: Security requirements
- `practices`: Development practices

## Integration Code

### Key Functions

```typescript
// Load and validate app description
async function loadAppDescription(): Promise<AppDescription | null> {
  const path = ".claude/aichaku/user/app-description.yaml";
  if (!fs.existsSync(path)) return null;

  const content = await fs.readFile(path, "utf8");
  const parsed = yaml.parse(content);

  return validateSchema(parsed);
}

// Merge into CLAUDE.md
async function mergeAppDescription(
  existing: ClaudeMdConfig,
  appDesc: AppDescription,
): Promise<ClaudeMdConfig> {
  return {
    ...existing,
    application: appDesc.application,
  };
}
```

### Validation Strategy

1. **Schema Validation**
   - Use JSON Schema for structure validation
   - Provide clear error messages
   - Suggest fixes for common mistakes

2. **Progressive Enhancement**
   - Start with minimal required fields
   - Add sections as needed
   - No penalties for missing optional fields

## User Experience

### Setup Flow

1. Run `aichaku init` (detects no app description)
2. Prompt: "Would you like to describe your application? (y/n)"
3. If yes: Copy template, show instructions
4. User edits file
5. Run `aichaku integrate`

### Error Messages

```
❌ Invalid app description: 
   Line 15: Expected string for 'application.name'
   Line 22: Unknown field 'application.stacks' (did you mean 'stack'?)

💡 Fix these issues in .claude/aichaku/user/app-description.yaml
   or see the template for examples.
```

## Examples

### Minimal Valid Description

```yaml
application:
  name: "My Todo App"
  type: "web-application"
  description: "A simple todo list manager"
```

### Full Example (E-commerce)

```yaml
application:
  name: "ShopEasy"
  type: "web-application"
  description: "E-commerce platform for small businesses"

  stack:
    language: "typescript"
    framework: "nextjs"
    database: "postgresql"

  architecture:
    pattern: "microservices"
    services:
      - name: "catalog-service"
        description: "Product catalog management"
      - name: "order-service"
        description: "Order processing"
      - name: "payment-service"
        description: "Payment processing"

  api:
    style: "graphql"
    authentication: "jwt"

  domain:
    industry: "e-commerce"
    entities:
      - name: "Product"
        key_attributes: ["sku", "name", "price"]
      - name: "Order"
        key_attributes: ["id", "customer", "items", "total"]
```

## Testing Strategy

### Unit Tests

- YAML parsing and validation
- Schema validation rules
- Merge logic
- Error message generation

### Integration Tests

- Full `aichaku integrate` flow
- Various YAML configurations
- Error scenarios
- Backward compatibility

### User Testing

- Template clarity
- Time to complete
- Error message helpfulness
- Documentation effectiveness

## Migration Path

### For Existing Users

1. No breaking changes - feature is additive
2. Optional migration guide for adding app descriptions
3. Examples showing before/after benefits

### Version Strategy

- v0.41.0: Initial release with basic support
- v0.42.0: Enhanced templates and validation
- v0.43.0: Advanced features (auto-detection helpers)

## Performance Considerations

- Lazy loading of app descriptions
- Cache parsed YAML between runs
- Minimal impact on `integrate` performance
- File size limits (warn if >100KB)

## Documentation Plan

### User Guides

1. "Getting Started with App Descriptions"
2. "Template Field Reference"
3. "Common Patterns and Examples"
4. "Troubleshooting Guide"

### Developer Docs

1. Schema specification
2. Validation rules
3. Extension points
4. Contributing guidelines

## Success Metrics

- Setup time < 15 minutes
- Zero breaking changes
- 90%+ successful integrations
- Positive user feedback

## Implementation Timeline

### Week 1-2: Core Development

- YAML schema design
- Template creation
- Basic integration logic

### Week 3-4: Integration & Testing

- Full integration with `aichaku integrate`
- Comprehensive testing
- Error handling refinement

### Week 5-6: Documentation & Polish

- User documentation
- Examples and guides
- Performance optimization
- User testing and feedback
