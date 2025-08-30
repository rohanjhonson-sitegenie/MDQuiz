/**
 * Helper to load environment variables from all project .env files
 * including root, supabase, and server directories
 */

import fs from 'fs';
import path from 'path';
import { log, GREEN } from './logger.js';
import { loadEnvironment, EnvironmentVariables } from './env.js';

export function getAllEnv(): EnvironmentVariables {
  // Find the project root by looking for package.json
  let projectRoot = process.cwd();
  while (!fs.existsSync(path.join(projectRoot, 'package.json')) && projectRoot !== path.dirname(projectRoot)) {
    projectRoot = path.dirname(projectRoot);
  }
  
  const envPaths: string[] = [];
  
  // Root .env.development
  const rootEnvPath = path.join(projectRoot, '.env.development');
  if (fs.existsSync(rootEnvPath)) {
    envPaths.push(rootEnvPath);
    log('✓ Found root .env.development', GREEN);
  }
  
  // Supabase .env.development
  const supabaseEnvPath = path.join(projectRoot, 'supabase', '.env.development');
  if (fs.existsSync(supabaseEnvPath)) {
    envPaths.push(supabaseEnvPath);
    log('✓ Found supabase/.env.development', GREEN);
  }
  
  // Server .env.development
  const serverEnvPath = path.join(projectRoot, 'server', '.env.development');
  if (fs.existsSync(serverEnvPath)) {
    envPaths.push(serverEnvPath);
    log('✓ Found server/.env.development', GREEN);
  }
  
  // Load and merge all environment files
  const env = loadEnvironment(envPaths);
  
  return env;
}