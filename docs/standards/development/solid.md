## SOLID Principles

### Quick Reference

SOLID principles guide object-oriented design for maintainable, flexible code:

1. **🔒 S**ingle Responsibility Principle (SRP)
2. **🔓 O**pen/Closed Principle (OCP)
3. **🔄 L**iskov Substitution Principle (LSP)
4. **🎯 I**nterface Segregation Principle (ISP)
5. **🔀 D**ependency Inversion Principle (DIP)

### Single Responsibility Principle (SRP)

**"A class should have only one reason to change"**

#### ✅ Good: Single Responsibility

```typescript
// ✅ Good: User class only handles user data
class User {
  constructor(
    private id: string,
    private email: string,
    private name: string,
  ) {}

  getId(): string {
    return this.id;
  }
  getEmail(): string {
    return this.email;
  }
  getName(): string {
    return this.name;
  }
  updateEmail(email: string): void {
    this.email = email;
  }
}

// ✅ Good: Separate class for user persistence
class UserRepository {
  async save(user: User): Promise<void> {
    await database.users.insert({
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
    });
  }

  async findById(id: string): Promise<User | null> {
    const userData = await database.users.findOne({ id });
    return userData
      ? new User(userData.id, userData.email, userData.name)
      : null;
  }
}

// ✅ Good: Separate class for email notifications
class EmailService {
  async sendWelcomeEmail(user: User): Promise<void> {
    await emailProvider.send({
      to: user.getEmail(),
      subject: "Welcome!",
      body: `Hello ${user.getName()}, welcome to our platform!`,
    });
  }
}
```

#### ❌ Bad: Multiple Responsibilities

```typescript
// ❌ Bad: User class doing too much
class User {
  constructor(
    private id: string,
    private email: string,
    private name: string,
  ) {}

  // User data responsibility
  getEmail(): string {
    return this.email;
  }

  // Database responsibility - violates SRP
  async save(): Promise<void> {
    await database.users.insert(this);
  }

  // Email responsibility - violates SRP
  async sendWelcomeEmail(): Promise<void> {
    await emailProvider.send({
      to: this.email,
      subject: "Welcome!",
      body: `Hello ${this.name}!`,
    });
  }

  // Validation responsibility - violates SRP
  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }
}
```

### Open/Closed Principle (OCP)

**"Software entities should be open for extension, but closed for
modification"**

#### ✅ Good: Extensible Design

```typescript
// ✅ Good: Abstract payment processor
abstract class PaymentProcessor {
  abstract processPayment(amount: number): Promise<PaymentResult>;

  async chargeCustomer(amount: number): Promise<boolean> {
    const result = await this.processPayment(amount);
    return result.success;
  }
}

// ✅ Good: Extend without modifying existing code
class CreditCardProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<PaymentResult> {
    return await creditCardGateway.charge(amount);
  }
}

class PayPalProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<PaymentResult> {
    return await paypalApi.processPayment(amount);
  }
}

class CryptoProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<PaymentResult> {
    return await blockchainNetwork.transfer(amount);
  }
}

// ✅ Good: Payment service uses abstraction
class PaymentService {
  constructor(private processor: PaymentProcessor) {}

  async processOrder(order: Order): Promise<boolean> {
    return await this.processor.chargeCustomer(order.total);
  }
}
```

#### ❌ Bad: Modification Required for Extension

```typescript
// ❌ Bad: Requires modification to add new payment types
class PaymentService {
  async processPayment(amount: number, type: string): Promise<boolean> {
    if (type === "credit-card") {
      return await creditCardGateway.charge(amount);
    } else if (type === "paypal") {
      return await paypalApi.processPayment(amount);
    } else if (type === "crypto") {
      // New requirement forces modification of existing code
      return await blockchainNetwork.transfer(amount);
    }
    throw new Error("Unsupported payment type");
  }
}
```

### Liskov Substitution Principle (LSP)

**"Objects of a superclass should be replaceable with objects of any subclass
without breaking the application"**

#### ✅ Good: Proper Inheritance

```typescript
// ✅ Good: Rectangle base class
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  getWidth(): number {
    return this.width;
  }
  getHeight(): number {
    return this.height;
  }

  setWidth(width: number): void {
    this.width = width;
  }
  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

// ✅ Good: Square follows LSP by maintaining Rectangle contract
class Square extends Rectangle {
  constructor(side: number) {
    super(side, side);
  }

  setWidth(width: number): void {
    this.width = width;
    this.height = width; // Maintain square property
  }

  setHeight(height: number): void {
    this.width = height; // Maintain square property
    this.height = height;
  }
}

// ✅ Good: Code works with both Rectangle and Square
function calculateArea(rectangle: Rectangle): number {
  return rectangle.getArea(); // Works correctly for both types
}
```

#### Better: Composition over Inheritance

```typescript
// ✅ Better: Use composition to avoid LSP violations
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea(): number {
    return this.width * this.height;
  }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea(): number {
    return this.side * this.side;
  }
}
```

### Interface Segregation Principle (ISP)

**"No client should be forced to depend on methods it does not use"**

#### ✅ Good: Segregated Interfaces

```typescript
// ✅ Good: Specific, focused interfaces
interface Readable {
  read(): string;
}

interface Writable {
  write(data: string): void;
}

interface Seekable {
  seek(position: number): void;
}

// ✅ Good: Classes implement only what they need
class FileReader implements Readable {
  read(): string {
    return "file contents";
  }
}

class FileWriter implements Writable {
  write(data: string): void {
    // Write to file
  }
}

class RandomAccessFile implements Readable, Writable, Seekable {
  read(): string {
    return "data";
  }
  write(data: string): void {/* write */}
  seek(position: number): void {/* seek */}
}

// ✅ Good: Console only needs what it uses
class Console implements Writable {
  write(data: string): void {
    console.log(data);
  }
  // No need to implement read() or seek()
}
```

#### ❌ Bad: Fat Interface

```typescript
// ❌ Bad: Fat interface forces unnecessary implementations
interface FileHandler {
  read(): string;
  write(data: string): void;
  seek(position: number): void;
  compress(): void;
  encrypt(): void;
}

// ❌ Bad: Console forced to implement methods it doesn't need
class Console implements FileHandler {
  read(): string {
    throw new Error("Not supported");
  }
  write(data: string): void {
    console.log(data);
  }
  seek(position: number): void {
    throw new Error("Not supported");
  }
  compress(): void {
    throw new Error("Not supported");
  }
  encrypt(): void {
    throw new Error("Not supported");
  }
}
```

### Dependency Inversion Principle (DIP)

**"Depend upon abstractions, not concretions"**

#### ✅ Good: Dependency Inversion

```typescript
// ✅ Good: Abstract notification interface
interface NotificationService {
  send(message: string, recipient: string): Promise<void>;
}

// ✅ Good: Concrete implementations depend on abstraction
class EmailNotificationService implements NotificationService {
  async send(message: string, recipient: string): Promise<void> {
    await emailProvider.send(recipient, message);
  }
}

class SMSNotificationService implements NotificationService {
  async send(message: string, recipient: string): Promise<void> {
    await smsProvider.send(recipient, message);
  }
}

// ✅ Good: High-level class depends on abstraction
class UserService {
  constructor(private notificationService: NotificationService) {}

  async createUser(userData: UserData): Promise<User> {
    const user = new User(userData);
    await this.userRepository.save(user);

    // Depends on abstraction, not concrete implementation
    await this.notificationService.send("Welcome!", user.email);

    return user;
  }
}

// ✅ Good: Dependency injection at runtime
const emailNotifier = new EmailNotificationService();
const userService = new UserService(emailNotifier);
```

#### ❌ Bad: Direct Dependencies

```typescript
// ❌ Bad: High-level class depends on concrete implementation
class UserService {
  private emailService = new EmailService(); // Direct dependency

  async createUser(userData: UserData): Promise<User> {
    const user = new User(userData);
    await this.userRepository.save(user);

    // Tightly coupled to email implementation
    await this.emailService.sendEmail("Welcome!", user.email);

    return user;
  }
}
```

### SOLID in Practice

#### Dependency Injection Container

```typescript
// ✅ Good: Use DI container for SOLID compliance
class DIContainer {
  private services = new Map<string, any>();

  register<T>(name: string, implementation: T): void {
    this.services.set(name, implementation);
  }

  resolve<T>(name: string): T {
    return this.services.get(name);
  }
}

// Setup
const container = new DIContainer();
container.register<NotificationService>(
  "notification",
  new EmailNotificationService(),
);
container.register<UserRepository>("userRepo", new DatabaseUserRepository());

// Usage
const userService = new UserService(
  container.resolve<NotificationService>("notification"),
  container.resolve<UserRepository>("userRepo"),
);
```

#### Testing Benefits

```typescript
// ✅ Good: SOLID principles enable easy testing
describe("UserService", () => {
  it("should send notification when creating user", async () => {
    // Easy to mock due to dependency inversion
    const mockNotificationService: NotificationService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const userService = new UserService(mockNotificationService);
    await userService.createUser({ email: "test@example.com", name: "Test" });

    expect(mockNotificationService.send).toHaveBeenCalledWith(
      "Welcome!",
      "test@example.com",
    );
  });
});
```

### Benefits of SOLID

1. **Maintainability**: Changes are localized and predictable
2. **Testability**: Easy to mock dependencies and test in isolation
3. **Flexibility**: New features can be added without modifying existing code
4. **Reusability**: Components can be reused in different contexts
5. **Understandability**: Each class has a clear, single purpose

### Common Violations and Solutions

#### God Class (SRP Violation)

```typescript
// ❌ Problem: One class doing everything
class Application {
  handleRequest() {/* ... */}
  validateInput() {/* ... */}
  saveToDatabase() {/* ... */}
  sendEmail() {/* ... */}
  generateReport() {/* ... */}
}

// ✅ Solution: Separate responsibilities
class RequestHandler {/* ... */}
class InputValidator {/* ... */}
class DatabaseService {/* ... */}
class EmailService {/* ... */}
class ReportGenerator {/* ... */}
```

Remember: SOLID principles work together to create code that is easier to
maintain, test, and extend. Apply them thoughtfully to avoid over-engineering
while ensuring your code remains flexible and robust.
