# Test Coverage Guide

## Overview

Test coverage measures which parts of your code execute during testing. Think of it as a heat map showing which code
paths your tests exercise versus which remain untested.

## Understanding Coverage Types

### Line Coverage

Line coverage tracks whether each executable line runs during tests. Imagine highlighting lines in your code with a
marker as they execute—line coverage represents the percentage of highlightable lines you marked.

### Branch Coverage

Branch coverage ensures both paths of conditional logic get tested. Picture a railroad switch—branch coverage verifies
your tests travel down both tracks:

```javascript
function greet(user) {
  if (user.isPremium) { // This creates a branch
    return `Welcome back, ${user.name}!`; // Path 1
  } else {
    return `Hello, ${user.name}`; // Path 2
  }
}
```

With only one test for a premium user, you achieve 100% line coverage (every line runs) but only 50% branch coverage
(the non-premium path remains untested).

### Statement Coverage

Similar to line coverage but counts individual statements rather than lines. Multiple statements on one line count
separately.

### Function Coverage

Tracks whether each function gets called during testing. Useful for identifying completely untested functions.

## How to Measure Coverage

### Deno

Generate coverage during test execution:

```bash
# Run tests with coverage collection
deno test --coverage=cov_profile

# Generate HTML report
deno coverage cov_profile --html

# Generate lcov report for CI tools
deno coverage cov_profile --lcov > coverage.lcov

# View coverage in terminal
deno coverage cov_profile
```

### Node.js with Jest

Configure Jest in `package.json` or `jest.config.js`:

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

Run coverage:

```bash
npm run test:coverage

# Generate HTML report
jest --coverage --coverageReporters=html

# Open coverage report
open coverage/index.html
```

### Node.js with Vitest

Configure in `vitest.config.js`:

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
      ],
    },
  },
});
```

Run coverage:

```bash
# Run tests with coverage
vitest run --coverage

# Watch mode with coverage
vitest --coverage
```

### Python with pytest

Install coverage tools:

```bash
pip install pytest-cov
```

Run with coverage:

```bash
# Basic coverage report
pytest --cov=myproject tests/

# Generate HTML report
pytest --cov=myproject --cov-report=html tests/

# Set minimum coverage threshold
pytest --cov=myproject --cov-fail-under=80 tests/
```

### Go

Built-in coverage support:

```bash
# Run tests with coverage
go test -coverprofile=coverage.out ./...

# View coverage report
go tool cover -html=coverage.out

# Get coverage percentage
go test -cover ./...

# Detailed function-level coverage
go tool cover -func=coverage.out
```

### Java with JaCoCo (Maven)

Add to `pom.xml`:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Run coverage:

```bash
mvn clean test
mvn jacoco:report
# Report available at target/site/jacoco/index.html
```

## Coverage Goals and Strategy

### The Pragmatic Approach

**Recommended targets:**

- Critical business logic: 85-95%
- API endpoints: 80-90%
- Data models: 80-90%
- Utility functions: 70-80%
- UI components: 60-70%
- Configuration files: Skip or minimal

### Benefits of High Coverage (80-90%)

- **Early regression detection**: Catches breaking changes immediately
- **Enforced edge case thinking**: Forces consideration of error paths
- **Refactoring confidence**: Safe code modifications
- **Living documentation**: Tests demonstrate expected behavior

### Drawbacks of 100% Coverage

- **Diminishing returns**: Final 10-20% often covers trivial code
- **Test brittleness**: Over-specified tests break with minor changes
- **Maintenance burden**: More tests mean more upkeep
- **False security**: High coverage doesn't guarantee quality tests

### What to Exclude from Coverage

Consider excluding:

- Generated code
- Third-party vendored code
- Simple getters/setters
- Framework boilerplate
- Debug utilities
- Migration scripts

Example exclusion in various tools:

```javascript
// Istanbul (JS)
/* istanbul ignore next */
if (process.env.NODE_ENV === "debug") {
  console.log(state);
}
```

```python
# Python
def debug_only():  # pragma: no cover
    print("Debug information")
```

## Best Practices

### Focus on Quality Over Quantity

Write tests that verify behavior, not implementation:

```javascript
// ❌ Poor: Tests implementation details
test("uses array push method", () => {
  const spy = jest.spyOn(Array.prototype, "push");
  addItem(list, item);
  expect(spy).toHaveBeenCalled();
});

// ✅ Good: Tests behavior
test("adds item to list", () => {
  const list = ["apple"];
  addItem(list, "banana");
  expect(list).toContain("banana");
});
```

### Prioritize Branch Coverage

Branch coverage often reveals more bugs than line coverage. Complex conditionals hide edge cases:

```javascript
// This function needs 4 tests for full branch coverage
function processPayment(amount, user) {
  if (amount > 0 && user.hasValidCard) {
    // Test 1: amount > 0 AND hasValidCard = true
    return chargeCard(amount);
  } else if (amount > 0 && !user.hasValidCard) {
    // Test 2: amount > 0 AND hasValidCard = false
    return requestCardUpdate();
  } else if (amount <= 0 && user.hasValidCard) {
    // Test 3: amount <= 0 AND hasValidCard = true
    return refundCard(Math.abs(amount));
  } else {
    // Test 4: amount <= 0 AND hasValidCard = false
    return handleError();
  }
}
```

### Use Coverage Trends

Track coverage over time rather than absolute numbers. A dropping trend signals technical debt accumulation.

### Integrate with CI/CD

Fail builds when coverage drops below thresholds:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    fail_ci_if_error: true
    minimum_coverage: 80
```

## Conclusion

Test coverage serves as a useful metric but not an absolute goal. Like a map showing unexplored territory, it guides you
toward untested code without demanding you explore every inch. Aim for comprehensive coverage of critical paths while
accepting that perfect coverage often means imperfect resource allocation.

The real goal: confidence that your tests catch meaningful bugs before users do.
