# Comprehensive GitHub MCP Tool Specification

## Overview

A complete MCP server that provides all GitHub CLI operations as deterministic,
reliable tools for Claude Code. This eliminates context dependencies and
provides better error handling than shell-based `gh` commands.

## Core Commands

### Authentication & Configuration

```typescript
// Authentication management
mcp__github__auth_login; // Login to GitHub
mcp__github__auth_logout; // Logout from GitHub
mcp__github__auth_status; // Check authentication status
mcp__github__auth_token; // Get/set authentication token
mcp__github__auth_refresh; // Refresh authentication

// Configuration management
mcp__github__config_get; // Get configuration values
mcp__github__config_set; // Set configuration values
mcp__github__config_list; // List all configuration
```

### Repository Management

```typescript
// Repository operations
mcp__github__repo_create; // Create new repository
mcp__github__repo_clone; // Clone repository
mcp__github__repo_fork; // Fork repository
mcp__github__repo_delete; // Delete repository
mcp__github__repo_rename; // Rename repository
mcp__github__repo_view; // View repository details
mcp__github__repo_list; // List repositories
mcp__github__repo_sync; // Sync forked repository

// Repository settings
mcp__github__repo * set * description; // Set repository description
mcp__github__repo * set * topics; // Set repository topics
mcp__github__repo * set * visibility; // Set repository visibility
mcp__github__repo * set * default_branch; // Set default branch
```

### Issue Management

```typescript
// Issue operations
mcp__github__issue_create; // Create new issue
mcp__github__issue_edit; // Edit existing issue
mcp__github__issue_close; // Close issue
mcp__github__issue_reopen; // Reopen issue
mcp__github__issue_view; // View issue details
mcp__github__issue_list; // List issues
mcp__github__issue_comment; // Add comment to issue
mcp__github__issue_lock; // Lock issue
mcp__github__issue_unlock; // Unlock issue
mcp__github__issue_pin; // Pin issue
mcp__github__issue_unpin; // Unpin issue

// Issue assignment and labels
mcp__github__issue_assign; // Assign issue to user
mcp__github__issue_unassign; // Unassign issue from user
mcp__github__issue * add * label; // Add label to issue
mcp__github__issue * remove * label; // Remove label from issue
mcp__github__issue * set * milestone; // Set issue milestone
```

### Pull Request Management

```typescript
// PR operations
mcp__github__pr_create; // Create new pull request
mcp__github__pr_edit; // Edit existing pull request
mcp__github__pr_close; // Close pull request
mcp__github__pr_reopen; // Reopen pull request
mcp__github__pr_merge; // Merge pull request
mcp__github__pr_view; // View pull request details
mcp__github__pr_list; // List pull requests
mcp__github__pr_checkout; // Checkout PR branch locally
mcp__github__pr_comment; // Add comment to PR
mcp__github__pr_review; // Add review to PR
mcp__github__pr_ready; // Mark PR as ready for review
mcp__github__pr_draft; // Convert PR to draft

// PR status and checks
mcp__github__pr_status; // Get PR status and checks
mcp__github__pr_checks; // Get PR check results
mcp__github__pr_diff; // Get PR diff
mcp__github__pr_conflicts; // Check for merge conflicts
```

### Release Management

```typescript
// Release operations
mcp__github__release_create; // Create new release
mcp__github__release_edit; // Edit existing release
mcp__github__release_delete; // Delete release
mcp__github__release_view; // View release details
mcp__github__release_list; // List releases
mcp__github__release_download; // Download release assets

// Release assets
mcp__github__release_upload; // Upload assets to release
mcp__github__release*delete*asset; // Delete release asset
mcp__github__release*list*assets; // List release assets

// Release publishing
mcp__github__release_publish; // Publish draft release
mcp__github__release_unpublish; // Unpublish release
mcp__github__release*mark*latest; // Mark release as latest
mcp__github__release*mark*prerelease; // Mark as prerelease
```

### GitHub Actions

```typescript
// Workflow operations
mcp__github__workflow_list; // List workflows
mcp__github__workflow_view; // View workflow details
mcp__github__workflow_run; // Trigger workflow run
mcp__github__workflow_enable; // Enable workflow
mcp__github__workflow_disable; // Disable workflow

// Workflow runs
mcp__github__run_list; // List workflow runs
mcp__github__run_view; // View run details
mcp__github__run_logs; // Get run logs
mcp__github__run_cancel; // Cancel running workflow
mcp__github__run_rerun; // Rerun workflow
mcp__github__run_watch; // Watch workflow run progress

// Actions cache
mcp__github__cache_list; // List caches
mcp__github__cache_delete; // Delete cache
mcp__github__cache_clear; // Clear all caches

// Secrets and variables
mcp__github__secret_list; // List secrets
mcp__github__secret_set; // Set secret
mcp__github__secret_delete; // Delete secret
mcp__github__variable_list; // List variables
mcp__github__variable_set; // Set variable
mcp__github__variable_delete; // Delete variable
```

### Project Management

```typescript
// GitHub Projects
mcp__github__project_create; // Create new project
mcp__github__project_edit; // Edit project
mcp__github__project_delete; // Delete project
mcp__github__project_view; // View project details
mcp__github__project_list; // List projects

// Project items
mcp__github__project * item * add; // Add item to project
mcp__github__project * item * remove; // Remove item from project
mcp__github__project * item * edit; // Edit project item
mcp__github__project * item * move; // Move item between columns
```

### Search & Discovery

```typescript
// Search operations
mcp__github__search_repos; // Search repositories
mcp__github__search_issues; // Search issues
mcp__github__search_prs; // Search pull requests
mcp__github__search_code; // Search code
mcp__github__search_commits; // Search commits
mcp__github__search_users; // Search users
mcp__github__search_topics; // Search topics

// Browse operations
mcp__github__browse_repo; // Open repository in browser
mcp__github__browse_issue; // Open issue in browser
mcp__github__browse_pr; // Open PR in browser
mcp__github__browse_commit; // Open commit in browser
mcp__github__browse_actions; // Open Actions in browser
```

### Organization Management

```typescript
// Organization operations
mcp__github__org_view; // View organization details
mcp__github__org_list; // List organizations
mcp__github__org_members; // List organization members
mcp__github__org_teams; // List organization teams
mcp__github__org_repos; // List organization repositories

// Team management
mcp__github__team_create; // Create team
mcp__github__team_edit; // Edit team
mcp__github__team_delete; // Delete team
mcp__github__team_members; // List team members
mcp__github__team * add * member; // Add member to team
mcp__github__team * remove * member; // Remove member from team
```

### Gist Management

```typescript
// Gist operations
mcp__github__gist_create; // Create new gist
mcp__github__gist_edit; // Edit existing gist
mcp__github__gist_delete; // Delete gist
mcp__github__gist_view; // View gist details
mcp__github__gist_list; // List gists
mcp__github__gist_clone; // Clone gist
mcp__github__gist_fork; // Fork gist
```

### Security & Compliance

```typescript
// Security operations
mcp__github__security_advisories; // List security advisories
mcp__github__security_alerts; // Get security alerts
mcp__github__security_enable; // Enable security features
mcp__github__security_disable; // Disable security features

// SSH and GPG keys
mcp__github__ssh*key*list; // List SSH keys
mcp__github__ssh*key*add; // Add SSH key
mcp__github__ssh*key*delete; // Delete SSH key
mcp__github__gpg*key*list; // List GPG keys
mcp__github__gpg*key*add; // Add GPG key
mcp__github__gpg*key*delete; // Delete GPG key

// Repository rulesets
mcp__github__ruleset_list; // List repository rulesets
mcp__github__ruleset_view; // View ruleset details
mcp__github__ruleset_enable; // Enable ruleset
mcp__github__ruleset_disable; // Disable ruleset
```

### Labels & Milestones

```typescript
// Label management
mcp__github__label_create; // Create new label
mcp__github__label_edit; // Edit existing label
mcp__github__label_delete; // Delete label
mcp__github__label_list; // List labels
mcp__github__label_clone; // Clone labels from another repo

// Milestone management
mcp__github__milestone_create; // Create new milestone
mcp__github__milestone_edit; // Edit existing milestone
mcp__github__milestone_delete; // Delete milestone
mcp__github__milestone_list; // List milestones
mcp__github__milestone_view; // View milestone details
```

### Status & Monitoring

```typescript
// Status operations
mcp__github__status_overall; // Get overall GitHub status
mcp__github__status_user; // Get user-specific status
mcp__github__status_repo; // Get repository status
mcp__github__status_notifications; // Get notifications status

// Monitoring operations
mcp__github__monitor_runs; // Monitor workflow runs
mcp__github__monitor_releases; // Monitor release status
mcp__github__monitor_prs; // Monitor PR status
mcp__github__monitor_issues; // Monitor issue activity
```

### API & Extensions

```typescript
// API operations
mcp__github__api_request; // Make authenticated API request
mcp__github__api_graphql; // Make GraphQL API request
mcp__github__api * rate * limit; // Check API rate limit
mcp__github__api_user; // Get authenticated user info

// Extension management
mcp__github__extension_list; // List installed extensions
mcp__github__extension_install; // Install extension
mcp__github__extension_uninstall; // Uninstall extension
mcp__github__extension_upgrade; // Upgrade extension
```

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
const release = await mcp__github__release_create({
  tag: "v1.0.0",
  name: "Release 1.0.0",
  body: "Initial release with new features",
  draft: false,
  prerelease: false,
});

// Upload multiple assets
await mcp__github__release_upload({
  tag: "v1.0.0",
  assets: [
    "./dist/app-linux-x64",
    "./dist/app-macos-x64",
    "./dist/app-windows-x64.exe",
  ],
});

// Monitor release status
const status = await mcp__github__release_view({
  tag: "v1.0.0",
});
```

### Workflow Monitoring

```typescript
// Monitor workflow runs for a release
const runs = await mcp__github__run_list({
  workflow: "release.yml",
  event: "release",
  status: "in_progress",
});

// Watch specific run
await mcp__github__run_watch({
  runId: runs[0].id,
  timeout: 600000, // 10 minutes
});
```

### PR Management

```typescript
// Create PR and monitor checks
const pr = await mcp__github__pr_create({
  title: "Add new feature",
  body: "This PR adds...",
  head: "feature-branch",
  base: "main",
});

// Monitor PR checks
const checks = await mcp__github__pr_checks({
  number: pr.number,
  waitForCompletion: true,
});
```

## Integration with Nagare

### Enhanced Post-Release Hook

```typescript
// nagare.config.ts
postRelease: [
  async () => {
    // Upload binaries using MCP
    await mcp__github__release_upload({
      tag: `v${VERSION}`,
      assets: [
        "./dist/aichaku-*.exe",
        "./dist/aichaku-*",
        "./dist/mcp-code-reviewer-*",
      ],
    });

    // Monitor workflow completion
    await mcp__github__run_watch({
      workflow: "publish.yml",
      timeout: 600000,
    });

    // Verify JSR publication
    await mcp__github__workflow_run({
      workflow: "verify-jsr.yml",
      inputs: { version: VERSION },
    });

    // Update project board
    await mcp__github__project * item * move({
      projectId: "123",
      itemId: "456",
      columnId: "completed",
    });
  },
];
```

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
