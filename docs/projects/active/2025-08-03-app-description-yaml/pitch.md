# Shape Up Pitch: App Description YAML Feature

## Problem Statement

Claude Code users need better application-specific context beyond methodology guidance. Currently, Aichaku provides
excellent methodology and standards guidance, but Claude lacks crucial information about the specific application it's
working on:

- **Tech stack and frameworks** - Is this a React app? Django API? Go microservice?
- **Architecture patterns** - Monolith? Microservices? Event-driven?
- **API endpoints and services** - What routes exist? What do they do?
- **Database schemas** - What tables? What relationships?
- **Security requirements** - Authentication methods? Compliance needs?
- **Business domain context** - E-commerce? Healthcare? Fintech?

### Raw Idea Origins

This problem emerged from user feedback showing that while Aichaku's methodology guidance is valuable, Claude often
makes assumptions about the application that don't match reality. Users want Claude to understand their specific context
without having to explain it in every conversation.

### Why Now?

- Aichaku has stable methodology integration patterns
- Users are requesting more application-specific guidance
- The integration mechanism (`aichaku integrate`) provides a natural place to incorporate this feature
- Existing standards like 15-factor and clean-arch provide proven structure patterns

## Appetite

**6 weeks** - One full Shape Up cycle

This is substantial enough to warrant a full cycle because it involves:

- Designing a comprehensive YAML schema
- Building template generation
- Integrating with existing `aichaku integrate` workflow
- Creating user documentation and examples
- Ensuring backward compatibility

## Solution Approach

Create a structured YAML file system that allows users to describe their application context:

### Core Components

1. **Template File**: `.claude/aichaku/user/templates/app-description-template.yaml`
   - Comprehensive template with examples and documentation
   - Progressive disclosure: required basics, optional advanced sections
   - Leverages existing Aichaku standards vocabulary

2. **User File**: `.claude/aichaku/user/app-description.yaml`
   - User's actual application description
   - Optional - if missing, no errors, just no app-specific context
   - Validated against schema during `aichaku integrate`

3. **Integration Mechanism**
   - During `aichaku integrate`, merge app description into CLAUDE.md YAML block
   - New section: `application:` with structured app information
   - Preserves existing methodology and standards configuration

### YAML Structure Design

```yaml
application:
  # Basic Information (Required)
  name: "My Application"
  type: "web-application" # web-application, api-service, cli-tool, mobile-app, etc.
  description: "Brief description of what this application does"

  # Technology Stack
  stack:
    language: "typescript"
    runtime: "node"
    framework: "react"
    database: "postgresql"
    deployment: "docker"

  # Architecture
  architecture:
    pattern: "clean-architecture" # monolith, microservices, clean-architecture, etc.
    layers:
      - "presentation"
      - "application"
      - "domain"
      - "infrastructure"

  # API Design (if applicable)
  api:
    style: "rest" # rest, graphql, grpc, etc.
    base_url: "/api/v1"
    authentication: "jwt"

  # Business Domain
  domain:
    industry: "healthcare"
    compliance: ["hipaa", "gdpr"]
    key_entities: ["patient", "appointment", "provider"]

  # Security Requirements
  security:
    standards: ["owasp-web", "nist-csf"]
    authentication: "oauth2"
    encryption: "tls-1.3"

  # Development Practices
  practices:
    testing: ["tdd", "bdd"]
    ci_cd: "github-actions"
    monitoring: "prometheus"
```

## Rabbit Holes to Avoid

1. **Over-Engineering the Schema** - Don't try to model every possible application type
2. **Complex Validation Logic** - Keep YAML validation simple and forgiving
3. **Breaking Existing Workflows** - Must be additive, not disruptive
4. **UI/Editor Integration** - Stay focused on the YAML file approach

## No-Gos

- **GUI for editing** - Keep it simple: users edit YAML directly
- **Auto-detection of tech stack** - Requires complex heuristics, error-prone
- **Real-time API integration** - Don't try to fetch live data from the app
- **Multiple app descriptions** - One app per project, keep it simple

## Success Metrics

### Primary Success Criteria

- Users can describe their application in under 15 minutes
- Claude Code provides more relevant, context-aware responses
- Zero breaking changes to existing Aichaku workflows
- 90%+ of template fields have clear, helpful examples

### User Experience Goals

- Template is self-documenting with clear examples
- Error messages are helpful when YAML is invalid
- Integration is seamless and transparent
- Works well for both simple and complex applications

## Risks and Mitigations

### Technical Risks

- **YAML complexity**: Mitigate with extensive examples and validation
- **Integration conflicts**: Thorough testing with existing configurations
- **Performance impact**: Keep file size reasonable, optimize parsing

### User Adoption Risks

- **Template intimidation**: Progressive disclosure, start simple
- **Maintenance burden**: Keep required fields minimal
- **Documentation gap**: Invest heavily in examples and guides

## Circuit Breakers

If we hit these issues, we reassess or stop:

1. **YAML schema becomes too complex** - If users can't fill it out in 15 minutes
2. **Integration breaks existing workflows** - Must maintain backward compatibility
3. **Performance degrades significantly** - Integration should be fast
4. **User testing shows confusion** - Template must be intuitive

## Betting Table Readiness

This pitch is ready for the betting table with:

- ✅ Clear problem definition from user feedback
- ✅ Concrete solution approach with technical details
- ✅ Realistic 6-week appetite
- ✅ Identified risks and circuit breakers
- ✅ Success criteria and no-gos defined

The team can confidently bet on this knowing exactly what we're building and why.
