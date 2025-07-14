/**
 * GitHub Release Tools
 * MCP tools for GitHub release management
 */

import type { GitHubClient } from "../github/client.ts";
import { exists } from "@std/fs";
import { format } from "../formatting-system.ts";

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
            text: format.error("No assets specified for upload"),
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
          await Deno.stat(assetPath); // Verify file exists
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

      let responseText =
        format.header("GitHub Release Asset Upload Results", "🚀") + "\n";
      responseText += format.separator() + "\n\n";
      responseText += format.field("Release", `${release.name} (${tag})`) +
        "\n";
      responseText += format.field("Repository", `${owner}/${repo}`) + "\n";
      responseText +=
        format.field("Success", `${successCount} assets uploaded`) + "\n";
      responseText += format.field("Errors", `${errorCount} failures`) + "\n";

      if (results.length > 0) {
        responseText += "\n" + format.section("Successfully Uploaded");
        for (const result of results) {
          const sizeMB = (result.size / 1024 / 1024).toFixed(1);
          responseText += format.listItem(`${result.name} (${sizeMB} MB)`) +
            "\n";
          responseText += format.link("Download", result.url) + "\n";
        }
      }

      if (errors.length > 0) {
        responseText += "\n" + format.section("Failed Uploads");
        for (const error of errors) {
          responseText += format.listItem(error) + "\n";
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
            text: format.error("Release upload failed") + "\n" +
              format.field(
                "Error",
                error instanceof Error ? error.message : String(error),
              ) + "\n\n" +
              format.section("Common Issues") +
              format.listItem(`Release ${tag} does not exist`) + "\n" +
              format.listItem("Insufficient permissions (needs 'repo' scope)") +
              "\n" +
              format.listItem("Network connectivity issues") + "\n" +
              format.listItem(`Invalid repository path ${owner}/${repo}`),
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

      let responseText = format.header("GitHub Release Details", "📋") + "\n";
      responseText += format.separator() + "\n\n";
      responseText += format.field("Release", release.name) + "\n";
      responseText += format.field("Tag", release.tag_name) + "\n";
      responseText += format.field("Repository", `${owner}/${repo}`) + "\n";
      responseText += format.field(
        "Status",
        release.draft
          ? "Draft"
          : release.prerelease
          ? "Pre-release"
          : "Published",
      ) + "\n";
      responseText += format.field(
        "Created",
        new Date(release.created_at).toLocaleDateString(),
      ) + "\n";
      responseText += format.field(
        "Published",
        release.published_at
          ? new Date(release.published_at).toLocaleDateString()
          : "Not published",
      ) + "\n";

      responseText += "\n" + format.section("Description");
      responseText += (release.body || "No description provided") + "\n";

      responseText += "\n" +
        format.section(`Assets (${assetCount} files, ${totalSizeMB} MB total)`);

      if (release.assets.length > 0) {
        for (const asset of release.assets) {
          const sizeMB = (asset.size / 1024 / 1024).toFixed(1);
          const downloads = asset.download_count;
          responseText += format.listItem(
            `${asset.name} (${sizeMB} MB, ${downloads} downloads)`,
          ) + "\n";
          responseText += "  " +
            format.link("Download", asset.browser_download_url) + "\n";
          responseText += format.field(
            "  Uploaded",
            new Date(asset.created_at).toLocaleDateString(),
          ) + "\n";
        }
      } else {
        responseText += format.info("No assets attached to this release") +
          "\n";
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
            text: format.error("Failed to view release") + "\n" +
              format.field(
                "Error",
                error instanceof Error ? error.message : String(error),
              ) + "\n\n" +
              format.section("Common Issues") +
              format.listItem(`Release ${tag} does not exist`) + "\n" +
              format.listItem(
                `Repository ${owner}/${repo} is private or not accessible`,
              ) + "\n" +
              format.listItem("Network connectivity issues"),
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
              text: format.info(`No releases found for ${owner}/${repo}`),
            },
          ],
        };
      }

      let responseText =
        format.header(`GitHub Releases for ${owner}/${repo}`, "📋") + "\n";
      responseText += format.separator() + "\n\n";
      responseText += format.field("Found", `${releases.length} releases`) +
        "\n\n";

      for (const release of releases) {
        const assetCount = release.assets.length;
        const status = release.draft
          ? "Draft"
          : release.prerelease
          ? "Pre-release"
          : "Published";
        const date = new Date(release.published_at || release.created_at)
          .toLocaleDateString();

        responseText += format.section(`${release.name} (${release.tag_name})`);
        responseText += format.field("Status", status) + "\n";
        responseText += format.field("Date", date) + "\n";
        responseText += format.field("Assets", `${assetCount} files`) + "\n";
        responseText += format.field(
          "Description",
          `${release.body?.substring(0, 100) || "No description"}${
            release.body && release.body.length > 100 ? "..." : ""
          }`,
        ) + "\n\n";
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
