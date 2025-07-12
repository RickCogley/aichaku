/**
 * GitHub Workflow Tools
 * MCP tools for GitHub Actions workflow management
 */

import type { GitHubClient, GitHubWorkflowRun } from "../github/client.ts";

export const workflowTools = {
  async listRuns(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
      workflow?: string;
      status?: string;
      limit?: number;
      branch?: string;
    },
  ) {
    const { owner, repo, workflow, status, limit = 10, branch } = args;

    try {
      const runs = await client.listWorkflowRuns(owner, repo, workflow, {
        status,
        limit,
        branch,
      });

      if (runs.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `📋 No workflow runs found for ${owner}/${repo}${
                workflow ? ` (${workflow})` : ""
              }`,
            },
          ],
        };
      }

      let responseText = `📋 GitHub Actions Workflow Runs

**Repository:** ${owner}/${repo}
${workflow ? `**Workflow:** ${workflow}\n` : ""}${
        status ? `**Status:** ${status}\n` : ""
      }${branch ? `**Branch:** ${branch}\n` : ""}
**Found:** ${runs.length} runs

`;

      for (const run of runs) {
        const duration = run.run_started_at
          ? Math.round(
            (new Date(run.updated_at).getTime() -
              new Date(run.run_started_at).getTime()) / 1000,
          )
          : 0;

        const statusIcon = run.status === "completed"
          ? (run.conclusion === "success" ? "✅" : "❌")
          : run.status === "in_progress"
          ? "🔄"
          : "⏳";

        responseText += `## ${statusIcon} ${run.name} (#${run.id})
**Branch:** ${run.head_branch}
**Status:** ${run.status}${run.conclusion ? ` (${run.conclusion})` : ""}
**Duration:** ${duration > 0 ? `${duration}s` : "N/A"}
**Started:** ${new Date(run.run_started_at || run.created_at).toLocaleString()}
**SHA:** ${run.head_sha.substring(0, 7)}
🔗 [View Run](${run.html_url})

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
            text: `❌ Failed to list workflow runs: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },

  async viewRun(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
      runId: number;
    },
  ) {
    const { owner, repo, runId } = args;

    try {
      const run = await client.getWorkflowRun(owner, repo, runId);

      const duration = run.run_started_at
        ? Math.round(
          (new Date(run.updated_at).getTime() -
            new Date(run.run_started_at).getTime()) / 1000,
        )
        : 0;

      const statusIcon = run.status === "completed"
        ? (run.conclusion === "success" ? "✅" : "❌")
        : run.status === "in_progress"
        ? "🔄"
        : "⏳";

      const responseText = `📋 GitHub Actions Workflow Run Details

${statusIcon} **${run.name}** (#${run.id})

**Repository:** ${owner}/${repo}
**Branch:** ${run.head_branch}
**Commit:** ${run.head_sha.substring(0, 7)}
**Status:** ${run.status}
**Conclusion:** ${run.conclusion || "N/A"}
**Duration:** ${duration > 0 ? `${duration}s` : "N/A"}

**Timeline:**
- **Created:** ${new Date(run.created_at).toLocaleString()}
- **Started:** ${
        new Date(run.run_started_at || run.created_at).toLocaleString()
      }
- **Updated:** ${new Date(run.updated_at).toLocaleString()}

🔗 [View on GitHub](${run.html_url})

**Workflow ID:** ${run.workflow_id}
**Run ID:** ${run.id}

${
        run.status === "in_progress"
          ? "🔄 This run is still in progress. Use `run_watch` to monitor it."
          : ""
      }
${
        run.status === "completed" && run.conclusion === "failure"
          ? "❌ This run failed. Check the logs for details."
          : ""
      }
${
        run.status === "completed" && run.conclusion === "success"
          ? "✅ This run completed successfully."
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
            text: `❌ Failed to view workflow run: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },

  async watchRun(
    client: GitHubClient,
    args: {
      owner: string;
      repo: string;
      runId: number;
      timeout?: number;
      pollInterval?: number;
    },
  ) {
    const {
      owner,
      repo,
      runId,
      timeout = 600000, // 10 minutes
      pollInterval = 10000, // 10 seconds
    } = args;

    try {
      const startTime = Date.now();
      let lastStatus = "";
      let lastConclusion = "";

      const checkRun = async () => {
        const run = await client.getWorkflowRun(owner, repo, runId);

        // Check if status or conclusion changed
        if (run.status !== lastStatus || run.conclusion !== lastConclusion) {
          lastStatus = run.status;
          lastConclusion = run.conclusion || "";

          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const statusIcon = run.status === "completed"
            ? (run.conclusion === "success" ? "✅" : "❌")
            : run.status === "in_progress"
            ? "🔄"
            : "⏳";

          console.error(
            `${statusIcon} Run ${runId}: ${run.status}${
              run.conclusion ? ` (${run.conclusion})` : ""
            } - ${elapsed}s elapsed`,
          );
        }

        return run;
      };

      // Initial check
      const run = await checkRun();

      // If already completed, return immediately
      if (run.status === "completed") {
        const duration = run.run_started_at
          ? Math.round(
            (new Date(run.updated_at).getTime() -
              new Date(run.run_started_at).getTime()) / 1000,
          )
          : 0;

        const statusIcon = run.conclusion === "success" ? "✅" : "❌";

        return {
          content: [
            {
              type: "text",
              text: `${statusIcon} Workflow Run Completed

**Run:** ${run.name} (#${run.id})
**Status:** ${run.status}
**Conclusion:** ${run.conclusion}
**Duration:** ${duration}s
**Branch:** ${run.head_branch}

🔗 [View on GitHub](${run.html_url})`,
            },
          ],
        };
      }

      // Monitor the run
      const monitorPromise = new Promise<GitHubWorkflowRun>(
        (resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const currentRun = await checkRun();

              if (currentRun.status === "completed") {
                clearInterval(interval);
                resolve(currentRun);
              }

              // Check timeout
              if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(
                  new Error(`Monitoring timeout after ${timeout / 1000}s`),
                );
              }
            } catch (error) {
              clearInterval(interval);
              reject(error);
            }
          }, pollInterval);
        },
      );

      // Wait for completion or timeout
      const finalRun = await monitorPromise;

      const duration = finalRun.run_started_at
        ? Math.round(
          (new Date(finalRun.updated_at).getTime() -
            new Date(finalRun.run_started_at).getTime()) / 1000,
        )
        : 0;

      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      const statusIcon = finalRun.conclusion === "success" ? "✅" : "❌";

      return {
        content: [
          {
            type: "text",
            text: `${statusIcon} Workflow Run Monitoring Complete

**Run:** ${finalRun.name} (#${finalRun.id})
**Status:** ${finalRun.status}
**Conclusion:** ${finalRun.conclusion}
**Duration:** ${duration}s
**Monitor Time:** ${totalElapsed}s
**Branch:** ${finalRun.head_branch}

🔗 [View on GitHub](${finalRun.html_url})

${
              finalRun.conclusion === "success"
                ? "✅ Run completed successfully!"
                : "❌ Run failed - check logs for details."
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to watch workflow run: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  },
};
