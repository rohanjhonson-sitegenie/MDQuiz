#!/usr/bin/env node

/**
 * Setup storage buckets for the application
 * This creates the necessary storage buckets without RLS policies
 * Authorization is handled at the API level instead
 */

import { createClient } from '@supabase/supabase-js';
import { log, GREEN, RED, YELLOW, CYAN } from './utils/logger.js';
import { getSupabaseEnv } from './utils/env.js';

/**
 * Create storage buckets
 */
export async function setupStorage(): Promise<boolean> {
  log('📦 Setting up storage buckets...', CYAN);
  
  try {
    // Load environment variables
    const env = getSupabaseEnv();
    
    if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      log('❌ Missing required environment variables for storage setup', RED);
      log('  Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', YELLOW);
      return false;
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      env.VITE_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      log(`❌ Failed to list storage buckets: ${listError.message}`, RED);
      return false;
    }
    
    const filesBucket = buckets?.find((b) => b.name === 'files');
    
    if (filesBucket) {
      log('✅ files bucket already exists', GREEN);
      log(`   - Public: ${filesBucket.public}`, CYAN);
      log(`   - File size limit: ${filesBucket.file_size_limit ? `${filesBucket.file_size_limit / 1024 / 1024}MB` : 'None'}`, CYAN);
      return true;
    }
    
    // Create bucket
    log('🔨 Creating files bucket...', YELLOW);
    const { error: createError } = await supabase.storage.createBucket('files', {
      public: true, // Public for reading, uploads controlled via API
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        // Images
        'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml',
        // Documents
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
        // Archives
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
      ]
    });
    
    if (createError) {
      log(`❌ Failed to create storage bucket: ${createError.message}`, RED);
      return false;
    }
    
    log('✅ files bucket created successfully', GREEN);
    log('   - Public: true (for reading)', CYAN);
    log('   - File size limit: 50MB', CYAN);
    log('   - Allowed types: Images, Documents, Archives', CYAN);
    log('   - Folder structure: /blog/images/, /downloads/, etc.', CYAN);
    log('\n📝 Note: Storage authorization is handled at the API level', YELLOW);
    log('   No RLS policies are needed - uploads are controlled through your backend', YELLOW);
    
    return true;
    
  } catch (error) {
    log(`❌ Error setting up storage: ${(error as Error).message}`, RED);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStorage().then(success => {
    process.exit(success ? 0 : 1);
  });
}