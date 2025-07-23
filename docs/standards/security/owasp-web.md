## OWASP Top 10 Web Application Security

### Quick Reference

When developing web applications, ALWAYS verify against these security risks:

- **A01: Broken Access Control** - Validate authorization on every request

- **A02: Cryptographic Failures** - Use strong encryption, secure key management

- **A03: Injection** - Parameterized queries, input validation, output encoding

- **A04: Insecure Design** - Security by design, threat modeling

- **A05: Security Misconfiguration** - Secure defaults, minimal attack surface

- **A06: Vulnerable Components** - Keep dependencies updated, audit regularly

- **A07: Authentication Failures** - Strong authentication, session management

- **A08: Software Integrity** - Verify code integrity, secure CI/CD

- **A09: Logging Failures** - Comprehensive logging without sensitive data

- **A10: Server-Side Request Forgery** - Validate all outbound requests

### Implementation Guidelines

#### Input Validation

````typescript
// ✅ Good: Validate all inputs
function createUser(data: UserInput) {
  if (!isEmail(data.email)) {
    throw new ValidationError("Invalid email format");
  }
  if (data.password.length < 12) {
    throw new ValidationError("Password must be at least 12 characters");
  }
}

// ❌ Bad: No validation
function createUser(data: any) {
  return db.query(
    `INSERT INTO users (email, password) VALUES ('${data.email}', '${data.password}')`,
  );
}
```text

#### Authentication & Authorization

```typescript
// ✅ Good: Check authorization for each request
async function updateUser(
  userId: string,
  data: UserData,
  requestingUser: User,
) {
  if (!canEditUser(requestingUser, userId)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return userService.update(userId, data);
}

// ❌ Bad: No authorization check
async function updateUser(userId: string, data: UserData) {
  return userService.update(userId, data);
}
```text

#### Secure Data Handling

```typescript
// ✅ Good: Parameterized queries
const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

// ❌ Bad: String concatenation (SQL injection risk)
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```text

### Security Headers

Always implement these security headers:

```typescript
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});
```text

### Critical Security Practices

1. **Never trust user input** - Validate, sanitize, and escape all data

2. **Use HTTPS everywhere** - No exceptions for production

3. **Implement proper session management** - Secure cookies, timeout handling

4. **Log security events** - Failed logins, permission changes, data access

5. **Regular security testing** - SAST, DAST, dependency scanning

6. **Keep dependencies updated** - Monitor for vulnerabilities

7. **Use secure coding practices** - Code reviews, security training

8. **Implement defense in depth** - Multiple layers of security controls

### Error Handling

```typescript
// ✅ Good: Generic error messages
try {
  const user = await authenticate(credentials);
  return user;
} catch (error) {
  logger.error("Authentication failed", { email: credentials.email });
  throw new AuthenticationError("Invalid credentials");
}

// ❌ Bad: Detailed error messages
try {
  const user = await authenticate(credentials);
  return user;
} catch (error) {
  throw new Error(
    `User ${credentials.email} not found in database table users`,
  );
}
```text

Remember: Security is not a feature to be added later - it must be built into
every aspect of your application from the ground up.
````
