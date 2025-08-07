# Aichaku Principles - Branding Examples

This document shows how all principle commands will maintain consistent aichaku branding.

## Command: `aichaku principles --list`

```
# 🌸 Aichaku Principles - Guiding Philosophies

Select from 18 timeless principles to guide your development.

## 💻 Software Development

- **Unix Philosophy** - Write programs that do one thing well
- **DRY (Don't Repeat Yourself)** - Every piece of knowledge must have a single representation
- **YAGNI (You Aren't Gonna Need It)** - Don't build features until they're actually needed
- **KISS (Keep It Simple)** - Simplicity should be a key goal in design
- **Zen of Python** - Beautiful is better than ugly, explicit is better than implicit

## 🏢 Organizational

- **Agile Manifesto** - Individuals and interactions over processes and tools
- **DevOps Three Ways** - Flow, feedback, and continual learning
- **Lean Principles** - Eliminate waste, amplify learning, decide late
- **Theory of Constraints** - Identify and eliminate system bottlenecks
- **Conway's Law** - Organizations design systems that mirror their communication structure

## ⚙️ Engineering

- **Defensive Programming** - Protect against the impossible because it will happen
- **Fail Fast** - Detect errors as early as possible
- **Principle of Least Privilege** - Grant minimal access required
- **Separation of Concerns** - Divide programs into distinct features

## 👥 Human-Centered

- **Design Thinking** - Empathize, define, ideate, prototype, test
- **Accessibility First** - Build for everyone from the start
- **Privacy by Design** - Privacy as the default setting

💡 Use `aichaku principles --show <name>` to learn more about any principle.
```

## Command: `aichaku principles --show unix-philosophy`

```
# 📚 Unix Philosophy

**Category**: Software Development
**Origin**: Bell Labs, 1978

> "Write programs that do one thing and do it well. Write programs to work together."
> - Doug McIlroy

## Core Tenets

✓ **Do one thing well** - Focus on a single, well-defined purpose
✓ **Write programs to work together** - Design for composability
✓ **Handle text streams** - Use universal interfaces
✓ **Design early, release early** - Get feedback quickly

## Compatibility

**Works well with:**
- ✅ KISS - Both emphasize simplicity
- ✅ YAGNI - Avoid unnecessary complexity
- ✅ Separation of Concerns - Natural alignment

**Potential conflicts:**
- ⚠️ Enterprise Patterns - May encourage over-engineering
- ⚠️ Feature-Complete Mindset - Conflicts with "do one thing"

## Learn More

Use `aichaku principles --show unix-philosophy --verbose` for examples and detailed guidance.
```

## Command: `aichaku principles --select dry,kiss,yagni`

```
# 🎯 Selecting Principles

Analyzing compatibility...

## ✅ Compatible Selection

Your selected principles work well together:

- **DRY** ↔️ **KISS**: Simplicity reduces repetition
- **KISS** ↔️ **YAGNI**: Both avoid unnecessary complexity
- **DRY** ↔️ **YAGNI**: Focus on actual needs prevents duplication

## 📝 Updating Configuration

✅ Selected 3 principles for your project
✅ Updated ~/.claude/aichaku/aichaku.json
✅ Principles will be included in CLAUDE.md on next integrate

💡 Run `aichaku integrate` to apply these principles to your project.
```

## Command: `aichaku principles --select enterprise-patterns,unix-philosophy`

```
# ⚠️ Compatibility Warning

Potential conflicts detected in your selection:

## Conflicting Principles

**Unix Philosophy** ⚠️ **Enterprise Patterns**
- Unix Philosophy emphasizes "do one thing well"
- Enterprise Patterns may encourage complex, all-encompassing solutions

## Recommendation

Consider these alternatives that work better together:
- Replace **Enterprise Patterns** with **Clean Architecture**
- Or replace **Unix Philosophy** with **SOLID Principles**

Continue with current selection? (y/N): _
```

## Command: `aichaku principles --current`

```
# 🎯 Currently Selected Principles

You have 3 principles guiding your project:

## 💻 Software Development

1. **DRY (Don't Repeat Yourself)**
   Every piece of knowledge must have a single representation

2. **KISS (Keep It Simple)**
   Simplicity should be a key goal in design

3. **YAGNI (You Aren't Gonna Need It)**
   Don't build features until they're actually needed

## Integration Status

✅ Principles included in CLAUDE.md
✅ Expert agents are principle-aware
🔄 Last updated: 2025-07-30 10:45 AM

💡 Use `aichaku principles --compatibility` to check how well these work together.
```

## Command: `aichaku principles --compatibility dry,kiss,yagni`

```
# 🔄 Principle Compatibility Matrix

Analyzing relationships between 3 principles...

        DRY    KISS   YAGNI
DRY     -      ✅     ✅
KISS    ✅     -      ✅
YAGNI   ✅     ✅     -
## 🎯 Compatibility Score: 100%

**Strong Synergies:**
- All three principles reinforce each other
- Shared focus on simplicity and avoiding waste
- No conflicts detected

## 💡 Recommendation

This is an excellent combination! These principles work together to create:
- Clean, maintainable code (DRY + KISS)
- Focused development effort (YAGNI)
- Reduced complexity across the board
```

## Error States

### Command: `aichaku principles --show not-a-principle`

```
# ❌ Principle Not Found

The principle 'not-a-principle' was not found in our collection.

Did you mean one of these?
- unix-philosophy
- agile-manifesto
- fail-fast

💡 Use `aichaku principles --list` to see all available principles.
```

### Command: `aichaku principles --select` (no arguments)

```
# ❌ No Principles Specified

Please specify principles to select:

  aichaku principles --select dry,kiss,yagni

Or use interactive selection:

  aichaku principles --select-interactive

💡 Use `aichaku principles --list` to see available principles.
```

## Integration with Learn Command

```
# 📚 Learning About Principles

Explore software development principles interactively.

## Available Topics

1. **Overview** - What are principles and why use them?
2. **Unix Philosophy** - The foundation of modular design
3. **DRY** - Don't Repeat Yourself
4. **KISS** - Keep It Simple, Stupid
5. **YAGNI** - You Aren't Gonna Need It

## Interactive Examples

Try these exercises:
- Compare Unix Philosophy with Microservices
- Apply DRY to refactor duplicate code
- Identify YAGNI violations in a codebase

Select a topic (1-5) or 'q' to quit: _
```
