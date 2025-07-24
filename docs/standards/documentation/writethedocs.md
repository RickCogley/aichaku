# Write the Docs Principles

## Quick Reference

Write the Docs is a community of people who care about documentation. This guide incorporates community-driven best
practices for creating documentation that is helpful, accessible, and maintainable.

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

Write the Docs tutorials focus on community-driven learning experiences that welcome newcomers with empathy and clear guidance.

See the complete template: [templates/writethedocs-tutorial-template.md](./templates/writethedocs-tutorial-template.md)

Key structural elements:

- **Welcoming introduction** with clear achievement goals
- **Prerequisites** with helpful context and alternatives
- **Visual preview** of what will be built
- **Step-by-step progression** with checkpoints
- **Community troubleshooting** with expandable sections
- **Multiple platform support** (macOS, Linux, Windows)
- **Celebration of achievements** at each milestone


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

Write the Docs how-to guides emphasize practical, copy-paste friendly solutions with community troubleshooting support.

See the complete template: [templates/writethedocs-how-to-template.md](./templates/writethedocs-how-to-template.md)

Key structural elements:

- **Clear task description** with time and difficulty indicators
- **Prerequisites checklist** with verification steps
- **Step-by-step instructions** with command explanations
- **Alternative approaches** in expandable sections
- **Verification steps** with expected outputs
- **Common variations** (Docker, CI/CD automation)
- **Community troubleshooting** with expandable details
- **Related tasks** and further reading links### Write the Docs Notes for How-to Guides

- **Scannable structure**: Users should quickly find what they need
- **Copy-paste friendly**: Code blocks should work as-is
- **Multiple approaches**: Show different ways when they exist
- **Troubleshooting**: Anticipate and address common problems
- **Time estimates**: Help users plan their work

## Reference Guidelines

### Purpose
Provide comprehensive technical details for users who need complete information.

### Structure

Write the Docs reference documentation emphasizes community maintenance and accessibility for diverse technical backgrounds.

See the complete template: [templates/writethedocs-reference-template.md](./templates/writethedocs-reference-template.md)

Key structural elements:

- **Complete API coverage** with examples and responses
- **Community-friendly versioning** with changelog links
- **Multiple format support** (REST, GraphQL, SDKs)
- **Authentication examples** for all endpoints
- **Error documentation** with troubleshooting steps
- **Interactive examples** with copy-paste commands
- **Community contribution** guidelines for updates
- **Accessibility considerations** for diverse users### Write the Docs Notes for References

- **Completeness**: Document every parameter, response, and error
- **Examples everywhere**: Show actual requests and responses
- **Progressive detail**: Start with common use cases, add complexity
- **Code samples**: Include multiple languages when possible
- **Versioning**: Track changes that affect users

## Explanation Guidelines

### Purpose
Help users understand the why behind the what - concepts, architecture, and design decisions.

### Structure

Write the Docs explanations foster community understanding by connecting concepts to real-world usage and diverse perspectives.

See the complete template: [templates/writethedocs-explanation-template.md](./templates/writethedocs-explanation-template.md)

Key structural elements:

- **Problem-focused introduction** connecting to user needs
- **Core concepts** with plain language explanations
- **Visual workflow diagrams** showing process flows
- **Design decisions** with honest trade-offs
- **Real-world examples** from production use
- **Comparison tables** with alternatives
- **Community insights** and lessons learned
- **Progressive depth** for different reader needs### Write the Docs Notes for Explanations

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

> ⚠️ **Version Note**: This guide is for version 2.3+. For earlier versions, see [archived docs](link).
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

Remember: The best documentation is the one that helps your users succeed at their goals. Everything else is
implementation details.
