/**
 * GitHub Repository Tools
 * MCP tools for GitHub repository management
 */

import type { GitHubClient } from "../github/client.ts";

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

      const responseText = `📋 GitHub Repository Details

**Repository:** ${repository.full_name}
**Description:** ${repository.description || "No description"}
**Visibility:** ${repository.private ? "Private" : "Public"}
**Default Branch:** ${repository.default_branch}

🔗 **Links:**
- [Repository](${repository.html_url})
- [Clone HTTPS](${repository.clone_url})
- [Clone SSH](${repository.ssh_url})

**Repository ID:** ${repository.id}`;

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

      let responseText = `📋 GitHub Repositories

**Type:** ${type}
**Sort:** ${sort} (${direction})
**Found:** ${repositories.length} repositories

`;

      for (const repo of repositories) {
        const visibility = repo.private ? "Private" : "Public";

        responseText += `## ${repo.full_name}
**Description:** ${repo.description || "No description"}
**Visibility:** ${visibility}
**Default Branch:** ${repo.default_branch}
🔗 [View Repository](${repo.html_url})

`;
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
