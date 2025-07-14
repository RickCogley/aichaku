# Aichaku MCP Design

## Overview

A bespoke Model Context Protocol server for Aichaku that provides active code review capabilities based on user-selected standards and methodologies. Unlike the passive Aichaku CLI (which installs guidance files), the MCP actively reviews code against chosen standards.

## Architecture Decision: System-Wide vs Per-Project

### Recommended: **Hybrid Approach**

```
System-Wide Aichaku MCP (User Scope)
├── Reads standards from ~/.claude/methodologies/
├── Discovers project-specific selections from .aichaku-review.json
└── Provides review services to all Claude Code instances
```

**Why Hybrid?**
- **One MCP instance** serves all projects (efficiency)
- **Per-project configuration** for selected standards (flexibility)
- **Shared methodology knowledge** from global Aichaku installation
- **Project isolation** through configuration files

## Core Design

### 1. MCP Structure

```typescript
// aichaku-mcp/src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

interface AichakuReviewConfig {
  methodologies: string[];      // ["shape-up", "scrum"]
  standards: string[];          // ["owasp-web", "nist-csf", "google-typescript"]
  strictness: "relaxed" | "normal" | "strict";
}

class AichakuMCPServer {
  private globalMethodologiesPath = "~/.claude/methodologies";
  
  async initialize() {
    const server = new Server({
      name: "aichaku-reviewer",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    // Register tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "review_code",
          description: "Review code against selected Aichaku standards",
          inputSchema: {
            type: "object",
            properties: {
              files: { type: "array", items: { type: "string" } },
              diff: { type: "string" },
              context: { type: "string" }
            }
          }
        },
        {
          name: "list_active_standards",
          description: "Show which standards are active for this project",
          inputSchema: { type: "object", properties: {} }
        },
        {
          name: "configure_standards",
          description: "Update project's selected standards",
          inputSchema: {
            type: "object",
            properties: {
              add: { type: "array", items: { type: "string" } },
              remove: { type: "array", items: { type: "string" } }
            }
          }
        }
      ]
    }));

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "review_code":
          return await this.reviewCode(request.params.arguments);
        case "list_active_standards":
          return await this.listActiveStandards();
        case "configure_standards":
          return await this.configureStandards(request.params.arguments);
      }
    });

    // Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }

  private async reviewCode(args: any) {
    // 1. Detect project root
    const projectRoot = await this.findProjectRoot();
    
    // 2. Load project configuration
    const config = await this.loadProjectConfig(projectRoot);
    
    // 3. Load selected standards
    const standards = await this.loadStandards(config.standards);
    const methodologies = await this.loadMethodologies(config.methodologies);
    
    // 4. Build review prompt
    const prompt = this.buildReviewPrompt({
      files: args.files,
      diff: args.diff,
      standards,
      methodologies,
      strictness: config.strictness
    });
    
    // 5. Return structured review
    return {
      content: [{
        type: "text",
        text: await this.performReview(prompt, args)
      }]
    };
  }

  private async loadProjectConfig(projectRoot: string): Promise<AichakuReviewConfig> {
    const configPath = path.join(projectRoot, ".aichaku-review.json");
    
    if (await exists(configPath)) {
      return JSON.parse(await Deno.readTextFile(configPath));
    }
    
    // Default configuration
    return {
      methodologies: ["general"],
      standards: ["basic-security", "conventional-commits"],
      strictness: "normal"
    };
  }
}
```

### 2. Project Configuration File

```json
// .aichaku-review.json (in project root)
{
  "methodologies": ["shape-up"],
  "standards": [
    "owasp-web",
    "nist-csf",
    "google-typescript",
    "15-factor-apps"
  ],
  "strictness": "strict",
  "exclude": [
    "**/*.test.ts",
    "**/vendor/**"
  ],
  "custom_rules": {
    "max_file_size": 1000,
    "require_tests": true
  }
}
```

### 3. Claude Code Integration

#### User Configuration (~/.claude/settings.json)
```json
{
  "mcpServers": {
    "aichaku-reviewer": {
      "command": "deno",
      "args": ["run", "-A", "/usr/local/bin/aichaku-mcp"],
      "description": "Aichaku methodology-aware code reviewer"
    }
  }
}
```

#### Hook Integration
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "name": "Aichaku Review on Write",
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "mcp",
          "server": "aichaku-reviewer",
          "tool": "review_code",
          "params": {
            "files": ["${TOOL_INPUT_FILE_PATH}"],
            "context": "pre-write"
          }
        }]
      }
    ],
    "PostToolUse": [
      {
        "name": "Aichaku Review on Commit",
        "matcher": "Bash(git commit)",
        "hooks": [{
          "type": "mcp",
          "server": "aichaku-reviewer",
          "tool": "review_code",
          "params": {
            "diff": "${git diff --cached}",
            "context": "pre-commit"
          }
        }]
      }
    ]
  }
}
```

### 4. Usage Patterns

#### Interactive Review
```
You: Review my authentication implementation
Claude: I'll review your authentication code using Aichaku standards.

[Claude invokes MCP tool: review_code]

🪴 Aichaku Review Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Shape Up Compliance: PASSED
   - Implementation fits within 6-week appetite
   - No scope creep detected

⚠️  OWASP Security: WARNINGS
   - A02: Weak password hashing algorithm (use bcrypt/scrypt)
   - A07: Missing rate limiting on login endpoint

✅ Google TypeScript Style: PASSED
   - Clean code structure
   - Proper type annotations

❌ 15-Factor Apps: FAILED
   - Config not externalized (hardcoded values)
   - Missing health check endpoint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Hook-Based Automatic Review
When saving a file, the hook triggers:
```
🪴 Aichaku: Pre-write review detected 2 issues:
- Missing input validation on user email
- Function exceeds complexity threshold (cyclomatic: 12)

Proceed with write? (Issues logged for later review)
```

### 5. State Management

The MCP maintains minimal state:
- **No conversation history** (follows MCP principles)
- **Project detection** via working directory
- **Configuration caching** for performance
- **Standards loaded on-demand** from global Aichaku

### 6. Multi-Project Support

Single MCP instance handles multiple projects:

```typescript
class ProjectContextManager {
  private projectConfigs = new Map<string, AichakuReviewConfig>();
  
  async getConfigForPath(filePath: string): Promise<AichakuReviewConfig> {
    const projectRoot = await this.findProjectRoot(filePath);
    
    if (!this.projectConfigs.has(projectRoot)) {
      const config = await this.loadProjectConfig(projectRoot);
      this.projectConfigs.set(projectRoot, config);
    }
    
    return this.projectConfigs.get(projectRoot)!;
  }
}
```

### 7. Installation & Distribution

```bash
# Install Aichaku MCP globally
aichaku install-mcp

# What it does:
# 1. Compiles MCP server with Deno
# 2. Places binary in PATH
# 3. Adds configuration to Claude Code settings
# 4. Creates default .aichaku-review.json template

# Per-project setup
cd my-project
aichaku review init
# Creates .aichaku-review.json with selected standards
```

## Key Benefits

1. **One MCP, Many Projects**: System efficiency with project flexibility
2. **User Control**: Explicit standard selection per project
3. **Hook Integration**: Automatic reviews at key moments
4. **Passive + Active**: Aichaku guides (passive) + MCP reviews (active)
5. **Stateless Operation**: Follows MCP best practices
6. **Deno Alignment**: Same runtime as Aichaku for consistency

## Implementation Phases

### Phase 1: Core MCP (Week 1)
- Basic server structure
- Code review tool
- Project configuration loading
- Standard methodology reviews

### Phase 2: Standards Integration (Week 2)
- Load modular standards from Aichaku
- Multi-standard review aggregation
- Configurable strictness levels
- Custom rule support

### Phase 3: Polish & Distribution (Week 3)
- Deno compilation
- Installation automation
- Hook templates
- Documentation

This design provides a clean, efficient architecture that complements Aichaku's passive guidance with active review capabilities, all while respecting user choice and project boundaries.