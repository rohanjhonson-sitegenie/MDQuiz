/**
 * Setup demo blog images
 * Downloads placeholder images and uploads them to Supabase storage
 */

import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './db/utils/env.js';
import { log, RED, GREEN, YELLOW, CYAN } from './db/utils/logger.js';
import fetch from 'node-fetch';

// Blog post configurations with placeholder images
const BLOG_POSTS = [
  {
    slug: 'getting-started-with-react',
    imageUrl: 'https://picsum.photos/seed/react-hero/800/400',
    fileName: 'react-hero.jpg',
    altText: 'React logo and code illustration'
  },
  {
    slug: 'typescript-best-practices',
    imageUrl: 'https://picsum.photos/seed/typescript/800/400',
    fileName: 'typescript-hero.jpg',
    altText: 'TypeScript code example'
  },
  {
    slug: 'building-responsive-layouts',
    imageUrl: 'https://picsum.photos/seed/css-grid/800/400',
    fileName: 'css-grid-hero.jpg',
    altText: 'CSS Grid layout example'
  },
  {
    slug: 'nextjs-14-features',
    imageUrl: 'https://picsum.photos/seed/nextjs/800/400',
    fileName: 'nextjs-hero.jpg',
    altText: 'Next.js framework illustration'
  }
];

async function setupDemoBlogImages(): Promise<void> {
  log('Setting up demo blog images...', CYAN);
  
  try {
    // Load environment variables
    const env = getSupabaseEnv();
    const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      log('❌ Missing required environment variables', RED);
      process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Process each blog post
    for (const post of BLOG_POSTS) {
      log(`\nProcessing ${post.slug}...`, YELLOW);
      
      try {
        // Download image
        log(`  Downloading image from ${post.imageUrl}...`, CYAN);
        const response = await fetch(post.imageUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }
        
        const buffer = await response.buffer();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        
        // Upload to Supabase storage
        const storagePath = `blog/images/${post.slug}/${post.fileName}`;
        log(`  Uploading to storage: ${storagePath}...`, CYAN);
        
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(storagePath, blob, {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(storagePath);
        
        log(`  ✓ Uploaded successfully: ${publicUrl}`, GREEN);
        
        // Update blog post in database
        const { data: posts } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', post.slug)
          .single();
        
        if (posts) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ featured_image: publicUrl })
            .eq('slug', post.slug);
          
          if (updateError) {
            log(`  ⚠ Could not update blog post: ${updateError.message}`, YELLOW);
          } else {
            log(`  ✓ Updated blog post with featured image`, GREEN);
          }
        }
        
      } catch (error) {
        log(`  ❌ Failed to process ${post.slug}: ${(error as Error).message}`, RED);
      }
    }
    
    log('\n✅ Demo blog images setup complete!', GREEN);
    
  } catch (error) {
    log('\n❌ Setup failed:', RED);
    log((error as Error).message || String(error), RED);
    process.exit(1);
  }
}

setupDemoBlogImages();