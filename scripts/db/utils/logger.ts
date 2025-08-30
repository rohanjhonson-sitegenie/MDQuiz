/**
 * Logging utilities for database scripts
 * Provides colored console output for better readability
 */

// ANSI color codes for console output
export const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
} as const;

export type ColorName = keyof typeof colors;

/**
 * Log a message with optional color
 */
export function log(message: string, color: ColorName = 'reset'): void {
  // eslint-disable-next-line no-console
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Export color names as constants for consistency
export const GREEN: ColorName = 'green';
export const RED: ColorName = 'red';
export const YELLOW: ColorName = 'yellow';
export const CYAN: ColorName = 'cyan';
export const GRAY: ColorName = 'gray';
export const MAGENTA: ColorName = 'magenta';