/**
 * CLI utilities for database scripts
 * Handles command execution and user interaction
 */

import { execSync, ExecSyncOptions } from 'child_process';
import readline from 'readline';

/**
 * Run a shell command with optional environment variables
 */
export function runCommand(command: string, options: ExecSyncOptions = {}): boolean {
  try {
    execSync(command, {
      stdio: 'inherit',
      ...options
    });
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Prompt the user for input
 */
export async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}