# TDD Session - API Authentication Refactor

**Date**: 2025-01-05\
**Pair**: Alice (Driver) + Bob (Navigator)\
**Feature**: Refactor authentication to use JWT tokens

## TDD Cycles Completed

### Cycle 1: Token Generation

#### 🔴 RED (2:15 PM)

```javascript
describe("TokenService", () => {
  it("should generate a valid JWT token", () => {
    const user = { id: 123, email: "test@example.com" };
    const token = TokenService.generate(user);

    expect(token).toBeDefined();
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
  });
});
// FAIL: TokenService is not defined
```

#### 🟢 GREEN (2:18 PM)

```javascript
class TokenService {
  static generate(user) {
    return "header.payload.signature"; // Fake but passes test
  }
}
// PASS: Test passes with minimal implementation
```

#### 🔵 REFACTOR (2:25 PM)

```javascript
const jwt = require("jsonwebtoken");

class TokenService {
  static generate(user) {
    const payload = {
      id: user.id,
      email: user.email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  }
}
// PASS: Real implementation, tests still green
```

### Cycle 2: Token Validation

#### 🔴 RED (2:30 PM)

```javascript
it("should validate a correct token", async () => {
  const user = { id: 123, email: "test@example.com" };
  const token = TokenService.generate(user);
  const decoded = await TokenService.validate(token);

  expect(decoded.id).toBe(123);
  expect(decoded.email).toBe("test@example.com");
});
// FAIL: TokenService.validate is not a function
```

#### 🟢 GREEN (2:33 PM)

```javascript
static async validate(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
// PASS: Simple implementation
```

### Cycle 3: Invalid Token Handling

#### 🔴 RED (2:40 PM)

```javascript
it("should throw error for invalid token", async () => {
  const invalidToken = "invalid.token.here";

  await expect(TokenService.validate(invalidToken))
    .rejects.toThrow("Invalid token");
});
// FAIL: Expected error not thrown
```

#### 🟢 GREEN (2:43 PM)

```javascript
static async validate(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
// PASS: Error handling added
```

## Pairing Notes

**Driver (Alice)**:

- Focused on syntax and test structure
- Caught typo in test description
- Suggested better variable names

**Navigator (Bob)**:

- Spotted missing edge cases
- Suggested refactoring to async/await
- Kept focus on one test at a time

## Code Coverage

```
TokenService.js        100%
- generate()           100%  
- validate()           100%
- Error paths          100%
```

## Next Session Plan

Tomorrow: Integrate TokenService into authentication middleware

- Test middleware integration
- Add refresh token support
- Test expiration handling

## Reflections

- TDD forced us to think about interface first
- Small cycles kept us focused
- Pairing caught issues early
- 100% coverage achieved naturally

**Quote of the session**: "Make it fail, make it pass, make it beautiful" -
Uncle Bob
