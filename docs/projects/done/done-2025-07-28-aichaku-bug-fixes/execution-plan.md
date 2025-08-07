# Aichaku Bug Fixes - Execution Plan

## Overview

We need to fix three main categories of bugs that are breaking core functionality in v0.36.1.

## 1. Fix Methodology Configuration (Priority: HIGH)

### Problem

- `setMethodology()` in config-manager.ts writes to `project.methodology` instead of `methodologies.selected`
- Only supports single methodology, should support multiple
- Inconsistent config structure

### Solution

#### A. Update ConfigManager (config-manager.ts)

```typescript
// Replace setMethodology with:
async setMethodologies(methodologies: string[]): Promise<void> {
  await this.update({
    methodologies: {
      selected: methodologies
    }
  });
  // Remove project.methodology if it exists
  const config = this.get();
  if (config.project?.methodology) {
    delete config.project.methodology;
    await this.save();
  }
}

// Add getter for methodologies
getMethodologies(): string[] {
  return this.get().methodologies?.selected || [];
}
```

#### B. Update methodologies.ts command

- Change from `setMethodology(single)` to `setMethodologies(array)`
- Support multiple methodology selection
- Update `--show` to display from correct location
- Update `--remove` to work with array

## 2. Fix Help/Learn Commands (Priority: MEDIUM)

### Problem

- Two commands doing similar things confuses users
- Documentation shows old `help` command
- `learn --compare` is broken

### Solution

#### A. Make help alias to learn (cli.ts)

```typescript
case "help": {
  console.log("ℹ️  Note: 'aichaku help' is deprecated. Use 'aichaku learn' instead.\n");
  // Forward all arguments to learn command
  return learn(options);
}
```

#### B. Fix learn --compare

- Debug why comparison is failing
- Ensure methodology data is loaded correctly

#### C. Update all documentation

- Replace `help` with `learn` in README.md
- Update command examples

## 3. Fix MCP Commands (Priority: HIGH)

### Problem Analysis

- `--config`: Checks for wrong binary path (looks for single mcp-code-reviewer instead of multiple servers)
- `--tools`: Currently just calls `displayTools()` which shows status, not actual tools
- Installation paths inconsistent

### Solution

#### A. Fix --config command

```typescript
// Check for new multi-server structure
const serversPath = join(homeDir, ".aichaku", "mcp-servers");
const hasReviewer = await exists(join(serversPath, "aichaku-code-reviewer"));
const hasGithub = await exists(join(serversPath, "github-operations"));

if (!hasReviewer && !hasGithub) {
  console.log("❌ No MCP servers installed");
  console.log("💡 Run 'aichaku mcp --install' to install servers");
  return;
}
```

#### B. Fix --tools to show actual tools

```typescript
// Instead of showing status, list available tools:
- aichaku-reviewer tools:
  - review_file
  - review_methodology
  - get_standards
  - get_statistics
  - analyze_project
  - generate_documentation
  - create_doc_template
  
- github-operations tools:
  - auth_status
  - auth_login
  - release_upload
  - etc...
```

## 4. Add Config Migration

### Create migration utility

```typescript
// Automatically fix broken configs on load
if (config.project?.methodology && !config.methodologies?.selected) {
  config.methodologies = {
    selected: [config.project.methodology],
  };
  delete config.project.methodology;
  await this.save();
}
```

## Testing Plan

After implementation:

1. Test methodology add/remove with multiple selections
2. Test help → learn forwarding
3. Test all MCP commands
4. User provides screenshots for verification
5. Fix any remaining issues

## Rollout

1. Fix critical bugs (methodology, MCP)
2. Add help→learn forwarding
3. Update documentation
4. Test thoroughly
5. Release as v0.36.2
