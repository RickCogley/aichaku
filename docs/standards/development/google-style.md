# Google Style Guides

## Overview

Google's style guides are comprehensive coding standards used across Google's engineering teams. They emphasize
readability, consistency, and maintainability while providing specific guidance for multiple programming languages.

### Core Philosophy

1. **Optimize for the reader, not the writer**: Code is read far more often than it's written
2. **Be consistent**: When in doubt, be consistent with existing code
3. **Use common sense**: Rules can be broken if there's a good reason
4. **Clarity over cleverness**: Avoid clever tricks that make code harder to understand

## Language-Specific Guidelines

### TypeScript/JavaScript Style Guide

#### Naming Conventions

```typescript
// Classes and interfaces: PascalCase
class UserAccount {}
interface DatabaseConnection {}

// Variables and functions: camelCase
const userName = "John";
function calculateTotal() {}

// Constants: UPPER*SNAKE*CASE
const MAX*RETRY*COUNT = 3;
const API_ENDPOINT = "https://api.example.com";

// Private properties: leading underscore discouraged
// ❌ Bad
class User {
  private _name: string;
}

// ✅ Good
class User {
  private name: string;
}

// File names: lowercase with hyphens or underscores
// user-service.ts or user_service.ts
```

#### Type Annotations

```typescript
// Always use type annotations for function parameters and return types
function calculatePrice(basePrice: number, taxRate: number): number {
  return basePrice * (1 + taxRate);
}

// Use interface for object types
interface UserData {
  id: string;
  name: string;
  email: string;
}

// Prefer interface over type for object shapes
// ✅ Good
interface Point {
  x: number;
  y: number;
}

// Use type for unions, intersections, and aliases
type Status = "pending" | "active" | "completed";
type ID = string | number;
```

#### Comments and Documentation

```typescript
/**
 * Calculates the total price including tax.
 * @param basePrice - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.1 for 10%)
 * @returns The total price including tax
 */
function calculateTotalPrice(basePrice: number, taxRate: number): number {
  // Apply tax to base price
  return basePrice * (1 + taxRate);
}

// Use TODO comments with owner
// TODO(username): Implement caching mechanism

// Avoid obvious comments
// ❌ Bad
let count = 0; // Set count to 0

// ✅ Good - explains why, not what
let retryCount = 0; // Reset counter for exponential backoff
```

#### Code Organization

```typescript
// Import order
// 1. Node built-ins
import * as fs from "fs";
import * as path from "path";

// 2. External modules
import express from "express";
import { Request, Response } from "express";

// 3. Internal modules
import { UserService } from "./services/user-service";
import { Logger } from "./utils/logger";

// 4. Types
import type { User, UserRole } from "./types";

// Class organization
class UserManager {
  // 1. Static properties
  static readonly DEFAULT_ROLE = "user";

  // 2. Instance properties
  private users: Map<string, User>;

  // 3. Constructor
  constructor(private logger: Logger) {
    this.users = new Map();
  }

  // 4. Static methods
  static createDefaultUser(): User {
    // ...
  }

  // 5. Instance methods (public first, then private)
  public addUser(user: User): void {
    this.validateUser(user);
    this.users.set(user.id, user);
  }

  private validateUser(user: User): void {
    // ...
  }
}
```

### Python Style Guide (Based on Google's Python Style Guide)

#### Naming Conventions

```python
# Module names: lowercase with underscores
# user*service.py, database*connection.py

# Class names: PascalCase
class UserAccount:
    pass

class DatabaseConnection:
    pass

# Function and variable names: lowercase with underscores
def calculate*total*price(base*price, tax*rate):
    user_name = "John"
    return base*price * (1 + tax*rate)

# Constants: UPPER*SNAKE*CASE
MAX*RETRY*COUNT = 3
DEFAULT_TIMEOUT = 30

# Protected/private: single/double underscore prefix
class User:
    def **init**(self):
        self.*internal*id = None  # Protected
        self.**private_data = None  # Private (name mangled)
```

#### Type Hints and Docstrings

```python
from typing import List, Dict, Optional, Union
from dataclasses import dataclass

def calculate_average(numbers: List[float]) -> float:
    """Calculate the average of a list of numbers.

    Args:
        numbers: A list of numbers to average.

    Returns:
        The arithmetic mean of the input numbers.

    Raises:
        ValueError: If the input list is empty.
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)

@dataclass
class User:
    """Represents a user in the system.

    Attributes:
        id: Unique identifier for the user.
        name: User's display name.
        email: User's email address.
        roles: List of roles assigned to the user.
    """
    id: str
    name: str
    email: str
    roles: List[str] = None

    def **post*init*_(self):
        if self.roles is None:
            self.roles = ['user']
```

#### Code Organization

```python
"""Module docstring describing the purpose of this module.

This module provides functionality for user management including
creation, authentication, and role management.
"""

# Standard library imports
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional

# Third-party imports
import requests
from flask import Flask, request
from sqlalchemy import create_engine

# Local imports
from .models import User, Role
from .utils import hash*password, validate*email
from .exceptions import UserNotFoundError

# Module-level constants
DEFAULT*PAGE*SIZE = 20
MAX*LOGIN*ATTEMPTS = 5

# Module-level "private" variable
*logger = logging.getLogger(**name*_)


class UserService:
    """Handles user-related operations."""

    def **init**(self, database_url: str):
        """Initialize the UserService.

        Args:
            database_url: Connection string for the database.
        """
        self.engine = create*engine(database*url)
        self._cache: Dict[str, User] = {}

    def create_user(self, email: str, password: str) -> User:
        """Create a new user account.

        Args:
            email: User's email address.
            password: User's password (will be hashed).

        Returns:
            The created User object.

        Raises:
            ValueError: If email is invalid or user already exists.
        """
        if not validate_email(email):
            raise ValueError(f"Invalid email: {email}")

        hashed*password = hash*password(password)
        user = User(email=email, password*hash=hashed*password)

        # Store in database
        self.*save*user(user)

        return user
```

### Go Style Guide

#### Naming Conventions

```go
// Package names: lowercase, single word
package user
package httputil

// Exported names: PascalCase
type UserService struct {}
func NewUserService() *UserService {}
const MaxRetryCount = 3

// Unexported names: camelCase
type userRepository struct {}
func validateEmail(email string) bool {}
const defaultTimeout = 30

// Acronyms: keep consistent case
// Exported
type HTTPClient struct {}
type URLParser struct {}

// Unexported
type httpClient struct {}
type urlParser struct {}

// Interface names: typically end with -er
type Reader interface {}
type UserRepository interface {}
type Validator interface {}
```

#### Code Organization

```go
package user

import (
    // Standard library imports (alphabetical)
    "context"
    "encoding/json"
    "fmt"
    "time"

    // External imports (alphabetical)
    "github.com/google/uuid"
    "github.com/pkg/errors"

    // Internal imports (alphabetical)
    "github.com/mycompany/myapp/internal/database"
    "github.com/mycompany/myapp/pkg/logger"
)

// Constants grouped together
const (
    DefaultTimeout = 30 * time.Second
    MaxRetryCount  = 3
    MinPasswordLen = 8
)

// Type definitions
type Role string

const (
    RoleAdmin Role = "admin"
    RoleUser  Role = "user"
)

// Structs with tags aligned
type User struct {
    ID        string    `json:"id" db:"id"`
    Email     string    `json:"email" db:"email"`
    Name      string    `json:"name" db:"name"`
    Role      Role      `json:"role" db:"role"`
    CreatedAt time.Time `json:"created*at" db:"created*at"`
}

// Interfaces
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    GetByID(ctx context.Context, id string) (*User, error)
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}

// Service implementation
type UserService struct {
    repo   UserRepository
    logger logger.Logger
}

// Constructor
func NewUserService(repo UserRepository, logger logger.Logger) *UserService {
    return &UserService{
        repo:   repo,
        logger: logger,
    }
}

// Methods grouped by receiver
func (s *UserService) CreateUser(ctx context.Context, email, name string) (*User, error) {
    // Validate input
    if err := validateEmail(email); err != nil {
        return nil, errors.Wrap(err, "invalid email")
    }

    // Create user
    user := &User{
        ID:        uuid.New().String(),
        Email:     email,
        Name:      name,
        Role:      RoleUser,
        CreatedAt: time.Now(),
    }

    // Save to repository
    if err := s.repo.Create(ctx, user); err != nil {
        s.logger.Error("failed to create user", "error", err, "email", email)
        return nil, errors.Wrap(err, "failed to create user")
    }

    s.logger.Info("user created", "id", user.ID, "email", email)
    return user, nil
}

// Helper functions at the end
func validateEmail(email string) error {
    if email == "" {
        return errors.New("email is required")
    }
    // Additional validation...
    return nil
}
```

#### Error Handling

```go
// Error types
type UserError struct {
    Code    string
    Message string
}

func (e UserError) Error() string {
    return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Sentinel errors
var (
    ErrUserNotFound = UserError{Code: "USER*NOT*FOUND", Message: "user not found"}
    ErrInvalidInput = UserError{Code: "INVALID_INPUT", Message: "invalid input"}
)

// Error handling in functions
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.GetByID(ctx, id)
    if err != nil {
        if errors.Is(err, database.ErrNotFound) {
            return nil, ErrUserNotFound
        }
        return nil, errors.Wrap(err, "failed to get user")
    }

    return user, nil
}

// Check errors immediately
user, err := s.GetUser(ctx, id)
if err != nil {
    return nil, err
}
// Use user...
```

### Java Style Guide

#### Naming Conventions

```java
// Package names: lowercase, no underscores
package com.google.example.project;

// Class names: PascalCase
public class UserAccount {}
public interface DatabaseConnection {}

// Method and variable names: camelCase
private String userName;
public void calculateTotal() {}

// Constants: UPPER*SNAKE*CASE
public static final int MAX*RETRY*COUNT = 3;
private static final String API_ENDPOINT = "https://api.example.com";

// Type parameters: single capital letter or PascalCase
public class Cache<T> {}
public interface Converter<InputType, OutputType> {}
```

#### Class Structure

```java
package com.example.user;

// Import statements in order:
// 1. Static imports
import static com.google.common.base.Preconditions.checkNotNull;

// 2. java and javax packages
import java.util.List;
import java.util.Map;

// 3. Third-party packages
import com.google.common.collect.ImmutableList;
import org.springframework.stereotype.Service;

// 4. Same project packages
import com.example.user.model.User;
import com.example.user.repository.UserRepository;

/**
 * Service for managing user operations.
 *
 * <p>This service handles user creation, authentication, and role management.
 * All operations are transactional and thread-safe.
 */
@Service
public class UserService {
    // Constants
    private static final int DEFAULT*PAGE*SIZE = 20;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    // Fields
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor
    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = checkNotNull(userRepository);
        this.passwordEncoder = checkNotNull(passwordEncoder);
    }

    // Public methods
    /**
     * Creates a new user account.
     *
     * @param email the user's email address
     * @param password the user's password (will be encrypted)
     * @return the created user
     * @throws IllegalArgumentException if email is invalid
     * @throws DuplicateUserException if user already exists
     */
    public User createUser(String email, String password) {
        validateEmail(email);
        checkUserDoesNotExist(email);

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .createdAt(Instant.now())
                .build();

        return userRepository.save(user);
    }

    // Private methods
    private void validateEmail(String email) {
        if (!EmailValidator.isValid(email)) {
            throw new IllegalArgumentException("Invalid email: " + email);
        }
    }
}
```

## Common Best Practices Across Languages

### Line Length

- Maximum 80-100 characters (language-dependent)
- Break long lines at logical points
- Indent continuation lines appropriately

### Indentation

- **Spaces preferred**: 2 spaces (JavaScript/TypeScript), 4 spaces (Python)
- **Tabs**: Avoid in most Google style guides
- **Consistency**: Never mix tabs and spaces

### Whitespace

```typescript
// Good spacing around operators
const sum = a + b;
const result = calculateValue(x, y);

// Space after keywords
if (condition) {
  // ...
}

// No space before semicolon
doSomething();

// Space after commas
function example(a, b, c) {}
```

### Braces and Brackets

```javascript
// JavaScript/TypeScript: Opening brace on same line
if (condition) {
  doSomething();
} else {
  doSomethingElse();
}

// Single-line blocks can omit braces (but discouraged)
if (condition) doSomething();

// Prefer explicit braces
if (condition) {
  doSomething();
}
```

### Function Length

- Keep functions short and focused (typically < 40 lines)
- Extract complex logic into helper functions
- One function should do one thing well

### Comments Best Practices

1. **Why, not what**: Explain reasoning, not obvious code
2. **Keep updated**: Outdated comments are worse than no comments
3. **Use standard formats**: JSDoc, docstrings, godoc
4. **Avoid commented-out code**: Use version control instead

### Error Handling

```typescript
// Be specific with error messages
throw new Error(`Invalid user ID: ${userId}`);

// Handle errors at appropriate level
try {
  const user = await fetchUser(userId);
  return processUser(user);
} catch (error) {
  logger.error("Failed to process user", { userId, error });
  throw new UserProcessingError(`Failed to process user ${userId}`, error);
}
```

## Code Review Guidelines

### What to Look For

1. **Correctness**: Does the code do what it's supposed to?
2. **Clarity**: Is the code easy to understand?
3. **Consistency**: Does it follow team conventions?
4. **Completeness**: Are there tests? Documentation?
5. **Complexity**: Can it be simplified?

### Review Comments

```
// Constructive feedback
"Consider extracting this logic into a separate function for better testability"

// Not just criticism
"Nice use of the builder pattern here!"

// Specific suggestions
"This could be simplified using Array.reduce()"
```

## Testing Standards

### Test Naming

```typescript
// Descriptive test names
describe("UserService", () => {
  describe("createUser", () => {
    it("should create user with valid data", () => {});
    it("should throw error for invalid email", () => {});
    it("should prevent duplicate emails", () => {});
  });
});
```

### Test Structure

```python
def test*user*creation*with*valid_data(self):
    """Test that users can be created with valid data."""
    # Arrange
    email = "test@example.com"
    password = "secure123"

    # Act
    user = self.user*service.create*user(email, password)

    # Assert
    self.assertEqual(user.email, email)
    self.assertIsNotNone(user.id)
    self.assertTrue(user.is_active)
```

## Migration to Google Style

### Gradual Adoption

1. **New code first**: Apply to new files immediately
2. **Boy Scout Rule**: Leave code better than you found it
3. **Refactoring sprints**: Dedicated time for style updates
4. **Automated tools**: Use linters and formatters

### Tooling

```json
// Example .eslintrc for Google Style
{
  "extends": ["google"],
  "rules": {
    "max-len": ["error", { "code": 100 }],
    "indent": ["error", 2],
    "quotes": ["error", "single"]
  }
}
```

```yaml
# Example .pylintrc for Google Style
[FORMAT]
max-line-length=80
indent-string='    '

[BASIC]
function-naming-style=snake_case
class-naming-style=PascalCase
const-naming-style=UPPER_CASE
```

Remember: The goal of style guides is to improve code readability and maintainability. When in doubt, optimize for
clarity and consistency with your team's existing code.
