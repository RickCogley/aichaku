# GitHub MCP Tool Pitch

## Problem

The current release process relies on the `gh` CLI being available in the shell context during the `postRelease` hook.
This can fail due to:

- Context switching during automated releases
- Authentication issues in different environments
- Shell PATH problems
- Missing `gh` binary in CI/CD environments

## Solution: GitHub MCP Tool

Create a dedicated MCP tool for GitHub operations that can:

1. Handle authentication properly
2. Upload release binaries reliably
3. Manage GitHub operations independent of shell context
4. Provide better error handling and reporting

## Key Features

### Core Tools

- `mcp__github__upload*release*assets` - Upload files to GitHub releases
- `mcp__github__create_release` - Create GitHub releases
- `mcp__github__get*release*info` - Get release information
- `mcp__github__manage_repository` - Repository management operations

### Benefits

- **Reliability**: No dependency on shell context or PATH
- **Authentication**: Proper token management
- **Error Handling**: Better error reporting and retry logic
- **Reusability**: Can be used for other GitHub operations
- **CI/CD Friendly**: Works in any environment

## Implementation Plan

1. Create `github-mcp-server` as separate tool
2. Register in Claude Code settings
3. Update `nagare.config.ts` to use MCP tool instead of `gh` CLI
4. Test with actual release process

## Usage Example

```typescript
// In nagare.config.ts postRelease hook
postRelease: [
  async () => {
    // Use MCP tool instead of shell command
    await claude.useTool("mcp__github__upload*release*assets", {
      tag: `v${VERSION}`,
      assets: [
        "./dist/aichaku-*.exe",
        "./dist/aichaku-*",
        "./dist/mcp-code-reviewer-*",
      ],
    });
  },
];
```

## Next Steps

1. Create proof-of-concept GitHub MCP server
2. Test with current release
3. Integrate into nagare workflow
4. Document for other users facing similar issues
