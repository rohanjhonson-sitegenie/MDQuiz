#!/usr/bin/env node

/**
 * Download and upload demo blog images to Bunny Storage
 * Uses free stock photos from picsum.photos (Lorem Picsum)
 * 
 * Note: This script bypasses the API proxy and uploads directly to Bunny
 * to avoid authentication complexity during seeding.
 */

import { createHash } from 'crypto';
import { log, RED, GREEN, YELLOW, CYAN } from './utils/logger.js';
import { getAllEnv } from './utils/get-all-env.js';

// Blog images configuration
const BLOG_IMAGES = [
  {
    key: 'react-hero',
    originalFilename: 'react-hero.jpg',
    // Technology/coding themed image
    url: 'https://picsum.photos/seed/react/1200/630',
    description: 'React development'
  },
  {
    key: 'typescript-hero',
    originalFilename: 'typescript-hero.jpg',
    // Abstract/tech themed image
    url: 'https://picsum.photos/seed/typescript/1200/630',
    description: 'TypeScript programming'
  },
  {
    key: 'nextjs-hero',
    originalFilename: 'nextjs-hero.jpg',
    // Modern/minimal themed image
    url: 'https://picsum.photos/seed/nextjs/1200/630',
    description: 'Next.js development'
  },
  {
    key: 'css-hero',
    originalFilename: 'css-hero.jpg',
    // Colorful/design themed image
    url: 'https://picsum.photos/seed/css/1200/630',
    description: 'CSS and design'
  }
];

// This will store the mapping of original filename to UUID filename
const IMAGE_MAPPINGS: Record<string, string> = {};

/**
 * Generate a deterministic UUID based on a seed string
 * This ensures the same input always generates the same UUID
 */
function generateDeterministicUUID(seed: string): string {
  // Create a hash of the seed
  const hash = createHash('sha256').update(seed).digest('hex');
  
  // Format as UUID v4-like string
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20), // Variant
    hash.substring(20, 32)
  ].join('-');
  
  return uuid;
}

/**
 * Download image from URL using fetch
 */
async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Failed to download image: ${(error as Error).message}`);
  }
}

/**
 * Upload image directly to Bunny Storage with deterministic UUID filename
 * This bypasses the API proxy for seeding purposes
 */
async function uploadToBunny(
  originalFilename: string,
  imageKey: string,
  buffer: Buffer,
  bunnyApiKey: string,
  bunnyZone: string,
  bunnyHostname: string
): Promise<string | null> {
  try {
    // Generate deterministic UUID based on the image key
    // This ensures the same image always gets the same UUID
    const extension = originalFilename.split('.').pop() || 'jpg';
    const deterministicUuid = generateDeterministicUUID(`blog-image-${imageKey}`);
    const uuidFilename = `${deterministicUuid}.${extension}`;
    const path = `blog/images/${uuidFilename}`;
    const url = `https://${bunnyHostname}/${bunnyZone}/${path}`;
    
    // First, check if file already exists
    const checkResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'AccessKey': bunnyApiKey,
      }
    });
    
    if (checkResponse.ok) {
      log(`  ⏭️  Skipped ${originalFilename} (already exists as ${uuidFilename})`, YELLOW);
      return uuidFilename;
    }
    
    // Upload the file
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': bunnyApiKey,
        'Content-Type': 'image/jpeg',
      },
      body: buffer
    });

    if (!response.ok) {
      const error = await response.text();
      log(`  ❌ Failed to upload ${originalFilename}: ${error}`, RED);
      return null;
    }

    log(`  ✓ Uploaded ${originalFilename} as ${uuidFilename}`, GREEN);
    return uuidFilename;
  } catch (error) {
    log(`  ❌ Error uploading ${originalFilename}: ${(error as Error).message}`, RED);
    return null;
  }
}

async function seedBlogImages(skipIntro: boolean = false): Promise<Record<string, string>> {
  if (!skipIntro) {
    log('\n🖼️  Starting blog image seeding...\n', CYAN);
  }

  try {
    // Get credentials from all environment files
    log('\nLoading environment variables...', YELLOW);
    const env = getAllEnv();
    
    // CDN URL is optional for display purposes only
    const bunnyUrl = env.VITE_BUNNY_CDN_URL || env.BUNNY_CDN_URL || '[CDN_URL]';
    
    // For seeding, we need the Bunny API key which should be in server's .env
    const bunnyApiKey = env.BUNNY_STORAGE_API_KEY;
    const bunnyZone = env.BUNNY_STORAGE_ZONE_NAME;
    const bunnyHostname = env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com';

    // CDN URL is no longer required since we store paths only

    if (!bunnyApiKey || !bunnyZone) {
      log('❌ Missing Bunny Storage credentials:', RED);
      log('  Please add to your .env.development:', YELLOW);
      log('  - BUNNY_STORAGE_API_KEY', RED);
      log('  - BUNNY_STORAGE_ZONE_NAME', RED);
      log('  Note: These are only needed for seeding, not for runtime', YELLOW);
      process.exit(1);
    }
    
    // Download and upload images
    log('\nDownloading and uploading demo images...', YELLOW);
    
    for (const imageConfig of BLOG_IMAGES) {
      log(`\nProcessing ${imageConfig.originalFilename}...`, CYAN);
      log(`  Downloading from Lorem Picsum...`, YELLOW);
      
      try {
        // Download image
        const imageBuffer = await downloadImage(imageConfig.url);
        log(`  ✓ Downloaded (${(imageBuffer.length / 1024).toFixed(1)} KB)`, GREEN);
        
        // Upload to Bunny Storage with deterministic UUID
        const uuidFilename = await uploadToBunny(
          imageConfig.originalFilename,
          imageConfig.key,  // Use the key for deterministic UUID generation
          imageBuffer, 
          bunnyApiKey, 
          bunnyZone, 
          bunnyHostname
        );
        
        if (uuidFilename) {
          // Store the mapping
          IMAGE_MAPPINGS[imageConfig.originalFilename] = uuidFilename;
        }
      } catch (error) {
        log(`  ❌ Failed to process ${imageConfig.originalFilename}: ${(error as Error).message}`, RED);
      }
    }

    // Show image path mappings
    log('\n📸 Uploaded images:', CYAN);
    for (const image of BLOG_IMAGES) {
      const uuidFilename = IMAGE_MAPPINGS[image.originalFilename];
      if (uuidFilename) {
        const imagePath = `blog/images/${uuidFilename}`;
        log(`  ${image.originalFilename} → ${uuidFilename}`, GREEN);
        log(`    Path: ${imagePath}`, CYAN);
        if (bunnyUrl !== '[CDN_URL]') {
          log(`    Preview: ${bunnyUrl}/${imagePath}`, CYAN);
        }
      }
    }
    
    log('\n✅ Blog image seeding completed!', GREEN);
    
    return IMAGE_MAPPINGS;

  } catch (error) {
    log(`\n❌ Error seeding blog images: ${(error as Error).message}\n`, RED);
    process.exit(1);
  }
}

// Run if called directly - Windows-compatible path handling
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedBlogImages().catch((error) => {
    log(`Error: ${error.message}`, RED);
    process.exit(1);
  });
}

export { seedBlogImages };