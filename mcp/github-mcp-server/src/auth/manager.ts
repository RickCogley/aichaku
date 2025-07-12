/**
 * GitHub Authentication Manager
 * Handles token storage and authentication state
 */

import { join } from "@std/path";
import { ensureDir, exists } from "@std/fs";

export interface GitHubAuthStatus {
  authenticated: boolean;
  user?: {
    login: string;
    name: string;
    email: string;
    avatar_url: string;
  };
  token?: string;
  expiresAt?: Date;
}

export class GitHubAuthManager {
  private tokenFile: string;
  private cachedToken?: string;

  constructor() {
    const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!homeDir) {
      throw new Error("Could not determine home directory");
    }

    // Store GitHub auth separately from Aichaku reviewer
    const authDir = join(homeDir, ".aichaku", "github-auth");
    this.tokenFile = join(authDir, "token");

    // Ensure directory exists
    ensureDir(authDir).catch(() => {
      // Directory creation failed, but we'll handle it during token operations
    });
  }

  async getToken(): Promise<string | null> {
    if (this.cachedToken) {
      return this.cachedToken;
    }

    // Try environment variable first
    const envToken = Deno.env.get("GITHUB_TOKEN");
    if (envToken) {
      this.cachedToken = envToken;
      return envToken;
    }

    // Try stored token file
    try {
      if (await exists(this.tokenFile)) {
        const token = await Deno.readTextFile(this.tokenFile);
        this.cachedToken = token.trim();
        return this.cachedToken;
      }
    } catch (error) {
      console.error("Error reading GitHub token:", error);
    }

    return null;
  }

  async setToken(token: string): Promise<void> {
    this.cachedToken = token;

    try {
      await ensureDir(join(this.tokenFile, ".."));
      await Deno.writeTextFile(this.tokenFile, token);

      // Set restrictive permissions (owner read/write only)
      await Deno.chmod(this.tokenFile, 0o600);
    } catch (error) {
      console.error("Error storing GitHub token:", error);
      throw new Error("Failed to store GitHub token securely");
    }
  }

  async clearToken(): Promise<void> {
    this.cachedToken = undefined;

    try {
      if (await exists(this.tokenFile)) {
        await Deno.remove(this.tokenFile);
      }
    } catch (error) {
      console.error("Error clearing GitHub token:", error);
    }
  }

  async getAuthStatus(): Promise<GitHubAuthStatus> {
    const token = await this.getToken();
    if (!token) {
      return { authenticated: false };
    }

    try {
      // Verify token by making a request to GitHub
      const response = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "Aichaku-GitHub-MCP/1.0.0",
        },
      });

      if (!response.ok) {
        await this.clearToken();
        return { authenticated: false };
      }

      const user = await response.json();
      return {
        authenticated: true,
        user: {
          login: user.login,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
        token: token.substring(0, 8) + "...", // Partially masked for display
      };
    } catch (error) {
      console.error("Error verifying GitHub token:", error);
      return { authenticated: false };
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "Aichaku-GitHub-MCP/1.0.0",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error validating GitHub token:", error);
      return false;
    }
  }
}
