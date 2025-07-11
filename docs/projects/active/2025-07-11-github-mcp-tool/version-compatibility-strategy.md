# GitHub CLI Version Compatibility Strategy

## Problem Statement

The GitHub CLI (`gh`) receives regular updates through package managers like Homebrew. The GitHub MCP tool needs to be aware of:

1. **Which `gh` version was used as reference** during MCP development
2. **Current `gh` version** on the system (if any)
3. **API compatibility changes** that might affect MCP behavior
4. **Feature parity** between MCP tools and current `gh` capabilities

## Version Tracking Architecture

### 1. Compilation-Time Version Recording

Record the reference `gh` version during MCP server compilation:

```typescript
// src/version-info.ts
export interface GitHubCLIVersionInfo {
  compiledAgainst: string;        // gh version used as reference
  compilationDate: string;        // When MCP was built
  apiVersion: string;             // GitHub API version targeted
  supportedFeatures: string[];   // List of supported gh features
}

// Generated during build process
export const GH_VERSION_INFO: GitHubCLIVersionInfo = {
  compiledAgainst: "2.74.2",
  compilationDate: "2025-07-11T23:00:00Z",
  apiVersion: "2022-11-28",
  supportedFeatures: [
    "release_upload",
    "workflow_run",
    "auth_token",
    // ... complete feature list
  ]
};
```

### 2. Runtime Version Detection

Detect current system `gh` version and compare:

```typescript
// src/version/detector.ts
export class GitHubCLIDetector {
  async getCurrentVersion(): Promise<string | null> {
    try {
      const cmd = new Deno.Command("gh", {
        args: ["--version"],
        stdout: "piped",
        stderr: "piped",
      });
      
      const result = await cmd.output();
      if (!result.success) return null;
      
      const output = new TextDecoder().decode(result.stdout);
      const match = output.match(/gh version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    } catch {
      return null; // gh not installed
    }
  }

  async checkCompatibility(): Promise<CompatibilityStatus> {
    const currentVersion = await this.getCurrentVersion();
    
    return {
      mcpVersion: GH_VERSION_INFO.compiledAgainst,
      systemVersion: currentVersion,
      status: this.compareVersions(GH_VERSION_INFO.compiledAgainst, currentVersion),
      recommendations: this.getRecommendations(currentVersion),
    };
  }

  private compareVersions(mcpVersion: string, systemVersion: string | null): VersionStatus {
    if (!systemVersion) return "gh_not_installed";
    
    const mcpParts = mcpVersion.split('.').map(Number);
    const sysParts = systemVersion.split('.').map(Number);
    
    // Major version change (potentially breaking)
    if (sysParts[0] > mcpParts[0]) return "major_upgrade_available";
    if (sysParts[0] < mcpParts[0]) return "system_outdated";
    
    // Minor version change (new features)
    if (sysParts[1] > mcpParts[1]) return "minor_upgrade_available";
    if (sysParts[1] < mcpParts[1]) return "system_behind";
    
    // Patch version change (bug fixes)
    if (sysParts[2] > mcpParts[2]) return "patch_upgrade_available";
    if (sysParts[2] < mcpParts[2]) return "system_patch_behind";
    
    return "compatible";
  }

  private getRecommendations(systemVersion: string | null): string[] {
    const recommendations: string[] = [];
    
    if (!systemVersion) {
      recommendations.push("Consider installing GitHub CLI for debugging: brew install gh");
      recommendations.push("MCP provides all functionality - gh CLI optional");
    }
    
    const status = this.compareVersions(GH_VERSION_INFO.compiledAgainst, systemVersion);
    
    switch (status) {
      case "major_upgrade_available":
        recommendations.push("⚠️  Major gh upgrade available - MCP may be missing new features");
        recommendations.push("Consider updating GitHub MCP server to latest version");
        break;
        
      case "minor_upgrade_available":
        recommendations.push("ℹ️  Minor gh upgrade available - new features may be available");
        recommendations.push("Current MCP functionality should remain stable");
        break;
        
      case "system_outdated":
        recommendations.push("System gh CLI is outdated compared to MCP reference version");
        recommendations.push("MCP provides more recent functionality than system gh");
        break;
    }
    
    return recommendations;
  }
}

type VersionStatus = 
  | "compatible"
  | "gh_not_installed" 
  | "major_upgrade_available"
  | "minor_upgrade_available"
  | "patch_upgrade_available"
  | "system_outdated"
  | "system_behind"
  | "system_patch_behind";

interface CompatibilityStatus {
  mcpVersion: string;
  systemVersion: string | null;
  status: VersionStatus;
  recommendations: string[];
}
```

### 3. Version Awareness Tools

Add MCP tools for version checking:

```typescript
// Add to MCP server tools
{
  name: "version_info",
  description: "Get GitHub CLI version compatibility information",
  inputSchema: {
    type: "object",
    properties: {
      checkSystem: {
        type: "boolean",
        description: "Check system gh CLI version",
        default: true,
      }
    },
    additionalProperties: false,
  },
},
{
  name: "version_check",
  description: "Check compatibility with system GitHub CLI",
  inputSchema: {
    type: "object", 
    properties: {},
    additionalProperties: false,
  },
}
```

### 4. Build Process Integration

Update build script to capture version information:

```typescript
// scripts/capture-gh-version.ts
async function captureGitHubCLIVersion() {
  console.log("📋 Capturing GitHub CLI version information...");
  
  let ghVersion = "unknown";
  let apiVersion = "2022-11-28"; // Default stable API version
  
  try {
    // Get gh version
    const versionCmd = new Deno.Command("gh", {
      args: ["--version"],
      stdout: "piped",
    });
    const versionResult = await versionCmd.output();
    
    if (versionResult.success) {
      const output = new TextDecoder().decode(versionResult.stdout);
      const match = output.match(/gh version (\d+\.\d+\.\d+)/);
      ghVersion = match ? match[1] : "unknown";
    }
    
    // Get API version (if available)
    const apiCmd = new Deno.Command("gh", {
      args: ["api", "/", "--jq", ".current_user_url"],
      stdout: "piped",
    });
    const apiResult = await apiCmd.output();
    // API version detection logic here
    
  } catch (error) {
    console.warn("⚠️  Could not detect gh CLI version:", error);
  }
  
  // Generate version info file
  const versionInfo = {
    compiledAgainst: ghVersion,
    compilationDate: new Date().toISOString(),
    apiVersion: apiVersion,
    supportedFeatures: await getSupportedFeatures(),
  };
  
  const content = `// Auto-generated by build process
export const GH_VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)} as const;
`;
  
  await Deno.writeTextFile("./src/version-info.ts", content);
  console.log(`✅ Captured gh version: ${ghVersion}`);
}

async function getSupportedFeatures(): Promise<string[]> {
  // Query gh CLI for supported features
  const features: string[] = [];
  
  try {
    // Check for various gh commands
    const commands = ["release", "workflow", "pr", "issue", "repo"];
    
    for (const cmd of commands) {
      const testCmd = new Deno.Command("gh", {
        args: [cmd, "--help"],
        stdout: "piped",
        stderr: "piped",
      });
      
      const result = await testCmd.output();
      if (result.success) {
        features.push(cmd);
      }
    }
  } catch {
    // Fallback to known features
    features.push("release", "workflow", "auth");
  }
  
  return features;
}
```

### 5. User Interface Integration

Show version information in status displays:

```typescript
// Enhanced status display
async function displayVersionAwareness() {
  const detector = new GitHubCLIDetector();
  const compatibility = await detector.checkCompatibility();
  
  console.log(`\n🔄 ${colors.bold("Version Compatibility:")}`);
  console.log(`   ${colors.dim("MCP Reference:")} gh v${compatibility.mcpVersion}`);
  
  if (compatibility.systemVersion) {
    console.log(`   ${colors.dim("System gh CLI:")} v${compatibility.systemVersion}`);
    
    const statusColor = {
      "compatible": colors.green,
      "minor_upgrade_available": colors.yellow,
      "major_upgrade_available": colors.red,
      "system_outdated": colors.blue,
    }[compatibility.status] || colors.gray;
    
    console.log(`   ${colors.dim("Status:")} ${statusColor(compatibility.status)}`);
  } else {
    console.log(`   ${colors.dim("System gh CLI:")} ${colors.gray("Not installed")}`);
  }
  
  if (compatibility.recommendations.length > 0) {
    console.log(`\n📋 ${colors.bold("Recommendations:")}`);
    for (const rec of compatibility.recommendations) {
      console.log(`   ${rec}`);
    }
  }
}

// Example output scenarios:
//
// Scenario 1: Your recent upgrade (2.74.2 -> 2.75.0)
// 🔄 Version Compatibility:
//    MCP Reference: gh v2.74.2
//    System gh CLI: v2.75.0
//    Status: minor_upgrade_available
//
// 📋 Recommendations:
//    ℹ️  Minor gh upgrade available - new features may be available
//    Current MCP functionality should remain stable
//
// Scenario 2: Major version jump
// 🔄 Version Compatibility:
//    MCP Reference: gh v2.74.2
//    System gh CLI: v3.0.0
//    Status: major_upgrade_available
//
// 📋 Recommendations:
//    ⚠️  Major gh upgrade available - MCP may be missing new features
//    Consider updating GitHub MCP server to latest version
```

### 6. Integration with Aichaku CLI

Add version checking to aichaku MCP commands:

```bash
# Enhanced aichaku mcp commands
aichaku mcp --status          # Shows version compatibility
aichaku mcp --version-check   # Detailed version analysis
aichaku mcp --upgrade-check   # Check for MCP updates
```

## API Stability Considerations

### GitHub API Versioning
- Track GitHub API version used by MCP
- Monitor for API deprecation notices
- Provide migration paths for API changes

### Feature Parity Matrix
Maintain a matrix of features vs. versions:

```typescript
export const FEATURE_MATRIX = {
  "release_upload": {
    introducedIn: "1.0.0",
    stableIn: "2.0.0",
    apiEndpoint: "/repos/{owner}/{repo}/releases/{id}/assets",
  },
  "workflow_dispatch": {
    introducedIn: "1.10.0", 
    stableIn: "2.1.0",
    apiEndpoint: "/repos/{owner}/{repo}/actions/workflows/{id}/dispatches",
  },
  // ... more features
} as const;
```

## Migration Strategy

### When gh CLI Updates
1. **Patch Updates**: Usually safe, no MCP changes needed
2. **Minor Updates**: May add new features, consider MCP enhancement
3. **Major Updates**: Review for breaking changes, may require MCP update

### Automated Monitoring
```typescript
// Background version monitoring
setInterval(async () => {
  const detector = new GitHubCLIDetector();
  const compatibility = await detector.checkCompatibility();
  
  if (compatibility.status === "major_upgrade_available") {
    console.warn("⚠️  Major gh CLI upgrade detected - consider updating MCP");
  }
}, 24 * 60 * 60 * 1000); // Daily check
```

## Benefits

1. **Proactive Awareness**: Know when system and MCP are out of sync
2. **Debugging Aid**: Version mismatches often cause issues
3. **Migration Planning**: Plan MCP updates based on gh CLI changes
4. **User Confidence**: Clear status of compatibility
5. **Support Information**: Easy to provide version info for troubleshooting

This version compatibility strategy ensures that the GitHub MCP tool remains robust and provides clear visibility into any potential issues caused by version mismatches.