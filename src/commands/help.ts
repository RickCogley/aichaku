/**
 * Help command for displaying methodology and standards information
 */

import { STANDARD_CATEGORIES } from "./standards.ts";
import { Brand } from "../utils/branded-messages.ts";

interface HelpOptions {
  methodology?: string;
  standard?: string;
  list?: boolean;
  standards?: boolean;
  compare?: boolean;
  all?: boolean;
  security?: boolean;
  architecture?: boolean;
  development?: boolean;
  testing?: boolean;
  devops?: boolean;
  silent?: boolean;
}

interface HelpResult {
  success: boolean;
  message?: string;
  content?: string;
}

// Methodology metadata
const METHODOLOGIES = {
  "shape-up": {
    name: "Shape Up",
    icon: "🎯",
    summary: "Fixed time, variable scope - for teams building new features",
    keyIdea: "6-week cycles with betting and shaping",
    triggers: ["shape", "appetite", "bet", "pitch"],
  },
  "scrum": {
    name: "Scrum",
    icon: "🏃",
    summary: "Sprint-based agile framework with ceremonies",
    keyIdea: "2-4 week sprints with daily standups",
    triggers: ["sprint", "standup", "retrospective", "backlog"],
  },
  "kanban": {
    name: "Kanban",
    icon: "📋",
    summary: "Visual workflow management with WIP limits",
    keyIdea: "Continuous flow with pull-based work",
    triggers: ["kanban board", "WIP", "flow", "pull"],
  },
  "lean": {
    name: "Lean",
    icon: "🚀",
    summary: "Build-measure-learn for rapid validation",
    keyIdea: "MVP focus and hypothesis testing",
    triggers: ["MVP", "hypothesis", "validate", "pivot"],
  },
  "xp": {
    name: "Extreme Programming",
    icon: "💻",
    summary: "Engineering practices for quality code",
    keyIdea: "TDD, pair programming, continuous integration",
    triggers: ["pair", "TDD", "test first", "refactor"],
  },
  "scrumban": {
    name: "Scrumban",
    icon: "🔄",
    summary: "Hybrid of Scrum structure with Kanban flow",
    keyIdea: "Sprint planning with continuous delivery",
    triggers: ["bucket", "ready queue", "flow metrics"],
  },
};

// Normalize methodology name for lookup
function normalizeMethodologyName(name: string): string | undefined {
  // Check if it's a number
  const num = parseInt(name);
  if (!isNaN(num) && num >= 1 && num <= Object.keys(METHODOLOGIES).length) {
    return Object.keys(METHODOLOGIES)[num - 1];
  }

  const normalized = name.toLowerCase().replace(/[\s-_]/g, "");

  // Direct matches
  const directMatches: Record<string, string> = {
    "shapeup": "shape-up",
    "extremeprogramming": "xp",
    "extreme": "xp",
    "programming": "xp",
  };

  if (directMatches[normalized]) {
    return directMatches[normalized];
  }

  // Check if it matches any key directly
  for (const key of Object.keys(METHODOLOGIES)) {
    if (key.replace(/-/g, "") === normalized) {
      return key;
    }
  }

  // Check if it matches any display name
  for (const [key, meta] of Object.entries(METHODOLOGIES)) {
    if (meta.name.toLowerCase().replace(/[\s-_]/g, "") === normalized) {
      return key;
    }
  }

  return undefined;
}

// Help content for each methodology
const HELP_CONTENT: Record<string, string> = {
  "shape-up": `
🎯 Shape Up Methodology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Shape Up is Basecamp's product development methodology that emphasizes
fixed time periods with variable scope. Perfect for product teams!

📊 The Basics
  • 6-week cycles (no extensions!)
  • 2-week cooldown between cycles
  • Shaping before building
  • Betting on projects, not estimating

🎯 Key Concepts
  • Appetite → How much time are we willing to spend?
  • Shaping → Define problem + rough solution upfront
  • Betting → Choose what to work on (and what not to)
  • Circuit Breaker → Hard stop at 6 weeks, no exceptions

📈 Shape Up Cycle
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │   Shaping   │→ │   Betting   │→ │   Building  │
  │  (ongoing)  │  │  (1 week)   │  │  (6 weeks)  │
  └─────────────┘  └─────────────┘  └─────────────┘
                                     ↓
  ┌─────────────┐                   ┌─────────────┐
  │  Cool-down  │←──────────────────│   Ship It!  │
  │  (2 weeks)  │                   │             │
  └─────────────┘                   └─────────────┘

✅ Best For
  • Product teams building new features
  • Teams that want clear time boundaries
  • Projects where scope can be flexible

❌ Not Ideal For
  • Maintenance work or bug fixes
  • Teams needing daily coordination
  • Projects with strict feature requirements

💡 Quick Start with Claude Code
  You: "Let's shape a new feature for user profiles"
  You: "What's our appetite for this?"
  You: "Time to bet on next cycle's work"

📚 Learn More: https://basecamp.com/shapeup
`,

  "scrum": `
🏃 Scrum Framework
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

The world's most popular agile framework. Sprint your way to success
with time-boxed iterations and regular team ceremonies.

📊 The Basics
  • 2-4 week Sprints (fixed length)
  • 3 roles: Product Owner, Scrum Master, Dev Team
  • 5 ceremonies that keep you on track
  • Deliver working software every Sprint

🏃 Key Ceremonies
  • Sprint Planning → What will we build this Sprint?
  • Daily Scrum → 15-min sync (aka standup)
  • Sprint Review → Demo what we built
  • Sprint Retrospective → How can we improve?
  • Backlog Refinement → Keep stories ready

🔄 Scrum Flow
  Product      Sprint       Sprint        Daily
  Backlog  →  Planning  →  Backlog   →  Development
     ↑                                        ↓
     ↑                                    Increment
     ↑                                        ↓
  Retrospective  ←  Sprint Review  ←  Sprint End

✅ Best For
  • Teams wanting predictable delivery
  • Projects with evolving requirements
  • Cross-functional collaboration
  • Regular stakeholder feedback

❌ Not Ideal For
  • Solo developers
  • Pure research projects
  • Continuous deployment environments

💡 Quick Start with Claude Code
  You: "Let's plan our next sprint"
  You: "Time for our daily standup"
  You: "Create a sprint retrospective"

📚 Learn More: https://scrum.org
`,

  "kanban": `
📋 Kanban Method
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Visualize your work, limit work in progress, and maximize flow.
Perfect for teams that need flexibility and continuous delivery.

📊 The Basics
  • Visual board with columns for each state
  • WIP limits prevent overload
  • Pull work when you have capacity
  • Measure and optimize flow

📋 Key Practices
  • Visualize → See all work on the board
  • Limit WIP → Don't start what you can't finish
  • Manage Flow → Track cycle time & throughput
  • Make Policies Explicit → Clear rules for all
  • Improve Collaboratively → Evolve together

📊 Kanban Board Example
  ┌─────────┬─────────┬─────────┬─────────┬─────────┐
  │ Backlog │  To Do  │  Doing  │ Review  │  Done   │
  ├─────────┼─────────┼─────────┼─────────┼─────────┤
  │ Story A │ Story C │ Story E │ Story G │ Story I │
  │ Story B │ Story D │ Story F │ Story H │ Story J │
  │   ...   │ [WIP:3] │ [WIP:2] │ [WIP:1] │   ...   │
  └─────────┴─────────┴─────────┴─────────┴─────────┘
            ← Pull when capacity available →

✅ Best For
  • Support & maintenance teams
  • Continuous delivery environments
  • Teams with unpredictable work
  • Mixed types of work (features, bugs, ops)

❌ Not Ideal For
  • Fixed deadline projects
  • Teams needing synchronized releases
  • Heavy upfront planning needs

💡 Quick Start with Claude Code
  You: "Show our kanban board"
  You: "What's our WIP limit for testing?"
  You: "Track cycle time for this feature"

📚 Learn More: https://kanban.university
`,

  "lean": `
🚀 Lean Startup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Move fast and learn faster. Build MVPs, test hypotheses, and 
pivot based on real customer feedback. Perfect for startups!

📊 The Basics
  • Build-Measure-Learn cycle
  • Minimum Viable Product (MVP)
  • Validated learning over opinions
  • Pivot or persevere decisions

🔄 The Lean Cycle
  ┌─────────┐
  │  BUILD  │ → Create MVP
  └────┬────┘
       ↓
  ┌─────────┐
  │ MEASURE │ → Collect Data
  └────┬────┘
       ↓
  ┌─────────┐
  │  LEARN  │ → Validate/Invalidate
  └────┬────┘
       ↓
    Pivot or
   Persevere?

✅ Best For
  • Startups and new products
  • High uncertainty environments  
  • Hypothesis-driven development
  • Fast iteration needs

❌ Not Ideal For
  • Well-defined requirements
  • Regulatory compliance projects
  • Infrastructure work
  • Risk-averse environments

💡 Quick Start with Claude Code
  You: "What's our riskiest assumption?"
  You: "Define an MVP to test this"
  You: "Create metrics for validation"

// codeql[js/insecure-url] - Well-known book reference URL
📚 Learn More: https://theleanstartup.com // DevSkim: ignore DS137138 - Well-known book reference URL
`,

  "xp": `
💻 Extreme Programming (XP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Engineering excellence through disciplined practices. Write tests
first, pair program, and deliver quality code continuously.

📊 The Basics
  • Test-Driven Development (TDD)
  • Pair programming sessions
  • Continuous integration
  • Small, frequent releases

🔧 XP Practices
  
  TDD Cycle (Red → Green → Refactor):
  ┌─────────────┐
  │ 1. Red Test │ Write a failing test
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ 2. Green    │ Make it pass (minimal code)
  └──────┬──────┘
         ↓
  ┌─────────────┐
  │ 3. Refactor │ Clean up the code
  └──────┬──────┘
         ↓
      Repeat

  👥 Pair Programming = Driver + Navigator

✅ Best For
  • Teams prioritizing code quality
  • Complex technical challenges
  • Experienced developers
  • Safety-critical systems

❌ Not Ideal For
  • Non-technical projects
  • Distributed teams (pairing is hard)
  • Quick prototypes
  • Solo developers

💡 Quick Start with Claude Code
  You: "Let's pair on this feature"
  You: "Write the test first"
  You: "Time to refactor this code"

// codeql[js/insecure-url] - Well-known methodology reference URL
📚 Learn More: https://www.extremeprogramming.org // DevSkim: ignore DS137138 - Well-known methodology reference URL
`,

  "scrumban": `
🔄 Scrumban Hybrid
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

The best of both worlds! Combine Scrum's structure with Kanban's
flow. Perfect for teams wanting flexibility with some ceremonies.

📊 The Basics
  • Planning on demand (not fixed sprints)
  • WIP limits from Kanban
  • Optional Scrum ceremonies
  • Flow metrics and forecasting

🔀 Scrumban Flow
  ┌─────────────┐
  │   Backlog   │ → Prioritized work
  └──────┬──────┘
         ↓ Planning Trigger
  ┌─────────────┬─────────────┬─────────────┐
  │   To Do     │    Doing    │    Done     │
  │  [WIP: 5]   │  [WIP: 3]   │             │
  └─────────────┴─────────────┴─────────────┘
         ← Pull when ready →

  📊 Bucket Planning: 1yr → 6mo → 3mo → Ready

✅ Best For
  • Teams transitioning methodologies
  • Mixed work types (planned + reactive)
  • Flexible planning needs
  • Evolutionary improvement

❌ Not Ideal For
  • Teams needing pure Scrum/Kanban
  • Very small teams (< 3 people)
  • Highly regulated environments
  • Fixed release schedules

💡 Quick Start with Claude Code
  You: "Set up our bucket planning"
  You: "What triggers planning?"
  You: "Show flow metrics"

📚 Learn More: https://scrumban.org
`,
};

// Standards help content
const STANDARDS_HELP: Record<string, string> = {
  "owasp-web": `
🔒 OWASP Top 10 Web Application Security
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

The most critical security risks to web applications, updated every
3-4 years by security experts worldwide. Essential for secure coding.

🎯 The Top 10 (2021)

A01. Broken Access Control
  • Unauthorized access to resources
  • Missing function level access control
  • Elevation of privilege

A02. Cryptographic Failures
  • Sensitive data exposure
  • Weak algorithms
  • Poor key management

A03. Injection
  • SQL, NoSQL, OS, LDAP injection
  • XSS (Cross-site Scripting)
  • Code injection

📊 Visual Overview
┌─────────────────────────────────────────┐
│           OWASP Top 10 Pyramid          │
├─────────────────────────────────────────┤
│ A01 │ Broken Access Control     │ 94%  │ ████████████
│ A02 │ Cryptographic Failures    │ 77%  │ ██████████
│ A03 │ Injection                 │ 77%  │ ██████████
│ A04 │ Insecure Design          │ 73%  │ █████████
│ A05 │ Security Misconfiguration │ 90%  │ ████████████
│ ... │                           │       │
└─────────────────────────────────────────┘
        % of apps with vulnerability

💻 Code Examples

❌ Vulnerable (SQL Injection):
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;

✅ Secure (Parameterized):
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId]);

🛡️ Implementation with Claude Code
  You: "Check this code for OWASP violations"
  You: "How do I prevent SQL injection here?"
  You: "Review auth implementation for A01"

📚 Resources
  • Full Guide: https://owasp.org/Top10/
  • Cheat Sheets: https://cheatsheetseries.owasp.org/
  • Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

💡 Quick Tips
  • Always validate input
  • Use parameterized queries
  • Implement proper access controls
  • Keep dependencies updated
  • Log security events
`,

  "15-factor": `
☁️ 15-Factor App Methodology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Beyond the original 12-factor, modern cloud-native best practices
for building scalable, maintainable applications.

📋 The 15 Factors

I. Codebase
   One codebase tracked in revision control, many deploys

II. Dependencies
   Explicitly declare and isolate dependencies

III. Config
   Store config in the environment

IV. Backing Services
   Treat backing services as attached resources

V. Build, Release, Run
   Strictly separate build and run stages

VI. Processes
   Execute the app as one or more stateless processes

VII. Port Binding
   Export services via port binding

VIII. Concurrency
   Scale out via the process model

IX. Disposability
   Maximize robustness with fast startup and graceful shutdown

X. Dev/Prod Parity
   Keep development, staging, and production as similar as possible

XI. Logs
   Treat logs as event streams

XII. Admin Processes
   Run admin/management tasks as one-off processes

XIII. API First 🆕
   Design API before implementation

XIV. Telemetry 🆕
   Gather metrics, logs, and traces

XV. Authentication & Authorization 🆕
   Security as a first-class concern

🔄 Visual Architecture
┌─────────────────────────────────────────────┐
│              Load Balancer                  │
├─────────────┬─────────────┬────────────────┤
│   Process   │   Process   │   Process      │
│  (Stateless)│  (Stateless)│  (Stateless)   │
├─────────────┴─────────────┴────────────────┤
│           Backing Services                  │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │Database│ │ Cache  │ │ Queue  │        │
│  └────────┘ └────────┘ └────────┘        │
└─────────────────────────────────────────────┘

💻 Implementation Examples

✅ Config (Factor III):
  // Good: Environment variables
  const dbUrl = process.env.DATABASE_URL;
  
  // Bad: Hardcoded values
  const dbUrl = "postgres://localhost/myapp";

✅ Logs (Factor XI):
  // Good: Write to stdout
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'User logged in',
    userId: user.id
  }));

🚀 With Claude Code
  You: "Make this app 15-factor compliant"
  You: "How should I handle configuration?"
  You: "Review for factor violations"

📚 Learn More
  • Original 12-Factor: https://12factor.net/
  • Cloud Native Patterns: https://www.cloudnativepatterns.org/
  • Container Best Practices: https://cloud.google.com/architecture/best-practices-for-building-containers
`,

  "tdd": `
🧪 Test-Driven Development (TDD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Write tests first, then code. A discipline that leads to better
design, fewer bugs, and confidence in your codebase.

🔄 The TDD Cycle

┌─────────────────────────────────────────┐
│            RED-GREEN-REFACTOR           │
│                                         │
│     1. RED: Write failing test          │
│         ↓                               │
│     2. GREEN: Write minimal code        │
│         ↓                               │
│     3. REFACTOR: Improve the code       │
│         ↓                               │
│     ← ← ← ← ← ← ← ← ← ← ← ← ← ←       │
└─────────────────────────────────────────┘

📝 The Process

1️⃣ RED Phase
   • Write a test for the next bit of functionality
   • Run the test and watch it fail
   • Ensures test is actually testing something

2️⃣ GREEN Phase
   • Write the simplest code to make test pass
   • Don't worry about elegance yet
   • Just make it work

3️⃣ REFACTOR Phase
   • Clean up the code
   • Remove duplication
   • Improve design
   • Tests ensure nothing breaks

💻 Example: Calculator Addition

// 1. RED: Write failing test
test('adds 1 + 2 to equal 3', () => {
  const calc = new Calculator();
  expect(calc.add(1, 2)).toBe(3);
});
// ❌ Error: Calculator is not defined

// 2. GREEN: Minimal code to pass
class Calculator {
  add(a, b) {
    return a + b;
  }
}
// ✅ Test passes!

// 3. REFACTOR: Improve if needed
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

📊 Benefits Visualization
┌────────────────────────────────────┐
│     Traditional vs TDD Coverage    │
├────────────────────────────────────┤
│ Traditional:                       │
│ Code █████████░░░ 70%             │
│ Tests ████░░░░░░░ 40%             │
│                                    │
│ TDD:                              │
│ Code ████████████ 100%            │
│ Tests ████████████ 100%           │
└────────────────────────────────────┘

✅ Benefits
  • Forces good design (testable = good)
  • Provides living documentation
  • Catches regressions immediately
  • Gives confidence to refactor
  • Reduces debugging time

❌ Common Pitfalls
  • Writing tests after code (not TDD)
  • Testing implementation not behavior
  • Not refactoring in the third step
  • Writing too much code in green phase

🎯 With Claude Code
  You: "Help me TDD this feature"
  You: "Write a failing test for user login"
  You: "Now make this test pass"

📚 Resources
  • Kent Beck's "Test Driven Development"
  • Growing Object-Oriented Software (GOOS)
  • TDD By Example: https://github.com/tastejs/todomvc

💡 Pro Tips
  • Keep tests fast (milliseconds)
  • Test behavior, not implementation
  • One assertion per test (usually)
  • Use descriptive test names
  • Delete redundant tests
`,

  "nist-csf": `
🛡️ NIST Cybersecurity Framework
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

A comprehensive approach to managing cybersecurity risk, used by
organizations worldwide. Five core functions to protect assets.

🎯 The Five Functions

┌─────────────────────────────────────────────────┐
│              NIST CSF Core Functions            │
├─────────────────────────────────────────────────┤
│                                                 │
│  IDENTIFY → PROTECT → DETECT → RESPOND → RECOVER│
│      🔍        🛡️        👁️        🚨        🔄    │
│                                                 │
└─────────────────────────────────────────────────┘

📋 Function Breakdown

1️⃣ IDENTIFY (ID)
   • Asset Management
   • Risk Assessment
   • Governance
   Know what you need to protect

2️⃣ PROTECT (PR)
   • Access Control
   • Data Security
   • Training
   Implement safeguards

3️⃣ DETECT (DE)
   • Anomalies & Events
   • Continuous Monitoring
   • Detection Processes
   Find incidents quickly

4️⃣ RESPOND (RS)
   • Response Planning
   • Communications
   • Mitigation
   Take action on incidents

5️⃣ RECOVER (RC)
   • Recovery Planning
   • Improvements
   • Communications
   Restore and learn

💻 Implementation Examples

// IDENTIFY: Asset inventory
const assets = {
  critical: ['user-database', 'payment-service'],
  important: ['analytics', 'reporting'],
  standard: ['blog', 'docs-site']
};

// PROTECT: Access control
@RequireRole('admin')
async deleteUser(userId: string) {
  await auditLog('user.delete', { userId, deletedBy: currentUser });
  return userService.delete(userId);
}

// DETECT: Anomaly detection
if (loginAttempts > 5 && timeWindow < 60) {
  alertSecurityTeam('Possible brute force attack', { ip, user });
}

📊 Maturity Levels
Level 1: Partial    █░░░░
Level 2: Informed   ██░░░
Level 3: Repeatable ███░░
Level 4: Adaptive   ████░
Level 5: Optimized  █████

🎯 Quick Wins
  • Start with asset inventory
  • Implement basic access controls
  • Set up security event logging
  • Create incident response plan
  • Test recovery procedures

📚 Learn More
  • Framework: https://www.nist.gov/cyberframework
  • Implementation Guide: https://csrc.nist.gov/publications/
  • Assessment Tools: https://www.nist.gov/cyberframework/assessment-auditing-resources
`,

  "ddd": `
🏗️ Domain-Driven Design (DDD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Tackle complex software by focusing on the core domain and domain
logic. Create a shared language between developers and domain experts.

🎯 Core Concepts

┌─────────────────────────────────────────────────┐
│              DDD Building Blocks                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Bounded Context                                │
│  ┌─────────────────────────────────┐          │
│  │  Aggregate                       │          │
│  │  ┌─────────────┐                │          │
│  │  │   Entity    │ Value Objects  │          │
│  │  │  (has ID)   │  (no ID)       │          │
│  │  └─────────────┘                │          │
│  │                                  │          │
│  │  Domain Events → → → → → → → →  │          │
│  └─────────────────────────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘

📚 Key Patterns

ENTITY
  • Has unique identity
  • Identity persists over time
  • Mutable state
  
  class User {
    constructor(public id: UserId, 
                public email: Email) {}
  }

VALUE OBJECT
  • No identity
  • Immutable
  • Defined by attributes
  
  class Money {
    constructor(public amount: number, 
                public currency: string) {}
  }

AGGREGATE
  • Cluster of entities/VOs
  • Transaction boundary
  • Consistency boundary
  
  class Order {
    constructor(
      private id: OrderId,
      private items: OrderItem[],
      private customer: CustomerId
    ) {}
    
    addItem(item: OrderItem) {
      // Business rules enforced here
    }
  }

📊 Strategic Design
┌──────────────┬──────────────┬──────────────┐
│   Subdomain  │   Subdomain  │   Subdomain  │
├──────────────┼──────────────┼──────────────┤
│     Core     │  Supporting  │   Generic    │
│ (Your secret │   (Needed    │ (Buy don't   │
│    sauce)    │  but not     │   build)     │
│              │   unique)    │              │
└──────────────┴──────────────┴──────────────┘

🗣️ Ubiquitous Language
  Team agrees: "Order" means:
  • Has items
  • Belongs to customer
  • Can be placed, shipped, delivered
  • NOT "database table orders"

💻 With Claude Code
  You: "Model this as a DDD aggregate"
  You: "What's the bounded context here?"
  You: "Should this be an entity or value object?"

📚 Learn More
  • Eric Evans' "Domain-Driven Design"
  • Implementing DDD by Vaughn Vernon
  • DDD Community: https://dddcommunity.org/
`,

  "solid": `
🎯 SOLID Principles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brought to you by Aichaku (愛着) - Adaptive Methodology Support

Five principles for writing maintainable object-oriented code.
The foundation of clean architecture and good design.

📋 The Principles

S - Single Responsibility Principle
O - Open/Closed Principle  
L - Liskov Substitution Principle
I - Interface Segregation Principle
D - Dependency Inversion Principle

🔤 Detailed Breakdown

S ── SINGLE RESPONSIBILITY ─────────────────────────
│
│  "A class should have one reason to change"
│
│  ❌ Bad: Class doing too much
│  class User {
│    validateEmail() { }
│    saveToDatabase() { }
│    sendWelcomeEmail() { }
│    generateReport() { }
│  }
│
│  ✅ Good: Separate concerns
│  class User { }
│  class UserValidator { }
│  class UserRepository { }
│  class EmailService { }
│
O ── OPEN/CLOSED ────────────────────────────────────
│
│  "Open for extension, closed for modification"
│
│  ❌ Bad: Modifying existing code
│  class AreaCalculator {
│    calculate(shape) {
│      if (shape.type === 'circle') { }
│      if (shape.type === 'square') { }
│      // Adding triangle requires changing this
│    }
│  }
│
│  ✅ Good: Extend via inheritance
│  interface Shape {
│    area(): number;
│  }
│  class Circle implements Shape { }
│  class Square implements Shape { }
│  class Triangle implements Shape { } // Just add
│
L ── LISKOV SUBSTITUTION ────────────────────────────
│
│  "Derived classes must be substitutable"
│
│  ❌ Bad: Breaking parent's contract
│  class Bird {
│    fly() { }
│  }
│  class Penguin extends Bird {
│    fly() { throw Error("Can't fly!"); }
│  }
│
│  ✅ Good: Proper abstraction
│  class Bird { }
│  class FlyingBird extends Bird {
│    fly() { }
│  }
│  class Penguin extends Bird { }
│
I ── INTERFACE SEGREGATION ──────────────────────────
│
│  "Don't force clients to depend on unused methods"
│
│  ❌ Bad: Fat interface
│  interface Worker {
│    work();
│    eat();
│    sleep();
│  }
│
│  ✅ Good: Focused interfaces
│  interface Workable { work(); }
│  interface Eatable { eat(); }
│  interface Sleepable { sleep(); }
│
D ── DEPENDENCY INVERSION ───────────────────────────
│
│  "Depend on abstractions, not concretions"
│
│  ❌ Bad: Direct dependency
│  class EmailService {
│    constructor() {
│      this.smtp = new SmtpClient();
│    }
│  }
│
│  ✅ Good: Inject abstraction
│  class EmailService {
│    constructor(private mailer: IMailer) { }
│  }

📊 Benefits Visualization
         Before SOLID          After SOLID
         ┌─────────┐          ┌───┐ ┌───┐
         │ Big     │          │ S │ │ R │
         │ Complex │    →     ├───┤ ├───┤
         │ Class   │          │ P │ │ P │
         └─────────┘          └───┘ └───┘
         Hard to test         Easy to test
         Hard to change       Easy to extend

💡 Remember
  • Each principle supports the others
  • Start with S (easiest to apply)
  • Don't over-engineer
  • Pragmatism over dogma

💻 With Claude Code
  You: "Review this for SOLID violations"
  You: "How do I apply SRP here?"
  You: "Make this follow dependency inversion"

📚 Learn More
  • Clean Code by Robert C. Martin
  • SOLID Principles: https://solidprinciples.com/
  • Refactoring Guru: https://refactoring.guru/design-patterns
`,
};

// Helper to normalize standard names
function normalizeStandardName(name: string): string | undefined {
  const normalized = name.toLowerCase().replace(/[\s-_]/g, "");

  // Direct matches
  const directMatches: Record<string, string> = {
    "owasp": "owasp-web",
    "owasptop10": "owasp-web",
    "12factor": "15-factor",
    "15factor": "15-factor",
    "testdrivendevelopment": "tdd",
    "nist": "nist-csf",
    "nistcyber": "nist-csf",
    "domaindriven": "ddd",
    "domaindrivendesign": "ddd",
  };

  if (directMatches[normalized]) {
    return directMatches[normalized];
  }

  // Check if it matches any standard ID directly
  for (const id of Object.keys(STANDARDS_HELP)) {
    if (id.replace(/-/g, "") === normalized) {
      return id;
    }
  }

  return undefined;
}

/**
 * Display methodology and standards help information
 */
export function help(options: HelpOptions = {}): HelpResult {
  try {
    // List all standards
    if (options.standards) {
      return listStandards(options);
    }

    // Show specific standard help
    if (options.standard) {
      const normalizedName = normalizeStandardName(options.standard);

      if (!normalizedName) {
        return {
          success: false,
          message: `Unknown standard: ${options.standard}. Use 'aichaku help --standards' to see available options.`,
        };
      }

      const content = STANDARDS_HELP[normalizedName];
      if (!content) {
        return {
          success: false,
          message: `No detailed help available for ${options.standard} yet.`,
        };
      }

      return {
        success: true,
        content: content.trim(),
      };
    }

    // List all resources (methodologies + standards)
    if (options.all) {
      return listAllResources();
    }

    // List by category
    if (
      options.security || options.architecture || options.development ||
      options.testing || options.devops
    ) {
      return listByCategory(options);
    }

    // List all methodologies
    if (options.list) {
      const list = Object.entries(METHODOLOGIES)
        .map(([_key, meta], index) => `  ${index + 1}. ${meta.icon} ${meta.name.padEnd(18)} - ${meta.summary}`)
        .join("\n");

      const methodNames = Object.entries(METHODOLOGIES)
        .map(([key, meta]) => `"${meta.name.toLowerCase()}", "${key}"`)
        .join(", ");

      return {
        success: true,
        content:
          `Available Methodologies:\n\n${list}\n\n📝 Get help using:\n  • Number: aichaku help 1\n  • Name: aichaku help "shape up"\n  • Code: aichaku help shape-up\n\n✨ All names work: ${methodNames}`,
      };
    }

    // Compare methodologies
    if (options.compare) {
      const comparison = `Methodology Comparison:

┌─────────────────┬──────────────────┬─────────────────┬──────────────────┐
│ Methodology     │ Cadence          │ Best For        │ Key Practice     │
├─────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ Shape Up        │ 6-week cycles    │ New features    │ Shaping & betting│
│ Scrum           │ 2-4 week sprints │ Regular delivery│ Daily standups   │
│ Kanban          │ Continuous       │ Flow work       │ WIP limits       │
│ Lean            │ Iterative        │ Validation      │ MVP testing      │
│ XP              │ 1-2 week iter.   │ Code quality    │ TDD & pairing    │
│ Scrumban        │ Flexible         │ Hybrid teams    │ Pull planning    │
└─────────────────┴──────────────────┴─────────────────┴──────────────────┘`;

      return {
        success: true,
        content: comparison,
      };
    }

    // Show specific methodology help
    if (options.methodology) {
      const normalizedName = normalizeMethodologyName(options.methodology);

      if (!normalizedName) {
        return {
          success: false,
          message: `Unknown methodology: ${options.methodology}. Use 'aichaku help --list' to see available options.`,
        };
      }

      const content = HELP_CONTENT[normalizedName];
      if (!content) {
        return {
          success: false,
          message: `No detailed help available for ${options.methodology} yet.`,
        };
      }

      return {
        success: true,
        content: content.trim(),
      };
    }

    // Default help about the help command
    return {
      success: true,
      content: `${Brand.helpIntro()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Learn methodologies and development standards to improve your
workflow with Claude Code.

📚 Development Methodologies
  aichaku help shape-up     Learn about Shape Up
  aichaku help scrum        Learn about Scrum
  aichaku help --list       See all methodologies
  aichaku help --compare    Compare methodologies

🛡️ Standards & Best Practices
  aichaku help owasp-web    Learn OWASP Top 10
  aichaku help tdd          Learn Test-Driven Development
  aichaku help --standards  See all standards
  aichaku help --security   Security standards

📋 Browse Everything
  aichaku help --all        List all resources

💡 How It Works with Claude Code
  Say "let's shape a feature"    → Activates Shape Up mode
  Say "check for OWASP issues"   → Reviews security risks
  Say "help me TDD this"         → Guides test-first approach

✨ Natural language adapts both methodologies and standards!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Looking for CLI commands?
   Run 'aichaku --help' to see all available commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Docs: https://github.com/RickCogley/aichaku`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Help command failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * List all standards with optional category filtering
 */
function listStandards(options: HelpOptions): HelpResult {
  const categories = options.security || options.architecture ||
    options.development || options.testing || options.devops;

  if (categories) {
    return listByCategory(options);
  }

  let content = `${Brand.PREFIX} Available Standards\n\n`;

  // Group standards by category
  // STANDARD_CATEGORIES is empty in the current implementation
  // This section will be populated when standards are properly implemented
  content += `No standard categories currently available.\n\n`;

  content += `\n📝 Get help using:\n`;
  content += `  • aichaku help owasp-web\n`;
  content += `  • aichaku help tdd\n`;
  content += `  • aichaku help 15-factor\n`;
  content += `\n✨ Use standards to guide Claude Code's development approach!`;

  return {
    success: true,
    content,
  };
}

/**
 * List standards by category
 */
function listByCategory(options: HelpOptions): HelpResult {
  let content = `${Brand.PREFIX} Standards by Category\n\n`;

  const showCategories = [];
  if (options.security) showCategories.push("security");
  if (options.architecture) showCategories.push("architecture");
  if (options.development) showCategories.push("development");
  if (options.testing) showCategories.push("testing");
  if (options.devops) showCategories.push("devops");

  if (showCategories.length === 0) {
    showCategories.push(...Object.keys(STANDARD_CATEGORIES));
  }

  for (const categoryId of showCategories) {
    // Category display will be implemented when STANDARD_CATEGORIES is populated
    content += `Category "${categoryId}" is not yet implemented.\n\n`;
  }

  return {
    success: true,
    content,
  };
}

/**
 * List all resources (methodologies + standards)
 */
function listAllResources(): HelpResult {
  let content = `${Brand.PREFIX} Complete Knowledge Base
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Development Methodologies (${Object.keys(METHODOLOGIES).length})
`;

  // List methodologies
  Object.entries(METHODOLOGIES).forEach(([_key, meta], index) => {
    content += `  ${index + 1}. ${meta.icon} ${meta.name.padEnd(18)} - ${meta.summary}\n`;
  });

  content += `\n🛡️ Standards & Best Practices (0)\n`;

  // Standards will be listed here when implemented
  content += `\nNo standards currently available.\n`;

  content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
📖 Learn More:
  • Specific methodology: aichaku help shape-up
  • Specific standard: aichaku help owasp-web
  • Compare approaches: aichaku help --compare
  
✨ Use these resources to improve your development workflow!`;

  return {
    success: true,
    content,
  };
}
