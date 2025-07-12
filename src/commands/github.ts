/**
 * GitHub command for Aichaku
 * Comprehensive GitHub operations via MCP server
 *
 * This command provides a seamless interface to GitHub operations
 * for CI/CD pipelines, avoiding the need for bash script approvals.
 */

import { exists } from "@std/fs";
import { basename, resolve } from "@std/path";

export interface GitHubOptions {
  help?: boolean;

  // Authentication
  auth?: boolean;
  authStatus?: boolean;
  authLogin?: string; // token value

  // Releases
  release?: boolean;
  releaseUpload?: boolean;
  releaseView?: boolean;
  releaseList?: boolean;
  releaseCreate?: boolean;
  releaseEdit?: boolean;
  releaseDelete?: boolean;

  // Workflows
  run?: boolean;
  runList?: boolean;
  runView?: boolean;
  runWatch?: boolean;
  runLogs?: boolean;
  runRerun?: boolean;
  runCancel?: boolean;

  // Repositories
  repo?: boolean;
  repoView?: boolean;
  repoList?: boolean;
  repoCreate?: boolean;
  repoDelete?: boolean;
  repoClone?: boolean;

  // Issues
  issue?: boolean;
  issueList?: boolean;
  issueView?: boolean;
  issueCreate?: boolean;
  issueEdit?: boolean;
  issueClose?: boolean;
  issueComment?: boolean;

  // Pull Requests
  pr?: boolean;
  prList?: boolean;
  prView?: boolean;
  prCreate?: boolean;
  prEdit?: boolean;
  prMerge?: boolean;
  prClose?: boolean;
  prComment?: boolean;

  // Common options
  tag?: string;
  assets?: string[];
  owner?: string;
  repository?: string;
  runId?: number;
  issueNumber?: number;
  prNumber?: number;
  title?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  workflow?: string;
  status?: string;
  limit?: number;
  overwrite?: boolean;
  timeout?: number;
  pollInterval?: number;
}

export async function runGitHubCommand(
  options: GitHubOptions,
  args: string[],
): Promise<void> {
  if (options.help || args[0] === "help") {
    showGitHubHelp(args[1]);
    return;
  }

  // Check if GitHub MCP server is available
  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/github-operations";

  if (!await exists(serverPath)) {
    console.error("❌ GitHub MCP server not installed");
    console.error("Run: aichaku mcp --install-github");
    return;
  }

  // Parse subcommand structure: aichaku github [category] [action]
  const category = args[0]?.toLowerCase();
  const action = args[1]?.toLowerCase();

  try {
    switch (category) {
      case "auth":
        await handleAuth(action, options, args.slice(2));
        break;

      case "release":
        await handleRelease(action, options, args.slice(2));
        break;

      case "run":
      case "workflow":
        await handleWorkflow(action, options, args.slice(2));
        break;

      case "repo":
      case "repository":
        await handleRepository(action, options, args.slice(2));
        break;

      case "issue":
        await handleIssue(action, options, args.slice(2));
        break;

      case "pr":
      case "pull-request":
        await handlePullRequest(action, options, args.slice(2));
        break;

      // Quick shortcuts for common operations
      case "upload":
        await uploadReleaseAssets(options, args.slice(1));
        break;

      case "view":
        await viewRelease(options);
        break;

      case "status":
        await checkAuthStatus(options);
        break;

      default:
        if (category) {
          console.error(`❌ Unknown command: ${category}`);
        } else {
          console.error("❌ No command specified");
        }
        showGitHubHelp();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${errorMessage}`);
    if (errorMessage.includes("authentication")) {
      console.error("\n💡 Tip: Set GITHUB_TOKEN environment variable or run:");
      console.error("   aichaku github auth login <token>");
    }
  }
}

// Helper function to call GitHub MCP server
async function callGitHubMCP(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  const serverPath = Deno.env.get("HOME") +
    "/.aichaku/mcp-servers/github-operations";

  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args,
    },
  };

  const process = new Deno.Command(serverPath, {
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  const child = process.spawn();

  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(JSON.stringify(request) + "\n"));
  writer.releaseLock();

  await child.stdin.close();

  const output = await child.output();
  const response = new TextDecoder().decode(output.stdout);

  try {
    const jsonResponse = JSON.parse(response);
    if (jsonResponse.result?.content?.[0]?.text) {
      return jsonResponse.result.content[0].text;
    } else if (jsonResponse.error) {
      throw new Error(jsonResponse.error.message);
    }
    return null;
  } catch (_parseError) {
    throw new Error(`Failed to parse MCP response: ${response}`);
  }
}

// Authentication handlers
async function handleAuth(
  action: string,
  options: GitHubOptions,
  args: string[],
): Promise<void> {
  switch (action) {
    case "status":
      await checkAuthStatus(options);
      break;

    case "login":
      const token = args[0] || options.authLogin;
      if (!token) {
        console.error("❌ Token required: aichaku github auth login <token>");
        return;
      }
      await authLogin(token);
      break;

    default:
      console.error(`❌ Unknown auth command: ${action}`);
      console.log("Available: status, login");
  }
}

async function checkAuthStatus(_options: GitHubOptions): Promise<void> {
  console.log("🔐 Checking GitHub authentication status...");
  const result = await callGitHubMCP("auth_status", {});
  console.log(result);
}

async function authLogin(token: string): Promise<void> {
  console.log("🔐 Logging in to GitHub...");
  const result = await callGitHubMCP("auth_login", { token });
  console.log(result);
}

// Release handlers
async function handleRelease(
  action: string,
  options: GitHubOptions,
  args: string[],
): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();

  switch (action) {
    case "upload":
      await uploadReleaseAssets(options, args);
      break;

    case "view":
      await viewRelease(options);
      break;

    case "list":
      console.log(`📦 Listing releases for ${owner}/${repo}...`);
      // Note: The current MCP server doesn't have release_list, but we can add it
      console.log("⚠️  Release listing not yet implemented in MCP server");
      break;

    default:
      console.error(`❌ Unknown release command: ${action}`);
      console.log("Available: upload, view, list");
  }
}

async function uploadReleaseAssets(
  options: GitHubOptions,
  args: string[],
): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();
  const tag = options.tag || await getLatestTag();
  const assets = options.assets || args;

  if (!tag) {
    console.error("❌ No tag specified and couldn't determine latest tag");
    return;
  }

  if (assets.length === 0) {
    console.error("❌ No assets specified for upload");
    return;
  }

  console.log(`🚀 Uploading assets to ${owner}/${repo} release ${tag}...`);

  // Validate all assets exist
  const validAssets: string[] = [];
  for (const asset of assets) {
    const resolvedPath = resolve(asset);
    if (await exists(resolvedPath)) {
      validAssets.push(resolvedPath);
    } else {
      console.error(`⚠️  Asset not found: ${asset}`);
    }
  }

  if (validAssets.length === 0) {
    console.error("❌ No valid assets found");
    return;
  }

  const result = await callGitHubMCP("release_upload", {
    owner,
    repo,
    tag,
    assets: validAssets,
    overwrite: options.overwrite ?? true,
  });

  console.log(result);
}

async function viewRelease(options: GitHubOptions): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();
  const tag = options.tag || await getLatestTag();

  if (!tag) {
    console.error("❌ No tag specified and couldn't determine latest tag");
    return;
  }

  console.log(`📦 Viewing release ${tag} for ${owner}/${repo}...`);

  const result = await callGitHubMCP("release_view", {
    owner,
    repo,
    tag,
  });

  console.log(result);
}

// Workflow handlers
async function handleWorkflow(
  action: string,
  options: GitHubOptions,
  _args: string[],
): Promise<void> {

  switch (action) {
    case "list":
      await listWorkflowRuns(options);
      break;

    case "view":
      if (!options.runId) {
        console.error("❌ Run ID required: --run-id <id>");
        return;
      }
      await viewWorkflowRun(options);
      break;

    case "watch":
      if (!options.runId) {
        console.error("❌ Run ID required: --run-id <id>");
        return;
      }
      await watchWorkflowRun(options);
      break;

    default:
      console.error(`❌ Unknown workflow command: ${action}`);
      console.log("Available: list, view, watch");
  }
}

async function listWorkflowRuns(options: GitHubOptions): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();

  console.log(`🔄 Listing workflow runs for ${owner}/${repo}...`);

  const result = await callGitHubMCP("run_list", {
    owner,
    repo,
    workflow: options.workflow,
    status: options.status,
    limit: options.limit || 10,
  });

  console.log(result);
}

async function viewWorkflowRun(options: GitHubOptions): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();

  console.log(`🔍 Viewing workflow run ${options.runId}...`);

  const result = await callGitHubMCP("run_view", {
    owner,
    repo,
    runId: options.runId,
  });

  console.log(result);
}

async function watchWorkflowRun(options: GitHubOptions): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();

  console.log(`👀 Watching workflow run ${options.runId}...`);

  const result = await callGitHubMCP("run_watch", {
    owner,
    repo,
    runId: options.runId,
    timeout: options.timeout || 600000,
    pollInterval: options.pollInterval || 10000,
  });

  console.log(result);
}

// Repository handlers
async function handleRepository(
  action: string,
  options: GitHubOptions,
  _args: string[],
): Promise<void> {
  switch (action) {
    case "view":
      await viewRepository(options);
      break;

    case "list":
      await listRepositories(options);
      break;

    default:
      console.error(`❌ Unknown repository command: ${action}`);
      console.log("Available: view, list");
  }
}

async function viewRepository(options: GitHubOptions): Promise<void> {
  const owner = options.owner || await getRepoOwner();
  const repo = options.repository || await getRepoName();

  console.log(`📚 Viewing repository ${owner}/${repo}...`);

  const result = await callGitHubMCP("repo_view", {
    owner,
    repo,
  });

  console.log(result);
}

async function listRepositories(options: GitHubOptions): Promise<void> {
  console.log(`📚 Listing repositories...`);

  const result = await callGitHubMCP("repo_list", {
    type: "owner",
    sort: "updated",
    direction: "desc",
    limit: options.limit || 10,
  });

  console.log(result);
}

// Stub handlers for future implementation
function handleIssue(
  _action: string,
  _options: GitHubOptions,
  _args: string[],
): void {
  console.log("⚠️  Issue operations not yet implemented in MCP server");
}

function handlePullRequest(
  _action: string,
  _options: GitHubOptions,
  _args: string[],
): void {
  console.log("⚠️  Pull request operations not yet implemented in MCP server");
}

// Helper functions to get repository information
async function getRepoOwner(): Promise<string> {
  try {
    const cmd = new Deno.Command("git", {
      args: ["config", "--get", "remote.origin.url"],
      stdout: "piped",
    });
    const output = await cmd.output();
    const url = new TextDecoder().decode(output.stdout).trim();

    // Extract owner from GitHub URL
    const match = url.match(/github\.com[:/]([^/]+)\//);
    if (match) {
      return match[1];
    }
  } catch {
    // Ignore errors
  }

  // Default
  return "RickCogley";
}

async function getRepoName(): Promise<string> {
  try {
    const cmd = new Deno.Command("git", {
      args: ["config", "--get", "remote.origin.url"],
      stdout: "piped",
    });
    const output = await cmd.output();
    const url = new TextDecoder().decode(output.stdout).trim();

    // Extract repo name from GitHub URL
    const match = url.match(/github\.com[:/][^/]+\/([^.]+)/);
    if (match) {
      return match[1];
    }
  } catch {
    // Ignore errors
  }

  // Try to get from current directory
  return basename(Deno.cwd());
}

async function getLatestTag(): Promise<string | null> {
  try {
    const cmd = new Deno.Command("git", {
      args: ["describe", "--tags", "--abbrev=0"],
      stdout: "piped",
    });
    const output = await cmd.output();
    if (output.success) {
      return new TextDecoder().decode(output.stdout).trim();
    }
  } catch {
    // Ignore errors
  }
  return null;
}

function showGitHubHelp(topic?: string): void {
  if (topic) {
    showTopicHelp(topic);
    return;
  }

  console.log(`
🪴 Aichaku GitHub - Comprehensive GitHub operations via MCP

Provides deterministic GitHub operations for CI/CD pipelines without bash script approvals.

Usage:
  aichaku github <category> <action> [options]
  aichaku github <shortcut> [args...]

Categories:
  auth      Authentication management
  release   Release operations (upload, view, list)
  run       Workflow run operations (list, view, watch)
  repo      Repository operations (view, list)
  issue     Issue operations (future)
  pr        Pull request operations (future)

Shortcuts:
  upload    Upload assets to release (alias for 'release upload')
  view      View release (alias for 'release view')
  status    Check auth status (alias for 'auth status')

Examples:
  # Authentication
  aichaku github auth status
  aichaku github auth login <token>

  # Release operations
  aichaku github release upload dist/*.tar.gz
  aichaku github release view --tag v1.2.3
  aichaku github upload dist/*  # shortcut

  # Workflow operations
  aichaku github run list
  aichaku github run view --run-id 123456
  aichaku github run watch --run-id 123456

  # Repository operations
  aichaku github repo view
  aichaku github repo list --limit 20

Common Options:
  --owner <owner>      Repository owner (auto-detects from git)
  --repository <repo>  Repository name (auto-detects from git)
  --tag <tag>          Release tag (auto-detects latest if not specified)
  --help               Show help for a specific command

For detailed help on a category:
  aichaku github help <category>

Note: The GitHub MCP server must be installed. Install with:
  aichaku mcp --install-github
`);
}

function showTopicHelp(topic: string): void {
  switch (topic) {
    case "auth":
      console.log(`
🔐 GitHub Authentication

Commands:
  aichaku github auth status       Check current authentication status
  aichaku github auth login <token>  Login with GitHub personal access token

The token can also be set via GITHUB_TOKEN environment variable.
`);
      break;

    case "release":
      console.log(`
📦 GitHub Releases

Commands:
  aichaku github release upload [files...]  Upload assets to a release
  aichaku github release view              View release details
  aichaku github release list              List releases (not yet implemented)

Options:
  --tag <tag>         Release tag (auto-detects latest if not specified)
  --overwrite         Overwrite existing assets (default: true)

Examples:
  # Upload all binaries to latest release
  aichaku github release upload dist/*

  # Upload to specific release
  aichaku github release upload --tag v1.2.3 dist/*.tar.gz

  # View latest release
  aichaku github release view

  # View specific release
  aichaku github release view --tag v1.2.3
`);
      break;

    case "run":
    case "workflow":
      console.log(`
🔄 GitHub Workflow Runs

Commands:
  aichaku github run list    List recent workflow runs
  aichaku github run view    View details of a specific run
  aichaku github run watch   Watch a run until completion

Options:
  --workflow <name>    Filter by workflow file name
  --status <status>    Filter by status (completed, in_progress, queued)
  --run-id <id>        Workflow run ID (required for view/watch)
  --limit <n>          Number of runs to list (default: 10)
  --timeout <ms>       Timeout for watching (default: 600000)
  --poll-interval <ms> Poll interval for watching (default: 10000)

Examples:
  # List recent runs
  aichaku github run list

  # List runs for specific workflow
  aichaku github run list --workflow publish.yml

  # View specific run
  aichaku github run view --run-id 123456789

  # Watch run until completion
  aichaku github run watch --run-id 123456789
`);
      break;

    case "repo":
    case "repository":
      console.log(`
📚 GitHub Repositories

Commands:
  aichaku github repo view   View current repository details
  aichaku github repo list   List user repositories

Options:
  --limit <n>  Number of repositories to list (default: 10)

Examples:
  # View current repository
  aichaku github repo view

  # View specific repository
  aichaku github repo view --owner microsoft --repository vscode

  # List your repositories
  aichaku github repo list --limit 20
`);
      break;

    default:
      console.log(`❌ Unknown help topic: ${topic}`);
      console.log(
        "Available topics: auth, release, run, workflow, repo, repository",
      );
  }
}
