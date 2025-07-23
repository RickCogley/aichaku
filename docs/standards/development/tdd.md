## Test-Driven Development (TDD)

### Quick Reference

TDD follows a simple three-step cycle:

1. **🔴 Red** - Write a failing test

2. **🟢 Green** - Write minimal code to make it pass

3. **🔵 Refactor** - Improve the code while keeping tests green

### Core Principles

#### Write Tests First

````typescript
// ✅ Good: Test first approach
describe("UserService", () => {
  it("should create a user with valid data", async () => {
    const userData = { email: "test@example.com", name: "Test User" };
    const user = await userService.createUser(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
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
      createdAt: new Date(),
    };
  }
}
```text

#### Test Behavior, Not Implementation

```typescript
// ✅ Good: Testing behavior
describe("Calculator", () => {
  it("should add two numbers correctly", () => {
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });

  it("should handle decimal numbers", () => {
    const result = calculator.add(0.1, 0.2);
    expect(result).toBeCloseTo(0.3);
  });
});

// ❌ Bad: Testing implementation details
describe("Calculator", () => {
  it("should call the internal sum method", () => {
    const spy = jest.spyOn(calculator, "sum");
    calculator.add(2, 3);
    expect(spy).toHaveBeenCalled();
  });
});
```text

### The TDD Cycle in Practice

#### 1. Red Phase - Write a Failing Test

```typescript
// Start with a failing test
describe("Order", () => {
  it("should calculate total with tax", () => {
    const order = new Order([
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ]);

    const total = order.calculateTotal(0.1); // 10% tax
    expect(total).toBe(275); // (200 + 50) * 1.1
  });
});

// This will fail because Order class doesn't exist yet
```text

#### 2. Green Phase - Make It Pass

```typescript
// Write minimal code to make the test pass
class Order {
  constructor(private items: OrderItem[]) {}

  calculateTotal(taxRate: number): number {
    const subtotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return subtotal * (1 + taxRate);
  }
}
```text

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
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  private applyTax(amount: number, rate: number): number {
    return amount * (1 + rate);
  }
}
```text

### TDD Best Practices

#### Test Structure (AAA Pattern)

```typescript
describe("UserValidator", () => {
  it("should reject invalid email addresses", () => {
    // Arrange
    const validator = new UserValidator();
    const invalidEmail = "not-an-email";

    // Act
    const result = validator.validateEmail(invalidEmail);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid email format");
  });
});
```text

#### One Assert Per Test

```typescript
// ✅ Good: Single assertion
it("should create user with correct email", () => {
  const user = userService.createUser({ email: "test@example.com" });
  expect(user.email).toBe("test@example.com");
});

it("should create user with generated ID", () => {
  const user = userService.createUser({ email: "test@example.com" });
  expect(user.id).toBeDefined();
});

// ❌ Bad: Multiple assertions
it("should create user correctly", () => {
  const user = userService.createUser({ email: "test@example.com" });
  expect(user.email).toBe("test@example.com");
  expect(user.id).toBeDefined();
  expect(user.createdAt).toBeInstanceOf(Date);
});
```text

#### Test Naming Convention

```typescript
// ✅ Good: Descriptive test names
describe("EmailService", () => {
  describe("sendEmail", () => {
    it("should send email successfully with valid data", () => {});
    it("should throw error when recipient is invalid", () => {});
    it("should retry sending on temporary failure", () => {});
  });
});
```text

### Testing Different Scenarios

#### Happy Path Testing

```typescript
it("should successfully process valid order", async () => {
  const order = createValidOrder();
  const result = await orderService.processOrder(order);

  expect(result.status).toBe("processed");
  expect(result.orderId).toBeDefined();
});
```text

#### Edge Cases

```typescript
it("should handle empty order", async () => {
  const emptyOrder = new Order([]);
  const result = await orderService.processOrder(emptyOrder);

  expect(result.status).toBe("error");
  expect(result.error).toBe("Order cannot be empty");
});

it("should handle extremely large orders", async () => {
  const largeOrder = createOrderWithItems(10000);
  const result = await orderService.processOrder(largeOrder);

  expect(result.status).toBe("processed");
});
```text

#### Error Conditions

```typescript
it("should handle payment failure gracefully", async () => {
  const order = createValidOrder();
  mockPaymentService.processPayment.mockRejectedValue(
    new PaymentError("Card declined"),
  );

  const result = await orderService.processOrder(order);

  expect(result.status).toBe("payment_failed");
  expect(result.error).toBe("Payment processing failed");
});
```text

### Mocking and Test Doubles

#### Dependency Injection for Testability

```typescript
// ✅ Good: Injectable dependencies
class OrderService {
  constructor(
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private emailService: EmailService,
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // Implementation
  }
}

// Test with mocks
describe("OrderService", () => {
  let orderService: OrderService;
  let mockPaymentService: jest.Mocked<PaymentService>;

  beforeEach(() => {
    mockPaymentService = {
      processPayment: jest.fn(),
    };

    orderService = new OrderService(
      mockPaymentService,
      mockInventoryService,
      mockEmailService,
    );
  });
});
```text

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
it("should call private validation method", () => {
  const spy = jest.spyOn(service, "validateInternal");
  service.process(data);
  expect(spy).toHaveBeenCalled();
});
```text

#### Writing Tests After Code

```typescript
// ❌ Bad: Tests written after implementation
// This often results in tests that just confirm what the code does,
// not what it should do
```text

#### Over-Mocking

```typescript
// ❌ Bad: Mocking everything
it("should process order", () => {
  const mockOrder = { id: 1 };
  const mockResult = { status: "success" };

  jest.spyOn(orderService, "processOrder").mockResolvedValue(mockResult);

  const result = orderService.processOrder(mockOrder);
  expect(result).resolves.toBe(mockResult);
  // This test doesn't verify any real behavior
});
```text

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
```text

Remember: TDD is not just about testing - it's a design methodology that leads
to better, more maintainable code through the discipline of writing tests first.
````
