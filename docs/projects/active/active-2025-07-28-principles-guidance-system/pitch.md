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

2. **Principle Structure**
   ```yaml
   name: Unix Philosophy
   category: software-development
   summary:
     core_tenets:
       - Do one thing and do it well
       - Write programs to work together
       - Design for composability
     anti_patterns:
       - Monolithic design
       - Kitchen sink features
   ```

3. **Integration with Expert Agents**
   - Agents check if selected principles are being followed
   - Provide gentle guidance aligned with principle spirit
   - Suggest refactorings that better embody principles

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
