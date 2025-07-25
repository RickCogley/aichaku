# Microsoft Writing Style Guide

## Quick Reference

The Microsoft Writing Style Guide promotes clear, consistent, and accessible technical documentation with a warm,
approachable tone. It emphasizes inclusivity, global readability, and user empowerment.

### Core Principles

1. **🌍 Global-ready** - Write for international audiences
2. **♿ Accessible** - Design for all abilities and contexts
3. **🤝 Inclusive** - Welcome everyone with bias-free language
4. **💡 Clear** - Prioritize clarity over cleverness
5. **🚀 Empowering** - Help users succeed and feel confident

## Tutorial Guidelines

### Purpose

Help users learn by doing, building confidence through successful completion of tasks.

### Structure

Microsoft tutorials follow a hands-on, step-by-step approach with clear outcomes and encouraging tone.

See the complete template:
[templates/microsoft-style-tutorial-template.md](./templates/microsoft-style-tutorial-template.md)

Key structural elements:

- **Time estimate** upfront
- **Prerequisites** section
- **Numbered steps** with clear actions
- **Encouragement** after each achievement
- **What you learned** summary
- **Try this next** section for continued learning

### Microsoft Style Notes for Tutorials

- **Use "you" and active voice**: "You create a function" not "A function is created"
- **Be encouraging**: Use "Great!" or "Nice work!" to celebrate progress
- **Explain the why**: Help users understand the purpose, not just the steps
- **Use friendly contractions**: "you'll", "let's", "it's"
- **Include tips and notes**: Help users avoid common pitfalls

## How-to Guide Guidelines

### Purpose

Provide focused, task-oriented guidance for users who know what they want to accomplish.

### Structure

Microsoft how-to guides follow a problem-solving approach with multiple methods and comprehensive troubleshooting.

See the complete template:
[templates/microsoft-style-how-to-template.md](./templates/microsoft-style-how-to-template.md)

Key structural elements:

- **Clear task focus** in the title
- **Prerequisites** section with specific requirements
- **Multiple methods** (GUI, CLI, PowerShell when applicable)
- **Verification steps** to confirm success
- **Troubleshooting** section with common issues
- **Cleanup** guidance for resource management
- **Next steps** for continued learning

### Microsoft Style Notes for How-to Guides

- **Front-load important information**: Put key details early
- **Offer multiple methods**: GUI and command line when applicable
- **Use descriptive headings**: "Configure security settings" not just "Security"
- **Include cleanup**: Help users manage resources and costs
- **Add troubleshooting**: Address common problems proactively

## Reference Guidelines

### Purpose

Provide complete, accurate technical information for users who need specific details.

### Structure

Microsoft reference documentation provides comprehensive technical information with consistent formatting and complete
parameter coverage.

See the complete template:
[templates/microsoft-style-reference-template.md](./templates/microsoft-style-reference-template.md)

Key structural elements:

- **Clear syntax** with required vs optional parameters
- **Complete parameter documentation** with types and examples
- **Working code examples** with expected output
- **Return values table** with status codes
- **Related commands** section for discoverability
- **Cross-references** to conceptual content

### Microsoft Style Notes for References

- **Be scannable**: Use consistent formatting and clear sections
- **Include all parameters**: Document every option, even deprecated ones
- **Show real examples**: Include actual output where helpful
- **Explain relationships**: How commands and options work together
- **Keep current**: Update for each version change

## Explanation Guidelines

### Purpose

Help users understand concepts, architecture, and the reasoning behind design decisions.

### Structure

Microsoft explanation documentation helps users understand concepts and architecture with engaging introductions and
progressive disclosure.

See the complete template:
[templates/microsoft-style-explanation-template.md](./templates/microsoft-style-explanation-template.md)

Key structural elements:

- **Engaging introduction** explaining why the topic matters
- **Clear concept definitions** with analogies when helpful
- **Visual diagrams** to illustrate complex relationships
- **Progressive disclosure** from simple to complex
- **Practical examples** with real-world scenarios
- **Comparison tables** showing alternatives and tradeoffs
- **Next steps** linking to actionable content

### Microsoft Style Notes for Explanations

- **Start with value**: Why should readers care about this topic?
- **Use progressive disclosure**: Start simple, add complexity gradually
- **Include diagrams**: Visual aids help explain complex concepts
- **Provide concrete examples**: Abstract concepts need real scenarios
- **Connect to user goals**: Always relate back to what users want to achieve

## General Microsoft Style Guidelines

### Voice and Tone

#### Be Warm and Approachable

- ✅ "Let's explore how to..."
- ✅ "You might wonder why..."
- ✅ "Here's a tip that can save you time"
- ❌ "Users must configure..."
- ❌ "It should be noted that..."

#### Empower Users

- ✅ "You can customize this to fit your needs"
- ✅ "Choose the option that works best for you"
- ❌ "You must follow these steps exactly"
- ❌ "Failure to do this will result in errors"

### Accessibility Guidelines

#### Structure

- Use descriptive headings that stand alone
- Keep paragraphs short (3-4 sentences)
- Use lists to break up complex information
- Provide alt text for all images

#### Language

- Define acronyms on first use: "Artificial Intelligence (AI)"
- Avoid directional language: "Select **Next**" not "Click the button on the right"
- Use device-agnostic terms: "select" not "click", "enter" not "type"

### Inclusive Language

#### Use Bias-Free Language

- ✅ "They" as singular pronoun
- ✅ "Primary/replica" not "master/slave"
- ✅ "Allowlist/blocklist" not "whitelist/blacklist"
- ✅ "Placeholder text" not "dummy text"

#### Global Audience

- Avoid idioms: "straightforward" not "piece of cake"
- Use global examples: varied names, locations, scenarios
- Specify formats: "YYYY/MM/DD" (prefer the ISO standard) not just "date"
- Include timezone: "2 PM PST (UTC-8)"

### Formatting Standards

#### Alerts and Notices

```markdown
> [!NOTE]
> Additional information that helps users succeed.

> [!TIP]
> Optional advice to improve the experience.

> [!IMPORTANT]
> Essential information users need to know.

> [!WARNING]
> Critical information to prevent problems.

> [!CAUTION]
> Serious consequences if ignored.
```

#### UI Elements

- **Bold** for UI elements: "Select **File** > **Save**"
- *Italics* for user input: "In the **Name** box, enter *MyProject*"
- `Code` formatting for code elements, files, and values

#### Tables

Use tables for:

- Comparing options
- Listing parameters
- Showing settings and values

Keep tables simple and scannable.

### Content Types

#### Quickstarts

- 5-10 minute completion time
- Minimal prerequisites
- One clear outcome
- Links to next steps

#### Concepts

- Explain the why before the how
- Use analogies sparingly and carefully
- Include diagrams for complex topics
- Connect to practical applications

#### Troubleshooting

- Problem-solution format
- Most common issues first
- Clear error messages as headings
- Specific resolution steps

## Documentation Planning

Before writing, consider:

1. **Audience**: Who needs this information?
2. **Purpose**: What will they do with it?
3. **Context**: When will they need it?
4. **Format**: What type of document serves them best?

Remember: Good documentation anticipates user needs and removes barriers to success. Write with empathy, clarity, and
respect for your readers' time and expertise.
