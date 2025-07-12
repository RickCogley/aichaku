/**
 * GitHub Release Tools
 * MCP tools for GitHub release management
 */

import { GitHubClient } from "../github/client.ts";
import { exists } from "@std/fs";

export const releaseTools = {
  async upload(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
      tag: string;
      assets: string[];
      overwrite?: boolean;
    },
  ) {
    const { owner, repo, tag, assets, overwrite = false } = args;

    if (!assets || assets.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "❌ No assets specified for upload",
          },
        ],
        isError: true,
      };
    }

    try {
      // Get the release
      const release = await client.getRelease(owner, repo, tag);

      const results = [];
      const errors = [];

      for (const assetPath of assets) {
        try {
          // Check if file exists
          if (!await exists(assetPath)) {
            errors.push(`File not found: ${assetPath}`);
            continue;
          }

          // Get file info
          const fileInfo = await Deno.stat(assetPath);
          const fileName = assetPath.split("/").pop() || assetPath;

          // Upload asset
          const uploadedAsset = await client.uploadReleaseAsset(
            owner,
            repo,
            release.id,
            assetPath,
            fileName,
            overwrite,
          );

          results.push({
            name: uploadedAsset.name,
            size: uploadedAsset.size,
            url: uploadedAsset.browser_download_url,
          });
        } catch (error) {
          errors.push(
            `${assetPath}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      const successCount = results.length;
      const errorCount = errors.length;

      let responseText = `🚀 GitHub Release Asset Upload Results

**Release:** ${release.name} (${tag})
**Repository:** ${owner}/${repo}
**Success:** ${successCount} assets uploaded
**Errors:** ${errorCount} failures

`;

      if (results.length > 0) {
        responseText += "## ✅ Successfully Uploaded:\n";
        for (const result of results) {
          const sizeMB = (result.size / 1024 / 1024).toFixed(1);
          responseText += `- **${result.name}** (${sizeMB} MB)\n`;
          responseText += `  📥 [Download](${result.url})\n\n`;
        }
      }

      if (errors.length > 0) {
        responseText += "## ❌ Failed Uploads:\n";
        for (const error of errors) {
          responseText += `- ${error}\n`;
        }
      }

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
        isError: errorCount > 0 && successCount === 0,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Release upload failed: ${
              error instanceof Error ? error.message : String(error)
            }

**Common issues:**
- Release ${tag} does not exist
- Insufficient permissions (needs 'repo' scope)
- Network connectivity issues
- Invalid repository path ${owner}/${repo}`,
          },
        ],
        isError: true,
      };
    }
  },

  async view(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
      tag: string;
    },
  ) {
    const { owner, repo, tag } = args;

    try {
      const release = await client.getRelease(owner, repo, tag);

      const assetCount = release.assets.length;
      const totalSize = release.assets.reduce(
        (sum, asset) => sum + asset.size,
        0,
      );
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);

      let responseText = `📋 GitHub Release Details

**Release:** ${release.name}
**Tag:** ${release.tag_name}
**Repository:** ${owner}/${repo}
**Status:** ${
        release.draft
          ? "Draft"
          : release.prerelease
          ? "Pre-release"
          : "Published"
      }
**Created:** ${new Date(release.created_at).toLocaleDateString()}
**Published:** ${
        release.published_at
          ? new Date(release.published_at).toLocaleDateString()
          : "Not published"
      }

## 📖 Description
${release.body || "No description provided"}

## 📦 Assets (${assetCount} files, ${totalSizeMB} MB total)

`;

      if (release.assets.length > 0) {
        for (const asset of release.assets) {
          const sizeMB = (asset.size / 1024 / 1024).toFixed(1);
          const downloads = asset.download_count;
          responseText +=
            `- **${asset.name}** (${sizeMB} MB, ${downloads} downloads)\n`;
          responseText += `  📥 [Download](${asset.browser_download_url})\n`;
          responseText += `  📅 Uploaded: ${
            new Date(asset.created_at).toLocaleDateString()
          }\n\n`;
        }
      } else {
        responseText += "_No assets attached to this release_\n";
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
            text: `❌ Failed to view release: ${
              error instanceof Error ? error.message : String(error)
            }

**Common issues:**
- Release ${tag} does not exist
- Repository ${owner}/${repo} is private or not accessible
- Network connectivity issues`,
          },
        ],
        isError: true,
      };
    }
  },

  async list(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
      limit?: number;
    },
  ) {
    const { owner, repo, limit = 10 } = args;

    try {
      const releases = await client.listReleases(owner, repo, limit);

      if (releases.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `📋 No releases found for ${owner}/${repo}`,
            },
          ],
        };
      }

      let responseText = `📋 GitHub Releases for ${owner}/${repo}

Found ${releases.length} releases:

`;

      for (const release of releases) {
        const assetCount = release.assets.length;
        const status = release.draft
          ? "Draft"
          : release.prerelease
          ? "Pre-release"
          : "Published";
        const date = new Date(release.published_at || release.created_at)
          .toLocaleDateString();

        responseText += `## ${release.name} (${release.tag_name})
**Status:** ${status}
**Date:** ${date}
**Assets:** ${assetCount} files
**Description:** ${release.body?.substring(0, 100) || "No description"}${
          release.body && release.body.length > 100 ? "..." : ""
        }

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
            text: `❌ Failed to list releases: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },
};
