/**
 * UI Utilities
 * Color and formatting utilities for terminal output
 */

// ANSI color codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";

/**
 * Terminal color and formatting utilities
 */
export const colors = {
  /**
   * Bold text
   */
  bold: (text: string): string => `${BOLD}${text}${RESET}`,

  /**
   * Dim/faded text
   */
  dim: (text: string): string => `${DIM}${text}${RESET}`,

  /**
   * Red text
   */
  red: (text: string): string => `${RED}${text}${RESET}`,

  /**
   * Green text
   */
  green: (text: string): string => `${GREEN}${text}${RESET}`,

  /**
   * Yellow text
   */
  yellow: (text: string): string => `${YELLOW}${text}${RESET}`,

  /**
   * Blue text
   */
  blue: (text: string): string => `${BLUE}${text}${RESET}`,

  /**
   * Magenta text
   */
  magenta: (text: string): string => `${MAGENTA}${text}${RESET}`,

  /**
   * Cyan text
   */
  cyan: (text: string): string => `${CYAN}${text}${RESET}`,

  /**
   * White text
   */
  white: (text: string): string => `${WHITE}${text}${RESET}`,

  /**
   * Gray text
   */
  gray: (text: string): string => `${GRAY}${text}${RESET}`,
};
