# SOLID Principles

## Overview

SOLID is an acronym for five design principles that help developers create more maintainable, understandable, and
flexible software. Introduced by Robert C. Martin (Uncle Bob), these principles form the foundation of clean
object-oriented design and are essential for creating robust, scalable applications.

## The Five Principles

### 1. Single Responsibility Principle (SRP)

**"A class should have one, and only one, reason to change."**

#### Concept

Each class should have only one job or responsibility. When a class has multiple responsibilities, changes to one
responsibility may affect the other, leading to unexpected bugs and harder maintenance.

#### Example Violation and Fix

```python
# BAD: Multiple responsibilities
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def save_to_database(self):
        # Database logic
        connection = DatabaseConnection()
        connection.execute(f"INSERT INTO users VALUES ('{self.name}', '{self.email}')")
    
    def send_email(self, message):
        # Email logic
        smtp = SMTPConnection()
        smtp.send(self.email, message)
    
    def validate_email(self):
        # Validation logic
        return "@" in self.email and "." in self.email

# GOOD: Single responsibility per class
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

class UserRepository:
    def save(self, user):
        connection = DatabaseConnection()
        connection.execute(f"INSERT INTO users VALUES ('{user.name}', '{user.email}')")

class EmailService:
    def send(self, email, message):
        smtp = SMTPConnection()
        smtp.send(email, message)

class EmailValidator:
    def is_valid(self, email):
        return "@" in email and "." in email
```

#### Real-World Application

```typescript
// BAD: Report class doing too much
class Report {
  constructor(private data: any[]) {}

  generateReport(): string {
    // Report generation logic
  }

  saveToFile(filename: string): void {
    // File I/O logic
  }

  sendEmail(recipient: string): void {
    // Email logic
  }

  printReport(): void {
    // Printing logic
  }
}

// GOOD: Separated concerns
class Report {
  constructor(private data: any[]) {}

  generate(): string {
    // Only report generation logic
  }
}

class ReportSaver {
  save(report: string, filename: string): void {
    // File I/O logic
  }
}

class ReportEmailer {
  send(report: string, recipient: string): void {
    // Email logic
  }
}

class ReportPrinter {
  print(report: string): void {
    // Printing logic
  }
}
```

### 2. Open/Closed Principle (OCP)

**"Software entities should be open for extension, but closed for modification."**

#### Concept

You should be able to extend a class's behavior without modifying its source code. This is typically achieved through
abstraction, inheritance, and polymorphism.

#### Example Violation and Fix

```java
// BAD: Must modify class to add new shapes
class AreaCalculator {
    public double calculateArea(Object shape) {
        if (shape instanceof Rectangle) {
            Rectangle rectangle = (Rectangle) shape;
            return rectangle.width * rectangle.height;
        } else if (shape instanceof Circle) {
            Circle circle = (Circle) shape;
            return Math.PI * circle.radius * circle.radius;
        }
        // Must modify this method to add new shapes
        return 0;
    }
}

// GOOD: Open for extension through abstraction
interface Shape {
    double calculateArea();
}

class Rectangle implements Shape {
    private double width, height;
    
    public double calculateArea() {
        return width * height;
    }
}

class Circle implements Shape {
    private double radius;
    
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

// Can add new shapes without modifying existing code
class Triangle implements Shape {
    private double base, height;
    
    public double calculateArea() {
        return 0.5 * base * height;
    }
}

class AreaCalculator {
    public double calculateArea(Shape shape) {
        return shape.calculateArea();
    }
}
```

#### Strategy Pattern Example

```javascript
// Payment processing with OCP
class PaymentProcessor {
  constructor(paymentStrategy) {
    this.strategy = paymentStrategy;
  }

  processPayment(amount) {
    return this.strategy.process(amount);
  }
}

// Payment strategies
class CreditCardPayment {
  process(amount) {
    // Credit card processing logic
    return `Processed ${amount} via credit card`;
  }
}

class PayPalPayment {
  process(amount) {
    // PayPal processing logic
    return `Processed ${amount} via PayPal`;
  }
}

// Easy to add new payment methods
class CryptoPayment {
  process(amount) {
    // Cryptocurrency processing logic
    return `Processed ${amount} via crypto`;
  }
}
```

### 3. Liskov Substitution Principle (LSP)

**"Objects of a superclass should be replaceable with objects of its subclasses without breaking the application."**

#### Concept

Derived classes must be substitutable for their base classes without altering the correctness of the program. This
ensures proper inheritance hierarchies.

#### Example Violation and Fix

```csharp
// BAD: Violates LSP
class Bird {
    public virtual void Fly() {
        Console.WriteLine("Flying");
    }
}

class Penguin : Bird {
    public override void Fly() {
        throw new NotImplementedException("Penguins can't fly!");
    }
}

// Usage breaks with Penguin
void MakeBirdFly(Bird bird) {
    bird.Fly(); // Throws exception for Penguin
}

// GOOD: Proper abstraction
interface IFlyable {
    void Fly();
}

interface ISwimmable {
    void Swim();
}

class Sparrow : IFlyable {
    public void Fly() {
        Console.WriteLine("Sparrow flying");
    }
}

class Penguin : ISwimmable {
    public void Swim() {
        Console.WriteLine("Penguin swimming");
    }
}
```

#### Rectangle-Square Problem

```python
# Classic LSP violation example
class Rectangle:
    def __init__(self, width, height):
        self._width = width
        self._height = height
    
    def set_width(self, width):
        self._width = width
    
    def set_height(self, height):
        self._height = height
    
    def area(self):
        return self._width * self._height

class Square(Rectangle):
    def set_width(self, width):
        self._width = width
        self._height = width  # Maintains square property
    
    def set_height(self, height):
        self._width = height
        self._height = height

# This function works for Rectangle but not Square
def test_rectangle(rect: Rectangle):
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20  # Fails for Square!

# BETTER: Don't use inheritance here
class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height

class Square(Shape):
    def __init__(self, side):
        self.side = side
    
    def area(self):
        return self.side * self.side
```

### 4. Interface Segregation Principle (ISP)

**"A client should not be forced to implement interfaces it doesn't use."**

#### Concept

Instead of one large interface, multiple smaller and more specific interfaces are better. Classes should not be forced
to depend on methods they do not use.

#### Example Violation and Fix

```typescript
// BAD: Fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  code(): void;
  attendMeeting(): void;
  fixBug(): void;
}

class Developer implements Worker {
  work() {/* ... */}
  eat() {/* ... */}
  sleep() {/* ... */}
  code() {/* ... */}
  attendMeeting() {/* ... */}
  fixBug() {/* ... */}
}

class Robot implements Worker {
  work() {/* ... */}
  eat() {
    throw new Error("Robots don't eat");
  }
  sleep() {
    throw new Error("Robots don't sleep");
  }
  code() {/* ... */}
  attendMeeting() {/* ... */}
  fixBug() {/* ... */}
}

// GOOD: Segregated interfaces
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

interface Codeable {
  code(): void;
  fixBug(): void;
}

interface Attendable {
  attendMeeting(): void;
}

class Developer implements Workable, Eatable, Sleepable, Codeable, Attendable {
  work() {/* ... */}
  eat() {/* ... */}
  sleep() {/* ... */}
  code() {/* ... */}
  fixBug() {/* ... */}
  attendMeeting() {/* ... */}
}

class Robot implements Workable, Codeable {
  work() {/* ... */}
  code() {/* ... */}
  fixBug() {/* ... */}
}
```

#### Real-World Example

```go
// BAD: Forcing unnecessary implementations
type FileOperation interface {
    Read() ([]byte, error)
    Write(data []byte) error
    Delete() error
    Rename(newName string) error
    Compress() error
    Encrypt() error
}

// GOOD: Specific interfaces
type Readable interface {
    Read() ([]byte, error)
}

type Writable interface {
    Write(data []byte) error
}

type Deletable interface {
    Delete() error
}

type Compressible interface {
    Compress() error
}

// Compose as needed
type ReadWriteFile interface {
    Readable
    Writable
}

type SecureFile interface {
    Readable
    Writable
    Encrypt() error
}
```

### 5. Dependency Inversion Principle (DIP)

**"Depend on abstractions, not on concretions."**

#### Concept

- High-level modules should not depend on low-level modules. Both should depend on abstractions.
- Abstractions should not depend on details. Details should depend on abstractions.

#### Example Violation and Fix

```ruby
# BAD: High-level depends on low-level
class EmailNotifier
  def send(message)
    # Concrete SMTP implementation
    smtp = Net::SMTP.new('smtp.gmail.com', 587)
    smtp.send_message(message)
  end
end

class OrderService
  def initialize
    @notifier = EmailNotifier.new  # Depends on concrete class
  end
  
  def place_order(order)
    # Process order
    @notifier.send("Order placed: #{order.id}")
  end
end

# GOOD: Depend on abstraction
class NotificationService
  def send(message)
    raise NotImplementedError
  end
end

class EmailNotifier < NotificationService
  def send(message)
    smtp = Net::SMTP.new('smtp.gmail.com', 587)
    smtp.send_message(message)
  end
end

class SMSNotifier < NotificationService
  def send(message)
    # SMS implementation
  end
end

class OrderService
  def initialize(notifier)
    @notifier = notifier  # Depends on abstraction
  end
  
  def place_order(order)
    # Process order
    @notifier.send("Order placed: #{order.id}")
  end
end

# Usage
email_notifier = EmailNotifier.new
order_service = OrderService.new(email_notifier)
```

#### Dependency Injection Example

```javascript
// BAD: Creating dependencies internally
class UserService {
  constructor() {
    this.database = new PostgresDatabase(); // Tight coupling
    this.logger = new FileLogger(); // Tight coupling
  }

  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// GOOD: Injecting dependencies
class UserService {
  constructor(database, logger) {
    this.database = database; // Depends on abstraction
    this.logger = logger; // Depends on abstraction
  }

  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Can easily swap implementations
const prodUserService = new UserService(
  new PostgresDatabase(),
  new CloudLogger(),
);

const testUserService = new UserService(
  new InMemoryDatabase(),
  new ConsoleLogger(),
);
```

## Applying SOLID Together

### Example: E-commerce System

```typescript
// 1. SRP: Each class has one responsibility
class Product {
  constructor(public id: string, public name: string, public price: number) {}
}

class Order {
  constructor(public id: string, public items: OrderItem[]) {}

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
  }
}

class OrderItem {
  constructor(public product: Product, public quantity: number) {}

  getSubtotal(): number {
    return this.product.price * this.quantity;
  }
}

// 2. OCP: Open for extension via strategies
interface PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number;
}

class RegularPricing implements PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number {
    return basePrice * quantity;
  }
}

class BulkDiscountPricing implements PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number {
    const discount = quantity >= 10 ? 0.1 : 0;
    return basePrice * quantity * (1 - discount);
  }
}

// 3. LSP: Subtypes are properly substitutable
abstract class PaymentMethod {
  abstract processPayment(amount: number): PaymentResult;
  abstract validatePaymentDetails(): boolean;
}

class CreditCardPayment extends PaymentMethod {
  processPayment(amount: number): PaymentResult {
    // Credit card specific implementation
    return new PaymentResult(true, "CC123");
  }

  validatePaymentDetails(): boolean {
    // Validate credit card details
    return true;
  }
}

// 4. ISP: Segregated interfaces
interface OrderRepository {
  save(order: Order): void;
  findById(id: string): Order;
}

interface OrderNotifier {
  notifyOrderPlaced(order: Order): void;
}

interface OrderAnalytics {
  trackOrder(order: Order): void;
}

// 5. DIP: Depend on abstractions
class OrderService {
  constructor(
    private repository: OrderRepository,
    private notifier: OrderNotifier,
    private analytics: OrderAnalytics,
    private paymentProcessor: PaymentMethod,
  ) {}

  placeOrder(order: Order): void {
    const total = order.getTotal();
    const paymentResult = this.paymentProcessor.processPayment(total);

    if (paymentResult.success) {
      this.repository.save(order);
      this.notifier.notifyOrderPlaced(order);
      this.analytics.trackOrder(order);
    }
  }
}
```

## Best Practices

### 1. Don't Over-Apply SOLID

```python
# Sometimes simple is better
# Over-engineered
class StringUppercaserInterface(ABC):
    @abstractmethod
    def uppercase(self, text: str) -> str:
        pass

class StringUppercaser(StringUppercaserInterface):
    def uppercase(self, text: str) -> str:
        return text.upper()

# Just use the built-in method
text.upper()
```

### 2. Balance with Other Principles

- **SOLID vs KISS**: Don't create complex abstractions for simple problems
- **SOLID vs YAGNI**: Don't create interfaces for single implementations
- **SOLID vs DRY**: Some duplication is better than wrong abstraction

### 3. Refactor Towards SOLID

Start simple and refactor towards SOLID as complexity grows:

```javascript
// Phase 1: Simple implementation
class OrderProcessor {
  processOrder(order) {
    // Direct implementation
  }
}

// Phase 2: Extract interfaces when you have multiple implementations
// Phase 3: Apply dependency injection when testing becomes difficult
// Phase 4: Segregate interfaces when they become too large
```

## Conclusion

SOLID principles are powerful guidelines for creating maintainable object-oriented software. They help reduce coupling,
increase cohesion, and make systems more flexible and testable. However, they should be applied judiciously—not every
piece of code needs full SOLID treatment. Use these principles as tools to solve actual problems, not as rigid rules to
follow blindly. The goal is clean, maintainable code that solves real business problems effectively.
