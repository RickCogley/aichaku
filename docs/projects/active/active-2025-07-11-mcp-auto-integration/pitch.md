# Pitch: Automatic MCP Integration for Documentation Generation

## Problem

When users ask Claude Code to "Generate comprehensive project documentation,"
the MCP server tools are not being used automatically. This results in:

- Documentation generated without standards compliance
- No automatic linting or review of created content
- Missed opportunity to leverage project-specific standards
- Manual follow-up required to achieve quality

The root cause: The MCP server only has tools for **reviewing** existing
content, not **generating** new documentation.

## Appetite

**3-4 days** - Adding documentation generation capabilities to the MCP server
and improving tool discovery.

## Solution

### 1. Add Documentation Generation Tools to MCP Server

Create new MCP tools that align with documentation generation requests:

```typescript
// Primary tool for doc generation
{
  name: "generate_documentation",
  description: "Generate comprehensive project documentation in /docs based on the selected documentation standards. Creates architecture diagrams, specifications, API docs, and concept explanations.",
  inputSchema: {
    type: "object",
    properties: {
      projectPath: { type: "string" },
      outputDir: { type: "string", default: "docs" },
      includeArchitecture: { type: "boolean", default: true },
      includeApi: { type: "boolean", default: true },
      includeGuides: { type: "boolean", default: true }
    }
  }
}

// Supporting tools
{
  name: "analyze_project_structure",
  description: "Analyze project structure, dependencies, and architecture to generate comprehensive documentation. Use before generating docs.",
  // ...
}

{
  name: "create_documentation_outline", 
  description: "Create a documentation outline based on Diátaxis or other selected standards. Use to plan comprehensive docs.",
  // ...
}
```

### 2. Tool Chaining and Workflow

Enable Claude Code to automatically chain tools for complex tasks:

```mermaid
graph LR
    A[User Request:<br/>"Generate docs"] --> B[get_standards]
    B --> C[analyze_project_structure]
    C --> D[create_documentation_outline]
    D --> E[generate_documentation]
    E --> F[review_file<br/>(for each generated file)]
```

### 3. Enhanced Tool Descriptions

Update existing tool descriptions to include trigger keywords:

```typescript
// Before
"Review a file for security, standards, and methodology compliance";

// After
"Review a file for security, standards, and methodology compliance. Automatically reviews generated documentation, code files, and any content created by Claude Code to ensure quality.";
```

### 4. Proactive Tool Invocation

Add metadata to tools indicating when they should be automatically invoked:

```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
  metadata?: {
    triggers?: string[]; // Keywords that trigger this tool
    chainAfter?: string[]; // Tools to run after this one
    autoInvoke?: boolean; // Should be invoked automatically
  };
}

// Example
{
  name: "review_file",
  description: "...",
  metadata: {
    triggers: ["review", "check", "lint", "validate"],
    chainAfter: ["generate_documentation", "create_*"],
    autoInvoke: true
  }
}
```

### 5. Documentation Generation Implementation

The `generate_documentation` tool would:

1. **Analyze Project**
   - Read project structure
   - Identify key components
   - Extract architecture patterns

2. **Apply Standards**
   - Use selected documentation standards
   - Generate appropriate templates
   - Structure content accordingly

3. **Generate Content**
   - Architecture diagrams (Mermaid)
   - API documentation
   - Concept explanations
   - How-to guides
   - Reference documentation

4. **Auto-Review**
   - Automatically invoke `review_file` on each generated file
   - Apply linting based on selected standards
   - Ensure quality and consistency

## Rabbit Holes

### Avoid These

1. **Building a full static site generator** - Focus on content generation, not
   publishing
2. **Complex template engines** - Use simple markdown templates
3. **Trying to understand every codebase pattern** - Start with common
   architectures
4. **Perfect diagram generation** - Simple, clear diagrams are better than
   complex ones
5. **Language-specific parsing for everything** - Start with
   TypeScript/JavaScript, Python

### Keep It Simple

- Generate markdown files organized by Diátaxis or selected standard
- Use existing code analysis tools where possible
- Focus on readability over completeness
- Let Claude Code handle the actual writing

## No-Goes

1. **Modifying user's code** - Only create documentation files
2. **Overwriting existing docs without consent** - Always preserve existing
   content
3. **Complex configuration files** - Use project's existing standards
4. **External API dependencies** - Keep it self-contained

## Implementation Plan

### Phase 1: Core Tools (Day 1-2)

- [ ] Create `generate_documentation` tool
- [ ] Create `analyze_project_structure` tool
- [ ] Create `create_documentation_outline` tool
- [ ] Update tool descriptions with keywords

### Phase 2: Integration (Day 2-3)

- [ ] Implement tool chaining logic
- [ ] Add automatic review after generation
- [ ] Test with different project types
- [ ] Ensure standards compliance

### Phase 3: Enhancement (Day 3-4)

- [ ] Add diagram generation
- [ ] Improve project analysis
- [ ] Add more documentation templates
- [ ] Performance optimization

## Success Metrics

- Users can generate docs with one request
- MCP tools are used automatically without prompting
- Generated docs comply with selected standards
- No manual review/linting needed after generation
- Works for TypeScript, Python, and Go projects

## Example User Flow

**Before:**

```
User: "Generate comprehensive project documentation"
Claude: [Generates docs without using MCP tools]
User: "Now review it with the MCP server"
Claude: [Uses review_file tool]
```

**After:**

```
User: "Generate comprehensive project documentation"
Claude: [Automatically uses MCP tools in sequence]
  → get_standards
  → analyze_project_structure  
  → create_documentation_outline
  → generate_documentation
  → review_file (for each generated file)
Result: High-quality, standards-compliant documentation
```
