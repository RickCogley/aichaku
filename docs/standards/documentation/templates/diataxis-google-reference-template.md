# [Component name] reference

## Overview

[Brief description of what this component does and when to use it]

## Synopsis

```
command [options] [arguments]
```

## Description

[Detailed explanation of the component's purpose and behavior]

## Options

### `--option-name` {#option-name}

**Type**: `string` | `boolean` | `number`\
**Default**: `default-value`\
**Environment variable**: `ENV*VAR*NAME`

[Description of what this option does]

**Example**:

```bash
command --option-name=value
```

### `--another-option` {#another-option}

**Type**: `array`\
**Default**: `[]`\
**Aliases**: `-a`

[Description of what this option does]

**Example**:

```bash
command --another-option item1 --another-option item2
# Or using the alias
command -a item1 -a item2
```

## Arguments

### `argument-name`

**Required**: Yes | No\
**Type**: `string`\
**Position**: 1\
**Valid values**: `value1`, `value2`, `value3`

[Description of the argument]

**Example**:

```bash
command argument-value
```

## Configuration file

You can specify options in a configuration file instead of command-line arguments.

**Default location**: `~/.config/product/config.yaml`

**Format**:

```yaml
option_name: value
another_option:
  - item1
  - item2
```

## Examples

### Basic usage

```bash
command basic-argument
```

**Output**:

```
[Expected output]
```

### Using multiple options

```bash
command --option1=value --option2 argument
```

**Output**:

```
[Expected output]
```

### Advanced example

```bash
command \
  --verbose \
  --config=/path/to/config.yaml \
  --timeout=300 \
  complex-argument
```

## Exit codes

| Code | Description         |
| ---- | ------------------- |
| 0    | Success             |
| 1    | General error       |
| 2    | Invalid arguments   |
| 3    | Configuration error |
| 4    | Permission denied   |

## Environment variables

| Variable            | Description             | Default                         |
| ------------------- | ----------------------- | ------------------------------- |
| `PRODUCT_HOME`      | Installation directory  | `/usr/local/product`            |
| `PRODUCT_CONFIG`    | Configuration file path | `~/.config/product/config.yaml` |
| `PRODUCT*LOG*LEVEL` | Logging verbosity       | `info`                          |

## Files

- `~/.config/product/config.yaml` - User configuration
- `/etc/product/config.yaml` - System configuration
- `~/.product/cache/` - Cache directory
- `~/.product/logs/` - Log files

## See also

- [`related-command`](link) - Brief description
- [Configuration guide](link)
- [Troubleshooting guide](link)
