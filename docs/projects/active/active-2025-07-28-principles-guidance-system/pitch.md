# Principles Guidance System

## Problem

Currently, aichaku focuses on methodologies (how to organize work) and standards (technical specifications), but lacks
support for foundational principles and philosophies that guide thinking and decision-making. Users need guidance on
core concepts like the Unix Philosophy, DRY, YAGNI, and Agile values - the mindsets that inform good engineering
decisions.

## Appetite

6 weeks - This is a substantial feature that adds a new category to aichaku's guidance system.

## Solution

Add a "principles" category alongside methodologies and standards, allowing users to select guiding philosophies that
expert agents will ensure are followed in spirit, not just letter.

### Core Design

1. **New Principles Category**
   - Located at `/docs/principles/`
   - YAML metadata format matching standards structure
   - Markdown documentation for each principle
   - Integration with existing agent orchestration system

2. **Principle Structure**
   ```yaml
   name: Unix Philosophy
   category: software-development
   summary:
     core_tenets:
       - Do one thing and do it well
       - Write programs to work together
       - Design for composability
     spirit: "Simplicity, modularity, and reusability guide all decisions"
     anti_patterns:
       - Monolithic design
       - Kitchen sink features
       - Tight coupling between components
     guidance_examples:
       - "Consider: Could this be split into smaller, focused modules?"
       - "Ask: Does this follow the principle of least surprise?"
       - "Reflect: Is this composable with other tools?"
   ```

3. **CLI Commands**
   ```bash
   # List available principles by category
   aichaku principles --list
   aichaku principles --list --category software-development

   # Show details about a specific principle
   aichaku principles --show unix-philosophy
   aichaku principles --show dry --verbose  # Include examples and extended info

   # Select principles for current project
   aichaku principles --select unix-philosophy,dry,yagni
   aichaku principles --select-interactive  # Interactive selection

   # View currently selected principles
   aichaku principles --current

   # Remove principles
   aichaku principles --remove yagni
   aichaku principles --clear  # Remove all
   ```

4. **Integration with Expert Agents**
   - Agents read selected principles from `.claude/aichaku/aichaku.json`
   - Provide gentle guidance aligned with principle spirit
   - Suggest refactorings that better embody principles
   - Never enforce rigidly - principles guide, not dictate

5. **YAML File Structure**
   ```yaml
   # docs/principles/software-development/unix-philosophy.yaml
   metadata:
     name: Unix Philosophy
     category: software-development
     aliases: ["unix-way", "unix-principles"]
     compatibility:
       works_well_with: ["kiss", "yagni", "separation-of-concerns"]
       potential_conflicts: ["enterprise-patterns"]

   summary:
     tagline: "Write simple, modular programs that do one thing well"
     core_tenets:
       - text: "Do one thing and do it well"
         guidance: "Each component should have a single, well-defined purpose"
       - text: "Write programs to work together"
         guidance: "Design for interoperability through clean interfaces"
       - text: "Design for composability"
         guidance: "Small tools can be combined to solve complex problems"

   guidance:
     spirit: |
       The Unix Philosophy emphasizes simplicity, clarity, and modularity.
       It values small, focused tools over monolithic applications.

     questions_to_ask:
       - "Could this functionality be split into separate, focused tools?"
       - "Is the interface simple enough for other programs to use?"
       - "Does this follow the principle of least surprise?"

     anti_patterns:
       - pattern: "Kitchen sink design"
         instead: "Split into focused, composable tools"
       - pattern: "Complex configuration"
         instead: "Sensible defaults with simple overrides"

   examples:
     good:
       - description: "Piping commands together"
         code: "find . -name '*.log' | grep ERROR | wc -l"
       - description: "Single-purpose tools"
         code: "ls (list files), grep (search text), sort (sort lines)"

     refactoring:
       - before: "One class handling file I/O, parsing, and formatting"
         after: "Separate: FileReader, Parser, Formatter classes"
   ```

6. **Principle Selection Storage**
   ```json
   // .claude/aichaku/aichaku.json addition
   {
     "selected": {
       "methodologies": ["shape-up"],
       "standards": ["owasp-web", "tdd"],
       "principles": ["unix-philosophy", "dry", "yagni"]
     }
   }
   ```

7. **Agent Guidance Integration**
   - Orchestrator reads selected principles
   - Passes principle context to specialist agents
   - Agents provide principle-aware suggestions
   - Examples appear as gentle reminders, not rules

8. **Learn Command Integration**
   ```bash
   # Learn about available principles
   aichaku learn principles
   aichaku learn principles --interactive

   # Learn about specific principle with examples
   aichaku learn unix-philosophy
   aichaku learn dry --verbose

   # Learn how principles work with methodologies
   aichaku learn principles --with shape-up
   aichaku learn principles --with agile
   ```

   The learn command will:
   - Provide interactive tutorials about principles
   - Show how principles apply in different contexts
   - Demonstrate principle combinations that work well
   - Include hands-on examples and exercises
   - Explain when NOT to apply certain principles

### Principles to Include

**Software Development:**

- Unix Philosophy
- DRY (Don't Repeat Yourself)
- YAGNI (You Aren't Gonna Need It)
- KISS (Keep It Simple, Stupid)
- Zen of Python

**Organizational:**

- Agile Manifesto
- DevOps Three Ways
- Lean Principles
- Theory of Constraints
- Conway's Law

**Engineering:**

- Defensive Programming
- Fail Fast
- Principle of Least Privilege
- Separation of Concerns

**Human-Centered:**

- Design Thinking
- Accessibility First
- Privacy by Design

## Rabbit Holes

- Don't create enforcement rules - principles guide thinking, not dictate actions
- Avoid philosophical debates about "correct" interpretations
- Don't mix principles with methodologies or standards

## No-gos

- No automatic code generation based on principles
- No rigid compliance checking
- No scoring or grading against principles

## Nice-to-haves

- Principle compatibility matrix (which work well together)
- Historical context for each principle
- Real-world examples of principle application
- Integration with CLAUDE.md for principle selection
