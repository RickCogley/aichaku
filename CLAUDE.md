# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
the Aichaku methodology library.

<!-- AICHAKU:START -->

<!-- AICHAKU:METHODOLOGY:START -->
## 🎯 MANDATORY: Aichaku Integration Rules

YOU ARE REQUIRED TO FOLLOW THESE RULES WITHOUT EXCEPTION:

### 1. Discussion-First Document Creation

**Phase 1: DISCUSSION MODE (Default when methodology keywords detected)**
✅ Acknowledge the methodology context: "🪴 Aichaku: I see you're thinking about [topic]"
✅ Ask clarifying questions to understand the goal
✅ Help shape and refine the idea
❌ DO NOT create any project folders yet
❌ DO NOT create any documents yet

**Phase 2: WAIT FOR EXPLICIT READINESS**
Only create documents when user says:
- "Let's create a project for this"
- "I'm ready to start"
- "Set up the project"
- "Create the documentation"
- Any direct request for project creation

**Phase 3: CREATE NAMED PROJECT (After user signals readiness)**
✅ Confirm name: "🪴 Aichaku: Based on our discussion, creating project: [descriptive-name]"
✅ Create ALL documents in: `.claude/output/active-YYYY-MM-DD-{descriptive-name}/`
✅ Create STATUS.md FIRST
✅ Create methodology-specific documents
✅ Read guides from `~/.claude/methodologies/`

**YOU MUST NEVER:**
❌ Create documents in the project root directory
❌ Create documents in .claude/user/ (that's for customizations)
❌ Ask where to put files (always use .claude/output/)
❌ Create folders before user is ready to formalize

### 2. CRITICAL: DISCUSSION FIRST, THEN CREATE WITHOUT ASKING

**During Discussion Phase:**
✅ DO say: "🪴 Aichaku: I understand you're exploring [topic]. Let me help you think through this..."
✅ DO say: "What specific challenges are you looking to address?"
❌ NEVER say: "Would you like me to create documents for this?"

**Once User Signals Readiness:**
❌ NEVER say: "Would you like me to..."
❌ NEVER say: "Shall I create..."
❌ NEVER say: "Should I go ahead and..."
✅ IMMEDIATELY say: "🪴 Aichaku: Creating project: [descriptive-name]"
✅ IMMEDIATELY say: "Setting up Shape Up documentation..."
✅ IMMEDIATELY say: "Generating sprint planning templates..."

**THE RULE:** Discuss and refine FIRST. Once user signals readiness, CREATE IMMEDIATELY without asking. This provides thoughtful structure while respecting user autonomy.

### 3. Methodology Detection & Discussion

When you hear these keywords, ENTER DISCUSSION MODE:

**Planning Keywords** → Will create in `.claude/output/active-*/` (when ready):
- "shape"/"pitch" → Discuss Shape Up approach → Later: pitch.md
- "sprint"/"scrum" → Discuss Scrum planning → Later: sprint-planning.md
- "kanban"/"board" → Discuss Kanban flow → Later: kanban-board.md
- "mvp"/"lean" → Discuss Lean experiments → Later: experiment-plan.md

**Discussion Mode Actions:**
1. Acknowledge: "🪴 Aichaku: I see you're interested in [methodology]"
2. Read the appropriate guide SILENTLY:
   - `~/.claude/methodologies/[methodology]/[METHODOLOGY]-AICHAKU-GUIDE.md`
   - `~/.claude/methodologies/core/[MODE].md`
3. Ask clarifying questions based on the methodology
4. Help refine the approach
5. WAIT for explicit "create project" signal

### 4. Visual Identity & Progress Indicators

**MANDATORY Visual Identity:**
✅ ALWAYS prefix Aichaku messages with: 🪴 Aichaku:
✅ Use growth phase indicators: 🌱 (new) → 🌿 (active) → 🌳 (mature) → 🍃 (complete)
✅ Show current phase in status updates with **bold** text and arrow: [Planning] → [**Executing**] → [Complete]
                                                                                    ▲

**Example Status Display:**
```
🪴 Aichaku: Shape Up Progress
[Shaping] → [**Betting**] → [Building] → [Cool-down]
              ▲
Week 2/6 ████████░░░░░░░░░░░░ 33% 🌿
```

**Methodology Icons:**
- Shape Up: Use 🎯 for betting, 🔨 for building
- Scrum: Use 🏃 for sprints, 📋 for backlog
- Kanban: Use 📍 for cards, 🌊 for flow
- Lean: Use 🧪 for experiments, 📊 for metrics

**NEVER:**
❌ Use garden metaphors in text (no "planting", "growing", "harvesting")
❌ Mix visual indicators (keep consistent within a project)
❌ Overuse emojis (maximum one per concept)

### 5. Mermaid Diagram Integration

**MANDATORY Diagram Creation:**
✅ Include Mermaid diagrams in EVERY project documentation
✅ Add methodology-specific workflow diagrams
✅ Use diagrams to visualize project status

**Required Diagrams by Document:**

**In STATUS.md:**
```mermaid
graph LR
    A[🌱 Started] --> B[🌿 Active]
    B --> C[🌳 Review]
    C --> D[🍃 Complete]
    style B fill:#90EE90
```

**In Shape Up pitch.md:**
```mermaid
graph TD
    A[Problem] --> B[Appetite: 6 weeks]
    B --> C[Solution Outline]
    C --> D[Rabbit Holes]
    D --> E[No-gos]
```

**In Scrum sprint-planning.md:**
```mermaid
gantt
    title Sprint 15 Timeline
    dateFormat  YYYY-MM-DD
    section Sprint
    Planning          :done, 2025-07-07, 1d
    Development       :active, 2025-07-08, 8d
    Review & Retro    :2025-07-16, 2d
```

**NEVER:**
❌ Create diagrams without labels
❌ Use complex diagrams when simple ones work
❌ Forget to update diagrams with status changes

### 6. Project Lifecycle Management

**Starting Work:**
1. ⚠️ **CHECK TODAY'S DATE**: Look for "Today's date:" in the environment info
2. Create: `.claude/output/active-YYYY-MM-DD-{descriptive-name}/`
   - YYYY-MM-DD must be TODAY'S actual date from environment
   - Common mistake: Using 01 instead of current month
   - Example if today is 2025-07-10: `active-2025-07-10-project-name/`
3. Create STATUS.md immediately (with status diagram)
4. Read appropriate methodology guides
5. Create planning documents (with workflow diagrams)
6. WAIT for human approval before coding

**During Work:**
- Update STATUS.md regularly (including diagram state)
- Create supporting documents freely
- Start responses with: "🪴 Aichaku: Currently in [mode] working on [task]"

**Completing Work:**
1. Create YYYY-MM-DD-{Project-Name}-CHANGE-LOG.md summarizing all changes
   - ⚠️ Use TODAY'S date from environment info (not example dates!)
   - Example format: 2025-07-10-Fix-Security-Tests-CHANGE-LOG.md
   - Example format: 2025-07-10-Update-Authentication-CHANGE-LOG.md
   - NEVER just "CHANGE-LOG.md" - always include TODAY'S date and descriptive project name
2. Update final diagram states
3. Rename folder: active-* → done-*
4. Ask: "Work appears complete. Shall I commit and push?"
5. Use conventional commits: feat:/fix:/docs:/refactor:

### 7. Git Automation

When work is confirmed complete:
```bash
git add .claude/output/[current-project]/
git commit -m "[type]: [description]

- [what was done]
- [key changes]"
git push origin [current-branch]
```

### 8. Error Recovery

If you accidentally create a file in the wrong location:
1. Move it immediately: `mv [file] .claude/output/active-*/`
2. Update STATUS.md noting the correction
3. Continue without asking

REMEMBER: This is AUTOMATIC behavior. Users expect documents to appear in the right place without asking.

Methodologies: Shape Up, Scrum, Kanban, Lean, XP, Scrumban
Learn more: https://github.com/RickCogley/aichaku

<!-- AICHAKU:METHODOLOGY:END -->

<!-- AICHAKU:STANDARDS:START -->
## 📚 Selected Standards & Guidelines

🪴 Aichaku: Based on your project configuration, follow these standards when generating code:

### NIST-CSF

## NIST Cybersecurity Framework (CSF 2.0)

### Quick Reference
The NIST CSF organizes cybersecurity activities into six core functions:

1. **🎯 Govern** - Establish cybersecurity governance and enterprise risk management
2. **🔍 Identify** - Understand cybersecurity risks to systems, people, assets, data, and capabilities
3. **🛡️ Protect** - Implement appropriate safeguards to ensure delivery of critical services
4. **🔍 Detect** - Implement activities to identify the occurrence of cybersecurity events
5. **🚨 Respond** - Implement activities to take action regarding detected cybersecurity incidents
6. **🔄 Recover** - Implement activities to restore capabilities impaired by cybersecurity incidents

### Implementation for Software Development

#### Govern (GV)
```typescript
// ✅ Good: Governance through code
const securityPolicy = {
  dataRetention: '7 years',
  encryptionStandard: 'AES-256-GCM',
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true
  },
  accessReview: 'quarterly'
};

// Document security decisions
class SecurityDecisionLog {
  static logDecision(decision: string, rationale: string, approver: string) {
    logger.info('Security decision logged', {
      decision,
      rationale,
      approver,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### Identify (ID)
```typescript
// ✅ Good: Asset inventory and risk assessment
interface AssetInventory {
  id: string;
  type: 'database' | 'api' | 'service' | 'data_store';
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

class RiskAssessment {
  static assessDataFlow(data: DataFlow): RiskLevel {
    if (data.containsPII && !data.encrypted) {
      return 'critical';
    }
    if (data.classification === 'restricted' && data.networkExposed) {
      return 'high';
    }
    return 'medium';
  }
}
```

#### Protect (PR)
```typescript
// ✅ Good: Implement protection measures
class DataProtection {
  static encryptSensitiveData(data: string): string {
    return crypto.encrypt(data, {
      algorithm: 'AES-256-GCM',
      key: process.env.ENCRYPTION_KEY
    });
  }
  
  static enforceAccessControl(user: User, resource: Resource): boolean {
    return user.permissions.includes(resource.requiredPermission) &&
           user.clearanceLevel >= resource.clearanceLevel;
  }
}

// Implement secure defaults
const secureDefaults = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  passwordExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
  httpsOnly: true,
  secureCookies: true
};
```

#### Detect (DE)
```typescript
// ✅ Good: Security monitoring and alerting
class SecurityMonitoring {
  static monitorFailedLogins(attempts: LoginAttempt[]) {
    const recentFailures = attempts.filter(
      attempt => !attempt.successful && 
      attempt.timestamp > Date.now() - (5 * 60 * 1000)
    );
    
    if (recentFailures.length > 5) {
      this.alertSecurityTeam('Potential brute force attack', {
        ip: recentFailures[0].ip,
        username: recentFailures[0].username,
        attemptCount: recentFailures.length
      });
    }
  }
  
  static detectAnomalousActivity(userActivity: UserActivity) {
    if (userActivity.dataAccessVolume > userActivity.normalBaseline * 10) {
      this.flagSuspiciousActivity('Unusual data access pattern', userActivity);
    }
  }
}
```

#### Respond (RS)
```typescript
// ✅ Good: Incident response procedures
class IncidentResponse {
  static async containThreat(incident: SecurityIncident) {
    // Immediate containment
    if (incident.severity === 'critical') {
      await this.disableAffectedAccounts(incident.affectedUsers);
      await this.isolateAffectedSystems(incident.affectedSystems);
    }
    
    // Notification
    await this.notifySecurityTeam(incident);
    
    // Documentation
    await this.logIncident(incident);
  }
  
  static async investigateIncident(incident: SecurityIncident) {
    const evidence = await this.collectEvidence(incident);
    const analysis = await this.analyzeEvidence(evidence);
    
    return {
      rootCause: analysis.rootCause,
      impact: analysis.impact,
      recommendations: analysis.recommendations
    };
  }
}
```

#### Recover (RC)
```typescript
// ✅ Good: Recovery and restoration procedures
class RecoveryManager {
  static async restoreFromBackup(system: string, pointInTime: Date) {
    // Validate backup integrity
    const backup = await this.validateBackup(system, pointInTime);
    
    if (!backup.isValid) {
      throw new Error('Backup integrity check failed');
    }
    
    // Restore system
    await this.restoreSystem(system, backup);
    
    // Verify restoration
    await this.verifySystemIntegrity(system);
    
    // Update recovery metrics
    this.updateRecoveryMetrics(system, {
      recoveryTime: Date.now() - incident.detectionTime,
      dataLoss: backup.dataLoss
    });
  }
}
```

### CSF Implementation Tiers

#### Tier 1: Partial
```typescript
// Basic security measures
const basicSecurity = {
  authentication: 'username/password',
  logging: 'error logs only',
  updates: 'manual, irregular'
};
```

#### Tier 2: Risk Informed
```typescript
// Risk-based security decisions
const riskInformedSecurity = {
  authentication: 'multi-factor authentication',
  logging: 'comprehensive audit logging',
  updates: 'regular, risk-prioritized patches',
  riskAssessment: 'annual assessments'
};
```

#### Tier 3: Repeatable
```typescript
// Formal policies and procedures
const repeatableSecurity = {
  policies: 'documented and approved',
  procedures: 'standardized and tested',
  training: 'regular security awareness',
  metrics: 'security KPIs tracked'
};
```

#### Tier 4: Adaptive
```typescript
// Continuous improvement
const adaptiveSecurity = {
  threatIntelligence: 'real-time threat feeds',
  automation: 'automated response to known threats',
  learning: 'lessons learned incorporated',
  innovation: 'proactive security measures'
};
```

### Development Integration

#### Secure Development Lifecycle
```typescript
// Integrate security into development workflow
class SecureSDLC {
  static async preCommitChecks(code: string): Promise<SecurityCheckResult> {
    const results = await Promise.all([
      this.scanForSecrets(code),
      this.performStaticAnalysis(code),
      this.checkDependencyVulnerabilities(),
      this.validateSecurityRequirements(code)
    ]);
    
    return this.consolidateResults(results);
  }
  
  static async deploymentChecks(artifact: DeploymentArtifact): Promise<void> {
    await this.verifySignature(artifact);
    await this.scanForVulnerabilities(artifact);
    await this.validateSecurityConfiguration(artifact);
  }
}
```

#### Security Metrics
```typescript
// Track security metrics
interface SecurityMetrics {
  vulnerabilityCount: number;
  patchingTime: number; // Time to patch vulnerabilities
  incidentResponseTime: number;
  securityTrainingCompletion: number;
  complianceScore: number;
}

class SecurityMetricsCollector {
  static collectMetrics(): SecurityMetrics {
    return {
      vulnerabilityCount: this.countOpenVulnerabilities(),
      patchingTime: this.calculateAveragePatchTime(),
      incidentResponseTime: this.calculateResponseTime(),
      securityTrainingCompletion: this.getTrainingCompletionRate(),
      complianceScore: this.calculateComplianceScore()
    };
  }
}
```

### CSF Profile for Software Development

#### Core Requirements
- **Data Protection**: Encrypt sensitive data at rest and in transit
- **Access Control**: Implement role-based access with least privilege
- **Vulnerability Management**: Regular scanning and patching
- **Incident Response**: Documented procedures and contact information
- **Security Testing**: Integrate security testing into CI/CD pipeline

#### Risk-Based Priorities
1. **High Priority**: Authentication, encryption, input validation
2. **Medium Priority**: Logging, monitoring, backup procedures
3. **Low Priority**: Advanced threat detection, security automation

### Compliance Considerations

#### Documentation Requirements
```typescript
// Maintain compliance documentation
class ComplianceDocumentation {
  static generateSecurityAssessment(): SecurityAssessment {
    return {
      assessmentDate: new Date(),
      scope: this.getSystemScope(),
      findings: this.getSecurityFindings(),
      riskLevel: this.calculateOverallRisk(),
      remediationPlan: this.generateRemediationPlan()
    };
  }
}
```

#### Audit Trail
```typescript
// Maintain comprehensive audit logs
class AuditLogger {
  static logSecurityEvent(event: SecurityEvent) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent
    };
    
    this.writeToAuditLog(auditEntry);
  }
}
```

Remember: The NIST CSF is a risk-based approach to cybersecurity. Focus on implementing controls that address your specific risks and business requirements, starting with the most critical assets and highest-risk scenarios.

---

### TDD

## Test-Driven Development (TDD)

### Quick Reference
TDD follows a simple three-step cycle:

1. **🔴 Red** - Write a failing test
2. **🟢 Green** - Write minimal code to make it pass
3. **🔵 Refactor** - Improve the code while keeping tests green

### Core Principles

#### Write Tests First
```typescript
// ✅ Good: Test first approach
describe('UserService', () => {
  it('should create a user with valid data', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const user = await userService.createUser(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.createdAt).toBeInstanceOf(Date);
  });
});

// Then implement the minimal code to pass
class UserService {
  async createUser(userData: UserData): Promise<User> {
    return {
      id: generateId(),
      email: userData.email,
      name: userData.name,
      createdAt: new Date()
    };
  }
}
```

#### Test Behavior, Not Implementation
```typescript
// ✅ Good: Testing behavior
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });
  
  it('should handle decimal numbers', () => {
    const result = calculator.add(0.1, 0.2);
    expect(result).toBeCloseTo(0.3);
  });
});

// ❌ Bad: Testing implementation details
describe('Calculator', () => {
  it('should call the internal sum method', () => {
    const spy = jest.spyOn(calculator, 'sum');
    calculator.add(2, 3);
    expect(spy).toHaveBeenCalled();
  });
});
```

### The TDD Cycle in Practice

#### 1. Red Phase - Write a Failing Test
```typescript
// Start with a failing test
describe('Order', () => {
  it('should calculate total with tax', () => {
    const order = new Order([
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ]);
    
    const total = order.calculateTotal(0.1); // 10% tax
    expect(total).toBe(275); // (200 + 50) * 1.1
  });
});

// This will fail because Order class doesn't exist yet
```

#### 2. Green Phase - Make It Pass
```typescript
// Write minimal code to make the test pass
class Order {
  constructor(private items: OrderItem[]) {}
  
  calculateTotal(taxRate: number): number {
    const subtotal = this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    return subtotal * (1 + taxRate);
  }
}
```

#### 3. Refactor Phase - Improve the Code
```typescript
// Refactor while keeping tests green
class Order {
  constructor(private items: OrderItem[]) {}
  
  calculateTotal(taxRate: number): number {
    const subtotal = this.calculateSubtotal();
    return this.applyTax(subtotal, taxRate);
  }
  
  private calculateSubtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
  }
  
  private applyTax(amount: number, rate: number): number {
    return amount * (1 + rate);
  }
}
```

### TDD Best Practices

#### Test Structure (AAA Pattern)
```typescript
describe('UserValidator', () => {
  it('should reject invalid email addresses', () => {
    // Arrange
    const validator = new UserValidator();
    const invalidEmail = 'not-an-email';
    
    // Act
    const result = validator.validateEmail(invalidEmail);
    
    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });
});
```

#### One Assert Per Test
```typescript
// ✅ Good: Single assertion
it('should create user with correct email', () => {
  const user = userService.createUser({ email: 'test@example.com' });
  expect(user.email).toBe('test@example.com');
});

it('should create user with generated ID', () => {
  const user = userService.createUser({ email: 'test@example.com' });
  expect(user.id).toBeDefined();
});

// ❌ Bad: Multiple assertions
it('should create user correctly', () => {
  const user = userService.createUser({ email: 'test@example.com' });
  expect(user.email).toBe('test@example.com');
  expect(user.id).toBeDefined();
  expect(user.createdAt).toBeInstanceOf(Date);
});
```

#### Test Naming Convention
```typescript
// ✅ Good: Descriptive test names
describe('EmailService', () => {
  describe('sendEmail', () => {
    it('should send email successfully with valid data', () => {});
    it('should throw error when recipient is invalid', () => {});
    it('should retry sending on temporary failure', () => {});
  });
});
```

### Testing Different Scenarios

#### Happy Path Testing
```typescript
it('should successfully process valid order', async () => {
  const order = createValidOrder();
  const result = await orderService.processOrder(order);
  
  expect(result.status).toBe('processed');
  expect(result.orderId).toBeDefined();
});
```

#### Edge Cases
```typescript
it('should handle empty order', async () => {
  const emptyOrder = new Order([]);
  const result = await orderService.processOrder(emptyOrder);
  
  expect(result.status).toBe('error');
  expect(result.error).toBe('Order cannot be empty');
});

it('should handle extremely large orders', async () => {
  const largeOrder = createOrderWithItems(10000);
  const result = await orderService.processOrder(largeOrder);
  
  expect(result.status).toBe('processed');
});
```

#### Error Conditions
```typescript
it('should handle payment failure gracefully', async () => {
  const order = createValidOrder();
  mockPaymentService.processPayment.mockRejectedValue(new PaymentError('Card declined'));
  
  const result = await orderService.processOrder(order);
  
  expect(result.status).toBe('payment_failed');
  expect(result.error).toBe('Payment processing failed');
});
```

### Mocking and Test Doubles

#### Dependency Injection for Testability
```typescript
// ✅ Good: Injectable dependencies
class OrderService {
  constructor(
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private emailService: EmailService
  ) {}
  
  async processOrder(order: Order): Promise<OrderResult> {
    // Implementation
  }
}

// Test with mocks
describe('OrderService', () => {
  let orderService: OrderService;
  let mockPaymentService: jest.Mocked<PaymentService>;
  
  beforeEach(() => {
    mockPaymentService = {
      processPayment: jest.fn()
    };
    
    orderService = new OrderService(
      mockPaymentService,
      mockInventoryService,
      mockEmailService
    );
  });
});
```

### TDD Benefits

1. **Better Design** - Forces you to think about interfaces first
2. **Faster Feedback** - Catch issues immediately
3. **Higher Confidence** - Comprehensive test coverage
4. **Refactoring Safety** - Tests catch regressions
5. **Documentation** - Tests serve as living documentation
6. **Reduced Debugging** - Failures are caught early

### Common TDD Antipatterns

#### Testing Implementation Details
```typescript
// ❌ Bad: Testing private methods
it('should call private validation method', () => {
  const spy = jest.spyOn(service, 'validateInternal');
  service.process(data);
  expect(spy).toHaveBeenCalled();
});
```

#### Writing Tests After Code
```typescript
// ❌ Bad: Tests written after implementation
// This often results in tests that just confirm what the code does,
// not what it should do
```

#### Over-Mocking
```typescript
// ❌ Bad: Mocking everything
it('should process order', () => {
  const mockOrder = { id: 1 };
  const mockResult = { status: 'success' };
  
  jest.spyOn(orderService, 'processOrder').mockResolvedValue(mockResult);
  
  const result = orderService.processOrder(mockOrder);
  expect(result).resolves.toBe(mockResult);
  // This test doesn't verify any real behavior
});
```

### Integration with CI/CD

```typescript
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

Remember: TDD is not just about testing - it's a design methodology that leads to better, more maintainable code through the discipline of writing tests first.

---

### TEST-PYRAMID

## Test Pyramid

### Quick Reference
The Test Pyramid is a testing strategy that emphasizes:

1. **🔺 Unit Tests** (Base) - Fast, isolated, numerous
2. **🔧 Integration Tests** (Middle) - Moderate speed, fewer than unit tests
3. **🌐 E2E Tests** (Top) - Slow, comprehensive, minimal

### Core Principles

#### Layer Distribution
```
     /\     ← E2E Tests (Few)
    /  \    
   /    \   ← Integration Tests (Some)
  /      \  
 /________\ ← Unit Tests (Many)
```

#### Unit Tests (Foundation)
```typescript
// ✅ Good: Fast, isolated unit tests
describe('EmailValidator', () => {
  it('should validate correct email format', () => {
    const validator = new EmailValidator();
    expect(validator.isValid('test@example.com')).toBe(true);
    expect(validator.isValid('invalid-email')).toBe(false);
  });
});

// ✅ Good: Testing pure functions
describe('calculateDiscount', () => {
  it('should apply percentage discount correctly', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
    expect(calculateDiscount(50, 0.2)).toBe(40);
  });
});
```

#### Integration Tests (Middle Layer)
```typescript
// ✅ Good: Testing component interactions
describe('UserService Integration', () => {
  it('should create user and save to database', async () => {
    const userService = new UserService(testDatabase);
    const user = await userService.createUser({
      email: 'test@example.com',
      name: 'Test User'
    });
    
    const savedUser = await testDatabase.findById(user.id);
    expect(savedUser.email).toBe('test@example.com');
  });
});

// ✅ Good: API endpoint testing
describe('POST /api/users', () => {
  it('should create user via API', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.email).toBe('test@example.com');
  });
});
```

#### End-to-End Tests (Peak)
```typescript
// ✅ Good: Critical user journey testing
describe('User Registration Flow', () => {
  it('should complete full registration process', async () => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123');
    await page.click('[data-testid="submit"]');
    
    // Verify success
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
    
    // Verify email sent
    const emails = await getTestEmails();
    expect(emails).toContainEqual(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Welcome to our platform'
      })
    );
  });
});
```

### Test Distribution Guidelines

#### Recommended Ratios
- **Unit Tests**: 70-80% of total tests
- **Integration Tests**: 15-25% of total tests
- **E2E Tests**: 5-10% of total tests

#### Speed Targets
- **Unit Tests**: < 10ms per test
- **Integration Tests**: < 1 second per test
- **E2E Tests**: < 30 seconds per test

### Anti-Patterns to Avoid

#### Ice Cream Cone (Inverted Pyramid)
```typescript
// ❌ Bad: Too many slow E2E tests
describe('Every possible user interaction', () => {
  it('should test button click via browser', async () => {
    // This should be a unit test
  });
  
  it('should test form validation via browser', async () => {
    // This should be a unit test
  });
});
```

#### Testing Trophy (No Strategy)
```typescript
// ❌ Bad: Random test distribution without strategy
// No clear boundaries between test types
// Overlapping responsibilities
```

### Implementation Strategy

#### Start with Unit Tests
```typescript
// 1. Test business logic first
class PriceCalculator {
  calculateTotal(items: Item[], taxRate: number): number {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    return subtotal * (1 + taxRate);
  }
}

// Unit test
it('should calculate total with tax', () => {
  const calculator = new PriceCalculator();
  const items = [{ price: 100 }, { price: 50 }];
  expect(calculator.calculateTotal(items, 0.1)).toBe(165);
});
```

#### Add Integration Tests
```typescript
// 2. Test component interactions
describe('Order Processing', () => {
  it('should process order end-to-end', async () => {
    const order = await orderService.createOrder(orderData);
    const payment = await paymentService.processPayment(order.total);
    const shipment = await shippingService.scheduleShipment(order.id);
    
    expect(order.status).toBe('confirmed');
    expect(payment.status).toBe('completed');
    expect(shipment.estimatedDelivery).toBeDefined();
  });
});
```

#### Minimal E2E Tests
```typescript
// 3. Test critical user journeys only
describe('Critical Business Flows', () => {
  it('should complete purchase journey', async () => {
    // Only test the most important paths
    await completePurchaseFlow();
    await verifyOrderConfirmation();
    await verifyEmailNotification();
  });
});
```

### Tool Recommendations

#### Unit Testing
- **JavaScript/TypeScript**: Jest, Vitest, Deno Test
- **Python**: pytest, unittest
- **Java**: JUnit 5, TestNG
- **C#**: xUnit, NUnit

#### Integration Testing
- **API Testing**: Supertest, Postman, Insomnia
- **Database Testing**: TestContainers, in-memory databases
- **Service Testing**: Docker Compose test environments

#### E2E Testing
- **Browser Testing**: Playwright, Cypress, Selenium
- **Mobile Testing**: Appium, Detox
- **API E2E**: Postman Collections, Newman

### Metrics and Monitoring

#### Test Coverage
```typescript
// Aim for high unit test coverage
const coverageTargets = {
  unitTests: '90%+',
  integrationTests: '80%+',
  e2eTests: 'Critical paths only'
};
```

#### Test Performance
```typescript
// Monitor test execution times
const performanceTargets = {
  unitTestSuite: '< 30 seconds',
  integrationTestSuite: '< 5 minutes',
  e2eTestSuite: '< 30 minutes'
};
```

### CI/CD Integration

#### Pipeline Strategy
```yaml
# Run in order of speed and reliability
stages:
  - unit-tests      # Fast feedback
  - integration     # Moderate feedback
  - e2e-critical    # Slow but comprehensive
  - e2e-full       # Complete coverage (scheduled)
```

Remember: The Test Pyramid ensures fast feedback while maintaining confidence in your system. Focus on a solid foundation of unit tests, supported by targeted integration tests, topped with minimal but comprehensive E2E tests.

---

### CONVENTIONAL-COMMITS

## Conventional Commits

### Quick Reference
Conventional Commits provide a standardized format for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Examples:**
- `feat: add user authentication`
- `fix(auth): resolve login validation issue`
- `docs: update installation guide`
- `refactor!: restructure database schema`

### Commit Types

#### Primary Types
- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes or bug fixes
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

#### Additional Types
- **perf**: Performance improvements
- **ci**: CI/CD configuration changes
- **build**: Build system or dependency changes
- **revert**: Reverting a previous commit

### Examples by Type

#### Feature Commits
```bash
# ✅ Good: Clear feature addition
feat: add password reset functionality

# ✅ Good: Feature with scope
feat(auth): implement two-factor authentication

# ✅ Good: Breaking change
feat!: change API response format

BREAKING CHANGE: API now returns data in 'result' field instead of root level
```

#### Bug Fix Commits
```bash
# ✅ Good: Clear bug fix
fix: resolve memory leak in file upload

# ✅ Good: Fix with scope and issue reference
fix(payment): handle timeout errors properly

Closes #123

# ✅ Good: Critical security fix
fix: prevent SQL injection in user search

InfoSec: Sanitize user input to prevent database attacks
```

#### Documentation Commits
```bash
# ✅ Good: Documentation updates
docs: add API authentication examples

# ✅ Good: README updates
docs(readme): update installation instructions for Windows

# ✅ Good: Code documentation
docs: add JSDoc comments to utility functions
```

#### Refactoring Commits
```bash
# ✅ Good: Code restructuring
refactor: extract user validation logic into separate module

# ✅ Good: Performance refactoring
refactor(database): optimize query performance

# ✅ Good: Breaking refactoring
refactor!: rename getUserData to fetchUserProfile

BREAKING CHANGE: Method name changed from getUserData to fetchUserProfile
```

### Scope Guidelines

#### Common Scopes
- **Component names**: `feat(header): add navigation menu`
- **Feature areas**: `fix(auth): resolve login issues`
- **File/Module names**: `refactor(utils): simplify date formatting`
- **Technology**: `ci(docker): update base image`

#### Scope Examples
```bash
# Frontend scopes
feat(header): add user avatar dropdown
fix(form): validate email format correctly
style(button): update hover states

# Backend scopes
feat(api): add user endpoints
fix(database): resolve connection pooling
perf(cache): implement Redis caching

# Infrastructure scopes
ci(github): add automated testing workflow
build(webpack): update configuration for production
chore(deps): update dependencies to latest versions
```

### Breaking Changes

#### Indicating Breaking Changes
```bash
# Method 1: Exclamation mark
feat!: change user API response format

# Method 2: BREAKING CHANGE footer
feat: update user authentication

BREAKING CHANGE: Authentication now requires API key in header
```

#### Breaking Change Examples
```bash
# ✅ Good: API change
feat!: change REST API response structure

BREAKING CHANGE: All API responses now wrapped in 'data' object

# ✅ Good: Configuration change
config!: update environment variable names

BREAKING CHANGE: 
- DATABASE_URL renamed to DB_CONNECTION_STRING
- API_KEY renamed to SERVICE_API_KEY

# ✅ Good: Library update
deps!: upgrade React to version 18

BREAKING CHANGE: React 18 requires Node.js 16 or higher
```

### Body and Footer Guidelines

#### Commit Body
```bash
feat: add user notification preferences

Allow users to customize which notifications they receive
via email, SMS, or push notifications. Preferences are
stored in user profile and can be updated through the
settings page.

# Multiple paragraphs for complex changes
refactor: restructure authentication system

Extract authentication logic into separate service layer
to improve testability and maintainability.

This change affects all authentication-related components
and requires updating import statements in affected files.
```

#### Footer Examples
```bash
# Issue references
fix: resolve login timeout issue

Closes #456
Fixes #123, #789

# Reviewer credits
feat: add dark mode theme

Co-authored-by: Jane Smith <jane@example.com>
Reviewed-by: John Doe <john@example.com>

# Security notes
fix: patch XSS vulnerability in comments

InfoSec: Sanitize HTML input to prevent script injection attacks
CVE-2023-12345
```

### Integration with Tools

#### Semantic Release
```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/github"
    ]
  }
}
```

#### Version Bumping Rules
- **fix**: Patch version (1.0.0 → 1.0.1)
- **feat**: Minor version (1.0.0 → 1.1.0)
- **BREAKING CHANGE**: Major version (1.0.0 → 2.0.0)

#### Changelog Generation
```markdown
# Changelog

## [2.1.0] - 2023-07-10

### Features
- **auth**: implement two-factor authentication (#123)
- **dashboard**: add user analytics widget (#124)

### Bug Fixes
- **payment**: handle timeout errors properly (#125)
- resolve memory leak in file upload (#126)

### BREAKING CHANGES
- **api**: change response format for user endpoints
```

### Git Hooks Integration

#### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/prepare-commit-msg

# Check if commit message follows conventional format
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Commit message must follow Conventional Commits format"
    echo "Examples:"
    echo "  feat: add new feature"
    echo "  fix(auth): resolve login issue"
    echo "  docs: update README"
    exit 1
fi
```

#### Commitizen Integration
```bash
# Install commitizen
npm install -g commitizen cz-conventional-changelog

# Configure
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# Use interactive commit
git cz
```

### Team Guidelines

#### Commit Message Length
- **Subject line**: 50 characters or less
- **Body lines**: 72 characters or less
- **Clear and concise**: Focus on what and why, not how

#### Language Standards
- **Use imperative mood**: "Add feature" not "Added feature"
- **No trailing punctuation**: Don't end subject with period
- **Capitalize first letter**: "Add feature" not "add feature"

#### Review Checklist
```markdown
## Commit Message Review

- [ ] Follows conventional format
- [ ] Type is appropriate (feat, fix, docs, etc.)
- [ ] Scope is relevant and consistent
- [ ] Description is clear and concise
- [ ] Breaking changes are properly indicated
- [ ] Issue references are included
- [ ] Security implications are noted
```

### Advanced Features

#### Multi-line Subjects for Complex Changes
```bash
feat: implement user authentication system

- Add login/logout functionality
- Implement JWT token management  
- Add password reset flow
- Include email verification

Closes #100, #101, #102
```

#### Revert Commits
```bash
revert: "feat: add user preferences"

This reverts commit abc123def456.

Reason: Feature causing performance issues in production
```

#### Merge Commits
```bash
# Squash and merge with conventional format
feat: complete user management feature (#123)

* feat(users): add user creation
* feat(users): add user editing  
* feat(users): add user deletion
* test(users): add comprehensive test suite
```

### Benefits

1. **Automated Versioning**: Tools can automatically determine version bumps
2. **Changelog Generation**: Automatically generate release notes
3. **Better Collaboration**: Consistent format improves team communication
4. **Issue Tracking**: Easy to link commits to issues and pull requests
5. **Release Automation**: Enable automated releases based on commit types

### Common Mistakes

#### Vague Descriptions
```bash
# ❌ Bad: Too vague
fix: bug fix
feat: new feature
docs: update docs

# ✅ Good: Specific and clear
fix: resolve null pointer exception in user search
feat: add real-time notifications for new messages
docs: add authentication examples to API guide
```

#### Wrong Types
```bash
# ❌ Bad: Wrong type usage
feat: fix typo in README
fix: add new user registration form

# ✅ Good: Correct type usage
docs: fix typo in README
feat: add new user registration form
```

Remember: Conventional Commits create a shared language for your team and enable powerful automation tools that can streamline your development workflow.

---

### 15-FACTOR

## 15-Factor App Methodology

### Quick Reference
Modern cloud-native applications should follow these principles:

1. **Codebase** - One codebase tracked in revision control
2. **Dependencies** - Explicitly declare and isolate dependencies
3. **Config** - Store config in the environment
4. **Backing services** - Treat backing services as attached resources
5. **Build, release, run** - Strictly separate build and run stages
6. **Processes** - Execute the app as one or more stateless processes
7. **Port binding** - Export services via port binding
8. **Concurrency** - Scale out via the process model
9. **Disposability** - Maximize robustness with fast startup and graceful shutdown
10. **Dev/prod parity** - Keep development, staging, and production as similar as possible
11. **Logs** - Treat logs as event streams
12. **Admin processes** - Run admin/management tasks as one-off processes
13. **API first** - Design APIs before implementation
14. **Telemetry** - Collect metrics, logs, and traces
15. **Authentication & authorization** - Centralized auth for all services

### Implementation Guidelines

#### Configuration Management
```typescript
// ✅ Good: Environment variables
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL || 'postgres://localhost/myapp',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET
};

// ❌ Bad: Hardcoded config
const config = {
  port: 3000,
  dbUrl: 'postgres://prod-db:5432/myapp',
  redisUrl: 'redis://prod-cache:6379'
};
```

#### Stateless Processes
```typescript
// ✅ Good: Stateless request handling
export async function handleRequest(req: Request): Promise<Response> {
  const userId = extractUserId(req);
  const userData = await userService.getUser(userId);
  return new Response(JSON.stringify(userData));
}

// ❌ Bad: Storing state in process memory
const userCache = new Map();

export async function handleRequest(req: Request): Promise<Response> {
  const userId = extractUserId(req);
  
  if (userCache.has(userId)) {
    return new Response(JSON.stringify(userCache.get(userId)));
  }
  
  const userData = await userService.getUser(userId);
  userCache.set(userId, userData);
  return new Response(JSON.stringify(userData));
}
```

#### Backing Services
```typescript
// ✅ Good: Configurable backing services
class DatabaseService {
  constructor(private connectionString: string) {}
  
  async connect() {
    this.connection = await postgres.connect(this.connectionString);
  }
}

const db = new DatabaseService(process.env.DATABASE_URL);

// ❌ Bad: Hardcoded service locations
class DatabaseService {
  async connect() {
    this.connection = await postgres.connect('postgres://prod-db:5432/myapp');
  }
}
```

#### Graceful Shutdown
```typescript
// ✅ Good: Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    db.close();
    
    // Exit process
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.log('Forced shutdown');
    process.exit(1);
  }, 10000);
});
```

#### Telemetry Implementation
```typescript
// ✅ Good: Structured logging and metrics
import { logger } from './logger';
import { metrics } from './metrics';

export async function processOrder(order: Order) {
  const timer = metrics.startTimer('order_processing_duration');
  
  try {
    logger.info('Processing order', { orderId: order.id, userId: order.userId });
    
    await validateOrder(order);
    await chargePayment(order);
    await fulfillOrder(order);
    
    metrics.incrementCounter('orders_processed', { status: 'success' });
    logger.info('Order processed successfully', { orderId: order.id });
    
  } catch (error) {
    metrics.incrementCounter('orders_processed', { status: 'error' });
    logger.error('Order processing failed', { orderId: order.id, error: error.message });
    throw error;
  } finally {
    timer.end();
  }
}
```

### Cloud-Native Patterns

#### Health Checks
```typescript
// Liveness probe - is the app running?
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe - is the app ready to serve traffic?
app.get('/health/ready', async (req, res) => {
  try {
    await db.ping();
    await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

#### Feature Flags
```typescript
// ✅ Good: Feature flag implementation
const featureFlags = {
  newCheckoutFlow: process.env.FEATURE_NEW_CHECKOUT === 'true',
  enhancedLogging: process.env.FEATURE_ENHANCED_LOGGING === 'true'
};

export function processCheckout(order: Order) {
  if (featureFlags.newCheckoutFlow) {
    return processCheckoutV2(order);
  }
  return processCheckoutV1(order);
}
```

### Container Considerations

#### Dockerfile Best Practices
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### Key Benefits
- **Scalability**: Apps can scale horizontally
- **Maintainability**: Clear separation of concerns
- **Portability**: Runs consistently across environments
- **Resilience**: Graceful handling of failures
- **Observability**: Built-in monitoring and logging

Remember: 15-factor apps are designed for modern cloud platforms. Each factor addresses specific challenges in distributed, containerized environments.

---

### CLEAN-ARCH

# Clean Architecture

## Overview

Clean Architecture, introduced by Robert C. Martin (Uncle Bob), is an architectural pattern that emphasizes the separation of concerns and the independence of business logic from external frameworks, databases, and UI.

### Core Principles

1. **Independence of Frameworks**: The architecture doesn't depend on the existence of some library of feature-laden software
2. **Testability**: Business rules can be tested without the UI, database, web server, or any external element
3. **Independence of UI**: The UI can change easily without changing the rest of the system
4. **Independence of Database**: You can swap out Oracle or SQL Server for MongoDB, BigTable, CouchDB, or something else
5. **Independence of External Agency**: Business rules don't know anything about the outside world

## The Dependency Rule

The overriding rule that makes this architecture work is The Dependency Rule:

> Source code dependencies must point only inward, toward higher-level policies.

### Layers (from outside to inside)

1. **Frameworks and Drivers** (Blue)
2. **Interface Adapters** (Green)
3. **Application Business Rules** (Red)
4. **Enterprise Business Rules** (Yellow)

## Implementation Examples

### TypeScript/JavaScript Implementation

```typescript
// Domain Layer (Enterprise Business Rules)
// entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private readonly hashedPassword: string
  ) {}

  // Business rule: email must be valid
  static create(email: string, name: string, password: string): User {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return new User(
      this.generateId(),
      email,
      name,
      this.hashPassword(password)
    );
  }
  
  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Use Cases Layer (Application Business Rules)
// usecases/CreateUserUseCase.ts
export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export interface EmailService {
  sendWelcomeEmail(user: User): Promise<void>;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}
  
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create user entity
    const user = User.create(request.email, request.name, request.password);
    
    // Save user
    await this.userRepository.save(user);
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}

// Interface Adapters Layer
// controllers/UserController.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}
  
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createUserUseCase.execute({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      });
      
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

// Infrastructure Layer (Frameworks and Drivers)
// repositories/PostgresUserRepository.ts
export class PostgresUserRepository implements UserRepository {
  constructor(private db: Database) {}
  
  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.name, user.hashedPassword]
    );
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new User(row.id, row.email, row.name, row.password);
  }
}
```

### Python Implementation

```python
# Domain Layer
# domain/entities/order.py
from datetime import datetime
from typing import List
from decimal import Decimal

class OrderItem:
    def __init__(self, product_id: str, quantity: int, price: Decimal):
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        if price < 0:
            raise ValueError("Price cannot be negative")
            
        self.product_id = product_id
        self.quantity = quantity
        self.price = price
    
    @property
    def total(self) -> Decimal:
        return self.price * self.quantity

class Order:
    def __init__(self, customer_id: str):
        self.id = self._generate_id()
        self.customer_id = customer_id
        self.items: List[OrderItem] = []
        self.created_at = datetime.now()
        self.status = "pending"
    
    def add_item(self, item: OrderItem) -> None:
        # Business rule: cannot add items to completed orders
        if self.status == "completed":
            raise ValueError("Cannot add items to completed order")
        self.items.append(item)
    
    @property
    def total(self) -> Decimal:
        return sum(item.total for item in self.items)
    
    def complete(self) -> None:
        # Business rule: cannot complete empty order
        if not self.items:
            raise ValueError("Cannot complete empty order")
        self.status = "completed"

# Use Cases Layer
# application/use_cases/create_order.py
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    @abstractmethod
    async def save(self, order: Order) -> None:
        pass
    
    @abstractmethod
    async def find_by_id(self, order_id: str) -> Order:
        pass

class ProductRepository(ABC):
    @abstractmethod
    async def find_by_id(self, product_id: str) -> Product:
        pass

class CreateOrderUseCase:
    def __init__(
        self,
        order_repository: OrderRepository,
        product_repository: ProductRepository
    ):
        self.order_repository = order_repository
        self.product_repository = product_repository
    
    async def execute(self, request: CreateOrderRequest) -> CreateOrderResponse:
        # Create order
        order = Order(request.customer_id)
        
        # Add items with validation
        for item_request in request.items:
            product = await self.product_repository.find_by_id(
                item_request.product_id
            )
            
            if not product.is_available():
                raise ValueError(f"Product {product.id} is not available")
            
            order_item = OrderItem(
                product.id,
                item_request.quantity,
                product.price
            )
            order.add_item(order_item)
        
        # Save order
        await self.order_repository.save(order)
        
        return CreateOrderResponse(
            order_id=order.id,
            total=order.total,
            status=order.status
        )

# Interface Adapters Layer
# adapters/web/order_controller.py
from fastapi import APIRouter, HTTPException

class OrderController:
    def __init__(self, create_order_use_case: CreateOrderUseCase):
        self.create_order_use_case = create_order_use_case
        self.router = APIRouter()
        self._setup_routes()
    
    def _setup_routes(self):
        @self.router.post("/orders")
        async def create_order(request: CreateOrderDTO):
            try:
                use_case_request = self._map_to_use_case_request(request)
                response = await self.create_order_use_case.execute(
                    use_case_request
                )
                return self._map_to_dto(response)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

# Infrastructure Layer
# infrastructure/repositories/sqlalchemy_order_repository.py
from sqlalchemy.orm import Session

class SQLAlchemyOrderRepository(OrderRepository):
    def __init__(self, session: Session):
        self.session = session
    
    async def save(self, order: Order) -> None:
        db_order = OrderModel(
            id=order.id,
            customer_id=order.customer_id,
            status=order.status,
            created_at=order.created_at
        )
        
        for item in order.items:
            db_item = OrderItemModel(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price
            )
            db_order.items.append(db_item)
        
        self.session.add(db_order)
        self.session.commit()
```

### Go Implementation

```go
// Domain Layer
// domain/entity/product.go
package entity

import (
    "errors"
    "time"
)

type Product struct {
    ID          string
    Name        string
    Description string
    Price       float64
    Stock       int
    CreatedAt   time.Time
}

// Business rule: Product validation
func NewProduct(name, description string, price float64, stock int) (*Product, error) {
    if name == "" {
        return nil, errors.New("product name is required")
    }
    
    if price < 0 {
        return nil, errors.New("price cannot be negative")
    }
    
    if stock < 0 {
        return nil, errors.New("stock cannot be negative")
    }
    
    return &Product{
        ID:          generateID(),
        Name:        name,
        Description: description,
        Price:       price,
        Stock:       stock,
        CreatedAt:   time.Now(),
    }, nil
}

// Use Cases Layer
// application/usecase/product_usecase.go
package usecase

type ProductRepository interface {
    Save(product *entity.Product) error
    FindByID(id string) (*entity.Product, error)
    Update(product *entity.Product) error
}

type CreateProductUseCase struct {
    repo ProductRepository
}

func NewCreateProductUseCase(repo ProductRepository) *CreateProductUseCase {
    return &CreateProductUseCase{repo: repo}
}

func (uc *CreateProductUseCase) Execute(input CreateProductInput) (*CreateProductOutput, error) {
    product, err := entity.NewProduct(
        input.Name,
        input.Description,
        input.Price,
        input.Stock,
    )
    if err != nil {
        return nil, err
    }
    
    if err := uc.repo.Save(product); err != nil {
        return nil, err
    }
    
    return &CreateProductOutput{
        ID:        product.ID,
        Name:      product.Name,
        Price:     product.Price,
        CreatedAt: product.CreatedAt,
    }, nil
}

// Interface Adapters Layer
// adapter/controller/product_controller.go
package controller

type ProductController struct {
    createProductUseCase *usecase.CreateProductUseCase
}

func (c *ProductController) CreateProduct(w http.ResponseWriter, r *http.Request) {
    var request CreateProductRequest
    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    input := usecase.CreateProductInput{
        Name:        request.Name,
        Description: request.Description,
        Price:       request.Price,
        Stock:       request.Stock,
    }
    
    output, err := c.createProductUseCase.Execute(input)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    response := CreateProductResponse{
        ID:        output.ID,
        Name:      output.Name,
        Price:     output.Price,
        CreatedAt: output.CreatedAt,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Infrastructure Layer
// infrastructure/repository/postgres_product_repository.go
package repository

type PostgresProductRepository struct {
    db *sql.DB
}

func (r *PostgresProductRepository) Save(product *entity.Product) error {
    query := `
        INSERT INTO products (id, name, description, price, stock, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    
    _, err := r.db.Exec(
        query,
        product.ID,
        product.Name,
        product.Description,
        product.Price,
        product.Stock,
        product.CreatedAt,
    )
    
    return err
}
```

## Testing in Clean Architecture

### Unit Testing Business Logic

```typescript
// Test domain entities without any dependencies
describe('User Entity', () => {
  it('should create user with valid data', () => {
    const user = User.create('test@example.com', 'Test User', 'password123');
    
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.id).toBeDefined();
  });
  
  it('should reject invalid email', () => {
    expect(() => {
      User.create('invalid-email', 'Test User', 'password123');
    }).toThrow('Invalid email format');
  });
});

// Test use cases with mocked dependencies
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  
  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn()
    };
    
    mockEmailService = {
      sendWelcomeEmail: jest.fn()
    };
    
    useCase = new CreateUserUseCase(mockUserRepository, mockEmailService);
  });
  
  it('should create user successfully', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    
    const result = await useCase.execute({
      email: 'new@example.com',
      name: 'New User',
      password: 'password123'
    });
    
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    expect(result.email).toBe('new@example.com');
  });
});
```

## Clean Architecture Benefits

1. **Independent of Frameworks**: Can change frameworks without changing business logic
2. **Testable**: Business rules can be tested without UI, database, or external elements
3. **Independent of UI**: Can change from web to console to mobile without changing business rules
4. **Independent of Database**: Can switch from SQL to NoSQL without changing business rules
5. **Independent of External Agency**: Business rules don't know about the outside world

## Common Pitfalls

### 1. Leaking Domain Logic

```typescript
// ❌ Bad: Domain logic in controller
class UserController {
  createUser(req, res) {
    // Domain validation in controller
    if (!req.body.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
  }
}

// ✅ Good: Domain logic in entity
class User {
  static create(email: string) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
  }
}
```

### 2. Framework Dependencies in Domain

```typescript
// ❌ Bad: Framework dependency in entity
import { Entity, Column } from 'typeorm'; // Framework dependency

@Entity()
class User {
  @Column()
  email: string;
}

// ✅ Good: Plain domain entity
class User {
  constructor(public email: string) {}
}
```

### 3. Violating Dependency Rule

```typescript
// ❌ Bad: Use case depends on infrastructure
import { PostgresUserRepository } from '../infrastructure/PostgresUserRepository';

class CreateUserUseCase {
  private repo = new PostgresUserRepository(); // Direct dependency
}

// ✅ Good: Use case depends on interface
class CreateUserUseCase {
  constructor(private repo: UserRepository) {} // Interface dependency
}
```

## Applying Clean Architecture to Different Project Types

### Web Applications
- Controllers handle HTTP requests/responses
- Use cases contain application logic
- Entities contain business rules
- Repositories handle data persistence

### CLI Applications
- Commands replace controllers
- Use cases remain the same
- Entities remain the same
- File system or database for persistence

### Microservices
- Each service follows clean architecture
- Shared domain concepts in separate packages
- Inter-service communication through interfaces
- Event-driven architecture at boundaries

## Migration Strategy

1. **Start with Use Cases**: Identify and extract business operations
2. **Extract Entities**: Move business rules to domain entities
3. **Define Interfaces**: Create repository and service interfaces
4. **Implement Adapters**: Create concrete implementations
5. **Refactor Controllers**: Make them thin, delegating to use cases
6. **Add Tests**: Test each layer independently

## Clean Architecture Checklist

- [ ] Dependencies point inward only
- [ ] Business rules are independent of frameworks
- [ ] Use cases are independent of delivery mechanism
- [ ] Entities have no dependencies on external layers
- [ ] All external dependencies are behind interfaces
- [ ] Tests can run without external systems
- [ ] Business logic can be understood without framework knowledge
- [ ] Can change database without changing business rules
- [ ] Can change UI without changing business rules
- [ ] Clear separation between layers

Remember: The goal is to make the business rules the most important part of your application, with everything else being a detail that can be changed without affecting the core business logic.

---

### GOOGLE-STYLE

# Google Style Guides

## Overview

Google's style guides are comprehensive coding standards used across Google's engineering teams. They emphasize readability, consistency, and maintainability while providing specific guidance for multiple programming languages.

### Core Philosophy

1. **Optimize for the reader, not the writer**: Code is read far more often than it's written
2. **Be consistent**: When in doubt, be consistent with existing code
3. **Use common sense**: Rules can be broken if there's a good reason
4. **Clarity over cleverness**: Avoid clever tricks that make code harder to understand

## Language-Specific Guidelines

### TypeScript/JavaScript Style Guide

#### Naming Conventions

```typescript
// Classes and interfaces: PascalCase
class UserAccount {}
interface DatabaseConnection {}

// Variables and functions: camelCase
const userName = 'John';
function calculateTotal() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_ENDPOINT = 'https://api.example.com';

// Private properties: leading underscore discouraged
// ❌ Bad
class User {
  private _name: string;
}

// ✅ Good
class User {
  private name: string;
}

// File names: lowercase with hyphens or underscores
// user-service.ts or user_service.ts
```

#### Type Annotations

```typescript
// Always use type annotations for function parameters and return types
function calculatePrice(
  basePrice: number,
  taxRate: number
): number {
  return basePrice * (1 + taxRate);
}

// Use interface for object types
interface UserData {
  id: string;
  name: string;
  email: string;
}

// Prefer interface over type for object shapes
// ✅ Good
interface Point {
  x: number;
  y: number;
}

// Use type for unions, intersections, and aliases
type Status = 'pending' | 'active' | 'completed';
type ID = string | number;
```

#### Comments and Documentation

```typescript
/**
 * Calculates the total price including tax.
 * @param basePrice - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.1 for 10%)
 * @returns The total price including tax
 */
function calculateTotalPrice(
  basePrice: number,
  taxRate: number
): number {
  // Apply tax to base price
  return basePrice * (1 + taxRate);
}

// Use TODO comments with owner
// TODO(username): Implement caching mechanism

// Avoid obvious comments
// ❌ Bad
let count = 0; // Set count to 0

// ✅ Good - explains why, not what
let retryCount = 0; // Reset counter for exponential backoff
```

#### Code Organization

```typescript
// Import order
// 1. Node built-ins
import * as fs from 'fs';
import * as path from 'path';

// 2. External modules
import express from 'express';
import { Request, Response } from 'express';

// 3. Internal modules
import { UserService } from './services/user-service';
import { Logger } from './utils/logger';

// 4. Types
import type { User, UserRole } from './types';

// Class organization
class UserManager {
  // 1. Static properties
  static readonly DEFAULT_ROLE = 'user';
  
  // 2. Instance properties
  private users: Map<string, User>;
  
  // 3. Constructor
  constructor(private logger: Logger) {
    this.users = new Map();
  }
  
  // 4. Static methods
  static createDefaultUser(): User {
    // ...
  }
  
  // 5. Instance methods (public first, then private)
  public addUser(user: User): void {
    this.validateUser(user);
    this.users.set(user.id, user);
  }
  
  private validateUser(user: User): void {
    // ...
  }
}
```

### Python Style Guide (Based on Google's Python Style Guide)

#### Naming Conventions

```python
# Module names: lowercase with underscores
# user_service.py, database_connection.py

# Class names: PascalCase
class UserAccount:
    pass

class DatabaseConnection:
    pass

# Function and variable names: lowercase with underscores
def calculate_total_price(base_price, tax_rate):
    user_name = "John"
    return base_price * (1 + tax_rate)

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
DEFAULT_TIMEOUT = 30

# Protected/private: single/double underscore prefix
class User:
    def __init__(self):
        self._internal_id = None  # Protected
        self.__private_data = None  # Private (name mangled)
```

#### Type Hints and Docstrings

```python
from typing import List, Dict, Optional, Union
from dataclasses import dataclass

def calculate_average(numbers: List[float]) -> float:
    """Calculate the average of a list of numbers.
    
    Args:
        numbers: A list of numbers to average.
        
    Returns:
        The arithmetic mean of the input numbers.
        
    Raises:
        ValueError: If the input list is empty.
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)

@dataclass
class User:
    """Represents a user in the system.
    
    Attributes:
        id: Unique identifier for the user.
        name: User's display name.
        email: User's email address.
        roles: List of roles assigned to the user.
    """
    id: str
    name: str
    email: str
    roles: List[str] = None
    
    def __post_init__(self):
        if self.roles is None:
            self.roles = ['user']
```

#### Code Organization

```python
"""Module docstring describing the purpose of this module.

This module provides functionality for user management including
creation, authentication, and role management.
"""

# Standard library imports
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional

# Third-party imports
import requests
from flask import Flask, request
from sqlalchemy import create_engine

# Local imports
from .models import User, Role
from .utils import hash_password, validate_email
from .exceptions import UserNotFoundError

# Module-level constants
DEFAULT_PAGE_SIZE = 20
MAX_LOGIN_ATTEMPTS = 5

# Module-level "private" variable
_logger = logging.getLogger(__name__)


class UserService:
    """Handles user-related operations."""
    
    def __init__(self, database_url: str):
        """Initialize the UserService.
        
        Args:
            database_url: Connection string for the database.
        """
        self.engine = create_engine(database_url)
        self._cache: Dict[str, User] = {}
    
    def create_user(self, email: str, password: str) -> User:
        """Create a new user account.
        
        Args:
            email: User's email address.
            password: User's password (will be hashed).
            
        Returns:
            The created User object.
            
        Raises:
            ValueError: If email is invalid or user already exists.
        """
        if not validate_email(email):
            raise ValueError(f"Invalid email: {email}")
        
        hashed_password = hash_password(password)
        user = User(email=email, password_hash=hashed_password)
        
        # Store in database
        self._save_user(user)
        
        return user
```

### Go Style Guide

#### Naming Conventions

```go
// Package names: lowercase, single word
package user
package httputil

// Exported names: PascalCase
type UserService struct {}
func NewUserService() *UserService {}
const MaxRetryCount = 3

// Unexported names: camelCase
type userRepository struct {}
func validateEmail(email string) bool {}
const defaultTimeout = 30

// Acronyms: keep consistent case
// Exported
type HTTPClient struct {}
type URLParser struct {}

// Unexported
type httpClient struct {}
type urlParser struct {}

// Interface names: typically end with -er
type Reader interface {}
type UserRepository interface {}
type Validator interface {}
```

#### Code Organization

```go
package user

import (
    // Standard library imports (alphabetical)
    "context"
    "encoding/json"
    "fmt"
    "time"
    
    // External imports (alphabetical)
    "github.com/google/uuid"
    "github.com/pkg/errors"
    
    // Internal imports (alphabetical)
    "github.com/mycompany/myapp/internal/database"
    "github.com/mycompany/myapp/pkg/logger"
)

// Constants grouped together
const (
    DefaultTimeout = 30 * time.Second
    MaxRetryCount  = 3
    MinPasswordLen = 8
)

// Type definitions
type Role string

const (
    RoleAdmin Role = "admin"
    RoleUser  Role = "user"
)

// Structs with tags aligned
type User struct {
    ID        string    `json:"id" db:"id"`
    Email     string    `json:"email" db:"email"`
    Name      string    `json:"name" db:"name"`
    Role      Role      `json:"role" db:"role"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// Interfaces
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    GetByID(ctx context.Context, id string) (*User, error)
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}

// Service implementation
type UserService struct {
    repo   UserRepository
    logger logger.Logger
}

// Constructor
func NewUserService(repo UserRepository, logger logger.Logger) *UserService {
    return &UserService{
        repo:   repo,
        logger: logger,
    }
}

// Methods grouped by receiver
func (s *UserService) CreateUser(ctx context.Context, email, name string) (*User, error) {
    // Validate input
    if err := validateEmail(email); err != nil {
        return nil, errors.Wrap(err, "invalid email")
    }
    
    // Create user
    user := &User{
        ID:        uuid.New().String(),
        Email:     email,
        Name:      name,
        Role:      RoleUser,
        CreatedAt: time.Now(),
    }
    
    // Save to repository
    if err := s.repo.Create(ctx, user); err != nil {
        s.logger.Error("failed to create user", "error", err, "email", email)
        return nil, errors.Wrap(err, "failed to create user")
    }
    
    s.logger.Info("user created", "id", user.ID, "email", email)
    return user, nil
}

// Helper functions at the end
func validateEmail(email string) error {
    if email == "" {
        return errors.New("email is required")
    }
    // Additional validation...
    return nil
}
```

#### Error Handling

```go
// Error types
type UserError struct {
    Code    string
    Message string
}

func (e UserError) Error() string {
    return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Sentinel errors
var (
    ErrUserNotFound = UserError{Code: "USER_NOT_FOUND", Message: "user not found"}
    ErrInvalidInput = UserError{Code: "INVALID_INPUT", Message: "invalid input"}
)

// Error handling in functions
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.GetByID(ctx, id)
    if err != nil {
        if errors.Is(err, database.ErrNotFound) {
            return nil, ErrUserNotFound
        }
        return nil, errors.Wrap(err, "failed to get user")
    }
    
    return user, nil
}

// Check errors immediately
user, err := s.GetUser(ctx, id)
if err != nil {
    return nil, err
}
// Use user...
```

### Java Style Guide

#### Naming Conventions

```java
// Package names: lowercase, no underscores
package com.google.example.project;

// Class names: PascalCase
public class UserAccount {}
public interface DatabaseConnection {}

// Method and variable names: camelCase
private String userName;
public void calculateTotal() {}

// Constants: UPPER_SNAKE_CASE
public static final int MAX_RETRY_COUNT = 3;
private static final String API_ENDPOINT = "https://api.example.com";

// Type parameters: single capital letter or PascalCase
public class Cache<T> {}
public interface Converter<InputType, OutputType> {}
```

#### Class Structure

```java
package com.example.user;

// Import statements in order:
// 1. Static imports
import static com.google.common.base.Preconditions.checkNotNull;

// 2. java and javax packages
import java.util.List;
import java.util.Map;

// 3. Third-party packages
import com.google.common.collect.ImmutableList;
import org.springframework.stereotype.Service;

// 4. Same project packages
import com.example.user.model.User;
import com.example.user.repository.UserRepository;

/**
 * Service for managing user operations.
 *
 * <p>This service handles user creation, authentication, and role management.
 * All operations are transactional and thread-safe.
 */
@Service
public class UserService {
    // Constants
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    // Fields
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Constructor
    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = checkNotNull(userRepository);
        this.passwordEncoder = checkNotNull(passwordEncoder);
    }
    
    // Public methods
    /**
     * Creates a new user account.
     *
     * @param email the user's email address
     * @param password the user's password (will be encrypted)
     * @return the created user
     * @throws IllegalArgumentException if email is invalid
     * @throws DuplicateUserException if user already exists
     */
    public User createUser(String email, String password) {
        validateEmail(email);
        checkUserDoesNotExist(email);
        
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .createdAt(Instant.now())
                .build();
                
        return userRepository.save(user);
    }
    
    // Private methods
    private void validateEmail(String email) {
        if (!EmailValidator.isValid(email)) {
            throw new IllegalArgumentException("Invalid email: " + email);
        }
    }
}
```

## Common Best Practices Across Languages

### Line Length
- Maximum 80-100 characters (language-dependent)
- Break long lines at logical points
- Indent continuation lines appropriately

### Indentation
- **Spaces preferred**: 2 spaces (JavaScript/TypeScript), 4 spaces (Python)
- **Tabs**: Avoid in most Google style guides
- **Consistency**: Never mix tabs and spaces

### Whitespace

```typescript
// Good spacing around operators
const sum = a + b;
const result = calculateValue(x, y);

// Space after keywords
if (condition) {
  // ...
}

// No space before semicolon
doSomething();

// Space after commas
function example(a, b, c) {}
```

### Braces and Brackets

```javascript
// JavaScript/TypeScript: Opening brace on same line
if (condition) {
  doSomething();
} else {
  doSomethingElse();
}

// Single-line blocks can omit braces (but discouraged)
if (condition) doSomething();

// Prefer explicit braces
if (condition) {
  doSomething();
}
```

### Function Length
- Keep functions short and focused (typically < 40 lines)
- Extract complex logic into helper functions
- One function should do one thing well

### Comments Best Practices

1. **Why, not what**: Explain reasoning, not obvious code
2. **Keep updated**: Outdated comments are worse than no comments
3. **Use standard formats**: JSDoc, docstrings, godoc
4. **Avoid commented-out code**: Use version control instead

### Error Handling

```typescript
// Be specific with error messages
throw new Error(`Invalid user ID: ${userId}`);

// Handle errors at appropriate level
try {
  const user = await fetchUser(userId);
  return processUser(user);
} catch (error) {
  logger.error('Failed to process user', { userId, error });
  throw new UserProcessingError(`Failed to process user ${userId}`, error);
}
```

## Code Review Guidelines

### What to Look For

1. **Correctness**: Does the code do what it's supposed to?
2. **Clarity**: Is the code easy to understand?
3. **Consistency**: Does it follow team conventions?
4. **Completeness**: Are there tests? Documentation?
5. **Complexity**: Can it be simplified?

### Review Comments

```
// Constructive feedback
"Consider extracting this logic into a separate function for better testability"

// Not just criticism
"Nice use of the builder pattern here!"

// Specific suggestions
"This could be simplified using Array.reduce()"
```

## Testing Standards

### Test Naming

```typescript
// Descriptive test names
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw error for invalid email', () => {});
    it('should prevent duplicate emails', () => {});
  });
});
```

### Test Structure

```python
def test_user_creation_with_valid_data(self):
    """Test that users can be created with valid data."""
    # Arrange
    email = "test@example.com"
    password = "secure123"
    
    # Act
    user = self.user_service.create_user(email, password)
    
    # Assert
    self.assertEqual(user.email, email)
    self.assertIsNotNone(user.id)
    self.assertTrue(user.is_active)
```

## Migration to Google Style

### Gradual Adoption

1. **New code first**: Apply to new files immediately
2. **Boy Scout Rule**: Leave code better than you found it
3. **Refactoring sprints**: Dedicated time for style updates
4. **Automated tools**: Use linters and formatters

### Tooling

```json
// Example .eslintrc for Google Style
{
  "extends": ["google"],
  "rules": {
    "max-len": ["error", {"code": 100}],
    "indent": ["error", 2],
    "quotes": ["error", "single"]
  }
}
```

```yaml
# Example .pylintrc for Google Style
[FORMAT]
max-line-length=80
indent-string='    '

[BASIC]
function-naming-style=snake_case
class-naming-style=PascalCase
const-naming-style=UPPER_CASE
```

Remember: The goal of style guides is to improve code readability and maintainability. When in doubt, optimize for clarity and consistency with your team's existing code.

---

### BDD

# Behavior-Driven Development (BDD)

## Overview

Behavior-Driven Development (BDD) is an agile software development practice that encourages collaboration between developers, QA, and non-technical stakeholders. BDD focuses on defining the behavior of software through examples written in a shared language that everyone can understand.

### Core Principles

1. **Shared Understanding**: Create a common language between technical and non-technical team members
2. **Living Documentation**: Tests serve as documentation that stays up-to-date
3. **Outside-In Development**: Start from user behavior and work inward
4. **Examples Drive Design**: Concrete examples guide implementation
5. **Continuous Communication**: Ongoing dialogue about requirements

## The Three Amigos

BDD encourages collaboration between three key perspectives:

1. **Business** (Product Owner/BA): What problem are we solving?
2. **Development** (Developer): How might we solve this?
3. **Testing** (QA/Tester): What could go wrong?

## Gherkin Language

Gherkin is the business-readable language used to describe software behavior.

### Basic Structure

```gherkin
Feature: Shopping Cart
  As a customer
  I want to add items to my shopping cart
  So that I can purchase multiple items at once

  Background:
    Given I am on the shopping site
    And I am logged in as "customer@example.com"

  Scenario: Add single item to empty cart
    Given I have an empty shopping cart
    When I add a "Blue T-Shirt" to the cart
    Then the cart should contain 1 item
    And the cart total should be "$19.99"

  Scenario: Add multiple items to cart
    Given I have an empty shopping cart
    When I add the following items to the cart:
      | Item          | Quantity | Price  |
      | Blue T-Shirt  | 2        | $19.99 |
      | Red Hat       | 1        | $15.00 |
    Then the cart should contain 3 items
    And the cart total should be "$54.98"

  Scenario Outline: Apply discount codes
    Given I have items worth "<subtotal>" in my cart
    When I apply the discount code "<code>"
    Then the discount should be "<discount>"
    And the total should be "<total>"

    Examples:
      | subtotal | code     | discount | total  |
      | $100.00  | SAVE10   | $10.00   | $90.00 |
      | $50.00   | SAVE10   | $5.00    | $45.00 |
      | $200.00  | SAVE20   | $40.00   | $160.00 |
```

### Gherkin Keywords

- **Feature**: High-level description of functionality
- **Scenario**: A specific example of behavior
- **Given**: Preconditions/context
- **When**: Action/event
- **Then**: Expected outcome
- **And/But**: Additional steps
- **Background**: Common setup for scenarios
- **Scenario Outline**: Parameterized scenarios

## Implementation Examples

### JavaScript/TypeScript with Cucumber

```typescript
// features/shopping-cart.feature
Feature: Shopping Cart
  Scenario: Add item to cart
    Given I have an empty shopping cart
    When I add a "Blue T-Shirt" priced at $19.99
    Then the cart should contain 1 item
    And the cart total should be $19.99

// step-definitions/shopping-cart.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ShoppingCart } from '../src/shopping-cart';
import { Product } from '../src/product';

let shoppingCart: ShoppingCart;
let product: Product;

Given('I have an empty shopping cart', function () {
  shoppingCart = new ShoppingCart();
});

When('I add a {string} priced at ${float}', function (name: string, price: number) {
  product = new Product(name, price);
  shoppingCart.addItem(product);
});

Then('the cart should contain {int} item(s)', function (expectedCount: number) {
  expect(shoppingCart.itemCount).to.equal(expectedCount);
});

Then('the cart total should be ${float}', function (expectedTotal: number) {
  expect(shoppingCart.total).to.equal(expectedTotal);
});

// src/shopping-cart.ts
export class ShoppingCart {
  private items: Product[] = [];

  addItem(product: Product): void {
    this.items.push(product);
  }

  get itemCount(): number {
    return this.items.length;
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

### Python with Behave

```python
# features/user_registration.feature
Feature: User Registration
  As a new user
  I want to create an account
  So that I can access the application

  Scenario: Successful registration with valid data
    Given I am on the registration page
    When I fill in the registration form with:
      | Field    | Value              |
      | Name     | John Doe           |
      | Email    | john@example.com   |
      | Password | SecurePass123!     |
    And I submit the registration form
    Then I should see "Registration successful"
    And I should receive a welcome email at "john@example.com"

# features/steps/user_registration.py
from behave import given, when, then
from selenium import webdriver
from pages.registration_page import RegistrationPage
from services.email_service import EmailService

@given('I am on the registration page')
def step_on_registration_page(context):
    context.browser = webdriver.Chrome()
    context.page = RegistrationPage(context.browser)
    context.page.navigate()

@when('I fill in the registration form with')
def step_fill_registration_form(context):
    for row in context.table:
        field = row['Field']
        value = row['Value']
        context.page.fill_field(field, value)
        
    # Store email for later verification
    context.user_email = context.table[1]['Value']

@when('I submit the registration form')
def step_submit_form(context):
    context.page.submit_form()

@then('I should see "{message}"')
def step_verify_message(context, message):
    assert context.page.has_message(message), \
        f"Expected to see '{message}' but it was not found"

@then('I should receive a welcome email at "{email}"')
def step_verify_email(context, email):
    email_service = EmailService()
    assert email_service.has_email_for(email), \
        f"No welcome email found for {email}"

# pages/registration_page.py
class RegistrationPage:
    def __init__(self, browser):
        self.browser = browser
        self.url = "https://example.com/register"
        
    def navigate(self):
        self.browser.get(self.url)
        
    def fill_field(self, field_name, value):
        field = self.browser.find_element_by_name(field_name.lower())
        field.send_keys(value)
        
    def submit_form(self):
        submit_button = self.browser.find_element_by_id("submit")
        submit_button.click()
        
    def has_message(self, message):
        return message in self.browser.page_source
```

### Java with Cucumber-JVM

```java
// src/test/resources/features/payment.feature
Feature: Payment Processing
  
  Background:
    Given the payment service is available
    
  Scenario: Process valid credit card payment
    Given a customer with a valid credit card
    When they make a payment of $100.00
    Then the payment should be approved
    And the transaction ID should be generated
    And the customer should receive a confirmation email

// src/test/java/steps/PaymentSteps.java
import io.cucumber.java.en.*;
import static org.junit.Assert.*;

public class PaymentSteps {
    private PaymentService paymentService;
    private Customer customer;
    private PaymentResult result;
    
    @Given("the payment service is available")
    public void thePaymentServiceIsAvailable() {
        paymentService = new PaymentService();
        assertTrue(paymentService.isAvailable());
    }
    
    @Given("a customer with a valid credit card")
    public void aCustomerWithValidCreditCard() {
        customer = new Customer("John Doe");
        customer.setCreditCard(new CreditCard("4111111111111111", "12/25", "123"));
    }
    
    @When("they make a payment of ${double}")
    public void theyMakePayment(double amount) {
        PaymentRequest request = new PaymentRequest(customer, amount);
        result = paymentService.processPayment(request);
    }
    
    @Then("the payment should be approved")
    public void thePaymentShouldBeApproved() {
        assertEquals(PaymentStatus.APPROVED, result.getStatus());
    }
    
    @Then("the transaction ID should be generated")
    public void theTransactionIdShouldBeGenerated() {
        assertNotNull(result.getTransactionId());
        assertTrue(result.getTransactionId().matches("[A-Z0-9]{10}"));
    }
}

// src/main/java/services/PaymentService.java
public class PaymentService {
    private final PaymentGateway gateway;
    private final EmailService emailService;
    
    public PaymentService() {
        this.gateway = new PaymentGateway();
        this.emailService = new EmailService();
    }
    
    public PaymentResult processPayment(PaymentRequest request) {
        // Validate request
        validatePaymentRequest(request);
        
        // Process payment through gateway
        GatewayResponse response = gateway.charge(
            request.getCustomer().getCreditCard(),
            request.getAmount()
        );
        
        // Create result
        PaymentResult result = new PaymentResult(
            response.isApproved() ? PaymentStatus.APPROVED : PaymentStatus.DECLINED,
            response.getTransactionId()
        );
        
        // Send confirmation if approved
        if (result.getStatus() == PaymentStatus.APPROVED) {
            emailService.sendPaymentConfirmation(
                request.getCustomer().getEmail(),
                result
            );
        }
        
        return result;
    }
}
```

### Go with Godog

```go
// features/api.feature
Feature: User API
  
  Scenario: Create new user via API
    Given the API is running
    When I send a POST request to "/users" with:
      """
      {
        "name": "Alice Smith",
        "email": "alice@example.com",
        "age": 30
      }
      """
    Then the response status should be 201
    And the response should contain:
      """
      {
        "id": "<any>",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "age": 30
      }
      """

// features/api_test.go
package features

import (
    "encoding/json"
    "fmt"
    "net/http"
    "strings"
    
    "github.com/cucumber/godog"
)

type apiFeature struct {
    resp *httptest.ResponseRecorder
    server *httptest.Server
}

func (a *apiFeature) theAPIIsRunning() error {
    router := api.NewRouter()
    a.server = httptest.NewServer(router)
    return nil
}

func (a *apiFeature) iSendARequestToWith(method, path string, body *godog.DocString) error {
    req, err := http.NewRequest(
        method,
        a.server.URL + path,
        strings.NewReader(body.Content),
    )
    if err != nil {
        return err
    }
    
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    
    a.resp = httptest.NewRecorder()
    a.resp.WriteHeader(resp.StatusCode)
    
    return nil
}

func (a *apiFeature) theResponseStatusShouldBe(expectedStatus int) error {
    if a.resp.Code != expectedStatus {
        return fmt.Errorf("expected status %d but got %d", expectedStatus, a.resp.Code)
    }
    return nil
}

func InitializeScenario(ctx *godog.ScenarioContext) {
    api := &apiFeature{}
    
    ctx.Step(`^the API is running$`, api.theAPIIsRunning)
    ctx.Step(`^I send a (GET|POST|PUT|DELETE) request to "([^"]*)" with:$`, api.iSendARequestToWith)
    ctx.Step(`^the response status should be (\d+)$`, api.theResponseStatusShouldBe)
}
```

## BDD Best Practices

### Writing Good Scenarios

#### 1. Focus on Business Value

```gherkin
# ❌ Bad: Technical implementation details
Scenario: Database update
  Given the user table exists
  When I execute "INSERT INTO users VALUES (...)"
  Then the database should have 1 row

# ✅ Good: Business behavior
Scenario: New user registration
  Given I am a new visitor
  When I register with valid details
  Then I should have access to my account
```

#### 2. Keep Scenarios Independent

```gherkin
# ❌ Bad: Dependent on previous scenario
Scenario: Login after registration
  Given I registered in the previous scenario
  When I log in
  Then I should see the dashboard

# ✅ Good: Self-contained
Scenario: Successful login
  Given I have a registered account with email "user@example.com"
  When I log in with valid credentials
  Then I should see the dashboard
```

#### 3. Use Domain Language

```gherkin
# ❌ Bad: Technical jargon
Scenario: API response validation
  When I send HTTP POST to /api/v1/orders
  Then the response code should be 201
  And the JSON should have property "id"

# ✅ Good: Business language
Scenario: Place an order
  When I place an order for 2 items
  Then my order should be confirmed
  And I should receive an order number
```

### Step Definition Best Practices

#### 1. Keep Steps Reusable

```typescript
// ❌ Bad: Too specific
When('I click the blue submit button in the top right', function() {
  const button = this.page.findElement(By.css('.submit-btn.blue.top-right'));
  button.click();
});

// ✅ Good: Reusable
When('I submit the form', function() {
  this.currentPage.submitForm();
});
```

#### 2. Avoid UI Details in Steps

```python
# ❌ Bad: UI-specific
@when('I click the button with id "submit-btn"')
def step_click_button_by_id(context, button_id):
    context.browser.find_element_by_id(button_id).click()

# ✅ Good: Action-focused
@when('I submit my application')
def step_submit_application(context):
    context.application_page.submit()
```

#### 3. Use Page Object Pattern

```typescript
// Page Object
export class LoginPage {
  private emailInput = '#email';
  private passwordInput = '#password';
  private submitButton = '#login-btn';
  
  async login(email: string, password: string): Promise<void> {
    await page.fill(this.emailInput, email);
    await page.fill(this.passwordInput, password);
    await page.click(this.submitButton);
  }
}

// Step Definition
When('I log in as {string}', async function(email: string) {
  const loginPage = new LoginPage();
  await loginPage.login(email, 'password123');
});
```

## BDD in Different Contexts

### API Testing with BDD

```gherkin
Feature: User Management API
  
  Scenario: Retrieve user information
    Given a user exists with id "12345"
    When I request user details for id "12345"
    Then the response should have status 200
    And the response should contain:
      | field | value           |
      | id    | 12345           |
      | name  | John Doe        |
      | email | john@example.com |
```

### Mobile App BDD

```gherkin
Feature: Mobile Shopping
  
  Scenario: Browse products offline
    Given I have previously viewed the "Electronics" category
    And I am now offline
    When I open the app
    Then I should see cached products from "Electronics"
    But I should see an "Offline mode" indicator
```

### Microservices BDD

```gherkin
Feature: Order Processing Service
  
  Scenario: Process order with inventory check
    Given the Inventory Service has 10 units of "SKU-123"
    And the Payment Service is available
    When I place an order for 5 units of "SKU-123"
    Then the order should be confirmed
    And the Inventory Service should show 5 units remaining
    And the Payment Service should process the payment
```

## BDD Tools and Frameworks

### Language-Specific Tools

- **JavaScript/TypeScript**: Cucumber.js, Jest-Cucumber, CodeceptJS
- **Java**: Cucumber-JVM, JBehave, Concordion
- **Python**: Behave, pytest-bdd, Lettuce
- **Ruby**: Cucumber (original), RSpec
- **C#**: SpecFlow, NBehave
- **Go**: Godog, Ginkgo
- **PHP**: Behat, Codeception

### Supporting Tools

- **IDE Plugins**: Gherkin syntax highlighting and step navigation
- **Living Documentation**: Pickles, Cukedoctor
- **Reporting**: Allure, ExtentReports, Serenity BDD
- **CI/CD Integration**: Parallel execution, test filtering

## Common Anti-Patterns

### 1. Imperative vs Declarative

```gherkin
# ❌ Imperative (too detailed)
Scenario: User registration
  Given I open the browser
  And I navigate to "/register"
  And I click on the "Name" field
  And I type "John Doe"
  And I click on the "Email" field
  And I type "john@example.com"
  And I click on the "Submit" button
  Then I should see "Success"

# ✅ Declarative (focused on behavior)
Scenario: User registration
  Given I am on the registration page
  When I register as "John Doe" with email "john@example.com"
  Then I should see a success message
```

### 2. Scenarios as Test Scripts

```gherkin
# ❌ Test script mentality
Scenario: Test login functionality
  Given test user "test123"
  When execute login test
  Then verify test passed

# ✅ Behavior description
Scenario: Successful login
  Given I am a registered user
  When I log in with valid credentials
  Then I should have access to my account
```

### 3. Technical Scenarios

```gherkin
# ❌ Technical focus
Scenario: Database transaction
  Given a database connection
  When I run "BEGIN TRANSACTION"
  And I insert a record
  Then the transaction should commit

# ✅ Business focus
Scenario: Save customer information
  Given I have customer details
  When I save the customer
  Then the customer should be retrievable
```

## BDD Metrics and Benefits

### Metrics to Track

1. **Scenario Coverage**: Percentage of features with BDD scenarios
2. **Step Reusability**: Average number of scenarios per step definition
3. **Execution Time**: Time to run all BDD tests
4. **Failure Rate**: Percentage of failing scenarios
5. **Documentation Currency**: How up-to-date scenarios are

### Benefits

1. **Shared Understanding**: Common language reduces misunderstandings
2. **Living Documentation**: Always current documentation
3. **Test Automation**: Scenarios become automated tests
4. **Early Bug Detection**: Issues found during specification
5. **Better Requirements**: Concrete examples clarify requirements

## Getting Started with BDD

### 1. Start Small
- Choose one feature or user story
- Write 3-5 scenarios
- Implement step definitions
- Run and refine

### 2. Three Amigos Sessions
- Include business, development, and testing perspectives
- Use example mapping to explore scenarios
- Focus on edge cases and unhappy paths

### 3. Build Gradually
- Add scenarios for new features
- Refactor existing tests to BDD
- Create reusable step libraries
- Generate living documentation

### 4. Integration
- Add to CI/CD pipeline
- Generate reports for stakeholders
- Use for acceptance criteria
- Include in definition of done

Remember: BDD is about collaboration and communication. The tools and syntax are just means to achieve better understanding between all team members.

---

### DORA

# DORA Metrics

## Overview

DORA (DevOps Research and Assessment) metrics are four key metrics identified by the DORA team at Google that indicate the performance of software development teams. These metrics are strongly correlated with organizational performance and are used to measure the effectiveness of DevOps practices.

### The Four Key Metrics

1. **Deployment Frequency** - How often an organization successfully releases to production
2. **Lead Time for Changes** - Time from code commit to code running in production
3. **Mean Time to Recovery (MTTR)** - Time to restore service after an incident
4. **Change Failure Rate** - Percentage of deployments causing a failure in production

## Performance Levels

DORA categorizes teams into four performance levels:

| Metric | Elite | High | Medium | Low |
|--------|-------|------|---------|-----|
| Deployment Frequency | Multiple times per day | Weekly to monthly | Monthly to every 6 months | Less than every 6 months |
| Lead Time for Changes | Less than 1 hour | 1 day to 1 week | 1 week to 1 month | 1 to 6 months |
| MTTR | Less than 1 hour | Less than 1 day | 1 day to 1 week | More than 1 week |
| Change Failure Rate | 0-15% | 16-30% | 16-30% | 16-30% |

## Implementing DORA Metrics

### 1. Deployment Frequency

**Definition**: How often code is deployed to production or released to end users.

#### Measurement Implementation

```typescript
// TypeScript example for tracking deployments
interface Deployment {
  id: string;
  timestamp: Date;
  environment: 'production' | 'staging' | 'development';
  version: string;
  status: 'success' | 'failed' | 'rollback';
}

class DeploymentTracker {
  private deployments: Deployment[] = [];
  
  recordDeployment(deployment: Deployment): void {
    this.deployments.push(deployment);
    this.sendMetrics(deployment);
  }
  
  getDeploymentFrequency(days: number = 30): number {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const productionDeployments = this.deployments.filter(d => 
      d.environment === 'production' &&
      d.status === 'success' &&
      d.timestamp >= startDate
    );
    
    return productionDeployments.length / days;
  }
  
  private sendMetrics(deployment: Deployment): void {
    // Send to monitoring system
    metrics.increment('deployments.total', {
      environment: deployment.environment,
      status: deployment.status
    });
  }
}
```

#### CI/CD Pipeline Integration

```yaml
# GitHub Actions example
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          ./deploy.sh production
          
      - name: Record Deployment Metric
        if: success()
        run: |
          curl -X POST https://metrics.example.com/api/deployments \
            -H "Content-Type: application/json" \
            -d '{
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "environment": "production",
              "version": "${{ github.sha }}",
              "status": "success"
            }'
```

### 2. Lead Time for Changes

**Definition**: Time from code commit to code successfully running in production.

#### Measurement Implementation

```python
# Python example for tracking lead time
from datetime import datetime
from typing import List, Optional
import statistics

class LeadTimeTracker:
    def __init__(self, git_client, deployment_client):
        self.git = git_client
        self.deployments = deployment_client
    
    def calculate_lead_time(self, deployment_id: str) -> Optional[float]:
        """Calculate lead time in hours for a specific deployment."""
        deployment = self.deployments.get_deployment(deployment_id)
        if not deployment:
            return None
        
        # Get all commits in this deployment
        commits = self.git.get_commits_in_range(
            deployment.from_commit,
            deployment.to_commit
        )
        
        if not commits:
            return None
        
        # Find earliest commit time
        earliest_commit = min(commits, key=lambda c: c.timestamp)
        
        # Calculate lead time
        lead_time = deployment.deployed_at - earliest_commit.timestamp
        return lead_time.total_seconds() / 3600  # Convert to hours
    
    def get_average_lead_time(self, days: int = 30) -> float:
        """Get average lead time for recent deployments."""
        recent_deployments = self.deployments.get_recent_deployments(days)
        lead_times = []
        
        for deployment in recent_deployments:
            lead_time = self.calculate_lead_time(deployment.id)
            if lead_time:
                lead_times.append(lead_time)
        
        return statistics.mean(lead_times) if lead_times else 0

# Git hook for commit tracking
#!/usr/bin/env python
# .git/hooks/post-commit
import subprocess
import requests
import json

def track_commit():
    commit_hash = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()
    commit_time = subprocess.check_output(['git', 'show', '-s', '--format=%ci', commit_hash]).decode().strip()
    author = subprocess.check_output(['git', 'show', '-s', '--format=%ae', commit_hash]).decode().strip()
    
    data = {
        'commit_hash': commit_hash,
        'timestamp': commit_time,
        'author': author
    }
    
    requests.post('https://metrics.example.com/api/commits', json=data)

if __name__ == '__main__':
    track_commit()
```

### 3. Mean Time to Recovery (MTTR)

**Definition**: How long it takes to recover from a failure in production.

#### Measurement Implementation

```go
// Go example for tracking incidents and recovery
package metrics

import (
    "time"
    "fmt"
)

type IncidentStatus string

const (
    IncidentOpen     IncidentStatus = "open"
    IncidentResolved IncidentStatus = "resolved"
)

type Incident struct {
    ID          string
    StartTime   time.Time
    EndTime     *time.Time
    Status      IncidentStatus
    Severity    string
    Description string
}

type MTTRTracker struct {
    incidents map[string]*Incident
}

func NewMTTRTracker() *MTTRTracker {
    return &MTTRTracker{
        incidents: make(map[string]*Incident),
    }
}

func (m *MTTRTracker) StartIncident(id, severity, description string) {
    m.incidents[id] = &Incident{
        ID:          id,
        StartTime:   time.Now(),
        Status:      IncidentOpen,
        Severity:    severity,
        Description: description,
    }
    
    // Alert on-call
    m.alertOnCall(id, severity, description)
    
    // Start incident response automation
    m.startAutomatedResponse(id)
}

func (m *MTTRTracker) ResolveIncident(id string) error {
    incident, exists := m.incidents[id]
    if !exists {
        return fmt.Errorf("incident %s not found", id)
    }
    
    now := time.Now()
    incident.EndTime = &now
    incident.Status = IncidentResolved
    
    // Calculate and record MTTR
    mttr := now.Sub(incident.StartTime)
    m.recordMTTR(id, mttr)
    
    return nil
}

func (m *MTTRTracker) GetAverageMTTR(days int) time.Duration {
    cutoff := time.Now().AddDate(0, 0, -days)
    var totalDuration time.Duration
    count := 0
    
    for _, incident := range m.incidents {
        if incident.Status == IncidentResolved && 
           incident.StartTime.After(cutoff) && 
           incident.EndTime != nil {
            totalDuration += incident.EndTime.Sub(incident.StartTime)
            count++
        }
    }
    
    if count == 0 {
        return 0
    }
    
    return totalDuration / time.Duration(count)
}

// Automated incident response
func (m *MTTRTracker) startAutomatedResponse(incidentID string) {
    go func() {
        // Try automated recovery procedures
        if err := m.runHealthChecks(); err != nil {
            m.escalateIncident(incidentID)
            return
        }
        
        if err := m.attemptAutoRecovery(); err != nil {
            m.escalateIncident(incidentID)
            return
        }
    }()
}
```

#### Monitoring and Alerting Setup

```yaml
# Prometheus alert rules for incident detection
groups:
  - name: production_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
          
      - alert: ServiceDown
        expr: up{job="production"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.instance }} is down"
```

### 4. Change Failure Rate

**Definition**: The percentage of deployments causing a failure in production.

#### Measurement Implementation

```java
// Java example for tracking change failure rate
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

public class ChangeFailureRateTracker {
    private final List<Deployment> deployments = new ArrayList<>();
    private final List<Incident> incidents = new ArrayList<>();
    
    public class Deployment {
        String id;
        Instant timestamp;
        String version;
        boolean causedIncident;
        
        public Deployment(String id, String version) {
            this.id = id;
            this.timestamp = Instant.now();
            this.version = version;
            this.causedIncident = false;
        }
    }
    
    public class Incident {
        String id;
        String deploymentId;
        Instant timestamp;
        String rootCause;
    }
    
    public void recordDeployment(String deploymentId, String version) {
        deployments.add(new Deployment(deploymentId, version));
        
        // Set up monitoring for this deployment
        schedulePostDeploymentChecks(deploymentId);
    }
    
    public void recordIncident(String incidentId, String deploymentId, String rootCause) {
        // Link incident to deployment
        deployments.stream()
            .filter(d -> d.id.equals(deploymentId))
            .findFirst()
            .ifPresent(d -> d.causedIncident = true);
        
        Incident incident = new Incident();
        incident.id = incidentId;
        incident.deploymentId = deploymentId;
        incident.timestamp = Instant.now();
        incident.rootCause = rootCause;
        
        incidents.add(incident);
    }
    
    public double getChangeFailureRate(int days) {
        Instant cutoff = Instant.now().minus(days, ChronoUnit.DAYS);
        
        List<Deployment> recentDeployments = deployments.stream()
            .filter(d -> d.timestamp.isAfter(cutoff))
            .collect(Collectors.toList());
        
        if (recentDeployments.isEmpty()) {
            return 0.0;
        }
        
        long failedDeployments = recentDeployments.stream()
            .filter(d -> d.causedIncident)
            .count();
        
        return (double) failedDeployments / recentDeployments.size() * 100;
    }
    
    private void schedulePostDeploymentChecks(String deploymentId) {
        // Schedule automated checks at intervals
        Timer timer = new Timer();
        
        // Check after 5 minutes
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                runHealthChecks(deploymentId);
            }
        }, 5 * 60 * 1000);
        
        // Check after 1 hour
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                runComprehensiveChecks(deploymentId);
            }
        }, 60 * 60 * 1000);
    }
}
```

## Implementation Strategies

### 1. Automated Data Collection

```typescript
// Centralized metrics collection service
class DORAMetricsCollector {
  private deploymentFrequency: number = 0;
  private leadTimes: number[] = [];
  private incidentRecoveryTimes: number[] = [];
  private deploymentOutcomes: { total: number; failed: number } = { total: 0, failed: 0 };
  
  async collectMetrics(): Promise<DORAMetrics> {
    const metrics = await Promise.all([
      this.getDeploymentFrequency(),
      this.getAverageLeadTime(),
      this.getMTTR(),
      this.getChangeFailureRate()
    ]);
    
    return {
      deploymentFrequency: metrics[0],
      leadTimeForChanges: metrics[1],
      mttr: metrics[2],
      changeFailureRate: metrics[3],
      timestamp: new Date()
    };
  }
  
  // Webhook endpoints for CI/CD integration
  async handleDeploymentWebhook(data: DeploymentData): Promise<void> {
    this.deploymentFrequency++;
    
    if (data.commitHash) {
      const leadTime = await this.calculateLeadTime(data.commitHash, data.timestamp);
      this.leadTimes.push(leadTime);
    }
    
    this.deploymentOutcomes.total++;
    
    // Monitor deployment for failures
    this.monitorDeployment(data.deploymentId);
  }
  
  async handleIncidentWebhook(data: IncidentData): Promise<void> {
    if (data.status === 'resolved') {
      const recoveryTime = data.resolvedAt.getTime() - data.startedAt.getTime();
      this.incidentRecoveryTimes.push(recoveryTime);
      
      // Check if incident was caused by recent deployment
      if (data.relatedDeploymentId) {
        this.deploymentOutcomes.failed++;
      }
    }
  }
}
```

### 2. Dashboard Implementation

```python
# Flask dashboard for DORA metrics
from flask import Flask, render_template, jsonify
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)

class DORADashboard:
    def __init__(self, metrics_store):
        self.metrics = metrics_store
    
    def get_current_metrics(self):
        return {
            'deployment_frequency': self.calculate_deployment_frequency(),
            'lead_time': self.calculate_average_lead_time(),
            'mttr': self.calculate_mttr(),
            'change_failure_rate': self.calculate_change_failure_rate(),
            'performance_level': self.determine_performance_level()
        }
    
    def calculate_deployment_frequency(self):
        deployments = self.metrics.get_deployments(days=30)
        daily_frequency = len(deployments) / 30
        
        if daily_frequency >= 3:
            return {'value': daily_frequency, 'label': 'Multiple per day', 'level': 'elite'}
        elif daily_frequency >= 0.14:  # Weekly
            return {'value': daily_frequency, 'label': 'Weekly', 'level': 'high'}
        elif daily_frequency >= 0.03:  # Monthly
            return {'value': daily_frequency, 'label': 'Monthly', 'level': 'medium'}
        else:
            return {'value': daily_frequency, 'label': 'Less than monthly', 'level': 'low'}
    
    def determine_performance_level(self):
        metrics = self.get_current_metrics()
        levels = [m['level'] for m in metrics.values() if isinstance(m, dict) and 'level' in m]
        
        # Simple scoring: elite=4, high=3, medium=2, low=1
        score_map = {'elite': 4, 'high': 3, 'medium': 2, 'low': 1}
        scores = [score_map[level] for level in levels]
        avg_score = sum(scores) / len(scores)
        
        if avg_score >= 3.5:
            return 'Elite Performer'
        elif avg_score >= 2.5:
            return 'High Performer'
        elif avg_score >= 1.5:
            return 'Medium Performer'
        else:
            return 'Low Performer'

@app.route('/api/metrics')
def get_metrics():
    dashboard = DORADashboard(metrics_store)
    return jsonify(dashboard.get_current_metrics())

@app.route('/dashboard')
def show_dashboard():
    return render_template('dora_dashboard.html')
```

### 3. Continuous Improvement Process

```yaml
# DORA improvement workflow
name: DORA Metrics Review

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM

jobs:
  analyze-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch DORA Metrics
        id: metrics
        run: |
          METRICS=$(curl -s https://metrics.example.com/api/dora/weekly)
          echo "::set-output name=metrics::$METRICS"
      
      - name: Analyze Trends
        run: |
          python analyze_dora_trends.py --metrics '${{ steps.metrics.outputs.metrics }}'
      
      - name: Generate Improvement Suggestions
        id: suggestions
        run: |
          SUGGESTIONS=$(python generate_improvements.py --metrics '${{ steps.metrics.outputs.metrics }}')
          echo "::set-output name=suggestions::$SUGGESTIONS"
      
      - name: Create Issue for Team Review
        uses: actions/github-script@v6
        with:
          script: |
            const metrics = ${{ steps.metrics.outputs.metrics }};
            const suggestions = ${{ steps.suggestions.outputs.suggestions }};
            
            const issueBody = `
            ## Weekly DORA Metrics Review
            
            ### Current Metrics
            - **Deployment Frequency**: ${metrics.deployment_frequency.label}
            - **Lead Time**: ${metrics.lead_time.value} hours
            - **MTTR**: ${metrics.mttr.value} minutes
            - **Change Failure Rate**: ${metrics.change_failure_rate.value}%
            
            ### Performance Level: ${metrics.performance_level}
            
            ### Improvement Suggestions
            ${suggestions}
            
            ### Action Items
            - [ ] Review metrics with team
            - [ ] Identify bottlenecks
            - [ ] Create improvement tasks
            `;
            
            github.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'DORA Metrics Review - Week ' + new Date().toISOString().split('T')[0],
              body: issueBody,
              labels: ['dora-metrics', 'process-improvement']
            });
```

## Tools and Technologies

### Open Source Tools

1. **Four Keys** (Google) - Complete DORA metrics platform
2. **Pelorus** (Red Hat) - GitOps-based metrics gathering
3. **DevLake** - Open-source dev data platform
4. **Sleuth** - Deployment tracking and DORA metrics

### Implementation Stack Example

```docker
# docker-compose.yml for DORA metrics stack
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"
  
  metrics-collector:
    build: ./metrics-collector
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - PROMETHEUS_URL=http://prometheus:9090
    depends_on:
      - prometheus
  
  webhook-receiver:
    build: ./webhook-receiver
    ports:
      - "8080:8080"
    environment:
      - METRICS_DB_URL=postgresql://metrics:password@postgres:5432/dora

volumes:
  prometheus_data:
  grafana_data:
```

## Best Practices

### 1. Start Small
- Begin with deployment frequency
- Add other metrics gradually
- Focus on trends, not absolute numbers

### 2. Automate Everything
- Automated deployment tracking
- Automated incident detection
- Automated metric calculation

### 3. Make Metrics Visible
- Team dashboards
- Regular reviews
- Celebrate improvements

### 4. Use Metrics for Improvement
- Identify bottlenecks
- Run experiments
- Measure impact

### 5. Avoid Gaming
- Focus on outcomes, not metrics
- Balance all four metrics
- Consider additional context

## Common Pitfalls

### 1. Focusing on Single Metrics
```
❌ Optimizing deployment frequency while ignoring failure rate
✅ Balancing all four metrics together
```

### 2. Manual Data Collection
```
❌ Manually tracking deployments in spreadsheets
✅ Automated collection from CI/CD pipelines
```

### 3. Comparing Teams Directly
```
❌ Team A is better because they deploy more
✅ Each team improves their own metrics over time
```

### 4. Ignoring Context
```
❌ All teams must achieve elite performance
✅ Consider team maturity, technology, and constraints
```

## DORA Metrics Maturity Model

### Level 1: Baseline
- Manual tracking
- Monthly reviews
- Basic dashboards

### Level 2: Automated
- Automated collection
- Weekly reviews
- Real-time dashboards

### Level 3: Integrated
- Metrics drive decisions
- Daily visibility
- Automated alerts

### Level 4: Optimized
- Predictive analytics
- Continuous improvement
- Cultural integration

## Future Evolution: DORA+

Recent additions to DORA metrics include:

1. **Reliability** - Service uptime and SLO performance
2. **Developer Experience** - Time to onboard, tool satisfaction
3. **Security** - Time to remediate vulnerabilities
4. **Documentation** - Coverage and accuracy metrics
5. **Technical Debt** - Code quality trends

Remember: DORA metrics are indicators, not goals. Use them to identify areas for improvement and track progress, but always consider the broader context of your team and organization.

---

### CUSTOM-SECURITY

*Custom Standard from: ~/.claude/aichaku/user/standards/CUSTOM-SECURITY.md*

## Custom Security Standard

This is a custom security standard for testing purposes.

### Key Requirements

1. **Custom Rule 1**: Always validate custom inputs
2. **Custom Rule 2**: Use custom encryption methods
3. **Custom Rule 3**: Follow custom authentication patterns

### Custom Implementation

```typescript
// Custom security implementation
class CustomSecurity {
  static validate(input: string): boolean {
    // Custom validation logic
    return input.length > 0 && input.length < 100;
  }
}
```

### Custom Best Practices

- Always follow custom security guidelines
- Use custom security tools
- Implement custom security patterns

---


<!-- AICHAKU:STANDARDS:END -->

<!-- AICHAKU:END -->
