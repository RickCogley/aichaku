/**
 * GitHub Repository Tools
 * MCP tools for GitHub repository management
 */

import type { GitHubClient } from "../github/client.ts";
import { format } from "./formatting.ts";

export const repositoryTools = {
  async view(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
    },
  ) {
    const { owner, repo } = args;

    try {
      const repository = await client.getRepository(owner, repo);

      let responseText = `📋 GitHub Repository Details\n`;
      responseText += `${format.separator(40)}\n\n`;

      responseText += `Repository: ${repository.full_name}\n`;
      responseText += `Description: ${
        repository.description || "No description"
      }\n`;
      responseText += `Visibility: ${
        repository.private ? "Private" : "Public"
      }\n`;
      responseText += `Default Branch: ${repository.default_branch}\n`;

      responseText += `\n🔗 Links:\n`;
      responseText += `  • Repository: ${repository.html_url}\n`;
      responseText += `  • Clone HTTPS: ${repository.clone_url}\n`;
      responseText += `  • Clone SSH: ${repository.ssh_url}\n`;

      responseText += `\nRepository ID: ${repository.id}`;

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
            text: `❌ Failed to view repository: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },

  async list(
    client: GitHubClient,
    args: {
      type?: "all" | "owner" | "member";
      sort?: "created" | "updated" | "pushed" | "full_name";
      direction?: "asc" | "desc";
      limit?: number;
    },
  ) {
    const { type = "owner", sort = "updated", direction = "desc", limit = 10 } =
      args;

    try {
      const repositories = await client.listRepositories({
        type,
        sort,
        direction,
        limit,
      });

      if (repositories.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `📋 No repositories found for the current user`,
            },
          ],
        };
      }

      let responseText = `📋 GitHub Repositories\n`;
      responseText += `${format.separator(40)}\n\n`;

      responseText += `Type: ${type}\n`;
      responseText += `Sort: ${sort} (${direction})\n`;
      responseText += `Found: ${repositories.length} repositories\n`;
      responseText += `${format.separator(40)}\n`;

      for (const repo of repositories) {
        const visibility = repo.private ? "Private" : "Public";

        responseText += `\n${repo.full_name}\n`;
        responseText += `${"─".repeat(repo.full_name.length)}\n`;
        responseText += `  Description: ${
          repo.description || "No description"
        }\n`;
        responseText += `  Visibility: ${visibility}\n`;
        responseText += `  Default Branch: ${repo.default_branch}\n`;
        responseText += `  🔗 ${repo.html_url}\n`;
      }

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
            text: `❌ Failed to list repositories: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },
};
