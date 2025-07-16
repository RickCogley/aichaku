# Task: Add Blocklist/Exclusion Feature to MCP Reviewer

## Overview

Add a blocklist/exclusion feature to the MCP reviewer hook to allow users to exclude certain file types or patterns from review processing.

## Requirements

### 1. Configuration Support

The blocklist should be configurable through:
- Command-line options: `--exclude` or `--ignore`
- Configuration file: `.aichaku/reviewer-config.yaml`
- Environment variables: `AICHAKU_REVIEWER_EXCLUDE`

### 2. Pattern Types to Support

```yaml
# Example configuration
reviewer:
  exclude:
    # File extensions
    extensions:
      - ".min.js"
      - ".min.css"
      - ".map"
      - ".lock"
      
    # Glob patterns
    patterns:
      - "**/node_modules/**"
      - "**/dist/**"
      - "**/build/**"
      - "**/*.generated.*"
      - "**/vendor/**"
      
    # Specific files
    files:
      - "package-lock.json"
      - "yarn.lock"
      - "poetry.lock"
      
    # Size-based exclusions
    max_file_size: "1MB"  # Skip files larger than this
```

### 3. Implementation Details

#### 3.1 Hook Integration

The MCP reviewer hook should check exclusions before processing:

```typescript
async function shouldReviewFile(filePath: string, config: ReviewerConfig): Promise<boolean> {
  // Check file extension
  if (config.exclude?.extensions?.some(ext => filePath.endsWith(ext))) {
    return false;
  }
  
  // Check glob patterns
  if (config.exclude?.patterns?.some(pattern => minimatch(filePath, pattern))) {
    return false;
  }
  
  // Check specific files
  if (config.exclude?.files?.includes(basename(filePath))) {
    return false;
  }
  
  // Check file size
  if (config.exclude?.max_file_size) {
    const stats = await Deno.stat(filePath);
    if (stats.size > parseSize(config.exclude.max_file_size)) {
      return false;
    }
  }
  
  return true;
}
```

#### 3.2 Default Exclusions

Provide sensible defaults that users can override:

```typescript
const DEFAULT_EXCLUSIONS = {
  extensions: ['.min.js', '.min.css', '.map', '.lock'],
  patterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/*.generated.*'
  ],
  files: ['package-lock.json', 'yarn.lock', 'poetry.lock', 'Gemfile.lock'],
  max_file_size: '500KB'
};
```

#### 3.3 CLI Options

```bash
# Exclude specific patterns
aichaku review --exclude "*.min.js" --exclude "**/dist/**"

# Use config file
aichaku review --config .aichaku/reviewer-config.yaml

# Disable default exclusions
aichaku review --no-default-exclusions
```

### 4. User Feedback

When files are excluded, provide clear feedback:

```
🔍 MCP Reviewer Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files reviewed: 42
Files excluded: 18
  - 12 files in node_modules/
  - 4 minified files (*.min.js)
  - 2 lock files

Exclusion rules applied:
  ✓ Default exclusions
  ✓ Custom pattern: **/*.test.js
```

### 5. Integration with Existing Features

The blocklist should work seamlessly with:
- File selection (`--files`)
- Category filtering (`--category`)
- External tool integration
- Batch processing

### 6. Performance Considerations

- Apply exclusions early in the pipeline to avoid unnecessary file reads
- Cache exclusion checks for repeated runs
- Use efficient pattern matching libraries

### 7. Error Handling

Handle edge cases gracefully:
- Invalid glob patterns
- Conflicting inclusion/exclusion rules
- Missing configuration files
- Invalid size specifications

## Implementation Priority

**Priority: Medium**

While not critical for core functionality, this feature will significantly improve user experience by:
- Reducing noise from irrelevant files
- Speeding up review processes
- Allowing project-specific customization

## Testing Requirements

1. Unit tests for pattern matching logic
2. Integration tests with various file structures
3. Performance tests with large codebases
4. Configuration validation tests

## Documentation Updates

Update the following documentation:
- CLI help text for review command
- Configuration file examples
- User guide with common exclusion patterns
- API documentation for programmatic usage

## Estimated Effort

- Implementation: 2-3 days
- Testing: 1 day
- Documentation: 0.5 days
- **Total: 3.5-4.5 days**

## Related to YAML Integration Project

This feature is separate from the YAML integration redesign but should be kept in mind for:
- Consistent configuration approaches
- Potential shared configuration file structure
- Similar pattern matching needs