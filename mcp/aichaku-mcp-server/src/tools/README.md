# MCP Documentation Generation Tools

This directory contains MCP tools for generating comprehensive project
documentation following various standards.

## Tools

### 1. `analyze_project`

Analyzes a project's structure, languages, architecture, and dependencies.

**Arguments:**

- `projectPath` (string, required): Path to the project directory to analyze
- `detailed` (boolean, optional): Include detailed analysis of files and
  components (default: true)

**Returns:**

- Project type (e.g., "TypeScript-library", "python-app")
- Language breakdown with percentages
- Directory structure with inferred purposes
- Dependencies from package files
- API endpoints (if found)
- Test files
- Configuration files
- Architecture pattern detection
- Suggested documentation structure

### 2. `generate_documentation`

Generates comprehensive documentation following selected standards.

**Arguments:**

- `projectPath` (string, required): Path to the project directory
- `outputPath` (string, optional): Output path for documentation (defaults to
  projectPath/docs)
- `standard` (string, optional): Documentation standard to follow
  - "diataxis" (default) - Four-mode documentation framework
  - "diataxis-google" - Diátaxis with Google style guide
  - "google" - Google documentation style
  - "microsoft" - Microsoft documentation style
  - "readme-first" - README-centric documentation
  - "api-first" - API-centric documentation
- `overwrite` (boolean, optional): Overwrite existing documentation files
  (default: false)
- `includeExamples` (boolean, optional): Include code examples (default: true)
- `includeDiagrams` (boolean, optional): Generate Mermaid diagrams (default:
  true)
- `autoChain` (boolean, optional): Automatically run analyze_project first
  (default: true)

**Features:**

- Automatically detects and uses project's selected documentation standards
- Generates appropriate structure based on project type
- Creates README, tutorials, how-to guides, references, and explanations
- Includes architecture diagrams using Mermaid
- Provides helpful next steps after generation

### 3. `create_doc_template`

Creates specific documentation template files.

**Arguments:**

- `outputPath` (string, required): Path where the template file should be
  created
- `templateType` (string, required): Type of template to create
  - "tutorial" - Step-by-step learning guide
  - "how-to" - Task-oriented guide
  - "reference" - Technical reference documentation
  - "explanation" - Conceptual explanation
  - "api" - API documentation template
  - "architecture" - Architecture documentation
  - "contributing" - Contribution guidelines
  - "changelog" - Version history template
  - "security" - Security policy template
  - "readme" - Project README template
- `title` (string, optional): Title for the document
- `projectName` (string, optional): Name of the project
- `customFields` (object, optional): Custom fields to replace in template

## Usage Examples

### Basic Documentation Generation

```typescript
// Generate documentation for current project
await generateDocumentationTool.execute({
  projectPath: ".",
});
```

### Custom Standard with Diagrams

```typescript
// Generate Google-style docs with architecture diagrams
await generateDocumentationTool.execute({
  projectPath: "/path/to/project",
  standard: "google",
  includeDiagrams: true,
});
```

### Create Specific Template

```typescript
// Create a new tutorial
await createDocTemplateTool.execute({
  outputPath: "docs/tutorials/advanced-features.md",
  templateType: "tutorial",
  title: "Advanced Features",
  projectName: "MyProject",
});
```

### Full Workflow with Auto-Chain

```typescript
// Analyze and generate in one go
const result = await generateDocumentationTool.execute({
  projectPath: ".",
  autoChain: true, // Will run analyze_project automatically
});

// Review generated files if requested
if (result.success && result.generatedFiles) {
  for (const file of result.generatedFiles.slice(0, 3)) {
    await reviewFile({ file });
  }
}
```

## Integration with Aichaku Standards

The documentation tools integrate with Aichaku's standards system:

1. **Automatic Standard Detection**: When generating documentation, the tool
   checks for project standards in `.claude/aichaku/standards.json`
2. **Standard Mapping**: Maps Aichaku standards to documentation frameworks:
   - "DIATAXIS-GOOGLE" → diataxis-google documentation style
   - "GOOGLE-STYLE" → google documentation style
   - Default → diataxis framework

3. **Quality Review**: Generated documentation can be reviewed using
   `review_file` to ensure it meets selected standards

## Architecture

The documentation generation system consists of:

- **Project Analyzer** (`analysis/project-analyzer.ts`): Analyzes project
  structure and characteristics
- **Doc Generator** (`generation/doc-generator.ts`): Generates documentation
  based on analysis
- **Template System**: Pre-defined templates for various documentation types
- **MCP Tools** (`tools/*.ts`): MCP-compatible tool definitions

## Best Practices

1. **Run Analysis First**: Use `analyze_project` to understand your project
   before generating docs
2. **Choose Appropriate Standard**: Select a documentation standard that fits
   your audience
3. **Review Generated Content**: Use `review_file` on generated documentation
4. **Customize Templates**: Edit generated files to add project-specific content
5. **Keep Docs Updated**: Re-run generation after major changes

## Environment Variables

For generated API documentation examples:

- `API_URL`: Base URL for API examples (defaults to http://localhost:3000)

## Security Considerations

- All paths are validated using Aichaku's path security utilities
- Path traversal attempts are blocked
- Generated files are written using safe write functions
- No execution of external commands

## Testing

Run tests for the documentation tools:

```bash
deno test mcp-server/src/generation/
deno test mcp-server/src/analysis/
deno test mcp-server/src/tools/
```

## Future Enhancements

- Support for more documentation standards (e.g., Sphinx, MkDocs)
- Integration with existing documentation tools
- Multi-language documentation generation
- Interactive documentation features
- Documentation coverage metrics
