/**
 * Path utilities for database scripts
 * Handles ES module path resolution
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

/**
 * Get __dirname equivalent in ES modules
 */
export function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return dirname(__filename);
}

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  // Assuming scripts are always at scripts/db/*, go up 2 levels
  const currentDir = getDirname(import.meta.url);
  return path.resolve(currentDir, '..', '..', '..');
}