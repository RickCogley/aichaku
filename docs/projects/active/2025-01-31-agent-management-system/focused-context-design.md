# Focused Context Injection for Agents

## Problem

Currently, ALL agents receive ALL selected methodologies, standards, and principles. This defeats the purpose of
specialized agents and wastes their limited context window with irrelevant information.

Example inefficiencies:

- Security Reviewer gets documentation standards (Diátaxis, Microsoft Style Guide)
- API Architect gets Shape Up methodology details
- Documenter gets OWASP security rules
- Code Explorer gets devops metrics (DORA)

## Solution: Agent-Specific Context Filtering

### 1. Configuration-as-Code Approach

Each agent template will specify which YAML files to include in a special section:

```markdown
# /docs/core/agent-templates/security-reviewer/base.md

---
name: security-reviewer
description: InfoSec specialist for OWASP Top 10 and NIST-CSF compliance
color: red
methodology_aware: true
tools: ["*"]
---

[Agent content here...]

## Context Requirements

<!-- This section tells agent-generator which YAMLs to pull in -->

### Standards

- security/owasp-web.yaml
- security/nist-csf.yaml

### Methodologies

<!-- None needed for this agent -->

### Principles

- engineering/defensive-programming.yaml
- engineering/fail-fast.yaml
- engineering/robustness-principle.yaml
- engineering/privacy-by-design.yaml
```

### 2. Example Agent Configurations

**orchestrator/base.md:**

```markdown
## Context Requirements

### Standards

- architecture/* <!-- All architecture standards -->
- development/conventional-commits.yaml

### Standards Conflicts

- group: architecture-style exclusive: [clean-arch, hexagonal, layered] priority: clean-arch # <-- EXPLICIT PRIORITY
  HERE message: "Multiple architecture patterns selected. Using Clean Architecture as primary."

### Methodologies

-
  - <!-- All methodologies for routing decisions -->

### Principles

- software-development/*
- organizational/*
- engineering/*
- human-centered/*
```

**api-architect/base.md:**

```markdown
## Context Requirements

### Standards

- architecture/clean-arch.yaml
- architecture/15-factor.yaml
- development/openapi.yaml
- development/graphql.yaml
- development/rest.yaml

### Standards Conflicts

- group: api-paradigm exclusive: [rest, graphql, grpc]
  # Priority determined by order in user's selected array
  message: "Multiple API paradigms detected. Prioritizing based on selection order."

### Methodologies

<!-- None needed -->

### Principles

- software-development/solid.yaml
- software-development/separation-of-concerns.yaml
- engineering/unix-philosophy.yaml
- engineering/robustness-principle.yaml
```

**documenter/base.md:**

```markdown
## Context Requirements

### Standards

- documentation/* <!-- All documentation standards -->

### Methodologies

- shape-up.yaml <!-- Only for cycle documentation -->

### Principles

- human-centered/accessibility-first.yaml
- human-centered/inclusive-design.yaml
- human-centered/user-centered-design.yaml
- software-development/dry.yaml
```

**test-expert/base.md:**

```markdown
## Context Requirements

### Standards

- testing/tdd.yaml
- testing/bdd.yaml
- testing/test-pyramid.yaml

### Methodologies

<!-- TDD is a standard, not methodology -->

### Principles

- software-development/fail-fast.yaml
- software-development/kiss.yaml
- software-development/yagni.yaml
```

### 3. How Integration Works

The integration process reconciles user selections with agent requirements, including fallback defaults:

1. **User Configuration** (aichaku.json):

```json
{
  "methodologies": {
    "selected": ["shape-up", "lean"]
  },
  "standards": {
    "selected": ["owasp-web", "nist-csf", "clean-arch", "diataxis"]
    // Notice: NO testing standards selected
  },
  "principles": {
    "selected": ["dry", "solid"]
  }
}
```

2. **Agent Requirements with Defaults** (in template):

```markdown
## Context Requirements

### Standards

- testing/tdd.yaml
- testing/bdd.yaml
- testing/test-pyramid.yaml

### Standards Defaults

<!-- If user selected NO testing standards, include these minimal ones -->

- testing/test-pyramid.yaml # At least this one for basic testing awareness

### Principles

- software-development/fail-fast.yaml
- software-development/kiss.yaml

### Principles Defaults

<!-- If user selected NO software-development principles -->

- software-development/fail-fast.yaml # Critical for test-expert
```

3. **Integration Logic**:

```typescript
async function generateAgentWithFilteredContext(
  agentType: string,
  userConfig: AichakuConfig,
) {
  const template = await loadAgentTemplate(agentType);
  const requirements = parseContextRequirements(template);

  // Check each category for user selections
  const hasTestingStandards = userConfig.standards.selected
    .some((std) => isInCategory(std, "testing"));

  let standardsToInclude = [];

  if (hasTestingStandards) {
    // User has testing selections - use filtered approach
    standardsToInclude = requirements.standards.filter((path) => {
      const stdName = extractName(path);
      return userConfig.standards.selected.includes(stdName);
    });
  } else {
    // No testing selections - use defaults
    standardsToInclude = requirements.standardsDefaults || [];
  }

  const standardsYaml = await generateStandardsYaml(standardsToInclude);
}
```

4. **Result**:
   - If user selected testing standards → Agent gets intersection of requests & selections
   - If user selected NO testing standards → Agent gets its declared defaults
   - Ensures specialist agents remain functional even with minimal user config

### 4. Context Reduction Estimates

| Agent             | Current Context   | Optimized Context     | Reduction |
| ----------------- | ----------------- | --------------------- | --------- |
| Security Reviewer | ALL standards     | Only security         | ~80%      |
| API Architect     | ALL standards     | Only architecture/dev | ~60%      |
| Documenter        | ALL standards     | Only documentation    | ~70%      |
| Code Explorer     | ALL methodologies | None                  | ~100%     |
| Test Expert       | ALL standards     | Only testing          | ~75%      |

### 5. Benefits

1. **Focused Expertise**: Agents only see relevant information
2. **Faster Processing**: Less context to parse
3. **Better Responses**: More room for actual work context
4. **Clearer Boundaries**: Each agent's domain is well-defined

### 6. Special Cases

- **Orchestrator**: Needs awareness of active methodology for routing but not deep details
- **Methodology Coach**: Gets all methodologies (their specialty)
- **Principle Coach**: Already has filtered principles, now gets filtered standards too
- **Test Expert**: Must have testing standards even if user selected none - uses defaults
- **Security Reviewer**: Must have at least basic security standards - uses defaults if needed

### 7. Absolute Requirements & Conflict Resolution

#### Absolute Requirements

Some standards are foundational and should ALWAYS be included:

```markdown
## Context Requirements

### Standards

- testing/tdd.yaml
- testing/bdd.yaml
- testing/contract-testing.yaml

### Standards Required

<!-- ALWAYS included regardless of user selection -->

- testing/test-pyramid.yaml # Foundational - defines the testing philosophy

### Standards Defaults

<!-- Only if NO testing standards selected by user -->

- testing/tdd.yaml
```

This creates three tiers:

1. **Required**: Always included (e.g., test-pyramid for test-expert)
2. **Requested**: Included if user selected them
3. **Defaults**: Fallback if user selected nothing in category

#### Conflict Detection

```markdown
## Context Requirements

### Standards Conflicts

<!-- Mutually exclusive - warn if both selected -->

- group: api-style exclusive: [rest, graphql, grpc] strategy: selection-order # Priority determined by user's selection
  order message: "Multiple API paradigms selected. Agent will prioritize based on selection order."

- group: css-approach exclusive: [tailwind, styled-components, css-modules] strategy: selection-order # Priority
  determined by user's selection order message: "Conflicting CSS approaches. Agent will focus on the first selected."
```

Integration can:

1. **Warn** about conflicts in output
2. **Document** which one takes precedence
3. **Let agent know** about the conflict so it can acknowledge both but focus on one

Example output:

```
⚠️  Conflict detected: Both 'tailwind' and 'styled-components' selected
   Agent 'ui-expert' will prioritize Tailwind but acknowledge styled-components
```

### 8. Example with All Features

**test-expert/base.md**:

```markdown
## Context Requirements

### Standards

- testing/* <!-- All testing standards user selected -->

### Standards Required

<!-- Non-negotiable foundations -->

- testing/test-pyramid.yaml # Core philosophy
- development/conventional-commits.yaml # For test naming

### Standards Defaults

<!-- If user selected NO testing standards -->

- testing/tdd.yaml
- testing/test-pyramid.yaml

### Standards Conflicts

- group: test-philosophy exclusive: [tdd, bdd] strategy: complement # They can work together message: "Both TDD and BDD
  selected. Agent will use based on selection order, complementing where appropriate."
```

This ensures agents have the essential knowledge while handling edge cases gracefully.

### 9. Priority Strategies

Priority is determined by **order in user's selection**:

```bash
# User specifies priority through order
aichaku standards --add graphql,rest,grpc
# Result: graphql has priority, then rest, then grpc

aichaku standards --add rest,graphql  
# Result: rest has priority over graphql
```

In `aichaku.json`:

```json
{
  "standards": {
    "selected": ["graphql", "rest", "tdd", "bdd"]
    // Order matters: graphql > rest, tdd > bdd
  }
}
```

During integration, when conflicts are detected:

```
🟨 Aichaku: Detected API paradigm conflict: graphql, rest
   Using GraphQL as primary (listed first in your configuration)
   API Architect will focus on GraphQL but acknowledge REST patterns
```

Different conflict strategies:

1. **Exclusive** (default): First listed becomes primary
   ```yaml
   - group: css-framework
     exclusive: [tailwind, bootstrap, bulma]
   ```

2. **Complement**: Order determines primary/secondary usage
   ```yaml
   - group: test-philosophy
     exclusive: [tdd, bdd]
     strategy: complement # First for units, second for features
   ```

This gives users full control while providing helpful feedback about how conflicts are resolved.

### 10. Migration from Hard-Coded Mappings

The current `AGENT_PRINCIPLE_MAPPING` in agent-generator.ts will be replaced by parsing the Context Requirements
section. This moves the configuration from code to the templates themselves, following the configuration-as-code
pattern.

### 8. Template Validation

The agent validation test will also check:

- Context Requirements section exists
- Referenced YAML files exist in the docs structure
- No typos in file paths
- Wildcards resolve to at least one file
