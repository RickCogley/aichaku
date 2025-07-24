# Diátaxis + Google Developer Documentation Style Guide

## Quick Reference

The Diátaxis framework organizes documentation into four distinct modes, each
serving a specific user need. Combined with Google's developer documentation
style guide, this creates clear, accessible, and well-structured documentation.

### The Four Modes of Documentation

1. **🎓 Tutorial** - Learning-oriented: Teaching a beginner to do something
2. **🔧 How-to Guide** - Task-oriented: Showing how to solve a specific problem
3. **📖 Reference** - Information-oriented: Describing the machinery
4. **💡 Explanation** - Understanding-oriented: Clarifying and discussing
   concepts

## Tutorial Guidelines

### Purpose

Tutorials are lessons that take the reader through a series of steps to complete
a project. They are learning-oriented.

### Structure

````markdown
# Getting Started with [Product Name]

In this tutorial, you'll learn how to [main outcome]. By the end, you'll have
[specific achievement].

## Prerequisites

- [Requirement 1]
- [Requirement 2]

## What you'll learn

- How to [task 1]
- How to [task 2]
- How to [task 3]

## Step 1: [Action]

[Clear instruction with context]

```bash
# Example command
example-command --flag value
```
````

**Expected output:**

```
[Show what success looks like]
```

## Step 2: [Next Action]

[Continue pattern...]

## Summary

You've successfully [what they achieved]. You learned how to:

- [Accomplishment 1]
- [Accomplishment 2]

## Next steps

- Try [related tutorial]
- Explore [related concept]

````
### Google Style Notes for Tutorials

- **Use second person**: "You'll create a service" not "We'll create a service"
- **Present tense**: "The command creates a file" not "The command will create a file"
- **Active voice**: "Configure the server" not "The server should be configured"
- **Clear outcomes**: Start with what the user will achieve
- **Concrete examples**: Use realistic, working examples

## How-to Guide Guidelines

### Purpose
How-to guides are recipes that guide the reader through solving a specific problem. They are task-oriented.

### Structure
```markdown
# How to [Specific Task]

This guide shows you how to [specific task]. Use this approach when you need to [use case].

## Before you begin

Ensure you have:
- [Prerequisite 1]
- [Prerequisite 2]

## Solution

### Option 1: [Approach Name]

Use this approach when [specific condition].

1. [First step]
   ```bash
   command --example
````

2. [Second step]
   ```yaml
   configuration:
     key: value
   ```

### Option 2: [Alternative Approach]

Use this approach when [different condition].

[Steps...]

## Verify your configuration

Test your setup:

```bash
test-command
```

## Troubleshooting

**Problem**: [Common issue] **Solution**: [How to fix it]

## Related tasks

- [Related how-to 1]
- [Related how-to 2]

````
### Google Style Notes for How-to Guides

- **Start with the goal**: Lead with what the user wants to accomplish
- **Provide context**: Explain when to use each approach
- **Focus on the task**: Don't explain concepts in detail (link to explanations)
- **Include verification**: Show how to confirm success
- **Add troubleshooting**: Address common problems

## Reference Guidelines

### Purpose
Reference guides are technical descriptions of the machinery and how to operate it. They are information-oriented.

### Structure
```markdown
# [Component Name] Reference

## Overview

[Brief description of what this component does]

## Synopsis
````

command [options] [arguments]

````
## Description

[Detailed explanation of the component's purpose and behavior]

## Options

### `--option-name` {#option-name}

**Type**: `string` | `boolean` | `number`
**Default**: `value`
**Environment variable**: `ENV*VAR*NAME`

[Description of what this option does]

**Example**:
```bash
command --option-name=value
````

### `--another-option` {#another-option}

[Continue pattern...]

## Arguments

### `argument-name`

**Required**: Yes | No\
**Type**: `string`\
**Valid values**: `value1`, `value2`, `value3`

[Description]

## Examples

### Basic usage

```bash
command basic-argument
```

### Advanced usage

```bash
command --option1=value --option2 complex-argument
```

## Exit codes

| Code | Description       |
| ---- | ----------------- |
| 0    | Success           |
| 1    | General error     |
| 2    | Invalid arguments |

## See also

- [`related-command`](link) - Brief description
- [Configuration guide](link)

````
### Google Style Notes for References

- **Be complete**: Document every option, parameter, and return value
- **Be accurate**: Keep technical details precise and up-to-date
- **Use consistent formatting**: Follow the same structure throughout
- **Include examples**: Show real usage for every feature
- **Cross-reference**: Link to related references and explanations

## Explanation Guidelines

### Purpose
Explanations are understanding-oriented discussions that clarify and illuminate concepts. They provide context and background.

### Structure
```markdown
# Understanding [Concept]

## Overview

[High-level introduction to the concept and why it matters]

## Background

[Historical context or theoretical foundation]

## How [Concept] works

[Detailed explanation with diagrams if helpful]

```mermaid
graph TD
    A[Input] --> B[Process]
    B --> C[Output]
````

## Design decisions

### Why we chose [approach]

[Reasoning and trade-offs]

**Advantages**:

- [Benefit 1]
- [Benefit 2]

**Trade-offs**:

- [Limitation 1]
- [Limitation 2]

## Common patterns

### Pattern 1: [Name]

[When and how to apply this pattern]

### Pattern 2: [Name]

[Continue...]

## Comparison with alternatives

| Approach      | Pros   | Cons   | Best for   |
| ------------- | ------ | ------ | ---------- |
| Our approach  | [List] | [List] | [Use case] |
| Alternative 1 | [List] | [List] | [Use case] |

## Further reading

- [Academic paper or specification]
- [Related explanation in docs]
- [External resource]

````
### Google Style Notes for Explanations

- **Start with why**: Explain why this concept matters to the reader
- **Use analogies carefully**: Ensure they clarify rather than confuse
- **Acknowledge complexity**: Don't oversimplify; link to details
- **Discuss trade-offs**: Be honest about limitations
- **Provide context**: Help readers understand the bigger picture

## General Google Style Guidelines

### Writing Principles

1. **Write for a global audience**
   - Use simple, clear language
   - Avoid idioms and cultural references
   - Define acronyms on first use

2. **Be conversational but professional**
   - Use contractions (you're, it's)
   - Be friendly but not overly casual
   - Maintain technical accuracy

3. **Focus on the user**
   - Address the reader directly
   - Explain what's in it for them
   - Anticipate their questions

### Formatting Standards

#### Headings
- Use sentence case: "Configure the database" not "Configure The Database"
- Make headings descriptive and action-oriented
- Use heading levels consistently

#### Lists
- Use bulleted lists for unordered items
- Use numbered lists for sequential steps
- Keep list items parallel in structure

#### Code Samples
```language
# Include a comment explaining what the code does
actual --code --here
````

- Test all code samples
- Show both input and output when relevant
- Use consistent placeholder names: `YOUR*PROJECT*ID`, `REGION`

#### Links

- Use descriptive link text: "See the [configuration guide]" not "See [here]"
- Link to the specific section when possible
- Check links regularly for accuracy

### Voice and Tone

#### Do

- ✅ "To create a user, run the following command"
- ✅ "If the build fails, check your configuration"
- ✅ "This feature requires version 2.0 or later"
- ✅ "You can configure multiple options"

#### Don't

- ❌ "We need to create a user" (use "you" not "we")
- ❌ "The build might fail" (be specific about conditions)
- ❌ "This feature requires a recent version" (be precise)
- ❌ "There are multiple options available" (be direct)

### Documentation Categories

Ensure your documentation clearly identifies which mode it belongs to:

- **Tutorial**: Prefix with "Tutorial:" or "Getting started with"
- **How-to**: Start with "How to" or "Guide to"
- **Reference**: Use "Reference" or "API documentation"
- **Explanation**: Use "Understanding", "Architecture", or "Concepts"

## Template Usage

1. Choose the appropriate template based on your documentation goal
2. Follow the structure but adapt to your specific needs
3. Maintain consistency across similar documents
4. Review against both Diátaxis principles and Google style guide

Remember: Good documentation serves the reader's needs at their moment of need.
Choose the right mode for the right purpose.
