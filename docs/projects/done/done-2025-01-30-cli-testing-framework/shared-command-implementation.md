# Shared Command Infrastructure - Implementation Plan

## Goal: Make Adding New Subcommands Trivial

With shared infrastructure, adding a new subcommand like `aichaku patterns` would take ~50 lines instead of ~500.

## Phase 1: Extract Common Infrastructure (Week 1)

### 1. Create Shared Types

```typescript
// src/types/command.ts
export interface ConfigItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

export interface CommandOptions {
  list?: boolean;
  show?: boolean | string;
  add?: string;
  remove?: string;
  search?: string;
  current?: boolean;
  projectPath?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface ItemLoader<T extends ConfigItem> {
  loadAll(): Promise<T[]>;
  loadById(id: string): Promise<T | null>;
  search(query: string): Promise<T[]>;
}

export interface ItemFormatter<T extends ConfigItem> {
  formatList(items: T[]): string;
  formatDetails(item: T, verbose?: boolean): string;
  formatCurrent(selected: string[]): string;
}
```

### 2. Create Command Builder

```typescript
// src/utils/command-builder.ts
import { ConfigManager } from "./config-manager.ts";
import { parseCommonArgs } from "./arg-parser.ts";

export interface CommandDefinition<T extends ConfigItem> {
  name: string;
  configKey: "methodologies" | "standards" | "principles" | "patterns";
  loader: ItemLoader<T>;
  formatter: ItemFormatter<T>;
  supportedOperations?: {
    list?: boolean;
    show?: boolean;
    showDetails?: boolean; // Like principles --show <id>
    add?: boolean;
    remove?: boolean;
    search?: boolean;
    current?: boolean;
  };
}

export function createCommand<T extends ConfigItem>(def: CommandDefinition<T>) {
  const ops = {
    list: true,
    show: true,
    showDetails: false,
    add: true,
    remove: true,
    search: true,
    current: true,
    ...def.supportedOperations,
  };

  return async function (options: CommandOptions): Promise<void> {
    // Handle operations in priority order
    if (options.list && ops.list) {
      const items = await def.loader.loadAll();
      console.log(def.formatter.formatList(items));
      return;
    }

    if (options.show !== undefined && options.show !== false) {
      if (typeof options.show === "string" && options.show !== "" && ops.showDetails) {
        // Show specific item details (like principles)
        const item = await def.loader.loadById(options.show);
        if (!item) {
          console.error(`❌ ${def.name} '${options.show}' not found`);
          return;
        }
        console.log(def.formatter.formatDetails(item, options.verbose));
      } else if (ops.show) {
        // Show current selection
        const configManager = new ConfigManager(options.projectPath || Deno.cwd());
        const selected = await configManager.get(def.configKey);
        console.log(def.formatter.formatCurrent(selected));
      }
      return;
    }

    if (options.add && ops.add) {
      const ids = options.add.split(",").map((id) => id.trim());
      const configManager = new ConfigManager(options.projectPath || Deno.cwd());

      // Validate all IDs exist
      for (const id of ids) {
        const item = await def.loader.loadById(id);
        if (!item) {
          console.error(`❌ ${def.name} '${id}' not found`);
          return;
        }
      }

      await configManager.add(def.configKey, ids);
      console.log(`✅ Added ${def.name}: ${ids.join(", ")}`);
      return;
    }

    if (options.remove && ops.remove) {
      const ids = options.remove.split(",").map((id) => id.trim());
      const configManager = new ConfigManager(options.projectPath || Deno.cwd());
      await configManager.remove(def.configKey, ids);
      console.log(`✅ Removed ${def.name}: ${ids.join(", ")}`);
      return;
    }

    if (options.search && ops.search) {
      const results = await def.loader.search(options.search);
      if (results.length === 0) {
        console.log(`No ${def.name} found matching "${options.search}"`);
      } else {
        console.log(def.formatter.formatList(results));
      }
      return;
    }

    // Default: show help
    showCommandHelp(def, ops);
  };
}
```

### 3. Centralized Argument Parsing

```typescript
// src/utils/arg-parser.ts
export function parseCommonArgs(args: ParsedArgs): CommandOptions {
  // Handle the --show edge case in ONE place
  let showValue: boolean | string | undefined = args.show;

  // When --show is followed by a value, parseArgs behavior varies
  if (showValue === "" && args._.length > 1) {
    showValue = args._[1] as string;
  }

  return {
    list: args.list as boolean,
    show: showValue,
    add: args.add as string,
    remove: args.remove as string,
    search: args.search as string,
    current: args.current as boolean,
    projectPath: args.path as string,
    dryRun: args["dry-run"] as boolean,
    verbose: args.verbose as boolean,
  };
}
```

## Phase 2: Refactor Existing Commands (Week 2)

### Example: Refactored Standards Command

```typescript
// src/commands/standards.ts
import { createCommand } from "../utils/command-builder.ts";
import { StandardLoader } from "../utils/standard-loader.ts";
import { StandardFormatter } from "../formatters/standard-formatter.ts";

const standardsCommand = createCommand({
  name: "standards",
  configKey: "standards",
  loader: new StandardLoader(),
  formatter: new StandardFormatter(),
  supportedOperations: {
    showDetails: false, // Standards doesn't support --show <id>
  },
});

export async function standards(options: StandardsOptions) {
  // Handle command-specific operations first
  if (options.createCustom) {
    return createCustomStandard(options.createCustom);
  }

  if (options.categories) {
    return showCategories();
  }

  // Delegate common operations to shared infrastructure
  return standardsCommand(options);
}
```

## Phase 3: Adding New Commands is Now Trivial!

### Example: Adding a new "patterns" command

```typescript
// src/commands/patterns.ts (ENTIRE IMPLEMENTATION!)
import { createCommand } from "../utils/command-builder.ts";
import { PatternLoader } from "../utils/pattern-loader.ts";
import { PatternFormatter } from "../formatters/pattern-formatter.ts";

export const patterns = createCommand({
  name: "patterns",
  configKey: "patterns",
  loader: new PatternLoader(),
  formatter: new PatternFormatter(),
  supportedOperations: {
    showDetails: true, // Support --show <pattern-id>
  },
});

// That's it! Full command with list, show, add, remove, search
```

### Update cli.ts (5 lines)

```typescript
// cli.ts
import { patterns } from "./src/commands/patterns.ts";

case "patterns": {
  const options = parseCommonArgs(args);
  await patterns(options);
  break;
}
```

## Benefits Summary

### Before (Current Architecture)

Adding a new command requires:

- ~500 lines of command implementation
- ~200 lines of tests
- Duplicate implementations of list/add/remove/show
- Risk of inconsistent behavior
- Manual handling of parseArgs quirks

### After (Shared Infrastructure)

Adding a new command requires:

- ~50 lines total (command + loader + formatter)
- Automatic test coverage for common operations
- Guaranteed consistent behavior
- parseArgs quirks handled centrally
- Focus only on command-specific logic

## Migration Strategy

1. **Week 1**: Build shared infrastructure alongside existing code
2. **Week 2**: Refactor one command at a time with tests
3. **Week 3**: Update all commands to use shared infrastructure
4. **Week 4**: Remove old implementations
5. **Future**: New commands use shared infrastructure from day 1

## Real-World Example: Adding "aichaku patterns"

```bash
# After refactoring, adding patterns command would give us:
aichaku patterns --list                    # List all design patterns
aichaku patterns --show                    # Show selected patterns  
aichaku patterns --show singleton          # Show pattern details
aichaku patterns --add singleton,factory   # Add patterns to project
aichaku patterns --remove observer         # Remove pattern
aichaku patterns --search "creation"       # Search patterns

# Total implementation time: ~30 minutes instead of 2 days
```

## Conclusion

By extracting common command infrastructure:

1. **Future commands** are trivial to add (~50 lines)
2. **Bugs** are fixed in one place (like the --show issue)
3. **Behavior** is consistent across all commands
4. **Testing** is dramatically simplified
5. **Maintenance** burden is reduced by ~60%

This positions Aichaku to easily grow with new command types as needed.
