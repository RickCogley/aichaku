/**
 * Terminal formatting utilities for Aichaku CLI
 * Converts markdown-like syntax to proper terminal formatting
 */

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  // Colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

export interface FormatOptions {
  width?: number;
  indent?: number;
  headerStyle?: "bold" | "underline" | "color";
  codeStyle?: "dim" | "cyan" | "gray";
}

/**
 * Format markdown-like text for terminal output
 */
export function formatForTerminal(
  text: string,
  options: FormatOptions = {},
): string {
  const {
    width: _width = 80,
    indent = 0,
    headerStyle: _headerStyle = "bold",
    codeStyle: _codeStyle = "dim",
  } = options;

  let formatted = text;

  // Handle literal \n sequences and convert to actual newlines
  formatted = formatted.replace(/\\n/g, "\n");

  // Headers
  formatted = formatted.replace(
    /^### (.+)$/gm,
    (_, content) => colors.yellow + colors.bold + "▶ " + content + colors.reset,
  );
  formatted = formatted.replace(
    /^## (.+)$/gm,
    (_, content) => colors.cyan + colors.bold + "◆ " + content + colors.reset,
  );
  formatted = formatted.replace(
    /^# (.+)$/gm,
    (_, content) => colors.blue + colors.bold + "█ " + content + colors.reset,
  );

  // Bold text
  formatted = formatted.replace(
    /\*\*(.+?)\*\*/g,
    (_, content) => colors.bold + content + colors.reset,
  );

  // Code blocks and inline code
  formatted = formatted.replace(
    /`(.+?)`/g,
    (_, content) => colors.cyan + content + colors.reset,
  );

  // Bullet points
  formatted = formatted.replace(
    /^[ ]*- (.+)$/gm,
    (_, content) => "  • " + content,
  );

  // URLs - make them cyan
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => colors.cyan + url + colors.reset,
  );

  // Status indicators
  formatted = formatted.replace(/✅/g, colors.green + "✅" + colors.reset);
  formatted = formatted.replace(/❌/g, colors.red + "❌" + colors.reset);
  formatted = formatted.replace(/⚠️/g, colors.yellow + "⚠️" + colors.reset);
  formatted = formatted.replace(/🔐/g, colors.blue + "🔐" + colors.reset);
  formatted = formatted.replace(/📦/g, colors.magenta + "📦" + colors.reset);
  formatted = formatted.replace(/🔄/g, colors.cyan + "🔄" + colors.reset);
  formatted = formatted.replace(/📚/g, colors.blue + "📚" + colors.reset);

  // Add indentation if specified
  if (indent > 0) {
    const indentStr = " ".repeat(indent);
    formatted = formatted.split("\n").map((line) => line.trim() ? indentStr + line : line).join("\n");
  }

  return formatted;
}

/**
 * Create a formatted help section
 */
export function helpSection(
  title: string,
  content: string,
  emoji?: string,
): string {
  const header = emoji ? `${emoji} ${title}` : title;
  const separator = "─".repeat(Math.min(60, header.length + 10));

  return formatForTerminal(`
## ${header}
${separator}

${content}
`);
}

/**
 * Create a formatted status message
 */
export function statusMessage(
  message: string,
  status: "success" | "error" | "warning" | "info",
): string {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return formatForTerminal(`${icons[status]} ${message}`);
}

/**
 * Create a formatted command usage example
 */
export function commandExample(description: string, command: string): string {
  return formatForTerminal(`
**${description}**
\`${command}\`
`);
}

/**
 * Create a formatted list of options
 */
export function optionsList(
  options: Array<{ name: string; description: string }>,
): string {
  const maxNameLength = Math.max(...options.map((opt) => opt.name.length));

  return options.map((opt) => {
    const padding = " ".repeat(maxNameLength - opt.name.length + 2);
    return formatForTerminal(`  **${opt.name}**${padding}${opt.description}`);
  }).join("\n");
}

/**
 * Print formatted text to console
 */
export function printFormatted(text: string, options?: FormatOptions): void {
  console.log(formatForTerminal(text, options));
}
