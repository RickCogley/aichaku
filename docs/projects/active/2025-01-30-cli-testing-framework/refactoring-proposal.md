# CLI Command Refactoring Proposal

## Problem

The current implementation has each subcommand (methodologies, standards, principles) implementing common operations
independently, leading to:

- Code duplication
- Inconsistent behavior
- Bugs requiring fixes in multiple places
- Harder maintenance

## Proposed Solution: Shared Command Infrastructure

### 1. Common Argument Parser

```typescript
// src/utils/command-args.ts
export function parseCommonArgs(args: ParsedArgs): CommonCommandOptions {
  // Handle the --show edge case in ONE place
  let showValue = args.show;
  if (showValue === "" && args._.length > 1) {
    showValue = args._[1] as string;
  }

  return {
    list: args.list as boolean,
    show: showValue,
    add: args.add as string,
    remove: args.remove as string,
    search: args.search as string,
    projectPath: args.path as string,
    dryRun: args["dry-run"] as boolean,
  };
}
```

### 2. Command Builder Pattern

```typescript
// src/utils/command-builder.ts
export interface ConfigItem {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface CommandConfig<T extends ConfigItem> {
  name: string;
  configKey: "methodologies" | "standards" | "principles";
  loader: {
    loadAll(): Promise<T[]>;
    loadById(id: string): Promise<T | null>;
  };
  formatter: {
    formatList(items: T[]): string;
    formatDetails(item: T): string;
  };
}

export function buildCommand<T extends ConfigItem>(config: CommandConfig<T>) {
  return {
    async execute(options: CommonCommandOptions): Promise<void> {
      if (options.list) {
        await this.list(options);
      } else if (options.show !== undefined) {
        await this.show(options);
      } else if (options.add) {
        await this.add(options);
      } else if (options.remove) {
        await this.remove(options);
      } else {
        await this.showHelp();
      }
    },

    async list(options: CommonCommandOptions): Promise<void> {
      const items = await config.loader.loadAll();
      console.log(config.formatter.formatList(items));
    },

    async show(options: CommonCommandOptions): Promise<void> {
      if (typeof options.show === "string" && options.show !== "") {
        // Show specific item
        const item = await config.loader.loadById(options.show);
        if (!item) {
          console.error(`❌ ${config.name} '${options.show}' not found`);
          return;
        }
        console.log(config.formatter.formatDetails(item));
      } else {
        // Show current selection
        const configManager = createProjectConfigManager(options.projectPath);
        const selected = await configManager.get(config.configKey);
        // ... display current selection
      }
    },

    async add(options: CommonCommandOptions): Promise<void> {
      const ids = options.add.split(",");
      const configManager = createProjectConfigManager(options.projectPath);
      await configManager.add(config.configKey, ids);
      console.log(`✅ Added ${config.name}: ${ids.join(", ")}`);
    },
    // ... similar for remove, search, etc.
  };
}
```

### 3. Simplified Command Implementations

```typescript
// src/commands/methodologies.ts
export async function methodologies(options: MethodologiesOptions) {
  const command = buildCommand({
    name: "methodologies",
    configKey: "methodologies",
    loader: methodologyLoader,
    formatter: methodologyFormatter,
  });

  // Add command-specific operations
  if (options.set) {
    await setMethodologies(options.set);
  } else if (options.reset) {
    await resetMethodologies();
  } else {
    await command.execute(options);
  }
}
```

### 4. Centralized CLI Routing

```typescript
// cli.ts
const commonCommands = ["methodologies", "standards", "principles"];

if (commonCommands.includes(command)) {
  const options = parseCommonArgs(args);

  // Add command-specific options
  switch (command) {
    case "methodologies":
      options.set = args.set;
      options.reset = args.reset;
      break;
    case "principles":
      options.compatibility = args.compatibility;
      options.category = args.category;
      break;
      // ...
  }

  await commands[command](options);
}
```

## Benefits

1. **DRY**: Common logic in one place
2. **Consistency**: All commands behave the same for common operations
3. **Maintainability**: Fix bugs once, not three times
4. **Extensibility**: Easy to add new commands
5. **Testability**: Test common behavior once

## Migration Strategy

1. **Phase 1**: Extract parseCommonArgs (fix --show in one place)
2. **Phase 2**: Create shared utilities for list/add/remove
3. **Phase 3**: Refactor commands to use shared utilities
4. **Phase 4**: Add comprehensive tests for shared code

## Example: How This Prevents The --show Bug

With shared parsing:

```typescript
// The --show fix would be in ONE place:
function parseCommonArgs(args) {
  let showValue = args.show;
  if (showValue === "" && args._.length > 1) {
    showValue = args._[1];
  }
  return { show: showValue, ... };
}
```

Instead of fixing it in:

- cli.ts for principles
- cli.ts for methodologies
- cli.ts for standards

## Risks and Mitigation

**Risk**: Over-abstraction making code harder to understand **Mitigation**: Keep abstractions simple and well-documented

**Risk**: Losing command-specific flexibility\
**Mitigation**: Allow commands to override default behavior

**Risk**: Breaking existing functionality **Mitigation**: Comprehensive test suite before refactoring
