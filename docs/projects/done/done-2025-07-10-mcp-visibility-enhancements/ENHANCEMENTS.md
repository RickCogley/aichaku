# MCP Visibility and Documentation Linting Enhancements

## Summary

Enhanced the Aichaku MCP server to address two key user concerns:

1. **MCP Usage Visibility**: Added clear console logging to show when the MCP is
   actively being used
2. **Document Linting**: Extended MCP capabilities to lint markdown
   documentation files

## Key Improvements

### 1. Console Visibility

The MCP now logs to stderr (visible in Claude Code console) with clear prefixes:

```
🪴 [Aichaku MCP] Tool invoked: review_file
🪴 [Aichaku MCP] Reviewing file: /Users/rcogley/dev/aichaku/README.md
🪴 [Aichaku MCP] Using standards: diataxis, google-style
🪴 [Aichaku MCP] Using methodologies: shape-up
🪴 [Aichaku MCP] Review complete: 3 findings
```

This makes it immediately apparent when the MCP is:

- Starting up
- Being invoked by Claude
- Processing files
- Using specific standards/methodologies

### 2. Documentation Linting

Added comprehensive documentation patterns that check for:

#### Diátaxis Framework Compliance

- Tutorial structure (prerequisites, learning objectives)
- How-to guide structure (before you begin, solution sections)
- Proper document type identification

#### Google Developer Style Guide

- Sentence length (< 25 words)
- Present tense usage
- Second person pronouns (you, your)
- Active voice preference

#### General Quality

- Broken or placeholder links
- Missing code block languages
- Inconsistent header levels
- Formatting issues

### 3. Enhanced Output

The MCP now:

- Identifies document type (Tutorial, How-to, Reference, Explanation)
- Provides document-specific feedback
- Shows "Documentation Review Results" for markdown files
- Gives actionable fix suggestions

## Example Output

When reviewing a markdown file:

```
🪴 Aichaku Documentation Review Results

📄 File: /docs/tutorial.md
📝 Document Type: Tutorial (Learning-oriented)
📊 Summary: 2 high, 3 medium, 5 info

🟠 HIGH (2)
----------------------------------------
  • Line 1: Tutorials should start with 'Getting Started' or 'Tutorial'
    → Fix: Start tutorials with '# Getting Started with [Product]'
  
  • Line 45: Broken or placeholder link: "TODO"
    → Fix: Replace placeholder links with actual URLs

🟡 MEDIUM (3)
----------------------------------------
  • Line 8: Tutorials should include a Prerequisites section
    → Fix: Add a '## Prerequisites' section
    
💡 INFO (5)
----------------------------------------
  • Line 23: Sentence has 32 words (Google style recommends < 25)
    → Fix: Break long sentences into shorter statements
```

## Implementation Notes

### Type Safety

- Updated all pattern interfaces to match new SecurityPattern type
- Added proper typing for checkFn functions
- Fixed compilation errors across all pattern files

### Pattern Architecture

- Patterns can use regex OR custom check functions
- Line-specific error reporting
- Framework-specific patterns (only apply to relevant standards)

### Future Enhancements

1. Auto-fix capabilities for common issues
2. Integration with `deno fmt` for markdown
3. Additional style guides (Microsoft, Write the Docs)
4. Performance metrics in console output

## Testing the Enhancement

1. Compile the updated MCP server:
   ```bash
   cd mcp-server
   deno task compile
   ```

2. Install the new version:
   ```bash
   aichaku mcp --install
   ```

3. Restart Claude Code

4. Ask Claude to review a markdown file - you'll see the MCP activity in the
   console!

## Benefits

1. **Transparency**: No more wondering if MCP is working
2. **Documentation Quality**: Automatic enforcement of doc standards
3. **Consistency**: Same tooling for code and docs
4. **Education**: Learn documentation best practices through feedback
