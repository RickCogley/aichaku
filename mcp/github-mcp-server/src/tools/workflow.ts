/**
 * GitHub Workflow Tools
 * MCP tools for GitHub Actions workflow management
 */

import type { GitHubClient, GitHubWorkflowRun } from "../github/client.ts";
import { format, ICONS } from "../formatting-system.ts";

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
              text: format.info(
                `No workflow runs found for ${owner}/${repo}${workflow ? ` (${workflow})` : ""}`,
              ),
            },
          ],
        };
      }

      let responseText = format.header("GitHub Actions Workflow Runs") + "\n";
      responseText += format.separator() + "\n\n";
      responseText += format.field("Repository", `${owner}/${repo}`) + "\n";
      if (workflow) responseText += format.field("Workflow", workflow) + "\n";
      if (status) responseText += format.field("Status", status) + "\n";
      if (branch) {
        responseText += format.field("Branch", `${ICONS.BRANCH} ${branch}`) +
          "\n";
      }
      responseText += format.field("Found", `${runs.length} runs`) + "\n";
      responseText += format.separator() + "\n";

      for (const run of runs) {
        responseText += "\n" + format.workflowRun(run, false) + "\n";
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
            text: `❌ Failed to list workflow runs: ${error instanceof Error ? error.message : String(error)}`,
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

      let responseText = format.header("GitHub Actions Workflow Run Details") +
        "\n";
      responseText += format.separator() + "\n\n";

      // Use the detailed view from our formatting system
      responseText += format.workflowRun(run, true) + "\n";

      responseText += "\n" + format.section("Details");
      responseText += format.field("Repository", `${owner}/${repo}`) + "\n";
      responseText += format.field("Workflow ID", run.workflow_id.toString()) +
        "\n";
      responseText += format.field("Run Number", run.run_number.toString()) +
        "\n";

      responseText += "\n" + format.section("Timeline");
      responseText += format.listItem(
        `Created: ${new Date(run.created_at).toLocaleString()}`,
      ) + "\n";
      responseText += format.listItem(
        `Started: ${new Date(run.run_started_at || run.created_at).toLocaleString()}`,
      ) + "\n";
      responseText += format.listItem(
        `Updated: ${new Date(run.updated_at).toLocaleString()}`,
      ) + "\n";

      // Add status-specific messages
      if (run.status === "in_progress") {
        responseText += "\n" +
          format.info(
            "This run is still in progress. Use run_watch to monitor it.",
          );
      } else if (run.status === "completed" && run.conclusion === "failure") {
        responseText += "\n" +
          format.error("This run failed. Check the logs for details.");
      } else if (run.status === "completed" && run.conclusion === "success") {
        responseText += "\n" +
          format.success("This run completed successfully.");
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
            text: `❌ Failed to view workflow run: ${error instanceof Error ? error.message : String(error)}`,
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
        const _duration = run.run_started_at
          ? Math.round(
            (new Date(run.updated_at).getTime() -
              new Date(run.run_started_at).getTime()) / 1000,
          )
          : 0;

        const _statusIcon = run.conclusion === "success" ? "✅" : "❌";

        return {
          content: [
            {
              type: "text",
              text: format.header("Workflow Run Already Completed") + "\n" +
                format.separator() + "\n\n" +
                format.workflowRun(run, true),
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
      const _statusIcon = finalRun.conclusion === "success" ? "✅" : "❌";

      return {
        content: [
          {
            type: "text",
            text: format.header("Workflow Run Monitoring Complete") + "\n" +
              format.separator() + "\n\n" +
              format.workflowRun(finalRun, true) + "\n\n" +
              format.section("Monitoring Summary") +
              format.field("Monitor Time", format.duration(totalElapsed)) +
              "\n" +
              format.field("Total Duration", format.duration(duration)) +
              "\n\n" +
              (finalRun.conclusion === "success"
                ? format.success("Run completed successfully!")
                : format.error("Run failed - check logs for details.")),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to watch workflow run: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};
