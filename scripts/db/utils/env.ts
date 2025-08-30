/**
 * Environment variable utilities for database scripts
 * Handles loading, merging, and validating environment variables
 */

import fs from 'fs';
import path from 'path';
import { log, RED, YELLOW, CYAN } from './logger.js';

interface EnvironmentVariables {
  [key: string]: string | undefined;
}

/**
 * Load environment variables from a file
 */
export function loadEnvFile(filePath: string): EnvironmentVariables {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env: EnvironmentVariables = {};

  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) return;

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

/**
 * Load multiple environment files and merge them
 */
export function loadEnvironment(envFiles: string[]): EnvironmentVariables {
  let mergedEnv: EnvironmentVariables = { ...process.env };
  
  for (const filePath of envFiles) {
    const fileEnv = loadEnvFile(filePath);
    mergedEnv = { ...mergedEnv, ...fileEnv };
  }
  
  return mergedEnv;
}

/**
 * Validate that required environment variables are present
 */
export function validateRequiredVars(env: EnvironmentVariables, requiredVars: string[]): string[] {
  return requiredVars.filter(varName => !env[varName]);
}

/**
 * Helper to load standard Supabase environment setup
 */
export function getSupabaseEnv(): EnvironmentVariables {
  // Find the project root by looking for package.json
  let projectRoot = process.cwd();
  while (!fs.existsSync(path.join(projectRoot, 'package.json')) && projectRoot !== path.dirname(projectRoot)) {
    projectRoot = path.dirname(projectRoot);
  }
  
  const rootEnvPath = path.join(projectRoot, '.env.development');
  const supabaseEnvPath = path.join(projectRoot, 'supabase', '.env.development');
  
  // Check if files exist
  if (!fs.existsSync(rootEnvPath)) {
    log('❌ Error: .env.development file not found!', RED);
    log('Please create .env.development with your development configuration.', YELLOW);
    process.exit(1);
  }
  
  if (!fs.existsSync(supabaseEnvPath)) {
    log('❌ Error: supabase/.env.development file not found!', RED);
    log('Please create supabase/.env.development with your Supabase development configuration.', YELLOW);
    process.exit(1);
  }
  
  // Load and merge environment variables
  const env = loadEnvironment([rootEnvPath, supabaseEnvPath]);
  
  // Check required variables
  const requiredVars = ['SUPABASE_PROJECT_ID', 'POSTGRES_PASSWORD', 'SUPABASE_ACCESS_TOKEN', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_URL'];
  const missingVars = validateRequiredVars(env, requiredVars);
  
  if (missingVars.length > 0) {
    log('❌ Error: Missing required environment variables:', RED);
    missingVars.forEach(varName => log(`  - ${varName}`, RED));
    log('Please ensure all required variables are set in your .env files', YELLOW);
    if (missingVars.includes('SUPABASE_ACCESS_TOKEN')) {
      log('\nTo get your Supabase access token:', YELLOW);
      log('1. Go to https://app.supabase.com/account/tokens', CYAN);
      log('2. Click "Generate new token"', CYAN);
      log('3. Add it to supabase/.env.development as SUPABASE_ACCESS_TOKEN', CYAN);
    }
    process.exit(1);
  }
  
  // Access token is already available in env if provided
  
  return env;
}