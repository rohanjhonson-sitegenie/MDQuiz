#!/usr/bin/env node

/**
 * Cross-platform database deployment script for development environment
 * This script works on Windows, macOS, and Linux without requiring bash or PowerShell
 */

import fs from 'fs';
import path from 'path';
import { getDirname } from './utils/paths.js';
import { log, GREEN, RED, YELLOW, CYAN, GRAY } from './utils/logger.js';
import { getSupabaseEnv } from './utils/env.js';
import { runCommand } from './utils/cli.js';

// Get __dirname equivalent in ES modules
const __dirname = getDirname(import.meta.url);

async function enableCustomAccessTokenHook(projectId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        HOOK_CUSTOM_ACCESS_TOKEN_ENABLED: true,
        HOOK_CUSTOM_ACCESS_TOKEN_URI: 'pg-functions://postgres/public/custom_access_token_hook'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(`⚠️  Warning: Failed to enable custom access token hook: ${response.status} ${errorText}`, YELLOW);
      log('Please enable it manually in the Supabase dashboard under Authentication > Hooks', YELLOW);
      return false;
    }

    log('✅ Custom access token hook enabled successfully', GREEN);
    return true;
  } catch (error) {
    log(`⚠️  Warning: Failed to enable custom access token hook: ${(error as Error).message}`, YELLOW);
    log('Please enable it manually in the Supabase dashboard under Authentication > Hooks', YELLOW);
    return false;
  }
}

async function deployDatabase(): Promise<void> {
  log('🚀 Starting database deployment to development environment...', GREEN);

  // Load and validate environment
  const env = getSupabaseEnv();

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

    // Push local config to remote
    log('⚙️  Syncing local config to remote...', CYAN);
    if (!runCommand(`npx supabase --yes config push --project-ref ${env.SUPABASE_PROJECT_ID}`, { env })) {
      log('⚠️  Warning: Failed to sync config, continuing with deployment...', YELLOW);
    }

    // Run database migrations
    log('🔄 Running database migrations...', CYAN);
    if (!runCommand(`npx supabase db push --password "${env.POSTGRES_PASSWORD}"`, { env })) {
      throw new Error('Failed to run migrations');
    }

    // Deploy Edge Functions
    log('⚡ Deploying Edge Functions...', CYAN);
    const functionsDir = path.join(supabaseDir, 'functions');
    if (fs.existsSync(functionsDir) && fs.readdirSync(functionsDir).length > 0) {
      if (!runCommand(`npx supabase functions deploy --project-ref ${env.SUPABASE_PROJECT_ID}`, { env })) {
        log('⚠️  Warning: Failed to deploy some functions', YELLOW);
      }

      // Set function secrets if any
      log('🔐 Setting function secrets...', CYAN);
      // Add any function secrets here as needed
      // Example: runCommand(`npx supabase secrets set MY_SECRET=${env.MY_SECRET} --project-ref ${env.SUPABASE_PROJECT_ID}`, { env });

      // Enable custom access token hook
      log('🔗 Enabling custom access token hook...', CYAN);
      await enableCustomAccessTokenHook(env.SUPABASE_PROJECT_ID!, env.SUPABASE_ACCESS_TOKEN!);
    } else {
      log('ℹ️  No Edge Functions found to deploy.', GRAY);
    }

    // Seed data is skipped due to --no-seed flag
    log('ℹ️  Skipping seed data (--no-seed flag is set).', GRAY);

    // Seed blog posts to database
    log('\n📝 Seeding blog posts to database...', CYAN);
    const seedBlogScript = path.join(__dirname, 'seed-blog-posts.ts');
    if (fs.existsSync(seedBlogScript)) {
      // Change back to root directory for blog seeding
      process.chdir('..');
      if (!runCommand(`npx tsx "${seedBlogScript}"`, { env })) {
        log('⚠️  Warning: Failed to seed some blog posts', YELLOW);
      }
      // Change back to supabase directory
      process.chdir(supabaseDir);
    } else {
      log('ℹ️  Blog seed script not found, skipping.', GRAY);
    }

    log('\n✅ Database deployment to development environment completed!', GREEN);
    log('\n📋 Deployment Summary:', YELLOW);
    log(`- Project ID: ${env.SUPABASE_PROJECT_ID}`);
    log(`- Database URL: ${env.SUPABASE_DB_URL}`);
    log(`- API URL: ${env.SUPABASE_URL}`);
    log(`\n🔍 You can view your database at: https://app.supabase.com/project/${env.SUPABASE_PROJECT_ID}`, CYAN);

  } catch (error) {
    log(`\n❌ Deployment failed: ${(error as Error).message}`, RED);
    process.exit(1);
  } finally {
    // Change back to original directory
    process.chdir('..');
  }
}

// Run the deployment
deployDatabase().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, RED);
  process.exit(1);
});