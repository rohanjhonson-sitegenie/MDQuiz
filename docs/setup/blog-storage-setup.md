# Blog Storage Setup Guide

This guide explains how the storage system is set up in Supabase for blog content.

## Overview

The storage system uses a **public bucket** for file storage with **API-level authorization** instead of Row Level Security (RLS). This approach:

- ✅ Fully automated deployment
- ✅ No manual configuration needed
- ✅ Follows industry best practices
- ✅ More flexible than RLS policies

## Automatic Setup

The storage bucket is automatically created when you run:

```bash
npm run reset:db:dev
```

This creates a `files` bucket with:
- **Public access** for reading (anyone can view uploaded files)
- **50MB file size limit**
- **Allowed types**: Images, Documents, Archives
- **Organized folder structure**: `/blog/images/`, `/downloads/`, etc.

## How It Works

### 1. Public Bucket
The `files` bucket is public, meaning:
- ✅ Anyone can **read/download** files (needed for displaying images)
- ❌ Direct uploads are **blocked** without proper authentication

### 2. API-Level Authorization
All uploads go through your backend/API, which:
- Checks if the user is authorized (e.g., admin role)
- Uses the service role key to bypass restrictions
- Uploads files to the appropriate folder

### 3. Folder Structure
```
files/
├── blog/
│   └── images/
│       └── {uuid}/
│           └── original.{ext}
├── downloads/      # Future: downloadable files
├── user-avatars/   # Future: user profile images
└── documents/      # Future: document storage
```

## Implementation Example

```typescript
// In your backend/Edge Function
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses all restrictions
)

export async function uploadBlogImage(request: Request) {
  // 1. Check authorization
  const user = await getUser(request)
  if (user.role !== 'admin') {
    return new Response('Unauthorized', { status: 403 })
  }

  // 2. Upload file using service role key
  const file = await request.file()
  const path = `blog/images/${uuid}/original.${ext}`
  
  const { data, error } = await supabaseAdmin.storage
    .from('files')
    .upload(path, file)

  if (error) {
    return new Response('Upload failed', { status: 500 })
  }

  // 3. Return public URL
  const { publicUrl } = supabaseAdmin.storage
    .from('files')
    .getPublicUrl(path).data

  return new Response(JSON.stringify({ url: publicUrl }))
}
```

## Security Considerations

1. **Never expose the service role key** to the frontend
2. **Always validate user permissions** before uploading
3. **Implement rate limiting** to prevent abuse
4. **Validate file types and sizes** in your API

## Troubleshooting

### Images Not Displaying
- Verify the bucket is public
- Check the file path is correct
- Ensure the URL includes the bucket name

### Upload Fails
- Check the service role key is correct
- Verify the user has proper permissions
- Check file size and type restrictions

## Benefits Over RLS

| Aspect | RLS Approach | API-Level Approach |
|--------|--------------|-------------------|
| Setup | Manual policies required | Fully automated |
| Deployment | Breaks CI/CD | Works with CI/CD |
| Flexibility | Limited by SQL | Full programmatic control |
| Testing | Hard to test locally | Easy to test |
| Debugging | Complex SQL debugging | Standard code debugging |

This approach ensures a smooth deployment process while maintaining security through your application layer.