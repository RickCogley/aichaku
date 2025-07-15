# [Component/Command] reference

## [Component/Command name]

[Brief description of purpose and common use cases]

### Syntax

```
command-name [--option] <required-argument> [optional-argument]
```

### Parameters

#### `<required-argument>`

_Required_. [Description of the argument and its purpose].

- **Type**: String | Integer | Boolean
- **Valid values**: [List specific values or describe format]
- **Default**: None (required)

**Examples**:

```bash
command-name "example-value"
command-name 123
```

#### `[optional-argument]`

_Optional_. [Description and when to use it].

- **Type**: String
- **Valid values**: [List or describe]
- **Default**: `default-value`

### Options

#### `--option`, `-o`

[Description of what this option does].

- **Type**: String
- **Valid values**: `value1` | `value2` | `value3`
- **Default**: `value1`
- **Required**: No

**Example**:

```bash
command-name --option value2 my-argument
```

#### `--verbose`, `-v`

Increase logging verbosity. Use up to three times for more detail.

- **Type**: Flag (can be repeated)
- **Default**: Normal verbosity
- **Required**: No

**Example**:

```bash
command-name -vvv my-argument  # Maximum verbosity
```

#### `--config`, `-c`

Specify a custom configuration file.

- **Type**: String (file path)
- **Default**: `~/.config/product/config.yaml`
- **Required**: No

### Examples

#### Basic usage

Create a simple [thing]:

```bash
command-name my-thing
```

**Output**:

```
Created [thing] 'my-thing' successfully.
ID: 12345
Status: Active
```

#### Use with options

Create a [thing] with custom settings:

```bash
command-name --option value2 --verbose my-custom-thing
```

**Output**:

```
[VERBOSE] Starting creation process...
[VERBOSE] Validating arguments...
[VERBOSE] Creating resource...
Created [thing] 'my-custom-thing' successfully.
ID: 67890
Status: Active
Configuration: Custom (value2)
```

#### Advanced usage

Create a [thing] with full configuration:

```bash
command-name my-advanced-thing \
  --option value2 \
  --config ./custom.json \
  --timeout 300 \
  --retry 3
```

### Configuration file

You can specify options in a configuration file:

**Location**: `~/.config/product/config.yaml`

**Format**:

```yaml
# Default configuration for command-name
option: value2
timeout: 300
retry_count: 3
logging:
  level: verbose
  file: ~/.logs/product.log
```

### Environment variables

| Variable            | Description                | Default                         |
| ------------------- | -------------------------- | ------------------------------- |
| `PRODUCT_HOME`      | Installation directory     | `/usr/local/product`            |
| `PRODUCT_CONFIG`    | Configuration file path    | `~/.config/product/config.yaml` |
| `PRODUCT_LOG_LEVEL` | Logging verbosity          | `info`                          |
| `PRODUCT_TIMEOUT`   | Default timeout in seconds | `60`                            |

### Return values

| Code | Meaning            | Details                                         |
| ---- | ------------------ | ----------------------------------------------- |
| 0    | Success            | Operation completed without errors              |
| 1    | General failure    | Check error message for details                 |
| 2    | Invalid arguments  | Review command syntax                           |
| 3    | Resource not found | Verify the resource name and permissions        |
| 4    | Timeout            | Operation took too long; try increasing timeout |
| 5    | Permission denied  | Check your access rights                        |

### Permissions

This command requires:

- Read access to configuration files
- Write access to the target directory
- Network access for remote operations

### Notes

> [!NOTE]
> This command caches results for 5 minutes. Use `--no-cache` to bypass.

> [!TIP]
> For better performance with large datasets, use `--batch-size` option.

> [!IMPORTANT]
> Version 2.0 introduced breaking changes. See [migration guide](link).

### Related commands

- [`list-command`](link) - List all [things]
- [`delete-command`](link) - Remove a [thing]
- [`update-command`](link) - Modify an existing [thing]

### See also

- [Conceptual overview of [topic]](link)
- [How to use [command] in common scenarios](link)
- [Best practices for [component]](link)
- [Troubleshooting guide](link)
