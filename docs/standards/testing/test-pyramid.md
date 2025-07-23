## Test Pyramid

### Quick Reference

The Test Pyramid is a testing strategy that emphasizes:

1. **🔺 Unit Tests** (Base) - Fast, isolated, numerous

2. **🔧 Integration Tests** (Middle) - Moderate speed, fewer than unit tests

3. **🌐 E2E Tests** (Top) - Slow, comprehensive, minimal

### Core Principles

#### Layer Distribution

````text
    /\     ← E2E Tests (Few)
   /  \
  /    \   ← Integration Tests (Some)
 /      \
/********\ ← Unit Tests (Many)
```text

#### Unit Tests (Foundation)

```typescript
// ✅ Good: Fast, isolated unit tests
describe("EmailValidator", () => {
  it("should validate correct email format", () => {
    const validator = new EmailValidator();
    expect(validator.isValid("test@example.com")).toBe(true);
    expect(validator.isValid("invalid-email")).toBe(false);
  });
});

// ✅ Good: Testing pure functions
describe("calculateDiscount", () => {
  it("should apply percentage discount correctly", () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
    expect(calculateDiscount(50, 0.2)).toBe(40);
  });
});
```text

#### Integration Tests (Middle Layer)

```typescript
// ✅ Good: Testing component interactions
describe("UserService Integration", () => {
  it("should create user and save to database", async () => {
    const userService = new UserService(testDatabase);
    const user = await userService.createUser({
      email: "test@example.com",
      name: "Test User",
    });

    const savedUser = await testDatabase.findById(user.id);
    expect(savedUser.email).toBe("test@example.com");
  });
});

// ✅ Good: API endpoint testing
describe("POST /api/users", () => {
  it("should create user via API", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "test@example.com", name: "Test User" })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.email).toBe("test@example.com");
  });
});
```text

#### End-to-End Tests (Peak)

```typescript
// ✅ Good: Critical user journey testing
describe("User Registration Flow", () => {
  it("should complete full registration process", async () => {
    // Navigate to registration
    await page.goto("/register");

    // Fill form
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "SecurePass123");
    await page.click('[data-testid="submit"]');

    // Verify success
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();

    // Verify email sent
    const emails = await getTestEmails();
    expect(emails).toContainEqual(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Welcome to our platform",
      }),
    );
  });
});
```text

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
describe("Every possible user interaction", () => {
  it("should test button click via browser", async () => {
    // This should be a unit test
  });

  it("should test form validation via browser", async () => {
    // This should be a unit test
  });
});
```text

#### Testing Trophy (No Strategy)

```typescript
// ❌ Bad: Random test distribution without strategy
// No clear boundaries between test types
// Overlapping responsibilities
```text

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
it("should calculate total with tax", () => {
  const calculator = new PriceCalculator();
  const items = [{ price: 100 }, { price: 50 }];
  expect(calculator.calculateTotal(items, 0.1)).toBe(165);
});
```text

#### Add Integration Tests

```typescript
// 2. Test component interactions
describe("Order Processing", () => {
  it("should process order end-to-end", async () => {
    const order = await orderService.createOrder(orderData);
    const payment = await paymentService.processPayment(order.total);
    const shipment = await shippingService.scheduleShipment(order.id);

    expect(order.status).toBe("confirmed");
    expect(payment.status).toBe("completed");
    expect(shipment.estimatedDelivery).toBeDefined();
  });
});
```text

#### Minimal E2E Tests

```typescript
// 3. Test critical user journeys only
describe("Critical Business Flows", () => {
  it("should complete purchase journey", async () => {
    // Only test the most important paths
    await completePurchaseFlow();
    await verifyOrderConfirmation();
    await verifyEmailNotification();
  });
});
```text

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
  unitTests: "90%+",
  integrationTests: "80%+",
  e2eTests: "Critical paths only",
};
```text

#### Test Performance

```typescript
// Monitor test execution times
const performanceTargets = {
  unitTestSuite: "< 30 seconds",
  integrationTestSuite: "< 5 minutes",
  e2eTestSuite: "< 30 minutes",
};
```text

### CI/CD Integration

#### Pipeline Strategy

```yaml
# Run in order of speed and reliability
stages:

  - unit-tests # Fast feedback

  - integration # Moderate feedback

  - e2e-critical # Slow but comprehensive

  - e2e-full # Complete coverage (scheduled)
```text

Remember: The Test Pyramid ensures fast feedback while maintaining confidence in
your system. Focus on a solid foundation of unit tests, supported by targeted
integration tests, topped with minimal but comprehensive E2E tests.
````
