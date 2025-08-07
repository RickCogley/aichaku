# Shared Command Infrastructure

## Overview

The Aichaku CLI uses a shared command infrastructure pattern to reduce code duplication and ensure consistent behavior
across all configuration commands (standards, methodologies, principles).

## Architecture

### Core Components

#### 1. BaseCommand (`src/utils/base-command.ts`)

Abstract base class that implements common command operations:

- `--list` - Display all available items
- `--show` - Show current selection or item details
- `--add` - Add items to configuration
- `--remove` - Remove items from configuration
- `--search` - Search items by keyword
- `--categories` - Display categories
- `--current` - Show current selection

#### 2. CommandExecutor (`src/utils/command-executor.ts`)

Central command router that:

- Maps command names to implementations
- Handles command execution
- Provides consistent error handling

#### 3. Argument Parser (`src/utils/argument-parser.ts`)

Handles parseArgs quirks and provides:

- Consistent argument extraction
- Special handling for `--show` with values
- Type-safe parsed arguments

### Interfaces

```typescript
// Core configuration item
interface ConfigItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

// Item loader for data access
interface ItemLoader<T extends ConfigItem> {
  loadAll(): Promise<T[]>;
  loadById(id: string): Promise<T | null>;
  search(query: string): Promise<T[]>;
  getCategories?(): Promise<string[]>;
}

// Item formatter for display
interface ItemFormatter<T extends ConfigItem> {
  formatList(items: T[]): string;
  formatDetails(item: T, verbose?: boolean): string;
  formatCurrent(selected: string[]): string;
  formatCategories?(categories: string[]): string;
}
```

## Creating a New Command

### 1. Define Your Item Type

```typescript
interface MyItem extends ConfigItem {
  // Add custom fields
  customField: string;
}
```

### 2. Create a Loader

```typescript
class MyItemLoader implements ItemLoader<MyItem> {
  async loadAll(): Promise<MyItem[]> {
    // Load items from filesystem/API
  }

  async loadById(id: string): Promise<MyItem | null> {
    // Load specific item
  }

  async search(query: string): Promise<MyItem[]> {
    // Search implementation
  }
}
```

### 3. Create a Formatter

```typescript
class MyItemFormatter implements ItemFormatter<MyItem> {
  formatList(items: MyItem[]): string {
    // Format list display
  }

  formatDetails(item: MyItem, verbose?: boolean): string {
    // Format detailed view
  }

  formatCurrent(selected: string[]): string {
    // Format current selection
  }
}
```

### 4. Extend BaseCommand

```typescript
class MyCommand extends BaseCommand<MyItem> {
  constructor() {
    super({
      name: "mycommand",
      configKey: "myitems",
      loader: new MyItemLoader(),
      formatter: new MyItemFormatter(),
      supportedOperations: {
        list: true,
        show: true,
        showDetails: true,
        add: true,
        remove: true,
        search: true,
        current: true,
      },
      helpText: {
        description: "Manage my items",
        examples: [
          "aichaku mycommand --list",
          "aichaku mycommand --add item1,item2",
        ],
      },
    });
  }

  // Implement required methods
  protected async addItemsToConfig(configManager: any, ids: string[]): Promise<void> {
    // Add items to configuration
  }

  protected async removeItemsFromConfig(configManager: any, ids: string[]): Promise<void> {
    // Remove items from configuration
  }

  protected getSelectedItems(configManager: any): string[] {
    // Get current selection
  }
}
```

### 5. Register with CommandExecutor

```typescript
// In command-executor.ts
this.commands.set("mycommand", new MyCommand());
```

## Branding Guidelines

All commands must use the Brand utility for consistent output:

```typescript
import { AichakuBrand as Brand } from "../utils/branded-messages.ts";

// Main operations
Brand.log("Starting operation...");

// Success messages
Brand.success("Operation completed!");

// Error messages
Brand.error("Operation failed");

// Tips and guidance
Brand.tip("Use --help for more options");

// General information
Brand.info("Processing items...");
```

## Testing

### Test Utilities (`src/utils/test-helpers.ts`)

```typescript
// Capture command output
const output = await captureCommandOutput(async () => {
  await command.execute(args);
});

// Assert output contains expected content
assertStringIncludes(output.stdout, "Expected text");

// Negative assertions
assertDoesNotInclude(output.stdout, "Unexpected text");
```

### Example Test

```typescript
Deno.test("MyCommand - List operation", async () => {
  const command = new MyCommand();
  const output = await captureCommandOutput(async () => {
    await command.execute({ list: true });
  });

  assertStringIncludes(output.stdout, "Available Items");
  assertEquals(output.stderr, "");
});
```

## Runtime Validation

Commands use Zod for runtime validation of external inputs:

- **Configuration Loading**: Validates aichaku.json structure
- **CLI Arguments**: Type-safe argument parsing with validation
- **YAML Content**: Ensures YAML files match expected schemas

See [Runtime Validation Strategy](./runtime-validation-strategy.md) for detailed information.

## Benefits

1. **Code Reuse**: ~65% reduction in command implementation code
2. **Consistency**: All commands behave the same way
3. **Maintainability**: Bug fixes apply to all commands
4. **Testability**: Shared test utilities and patterns
5. **Extensibility**: Easy to add new commands
6. **Type Safety**: Runtime validation via Zod schemas

## Example Commands

- `src/commands/standards.ts` - Standards management
- `src/commands/methodologies.ts` - Methodology selection
- `src/commands/principles.ts` - Principle configuration

Each demonstrates the pattern with command-specific customizations.
