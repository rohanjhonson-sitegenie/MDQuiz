#!/usr/bin/env node

/**
 * Seed demo blog posts from markdown files for cloud Supabase environments
 * Reads markdown files with frontmatter from the seed-data directory
 */

import { createClient } from '@supabase/supabase-js';
import { log, RED, GREEN, YELLOW, CYAN } from './utils/logger.js';
import { getAllEnv } from './utils/get-all-env.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { seedBlogImages } from './seed-blog-images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readBlogPosts() {
  const postsDir = path.join(__dirname, 'seed-data', 'blog-posts');
  const files = await fs.readdir(postsDir);
  const posts = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(postsDir, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Parse frontmatter and content
    const { data, content } = matter(fileContent);
    
    posts.push({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: content.trim(),
      author: data.author,
      tags: data.tags || [],
      featured_image: data.featured_image,
      reading_time: data.reading_time,
      published_at: data.published_at,
      draft: data.draft || false,
    });
  }

  return posts;
}

async function seedDemoBlogs() {
  log('\n🌱 Starting blog post seeding from markdown files...\n', CYAN);

  try {
    // First, upload blog images and get the filename mappings
    log('📸 Uploading blog images...', YELLOW);
    const imageMappings = await seedBlogImages(true);
    
    // Get all credentials from environment files
    const env = getAllEnv();
    
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      log('❌ Missing required environment variables:', RED);
      if (!supabaseUrl) log('  - VITE_SUPABASE_URL', RED);
      if (!supabaseServiceKey) log('  - SUPABASE_SERVICE_ROLE_KEY', RED);
      process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read blog posts from markdown files
    const blogPosts = await readBlogPosts();
    log(`Found ${blogPosts.length} blog posts to seed`, CYAN);

    // Create tags first
    const uniqueTags = [...new Set(blogPosts.flatMap(post => post.tags))];
    log(`\nCreating ${uniqueTags.length} tags...`, YELLOW);

    for (const tagName of uniqueTags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      const { error } = await supabase
        .from('blog_tags')
        .upsert({ name: tagName, slug }, { onConflict: 'slug' });
      
      if (error && !error.message.includes('duplicate')) {
        log(`  ❌ Failed to create tag "${tagName}": ${error.message}`, RED);
      }
    }

    // Create blog posts
    log(`\nCreating ${blogPosts.length} blog posts...`, YELLOW);

    for (const post of blogPosts) {
      // Transform featured_image path to use UUID filename (store path only, not full URL)
      let transformedImage = post.featured_image;
      
      if (post.featured_image && post.featured_image.startsWith('/blog/images/')) {
        // Extract the original filename from the path
        const originalFilename = post.featured_image.split('/').pop();
        const uuidFilename = originalFilename && imageMappings[originalFilename];
        
        if (uuidFilename) {
          // Store only the path, not the full URL
          transformedImage = `blog/images/${uuidFilename}`;
        } else {
          log(`  ⚠️  Warning: No UUID mapping found for ${originalFilename}`, YELLOW);
          // Fallback to original path (remove leading slash)
          transformedImage = post.featured_image.startsWith('/') 
            ? post.featured_image.slice(1) 
            : post.featured_image;
        }
      }
      
      // Create the post
      const { data: createdPost, error: postError } = await supabase
        .from('blog_posts')
        .upsert({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          featured_image: transformedImage,
          reading_time: post.reading_time,
          published_at: post.published_at,
          draft: post.draft,
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (postError) {
        log(`  ❌ Failed to create post "${post.title}": ${postError.message}`, RED);
        continue;
      }

      log(`  ✓ Created post: ${post.title}`, GREEN);

      // Link tags to the post
      if (createdPost && post.tags.length > 0) {
        // Get tag IDs
        const { data: tags } = await supabase
          .from('blog_tags')
          .select('id, name')
          .in('name', post.tags);

        if (tags) {
          // Delete existing tag relationships
          await supabase
            .from('blog_post_tags')
            .delete()
            .eq('post_id', createdPost.id);

          // Create new tag relationships
          const tagRelations = tags.map(tag => ({
            post_id: createdPost.id,
            tag_id: tag.id,
          }));

          const { error: tagError } = await supabase
            .from('blog_post_tags')
            .insert(tagRelations);

          if (tagError) {
            log(`    ❌ Failed to link tags: ${tagError.message}`, RED);
          } else {
            log(`    ✓ Linked ${tags.length} tags`, GREEN);
          }
        }
      }
    }

    log('\n✅ Blog post seeding completed!\n', GREEN);
    
  } catch (error) {
    log(`\n❌ Error seeding blog posts: ${(error as Error).message}\n`, RED);
    process.exit(1);
  }
}

// Run if called directly
const normalizedMetaUrl = import.meta.url.replace(/\\/g, '/');
const normalizedArgvPath = process.argv[1] ? `file:///${process.argv[1].replace(/\\/g, '/')}` : '';

if (normalizedMetaUrl === normalizedArgvPath || process.argv[1]?.endsWith('seed-demo-blogs.ts')) {
  seedDemoBlogs().catch((error) => {
    log(`Error: ${error.message}`, RED);
    process.exit(1);
  });
}

export { seedDemoBlogs };