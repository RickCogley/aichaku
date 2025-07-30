# YAGNI (You Aren't Gonna Need It)

## Overview

YAGNI is a principle of Extreme Programming (XP) that states programmers should not add functionality until it is
actually needed. Ron Jeffries, one of the founders of XP, coined this principle to combat the tendency of developers to
add features based on predicted future needs rather than current requirements.

## Core Concept

"Always implement things when you actually need them, never when you just foresee that you might need them."

Even if you're absolutely certain you'll need a feature later, don't implement it now. The costs of carrying unnecessary
code, maintaining it, and potentially being wrong about future needs outweigh any perceived benefits of having it early.

## Key Principles

1. **Present Over Future**: Focus on current, concrete requirements
2. **Avoid Speculation**: Don't code based on predictions
3. **Defer Decisions**: Wait until you have more information
4. **Trust in Refactoring**: Believe in your ability to add features later
5. **Minimize Waste**: Every line of code has a cost

## The Cost of Premature Implementation

### 1. Code Complexity

```python
# BAD: Overly generic solution for one use case
class DataProcessor:
    def __init__(self, strategy='default', cache_enabled=False, 
                 async_mode=False, retry_count=3, timeout=30):
        self.strategy = strategy
        self.cache_enabled = cache_enabled
        self.async_mode = async_mode
        self.retry_count = retry_count
        self.timeout = timeout
        self._initialize_strategies()
        self._setup_cache()
        self._configure_async()
    
    def process(self, data, format='json', validate=True, 
                transform=None, custom_handler=None):
        # Complex logic handling all possible cases
        pass

# GOOD: Simple solution for actual need
class DataProcessor:
    def process_json(self, data):
        # Direct implementation for current requirement
        return json.loads(data)
```

### 2. Maintenance Burden

```javascript
// BAD: Unused features require maintenance
class UserService {
  constructor() {
    this.cache = new Cache();
    this.queue = new Queue();
    this.rateLimiter = new RateLimiter(); // Not used
    this.metrics = new Metrics(); // Not used
    this.replication = new Replication(); // Not used
  }

  getUser(id) {
    // Only uses cache, but maintains all systems
    return this.cache.get(id) || this.fetchUser(id);
  }
}

// GOOD: Only what's needed
class UserService {
  constructor() {
    this.cache = new Cache();
  }

  getUser(id) {
    return this.cache.get(id) || this.fetchUser(id);
  }
}
```

### 3. Wrong Predictions

```java
// BAD: Predicted need that never materialized
public class Order {
    private Long id;
    private Customer customer;
    private List<OrderItem> items;
    
    // Added for "future multi-currency support"
    private Currency currency;
    private BigDecimal exchangeRate;
    private Currency originalCurrency;
    
    // Added for "future subscription model"
    private SubscriptionType subscriptionType;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    
    // Years later: Still only using id, customer, and items
}

// GOOD: Just what's needed
public class Order {
    private Long id;
    private Customer customer;
    private List<OrderItem> items;
}
```

## Common YAGNI Violations

### 1. Speculative Database Design

```sql
-- BAD: Tables and fields for features that don't exist
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    -- Speculative fields
    oauth_provider VARCHAR(50),      -- "We might add OAuth someday"
    two_factor_secret VARCHAR(100),  -- "We might add 2FA someday"
    subscription_tier INT,           -- "We might add subscriptions"
    referral_code VARCHAR(20),       -- "We might add referrals"
    deleted_at TIMESTAMP            -- "We might need soft delete"
);

-- GOOD: Only current requirements
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
);
```

### 2. Over-Architecting

```typescript
// BAD: Complex architecture for simple needs
interface Repository<T> {
  find(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

abstract class BaseRepository<T> implements Repository<T> {
  abstract getTableName(): string;
  // Complex base implementation
}

class UserRepository extends BaseRepository<User> {
  getTableName() {
    return "users";
  }
}

// Service layer, DTO layer, Controller layer...
// All for a simple CRUD app!

// GOOD: Direct implementation
class UserStore {
  async getUser(id: string): Promise<User> {
    const result = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return result[0];
  }
}
```

### 3. Premature API Versioning

```python
# BAD: Versioning without any version differences
@app.route('/api/v1/users')  # Only version that exists
@app.route('/api/v2/users')  # Same implementation
@app.route('/api/v3/users')  # Same implementation
def get_users():
    return jsonify(users)

# GOOD: No versioning until needed
@app.route('/api/users')
def get_users():
    return jsonify(users)
```

### 4. Feature Flags for Non-Existent Features

```go
// BAD: Configuration for features that don't exist
type Config struct {
    EnableCache        bool  // Used
    EnableNewUI        bool  // Not implemented
    EnableAnalytics    bool  // Not implemented
    EnableABTesting    bool  // Not implemented
    MaxConnections     int   // Used
    EnableAutoScaling  bool  // Not implemented
}

// GOOD: Only actual configuration
type Config struct {
    EnableCache    bool
    MaxConnections int
}
```

## When YAGNI Doesn't Apply

### 1. Security Foundations

```python
# Security should be built in from the start
class UserAuth:
    def __init__(self):
        self.hash_algorithm = 'bcrypt'  # Don't use MD5 now and upgrade later
        self.min_password_length = 12
        
    def hash_password(self, password):
        # Implement strong security from day one
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
```

### 2. Data Migration Costs

```sql
-- Some database decisions are expensive to change later
CREATE TABLE events (
    id BIGINT PRIMARY KEY,  -- Use BIGINT from start if you might have many records
    created_at TIMESTAMP WITH TIME ZONE  -- Include timezone from start
);
```

### 3. Public API Contracts

```yaml
# API contracts that external users depend on
openapi: 3.0.0
paths:
  /users/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string # Hard to change from string to integer later
```

## YAGNI in Practice

### Incremental Development

```ruby
# Iteration 1: Basic functionality
class EmailSender
  def send(to, subject, body)
    # Simple SMTP implementation
  end
end

# Iteration 2: Add attachments when needed
class EmailSender
  def send(to, subject, body, attachments = [])
    # Implementation with attachments
  end
end

# Iteration 3: Add CC when needed
class EmailSender
  def send(to, subject, body, attachments = [], cc = [])
    # Implementation with CC
  end
end
```

### Refactoring When Needed

```javascript
// Step 1: Direct implementation
function calculatePrice(quantity, unitPrice) {
  return quantity * unitPrice;
}

// Step 2: Add discount when business requires it
function calculatePrice(quantity, unitPrice, discountPercent = 0) {
  const subtotal = quantity * unitPrice;
  return subtotal * (1 - discountPercent / 100);
}

// Step 3: Extract when complexity grows
class PriceCalculator {
  constructor(pricingRules) {
    this.rules = pricingRules;
  }

  calculate(orderItem) {
    // Now we need the abstraction
  }
}
```

### Documentation Instead of Code

```markdown
## Future Considerations

Instead of implementing these features now, we document them:

1. **Multi-tenancy**: When we need to support multiple clients, we'll add a `tenant_id` to relevant tables and update
   queries.

2. **Caching**: If performance becomes an issue, we'll add Redis caching at the service layer.

3. **Async Processing**: If request times become too long, we'll introduce a message queue.

These are not implemented now because:

- We have a single client
- Performance is acceptable
- All operations are fast enough
```

## Best Practices

### 1. Question Every Feature

```python
def should_implement_feature():
    questions = [
        "Is this needed for the current iteration?",
        "Is there a paying customer waiting for this?",
        "Will this be used in the next 2 weeks?",
        "Is the cost of adding it later prohibitive?"
    ]
    
    # If any answer is "No", apply YAGNI
    return all(answer == "Yes" for answer in questions)
```

### 2. Regular Code Cleanup

```bash
# Remove dead code regularly
# Tools to find unused code:
- deadcode (Go)
- vulture (Python)
- ts-prune (TypeScript)
- unused (Rust)
```

### 3. Defer Architectural Decisions

```yaml
# Start simple
version: 1
architecture:
  type: monolith

# Evolve when needed
version: 2
architecture:
  type: microservices
  services:
    - api
    - worker
```

## Conclusion

YAGNI is not about being short-sighted or ignoring the future. It's about recognizing that:

1. **Requirements change**: What we predict rarely matches reality
2. **Code has cost**: Every line needs to be maintained
3. **Simplicity has value**: Simple code is easier to change
4. **Refactoring works**: We can add features when needed

By following YAGNI, we create codebases that are:

- Easier to understand
- Cheaper to maintain
- More adaptable to actual (not imagined) needs
- Focused on delivering real value now

Remember: The most expensive features are the ones you build but never use.
