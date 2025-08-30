# Supabase OAuth Setup Guide

## Overview

This guide covers setting up OAuth authentication with Supabase, including Google OAuth provider configuration and role-based access control using JWT tokens.

## Architecture

- **Authentication**: Supabase Auth with OAuth providers (Google)
- **Authorization**: Row Level Security (RLS) policies using JWT claims
- **Role Management**: Stored in `profiles` table, injected into JWT via custom access token hook
- **Frontend**: React with Zustand for auth state management

## Configuring OAuth Redirect URLs

To ensure OAuth authentication works correctly on both localhost and production, you need to configure the redirect URLs in your Supabase project.

### Steps to Configure:

1. **Go to your Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Go to `Authentication` → `URL Configuration`

3. **Add Redirect URLs**
   Add ALL the following URLs to the "Redirect URLs" section (this allows the same database to work with both local and production):
   
   ```
   # Local development URLs
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   http://localhost:3000/auth/callback
   http://127.0.0.1:5173/auth/callback
   
   # Production URLs
   https://your-production-domain.com/auth/callback
   https://www.your-production-domain.com/auth/callback
   ```

   **Important**: You can have multiple redirect URLs for the same Supabase project. This allows you to use the same database for both local development and production.

4. **Configure Google OAuth Provider** (if using Google)
   - Go to `Authentication` → `Providers` → `Google`
   - Make sure it's enabled
   - In your Google Cloud Console, add the same redirect URLs to your OAuth 2.0 Client ID:
     - `http://localhost:5173/auth/callback`
     - `https://your-production-domain.com/auth/callback`

### Site URL Configuration

**IMPORTANT**: In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: Set this to your PRODUCTION URL (e.g., `https://your-app.com`)
- **Redirect URLs**: Add BOTH localhost and production URLs here

The Site URL is used for email templates and magic links, while Redirect URLs are used for OAuth flows.

## Role-Based Access Control

### Database Schema

User roles are stored in the `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  -- other fields...
);
```

### JWT Token Enhancement

The custom access token hook automatically injects the user's role into JWT tokens:

1. **Hook Configuration** (in `supabase/config.toml`):
   ```toml
   [auth.hook.custom_access_token]
   enabled = true
   uri = "pg-functions://postgres/public/custom_access_token_hook"
   ```

2. **JWT Structure**:
   ```json
   {
     "sub": "user-id",
     "email": "user@example.com",
     "user_role": "admin",  // Injected by custom hook
     "app_metadata": {
       "role": "admin"      // Also added for consistency
     },
     // other claims...
   }
   ```

### RLS Policies

Row Level Security policies use the JWT claims:
```sql
-- Example: Admins can view all profiles
CREATE POLICY "admins_view_all_profiles" ON profiles
FOR SELECT USING (
  auth.jwt() ->> 'user_role' IN ('admin', 'system-admin')
);
```

### Frontend Integration

The auth store (`src/stores/authStore.ts`) manages authentication state:
```typescript
// Current limitation: Role is hardcoded as ['user']
// TODO: Read from JWT token's user_role claim
const authUser: AuthUser = {
  accountNo: session.user.id,
  email: session.user.email || '',
  role: ['user'],  // Should read from JWT
  // ...
}
```

### Important Notes:

- The code uses `window.location.origin` which automatically adapts to your current environment
- Always use the `/auth/callback` path as configured in the application
- For production, replace `your-production-domain.com` with your actual domain
- If you're still being redirected to production from localhost, clear your browser cache and cookies
- You can use the same Supabase database for both local and production environments
- User roles are automatically included in JWT tokens via the custom access token hook

### Troubleshooting:

1. **Clear Browser Data**
   - Clear cookies and cache for your localhost domain
   - Try in an incognito/private window

2. **Check Browser Console**
   - Look for any error messages during the OAuth flow
   - Check the redirect URL being used

3. **Verify Environment Variables**
   - Ensure your `.env.development` file has the correct Supabase URL and anon key
   - The Supabase URL should match your project URL

4. **Check Supabase Logs**
   - Go to your Supabase dashboard → `Logs` → `Auth`
   - Look for any authentication errors

5. **Verify Role Injection**
   - Use the JWT Token Viewer component to inspect the token
   - Check if `user_role` claim is present in the token
   - Verify the custom access token hook is enabled in `supabase/config.toml`

6. **Test RLS Policies**
   ```sql
   -- Check current user's JWT claims
   SELECT auth.jwt();
   
   -- Test if user can access admin-only data
   SELECT * FROM profiles WHERE auth.jwt() ->> 'user_role' = 'admin';
   ```

## Testing Authentication Flow

1. **Sign in with Google**:
   ```typescript
   await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${window.location.origin}/auth/callback`
     }
   })
   ```

2. **Verify JWT Token**:
   - Navigate to `/settings` and use the JWT Token Viewer
   - Confirm the `user_role` claim is present
   - Check token expiration time

3. **Update User Role**:
   ```sql
   -- Admin users can update roles
   UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
   ```

4. **Refresh Token**:
   ```typescript
   // Force token refresh to get updated role
   await supabase.auth.refreshSession();
   ```

## Security Best Practices

1. **Token Expiration**: Access tokens expire after 1 hour, ensuring role changes take effect promptly
2. **Refresh Tokens**: Stored securely, used to obtain new access tokens
3. **RLS Enforcement**: All data access goes through Row Level Security policies
4. **Frontend Validation**: Always treat frontend role checks as UI hints, not security measures
5. **Backend Validation**: RLS policies provide the actual security enforcement