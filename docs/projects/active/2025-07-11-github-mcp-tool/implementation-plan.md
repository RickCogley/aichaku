# GitHub MCP Tool - Implementation Plan

## Phase 1: Core Release Operations (Priority 1)

Focus on the operations most critical for the nagare post-release workflow:

### Essential Tools
1. **`mcp__github__release_upload`** - Upload assets to releases
2. **`mcp__github__release_view`** - Check release status  
3. **`mcp__github__run_list`** - List workflow runs
4. **`mcp__github__run_view`** - Get workflow run details
5. **`mcp__github__run_watch`** - Monitor workflow progress
6. **`mcp__github__auth_status`** - Verify authentication

### Use Cases
- **Post-Release Asset Upload**: Replace shell `gh release upload` 
- **Workflow Monitoring**: Watch CI/CD workflows after release
- **Release Verification**: Confirm release was published correctly
- **Authentication Check**: Ensure GitHub access before operations

## Phase 2: Repository Management (Priority 2) 

### Key Tools
1. **`mcp__github__repo_view`** - Get repository information
2. **`mcp__github__pr_create`** - Create pull requests  
3. **`mcp__github__pr_list`** - List pull requests
4. **`mcp__github__pr_checks`** - Monitor PR status
5. **`mcp__github__issue_create`** - Create issues
6. **`mcp__github__issue_list`** - List issues

### Use Cases
- **Automated PR Creation**: Create PRs from release branches
- **Issue Management**: Auto-create issues from release notes
- **Repository Status**: Check repo health and statistics

## Phase 3: Actions & Workflows (Priority 3)

### Key Tools
1. **`mcp__github__workflow_run`** - Trigger workflows
2. **`mcp__github__cache_clear`** - Clear Actions caches
3. **`mcp__github__secret_list`** - Manage secrets
4. **`mcp__github__variable_set`** - Set variables

### Use Cases
- **Release Workflows**: Trigger additional workflows post-release
- **Cache Management**: Clear caches when needed
- **Secret Management**: Update deployment secrets

## Implementation Architecture

### MCP Server Structure
```
github-mcp-server/
├── src/
│   ├── server.ts              # Main MCP server
│   ├── auth/
│   │   ├── manager.ts         # Authentication handling
│   │   └── token-store.ts     # Secure token storage
│   ├── tools/
│   │   ├── release.ts         # Release operations
│   │   ├── workflow.ts        # Workflow operations  
│   │   ├── repository.ts      # Repository operations
│   │   └── auth.ts           # Authentication tools
│   ├── github/
│   │   ├── client.ts         # GitHub API client
│   │   ├── types.ts          # GitHub API types
│   │   └── errors.ts         # Error handling
│   └── utils/
│       ├── retry.ts          # Retry logic
│       ├── progress.ts       # Progress tracking
│       └── validation.ts     # Input validation
├── deno.json
└── README.md
```

### Key Components

#### Authentication Manager
```typescript
class GitHubAuthManager {
  async authenticate(): Promise<string>
  async validateToken(token: string): Promise<boolean>
  async refreshToken(): Promise<string>
  getAuthHeaders(): Record<string, string>
}
```

#### GitHub Client
```typescript
class GitHubClient {
  async request<T>(endpoint: string, options?: RequestOptions): Promise<T>
  async uploadAsset(releaseId: number, filePath: string): Promise<Asset>
  async watchWorkflow(runId: number, timeout: number): Promise<WorkflowRun>
}
```

#### Retry Logic
```typescript
interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T>
```

## Integration Points

### Current Nagare Configuration (Problem)
The current `nagare.config.ts` postRelease hook relies on shell `gh` command:

```typescript
// Current problematic implementation in nagare.config.ts
postRelease: [
  async () => {
    console.log("🔨 Building and uploading binaries...");

    // Build binaries and upload them to the GitHub release
    const buildCmd = new Deno.Command("deno", {
      args: ["run", "-A", "./scripts/build-binaries.ts", "--upload"],
      stdout: "inherit",
      stderr: "inherit",
    });

    const result = await buildCmd.output();
    if (!result.success) {
      console.error("⚠️  Binary build/upload failed - continuing anyway");
      // Don't throw - this is post-release, so the release already succeeded
    } else {
      console.log("✅ Binaries uploaded to GitHub release");
    }
  },
]
```

**Issues:**
- Depends on `gh` CLI being in PATH
- No error recovery or retry logic  
- Limited visibility into upload progress
- Context dependency can cause failures

### Updated Nagare Configuration (Solution)
Replace shell-based approach with MCP tools:

```typescript
// Updated nagare.config.ts using GitHub MCP tools
import { VERSION } from "./version.ts";

// Helper function to use MCP tools from hooks
async function useMCPTool(toolName: string, args: any) {
  // This would be implemented as part of nagare's MCP integration
  // For now, this is conceptual - shows the intended interface
  console.log(`🔧 Using MCP tool: ${toolName}`);
  
  // In practice, nagare would need to integrate with Claude Code's MCP system
  // or provide its own MCP client for hook execution
  throw new Error("MCP integration not yet implemented in nagare");
}

export default {
  // ... existing config ...
  
  hooks: {
    preRelease: [
      // ... existing preRelease hooks ...
    ],
    postRelease: [
      async () => {
        console.log("🔨 Building and uploading binaries using GitHub MCP...");

        try {
          // First, build binaries locally (still needed)
          console.log("📦 Building binaries...");
          const buildCmd = new Deno.Command("deno", {
            args: ["run", "-A", "./scripts/build-binaries.ts"], // No --upload flag
            stdout: "inherit", 
            stderr: "inherit",
          });

          const buildResult = await buildCmd.output();
          if (!buildResult.success) {
            throw new Error("Binary compilation failed");
          }

          // Check GitHub authentication
          console.log("🔍 Checking GitHub authentication...");
          await useMCPTool("mcp__github__auth_status", {});

          // Upload binaries using MCP (deterministic, reliable)
          console.log("📤 Uploading binaries to GitHub release...");
          await useMCPTool("mcp__github__release_upload", {
            tag: `v${VERSION}`,
            assets: [
              `./dist/aichaku-${VERSION}-linux-x64`,
              `./dist/aichaku-${VERSION}-macos-arm64`,
              `./dist/aichaku-${VERSION}-macos-x64`, 
              `./dist/aichaku-${VERSION}-windows-x64.exe`,
              `./dist/mcp-code-reviewer-${VERSION}-linux-x64`,
              `./dist/mcp-code-reviewer-${VERSION}-macos-arm64`,
              `./dist/mcp-code-reviewer-${VERSION}-macos-x64`,
              `./dist/mcp-code-reviewer-${VERSION}-windows-x64.exe`,
              `./dist/checksums-${VERSION}.txt`
            ],
            overwrite: true
          });

          // Monitor any active CI/CD workflows
          console.log("🔍 Checking for active workflows...");
          const activeRuns = await useMCPTool("mcp__github__run_list", {
            workflow: "publish.yml",
            status: "in_progress",
            limit: 5
          });

          if (activeRuns.length > 0) {
            console.log(`🔄 Monitoring ${activeRuns.length} active workflow(s)...`);
            
            for (const run of activeRuns) {
              await useMCPTool("mcp__github__run_watch", {
                runId: run.id,
                timeout: 600000, // 10 minutes
                pollInterval: 10000 // 10 seconds
              });
            }
          }

          // Verify final release status
          console.log("✅ Verifying release...");
          const release = await useMCPTool("mcp__github__release_view", {
            tag: `v${VERSION}`
          });
          
          console.log(`🎉 Release ${release.tag_name} completed with ${release.assets.length} assets`);

        } catch (error) {
          console.error("❌ Post-release operations failed:", error);
          // Don't throw - release already succeeded, this is just cleanup
          console.log("⚠️  Continuing despite post-release failure...");
        }
      },
    ],
  },
}
```

### Claude Code Settings
```json
{
  "mcpServers": {
    "github": {
      "command": "/path/to/github-mcp-server",
      "args": [],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Nagare Integration Strategy

Since nagare runs outside of Claude Code context, we need a bridge between nagare hooks and MCP tools:

#### Option 1: Standalone MCP Client for Nagare
Create a lightweight MCP client that nagare can use directly:

```typescript
// src/nagare-mcp-client.ts
export class NagareMCPClient {
  constructor(private mcpServerPath: string) {}
  
  async callTool(toolName: string, args: any): Promise<any> {
    const process = new Deno.Command(this.mcpServerPath, {
      stdin: "piped",
      stdout: "piped", 
      stderr: "piped"
    });
    
    const child = process.spawn();
    
    // Send MCP request
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: toolName, arguments: args }
    };
    
    await child.stdin.write(new TextEncoder().encode(JSON.stringify(request) + "\n"));
    await child.stdin.close();
    
    // Read response
    const output = await child.output();
    const response = JSON.parse(new TextDecoder().decode(output.stdout));
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.result;
  }
}

// Usage in nagare.config.ts
import { NagareMCPClient } from "./src/nagare-mcp-client.ts";

const mcpClient = new NagareMCPClient("./github-mcp-server/dist/github-mcp-server");

async function useMCPTool(toolName: string, args: any) {
  return await mcpClient.callTool(toolName, args);
}
```

#### Option 2: Enhanced Build Script
Update `build-binaries.ts` to use GitHub API directly:

```typescript
// scripts/build-binaries.ts - Enhanced with GitHub API
import { GitHubAPI } from "./github-api.ts"; // Create this

async function uploadBinaries() {
  const github = new GitHubAPI(Deno.env.get("GITHUB_TOKEN"));
  const tag = `v${VERSION}`;
  
  // More reliable upload with retry logic
  await github.uploadReleaseAssets(tag, [
    `./dist/aichaku-${VERSION}-linux-x64`,
    // ... other binaries
  ]);
}
```

#### Option 3: GitHub Actions Integration
Move binary uploads to GitHub Actions workflow:

```yaml
# .github/workflows/upload-binaries.yml
name: Upload Release Binaries
on:
  release:
    types: [published]

jobs:
  upload-binaries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1
      - name: Build binaries
        run: deno run -A scripts/build-binaries.ts
      - name: Upload to release
        run: gh release upload ${{ github.event.release.tag_name }} ./dist/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Recommended Approach
**Option 1 (Standalone MCP Client)** provides the best solution because:
- Reuses existing GitHub MCP server
- Provides deterministic, reliable uploads
- Can be used by other tools beyond nagare
- Maintains consistency with Claude Code workflows

### Implementation Steps for Nagare Integration

1. **Phase 1**: Create standalone MCP client
2. **Phase 2**: Update `build-binaries.ts` to separate build from upload
3. **Phase 3**: Update `nagare.config.ts` to use MCP client
4. **Phase 4**: Test complete workflow
5. **Phase 5**: Document for other nagare users

This ensures that the GitHub MCP tool solves the original context dependency problem in nagare's postRelease hooks.

## Error Handling Strategy

### Rate Limiting
```typescript
class RateLimitHandler {
  async handleRateLimit(response: Response): Promise<void> {
    const resetTime = response.headers.get('x-ratelimit-reset');
    const remaining = response.headers.get('x-ratelimit-remaining');
    
    if (remaining === '0') {
      const waitTime = (parseInt(resetTime) * 1000) - Date.now();
      console.log(`Rate limited. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

### Network Errors
```typescript
class NetworkErrorHandler {
  async handleNetworkError(error: Error, attempt: number): Promise<boolean> {
    if (attempt >= 3) return false;
    
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    console.log(`Network error, retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return true;
  }
}
```

## Testing Strategy

### Unit Tests
- Test each tool in isolation
- Mock GitHub API responses
- Test error conditions and retry logic
- Validate input parameters

### Integration Tests  
- Test against real GitHub API (with test repo)
- Test authentication flows
- Test rate limiting behavior
- Test large file uploads

### End-to-End Tests
- Test complete release workflow
- Test workflow monitoring
- Test error recovery scenarios

## Deployment

### Local Development
```bash
# Build the MCP server
deno task compile --output ./dist/github-mcp-server

# Install locally
cp ./dist/github-mcp-server ~/.aichaku/mcp-servers/

# Configure Claude Code
# Add to claude_desktop_settings.json
```

### Distribution
- Include in aichaku CLI as `aichaku mcp --install-github`
- Auto-configure Claude Code settings
- Provide setup wizard for GitHub token

## Success Metrics

1. **Reliability**: 99.9% success rate for release operations
2. **Performance**: Release asset uploads complete within expected time
3. **Error Recovery**: Automatic recovery from transient failures
4. **User Experience**: Clear progress feedback and error messages
5. **Maintenance**: Minimal configuration required

This implementation plan provides a clear path to building a robust GitHub MCP tool that will make all GitHub operations from Claude Code completely reliable and deterministic.