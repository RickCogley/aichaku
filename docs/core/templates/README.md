# Core Documentation Templates

This directory contains generic documentation templates that can be used across any project, regardless of methodology
or standards chosen.

## Available Templates

### Technical Documentation

- **api-reference-template.md** - For documenting APIs, libraries, and components
- **architecture-decision-template.md** - ADR format for capturing architectural decisions
- **migration-guide-template.md** - For version upgrades or system migrations
- **technical-specification-template.md** - Comprehensive technical specification format

### Project Management

- **project-retrospective-template.md** - Team retrospective and lessons learned
- **change-log-template.md** - Release notes and change documentation

### Operations & Incident Management

- **incident-response-template.md** - Incident response and post-mortem analysis

### Security & Compliance

- **security-review-template.md** - Comprehensive security review documentation

## Usage

These templates complement the methodology-specific templates (in `/docs/methodologies/*/templates/`) and documentation
standard templates (in `/docs/standards/documentation/templates/`).

### Template Hierarchy

1. **Methodology templates** - Use for methodology-specific documents (sprints, pitches, etc.)
2. **Documentation standard templates** - Use for user-facing documentation (tutorials, how-tos, etc.)
3. **Core templates** (this directory) - Use for technical and cross-cutting concerns

### Customization

Feel free to copy these templates to your project and modify them to fit your needs. The templates are designed to be
starting points, not rigid requirements.

### Integration with Documentation Standards

When using these templates with a documentation standard (like Diátaxis), consider:

- API Reference → Diátaxis Reference mode
- Migration Guide → Diátaxis How-to mode
- Architecture Decision → Diátaxis Explanation mode

## Contributing

To add a new template:

1. Create a descriptive filename ending in `-template.md`
2. Include clear placeholders using `[Square Brackets]`
3. Provide examples where helpful
4. Update this README
