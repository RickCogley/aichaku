# Diátaxis + Google Developer Documentation Style Guide

## Quick Reference

The Diátaxis framework organizes documentation into four distinct modes, each serving a specific user need. Combined
with Google's developer documentation style guide, this creates clear, accessible, and well-structured documentation.

### The Four Modes of Documentation

1. **🎓 Tutorial** - Learning-oriented: Teaching a beginner to do something
2. **🔧 How-to Guide** - Task-oriented: Showing how to solve a specific problem
3. **📖 Reference** - Information-oriented: Describing the machinery
4. **💡 Explanation** - Understanding-oriented: Clarifying and discussing concepts

## Tutorial Guidelines

### Purpose

Tutorials are lessons that take the reader through a series of steps to complete a project. They are learning-oriented.

### Structure

Diátaxis tutorials are learning-oriented lessons that take beginners through a series of steps to complete a meaningful
project.

See the complete template:
[templates/diataxis-google-tutorial-template.md](./templates/diataxis-google-tutorial-template.md)

Key structural elements:

- **Clear learning objectives** and expected outcomes
- **Prerequisites** listed upfront
- **Step-by-step progression** with context
- **Expected outputs** for verification
- **Summary** of achievements
- **Next steps** for continued learning

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

Diátaxis how-to guides are task-oriented recipes that help users solve specific problems with multiple approaches.

See the complete template:
[templates/diataxis-google-how-to-template.md](./templates/diataxis-google-how-to-template.md)

Key structural elements:

- **Clear task focus** in title and introduction
- **Prerequisites** section before the main content
- **Multiple solution options** when applicable
- **Verification steps** to confirm success
- **Troubleshooting** section for common issues
- **Related tasks** for continued workflow

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

Diátaxis reference guides provide comprehensive technical descriptions of components, APIs, and commands.

See the complete template:
[templates/diataxis-google-reference-template.md](./templates/diataxis-google-reference-template.md)

Key structural elements:

- **Overview** with brief component description
- **Synopsis** showing command syntax
- **Complete options documentation** with types and defaults
- **Arguments** with validation details
- **Working examples** from basic to advanced
- **Exit codes** and return values
- **Cross-references** to related commands

### Google Style Notes for References

- **Be complete**: Document every option, parameter, and return value
- **Be accurate**: Keep technical details precise and up-to-date
- **Use consistent formatting**: Follow the same structure throughout
- **Include examples**: Show real usage for every feature
- **Cross-reference**: Link to related references and explanations

## Explanation Guidelines

### Purpose

Explanations are understanding-oriented discussions that clarify and illuminate concepts. They provide context and
background.

### Structure

Diátaxis explanations are understanding-oriented discussions that provide context, background, and illuminate the "why"
behind concepts.

See the complete template:
[templates/diataxis-google-explanation-template.md](./templates/diataxis-google-explanation-template.md)

Key structural elements:

- **Overview** explaining why the concept matters
- **Background** with historical or theoretical context
- **Design decisions** with reasoning and trade-offs
- **Common patterns** and implementation approaches
- **Comparison tables** with alternatives
- **Visual diagrams** for complex relationships
- **Further reading** for deeper understanding

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
```

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

Remember: Good documentation serves the reader's needs at their moment of need. Choose the right mode for the right
purpose.
