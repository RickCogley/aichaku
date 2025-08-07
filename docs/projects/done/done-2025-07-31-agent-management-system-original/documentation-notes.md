# Documentation Notes - Selection Order Priority

## Key Concept to Document

**Selection order determines priority** - This is a critical feature that users need to understand.

## Where to Document

### 1. In README.md - Standards/Methodologies Section

````markdown
### Priority Through Order

When selecting multiple standards that might conflict, the **order matters**:

```bash
# GraphQL takes priority over REST
aichaku standards --add graphql,rest

# REST takes priority over GraphQL  
aichaku standards --add rest,graphql
```
````

Your selection order is preserved in `aichaku.json` and determines which approach agents prioritize when conflicts
arise.

```
### 2. In CLI Help Text
```

--add <items> Add items (comma-separated). Order determines priority for conflicts. Example: --add graphql,rest (GraphQL
takes precedence)

````
### 3. In Agent Documentation
```markdown
## How Agents Handle Conflicts

When you select conflicting standards (e.g., both REST and GraphQL), agents use your selection order to determine priority:

- **First listed = Primary approach**: The agent will focus on this
- **Later items = Acknowledged alternatives**: The agent knows about these but treats them as secondary

Example: If you selected `["graphql", "rest"]`, the API Architect will:
- Design with GraphQL-first mindset
- Acknowledge REST patterns where relevant
- Mention REST as an alternative approach
````

### 4. In Integration Output

```
🟨 Aichaku: Configuring api-architect agent
   Detected conflicting standards: graphql, rest
   ✓ Using GraphQL as primary (your first choice)
   ✓ REST available as alternative approach
```

## Examples to Include

### Example 1: API Paradigms

```json
{
  "standards": {
    "selected": ["graphql", "rest", "grpc"]
  }
}
```

Result: Agents prioritize GraphQL → REST → gRPC

### Example 2: Testing Philosophies

```json
{
  "standards": {
    "selected": ["bdd", "tdd"]
  }
}
```

Result: BDD-first approach, TDD as complement

### Example 3: CSS Frameworks

```json
{
  "standards": {
    "selected": ["tailwind", "bootstrap"]
  }
}
```

Result: Tailwind as primary, Bootstrap patterns acknowledged

## User Messaging

Always make it clear that:

1. Order is preserved and meaningful
2. Users have full control over priorities
3. Agents will respect their preferences
4. Conflicts are handled intelligently based on their choices
