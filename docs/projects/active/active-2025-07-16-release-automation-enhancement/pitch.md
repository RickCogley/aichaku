# Release Automation Enhancement

## Problem

The current Aichaku release process has multiple pain points that create friction and opportunities for error:

### 1. Type Checking Failures
- The release process fails when type checking errors exist
- These errors often surface only during release, not during development
- Example: `TS2304 [ERROR]: Cannot find name 'Deno'` in test files
- Requires manual intervention to fix or suppress errors

### 2. JSR Publishing Failures
- JSR publication can fail after npm publish succeeds
- Creates inconsistent state between registries
- No automatic rollback or retry mechanism
- Requires manual debugging and republishing

### 3. Manual Tag Management
- Git tags must be pushed manually after release
- Easy to forget this step, breaking the release history
- No verification that tags match published versions
- Separate command increases cognitive load

### 4. Disconnected Binary Upload
- Binary assets require a separate GitHub release creation step
- Must manually match version numbers between release and binaries
- No automated verification of binary integrity
- Additional manual process after main release

### 5. Lack of Pre-flight Validation
- No comprehensive checks before starting release
- Problems surface during release, not before
- Each tool (npm, JSR, GitHub) has different requirements
- No unified validation process

## Solution

Create a fully automated, single-command release process that handles all aspects of releasing Aichaku:

### Core Components

1. **Pre-flight Validation System**
   - Comprehensive type checking with proper Deno context
   - Registry readiness checks (npm, JSR)
   - Git state validation (clean working tree, correct branch)
   - Version consistency verification
   - Binary build verification

2. **Unified Release Command**
   - Single `deno task release` command
   - Orchestrates all release steps in correct order
   - Handles both registries (npm and JSR)
   - Automatically creates and pushes git tags
   - Uploads binaries to GitHub release

3. **Intelligent Error Recovery**
   - Rollback capabilities for failed releases
   - Retry logic for transient failures
   - Clear error messages with fix suggestions
   - State tracking to resume interrupted releases

4. **Release Configuration**
   - Central `release.config.ts` for all settings
   - Environment-based configuration (dev/staging/prod)
   - Dry-run mode for testing
   - Configurable validation rules

### Implementation Approach

```typescript
// release.config.ts
export const releaseConfig = {
  registries: ['npm', 'jsr'],
  binaries: {
    platforms: ['darwin', 'linux', 'windows'],
    uploadToGitHub: true
  },
  validation: {
    typeCheck: true,
    tests: true,
    lint: true,
    security: true
  },
  git: {
    tagPrefix: 'v',
    pushTags: true,
    requireCleanTree: true
  }
};
```

### Key Improvements

1. **Zero Manual Steps**: Everything automated from validation to publication
2. **Fail-Fast Validation**: All checks run before any publishing begins
3. **Atomic Operations**: Either everything succeeds or nothing is published
4. **Clear Feedback**: Progress indicators and actionable error messages
5. **Resumable Process**: Can continue from last successful step if interrupted

## Rabbit Holes

### Not Doing
- Custom registry implementations
- GUI/web interface for releases
- Complex versioning strategies (stick with semver)
- Multi-package monorepo support
- Automated changelog generation (separate concern)

### Constraints
- Must work with existing Deno.json structure
- Cannot require additional runtime dependencies
- Should complete full release in under 5 minutes
- Must maintain backward compatibility with manual process

## No-Gos

1. **Breaking existing workflows**: Current manual commands must still work
2. **External service dependencies**: No requiring additional CI/CD services
3. **Configuration complexity**: Simple, sensible defaults with minimal config
4. **Platform-specific code**: Must work on all developer platforms

## Appetite

**4 days** - This is a focused improvement to an existing process, not a ground-up rebuild. We have:
- Clear problem definition from recent release experiences
- Existing release scripts to build upon
- Well-defined success criteria
- Limited scope with clear boundaries