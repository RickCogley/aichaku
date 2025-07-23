# Clean Architecture

## Overview

Clean Architecture, introduced by Robert C. Martin (Uncle Bob), is an
architectural pattern that emphasizes the separation of concerns and the
independence of business logic from external frameworks, databases, and UI.

### Core Principles

1. **Independence of Frameworks**: The architecture doesn't depend on the
   existence of some library of feature-laden software

2. **Testability**: Business rules can be tested without the UI, database, web
   server, or any external element

3. **Independence of UI**: The UI can change easily without changing the rest of
   the system

4. **Independence of Database**: You can swap out Oracle or SQL Server for
   MongoDB, BigTable, CouchDB, or something else

5. **Independence of External Agency**: Business rules don't know anything about
   the outside world

## The Dependency Rule

The overriding rule that makes this architecture work is The Dependency Rule:

> Source code dependencies must point only inward, toward higher-level policies.

### Layers (from outside to inside)

1. **Frameworks and Drivers** (Blue)

2. **Interface Adapters** (Green)

3. **Application Business Rules** (Red)

4. **Enterprise Business Rules** (Yellow)

## Implementation Examples

### TypeScript/JavaScript Implementation

````typescript
// Domain Layer (Enterprise Business Rules)
// entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private readonly hashedPassword: string,
  ) {}

  // Business rule: email must be valid
  static create(email: string, name: string, password: string): User {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    return new User(
      this.generateId(),
      email,
      name,
      this.hashPassword(password),
    );
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Use Cases Layer (Application Business Rules)
// usecases/CreateUserUseCase.ts
export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export interface EmailService {
  sendWelcomeEmail(user: User): Promise<void>;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user entity
    const user = User.create(request.email, request.name, request.password);

    // Save user
    await this.userRepository.save(user);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

// Interface Adapters Layer
// controllers/UserController.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createUserUseCase.execute({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

// Infrastructure Layer (Frameworks and Drivers)
// repositories/PostgresUserRepository.ts
export class PostgresUserRepository implements UserRepository {
  constructor(private db: Database) {}

  async save(user: User): Promise<void> {
    await this.db.query(
      "INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4)",
      [
        user.id,
        user.email,
        user.name,
        user.hashedPassword,
      ],
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new User(row.id, row.email, row.name, row.password);
  }
}
```text

### Python Implementation

```python
# Domain Layer
# domain/entities/order.py
from datetime import datetime
from typing import List
from decimal import Decimal

class OrderItem:

    def **init**(self, product_id: str, quantity: int, price: Decimal):
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        if price < 0:
            raise ValueError("Price cannot be negative")

        self.product*id = product*id
        self.quantity = quantity
        self.price = price

    @property
    def total(self) -> Decimal:
        return self.price * self.quantity

class Order:

    def **init**(self, customer_id: str):
        self.id = self.*generate*id()
        self.customer*id = customer*id
        self.items: List[OrderItem] = []
        self.created_at = datetime.now()
        self.status = "pending"

    def add_item(self, item: OrderItem) -> None:
        # Business rule: cannot add items to completed orders
        if self.status == "completed":
            raise ValueError("Cannot add items to completed order")
        self.items.append(item)

    @property
    def total(self) -> Decimal:
        return sum(item.total for item in self.items)

    def complete(self) -> None:
        # Business rule: cannot complete empty order
        if not self.items:
            raise ValueError("Cannot complete empty order")
        self.status = "completed"

# Use Cases Layer
# application/use*cases/create*order.py
from abc import ABC, abstractmethod

class OrderRepository(ABC):

    @abstractmethod
    async def save(self, order: Order) -> None:
        pass

    @abstractmethod
    async def find*by*id(self, order_id: str) -> Order:
        pass

class ProductRepository(ABC):

    @abstractmethod
    async def find*by*id(self, product_id: str) -> Product:
        pass

class CreateOrderUseCase:

    def **init**(
        self,
        order_repository: OrderRepository,
        product_repository: ProductRepository
    ):
        self.order*repository = order*repository
        self.product*repository = product*repository

    async def execute(self, request: CreateOrderRequest) -> CreateOrderResponse:
        # Create order
        order = Order(request.customer_id)

        # Add items with validation
        for item_request in request.items:
            product = await self.product*repository.find*by_id(
                item*request.product*id
            )

            if not product.is_available():
                raise ValueError(f"Product {product.id} is not available")

            order_item = OrderItem(
                product.id,
                item_request.quantity,
                product.price
            )
            order.add*item(order*item)

        # Save order
        await self.order_repository.save(order)

        return CreateOrderResponse(
            order_id=order.id,
            total=order.total,
            status=order.status
        )

# Interface Adapters Layer
# adapters/web/order_controller.py
from fastapi import APIRouter, HTTPException

class OrderController:

    def **init**(self, create*order*use_case: CreateOrderUseCase):
        self.create*order*use*case = create*order*use*case
        self.router = APIRouter()
        self.*setup*routes()

    def *setup*routes(self):
        @self.router.post("/orders")
        async def create_order(request: CreateOrderDTO):
            try:
                use*case*request = self.*map*to*use*case_request(request)
                response = await self.create*order*use_case.execute(
                    use*case*request
                )
                return self.*map*to_dto(response)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

# Infrastructure Layer
# infrastructure/repositories/sqlalchemy*order*repository.py
from sqlalchemy.orm import Session

class SQLAlchemyOrderRepository(OrderRepository):

    def **init**(self, session: Session):
        self.session = session

    async def save(self, order: Order) -> None:
        db_order = OrderModel(
            id=order.id,
            customer*id=order.customer*id,
            status=order.status,
            created*at=order.created*at
        )

        for item in order.items:
            db_item = OrderItemModel(
                order_id=order.id,
                product*id=item.product*id,
                quantity=item.quantity,
                price=item.price
            )
            db*order.items.append(db*item)

        self.session.add(db_order)
        self.session.commit()
```text

### Go Implementation

```go
// Domain Layer
// domain/entity/product.go
package entity

import (
    "errors"
    "time"
)

type Product struct {
    ID          string
    Name        string
    Description string
    Price       float64
    Stock       int
    CreatedAt   time.Time
}

// Business rule: Product validation
func NewProduct(name, description string, price float64, stock int) (*Product, error) {
    if name == "" {
        return nil, errors.New("product name is required")
    }

    if price < 0 {
        return nil, errors.New("price cannot be negative")
    }

    if stock < 0 {
        return nil, errors.New("stock cannot be negative")
    }

    return &Product{
        ID:          generateID(),
        Name:        name,
        Description: description,
        Price:       price,
        Stock:       stock,
        CreatedAt:   time.Now(),
    }, nil
}

// Use Cases Layer
// application/usecase/product_usecase.go
package usecase

type ProductRepository interface {
    Save(product *entity.Product) error
    FindByID(id string) (*entity.Product, error)
    Update(product *entity.Product) error
}

type CreateProductUseCase struct {
    repo ProductRepository
}

func NewCreateProductUseCase(repo ProductRepository) *CreateProductUseCase {
    return &CreateProductUseCase{repo: repo}
}

func (uc *CreateProductUseCase) Execute(input CreateProductInput) (*CreateProductOutput, error) {
    product, err := entity.NewProduct(
        input.Name,
        input.Description,
        input.Price,
        input.Stock,
    )
    if err != nil {
        return nil, err
    }

    if err := uc.repo.Save(product); err != nil {
        return nil, err
    }

    return &CreateProductOutput{
        ID:        product.ID,
        Name:      product.Name,
        Price:     product.Price,
        CreatedAt: product.CreatedAt,
    }, nil
}

// Interface Adapters Layer
// adapter/controller/product_controller.go
package controller

type ProductController struct {
    createProductUseCase *usecase.CreateProductUseCase
}

func (c *ProductController) CreateProduct(w http.ResponseWriter, r *http.Request) {
    var request CreateProductRequest
    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    input := usecase.CreateProductInput{
        Name:        request.Name,
        Description: request.Description,
        Price:       request.Price,
        Stock:       request.Stock,
    }

    output, err := c.createProductUseCase.Execute(input)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    response := CreateProductResponse{
        ID:        output.ID,
        Name:      output.Name,
        Price:     output.Price,
        CreatedAt: output.CreatedAt,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Infrastructure Layer
// infrastructure/repository/postgres*product*repository.go
package repository

type PostgresProductRepository struct {
    db *sql.DB
}

func (r *PostgresProductRepository) Save(product *entity.Product) error {
    query := `
        INSERT INTO products (id, name, description, price, stock, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `

    _, err := r.db.Exec(
        query,
        product.ID,
        product.Name,
        product.Description,
        product.Price,
        product.Stock,
        product.CreatedAt,
    )

    return err
}
```text

## Testing in Clean Architecture

### Unit Testing Business Logic

```typescript
// Test domain entities without any dependencies
describe("User Entity", () => {
  it("should create user with valid data", () => {
    const user = User.create("test@example.com", "Test User", "password123");

    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
    expect(user.id).toBeDefined();
  });

  it("should reject invalid email", () => {
    expect(() => {
      User.create("invalid-email", "Test User", "password123");
    }).toThrow("Invalid email format");
  });
});

// Test use cases with mocked dependencies
describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockUserRepository, mockEmailService);
  });

  it("should create user successfully", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: "new@example.com",
      name: "New User",
      password: "password123",
    });

    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    expect(result.email).toBe("new@example.com");
  });
});
```text

## Clean Architecture Benefits

1. **Independent of Frameworks**: Can change frameworks without changing
   business logic

2. **Testable**: Business rules can be tested without UI, database, or external
   elements

3. **Independent of UI**: Can change from web to console to mobile without
   changing business rules

4. **Independent of Database**: Can switch from SQL to NoSQL without changing
   business rules

5. **Independent of External Agency**: Business rules don't know about the
   outside world

## Common Pitfalls

### 1. Leaking Domain Logic

```typescript
// ❌ Bad: Domain logic in controller
class UserController {
  createUser(req, res) {
    // Domain validation in controller
    if (!req.body.email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }
  }
}

// ✅ Good: Domain logic in entity
class User {
  static create(email: string) {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
  }
}
```text

### 2. Framework Dependencies in Domain

```typescript
// ❌ Bad: Framework dependency in entity
import { Column, Entity } from "typeorm"; // Framework dependency

@Entity()
class User {
  @Column()
  email: string;
}

// ✅ Good: Plain domain entity
class User {
  constructor(public email: string) {}
}
```text

### 3. Violating Dependency Rule

```typescript
// ❌ Bad: Use case depends on infrastructure
import { PostgresUserRepository } from "../infrastructure/PostgresUserRepository";

class CreateUserUseCase {
  private repo = new PostgresUserRepository(); // Direct dependency
}

// ✅ Good: Use case depends on interface
class CreateUserUseCase {
  constructor(private repo: UserRepository) {} // Interface dependency
}
```text

## Applying Clean Architecture to Different Project Types

### Web Applications

- Controllers handle HTTP requests/responses

- Use cases contain application logic

- Entities contain business rules

- Repositories handle data persistence

### CLI Applications

- Commands replace controllers

- Use cases remain the same

- Entities remain the same

- File system or database for persistence

### Microservices

- Each service follows clean architecture

- Shared domain concepts in separate packages

- Inter-service communication through interfaces

- Event-driven architecture at boundaries

## Migration Strategy

1. **Start with Use Cases**: Identify and extract business operations

2. **Extract Entities**: Move business rules to domain entities

3. **Define Interfaces**: Create repository and service interfaces

4. **Implement Adapters**: Create concrete implementations

5. **Refactor Controllers**: Make them thin, delegating to use cases

6. **Add Tests**: Test each layer independently

## Clean Architecture Checklist

- [ ] Dependencies point inward only

- [ ] Business rules are independent of frameworks

- [ ] Use cases are independent of delivery mechanism

- [ ] Entities have no dependencies on external layers

- [ ] All external dependencies are behind interfaces

- [ ] Tests can run without external systems

- [ ] Business logic can be understood without framework knowledge

- [ ] Can change database without changing business rules

- [ ] Can change UI without changing business rules

- [ ] Clear separation between layers

Remember: The goal is to make the business rules the most important part of your
application, with everything else being a detail that can be changed without
affecting the core business logic.
````
