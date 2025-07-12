/**
 * GitHub API Client
 * Handles all GitHub API communications with proper error handling and rate limiting
 */

import type { GitHubAuthManager } from "../auth/manager.ts";

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: GitHubAsset[];
}

export interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  created_at: string;
  browser_download_url: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  workflow_id: number;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
}

export class GitHubClient {
  private baseUrl = "https://api.github.com";
  private authManager: GitHubAuthManager;

  constructor(authManager: GitHubAuthManager) {
    this.authManager = authManager;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await this.authManager.getToken();
    if (!token) {
      throw new Error("GitHub authentication required. Please login first.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Aichaku-GitHub-MCP/1.0.0",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${error}`);
    }

    return response;
  }

  // Release operations
  async getRelease(
    owner: string,
    repo: string,
    tag: string,
  ): Promise<GitHubRelease> {
    const response = await this.makeRequest(
      `/repos/${owner}/${repo}/releases/tags/${tag}`,
    );
    return await response.json();
  }

  async listReleases(
    owner: string,
    repo: string,
    limit = 10,
  ): Promise<GitHubRelease[]> {
    const response = await this.makeRequest(
      `/repos/${owner}/${repo}/releases?per_page=${limit}`,
    );
    return await response.json();
  }

  async uploadReleaseAsset(
    owner: string,
    repo: string,
    releaseId: number,
    filePath: string,
    fileName: string,
    overwrite = false,
  ): Promise<GitHubAsset> {
    // Get release by ID to check existing assets
    const releaseResponse = await this.makeRequest(
      `/repos/${owner}/${repo}/releases/${releaseId}`,
    );
    const release = await releaseResponse.json();
    const existingAsset = release.assets.find((asset: any) =>
      asset.name === fileName
    );

    if (existingAsset && !overwrite) {
      throw new Error(
        `Asset ${fileName} already exists. Use overwrite=true to replace.`,
      );
    }

    // Delete existing asset if overwriting
    if (existingAsset && overwrite) {
      await this.deleteReleaseAsset(owner, repo, existingAsset.id);
    }

    // Read file
    const fileData = await Deno.readFile(filePath);
    const fileSize = fileData.length;

    // Upload asset
    const uploadUrl =
      `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets`;
    const uploadResponse = await this.makeRequest(
      `${uploadUrl}?name=${encodeURIComponent(fileName)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": fileSize.toString(),
        },
        body: fileData,
      },
    );

    return await uploadResponse.json();
  }

  async deleteReleaseAsset(
    owner: string,
    repo: string,
    assetId: number,
  ): Promise<void> {
    await this.makeRequest(
      `/repos/${owner}/${repo}/releases/assets/${assetId}`,
      {
        method: "DELETE",
      },
    );
  }

  // Workflow operations
  async listWorkflowRuns(
    owner: string,
    repo: string,
    workflowId?: string,
    options: {
      status?: string;
      limit?: number;
      branch?: string;
    } = {},
  ): Promise<GitHubWorkflowRun[]> {
    let endpoint = `/repos/${owner}/${repo}/actions/runs`;

    if (workflowId) {
      endpoint = `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`;
    }

    const params = new URLSearchParams();
    if (options.status) params.set("status", options.status);
    if (options.branch) params.set("branch", options.branch);
    if (options.limit) params.set("per_page", options.limit.toString());

    const query = params.toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;

    const response = await this.makeRequest(fullEndpoint);
    const data = await response.json();
    return data.workflow_runs;
  }

  async getWorkflowRun(
    owner: string,
    repo: string,
    runId: number,
  ): Promise<GitHubWorkflowRun> {
    const response = await this.makeRequest(
      `/repos/${owner}/${repo}/actions/runs/${runId}`,
    );
    return await response.json();
  }

  async getWorkflowRunLogs(
    owner: string,
    repo: string,
    runId: number,
  ): Promise<string> {
    const response = await this.makeRequest(
      `/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
    );
    return await response.text();
  }

  // Repository operations
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await this.makeRequest(`/repos/${owner}/${repo}`);
    return await response.json();
  }

  async listRepositories(options: {
    type?: "all" | "owner" | "member";
    sort?: "created" | "updated" | "pushed" | "full_name";
    direction?: "asc" | "desc";
    limit?: number;
  } = {}): Promise<GitHubRepository[]> {
    const params = new URLSearchParams();
    if (options.type) params.set("type", options.type);
    if (options.sort) params.set("sort", options.sort);
    if (options.direction) params.set("direction", options.direction);
    if (options.limit) params.set("per_page", options.limit.toString());

    const query = params.toString();
    const endpoint = query ? `/user/repos?${query}` : "/user/repos";

    const response = await this.makeRequest(endpoint);
    return await response.json();
  }

  // User operations
  async getCurrentUser(): Promise<any> {
    const response = await this.makeRequest("/user");
    return await response.json();
  }

  async getUser(username: string): Promise<any> {
    const response = await this.makeRequest(`/users/${username}`);
    return await response.json();
  }

  // Rate limit information
  async getRateLimit(): Promise<any> {
    const response = await this.makeRequest("/rate_limit");
    return await response.json();
  }

  // Version compatibility check
  async checkVersion(): Promise<{ version: string; compatible: boolean }> {
    try {
      const response = await this.makeRequest("/");
      const data = await response.json();

      // GitHub API is stable, so we're always compatible
      return {
        version: data.current_user_url ? "v3" : "unknown",
        compatible: true,
      };
    } catch (error) {
      return {
        version: "unknown",
        compatible: false,
      };
    }
  }
}
