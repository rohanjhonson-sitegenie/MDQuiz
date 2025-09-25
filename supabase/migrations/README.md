# Database Migrations

## Migration History

This directory contains all database schema migrations for the MDQuiz application.

### Current Migrations (Consolidated)

1. **01_supabase_auth_profiles.sql** - Base authentication and profiles
   - Creates `profiles` table with RLS policies
   - Sets up auth triggers and functions
   - Configures storage policies
   - Implements custom access token hook

2. **02_create_blog_tables.sql** - Blog functionality
   - Creates `blog_posts`, `blog_tags`, `blog_post_tags` tables
   - Sets up RLS policies for public read, admin write
   - Adds indexes and triggers

3. **03_create_quiz_tables.sql** - Core quiz functionality
   - Creates `quiz_categories`, `quizzes`, `questions`, `responses` tables
   - Implements RLS policies for quiz management
   - Adds anonymous response submission support

4. **04_support_superadmin_role.sql** - Superadmin role support (CONSOLIDATED)
   - Updates profiles table constraint to allow 'superadmin' role
   - Updates ALL RLS policies to accept both 'admin' and 'superadmin'
   - Covers: quiz tables, blog tables, profiles, storage policies
   - **Note**: This migration consolidates what was previously migrations 05, 08, 09, 10

5. **05_add_quiz_sections.sql** - Sectioned quiz support
   - Creates `quiz_sections` table for organizing questions
   - Adds `section_id` to questions table (nullable for backward compatibility)
   - Implements helper functions for quiz structure management
   - RLS policies support both 'admin' and 'superadmin' roles

6. **06_responses_improvements.sql** - Responses table improvements (CONSOLIDATED)
   - Fixes RLS policies to allow SELECT after INSERT for anonymous users
   - Adds unique constraint to prevent duplicate session submissions
   - Creates performance indexes for session lookups
   - Adds helper function for safe response insertion
   - **Note**: This migration consolidates all responses-related fixes

## Removed Migrations

The following migrations were removed during consolidation:

### Previously Removed
- ~~**04_external_jwt_support.sql**~~ - Obsolete (replaced by token-exchange edge function)
- ~~**05_support_superadmin_role.sql**~~ - Merged into 04
- ~~**06_disable_rls_for_dev.sql**~~ - Deleted (was temporary dev fix)
- ~~**08_allow_superadmin_in_profiles.sql**~~ - Merged into 04
- ~~**09_update_rls_for_superadmin.sql**~~ - Merged into 04
- ~~**10_update_responses_rls_for_superadmin.sql**~~ - Merged into 04

### Recently Consolidated (2025-01)
- ~~**07_fix_quiz_sections_rls.sql**~~ - Redundant (05 already had correct policies)
- ~~**08_disable_rls_responses_dev.sql**~~ - Merged into 06 (dev-only change removed)
- ~~**08_fix_duplicate_sessions.sql**~~ - Merged into 06
- ~~**08_fix_responses_select_policy.sql**~~ - Merged into 06

## Authentication Flow

The application uses **satellite database pattern** with token-exchange:

1. User authenticates with CTID Service (main identity provider)
2. CTID Service issues JWT with `user_role` claim ('admin' or 'superadmin')
3. Frontend calls token-exchange edge function with CTID JWT
4. Token-exchange validates CTID JWT and creates satellite database JWT
5. Satellite JWT contains same claims including `user_role`
6. RLS policies check `auth.jwt() ->> 'user_role'` for access control

## Role Hierarchy

- **user** - Default role for all new users
- **admin** - Can manage quizzes, blog posts, view analytics
- **superadmin** - Same permissions as admin (future: additional privileges)

## Applying Migrations

### Development
```bash
# Reset and apply all migrations
npm run reset:db:dev

# Deploy migrations to dev
npm run deploy:db:dev
```

### Production
```bash
# Apply pending migrations
supabase db push
```

## Important Notes

1. **Never modify deployed migrations** - Always create new migrations for changes
2. **RLS Policies** - All admin policies now check for both 'admin' and 'superadmin' roles
3. **Backward Compatibility** - Quiz sections are optional (section_id nullable in questions)
4. **Token Exchange** - External JWT support is handled via edge function, not database functions

## Troubleshooting

### Common Issues

**Issue**: COUNT queries return NaN with RLS
- **Cause**: PostgREST HEAD requests don't work properly with RLS+JWT
- **Solution**: Fetch data and count array length instead of using `{ count: 'exact', head: true }`

**Issue**: `.single()` returns array instead of object
- **Cause**: Supabase behavior change with RLS+JWT active
- **Solution**: Use `extractSingleResult()` helper function to handle both formats

**Issue**: "Permission denied" for admin operations
- **Cause**: JWT doesn't contain `user_role` claim or RLS policy outdated
- **Solution**: Verify token-exchange is working and RLS policies include superadmin