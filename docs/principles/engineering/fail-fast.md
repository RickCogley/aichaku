# Fail Fast

## Overview

The Fail Fast principle advocates that systems should detect and report failures as early as possible, stopping
execution immediately rather than attempting to continue in an potentially invalid state. This approach leads to more
reliable, debuggable, and maintainable systems.

## Core Concept

"Dead programs tell no lies" - The Pragmatic Programmer

Rather than limping along with corrupt data or invalid state, fail-fast systems:

1. **Detect** errors immediately
2. **Report** clearly what went wrong
3. **Stop** before damage spreads
4. **Maintain** system integrity

## Why Fail Fast?

### The Hidden Cost of Continuing

```python
# BAD: Silently continuing with errors
def calculate_average(numbers):
    if not numbers:
        return 0  # Hide the error
    
    total = 0
    count = 0
    for num in numbers:
        try:
            total += float(num)
            count += 1
        except:
            pass  # Silently skip bad values
    
    return total / count if count > 0 else 0

# Problem: Was the result 0 because all values were 0, 
# or because all values were invalid?

# GOOD: Fail fast with clear errors
def calculate_average(numbers):
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    
    total = 0
    for i, num in enumerate(numbers):
        try:
            total += float(num)
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid number at index {i}: {num}") from e
    
    return total / len(numbers)
```

## Implementation Strategies

### 1. Input Validation at Boundaries

```typescript
// BAD: Trusting inputs
class UserService {
  async createUser(data: any) {
    // Assuming data is valid
    const user = {
      email: data.email,
      age: data.age,
      role: data.role,
    };
    return await this.database.save(user);
  }
}

// GOOD: Validate immediately
class UserService {
  async createUser(data: unknown) {
    // Fail fast on invalid input
    const validated = this.validateUserData(data);
    return await this.database.save(validated);
  }

  private validateUserData(data: unknown): ValidatedUser {
    if (!data || typeof data !== "object") {
      throw new ValidationError("User data must be an object");
    }

    const { email, age, role } = data as any;

    if (!email || !this.isValidEmail(email)) {
      throw new ValidationError("Invalid email address");
    }

    if (!Number.isInteger(age) || age < 0 || age > 150) {
      throw new ValidationError("Age must be between 0 and 150");
    }

    if (!["user", "admin"].includes(role)) {
      throw new ValidationError('Role must be "user" or "admin"');
    }

    return { email, age, role };
  }
}
```

### 2. Using Types to Prevent Errors

```rust
// Make invalid states unrepresentable
#[derive(Debug)]
enum ConnectionState {
    Disconnected,
    Connecting { attempt: u32 },
    Connected { session_id: String },
}

struct Connection {
    state: ConnectionState,
}

impl Connection {
    // Can only send data when connected
    fn send_data(&self, data: &[u8]) -> Result<(), Error> {
        match &self.state {
            ConnectionState::Connected { session_id } => {
                // Send data using session_id
                Ok(())
            }
            _ => Err(Error::NotConnected),
        }
    }
    
    // State transitions are explicit
    fn connect(&mut self) -> Result<(), Error> {
        match &self.state {
            ConnectionState::Disconnected => {
                self.state = ConnectionState::Connecting { attempt: 1 };
                // Attempt connection...
                Ok(())
            }
            _ => Err(Error::AlreadyConnecting),
        }
    }
}
```

### 3. Assertions and Invariants

```java
public class BankAccount {
    private BigDecimal balance;
    private final String accountId;
    
    public BankAccount(String accountId, BigDecimal initialBalance) {
        // Fail fast on invalid initialization
        if (accountId == null || accountId.trim().isEmpty()) {
            throw new IllegalArgumentException("Account ID cannot be null or empty");
        }
        if (initialBalance == null || initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        
        this.accountId = accountId;
        this.balance = initialBalance;
    }
    
    public void withdraw(BigDecimal amount) {
        // Preconditions
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount.compareTo(balance) > 0) {
            throw new InsufficientFundsException(
                String.format("Cannot withdraw %s from balance of %s", amount, balance)
            );
        }
        
        // Perform operation
        balance = balance.subtract(amount);
        
        // Postcondition assertion
        assert balance.compareTo(BigDecimal.ZERO) >= 0 : "Balance should never be negative";
    }
}
```

### 4. Configuration Loading

```go
// Fail fast on startup
type Config struct {
    DatabaseURL string `required:"true"`
    Port        int    `required:"true" min:"1" max:"65535"`
    APIKey      string `required:"true" pattern:"^[A-Za-z0-9]{32}$"`
}

func LoadConfig() (*Config, error) {
    config := &Config{}
    
    // Load from environment
    if err := env.Parse(config); err != nil {
        return nil, fmt.Errorf("failed to parse config: %w", err)
    }
    
    // Validate immediately
    if err := validateConfig(config); err != nil {
        return nil, fmt.Errorf("invalid configuration: %w", err)
    }
    
    // Test database connection
    if err := testDatabaseConnection(config.DatabaseURL); err != nil {
        return nil, fmt.Errorf("cannot connect to database: %w", err)
    }
    
    return config, nil
}

func main() {
    // Fail fast - don't start with bad config
    config, err := LoadConfig()
    if err != nil {
        log.Fatalf("Failed to load configuration: %v", err)
    }
    
    // Now we know config is valid
    startServer(config)
}
```

## Patterns for Fail-Fast Systems

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = "CLOSED";
    this.failures = 0;
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        // Fail fast - don't even try
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF-OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.error(`Circuit breaker opened. Will retry at ${new Date(this.nextAttempt)}`);
    }
  }
}

// Usage
const breaker = new CircuitBreaker({ failureThreshold: 3 });

async function callExternalAPI() {
  return breaker.call(async () => {
    const response = await fetch("https://api.example.com/data");
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return response.json();
  });
}
```

### Guard Clauses

```ruby
# BAD: Nested conditions
def process_order(order, user, payment_method)
  if order
    if user
      if payment_method
        if order.items.any?
          if user.active?
            if payment_method.valid?
              # Actual logic buried deep
              order.process!
            else
              raise "Invalid payment method"
            end
          else
            raise "User is not active"
          end
        else
          raise "Order has no items"
        end
      else
        raise "Payment method required"
      end
    else
      raise "User required"
    end
  else
    raise "Order required"
  end
end

# GOOD: Fail fast with guard clauses
def process_order(order, user, payment_method)
  raise ArgumentError, "Order required" unless order
  raise ArgumentError, "User required" unless user
  raise ArgumentError, "Payment method required" unless payment_method
  raise InvalidOrderError, "Order has no items" if order.items.empty?
  raise InactiveUserError, "User is not active" unless user.active?
  raise InvalidPaymentError, "Invalid payment method" unless payment_method.valid?
  
  # Clear, unindented business logic
  order.process!
end
```

### Parser Combinators

```haskell
-- Fail fast parsing with clear errors
parseConfig :: Text -> Either ParseError Config
parseConfig input = do
    -- Each step can fail with specific error
    version <- parseVersion input
    when (version < minVersion) $
        Left $ UnsupportedVersion version
    
    database <- parseDatabase input
    validateDatabaseUrl database
    
    features <- parseFeatures input
    validateFeatureFlags features
    
    return $ Config version database features

-- Usage shows clear failure points
main :: IO ()
main = do
    configText <- readFile "config.yaml"
    case parseConfig configText of
        Left (UnsupportedVersion v) -> 
            die $ "Config version " ++ show v ++ " is too old"
        Left (InvalidDatabaseUrl url) -> 
            die $ "Invalid database URL: " ++ url
        Left err -> 
            die $ "Config error: " ++ show err
        Right config -> 
            runApp config
```

## Anti-Patterns to Avoid

### 1. Silent Failures

```python
# ANTI-PATTERN: Swallowing exceptions
def get_user_preference(user_id, key):
    try:
        user = db.get_user(user_id)
        return user.preferences.get(key)
    except:
        return None  # Was user not found? Was there a DB error? Who knows?

# BETTER: Explicit error handling
def get_user_preference(user_id, key):
    try:
        user = db.get_user(user_id)
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        return user.preferences.get(key)
    except DatabaseError as e:
        logger.error(f"Database error getting user {user_id}: {e}")
        raise
```

### 2. Defensive Overcoding

```javascript
// ANTI-PATTERN: Trying to handle everything
function calculatePrice(item, quantity, discount) {
  // Defensive programming gone wrong
  item = item || {};
  quantity = quantity || 1;
  discount = discount || 0;

  const price = item.price || 0;
  const name = item.name || "Unknown";

  if (quantity < 0) quantity = 0;
  if (discount < 0) discount = 0;
  if (discount > 100) discount = 100;

  // By now, we have no idea if inputs were valid
  return price * quantity * (1 - discount / 100);
}

// BETTER: Fail fast with validation
function calculatePrice(item, quantity, discount) {
  // Validate inputs
  if (!item || typeof item.price !== "number") {
    throw new Error("Invalid item: must have numeric price");
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }
  if (typeof discount !== "number" || discount < 0 || discount > 100) {
    throw new Error("Discount must be between 0 and 100");
  }

  // Now we can trust our inputs
  return item.price * quantity * (1 - discount / 100);
}
```

### 3. Error Accumulation

```csharp
// ANTI-PATTERN: Accumulating errors
public class DataProcessor {
    private List<string> errors = new List<string>();
    
    public ProcessResult ProcessData(Data[] items) {
        var results = new List<ProcessedData>();
        
        foreach (var item in items) {
            try {
                results.Add(ProcessItem(item));
            } catch (Exception e) {
                errors.Add($"Failed to process item {item.Id}: {e.Message}");
                // Continue processing... but system is now in partial failure
            }
        }
        
        return new ProcessResult { 
            Data = results, 
            Errors = errors  // May have processed corrupt data
        };
    }
}

// BETTER: Fail fast on first error
public class DataProcessor {
    public ProcessResult ProcessData(Data[] items) {
        // Validate all items first
        foreach (var item in items) {
            ValidateItem(item);  // Throws on invalid item
        }
        
        // Process knowing all items are valid
        var results = items.Select(ProcessItem).ToList();
        return new ProcessResult { Data = results };
    }
}
```

## When Not to Fail Fast

### User-Facing Systems

```typescript
// Internal service: Fail fast
class PaymentProcessor {
  async processPayment(amount: number, token: string) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
    // Process payment...
  }
}

// User-facing layer: Graceful handling
class PaymentController {
  async handlePayment(req: Request, res: Response) {
    try {
      const result = await this.processor.processPayment(
        req.body.amount,
        req.body.token,
      );
      res.json({ success: true, result });
    } catch (error) {
      // Transform internal errors to user-friendly messages
      if (error.message.includes("Amount must be positive")) {
        res.status(400).json({
          success: false,
          error: "Please enter a valid payment amount",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Payment processing failed. Please try again.",
        });
      }
    }
  }
}
```

### Partial Failures in Batch Processing

```python
# Sometimes partial success is acceptable
class EmailBatchSender:
    def send_newsletter(self, recipients):
        """Send newsletter to many recipients"""
        results = {
            'sent': [],
            'failed': []
        }
        
        for recipient in recipients:
            try:
                # Individual failures don't stop the batch
                self.send_email(recipient)
                results['sent'].append(recipient)
            except EmailError as e:
                results['failed'].append({
                    'recipient': recipient,
                    'error': str(e)
                })
        
        # But fail if too many errors
        failure_rate = len(results['failed']) / len(recipients)
        if failure_rate > 0.1:  # >10% failure
            raise BatchSendError(
                f"Too many failures: {failure_rate:.1%}",
                results
            )
        
        return results
```

## Testing Fail-Fast Systems

```javascript
// Test the failure paths
describe("UserValidator", () => {
  it("should fail fast on missing email", () => {
    expect(() => {
      validateUser({ name: "John" });
    }).toThrow("Email is required");
  });

  it("should fail fast on invalid email", () => {
    expect(() => {
      validateUser({ email: "not-an-email" });
    }).toThrow("Invalid email format");
  });

  it("should provide helpful error messages", () => {
    try {
      validateUser({ email: "test@example.com", age: -5 });
    } catch (error) {
      expect(error.message).toContain("age");
      expect(error.message).toContain("must be positive");
    }
  });

  it("should validate all fields before passing", () => {
    const validUser = {
      email: "test@example.com",
      age: 25,
      name: "Test User",
    };

    expect(() => validateUser(validUser)).not.toThrow();
  });
});
```

## Monitoring and Observability

```yaml
# Metrics to track for fail-fast systems
metrics:
  error_rates:
    - validation_errors_per_minute
    - circuit_breaker_opens_per_hour
    - startup_failures_per_deployment

  error_types:
    - top_validation_errors
    - most_common_failure_points
    - error_distribution_by_service

  recovery:
    - mean_time_to_detection
    - mean_time_to_recovery
    - restart_success_rate

alerts:
  - name: "High validation error rate"
    condition: "validation_errors_per_minute > 100"
    severity: "warning"

  - name: "Circuit breaker open"
    condition: "circuit_breaker_state == 'OPEN'"
    severity: "critical"

  - name: "Service failing to start"
    condition: "startup_failures > 3"
    severity: "critical"
```

## Conclusion

Fail Fast is about building systems that:

1. **Detect** problems immediately
2. **Report** errors clearly
3. **Maintain** system integrity
4. **Enable** quick debugging

Key principles:

- Validate early and thoroughly
- Make invalid states impossible
- Provide clear error messages
- Stop on errors rather than continuing
- Test failure paths explicitly

Remember: "It's better to crash predictably than to continue unpredictably." A system that fails fast is a system you
can trust.
