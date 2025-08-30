#!/usr/bin/env node

/**
 * Cross-platform database reset and deployment script for development environment
 * This script resets the database and then deploys fresh migrations
 * WARNING: This will delete all data in the development database!
 */

import path from 'path';
import fs from 'fs';
import { getDirname } from './utils/paths.js';
import { log, GREEN, RED, YELLOW, CYAN, GRAY, MAGENTA } from './utils/logger.js';
import { getSupabaseEnv } from './utils/env.js';
import { runCommand, promptUser } from './utils/cli.js';

// Get __dirname equivalent in ES modules
const __dirname = getDirname(import.meta.url);

async function resetAndDeployDatabase(): Promise<void> {
  log('⚠️  WARNING: Database Reset for Development Environment', RED);
  log('This will DELETE ALL DATA in your development database!', YELLOW);
  log('');

  // Load and validate environment
  const env = getSupabaseEnv();

  // Show project info
  log(`Project ID: ${env.SUPABASE_PROJECT_ID}`, MAGENTA);
  log('');

  // Confirm with user
  const answer = await promptUser(`Are you sure you want to reset the development database? Type 'yes' to continue: `);
  
  if (answer.toLowerCase() !== 'yes') {
    log('\n❌ Database reset cancelled.', YELLOW);
    process.exit(0);
  }

  log('\n🚀 Starting database reset and deployment...', GREEN);

  // Check if user is logged in to Supabase CLI with access token
  log('🔍 Authenticating with Supabase CLI using access token...', CYAN);
  if (!runCommand('npx supabase projects list', { env })) {
    log('⚠️  Failed to authenticate with Supabase CLI', YELLOW);
    log('Please check your SUPABASE_ACCESS_TOKEN in supabase/.env.development', YELLOW);
    log('You can generate a new token at: https://app.supabase.com/account/tokens', CYAN);
    process.exit(1);
  }

  // Change to supabase directory
  const supabaseDir = path.join(process.cwd(), 'supabase');
  process.chdir(supabaseDir);

  try {
    // Link to development project
    log('📦 Linking to development project...', CYAN);
    if (!runCommand(`npx supabase link --project-ref ${env.SUPABASE_PROJECT_ID} --password "${env.POSTGRES_PASSWORD}"`, { env })) {
      throw new Error('Failed to link project');
    }

    // Reset the database
    log('🗑️  Resetting database (this will delete all data)...', RED);
    if (!runCommand(`npx supabase db reset --linked --no-seed`, { env })) {
      throw new Error('Failed to reset database');
    }

    // Deploy Edge Functions
    log('⚡ Deploying Edge Functions...', CYAN);
    const functionsDir = path.join(supabaseDir, 'functions');
    if (fs.existsSync(functionsDir) && fs.readdirSync(functionsDir).length > 0) {
      if (!runCommand(`npx supabase functions deploy --project-ref ${env.SUPABASE_PROJECT_ID}`, { env })) {
        log('⚠️  Warning: Failed to deploy some functions', YELLOW);
      }

      // Set function secrets if they exist
      log('🔐 Setting function secrets...', CYAN);
      // Only set secrets that exist in the environment
      if (env.CLERK_WEBHOOK_SECRET) {
        runCommand(`npx supabase secrets set CLERK_WEBHOOK_SECRET=${env.CLERK_WEBHOOK_SECRET} --project-ref ${env.SUPABASE_PROJECT_ID}`, { env });
      }
      if (env.CLERK_SECRET_KEY) {
        runCommand(`npx supabase secrets set CLERK_SECRET_KEY=${env.CLERK_SECRET_KEY} --project-ref ${env.SUPABASE_PROJECT_ID}`, { env });
      }
    } else {
      log('ℹ️  No Edge Functions found to deploy.', GRAY);
    }

    // Seed data is skipped due to --no-seed flag
    log('ℹ️  Skipping seed data (--no-seed flag is set).', GRAY);

    // Setup storage buckets
    log('\n📦 Setting up storage...', CYAN);
    try {
      const { setupStorage } = await import('./setup-storage.js');
      const storageSetup = await setupStorage();
      if (!storageSetup) {
        log('⚠️  Failed to setup storage buckets', YELLOW);
      }
    } catch (error) {
      log('⚠️  Failed to setup storage: ' + (error as Error).message, YELLOW);
    }

    log('\n✅ Database reset and deployment completed!', GREEN);
    log('\n📋 Reset Summary:', YELLOW);
    log(`- Project ID: ${env.SUPABASE_PROJECT_ID}`);
    log(`- Database URL: ${env.SUPABASE_DB_URL}`);
    log(`- API URL: ${env.SUPABASE_URL}`);
    log(`- Status: Database has been reset with fresh migrations`);
    log(`\n🔍 You can view your database at: https://app.supabase.com/project/${env.SUPABASE_PROJECT_ID}`, CYAN);

  } catch (error) {
    log(`\n❌ Reset/deployment failed: ${(error as Error).message}`, RED);
    process.exit(1);
  } finally {
    // Change back to original directory
    process.chdir('..');
  }
}

// Run the reset and deployment
resetAndDeployDatabase().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, RED);
  process.exit(1);
});