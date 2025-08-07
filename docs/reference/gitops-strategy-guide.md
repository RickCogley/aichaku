# GitOps Strategy Guide for Aichaku

## Current State Assessment

Your current approach represents **trunk-based development** in its purest form:

- Direct commits to main branch
- Conventional commits for semantic versioning
- Nagare for automated releases and changelog generation
- No PR overhead or merge conflicts
- Maximum development velocity

This is actually a best practice for small, trusted teams and aligns with modern DevOps principles of continuous
integration.

## The Git Philosophy Tension

### Trunk-based (Current) vs Feature Branches (Future)

Your current approach follows modern DevOps best practices - continuous integration in its truest form. The debate about
rebase vs merge (as seen in community discussions) only becomes relevant when you introduce feature branches, which
you're not currently using.

## Growth Scenarios and Strategic Evolution

### Scenario 1: Stay Small (2-3 trusted developers)

**Recommendation: Keep status quo**

- **Advantages:**
  - Direct to main is fastest
  - Nagare + conventional commits = fully automated releases
  - No PR overhead or merge conflicts
  - Immediate integration and feedback

- **Risks:**
  - Single bad commit affects everyone immediately
  - No review gate for catching issues

- **Mitigation:**
  - Strong preflight checks (format, lint, typecheck, test)
  - Conventional commit discipline
  - Quick rollback procedures

### Scenario 2: Add Contributors (5-10 people)

**Recommendation: Hybrid model**

- **Implementation:**
  ```yaml
  Core team workflow:
    - Continue direct commits to main
    - Enforce preflight checks before commit
    - Maintain conventional commit standards

  Contributor workflow:
    - Fork and PR model
    - Require review from core team
    - Squash or rebase merge to maintain linear history
  ```

- **Branch Protection Rules:**
  ```yaml
  main:
    - Require PR for external contributors
    - Allow bypass for core maintainers
    - Required status checks: CI must pass
    - Dismiss stale reviews: true
    - Enforce linear history: true (rebase only)
  ```

- **Challenges:**
  - Two-tier system can create friction
  - Need clear contribution guidelines

- **Benefits:**
  - Maintains velocity for core work
  - Quality gate for external contributions

### Scenario 3: Open Source Growth (10+ contributors)

**Recommendation: Full PR model**

- **Everyone uses PRs:**
  - Core team loses direct commit privilege
  - All changes go through review
  - Automated checks on all PRs

- **Merge Strategy:**
  - Rebase-only merges for clean linear history
  - No merge commits
  - Squash optionally for feature work

- **Challenges:**
  - Core team velocity drops
  - More process overhead
  - Potential for PR queue bottlenecks

- **Benefits:**
  - Consistent quality gates
  - Better knowledge sharing
  - Audit trail for all changes

## The Branching Decision Tree

```
Current: Direct commits
         ↓
Decision: Add PRs?
         ├─ No → Continue trunk-based
         │       (Maximum velocity, minimum process)
         │
         └─ Yes → Choose merge strategy:
                  ├─ Merge commits
                  │  (Preserves full context, complex history)
                  │
                  ├─ Squash merge
                  │  (Clean history, loses granular commits)
                  │
                  └─ Rebase merge ← Recommended
                     (Linear history, requires discipline)
```

## Rebase-First Configuration

When you do eventually add branching:

```bash
# Global git configuration for contributors
git config pull.rebase true
git config rebase.autoStash true
git config merge.ff only

# Repository-specific enforcement
git config --local commit.gpgsign true  # If using signed commits
git config --local pull.rebase true
```

## Integration with Existing Tools

### Nagare Compatibility

- Nagare expects conventional commits on main branch
- Works perfectly with trunk-based development
- For PR model: Ensure PR titles follow conventional format
- Squash merges should preserve conventional commit format

### GitHub Releases

- Current: Direct commits are immediately available for release
- With PRs: Releases can be tied to PR merges
- Consider: Release branches for more control

## Strategic Questions for Decision Making

### 1. Growth Timeline

- **Next 6 months:** Keep current approach
- **6-12 months:** Prepare hybrid model documentation
- **12+ months:** Implement based on actual growth

### 2. Risk Tolerance

- **Startup Speed Priority:** Stay trunk-based as long as possible
- **Stability Priority:** Add review gates when team grows beyond 3
- **Compliance Requirements:** May force PR model regardless of size

### 3. Contributor Profile

- **Trusted Experts:** Minimal process, direct commit rights
- **Mixed Experience:** Hybrid model with mentorship
- **Unknown Contributors:** Full PR and review process

## Hidden Complexities to Consider

1. **Bisecting:** Easier with linear history but harder with squashed commits
2. **Rollbacks:** Depend on deployment strategy, not just git strategy
3. **Changelog Generation:** Nagare needs consistent commit format
4. **CI/CD Integration:** More complex with PR model
5. **Secret Management:** PRs from forks can't access secrets

## Recommended Action Plan

### Phase 1: Current (Now - Team of 1-3)

- Continue trunk-based development
- Document conventions in CONTRIBUTING.md
- Maintain strict conventional commits
- Keep using Nagare for automation

### Phase 2: Preparation (Team approaching 4-5)

- Create branch protection rules (not enforced)
- Document PR process for future
- Set up CI/CD for PR validation
- Create contributor guidelines

### Phase 3: Hybrid (Team of 5-10)

- Enable branch protection with bypass
- Core team retains direct commit
- External contributors use PRs
- Monitor velocity impact

### Phase 4: Full Model (Team 10+)

- All changes through PRs
- Automated review assignments
- Release branch strategy
- Consider semantic-release tooling

## Key Insight

You're already implementing "continuous integration" more effectively than many teams with complex PR workflows. The
question isn't "should we use rebase?" but rather "when should we add any branching at all?"

The answer: **Add complexity only when the pain of not having it exceeds the cost of maintaining it.**

## References

- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Rebase vs Merge Debate](https://www.reddit.com/r/git/comments/1mg1mfp/i_finally_ditched_git_merge_for_rebase_and/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [GitLab Flow](https://docs.gitlab.com/ee/topics/gitlab_flow.html)
