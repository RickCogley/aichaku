/**
 * GitHub Version Tools
 * MCP tools for version compatibility and GitHub CLI monitoring
 */

import type { GitHubClient } from "../github/client.ts";

export const versionTools = {
  async info(client: GitHubClient, _args: unknown) {
    try {
      // Get GitHub API version info
      const githubVersion = await client.checkVersion();

      // Get local GitHub CLI version if available
      let ghVersion = "not installed";
      let ghCompatible = false;

      try {
        const ghCmd = new Deno.Command("gh", {
          args: ["--version"],
          stdout: "piped",
          stderr: "piped",
        });

        const result = await ghCmd.output();
        if (result.success) {
          const output = new TextDecoder().decode(result.stdout);
          const versionMatch = output.match(/gh version (\d+\.\d+\.\d+)/);
          if (versionMatch) {
            ghVersion = versionMatch[1];
            ghCompatible = true;
          }
        }
      } catch {
        // gh CLI not available
      }

      const responseText = `🔍 GitHub Version Compatibility Information

## 🐙 GitHub API
**Version:** ${githubVersion.version}
**Compatible:** ${githubVersion.compatible ? "✅ Yes" : "❌ No"}
**Status:** ${
        githubVersion.compatible
          ? "All API operations available"
          : "API access limited"
      }

## 🛠️ GitHub CLI (gh)
**Version:** ${ghVersion}
**Available:** ${ghCompatible ? "✅ Yes" : "❌ No"}
**Status:** ${ghCompatible ? "Fallback CLI available" : "CLI not installed"}

## 🔗 MCP Integration
**MCP Server:** GitHub MCP Server v0.1.0
**Transport:** stdio (Standard Input/Output)
**Authentication:** Token-based (GitHub Personal Access Token)

## 📊 Compatibility Matrix
| Operation | MCP Server | GitHub CLI | Recommendation |
|-----------|------------|------------|----------------|
| Release Upload | ✅ | ${
        ghCompatible ? "✅" : "❌"
      } | Use MCP for deterministic results |
| Workflow Monitoring | ✅ | ${
        ghCompatible ? "✅" : "❌"
      } | Use MCP for real-time monitoring |
| Authentication | ✅ | ${
        ghCompatible ? "✅" : "❌"
      } | Use MCP for secure token management |
| Repository Info | ✅ | ${
        ghCompatible ? "✅" : "❌"
      } | Use MCP for structured data |

## 🎯 Benefits of MCP Server
- **Deterministic**: No dependency on external CLI tools
- **Context-aware**: Runs in Claude Code's execution context
- **Secure**: Token management within MCP protocol
- **Reliable**: No "falling out of context" issues
- **Structured**: Consistent data formats and error handling

${
        !ghCompatible
          ? "⚠️ **Note:** GitHub CLI not detected. MCP server provides complete GitHub functionality without external dependencies."
          : ""
      }`;

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to get version info: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },

  async checkCompatibility(
    _client: GitHubClient,
    args: { ghVersion?: string },
  ) {
    const { ghVersion } = args;

    try {
      // Check if a specific GitHub CLI version is compatible
      let targetVersion = ghVersion;

      if (!targetVersion) {
        // Auto-detect current gh version
        try {
          const ghCmd = new Deno.Command("gh", {
            args: ["--version"],
            stdout: "piped",
            stderr: "piped",
          });

          const result = await ghCmd.output();
          if (result.success) {
            const output = new TextDecoder().decode(result.stdout);
            const versionMatch = output.match(/gh version (\d+\.\d+\.\d+)/);
            if (versionMatch) {
              targetVersion = versionMatch[1];
            }
          }
        } catch {
          // gh CLI not available
        }
      }

      if (!targetVersion) {
        return {
          content: [
            {
              type: "text",
              text: `❌ GitHub CLI version not found

**No version specified** and GitHub CLI not detected on system.

**Recommendation:** Use GitHub MCP Server for all GitHub operations. It provides:
- Complete GitHub API coverage
- No external dependencies
- Deterministic behavior
- Secure token management`,
            },
          ],
        };
      }

      // Parse version
      const [major, minor, patch] = targetVersion.split(".").map(Number);

      // Version compatibility rules
      const isCompatible = major >= 2 && minor >= 0; // GitHub CLI 2.0+ is generally stable
      const isRecommended = major >= 2 && minor >= 70; // Recent versions with better stability

      let status = "✅ Compatible";
      let recommendation = "GitHub CLI version is compatible with MCP server.";

      if (!isCompatible) {
        status = "❌ Incompatible";
        recommendation =
          "GitHub CLI version is too old. Update to v2.0+ or use MCP server exclusively.";
      } else if (!isRecommended) {
        status = "⚠️ Compatible (old)";
        recommendation =
          "GitHub CLI version is compatible but old. Consider updating or using MCP server.";
      }

      const responseText = `🔍 GitHub CLI Compatibility Check

**Target Version:** ${targetVersion}
**Status:** ${status}
**Major Version:** ${major}
**Minor Version:** ${minor}
**Patch Version:** ${patch}

## 📋 Compatibility Assessment
${recommendation}

## 🔄 Version Upgrade Impact
${
        major >= 2 && minor >= 75
          ? "✅ Recent version - minimal breaking changes expected"
          : ""
      }
${
        major >= 2 && minor >= 70 && minor < 75
          ? "⚠️ Moderate version - some feature changes possible"
          : ""
      }
${
        major >= 2 && minor < 70
          ? "❌ Older version - significant changes possible in newer versions"
          : ""
      }
${major < 2 ? "❌ Very old version - major breaking changes in v2.0+" : ""}

## 🎯 MCP Server Advantages
- **No Version Dependencies**: Works regardless of GitHub CLI version
- **Consistent API**: Same interface across all GitHub operations
- **Better Error Handling**: Structured error responses
- **Real-time Monitoring**: Native support for workflow watching
- **Secure Token Management**: Integrated authentication

## 💡 Recommendation
**Use GitHub MCP Server** for all automated operations (like release uploads) to avoid CLI version dependencies and ensure deterministic behavior.`;

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to check compatibility: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },
};
