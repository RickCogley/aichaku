# Lessons Learned from v0.30.0 Release

## Release Date: 2025-07-16

This document captures the specific issues encountered during the v0.30.0
release and the insights gained that inform our release automation improvements.

## Issues Encountered

### 1. Type Checking Confusion

**What happened**: Nagare's built-in type checking was checking ALL files, while
our pre-release hooks only checked specific files. This led to 187+ type errors
in deprecated v2 files during the actual release.

**Root cause**:

- `deno check **/*.ts` doesn't respect exclusions in deno.json

- Only `deno check` (without arguments) respects the top-level exclude

- Different tools were using different check commands

**Lesson**: All type checking commands must be standardized and use the same
exclusion logic.

### 2. JSR Publishing Failure

**What happened**: JSR publishing failed with "excluded-module" error for
version.ts, even though npm publishing succeeded.

**Root cause**:

- version.ts was accidentally added to the top-level exclude

- JSR requires all files in the module graph to be included

- No validation that excluded files aren't needed for publishing

**Lesson**: Pre-flight checks must validate that no required files are excluded
from publishing.

### 3. Documentation Formatting CI Failure

**What happened**: After fixing the JSR issue, GitHub Actions failed due to
unformatted documentation files.

**Root cause**:

- Documentation files weren't formatted before commit

- Pre-release checks didn't include documentation formatting

- Had to re-tag and force push multiple times

**Lesson**: ALL files that will be checked in CI must be validated in
pre-release checks.

### 4. Manual Tag Management

**What happened**: Had to manually move and force-push tags multiple times to
re-trigger workflows.

**Root cause**:

- No automatic tag management after fixing issues

- GitHub Actions only triggers on tag push

- Manual process is error-prone

**Lesson**: Release process should handle tag management automatically,
including updates after fixes.

### 5. Binary Upload as Separate Step

**What happened**: After the release succeeded, binaries had to be built and
uploaded manually.

**Root cause**:

- Binary building/uploading is not integrated into the release flow

- Requires manual intervention after release

- Easy to forget or delay

**Lesson**: Binary creation and upload should be automatic part of the release
process.

## Key Insights

### 1. Partial Success is Worse than Failure

When npm publishes but JSR fails, we're in an inconsistent state. The release
process must be atomic - either everything succeeds or nothing is published.

### 2. Pre-flight Validation Must Be Comprehensive

Every check that CI will perform must be run locally first. This includes:

- Type checking (with proper exclusions)

- Linting

- Formatting (including docs)

- Test execution

- Security scanning

- Publishing dry-runs

### 3. Error Recovery Must Be Built-In

When issues are fixed, the process should:

- Automatically update tags

- Re-trigger necessary workflows

- Resume from the failure point

- Provide clear next steps

### 4. Configuration Complexity Needs Management

The interaction between:

- deno.json exclusions (top-level, fmt, lint)

- nagare.config.ts settings

- GitHub Actions workflows

- Publishing requirements

...is complex and needs to be managed holistically.

### 5. User Experience Matters

Current process requires:

1. Run release

2. If it fails, debug

3. Fix issues

4. Manually update tags

5. Force push

6. Monitor GitHub Actions

7. Build binaries

8. Upload binaries

This should be: Run release → Success

## Recommendations for Implementation

1. **Unified Configuration**: Single source of truth for what files to
   check/exclude

2. **Comprehensive Validation**: Run ALL checks before starting any publishing

3. **Atomic Operations**: Use transactions or rollback capabilities

4. **Smart Recovery**: Detect what needs to be re-run after fixes

5. **Progress Persistence**: Save state to resume interrupted releases

6. **Clear Messaging**: Tell users exactly what went wrong and how to fix it

7. **Automation First**: Eliminate ALL manual steps

## Success Metrics

After implementing improvements, a release should:

- Complete in under 5 minutes for normal cases

- Require zero manual intervention

- Provide clear, actionable error messages

- Successfully recover from common issues

- Work reliably 100% of the time

---

_These lessons directly inform the design of the release automation enhancement
project._
