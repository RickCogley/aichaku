# Write the Docs Principles

## Quick Reference

Write the Docs is a community of people who care about documentation. This guide
incorporates community-driven best practices for creating documentation that is
helpful, accessible, and maintainable.

### Core Values

1. **👥 Community-Driven** - Documentation is a community effort
2. **📝 Docs as Code** - Treat documentation like source code
3. **🔄 Iterative** - Documentation is never "done"
4. **🎯 User-Focused** - Write for your reader's success
5. **🌈 Inclusive** - Welcome all contributors and readers

## Tutorial Guidelines

### Purpose

Guide newcomers through their first successful experience with your project.

### Structure

````markdown
# Getting Started with {{Project Name}}

Welcome! This tutorial walks you through using {{Project}} for the first time.
By the end, you'll have {{specific achievement}} and understand the basics of
{{key concepts}}.

## Before You Begin

This tutorial takes about [time] to complete.

### What You'll Need

- [Requirement]: [Why it's needed]
- [Requirement]: [Version required and why]
- Basic familiarity with [prerequisite knowledge]

> 💡 **New to [prerequisite]?** Check out [this gentle introduction](link)
> first.

### What We'll Build

[Screenshot or diagram of the final result]

In this tutorial, we'll create [description of the end result]. This will teach
you:

- How [Project] handles [concept 1]
- The basics of [concept 2]
- Why [concept 3] matters

## Step 1: Set Up Your Environment

First, let's make sure everything is installed correctly.

### Install [Project]

Open your terminal and run:

```bash
# For macOS/Linux
curl -sSL https://install.example.com | sh

# For Windows
iwr -useb https://install.example.com | iex
```
````

<details>
<summary>🔧 Troubleshooting installation issues</summary>

**Permission denied error?** Try running with elevated permissions:

```bash
sudo curl -sSL https://install.example.com | sh
```

**Behind a proxy?** Set your proxy environment variables first:

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
```

</details>

### Verify Your Installation

Check that everything is working:

```bash
project --version
```

You should see something like:

```
Project version 1.2.3
```

✅ **Checkpoint**: You now have [Project] installed and ready to use!

## Step 2: Create Your First [Thing]

Now for the fun part - let's create something!

### Understanding the Basics

Before we dive in, here's a quick overview:

- **[Term 1]**: [Plain English explanation]
- **[Term 2]**: [Another clear explanation]

Don't worry if this doesn't all make sense yet - it will become clearer as we
work through the example.

### Create the Project Structure

1. Create a new directory for your project:

   ```bash
   mkdir my-first-project
   cd my-first-project
   ```

2. Initialize a new [Project] configuration:

   ```bash
   project init
   ```

   This creates a basic structure:

   ```
   my-first-project/
   ├── config.yaml     # Your project configuration
   ├── src/           # Your source files go here
   └── README.md      # Project documentation
   ```

3. Open `config.yaml` in your favorite editor and update it:

   ```yaml
   # Before
   name: my-project
   version: 0.1.0

   # After
   name: my-first-project
   version: 0.1.0
   description: Learning [Project] with the tutorial
   ```

### Write Your First [Component]

Create a new file `src/hello.ext`:

```language
// This is your first [component]
// It demonstrates [what it shows]

[actual code here]
```

Let's break down what this does:

- **Line 1-2**: Comments explaining the purpose
- **Line 4**: [Explanation of key line]
- **Line 5**: [Explanation of another important part]

### Run Your Code

Time to see it in action:

```bash
project run src/hello.ext
```

You should see:

```
[Expected output]
Success! Your first [component] is working.
```

🎉 **Congratulations!** You just created and ran your first [Project] program!

## Step 3: Make It Interactive

Let's enhance our program to do something more interesting.

[Continue with progressively more complex steps...]

## What You've Learned

You've successfully:

- ✅ Installed [Project] and verified it works
- ✅ Created your first [component]
- ✅ Learned about [key concept 1] and [key concept 2]
- ✅ Built a working [description]

### Quick Reference

Here are the commands you learned:

| Command         | What it does           |
| --------------- | ---------------------- |
| `project init`  | Create a new project   |
| `project run`   | Execute your code      |
| `project build` | Compile for production |

## What's Next?

You're ready to explore more:

1. **[How-to: Connect to a Database]** - Add persistence to your project
2. **[How-to: Deploy Your Project]** - Share your creation with the world
3. **[Understanding [Core Concept]]** - Deep dive into how [Project] works

### Join the Community

- 💬 [Discord/Slack/Forum] - Get help and share what you build
- 🐛 [Issue Tracker] - Report bugs or request features
- 📚 [Documentation] - Explore all features in detail

Remember: everyone started where you are now. Don't hesitate to ask questions!

````
### Write the Docs Notes for Tutorials

- **Progressive disclosure**: Introduce concepts as needed, not all upfront
- **Checkpoints**: Help readers verify they're on track
- **Troubleshooting inline**: Address problems where they might occur
- **Celebrate success**: Acknowledge accomplishments along the way
- **Community connection**: Show readers they're not alone

## How-to Guide Guidelines

### Purpose
Help users accomplish specific tasks efficiently, assuming basic familiarity with the project.

### Structure
```markdown
# How to [Specific Task]

This guide shows you how to [task description]. This is useful when you need to [use case/scenario].

**Time:** About [X] minutes
**Difficulty:** [Beginner | Intermediate | Advanced]

## Prerequisites

Before starting, ensure you have:
- [ ] [Prerequisite 1] ([how to verify])
- [ ] [Prerequisite 2] ([link to setup guide])
- [ ] [Required permission or access]

## Overview

We'll accomplish this task by:
1. [High-level step 1]
2. [High-level step 2]
3. [High-level step 3]

## Step-by-Step Instructions

### 1. Prepare Your Environment

First, we need to set up [what and why]:

```bash
# Set necessary environment variables
export PROJECT_ENV=production
export API_KEY=your-api-key-here
````

> 📝 **Note**: Store sensitive values like API keys in a `.env` file. See
> [Managing Secrets](link) for details.

### 2. [Main Action]

Now we'll [what you're doing and why]:

```bash
project command --option value \
  --another-option \
  --verbose
```

**What's happening here:**

- `--option value`: [Explanation]
- `--another-option`: [Why you need this]
- `--verbose`: Shows detailed output (helpful for debugging)

<details>
<summary>Alternative: Using the configuration file</summary>

Instead of command-line options, you can use a configuration file:

```yaml
# config.yaml
options:
  option: value
  another_option: true
  verbose: true
```

Then run:

```bash
project command --config config.yaml
```

</details>

### 3. Verify Success

Check that your [task] completed successfully:

```bash
project status --check [thing-you-created]
```

Expected output:

```
Status: Active
Health: Healthy
Last Updated: 2023-10-15 14:30:00
```

## Common Variations

### Using with Docker

If you're running [Project] in Docker:

```dockerfile
FROM project:latest
COPY config.yaml /app/
RUN project command --config /app/config.yaml
```

### Automating with CI/CD

For GitHub Actions:

```yaml
- name: Run [task]
  env:
    PROJECT*ENV: ${{ secrets.PROJECT*ENV }}
  run: |
    project command --option ${{ inputs.value }}
```

## Troubleshooting

<details>
<summary>❌ Error: "Permission denied"</summary>

This usually means you don't have the required access. Check:

1. You're authenticated: `project auth status`
2. You have the right role: `project iam check`
3. The resource exists: `project list resources`

</details>

<details>
<summary>❌ Error: "Resource not found"</summary>

Verify:

- The resource name is spelled correctly
- You're in the right project/namespace
- The resource hasn't been deleted

Run `project list resources --all` to see available resources.

</details>

<details>
<summary>⚠️ Task succeeds but doesn't work as expected</summary>

Common causes:

1. **Caching**: Try clearing cache with `project cache clear`
2. **Timing**: Some changes take a few minutes to propagate
3. **Configuration**: Double-check your settings match the examples

</details>

## Related Tasks

- [How to Update [Thing]](link) - Modify existing resources
- [How to Delete [Thing]](link) - Clean up when done
- [How to Monitor [Thing]](link) - Track performance and health

## Further Reading

- [Architecture Overview](link) - Understand how this fits in the bigger picture
- [Best Practices for [Topic]](link) - Optimize your approach
- [API Reference](link) - Complete options and parameters

````
### Write the Docs Notes for How-to Guides

- **Scannable structure**: Users should quickly find what they need
- **Copy-paste friendly**: Code blocks should work as-is
- **Multiple approaches**: Show different ways when they exist
- **Troubleshooting**: Anticipate and address common problems
- **Time estimates**: Help users plan their work

## Reference Guidelines

### Purpose
Provide comprehensive technical details for users who need complete information.

### Structure
```markdown
# [Component] API Reference

## Overview

The [Component] API provides [what it does]. Use this API to [common use cases].

**Base URL**: `https://api.example.com/v1`
**Authentication**: Bearer token required
**Rate Limits**: 1000 requests per hour

## Quick Start

```bash
# Minimal working example
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/v1/resources
````

## Authentication

All requests require authentication using a Bearer token in the Authorization
header:

```
Authorization: Bearer YOUR*API*TOKEN
```

To get an API token:

1. Log in to your account
2. Navigate to Settings > API Tokens
3. Click "Generate New Token"
4. Copy the token (you won't see it again)

## Endpoints

### `GET /resources`

List all resources in your account.

#### Parameters

| Name       | Type    | Required | Description                                     |
| ---------- | ------- | -------- | ----------------------------------------------- |
| `page`     | integer | No       | Page number (default: 1)                        |
| `per_page` | integer | No       | Results per page (default: 20, max: 100)        |
| `sort`     | string  | No       | Sort field: `created`, `updated`, `name`        |
| `order`    | string  | No       | Sort order: `asc`, `desc` (default: `desc`)     |
| `filter`   | string  | No       | Filter expression (see [Filtering](#filtering)) |

#### Request Example

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/v1/resources?page=2&per_page=50&sort=created"
```

#### Response

```json
{
  "data": [
    {
      "id": "res_123abc",
      "name": "My Resource",
      "type": "standard",
      "created_at": "2023-10-15T10:30:00Z",
      "updated_at": "2023-10-15T14:45:00Z",
      "status": "active",
      "metadata": {
        "owner": "user@example.com",
        "tags": ["production", "critical"]
      }
    }
  ],
  "pagination": {
    "page": 2,
    "per_page": 50,
    "total": 247,
    "pages": 5
  }
}
```

#### Response Codes

| Code | Meaning                           |
| ---- | --------------------------------- |
| 200  | Success                           |
| 400  | Invalid parameters                |
| 401  | Missing or invalid authentication |
| 429  | Rate limit exceeded               |
| 500  | Server error                      |

### `POST /resources`

Create a new resource.

#### Request Body

```json
{
  "name": "My Resource",
  "type": "standard",
  "configuration": {
    "setting1": "value1",
    "setting2": true
  },
  "metadata": {
    "tags": ["production"]
  }
}
```

#### Field Descriptions

- `name` (string, required): Display name for the resource
  - Constraints: 1-255 characters, unique within account
  - Example: `"Production Database"`

- `type` (string, required): Resource type
  - Valid values: `"standard"`, `"premium"`, `"enterprise"`
  - Default: `"standard"`

- `configuration` (object, optional): Type-specific settings
  - See [Configuration Options](#configuration-options) for details

- `metadata` (object, optional): Additional metadata
  - `tags` (array of strings): Labels for organization
  - Custom fields allowed

#### Response

```json
{
  "id": "res_789xyz",
  "name": "My Resource",
  "type": "standard",
  "created_at": "2023-10-15T16:00:00Z",
  "status": "provisioning",
  "links": {
    "self": "https://api.example.com/v1/resources/res_789xyz",
    "status": "https://api.example.com/v1/resources/res_789xyz/status"
  }
}
```

### `DELETE /resources/{id}`

Delete a resource.

#### Parameters

- `id` (string, required): Resource ID

#### Request Example

```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/v1/resources/res_123abc
```

#### Response

- **204 No Content**: Resource deleted successfully
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource has dependencies that must be removed first

## Data Types

### Resource Object

```typescript
interface Resource {
  id: string; // Unique identifier
  name: string; // Display name
  type: "standard" | "premium" | "enterprise";
  status: "active" | "provisioning" | "error" | "deleted";
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  configuration?: Configuration;
  metadata?: Record<string, any>;
}
```

### Configuration Object

Configuration varies by resource type:

#### Standard Configuration

```typescript
interface StandardConfiguration {
  size: "small" | "medium" | "large";
  region: string;
  backup_enabled: boolean;
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "RESOURCE*NOT*FOUND",
    "message": "The requested resource does not exist",
    "details": {
      "resource*id": "res*123abc"
    },
    "request*id": "req*987zyx"
  }
}
```

### Error Codes

| Code                 | Description               | Action                          |
| -------------------- | ------------------------- | ------------------------------- |
| `INVALID_REQUEST`    | Request validation failed | Check the `details` field       |
| `UNAUTHORIZED`       | Invalid or missing auth   | Verify your API token           |
| `FORBIDDEN`          | Insufficient permissions  | Check account permissions       |
| `RESOURCE*NOT*FOUND` | Resource doesn't exist    | Verify the ID                   |
| `RATE_LIMITED`       | Too many requests         | Wait and retry                  |
| `SERVER*ERROR`       | Internal error            | Contact support with request*id |

## Rate Limiting

Rate limits are applied per API token:

- **Standard tier**: 1,000 requests/hour
- **Premium tier**: 10,000 requests/hour
- **Enterprise tier**: Custom limits

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 942
X-RateLimit-Reset: 1697382000
```

## Filtering

Use the `filter` parameter to search resources:

```
# Simple equality
filter=status:active

# Multiple conditions (AND)
filter=status:active,type:premium

# Pattern matching
filter=name:prod*

# Metadata filtering
filter=metadata.tags:production
```

## Webhooks

Configure webhooks to receive real-time notifications:

```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["resource.created", "resource.deleted"],
  "secret": "your-webhook-secret"
}
```

See [Webhook Events](link) for the complete list of available events.

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ApiClient } from "@example/sdk";

const client = new ApiClient({
  token: process.env.API_TOKEN,
});

// List resources
const resources = await client.resources.list({
  page: 1,
  perPage: 50,
});

// Create resource
const newResource = await client.resources.create({
  name: "My Resource",
  type: "standard",
});
```

### Python

```python
from example_sdk import ApiClient

client = ApiClient(token=os.environ['API_TOKEN'])

# List resources
resources = client.resources.list(page=1, per_page=50)

# Create resource
new_resource = client.resources.create(
    name='My Resource',
    type='standard'
)
```

## Changelog

### v1.2.0 (2023-10-01)

- Added filtering support
- Improved error messages
- New `metadata` field on resources

### v1.1.0 (2023-07-15)

- Webhook support
- Pagination headers
- Rate limit increase for premium

See [Full Changelog](link) for complete history.

````
### Write the Docs Notes for References

- **Completeness**: Document every parameter, response, and error
- **Examples everywhere**: Show actual requests and responses
- **Progressive detail**: Start with common use cases, add complexity
- **Code samples**: Include multiple languages when possible
- **Versioning**: Track changes that affect users

## Explanation Guidelines

### Purpose
Help users understand the why behind the what - concepts, architecture, and design decisions.

### Structure
```markdown
# Understanding [Concept/System]

[Opening that connects to user needs and sets context]

## The Challenge

Before diving into how [concept] works, let's understand the problem it solves.

Imagine you're building [relatable scenario]. You need to:
- [Requirement 1 that seems simple]
- [Requirement 2 that adds complexity]
- [Requirement 3 that makes it challenging]

Traditional approaches like [alternative] fall short because [specific limitations]. This is where [concept] comes in.

## Core Concepts

### [Fundamental Concept 1]

[Plain language explanation using an analogy if helpful]

Think of it like [analogy]. When you [action in analogy], you [result]. Similarly, [concept] works by [parallel explanation].

**Key insight**: [The main thing to remember]

### [Fundamental Concept 2]

[Continue pattern...]

## How It Works

Let's trace through what happens when you [common user action]:
````

User Action ↓ [Component 1] → "Validates and prepares request" ↓ [Component 2] →
"Processes according to rules" ↓ [Component 3] → "Returns formatted result" ↓
User sees result

````
### Step-by-Step Breakdown

1. **Initial Request**
   When you [action], the system first [what happens]. This is important because [why it matters].

2. **Processing Phase**
   Next, [component] takes your request and [detailed explanation]. During this phase:
   - [Sub-step 1]: [What and why]
   - [Sub-step 2]: [What and why]

3. **Result Generation**
   Finally, [explanation of how results are created and returned].

### A Real Example

Let's make this concrete with an actual example:

```python
# User code
result = system.process("Hello, World!")

# What happens internally:
# 1. Validation: Checks input is valid string
# 2. Transformation: Applies configured rules
# 3. Caching: Stores for future use
# 4. Return: Sends back processed result
````

## Design Decisions

### Why [Specific Choice]?

You might wonder why we [design decision] instead of [alternative]. Here's our
thinking:

**Option 1: [The alternative]**

- ✅ Pro: [Advantage]
- ❌ Con: [Disadvantage that matters for our use case]

**Option 2: [Our choice]**

- ✅ Pro: [Advantage that addresses the con above]
- ✅ Pro: [Additional benefit]
- ⚠️ Trade-off: [Honest acknowledgment of any downsides]

We chose Option 2 because [reasoning tied to user needs].

### Performance Considerations

[Concept] is optimized for [specific use case]. This means:

- **Fast**: [Specific performance characteristic]
- **Efficient**: [Resource usage explanation]
- **Scalable**: [How it handles growth]

However, this optimization comes with trade-offs:

- [Trade-off 1]: [Impact and when it matters]
- [Trade-off 2]: [How to work around if needed]

## Common Patterns

### Pattern 1: [Descriptive Name]

**When to use**: [Specific scenario]

**How it works**:

```
[Visual representation or code example]
```

**Why it's effective**: [Benefits in this context]

### Pattern 2: [Another Pattern]

[Continue structure...]

## Comparison with Alternatives

Let's compare [concept] with similar approaches:

| Aspect          | [This Concept]    | [Alternative 1]   | [Alternative 2]   |
| --------------- | ----------------- | ----------------- | ----------------- |
| **Use Case**    | [Best for]        | [Best for]        | [Best for]        |
| **Performance** | [Characteristics] | [Characteristics] | [Characteristics] |
| **Complexity**  | [Learning curve]  | [Learning curve]  | [Learning curve]  |
| **Flexibility** | [Customization]   | [Customization]   | [Customization]   |

### When to Choose [Concept]

Choose [concept] when:

- ✅ Your priority is [specific need]
- ✅ You need [specific capability]
- ✅ Your team is comfortable with [specific requirement]

Consider alternatives when:

- 🤔 You need [different priority]
- 🤔 Your constraints include [specific limitation]
- 🤔 You're already using [conflicting technology]

## Real-World Example

Let's look at how [Example Company] uses [concept] in production:

**Challenge**: They needed to [specific business need]

**Solution**: They implemented [concept] with these customizations:

- [Customization 1]: To handle [specific requirement]
- [Customization 2]: To integrate with [existing system]

**Results**:

- [Quantified improvement 1]
- [Quantified improvement 2]
- [Qualitative benefit]

**Lessons Learned**:

> "[Quote from engineering team about key insight]"

## Going Deeper

### For the Curious

If you want to understand the internals:

1. **[Internal Component 1]**: [Link to deep dive]
2. **[Algorithm/Approach]**: [Link to technical paper]
3. **[Implementation Details]**: [Link to source code]

### Related Concepts

To fully understand [concept], it helps to know about:

- **[Related Concept 1]**: [Brief description and link]
- **[Related Concept 2]**: [How it connects]
- **[Related Concept 3]**: [Why it matters]

## Summary

[Concept] provides [key benefit] by [how it works at high level]. The key things
to remember:

1. **[Main takeaway 1]**
2. **[Main takeaway 2]**
3. **[Main takeaway 3]**

Whether you're [use case 1] or [use case 2], understanding these principles will
help you [benefit].

## Further Reading

- 📖 [Academic Paper]: Original research behind [concept]
- 🛠️ [Implementation Guide]: Step-by-step deployment
- 💬 [Community Discussion]: Real experiences and tips
- 📹 [Video Explanation]: Visual walkthrough of concepts

````
### Write the Docs Notes for Explanations

- **Start with why**: Connect to real problems users face
- **Build understanding gradually**: Layer complexity appropriately
- **Use multiple formats**: Text, diagrams, code, tables
- **Be honest**: Acknowledge limitations and trade-offs
- **Provide paths**: Different readers need different depths

## General Write the Docs Guidelines

### Documentation as Code

#### Version Control
- Keep docs in the same repo as code
- Review docs changes like code changes
- Tag documentation versions with releases

#### Automation
```yaml
# Example CI/CD for docs
name: Documentation
on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'src/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build docs
        run: make docs
      - name: Test links
        run: make test-links
      - name: Deploy
        run: make deploy-docs
````

#### Testing Documentation

- Validate all links
- Test code examples
- Check for outdated information
- Verify screenshots are current

### Community Contributions

#### Making Docs Contributable

```markdown
<!-- At the end of each doc -->

---

## Contribute to This Doc

Notice something wrong? Have a better explanation? We'd love your help!

- 📝 [Edit this page](github-edit-link)
- 💬 [Discuss improvements](discussion-link)
- 🐛 [Report issues](issue-link)

### Contributor Notes

- Keep the same friendly, helpful tone
- Test any code examples you add
- Update the "Last Updated" date
- Add yourself to contributors if you'd like
```

#### Review Guidelines

When reviewing documentation PRs:

1. **Accuracy**: Is the information correct?
2. **Clarity**: Will readers understand?
3. **Completeness**: Is anything missing?
4. **Consistency**: Does it match our style?
5. **Currency**: Is it up-to-date?

### Inclusive Documentation

#### Language Choices

- Use "they" as singular pronoun
- Avoid idioms and cultural references
- Choose descriptive, neutral terms
- Welcome all skill levels

#### Global Audience

- Spell out abbreviations first time
- Include timezone info for times
- Use ISO date formats (2023-10-15)
- Provide multiple examples with diverse names/locations

#### Accessibility

- Alt text for all images
- Descriptive link text
- Consistent structure
- Keyboard navigation friendly

### Maintenance

#### Keeping Docs Fresh

```markdown
<!-- Documentation header --> ---

## title: How to Configure Widgets last_updated: 2023-10-15 version: 2.3.0 contributors: [alice, bob, carlos]

> ⚠️ **Version Note**: This guide is for version 2.3+. For earlier versions, see
> [archived docs](link).
```

#### Regular Reviews

- Quarterly doc audits
- Post-release updates
- Community feedback integration
- Analytics-driven improvements

### Documentation Ecosystem

#### Types of Documentation

1. **README**: Project overview and quick start
2. **Tutorials**: Hand-holding walkthroughs
3. **How-to Guides**: Task-focused instructions
4. **References**: Complete technical details
5. **Explanations**: Conceptual understanding
6. **Examples**: Working code samples
7. **Troubleshooting**: Problem-solving guides
8. **FAQ**: Common questions
9. **Glossary**: Term definitions
10. **Contributing**: How to help

#### Information Architecture

Organize by:

- User journey (beginner → advanced)
- Use cases (scenarios)
- Features (functionality)
- Tasks (what users do)

### Metrics and Feedback

#### What to Measure

- Page views and time on page
- Search queries (what can't they find?)
- Feedback ratings
- Support ticket themes
- Documentation coverage

#### Gathering Feedback

```markdown
<!-- Feedback widget -->

## Was This Helpful?

<feedback-widget>
  <button>👍 Yes</button>
  <button>👎 No</button>
  <textarea>What could be better?</textarea>
</feedback-widget>

Questions? Ask in our [community forum](link) or [chat](link).
```

## Summary

Write the Docs principles emphasize:

1. **Documentation is everyone's job** - Not just technical writers
2. **Iterate based on feedback** - Docs are never "done"
3. **Lower barriers to contribution** - Make it easy to help
4. **Focus on user success** - Measure by user outcomes
5. **Build community** - Documentation connects people

Remember: The best documentation is the one that helps your users succeed at
their goals. Everything else is implementation details.
