# Principles System Data Flow

## Where Files Are Loaded

### 1. Source Location (Persistent Storage)

Files are stored on disk at:

```
~/.claude/aichaku/docs/principles/
├── software-development/
│   ├── unix-philosophy.yaml    # Structured data
│   └── unix-philosophy.md      # Human-readable docs
└── ...
```

### 2. Loading Process

```mermaid
sequenceDiagram
    participant Disk as Disk Storage<br/>(~/.claude/aichaku)
    participant Loader as PrinciplesLoader<br/>(in memory)
    participant Cache as Memory Cache<br/>(Map structure)
    participant CLI as CLI Commands
    participant Agent as Agent Generator
    
    Note over Disk: YAML + MD files stored here
    
    CLI->>Loader: Request principles
    Loader->>Disk: Read YAML files
    Disk-->>Loader: YAML content
    Loader->>Disk: Read MD files
    Disk-->>Loader: MD content
    
    Loader->>Loader: Parse & validate
    Loader->>Cache: Store PrincipleWithDocs
    
    Note over Cache: In-memory cache for<br/>current session
    
    Cache-->>CLI: Return principles data
    CLI->>CLI: Display to user
    
    Agent->>Cache: Get selected principles
    Cache-->>Agent: Return principle data
    Agent->>Agent: Include in CLAUDE.md
```

### 3. Memory Structure

When loaded, each principle is stored in memory as:

```typescript
interface PrincipleWithDocs {
  data: Principle;        // Parsed from YAML
  documentation: string;  // Content from MD file
  path: string;          // Original file path
}

// Stored in a Map for fast lookup
Map<string, PrincipleWithDocs> {
  "unix-philosophy" => {
    data: { name: "Unix Philosophy", category: "software-development", ... },
    documentation: "# Unix Philosophy\n\n> Write programs...",
    path: "/Users/rcogley/.claude/aichaku/docs/principles/software-development/unix-philosophy.yaml"
  },
  "dry" => { ... },
  "yagni" => { ... }
}
```

### 4. Usage by Different Commands

#### `aichaku principles --list`

- Loads all principles into memory
- Displays names and descriptions from the YAML data
- Doesn't need the MD documentation

#### `aichaku principles --show unix-philosophy`

- Retrieves from cache (or loads if not cached)
- Shows basic info from YAML
- With `--verbose`, includes content from MD file

#### `aichaku principles --select dry,kiss`

- Validates selections against loaded principles
- Saves selections to `~/.claude/aichaku/aichaku.json`
- Doesn't store the principle content itself

#### `aichaku integrate`

- Reads selected principle names from config
- Loads those specific principles
- Includes principle metadata in CLAUDE.md YAML

### 5. What Gets Persisted Where

```mermaid
graph TD
    subgraph "Persistent Storage"
        A[YAML Files<br/>~/.claude/aichaku/docs/principles/]
        B[MD Files<br/>~/.claude/aichaku/docs/principles/]
        C[User Selection<br/>~/.claude/aichaku/aichaku.json]
        D[CLAUDE.md<br/>./CLAUDE.md in project]
    end
    
    subgraph "Temporary (Memory)"
        E[PrinciplesLoader Cache]
        F[CLI Display Buffer]
    end
    
    A --> E
    B --> E
    E --> F
    E --> D
    C --> D
    
    style A fill:#e8f5e9
    style B fill:#e8f5e9
    style C fill:#fff3e0
    style D fill:#f3e5f5
```

## Summary

- **Source files** (YAML + MD) live in `~/.claude/aichaku/docs/principles/`
- **Loader** reads these files into **memory** when needed
- **Cache** holds them during the CLI session for performance
- **User selections** are saved to `aichaku.json` (just the names)
- **CLAUDE.md** gets updated with principle metadata when running `integrate`

The actual principle content is never duplicated - it's always read from the source files in the global aichaku
installation.
