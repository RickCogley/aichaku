/**
 * User Feedback Display System
 * Provides consistent feedback messages with icons and styling
 */

import { colors } from "./ui.ts";

export type FeedbackType = "success" | "error" | "warning" | "info";

export interface FeedbackOptions {
  type: FeedbackType;
  title: string;
  message: string;
  details?: string[];
}

const FEEDBACK_ICONS: Record<FeedbackType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const FEEDBACK_COLORS: Record<FeedbackType, (text: string) => string> = {
  success: colors.green,
  error: colors.red,
  warning: colors.yellow,
  info: colors.blue,
};

/**
 * Display formatted feedback to the user
 */
export function displayFeedback(options: FeedbackOptions): void {
  const { type, title, message, details } = options;
  const icon = FEEDBACK_ICONS[type];
  const colorFn = FEEDBACK_COLORS[type];

  // Display main message
  console.log(`\n${icon} ${colors.bold(colorFn(title))}`);
  console.log(`   ${message}`);

  // Display optional details
  if (details && details.length > 0) {
    console.log("");
    details.forEach((detail) => {
      console.log(`   ${colors.dim("•")} ${detail}`);
    });
  }

  console.log("");
}
