# Accessibility First

## Overview

Accessibility First is a design and development approach that prioritizes accessibility from the beginning of any
project. Rather than treating accessibility as an afterthought or a "nice-to-have" feature, this principle recognizes
that designing for users with disabilities leads to better products for everyone.

## Core Concept

"The power of the Web is in its universality. Access by everyone regardless of disability is an essential aspect." - Tim
Berners-Lee

Accessibility First means:

1. **Inclusive by default**: Consider all users from the start
2. **Not just compliance**: Go beyond legal minimums
3. **Universal benefit**: Accessibility improvements help everyone
4. **Integrated process**: Build accessibility into every phase

## Understanding Disability

### Types of Disabilities

```yaml
permanent_disabilities:
  visual:
    - Blindness (285 million people worldwide)
    - Low vision
    - Color blindness (8% of men, 0.5% of women)

  auditory:
    - Deafness (466 million people worldwide)
    - Hard of hearing

  motor:
    - Paralysis
    - Missing limbs
    - Muscular dystrophy
    - Arthritis

  cognitive:
    - Dyslexia (10% of population)
    - ADHD
    - Autism spectrum
    - Memory impairments

temporary_disabilities:
  - Broken arm (motor)
  - Eye surgery recovery (visual)
  - Ear infection (auditory)
  - Concussion (cognitive)

situational_disabilities:
  - Bright sunlight (visual)
  - Noisy environment (auditory)
  - Holding a baby (motor)
  - Stress/fatigue (cognitive)
```

### The Curb-Cut Effect

Just as curb cuts help not only wheelchair users but also people with strollers, luggage, and bicycles, accessible
design benefits everyone:

- **Captions**: Help in noisy environments or when learning languages
- **Voice control**: Useful while driving or cooking
- **High contrast**: Better in bright sunlight
- **Clear navigation**: Helps when distracted or multitasking

## Web Content Accessibility Guidelines (WCAG)

### The Four Principles

#### 1. Perceivable

```html
<!-- BAD: Image without alternative text -->
<img src="chart.png">

<!-- GOOD: Descriptive alt text -->
<img src="chart.png" alt="Sales increased 25% from January to March 2024">

<!-- BAD: Color as the only indicator -->
<p style="color: red">Error: Invalid email</p>

<!-- GOOD: Color plus text/icon -->
<p class="error">
  <svg aria-label="Error">...</svg>
  Error: Invalid email address format
</p>

<!-- BAD: Poor color contrast -->
<button style="background: #fff; color: #ccc">Submit</button>

<!-- GOOD: WCAG AA compliant contrast (4.5:1) -->
<button style="background: #fff; color: #333">Submit</button>
```

#### 2. Operable

```javascript
// BAD: Click-only interaction
element.addEventListener('click', handleAction);

// GOOD: Keyboard accessible
element.addEventListener('click', handleAction);
element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAction(e);
    }
});

// BAD: No visible focus indicator
button:focus {
    outline: none;
}

// GOOD: Clear focus indicator
button:focus {
    outline: 3px solid #0066cc;
    outline-offset: 2px;
}

// BAD: Time limit without warning
setTimeout(() => {
    logoutUser();
}, 300000); // 5 minutes

// GOOD: Warning with option to extend
let timeoutWarning;
let timeoutAction;

function startTimeout() {
    // Warn 1 minute before timeout
    timeoutWarning = setTimeout(() => {
        showWarning('Session expiring in 1 minute. Extend?');
    }, 240000);
    
    timeoutAction = setTimeout(() => {
        logoutUser();
    }, 300000);
}

function extendSession() {
    clearTimeout(timeoutWarning);
    clearTimeout(timeoutAction);
    startTimeout();
}
```

#### 3. Understandable

```html
<!-- BAD: Unclear error message -->
<span class="error">Error</span>

<!-- GOOD: Specific, helpful error -->
<span class="error" role="alert">
  Email must include an @ symbol. Example: user@example.com
</span>

<!-- BAD: Placeholder as label -->
<input type="email" placeholder="Email">

<!-- GOOD: Proper label -->
<label for="email">Email Address</label>
<input type="email" id="email" placeholder="user@example.com">

<!-- BAD: Unexpected behavior -->
<select onchange="this.form.submit()">
  <option>Choose language</option>
  <option>English</option>
  <option>Spanish</option>
</select>

<!-- GOOD: Predictable action -->
<form>
  <label for="language">Choose language</label>
  <select id="language">
    <option>English</option>
    <option>Spanish</option>
  </select>
  <button type="submit">Change Language</button>
</form>
```

#### 4. Robust

```html
<!-- BAD: Div soup with no semantic meaning -->
<div class="header">
  <div class="nav">
    <div class="nav-item" onclick="goTo('home')">Home</div>
  </div>
</div>

<!-- GOOD: Semantic HTML -->
<header>
  <nav>
    <ul>
      <li><a href="/home">Home</a></li>
    </ul>
  </nav>
</header>

<!-- BAD: Custom controls without ARIA -->
<div class="custom-checkbox" onclick="toggle()"></div>

<!-- GOOD: ARIA for custom controls -->
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  aria-label="Subscribe to newsletter"
  onclick="toggle()"
  onkeydown="handleKey(event)"
>
</div>
```

## Implementation Patterns

### Skip Links

```css
/* Skip link implementation */
.skip-link {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem;
  background: #000;
  color: #fff;
  text-decoration: none;
  z-index: 10000;
}
```

```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header><!-- Navigation, etc. --></header>
  <main id="main">
    <!-- Main content -->
  </main>
</body>
```

### Accessible Forms

```html
<!-- Complete accessible form example -->
<form>
  <fieldset>
    <legend>Contact Information</legend>

    <!-- Text input with label -->
    <div class="form-group">
      <label for="name">Full Name (required)</label>
      <input
        type="text"
        id="name"
        name="name"
        required
        aria-required="true"
        aria-describedby="name-error"
      >
      <span id="name-error" class="error" role="alert"></span>
    </div>

    <!-- Radio buttons -->
    <fieldset>
      <legend>Preferred Contact Method</legend>
      <input type="radio" id="contact-email" name="contact" value="email">
      <label for="contact-email">Email</label>

      <input type="radio" id="contact-phone" name="contact" value="phone">
      <label for="contact-phone">Phone</label>
    </fieldset>

    <!-- Accessible custom select -->
    <div class="form-group">
      <label id="country-label">Country</label>
      <div
        role="combobox"
        aria-labelledby="country-label"
        aria-expanded="false"
        aria-haspopup="listbox"
        tabindex="0"
      >
        <span class="selected-value">Select a country</span>
        <ul role="listbox" hidden>
          <li role="option" aria-selected="false">United States</li>
          <li role="option" aria-selected="false">Canada</li>
          <li role="option" aria-selected="false">United Kingdom</li>
        </ul>
      </div>
    </div>
  </fieldset>

  <button type="submit">Submit Form</button>
</form>
```

### Accessible Data Tables

```html
<!-- Accessible data table -->
<table>
  <caption>Q4 2024 Sales by Region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Sales</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$1.2M</td>
      <td>
        <span class="positive">+15%</span>
        <span class="sr-only">increase</span>
      </td>
    </tr>
    <tr>
      <th scope="row">Europe</th>
      <td>$980K</td>
      <td>
        <span class="negative">-5%</span>
        <span class="sr-only">decrease</span>
      </td>
    </tr>
  </tbody>
</table>
```

### Live Regions for Dynamic Content

```html
<!-- Announce dynamic updates -->
<div class="search-container">
  <label for="search">Search products</label>
  <input type="search" id="search" aria-describedby="search-results">

  <!-- Live region for results -->
  <div
    id="search-results"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <!-- Results injected here -->
  </div>
</div>

<script>
  function updateResults(query) {
    const results = searchProducts(query);
    const resultDiv = document.getElementById("search-results");

    if (results.length === 0) {
      resultDiv.textContent = `No results found for "${query}"`;
    } else {
      resultDiv.textContent = `Found ${results.length} products matching "${query}"`;
    }
  }
</script>
```

## Mobile Accessibility

### Touch Targets

```css
/* Ensure adequate touch target size */
.button,
.link,
input[type="checkbox"],
input[type="radio"] {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
}

/* Spacing between targets */
.button + .button {
  margin-left: 8px;
}
```

### Responsive and Accessible

```typescript
class ResponsiveAccessibleMenu {
  constructor(menuElement: HTMLElement) {
    this.menu = menuElement;
    this.toggle = this.menu.querySelector(".menu-toggle");
    this.list = this.menu.querySelector(".menu-list");

    this.init();
  }

  init() {
    // Set initial ARIA states
    this.toggle.setAttribute("aria-expanded", "false");
    this.toggle.setAttribute("aria-controls", "menu-list");
    this.list.id = "menu-list";

    // Handle both click and keyboard
    this.toggle.addEventListener("click", () => this.toggleMenu());
    this.toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleMenu();
      }
    });

    // Handle escape key
    this.menu.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.closeMenu();
        this.toggle.focus();
      }
    });
  }

  toggleMenu() {
    const isOpen = this.toggle.getAttribute("aria-expanded") === "true";
    this.toggle.setAttribute("aria-expanded", !isOpen);
    this.list.hidden = isOpen;

    if (!isOpen) {
      // Focus first menu item when opening
      const firstItem = this.list.querySelector("a");
      if (firstItem) firstItem.focus();
    }
  }
}
```

## Testing for Accessibility

### Automated Testing

```javascript
// Jest + jest-axe for unit testing accessibility
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Button Component", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(
      <Button onClick={mockClick}>Click me</Button>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should be keyboard accessible", () => {
    const { getByRole } = render(
      <Button onClick={mockClick}>Click me</Button>,
    );

    const button = getByRole("button");

    // Simulate keyboard interaction
    fireEvent.keyDown(button, { key: "Enter" });
    expect(mockClick).toHaveBeenCalled();
  });
});
```

### Manual Testing Checklist

```markdown
## Keyboard Navigation Testing

- [ ] Can access all interactive elements with Tab
- [ ] Can activate buttons with Enter/Space
- [ ] Can escape from modals with Esc
- [ ] Focus indicator is always visible
- [ ] No keyboard traps
- [ ] Tab order is logical

## Screen Reader Testing

- [ ] All images have appropriate alt text
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Headings create logical outline
- [ ] Tables have proper headers

## Visual Testing

- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Information not conveyed by color alone
- [ ] Text can be resized to 200% without loss
- [ ] Content reflows at 320px width
- [ ] No horizontal scrolling required

## Interaction Testing

- [ ] Touch targets are at least 44x44px
- [ ] Sufficient spacing between targets
- [ ] Gestures have alternatives
- [ ] Time limits can be extended
- [ ] No seizure-inducing content
```

### Screen Reader Testing Example

```javascript
// What screen reader users hear
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a href="/" aria-current="page">Home</a>
    </li>
    <li>
      <a href="/about">About</a>
    </li>
    <li>
      <a href="/products" aria-haspopup="true" aria-expanded="false">
        Products
      </a>
      <ul>
        <li>
          <a href="/products/software">Software</a>
        </li>
        <li>
          <a href="/products/hardware">Hardware</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>;

// Screen reader output:
// "Main navigation, navigation"
// "List, 3 items"
// "Home, link, current page"
// "About, link"
// "Products, link, has popup, collapsed"
```

## Common Accessibility Mistakes

### 1. Missing Focus Indicators

```css
/* BAD: Removing focus indicators */
*:focus {
  outline: none;
}

/* GOOD: Custom focus indicators */
*:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* BETTER: Different indicators for keyboard vs mouse */
:focus:not(:focus-visible) {
  outline: none; /* Remove for mouse users */
}

:focus-visible {
  outline: 3px solid #0066cc; /* Show for keyboard users */
  outline-offset: 2px;
}
```

### 2. Poor Error Handling

```jsx
// BAD: Inaccessible error handling
function Form() {
  const [error, setError] = useState("");

  return (
    <form>
      {error && <div className="error">{error}</div>}
      <input type="email" placeholder="Email" />
    </form>
  );
}

// GOOD: Accessible error handling
function Form() {
  const [error, setError] = useState("");
  const errorId = "email-error";

  return (
    <form>
      <label htmlFor="email">
        Email Address
        {error && <span className="required">(required)</span>}
      </label>
      <input
        type="email"
        id="email"
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        aria-required="true"
      />
      {error && (
        <div id={errorId} role="alert" className="error">
          {error}
        </div>
      )}
    </form>
  );
}
```

### 3. Inaccessible Custom Components

```typescript
// BAD: Custom dropdown without accessibility
class CustomDropdown {
  constructor(element: HTMLElement) {
    this.element = element;
    this.button = element.querySelector(".dropdown-button");
    this.menu = element.querySelector(".dropdown-menu");

    this.button.addEventListener("click", () => {
      this.menu.classList.toggle("show");
    });
  }
}

// GOOD: Accessible custom dropdown
class AccessibleDropdown {
  private isOpen = false;
  private currentIndex = -1;

  constructor(private element: HTMLElement) {
    this.button = element.querySelector(".dropdown-button");
    this.menu = element.querySelector(".dropdown-menu");
    this.items = this.menu.querySelectorAll('[role="menuitem"]');

    this.init();
  }

  init() {
    // Set ARIA attributes
    this.button.setAttribute("aria-haspopup", "true");
    this.button.setAttribute("aria-expanded", "false");
    this.menu.setAttribute("role", "menu");

    // Keyboard navigation
    this.button.addEventListener("click", () => this.toggle());
    this.button.addEventListener("keydown", (e) => this.handleButtonKeydown(e));
    this.menu.addEventListener("keydown", (e) => this.handleMenuKeydown(e));

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!this.element.contains(e.target as Node)) {
        this.close();
      }
    });
  }

  handleButtonKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        this.open();
        this.focusItem(0);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.open();
        this.focusItem(this.items.length - 1);
        break;
    }
  }

  handleMenuKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.focusItem(this.currentIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.focusItem(this.currentIndex - 1);
        break;
      case "Escape":
        this.close();
        this.button.focus();
        break;
      case "Home":
        e.preventDefault();
        this.focusItem(0);
        break;
      case "End":
        e.preventDefault();
        this.focusItem(this.items.length - 1);
        break;
    }
  }

  focusItem(index: number) {
    if (index < 0) index = this.items.length - 1;
    if (index >= this.items.length) index = 0;

    this.currentIndex = index;
    (this.items[index] as HTMLElement).focus();
  }

  open() {
    this.isOpen = true;
    this.menu.hidden = false;
    this.button.setAttribute("aria-expanded", "true");
  }

  close() {
    this.isOpen = false;
    this.menu.hidden = true;
    this.button.setAttribute("aria-expanded", "false");
    this.currentIndex = -1;
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}
```

## Accessibility in Different Contexts

### Progressive Web Apps

```javascript
// Accessible offline notification
class OfflineNotification {
  constructor() {
    this.notification = this.createNotification();
    this.init();
  }

  createNotification() {
    const div = document.createElement("div");
    div.className = "offline-notification";
    div.setAttribute("role", "status");
    div.setAttribute("aria-live", "polite");
    div.setAttribute("aria-atomic", "true");
    div.hidden = true;

    div.innerHTML = `
            <span class="offline-icon" aria-hidden="true">📵</span>
            <span class="offline-text">You are currently offline</span>
            <button class="dismiss-button" aria-label="Dismiss offline notification">
                <span aria-hidden="true">×</span>
            </button>
        `;

    document.body.appendChild(div);
    return div;
  }

  init() {
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    const dismissButton = this.notification.querySelector(".dismiss-button");
    dismissButton.addEventListener("click", () => this.dismiss());
  }

  handleOffline() {
    this.notification.hidden = false;
    this.notification.querySelector(".offline-text").textContent =
      "You are currently offline. Some features may be limited.";
  }

  handleOnline() {
    this.notification.querySelector(".offline-text").textContent = "You are back online!";
    setTimeout(() => this.dismiss(), 3000);
  }

  dismiss() {
    this.notification.hidden = true;
  }
}
```

### Single Page Applications

```typescript
// Accessible route announcements for SPAs
class AccessibleRouter {
  private announcer: HTMLElement;

  constructor() {
    this.createAnnouncer();
    this.init();
  }

  createAnnouncer() {
    this.announcer = document.createElement("div");
    this.announcer.setAttribute("role", "status");
    this.announcer.setAttribute("aria-live", "assertive");
    this.announcer.setAttribute("aria-atomic", "true");
    this.announcer.className = "sr-only";
    document.body.appendChild(this.announcer);
  }

  init() {
    // Listen for route changes
    window.addEventListener("popstate", () => this.announceRoute());

    // Override pushState to catch programmatic navigation
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.announceRoute();
    };
  }

  announceRoute() {
    // Get page title or heading
    const pageTitle = document.title ||
      document.querySelector("h1")?.textContent ||
      "New page";

    // Announce to screen readers
    this.announcer.textContent = `Navigated to ${pageTitle}`;

    // Move focus to main content
    const main = document.querySelector("main") || document.body;
    main.tabIndex = -1;
    main.focus();

    // Reset tabindex after focus
    main.addEventListener("blur", () => {
      main.removeAttribute("tabindex");
    }, { once: true });
  }
}
```

## Building an Accessibility-First Culture

### Development Process

```yaml
accessibility_workflow:
  planning:
    - Include accessibility in user stories
    - Define success criteria including a11y
    - Consider assistive technology users

  design:
    - Use accessible color palettes
    - Design for keyboard navigation
    - Create focus state designs
    - Annotate accessibility requirements

  development:
    - Use semantic HTML
    - Test with keyboard regularly
    - Run automated checks in CI/CD
    - Pair with accessibility experts

  testing:
    - Include in definition of done
    - Test with real assistive technologies
    - Include users with disabilities
    - Document accessibility features

  deployment:
    - Monitor accessibility metrics
    - Track and fix issues quickly
    - Gather user feedback
    - Continuous improvement
```

### Team Training

```javascript
// Accessibility training exercises
const a11yTrainingExercises = {
  screenReaderChallenge: {
    description: "Navigate your app using only a screen reader",
    duration: "30 minutes",
    goals: [
      "Complete a user journey",
      "Find and fix 3 accessibility issues",
      "Document the experience",
    ],
  },

  keyboardOnlyDay: {
    description: "Use only keyboard for a full day",
    goals: [
      "No mouse/trackpad usage",
      "Document frustrations",
      "Identify improvement areas",
    ],
  },

  empathyExercises: {
    simulations: [
      "Use screen with color blindness filter",
      "Navigate with screen zoomed to 200%",
      "Use computer with thick gloves (motor impairment)",
      "Complete tasks with distractions (cognitive load)",
    ],
  },
};
```

## Conclusion

Accessibility First is not just about compliance or reaching users with disabilities—it's about creating better products
for everyone. When we design with constraints in mind, we create more innovative, usable, and robust solutions.

Key principles to remember:

1. **Start early**: Accessibility is much easier to build in than bolt on
2. **Test with real users**: Nothing beats feedback from actual users with disabilities
3. **Automate what you can**: But remember automation catches only ~30% of issues
4. **Make it part of the process**: Not a separate phase or checklist
5. **Learn continuously**: Accessibility guidelines and best practices evolve

Remember: "When we design for disability first, we often stumble upon solutions that are better than those when we
design for the norm." - Elise Roy

## Related Concepts

### Related Principles

- **[User-Centered Design](user-centered-design.md)** - Focus on all users' needs
- **[Inclusive Design](inclusive-design.md)** - Design for human diversity
- **[Privacy by Design](privacy-by-design.md)** - Respect user preferences and needs
- **[Ethical Design](ethical-design.md)** - Consider societal impact

### Compatible Standards

- **[WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)** - Web Content Accessibility Guidelines
- **[ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)** - Accessible Rich Internet Applications
- **[Section 508](https://www.section508.gov/)** - US Federal accessibility standards

### Compatible Methodologies

- **[User-Centered Design Process](../../methodologies/ucd/ucd.md)** - Include users with disabilities
- **[Agile Development](../../methodologies/agile/agile.md)** - Integrate accessibility into sprints

### Testing Tools

- **axe DevTools** - Browser extension for accessibility testing
- **WAVE** - Web Accessibility Evaluation Tool
- **NVDA/JAWS** - Screen readers for Windows
- **VoiceOver** - Built-in macOS/iOS screen reader
- **Lighthouse** - Automated accessibility audits

### Learn More

- Use `aichaku learn accessibility-first` for interactive examples
- Use `aichaku principles --select accessibility-first` to add to your project
- Join the [A11y Project](https://www.a11yproject.com/) community
