# How to Understand Selection Priority in Aichaku

When you select multiple standards, methodologies, or principles that might conflict, Aichaku uses a **selection order
priority system** to determine which takes precedence.

## The Priority Rule

**The order in which items are added determines their priority** - first added has highest priority.

## How It Works

### 1. Adding Items

When you use the `--add` flag, items are added in the order you specify:

```bash
# REST gets priority over GraphQL
aichaku standards --add api/rest api/graphql

# GraphQL gets priority over REST
aichaku standards --add api/graphql api/rest
```

### 2. Viewing Priority

The `--list` command shows items in priority order (highest priority first):

```bash
aichaku standards --list
# Output:
# Selected Standards (in priority order):
# 1. api/rest        - RESTful API design principles
# 2. api/graphql     - GraphQL API design patterns
```

### 3. Conflict Resolution

When standards conflict, the higher priority (earlier in list) standard wins:

```yaml
# If both REST and GraphQL are selected:
# - REST first: Use REST patterns, acknowledge GraphQL where applicable
# - GraphQL first: Use GraphQL patterns, acknowledge REST where applicable
```

## Examples

### API Design Conflicts

```bash
# Scenario 1: REST-first approach
aichaku standards --add api/rest api/graphql
# Agents will prioritize RESTful design patterns

# Scenario 2: GraphQL-first approach  
aichaku standards --add api/graphql api/rest
# Agents will prioritize GraphQL design patterns
```

### Testing Strategy Conflicts

```bash
# Scenario 1: TDD-first approach
aichaku standards --add testing/tdd testing/bdd
# Test-expert will emphasize TDD for unit tests, BDD for features

# Scenario 2: BDD-first approach
aichaku standards --add testing/bdd testing/tdd  
# Test-expert will emphasize BDD throughout, TDD as support
```

### Documentation Standards

```bash
# Scenario 1: Diátaxis as primary framework
aichaku standards --add doc/diataxis doc/microsoft-style
# Documentation follows Diátaxis structure with Microsoft tone

# Scenario 2: Microsoft style as primary
aichaku standards --add doc/microsoft-style doc/diataxis
# Documentation follows Microsoft patterns with Diátaxis concepts
```

## Managing Priority

### Reordering Items

To change priority, remove and re-add in the desired order:

```bash
# Current: REST has priority
aichaku standards --list

# Change to GraphQL priority
aichaku standards --remove api/rest api/graphql
aichaku standards --add api/graphql api/rest
```

### Best Practices

1. **Be Intentional**: Add your primary/preferred approach first
2. **Document Choices**: Use comments in your project docs to explain priority decisions
3. **Team Alignment**: Ensure team understands the priority order
4. **Regular Review**: Periodically review selections as project evolves

## How Agents Use Priority

Agents receive the full list in priority order and will:

1. **Primary Guidance**: Follow the highest priority standard/methodology
2. **Acknowledge Others**: Mention when lower-priority approaches might differ
3. **Hybrid Approach**: Combine non-conflicting aspects where sensible
4. **Clear Communication**: Explicitly state which standard is being followed

Example agent response:

```
"I'll implement this using REST principles as your primary standard, 
while incorporating GraphQL's type safety concepts where they enhance 
the REST design."
```

## Related Commands

- `aichaku standards --list` - View current priority order
- `aichaku methodologies --list` - View methodology priority
- `aichaku principles --list` - View principle priority
- `aichaku agents --list` - View selected agents

## See Also

- [Configure Project](./configure-project.md)
- [Manage Custom Standards](./manage-custom-standards.md)
- [Agent Management](./manage-agents.md)
