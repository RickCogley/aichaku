# Example Standard Guide Templates

🪴 Aichaku: Creating Memorable Learning Experiences

## More Standard Examples

### NIST Cybersecurity Framework
```
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
```

### Domain-Driven Design (DDD)
```
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
```

### SOLID Principles
```
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
```

## Visual Elements That Work

### 1. **ASCII Diagrams**
- Architecture overviews
- Flow diagrams
- Hierarchies
- Process cycles

### 2. **Progress Bars**
```
Implementation: ████████░░ 80%
Testing:        ████░░░░░░ 40%
```

### 3. **Emoji Indicators**
- 🔒 Security
- 🎯 Goals
- 💻 Code examples
- ✅ Good practices
- ❌ Bad practices
- 💡 Tips

### 4. **Structured Sections**
- Clear headers with separators
- Numbered steps
- Bulleted lists
- Code examples with context

### 5. **Comparative Examples**
Always show:
- ❌ What NOT to do
- ✅ What TO do instead
- Why one is better

## Implementation Benefits

1. **Terminal-Friendly**: Works in any terminal
2. **Memorable**: Visual elements aid retention
3. **Practical**: Real code examples
4. **Scannable**: Easy to find information
5. **Comprehensive**: Everything in one place

These templates provide a consistent, engaging way to learn about development standards directly from the command line!