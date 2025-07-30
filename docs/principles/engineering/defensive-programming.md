# Defensive Programming

## Overview

Defensive programming is a methodology where developers anticipate and guard against potential failures, creating
software that handles unexpected situations gracefully. It's about writing code that continues to function predictably
even when faced with invalid inputs, resource failures, or malicious attacks.

## Core Concept

The fundamental idea: **Never trust anything** - not user input, not external systems, not even other parts of your own
codebase. Instead, validate, verify, and protect against all potential issues.

```python
# Non-defensive approach
def divide(a, b):
    return a / b

# Defensive approach
def divide(a, b):
    """Safely divide two numbers."""
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Both arguments must be numbers")
    
    if b == 0:
        raise ValueError("Cannot divide by zero")
    
    try:
        result = a / b
        
        # Check for overflow/special values
        if not math.isfinite(result):
            raise ArithmeticError(f"Division resulted in non-finite value: {result}")
        
        return result
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error in divide({a}, {b}): {e}")
        raise
```

## Key Techniques

### 1. Input Validation

**Never trust external input** - validate everything at system boundaries.

```javascript
// BAD: Trusting user input
function processUserData(userData) {
  const age = userData.age;
  const email = userData.email;

  sendEmail(email, `You are ${age} years old`);
}

// GOOD: Defensive validation
function processUserData(userData) {
  // Validate input exists
  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid user data: expected an object");
  }

  // Validate age
  const age = parseInt(userData.age, 10);
  if (isNaN(age) || age < 0 || age > 150) {
    throw new Error(`Invalid age: ${userData.age}`);
  }

  // Validate email
  const email = userData.email;
  if (typeof email !== "string" || !isValidEmail(email)) {
    throw new Error(`Invalid email: ${userData.email}`);
  }

  // Additional security: sanitize inputs
  const sanitizedEmail = sanitizeEmail(email);

  try {
    sendEmail(sanitizedEmail, `You are ${age} years old`);
  } catch (error) {
    logger.error("Failed to send email", { error, email: sanitizedEmail });
    // Graceful degradation - don't crash the app
    notifyUser("Email notification failed, but your data was processed");
  }
}

function isValidEmail(email) {
  // Comprehensive email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}
```

### 2. Guard Clauses

Use early returns to handle edge cases and invalid states.

```ruby
# BAD: Nested conditionals
def process_order(user, order, payment_method)
  if user
    if user.active?
      if order
        if order.valid?
          if payment_method
            if payment_method.valid?
              # Actual logic buried deep
              order.process!
            end
          end
        end
      end
    end
  end
end

# GOOD: Guard clauses
def process_order(user, order, payment_method)
  # Guard against nil values
  raise ArgumentError, "User is required" if user.nil?
  raise ArgumentError, "Order is required" if order.nil?
  raise ArgumentError, "Payment method is required" if payment_method.nil?
  
  # Guard against invalid states
  raise InactiveUserError, "User account is inactive" unless user.active?
  raise InvalidOrderError, "Order validation failed: #{order.errors}" unless order.valid?
  raise PaymentError, "Invalid payment method" unless payment_method.valid?
  
  # Guard against business rules
  raise InsufficientFundsError, "Insufficient funds" unless payment_method.has_funds?(order.total)
  raise OrderLimitError, "Order exceeds user limit" if user.exceeds_order_limit?(order)
  
  # Main logic is now clear and uncluttered
  begin
    payment_method.charge(order.total)
    order.process!
    send_confirmation_email(user, order)
  rescue PaymentGatewayError => e
    # Defensive error handling
    order.mark_as_failed!
    refund_if_necessary(payment_method, order)
    raise OrderProcessingError, "Payment failed: #{e.message}"
  end
end
```

### 3. Defensive Copying

Protect internal state from external modification.

```java
public class ShoppingCart {
    private final List<Item> items = new ArrayList<>();
    
    // BAD: Exposing internal state
    public List<Item> getItemsBad() {
        return items; // Caller can modify our internal list!
    }
    
    // GOOD: Defensive copying
    public List<Item> getItems() {
        // Return a copy to prevent external modification
        return new ArrayList<>(items);
    }
    
    // BETTER: Return immutable view
    public List<Item> getItemsImmutable() {
        return Collections.unmodifiableList(new ArrayList<>(items));
    }
    
    // Also defensive on input
    public void setItems(List<Item> newItems) {
        if (newItems == null) {
            throw new IllegalArgumentException("Items list cannot be null");
        }
        
        // Clear and copy to prevent external list affecting us
        this.items.clear();
        for (Item item : newItems) {
            if (item == null) {
                throw new IllegalArgumentException("Item cannot be null");
            }
            // Defensive copy of each item if mutable
            this.items.add(new Item(item));
        }
    }
}
```

### 4. Fail-Safe Defaults

Always provide safe defaults and fallback behaviors.

```typescript
interface Config {
  timeout?: number;
  retries?: number;
  apiUrl?: string;
  debug?: boolean;
}

class ApiClient {
  private config: Required<Config>;

  constructor(userConfig: Config = {}) {
    // Defensive defaults
    this.config = {
      timeout: userConfig.timeout ?? 30000, // 30 seconds
      retries: userConfig.retries ?? 3, // 3 attempts
      apiUrl: userConfig.apiUrl ?? "https://api.example.com",
      debug: userConfig.debug ?? false,
    };

    // Validate configuration
    this.validateConfig();
  }

  private validateConfig() {
    if (this.config.timeout <= 0 || this.config.timeout > 300000) {
      throw new Error("Timeout must be between 1ms and 5 minutes");
    }

    if (this.config.retries < 0 || this.config.retries > 10) {
      throw new Error("Retries must be between 0 and 10");
    }

    try {
      new URL(this.config.apiUrl); // Validate URL format
    } catch {
      throw new Error(`Invalid API URL: ${this.config.apiUrl}`);
    }
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    // Defensive timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout ?? this.config.timeout,
    );

    try {
      return await this.performRequest(endpoint, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new TimeoutError(`Request timed out after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
```

### 5. Assertions and Contracts

Use assertions to verify assumptions and maintain invariants.

```python
class BankAccount:
    def __init__(self, account_number: str, initial_balance: Decimal = Decimal('0')):
        # Preconditions
        assert isinstance(account_number, str), "Account number must be a string"
        assert len(account_number) == 10, "Account number must be 10 characters"
        assert isinstance(initial_balance, Decimal), "Balance must be Decimal"
        assert initial_balance >= 0, "Initial balance cannot be negative"
        
        self._account_number = account_number
        self._balance = initial_balance
        self._transaction_history = []
        
        # Postcondition
        assert self._check_invariants()
    
    def deposit(self, amount: Decimal) -> None:
        # Preconditions
        if not isinstance(amount, Decimal):
            raise TypeError(f"Amount must be Decimal, got {type(amount)}")
        if amount <= 0:
            raise ValueError(f"Deposit amount must be positive, got {amount}")
        if amount > Decimal('1000000'):
            raise ValueError("Single deposit cannot exceed $1,000,000")
        
        # Store original state for rollback
        original_balance = self._balance
        
        try:
            # Perform operation
            self._balance += amount
            self._transaction_history.append({
                'type': 'deposit',
                'amount': amount,
                'timestamp': datetime.now(),
                'balance_after': self._balance
            })
            
            # Postconditions
            assert self._balance == original_balance + amount
            assert self._check_invariants()
            
        except Exception as e:
            # Defensive rollback
            self._balance = original_balance
            logger.error(f"Deposit failed for account {self._account_number}: {e}")
            raise
    
    def _check_invariants(self) -> bool:
        """Verify class invariants."""
        # Balance should never be negative
        if self._balance < 0:
            return False
        
        # Transaction history should be consistent
        if self._transaction_history:
            last_transaction = self._transaction_history[-1]
            if last_transaction['balance_after'] != self._balance:
                return False
        
        return True
```

## Security-Focused Defensive Programming

### SQL Injection Prevention

```php
class UserRepository {
    private $db;
    
    // BAD: Vulnerable to SQL injection
    public function findUserBad($username) {
        $sql = "SELECT * FROM users WHERE username = '" . $username . "'";
        return $this->db->query($sql);
    }
    
    // GOOD: Defensive against SQL injection
    public function findUser($username) {
        // Input validation
        if (!is_string($username) || empty($username)) {
            throw new InvalidArgumentException('Username must be a non-empty string');
        }
        
        // Length check
        if (strlen($username) > 50) {
            throw new InvalidArgumentException('Username too long');
        }
        
        // Character validation
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
            throw new InvalidArgumentException('Username contains invalid characters');
        }
        
        // Use prepared statements
        $stmt = $this->db->prepare('SELECT * FROM users WHERE username = :username LIMIT 1');
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        
        try {
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Defensive result handling
            if ($user === false) {
                return null;
            }
            
            // Validate retrieved data
            if (!$this->isValidUserData($user)) {
                throw new DataIntegrityException('Invalid user data in database');
            }
            
            return $user;
        } catch (PDOException $e) {
            // Log but don't expose database errors
            error_log("Database error: " . $e->getMessage());
            throw new DatabaseException('Failed to retrieve user');
        }
    }
}
```

### XSS Prevention

```javascript
class ContentRenderer {
  // BAD: Vulnerable to XSS
  renderContentBad(userContent) {
    document.getElementById("content").innerHTML = userContent;
  }

  // GOOD: Defensive against XSS
  renderContent(userContent) {
    // Validate input type
    if (typeof userContent !== "string") {
      console.error("Content must be a string");
      return;
    }

    // Sanitize HTML
    const sanitized = this.sanitizeHtml(userContent);

    // Use safe DOM manipulation
    const element = document.getElementById("content");
    if (!element) {
      console.error("Content element not found");
      return;
    }

    // Clear existing content safely
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    // Create text node (automatically escapes)
    const textNode = document.createTextNode(sanitized);
    element.appendChild(textNode);
  }

  sanitizeHtml(html) {
    // Whitelist allowed tags
    const allowedTags = ["p", "br", "strong", "em"];
    const allowedAttributes = [];

    // Use DOMPurify or similar library in production
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
    });
  }
}
```

## Balancing Defensive Programming

### When to be Defensive vs. When to Fail Fast

```go
// Internal API - Fail fast
func calculateInternalMetric(data []float64) float64 {
    if len(data) == 0 {
        panic("calculateInternalMetric: empty data slice")
    }
    
    // Assume data is valid from internal source
    sum := 0.0
    for _, v := range data {
        sum += v
    }
    return sum / float64(len(data))
}

// External API - Defensive programming
func CalculateUserMetric(userData json.RawMessage) (float64, error) {
    // Defensive parsing
    var data []float64
    if err := json.Unmarshal(userData, &data); err != nil {
        return 0, fmt.Errorf("invalid JSON data: %w", err)
    }
    
    // Defensive validation
    if len(data) == 0 {
        return 0, errors.New("no data provided")
    }
    
    if len(data) > 10000 {
        return 0, errors.New("too many data points (max 10000)")
    }
    
    // Validate each value
    sum := 0.0
    for i, v := range data {
        if math.IsNaN(v) || math.IsInf(v, 0) {
            return 0, fmt.Errorf("invalid value at index %d", i)
        }
        if v < -1e6 || v > 1e6 {
            return 0, fmt.Errorf("value at index %d out of range", i)
        }
        sum += v
    }
    
    result := sum / float64(len(data))
    
    // Defensive output validation
    if math.IsNaN(result) || math.IsInf(result, 0) {
        return 0, errors.New("calculation resulted in invalid value")
    }
    
    return result, nil
}
```

### Avoiding Over-Defensive Code

```csharp
// OVER-DEFENSIVE: Too many unnecessary checks
public class OverDefensiveCalculator {
    public int Add(int? a, int? b) {
        // Excessive null checking
        if (!a.HasValue) {
            a = 0;  // Hiding the error
        }
        if (!b.HasValue) {
            b = 0;  // Hiding the error
        }
        
        // Unnecessary range checking for addition
        if (a.Value < -1000000 || a.Value > 1000000) {
            a = 0;  // Arbitrary limits
        }
        if (b.Value < -1000000 || b.Value > 1000000) {
            b = 0;  // Arbitrary limits
        }
        
        // Overflow check that's already handled by .NET
        try {
            return checked(a.Value + b.Value);
        } catch (OverflowException) {
            return 0;  // Hiding overflow
        }
    }
}

// APPROPRIATELY DEFENSIVE: Balanced approach
public class BalancedCalculator {
    public int Add(int a, int b) {
        // Let overflow exceptions bubble up
        // Caller can handle if needed
        return checked(a + b);
    }
    
    public int SafeAdd(int a, int b, out bool overflow) {
        overflow = false;
        try {
            return checked(a + b);
        } catch (OverflowException) {
            overflow = true;
            return a > 0 ? int.MaxValue : int.MinValue;
        }
    }
}
```

## Testing Defensive Code

```python
import pytest
from unittest.mock import Mock, patch

class TestDefensiveUserService:
    def test_validates_email_format(self, user_service):
        """Test email validation is defensive"""
        invalid_emails = [
            None,
            "",
            "not-an-email",
            "@example.com",
            "user@",
            "user @example.com",
            "user@example",
            "a" * 255 + "@example.com"  # Too long
        ]
        
        for email in invalid_emails:
            with pytest.raises(ValidationError) as exc:
                user_service.create_user(email=email, name="Test")
            assert "email" in str(exc.value).lower()
    
    def test_handles_database_errors_gracefully(self, user_service):
        """Test defensive database error handling"""
        with patch.object(user_service.db, 'save') as mock_save:
            mock_save.side_effect = DatabaseConnectionError("Connection lost")
            
            with pytest.raises(ServiceUnavailableError) as exc:
                user_service.create_user(email="test@example.com", name="Test")
            
            # Should not expose internal database error
            assert "Connection lost" not in str(exc.value)
            assert "temporarily unavailable" in str(exc.value).lower()
    
    def test_sanitizes_user_input(self, user_service):
        """Test input sanitization"""
        malicious_inputs = [
            "<script>alert('xss')</script>",
            "'; DROP TABLE users; --",
            "../../../etc/passwd",
            "%0d%0aSet-Cookie: session=hijacked"
        ]
        
        for malicious_input in malicious_inputs:
            user = user_service.create_user(
                email="test@example.com",
                name=malicious_input
            )
            
            # Verify input was sanitized
            assert "<script>" not in user.name
            assert "DROP TABLE" not in user.name
            assert "../" not in user.name
            assert "%0d%0a" not in user.name
    
    def test_rate_limiting(self, user_service):
        """Test defensive rate limiting"""
        # Create many requests rapidly
        for i in range(10):
            user_service.create_user(
                email=f"test{i}@example.com",
                name="Test"
            )
        
        # 11th request should be rate limited
        with pytest.raises(RateLimitError):
            user_service.create_user(
                email="test11@example.com",
                name="Test"
            )
```

## Best Practices

### 1. Log Defensively

```python
import logging
import json
from typing import Any, Dict

class DefensiveLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_error(self, message: str, context: Dict[str, Any] = None):
        """Defensively log errors with context"""
        try:
            # Sanitize message
            safe_message = str(message)[:1000]  # Limit length
            
            # Sanitize context
            safe_context = {}
            if context:
                for key, value in context.items():
                    if key in ['password', 'token', 'secret', 'api_key']:
                        safe_context[key] = '[REDACTED]'
                    else:
                        # Safely convert to string
                        try:
                            safe_context[key] = str(value)[:500]
                        except Exception:
                            safe_context[key] = '[UNSERIALIZABLE]'
            
            self.logger.error(
                safe_message,
                extra={'context': json.dumps(safe_context)}
            )
            
        except Exception as log_error:
            # Even logging can fail - don't crash the app
            print(f"Logging failed: {log_error}")
```

### 2. Defensive Configuration

```yaml
# config.yaml with defensive defaults
server:
  port: ${PORT:8080} # Default to 8080
  timeout: ${TIMEOUT:30} # Default 30 seconds
  max_connections: ${MAX_CONN:100} # Limit connections

security:
  enable_auth: ${ENABLE_AUTH:true} # Secure by default
  min_password_length: ${MIN_PASS_LEN:12} # Strong passwords
  session_timeout: ${SESSION_TIMEOUT:3600} # 1 hour
  rate_limit: ${RATE_LIMIT:100} # Requests per minute

features:
  experimental: ${EXPERIMENTAL:false} # Opt-in for risky features
  debug_mode: ${DEBUG:false} # Production safe
```

### 3. Defensive API Design

```typescript
interface DefensiveApiOptions {
  timeout?: number;
  retries?: number;
  validateResponse?: boolean;
}

class DefensiveApiClient {
  async get<T>(
    url: string,
    options: DefensiveApiOptions = {},
  ): Promise<T> {
    // Defensive defaults
    const config = {
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 3,
      validateResponse: options.validateResponse ?? true,
    };

    // Input validation
    if (!url || typeof url !== "string") {
      throw new Error("URL must be a non-empty string");
    }

    let lastError: Error;

    // Retry logic
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, config.timeout);

        // Defensive response handling
        if (!response.ok) {
          throw new HttpError(response.status, response.statusText);
        }

        const data = await response.json();

        // Validate response if requested
        if (config.validateResponse) {
          this.validateResponse<T>(data);
        }

        return data as T;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors
        if (error instanceof HttpError && error.status < 500) {
          throw error;
        }

        // Log retry attempts
        if (attempt < config.retries) {
          console.warn(`Retry ${attempt + 1}/${config.retries} for ${url}`);
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    throw new Error(`Failed after ${config.retries} retries: ${lastError.message}`);
  }
}
```

## Conclusion

Defensive programming is about finding the right balance between:

1. **Paranoia and Pragmatism**: Defend against likely problems, not imaginary ones
2. **Safety and Performance**: Add checks where they matter most
3. **Robustness and Simplicity**: Make code resilient without making it unreadable
4. **Failing Fast and Graceful Degradation**: Know when to stop and when to continue

Key principles to remember:

- **Never trust external input**
- **Validate at boundaries**
- **Handle errors explicitly**
- **Provide safe defaults**
- **Test the defensive measures**
- **Log sufficient context**
- **Keep security in mind**

Defensive programming is not about writing paranoid code—it's about writing code that behaves predictably and safely in
an unpredictable world.
