# Comprehensive GitHub MCP Tool Specification

## Overview

A complete MCP server that provides all GitHub CLI operations as deterministic,
reliable tools for Claude Code. This eliminates context dependencies and
provides better error handling than shell-based `gh` commands.

## Core Commands

### Authentication & Configuration

````typescript
// Authentication management
mcp**github**auth_login; // Login to GitHub
mcp**github**auth_logout; // Logout from GitHub
mcp**github**auth_status; // Check authentication status
mcp**github**auth_token; // Get/set authentication token
mcp**github**auth_refresh; // Refresh authentication

// Configuration management
mcp**github**config_get; // Get configuration values
mcp**github**config_set; // Set configuration values
mcp**github**config_list; // List all configuration
```text

### Repository Management

```typescript
// Repository operations
mcp**github**repo_create; // Create new repository
mcp**github**repo_clone; // Clone repository
mcp**github**repo_fork; // Fork repository
mcp**github**repo_delete; // Delete repository
mcp**github**repo_rename; // Rename repository
mcp**github**repo_view; // View repository details
mcp**github**repo_list; // List repositories
mcp**github**repo_sync; // Sync forked repository

// Repository settings
mcp**github**repo * set * description; // Set repository description
mcp**github**repo * set * topics; // Set repository topics
mcp**github**repo * set * visibility; // Set repository visibility
mcp**github**repo * set * default_branch; // Set default branch
```text

### Issue Management

```typescript
// Issue operations
mcp**github**issue_create; // Create new issue
mcp**github**issue_edit; // Edit existing issue
mcp**github**issue_close; // Close issue
mcp**github**issue_reopen; // Reopen issue
mcp**github**issue_view; // View issue details
mcp**github**issue_list; // List issues
mcp**github**issue_comment; // Add comment to issue
mcp**github**issue_lock; // Lock issue
mcp**github**issue_unlock; // Unlock issue
mcp**github**issue_pin; // Pin issue
mcp**github**issue_unpin; // Unpin issue

// Issue assignment and labels
mcp**github**issue_assign; // Assign issue to user
mcp**github**issue_unassign; // Unassign issue from user
mcp**github**issue * add * label; // Add label to issue
mcp**github**issue * remove * label; // Remove label from issue
mcp**github**issue * set * milestone; // Set issue milestone
```text

### Pull Request Management

```typescript
// PR operations
mcp**github**pr_create; // Create new pull request
mcp**github**pr_edit; // Edit existing pull request
mcp**github**pr_close; // Close pull request
mcp**github**pr_reopen; // Reopen pull request
mcp**github**pr_merge; // Merge pull request
mcp**github**pr_view; // View pull request details
mcp**github**pr_list; // List pull requests
mcp**github**pr_checkout; // Checkout PR branch locally
mcp**github**pr_comment; // Add comment to PR
mcp**github**pr_review; // Add review to PR
mcp**github**pr_ready; // Mark PR as ready for review
mcp**github**pr_draft; // Convert PR to draft

// PR status and checks
mcp**github**pr_status; // Get PR status and checks
mcp**github**pr_checks; // Get PR check results
mcp**github**pr_diff; // Get PR diff
mcp**github**pr_conflicts; // Check for merge conflicts
```text

### Release Management

```typescript
// Release operations
mcp**github**release_create; // Create new release
mcp**github**release_edit; // Edit existing release
mcp**github**release_delete; // Delete release
mcp**github**release_view; // View release details
mcp**github**release_list; // List releases
mcp**github**release_download; // Download release assets

// Release assets
mcp**github**release_upload; // Upload assets to release
mcp**github**release*delete*asset; // Delete release asset
mcp**github**release*list*assets; // List release assets

// Release publishing
mcp**github**release_publish; // Publish draft release
mcp**github**release_unpublish; // Unpublish release
mcp**github**release*mark*latest; // Mark release as latest
mcp**github**release*mark*prerelease; // Mark as prerelease
```text

### GitHub Actions

```typescript
// Workflow operations
mcp**github**workflow_list; // List workflows
mcp**github**workflow_view; // View workflow details
mcp**github**workflow_run; // Trigger workflow run
mcp**github**workflow_enable; // Enable workflow
mcp**github**workflow_disable; // Disable workflow

// Workflow runs
mcp**github**run_list; // List workflow runs
mcp**github**run_view; // View run details
mcp**github**run_logs; // Get run logs
mcp**github**run_cancel; // Cancel running workflow
mcp**github**run_rerun; // Rerun workflow
mcp**github**run_watch; // Watch workflow run progress

// Actions cache
mcp**github**cache_list; // List caches
mcp**github**cache_delete; // Delete cache
mcp**github**cache_clear; // Clear all caches

// Secrets and variables
mcp**github**secret_list; // List secrets
mcp**github**secret_set; // Set secret
mcp**github**secret_delete; // Delete secret
mcp**github**variable_list; // List variables
mcp**github**variable_set; // Set variable
mcp**github**variable_delete; // Delete variable
```text

### Project Management

```typescript
// GitHub Projects
mcp**github**project_create; // Create new project
mcp**github**project_edit; // Edit project
mcp**github**project_delete; // Delete project
mcp**github**project_view; // View project details
mcp**github**project_list; // List projects

// Project items
mcp**github**project * item * add; // Add item to project
mcp**github**project * item * remove; // Remove item from project
mcp**github**project * item * edit; // Edit project item
mcp**github**project * item * move; // Move item between columns
```text

### Search & Discovery

```typescript
// Search operations
mcp**github**search_repos; // Search repositories
mcp**github**search_issues; // Search issues
mcp**github**search_prs; // Search pull requests
mcp**github**search_code; // Search code
mcp**github**search_commits; // Search commits
mcp**github**search_users; // Search users
mcp**github**search_topics; // Search topics

// Browse operations
mcp**github**browse_repo; // Open repository in browser
mcp**github**browse_issue; // Open issue in browser
mcp**github**browse_pr; // Open PR in browser
mcp**github**browse_commit; // Open commit in browser
mcp**github**browse_actions; // Open Actions in browser
```text

### Organization Management

```typescript
// Organization operations
mcp**github**org_view; // View organization details
mcp**github**org_list; // List organizations
mcp**github**org_members; // List organization members
mcp**github**org_teams; // List organization teams
mcp**github**org_repos; // List organization repositories

// Team management
mcp**github**team_create; // Create team
mcp**github**team_edit; // Edit team
mcp**github**team_delete; // Delete team
mcp**github**team_members; // List team members
mcp**github**team * add * member; // Add member to team
mcp**github**team * remove * member; // Remove member from team
```text

### Gist Management

```typescript
// Gist operations
mcp**github**gist_create; // Create new gist
mcp**github**gist_edit; // Edit existing gist
mcp**github**gist_delete; // Delete gist
mcp**github**gist_view; // View gist details
mcp**github**gist_list; // List gists
mcp**github**gist_clone; // Clone gist
mcp**github**gist_fork; // Fork gist
```text

### Security & Compliance

```typescript
// Security operations
mcp**github**security_advisories; // List security advisories
mcp**github**security_alerts; // Get security alerts
mcp**github**security_enable; // Enable security features
mcp**github**security_disable; // Disable security features

// SSH and GPG keys
mcp**github**ssh*key*list; // List SSH keys
mcp**github**ssh*key*add; // Add SSH key
mcp**github**ssh*key*delete; // Delete SSH key
mcp**github**gpg*key*list; // List GPG keys
mcp**github**gpg*key*add; // Add GPG key
mcp**github**gpg*key*delete; // Delete GPG key

// Repository rulesets
mcp**github**ruleset_list; // List repository rulesets
mcp**github**ruleset_view; // View ruleset details
mcp**github**ruleset_enable; // Enable ruleset
mcp**github**ruleset_disable; // Disable ruleset
```text

### Labels & Milestones

```typescript
// Label management
mcp**github**label_create; // Create new label
mcp**github**label_edit; // Edit existing label
mcp**github**label_delete; // Delete label
mcp**github**label_list; // List labels
mcp**github**label_clone; // Clone labels from another repo

// Milestone management
mcp**github**milestone_create; // Create new milestone
mcp**github**milestone_edit; // Edit existing milestone
mcp**github**milestone_delete; // Delete milestone
mcp**github**milestone_list; // List milestones
mcp**github**milestone_view; // View milestone details
```text

### Status & Monitoring

```typescript
// Status operations
mcp**github**status_overall; // Get overall GitHub status
mcp**github**status_user; // Get user-specific status
mcp**github**status_repo; // Get repository status
mcp**github**status_notifications; // Get notifications status

// Monitoring operations
mcp**github**monitor_runs; // Monitor workflow runs
mcp**github**monitor_releases; // Monitor release status
mcp**github**monitor_prs; // Monitor PR status
mcp**github**monitor_issues; // Monitor issue activity
```text

### API & Extensions

```typescript
// API operations
mcp**github**api_request; // Make authenticated API request
mcp**github**api_graphql; // Make GraphQL API request
mcp**github**api * rate * limit; // Check API rate limit
mcp**github**api_user; // Get authenticated user info

// Extension management
mcp**github**extension_list; // List installed extensions
mcp**github**extension_install; // Install extension
mcp**github**extension_uninstall; // Uninstall extension
mcp**github**extension_upgrade; // Upgrade extension
```text

## Implementation Features

### Error Handling

- Retry logic with exponential backoff

- Detailed error messages with context

- Graceful handling of rate limits

- Network timeout management

- Authentication failure recovery

### Authentication

- Multiple authentication methods (token, OAuth, SSH)

- Automatic token refresh

- Multi-account support

- Secure credential storage

### Performance

- Request caching for frequently accessed data

- Batch operations where possible

- Parallel request processing

- Progress indicators for long operations

### Reliability

- Atomic operations where possible

- Transaction rollback on failures

- Idempotent operations

- State verification after operations

### Logging & Monitoring

- Comprehensive operation logging

- Performance metrics

- Rate limit monitoring

- Error tracking and reporting

## Usage Examples

### Release Management

```typescript
// Create and publish a release with assets
const release = await mcp**github**release_create({
  tag: "v1.0.0",
  name: "Release 1.0.0",
  body: "Initial release with new features",
  draft: false,
  prerelease: false,
});

// Upload multiple assets
await mcp**github**release_upload({
  tag: "v1.0.0",
  assets: [
    "./dist/app-linux-x64",
    "./dist/app-macos-x64",
    "./dist/app-windows-x64.exe",
  ],
});

// Monitor release status
const status = await mcp**github**release_view({
  tag: "v1.0.0",
});
```text

### Workflow Monitoring

```typescript
// Monitor workflow runs for a release
const runs = await mcp**github**run_list({
  workflow: "release.yml",
  event: "release",
  status: "in_progress",
});

// Watch specific run
await mcp**github**run_watch({
  runId: runs[0].id,
  timeout: 600000, // 10 minutes
});
```text

### PR Management

```typescript
// Create PR and monitor checks
const pr = await mcp**github**pr_create({
  title: "Add new feature",
  body: "This PR adds...",
  head: "feature-branch",
  base: "main",
});

// Monitor PR checks
const checks = await mcp**github**pr_checks({
  number: pr.number,
  waitForCompletion: true,
});
```text

## Integration with Nagare

### Enhanced Post-Release Hook

```typescript
// nagare.config.ts
postRelease: [
  async () => {
    // Upload binaries using MCP
    await mcp**github**release_upload({
      tag: `v${VERSION}`,
      assets: [
        "./dist/aichaku-*.exe",
        "./dist/aichaku-*",
        "./dist/mcp-code-reviewer-*",
      ],
    });

    // Monitor workflow completion
    await mcp**github**run_watch({
      workflow: "publish.yml",
      timeout: 600000,
    });

    // Verify JSR publication
    await mcp**github**workflow_run({
      workflow: "verify-jsr.yml",
      inputs: { version: VERSION },
    });

    // Update project board
    await mcp**github**project * item * move({
      projectId: "123",
      itemId: "456",
      columnId: "completed",
    });
  },
];
```text

## Benefits

1. **Deterministic Operations**: No dependency on shell context or PATH

2. **Better Error Handling**: Comprehensive retry logic and error reporting

3. **Atomic Operations**: Complex operations can be made atomic

4. **Progress Monitoring**: Real-time feedback on long operations

5. **Authentication Management**: Secure, reliable authentication

6. **Batch Operations**: Efficient handling of multiple operations

7. **CI/CD Ready**: Works perfectly in automated environments

8. **Extensible**: Easy to add new GitHub operations

This comprehensive GitHub MCP tool would make all GitHub interactions from
Claude Code completely reliable and deterministic, eliminating the context and
authentication issues that can occur with shell-based `gh` commands.
````
