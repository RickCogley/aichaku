/**
 * GitHub Authentication Tools
 * MCP tools for GitHub authentication management
 */

import type { GitHubAuthManager } from "../auth/manager.ts";

export const authTools = {
  async status(authManager: GitHubAuthManager, _args: unknown) {
    const status = await authManager.getAuthStatus();

    if (status.authenticated) {
      return {
        content: [
          {
            type: "text",
            text: `✅ GitHub Authentication Status

**Status:** Authenticated
**User:** ${status.user?.name || status.user?.login}
**Login:** ${status.user?.login}
**Email:** ${status.user?.email || "Not public"}
**Token:** ${status.token} (masked)

🔗 GitHub API access is available for all operations.`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ GitHub Authentication Status

**Status:** Not authenticated

To authenticate with GitHub:
1. Generate a personal access token at https://github.com/settings/tokens
2. Use the \`auth_login\` tool with your token
3. Or set the \`GITHUB_TOKEN\` environment variable

**Required token permissions:**
- repo (for repository access)
- workflow (for GitHub Actions)
- read:user (for user information)`,
          },
        ],
      };
    }
  },

  async login(authManager: GitHubAuthManager, args: { token: string }) {
    const { token } = args;

    if (!token) {
      return {
        content: [
          {
            type: "text",
            text: "❌ GitHub token is required for authentication",
          },
        ],
        isError: true,
      };
    }

    try {
      // Validate token
      const isValid = await authManager.validateToken(token);
      if (!isValid) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Invalid GitHub token

Please check that your token:
1. Is correctly copied (no extra spaces)
2. Has the required permissions (repo, workflow, read:user)
3. Has not expired
4. Is from the correct GitHub account

Generate a new token at: https://github.com/settings/tokens`,
            },
          ],
          isError: true,
        };
      }

      // Store token
      await authManager.setToken(token);

      // Get user info
      const status = await authManager.getAuthStatus();

      return {
        content: [
          {
            type: "text",
            text: `✅ GitHub Authentication Successful

**Welcome:** ${status.user?.name || status.user?.login}
**Login:** ${status.user?.login}
**Email:** ${status.user?.email || "Not public"}

🔗 GitHub API access is now available for all operations.
🔐 Token stored securely in ~/.aichaku/github-auth/token

You can now use other GitHub MCP tools like:
- \`release_upload\` - Upload assets to releases
- \`release_view\` - View release details
- \`run_list\` - List workflow runs
- \`run_watch\` - Monitor workflow progress`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ GitHub authentication failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },

  async logout(authManager: GitHubAuthManager, _args: unknown) {
    try {
      await authManager.clearToken();

      return {
        content: [
          {
            type: "text",
            text: `✅ GitHub Logout Successful

🔓 Authentication token cleared from local storage.
🚫 GitHub API access is no longer available.

To re-authenticate, use the \`auth_login\` tool with a valid GitHub token.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Logout failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};
