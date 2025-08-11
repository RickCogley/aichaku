# Implementation Plan: Agent Truth Protocol

## Timeline: 2-3 Weeks

### Week 1: Stop the Bleeding

#### Days 1-2: Core Verification Infrastructure

**File: `src/utils/verification.ts`**

```typescript
export class TruthVerifier {
  async verifyFileOperation(
    operation: "create" | "edit" | "delete",
    path: string,
    expectedContent?: string,
  ): Promise<VerificationResult>;

  async verifyDirectoryOperation(
    operation: "create" | "delete",
    path: string,
  ): Promise<VerificationResult>;

  async extractClaims(text: string): Promise<Claim[]>;

  async verifyClaims(claims: Claim[]): Promise<VerificationReport>;
}
```

**Tasks:**

- [ ] Create TruthVerifier class
- [ ] Add file operation verification
- [ ] Add directory operation verification
- [ ] Create claim extraction logic
- [ ] Add verification report generation

#### Days 2-3: Update Agent Base Class

**File: `src/agents/base-agent.ts`**

```typescript
export abstract class TruthfulAgent {
  protected verifier: TruthVerifier;

  // Wrapped operations that ALWAYS verify
  protected async createFile(path: string, content: string): Promise<FileResult>;
  protected async editFile(path: string, changes: Edit[]): Promise<FileResult>;
  protected async deleteFile(path: string): Promise<DeleteResult>;

  // Mandatory verification before returning
  protected async prepareResponse(message: string): Promise<VerifiedResponse>;
}
```

**Tasks:**

- [ ] Create TruthfulAgent base class
- [ ] Wrap all file operations with verification
- [ ] Add prepareResponse with auto-verification
- [ ] Update agent generator to use new base class

#### Days 3-4: Orchestrator Verification Layer

**File: `src/orchestrator/verification-middleware.ts`**

```typescript
export class OrchestrationVerifier {
  async interceptResponse(
    response: AgentResponse,
    agent: Agent,
  ): Promise<VerifiedResponse | VerificationError>;

  async validateClaims(response: AgentResponse): Promise<ValidationResult>;

  async generateErrorReport(
    claims: Claim[],
    failures: VerificationFailure[],
  ): Promise<ErrorReport>;
}
```

**Tasks:**

- [ ] Create orchestrator verification middleware
- [ ] Add response interception
- [ ] Implement claim validation
- [ ] Create error reporting

### Week 2: Expand and Guide

#### Days 5-6: Guided Testing Framework

**File: `src/testing/guided-testing.ts`**

```typescript
export class GuidedTestingSession {
  async createTestPlan(feature: string): Promise<TestPlan>;

  async guideStep(
    step: TestStep,
    userFeedback?: string,
  ): Promise<NextStep | Completion>;

  async generateTestingPrompt(
    operation: string,
    expectedBehavior: string,
  ): Promise<string>;
}
```

**Templates:**

````markdown
## Let's Test Together: [Feature Name]

I've completed the implementation. Let's verify it works correctly:

### Step 1: [Action]

```bash
[command to run]
```
````

**Expected**: [what should happen] **Please tell me**: What do you see?

### Step 2: [Next Action]

...

````
**Tasks:**
- [ ] Create guided testing framework
- [ ] Build test plan templates
- [ ] Add interactive prompting
- [ ] Create feedback processing

#### Days 6-7: Update All Agents

**Agents to Update:**
- [ ] aichaku-documenter
- [ ] aichaku-code-explorer  
- [ ] aichaku-typescript-expert
- [ ] aichaku-test-expert
- [ ] aichaku-orchestrator
- [ ] aichaku-security-reviewer
- [ ] aichaku-vento-expert
- [ ] All other agents

**Each agent needs:**
1. Extend TruthfulAgent instead of base
2. Use verified operations for all file I/O
3. Add guided testing for features
4. Update response patterns

### Week 3: Monitor and Refine

#### Days 8-9: Metrics and Monitoring

**File: `src/monitoring/truth-metrics.ts`**
```typescript
export class TruthMetrics {
  async logVerification(
    agent: string,
    claim: Claim,
    result: VerificationResult
  ): Promise<void>
  
  async generateTruthReport(
    timeframe: TimeRange
  ): Promise<TruthReport>
  
  async detectPatterns(
    failures: VerificationFailure[]
  ): Promise<FailurePattern[]>
}
````

**Dashboard Output:**

```
Truth Report: Week of 2025-08-09

Verification Stats:
- Total claims: 1,247
- Verified true: 1,241 (99.5%)
- False positives caught: 6 (0.5%)

Top Failure Patterns:
1. Permission denied on /usr directories (3 cases)
2. Race condition in parallel file creation (2 cases)
3. Network timeout on file verification (1 case)

Agent Reliability:
- aichaku-documenter: 100% truthful
- aichaku-code-explorer: 99.8% truthful
- aichaku-orchestrator: 99.5% truthful
```

**Tasks:**

- [ ] Create metrics collection
- [ ] Add truth reporting
- [ ] Build pattern detection
- [ ] Create dashboard output

#### Days 9-10: Documentation and Training

**Documentation Updates:**

- [ ] Agent developer guide with Truth Protocol
- [ ] User guide for guided testing
- [ ] Verification requirements spec
- [ ] Migration guide for existing agents

**Training Materials:**

- [ ] Example: Converting lying agent to truthful
- [ ] Pattern library for common verifications
- [ ] Test suite for verifier testing
- [ ] Video: "How Truth Protocol Works"

## Rollout Strategy

### Phase 1: Alpha (Days 1-4)

- Deploy to development environment
- Test with internal team
- Fix critical issues

### Phase 2: Beta (Days 5-7)

- Deploy to staging
- Limited user testing
- Gather feedback

### Phase 3: Production (Day 8+)

- Gradual rollout (10% → 50% → 100%)
- Monitor metrics closely
- Quick fixes for edge cases

## Success Criteria

### Week 1 Success

- [ ] Zero false file creation claims
- [ ] All agents using verification
- [ ] Orchestrator catching lies

### Week 2 Success

- [ ] Guided testing in use
- [ ] Users reporting confidence increase
- [ ] All agents converted

### Week 3 Success

- [ ] < 0.1% false positive rate
- [ ] Truth metrics dashboard live
- [ ] Documentation complete

## Risk Mitigation

### Risk: Performance Impact

**Mitigation**:

- Parallel verification where possible
- Cache verification results (with TTL)
- Skip verification for read-only operations

### Risk: Breaking Changes

**Mitigation**:

- Backward compatible API
- Feature flag for gradual rollout
- Fallback to old behavior if needed

### Risk: User Confusion

**Mitigation**:

- Clear error messages
- Documentation with examples
- Guided testing reduces ambiguity

## Communication Plan

### For Users

```markdown
## 🎉 Truth Protocol Released

Your Aichaku agents now verify all their work before reporting back.

**What's changed:**

- Agents verify files exist before claiming creation
- Clear error messages when operations fail
- Guided testing for complex features

**What you'll notice:**

- More reliable: "If it says it's done, it's done"
- Better errors: Specific reasons for failures
- Interactive testing: Work with agents to verify features
```

### For Developers

```markdown
## ⚠️ Required: Update Your Agents

All agents must implement Truth Protocol by [date].

**Required changes:**

1. Extend TruthfulAgent base class
2. Use verified operations for file I/O
3. Add guided testing for features

**Resources:**

- Migration guide: docs/truth-protocol-migration.md
- Example PR: #[number]
- Support channel: #truth-protocol
```

## The Commit

Once we bet on this, we're committed to:

1. **No more lies** - Not a single false claim ships
2. **Full transparency** - Users see exactly what happened
3. **Guided collaboration** - Agents and users test together

This isn't a feature - it's fixing a fundamental flaw. We ship this, or we admit we can't be trusted.
