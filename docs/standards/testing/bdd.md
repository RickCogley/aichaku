# Behavior-Driven Development (BDD)

## Overview

Behavior-Driven Development (BDD) is an agile software development practice that encourages collaboration between
developers, QA, and non-technical stakeholders. BDD focuses on defining the behavior of software through examples
written in a shared language that everyone can understand.

### Core Principles

1. **Shared Understanding**: Create a common language between technical and non-technical team members
2. **Living Documentation**: Tests serve as documentation that stays up-to-date
3. **Outside-In Development**: Start from user behavior and work inward
4. **Examples Drive Design**: Concrete examples guide implementation
5. **Continuous Communication**: Ongoing dialogue about requirements

## The Three Amigos

BDD encourages collaboration between three key perspectives:

1. **Business** (Product Owner/BA): What problem are we solving?
2. **Development** (Developer): How might we solve this?
3. **Testing** (QA/Tester): What could go wrong?

## Gherkin Language

Gherkin is the business-readable language used to describe software behavior.

### Basic Structure

```gherkin
Feature: Shopping Cart
  As a customer
  I want to add items to my shopping cart
  So that I can purchase multiple items at once

  Background:
    Given I am on the shopping site
    And I am logged in as "customer@example.com"

  Scenario: Add single item to empty cart
    Given I have an empty shopping cart
    When I add a "Blue T-Shirt" to the cart
    Then the cart should contain 1 item
    And the cart total should be "$19.99"

  Scenario: Add multiple items to cart
    Given I have an empty shopping cart
    When I add the following items to the cart:
      | Item          | Quantity | Price  |
      | Blue T-Shirt  | 2        | $19.99 |
      | Red Hat       | 1        | $15.00 |
    Then the cart should contain 3 items
    And the cart total should be "$54.98"

  Scenario Outline: Apply discount codes
    Given I have items worth "<subtotal>" in my cart
    When I apply the discount code "<code>"
    Then the discount should be "<discount>"
    And the total should be "<total>"

    Examples:
      | subtotal | code     | discount | total  |
      | $100.00  | SAVE10   | $10.00   | $90.00 |
      | $50.00   | SAVE10   | $5.00    | $45.00 |
      | $200.00  | SAVE20   | $40.00   | $160.00 |
```

### Gherkin Keywords

- **Feature**: High-level description of functionality
- **Scenario**: A specific example of behavior
- **Given**: Preconditions/context
- **When**: Action/event
- **Then**: Expected outcome
- **And/But**: Additional steps
- **Background**: Common setup for scenarios
- **Scenario Outline**: Parameterized scenarios

## Implementation Examples

### JavaScript/TypeScript with Cucumber

```typescript
// features/shopping-cart.feature
Feature: Shopping Cart
  Scenario: Add item to cart
    Given I have an empty shopping cart
    When I add a "Blue T-Shirt" priced at $19.99
    Then the cart should contain 1 item
    And the cart total should be $19.99

// step-definitions/shopping-cart.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ShoppingCart } from '../src/shopping-cart';
import { Product } from '../src/product';

let shoppingCart: ShoppingCart;
let product: Product;

Given('I have an empty shopping cart', function () {
  shoppingCart = new ShoppingCart();
});

When('I add a {string} priced at ${float}', function (name: string, price: number) {
  product = new Product(name, price);
  shoppingCart.addItem(product);
});

Then('the cart should contain {int} item(s)', function (expectedCount: number) {
  expect(shoppingCart.itemCount).to.equal(expectedCount);
});

Then('the cart total should be ${float}', function (expectedTotal: number) {
  expect(shoppingCart.total).to.equal(expectedTotal);
});

// src/shopping-cart.ts
export class ShoppingCart {
  private items: Product[] = [];

  addItem(product: Product): void {
    this.items.push(product);
  }

  get itemCount(): number {
    return this.items.length;
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

### Python with Behave

```python
# features/user_registration.feature
Feature: User Registration
  As a new user
  I want to create an account
  So that I can access the application

  Scenario: Successful registration with valid data
    Given I am on the registration page
    When I fill in the registration form with:
      | Field    | Value              |
      | Name     | John Doe           |
      | Email    | john@example.com   |
      | Password | SecurePass123!     |
    And I submit the registration form
    Then I should see "Registration successful"
    And I should receive a welcome email at "john@example.com"

# features/steps/user_registration.py
from behave import given, when, then
from selenium import webdriver
from pages.registration_page import RegistrationPage
from services.email_service import EmailService

@given('I am on the registration page')
def step*on*registration_page(context):
    context.browser = webdriver.Chrome()
    context.page = RegistrationPage(context.browser)
    context.page.navigate()

@when('I fill in the registration form with')
def step*fill*registration_form(context):
    for row in context.table:
        field = row['Field']
        value = row['Value']
        context.page.fill_field(field, value)

    # Store email for later verification
    context.user_email = context.table[1]['Value']

@when('I submit the registration form')
def step*submit*form(context):
    context.page.submit_form()

@then('I should see "{message}"')
def step*verify*message(context, message):
    assert context.page.has_message(message), \
        f"Expected to see '{message}' but it was not found"

@then('I should receive a welcome email at "{email}"')
def step*verify*email(context, email):
    email_service = EmailService()
    assert email*service.has*email_for(email), \
        f"No welcome email found for {email}"

# pages/registration_page.py
class RegistrationPage:
    def **init**(self, browser):
        self.browser = browser
        self.url = "https://example.com/register"

    def navigate(self):
        self.browser.get(self.url)

    def fill*field(self, field*name, value):
        field = self.browser.find*element*by*name(field*name.lower())
        field.send_keys(value)

    def submit_form(self):
        submit*button = self.browser.find*element*by*id("submit")
        submit_button.click()

    def has_message(self, message):
        return message in self.browser.page_source
```

### Java with Cucumber-JVM

```java
// src/test/resources/features/payment.feature
Feature: Payment Processing

  Background:
    Given the payment service is available

  Scenario: Process valid credit card payment
    Given a customer with a valid credit card
    When they make a payment of $100.00
    Then the payment should be approved
    And the transaction ID should be generated
    And the customer should receive a confirmation email

// src/test/java/steps/PaymentSteps.java
import io.cucumber.java.en.*;
import static org.junit.Assert.*;

public class PaymentSteps {
    private PaymentService paymentService;
    private Customer customer;
    private PaymentResult result;

    @Given("the payment service is available")
    public void thePaymentServiceIsAvailable() {
        paymentService = new PaymentService();
        assertTrue(paymentService.isAvailable());
    }

    @Given("a customer with a valid credit card")
    public void aCustomerWithValidCreditCard() {
        customer = new Customer("John Doe");
        customer.setCreditCard(new CreditCard("4111111111111111", "12/25", "123"));
    }

    @When("they make a payment of ${double}")
    public void theyMakePayment(double amount) {
        PaymentRequest request = new PaymentRequest(customer, amount);
        result = paymentService.processPayment(request);
    }

    @Then("the payment should be approved")
    public void thePaymentShouldBeApproved() {
        assertEquals(PaymentStatus.APPROVED, result.getStatus());
    }

    @Then("the transaction ID should be generated")
    public void theTransactionIdShouldBeGenerated() {
        assertNotNull(result.getTransactionId());
        assertTrue(result.getTransactionId().matches("[A-Z0-9]{10}"));
    }
}

// src/main/java/services/PaymentService.java
public class PaymentService {
    private final PaymentGateway gateway;
    private final EmailService emailService;

    public PaymentService() {
        this.gateway = new PaymentGateway();
        this.emailService = new EmailService();
    }

    public PaymentResult processPayment(PaymentRequest request) {
        // Validate request
        validatePaymentRequest(request);

        // Process payment through gateway
        GatewayResponse response = gateway.charge(
            request.getCustomer().getCreditCard(),
            request.getAmount()
        );

        // Create result
        PaymentResult result = new PaymentResult(
            response.isApproved() ? PaymentStatus.APPROVED : PaymentStatus.DECLINED,
            response.getTransactionId()
        );

        // Send confirmation if approved
        if (result.getStatus() == PaymentStatus.APPROVED) {
            emailService.sendPaymentConfirmation(
                request.getCustomer().getEmail(),
                result
            );
        }

        return result;
    }
}
```

### Go with Godog

```go
// features/api.feature
Feature: User API

  Scenario: Create new user via API
    Given the API is running
    When I send a POST request to "/users" with:
      """
      {
        "name": "Alice Smith",
        "email": "alice@example.com",
        "age": 30
      }
      """
    Then the response status should be 201
    And the response should contain:
      """
      {
        "id": "<any>",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "age": 30
      }
      """

// features/api_test.go
package features

import (
    "encoding/json"
    "fmt"
    "net/http"
    "strings"

    "github.com/cucumber/godog"
)

type apiFeature struct {
    resp *httptest.ResponseRecorder
    server *httptest.Server
}

func (a *apiFeature) theAPIIsRunning() error {
    router := api.NewRouter()
    a.server = httptest.NewServer(router)
    return nil
}

func (a *apiFeature) iSendARequestToWith(method, path string, body *godog.DocString) error {
    req, err := http.NewRequest(
        method,
        a.server.URL + path,
        strings.NewReader(body.Content),
    )
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }

    a.resp = httptest.NewRecorder()
    a.resp.WriteHeader(resp.StatusCode)

    return nil
}

func (a *apiFeature) theResponseStatusShouldBe(expectedStatus int) error {
    if a.resp.Code != expectedStatus {
        return fmt.Errorf("expected status %d but got %d", expectedStatus, a.resp.Code)
    }
    return nil
}

func InitializeScenario(ctx *godog.ScenarioContext) {
    api := &apiFeature{}

    ctx.Step(`^the API is running$`, api.theAPIIsRunning)
    ctx.Step(`^I send a (GET|POST|PUT|DELETE) request to "([^"]*)" with:$`, api.iSendARequestToWith)
    ctx.Step(`^the response status should be (\d+)$`, api.theResponseStatusShouldBe)
}
```

## BDD Best Practices

### Writing Good Scenarios

#### 1. Focus on Business Value

```gherkin
# ❌ Bad: Technical implementation details
Scenario: Database update
  Given the user table exists
  When I execute "INSERT INTO users VALUES (...)"
  Then the database should have 1 row

# ✅ Good: Business behavior
Scenario: New user registration
  Given I am a new visitor
  When I register with valid details
  Then I should have access to my account
```

#### 2. Keep Scenarios Independent

```gherkin
# ❌ Bad: Dependent on previous scenario
Scenario: Login after registration
  Given I registered in the previous scenario
  When I log in
  Then I should see the dashboard

# ✅ Good: Self-contained
Scenario: Successful login
  Given I have a registered account with email "user@example.com"
  When I log in with valid credentials
  Then I should see the dashboard
```

#### 3. Use Domain Language

```gherkin
# ❌ Bad: Technical jargon
Scenario: API response validation
  When I send HTTP POST to /api/v1/orders
  Then the response code should be 201
  And the JSON should have property "id"

# ✅ Good: Business language
Scenario: Place an order
  When I place an order for 2 items
  Then my order should be confirmed
  And I should receive an order number
```

### Step Definition Best Practices

#### 1. Keep Steps Reusable

```typescript
// ❌ Bad: Too specific
When("I click the blue submit button in the top right", function () {
  const button = this.page.findElement(By.css(".submit-btn.blue.top-right"));
  button.click();
});

// ✅ Good: Reusable
When("I submit the form", function () {
  this.currentPage.submitForm();
});
```

#### 2. Avoid UI Details in Steps

```python
# ❌ Bad: UI-specific
@when('I click the button with id "submit-btn"')
def step*click*button*by*id(context, button_id):
    context.browser.find*element*by*id(button*id).click()

# ✅ Good: Action-focused
@when('I submit my application')
def step*submit*application(context):
    context.application_page.submit()
```

#### 3. Use Page Object Pattern

```typescript
// Page Object
export class LoginPage {
  private emailInput = "#email";
  private passwordInput = "#password";
  private submitButton = "#login-btn";

  async login(email: string, password: string): Promise<void> {
    await page.fill(this.emailInput, email);
    await page.fill(this.passwordInput, password);
    await page.click(this.submitButton);
  }
}

// Step Definition
When("I log in as {string}", async function (email: string) {
  const loginPage = new LoginPage();
  await loginPage.login(email, "password123");
});
```

## BDD in Different Contexts

### API Testing with BDD

```gherkin
Feature: User Management API

  Scenario: Retrieve user information
    Given a user exists with id "12345"
    When I request user details for id "12345"
    Then the response should have status 200
    And the response should contain:
      | field | value           |
      | id    | 12345           |
      | name  | John Doe        |
      | email | john@example.com |
```

### Mobile App BDD

```gherkin
Feature: Mobile Shopping

  Scenario: Browse products offline
    Given I have previously viewed the "Electronics" category
    And I am now offline
    When I open the app
    Then I should see cached products from "Electronics"
    But I should see an "Offline mode" indicator
```

### Microservices BDD

```gherkin
Feature: Order Processing Service

  Scenario: Process order with inventory check
    Given the Inventory Service has 10 units of "SKU-123"
    And the Payment Service is available
    When I place an order for 5 units of "SKU-123"
    Then the order should be confirmed
    And the Inventory Service should show 5 units remaining
    And the Payment Service should process the payment
```

## BDD Tools and Frameworks

### Language-Specific Tools

- **JavaScript/TypeScript**: Cucumber.js, Jest-Cucumber, CodeceptJS
- **Java**: Cucumber-JVM, JBehave, Concordion
- **Python**: Behave, pytest-bdd, Lettuce
- **Ruby**: Cucumber (original), RSpec
- **C#**: SpecFlow, NBehave
- **Go**: Godog, Ginkgo
- **PHP**: Behat, Codeception

### Supporting Tools

- **IDE Plugins**: Gherkin syntax highlighting and step navigation
- **Living Documentation**: Pickles, Cukedoctor
- **Reporting**: Allure, ExtentReports, Serenity BDD
- **CI/CD Integration**: Parallel execution, test filtering

## Common Anti-Patterns

### 1. Imperative vs Declarative

```gherkin
# ❌ Imperative (too detailed)
Scenario: User registration
  Given I open the browser
  And I navigate to "/register"
  And I click on the "Name" field
  And I type "John Doe"
  And I click on the "Email" field
  And I type "john@example.com"
  And I click on the "Submit" button
  Then I should see "Success"

# ✅ Declarative (focused on behavior)
Scenario: User registration
  Given I am on the registration page
  When I register as "John Doe" with email "john@example.com"
  Then I should see a success message
```

### 2. Scenarios as Test Scripts

```gherkin
# ❌ Test script mentality
Scenario: Test login functionality
  Given test user "test123"
  When execute login test
  Then verify test passed

# ✅ Behavior description
Scenario: Successful login
  Given I am a registered user
  When I log in with valid credentials
  Then I should have access to my account
```

### 3. Technical Scenarios

```gherkin
# ❌ Technical focus
Scenario: Database transaction
  Given a database connection
  When I run "BEGIN TRANSACTION"
  And I insert a record
  Then the transaction should commit

# ✅ Business focus
Scenario: Save customer information
  Given I have customer details
  When I save the customer
  Then the customer should be retrievable
```

## BDD Metrics and Benefits

### Metrics to Track

1. **Scenario Coverage**: Percentage of features with BDD scenarios
2. **Step Reusability**: Average number of scenarios per step definition
3. **Execution Time**: Time to run all BDD tests
4. **Failure Rate**: Percentage of failing scenarios
5. **Documentation Currency**: How up-to-date scenarios are

### Benefits

1. **Shared Understanding**: Common language reduces misunderstandings
2. **Living Documentation**: Always current documentation
3. **Test Automation**: Scenarios become automated tests
4. **Early Bug Detection**: Issues found during specification
5. **Better Requirements**: Concrete examples clarify requirements

## Getting Started with BDD

### 1. Start Small

- Choose one feature or user story
- Write 3-5 scenarios
- Implement step definitions
- Run and refine

### 2. Three Amigos Sessions

- Include business, development, and testing perspectives
- Use example mapping to explore scenarios
- Focus on edge cases and unhappy paths

### 3. Build Gradually

- Add scenarios for new features
- Refactor existing tests to BDD
- Create reusable step libraries
- Generate living documentation

### 4. Integration

- Add to CI/CD pipeline
- Generate reports for stakeholders
- Use for acceptance criteria
- Include in definition of done

Remember: BDD is about collaboration and communication. The tools and syntax are just means to achieve better
understanding between all team members.
