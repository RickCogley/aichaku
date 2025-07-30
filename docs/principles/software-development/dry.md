# DRY (Don't Repeat Yourself)

## Overview

The DRY principle states that "Every piece of knowledge must have a single, unambiguous, authoritative representation
within a system." Originally formulated by Andy Hunt and Dave Thomas in "The Pragmatic Programmer," DRY is about
reducing repetition of information of all kinds, not just code.

## Core Concept

When the DRY principle is applied successfully, a modification of any single element of a system does not require a
change in other logically unrelated elements. Additionally, elements that are logically related all change predictably
and uniformly, and are thus kept in sync.

## Key Principles

1. **Single Source of Truth**: Each piece of knowledge should exist in only one place
2. **Logic Abstraction**: Avoid duplication of logic, not just code
3. **Appropriate Abstraction**: Abstract common functionality at the right level
4. **Automation**: Use code generation where appropriate
5. **Self-Documenting Code**: Document why, not what

## Implementation Strategies

### Code Reuse

```python
# BAD: Repeated logic
def calculate_order_total(items):
    total = 0
    for item in items:
        total += item.price * item.quantity
        if item.quantity >= 10:
            total *= 0.9  # 10% discount
    return total

def calculate_cart_total(products):
    total = 0
    for product in products:
        total += product.price * product.quantity
        if product.quantity >= 10:
            total *= 0.9  # 10% discount
    return total

# GOOD: DRY principle applied
def calculate_total(items, discount_threshold=10, discount_rate=0.1):
    total = 0
    for item in items:
        subtotal = item.price * item.quantity
        if item.quantity >= discount_threshold:
            subtotal *= (1 - discount_rate)
        total += subtotal
    return total
```

### Configuration Management

```yaml
# BAD: Hardcoded values throughout codebase
# In multiple files:
API_TIMEOUT = 30
MAX_RETRIES = 3

# GOOD: Single configuration source
# config.yaml
api:
  timeout: 30
  max_retries: 3
  base_url: "https://api.example.com"
```

### Database Normalization

```sql
-- BAD: Denormalized data with repetition
CREATE TABLE orders (
    order_id INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_address VARCHAR(200),
    product_name VARCHAR(100),
    product_price DECIMAL(10,2)
);

-- GOOD: Normalized structure following DRY
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    address VARCHAR(200)
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    product_id INT REFERENCES products(product_id)
);
```

## Common Violations and Solutions

### Copy-Paste Programming

**Violation**: Copying code blocks and making minor modifications **Solution**: Extract common functionality into
reusable functions

### Magic Numbers

**Violation**: Using literal values throughout code **Solution**: Define named constants

```javascript
// BAD
if (age >= 18) { /* ... */ }
if (score >= 70) { /* ... */ }

// GOOD
const LEGAL_AGE = 18;
const PASSING_SCORE = 70;

if (age >= LEGAL_AGE) { /* ... */ }
if (score >= PASSING_SCORE) { /* ... */ }
```

### Duplicate Validation

**Violation**: Same validation logic in multiple places **Solution**: Create validation utilities

```typescript
// BAD: Duplicate email validation
function validateLoginEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateSignupEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GOOD: Single validation function
class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

## When NOT to Apply DRY

### Performance-Critical Code

Sometimes duplication is necessary for performance:

```c
// Inlined for performance rather than calling a function
for (int i = 0; i < n; i++) {
    // Direct computation instead of function call
    result[i] = data[i] * 2 + offset;
}
```

### Test Code

Tests often benefit from being explicit rather than DRY:

```python
# Explicit test setup is often clearer than abstracted helpers
def test_user_creation():
    user = User(name="Alice", email="alice@example.com")
    assert user.name == "Alice"
    assert user.email == "alice@example.com"

def test_user_update():
    user = User(name="Bob", email="bob@example.com")
    user.update(name="Robert")
    assert user.name == "Robert"
```

### Cross-Team Boundaries

Some duplication across team boundaries can reduce coupling:

```yaml
# Team A's service
order_status:
  pending: 0
  processing: 1
  completed: 2

# Team B's service (intentional duplication for independence)
order_status:
  pending: 0
  processing: 1
  completed: 2
```

## Balancing DRY with Other Principles

### DRY vs. KISS

Sometimes making code DRY can make it more complex. Balance is key:

```python
# Too DRY (overly complex)
def process_data(data, operations):
    return reduce(lambda x, op: op(x), operations, data)

# Better balance
def process_data(data):
    data = clean_data(data)
    data = validate_data(data)
    data = transform_data(data)
    return data
```

### DRY vs. YAGNI

Don't create abstractions for potential future duplication:

```javascript
// Premature abstraction
class DataProcessor {
  process(data, type) {
    switch (type) {
      case "user":
        return this.processUser(data);
        // Only one case for now...
    }
  }
}

// Better: wait until you actually need abstraction
function processUser(data) {
  // Direct implementation
}
```

## Best Practices

1. **Rule of Three**: Consider refactoring when you see the same thing three times
2. **Meaningful Abstractions**: Create abstractions that make sense in your domain
3. **Documentation**: Document the "why" behind abstractions
4. **Refactor Continuously**: Apply DRY during refactoring, not prematurely
5. **Team Communication**: Ensure team members know about reusable components

## Tools and Techniques

- **Linters**: Tools like ESLint, Pylint can detect duplicate code
- **Code Generators**: Use scaffolding tools to maintain consistency
- **Template Engines**: Reduce HTML/view duplication
- **Build Tools**: Automate repetitive tasks
- **Documentation Generators**: Extract docs from code comments

## Conclusion

DRY is a fundamental principle that improves maintainability, reduces bugs, and clarifies system design. However, it
must be balanced with other principles and applied judiciously. The goal is not to eliminate all duplication at any
cost, but to ensure that each piece of knowledge has a single, authoritative representation that makes the system easier
to understand and modify.

## Related Concepts

### Related Principles

- **[KISS (Keep It Simple, Stupid)](../kiss.md)** - Balance DRY with simplicity
- **[YAGNI (You Aren't Gonna Need It)](../yagni.md)** - Avoid premature abstraction
- **[Single Responsibility Principle](../solid.md#single-responsibility)** - Each module should have one reason to
  change
- **[Separation of Concerns](../separation-of-concerns.md)** - Organize code by distinct features

### Compatible Methodologies

- **[Extreme Programming (XP)](../../methodologies/xp/xp.md)** - Emphasizes refactoring and code quality
- **[Lean Development](../../methodologies/lean/lean.md)** - Eliminates waste including code duplication

### Supporting Standards

- **[Clean Code](../../standards/development/clean-code.md)** - Practices for maintainable code
- **[Test-Driven Development](../../standards/development/tdd.md)** - Refactoring step naturally applies DRY

### Learn More

- Use `aichaku learn dry` for interactive examples
- Use `aichaku principles --select dry` to add to your project
- Read [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/) for the original formulation
