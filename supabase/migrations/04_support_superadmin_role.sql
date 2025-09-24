-- Comprehensive Superadmin Role Support
-- This migration adds full support for 'superadmin' role in addition to 'admin'
-- Consolidates incremental superadmin fixes into a single migration

-- ============================================================================
-- 1. UPDATE PROFILES TABLE CONSTRAINT
-- ============================================================================

-- Drop the existing constraint that only allows 'user' and 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint that allows 'user', 'admin', and 'superadmin'
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'superadmin'));

COMMENT ON CONSTRAINT profiles_role_check ON public.profiles IS 'Allow user, admin, and superadmin roles';

-- ============================================================================
-- 2. UPDATE RLS POLICIES FOR QUIZ TABLES
-- ============================================================================

-- Quiz Categories
DROP POLICY IF EXISTS "Admins can manage quiz categories" ON public.quiz_categories;
DROP POLICY IF EXISTS "Admin full access to quiz categories" ON public.quiz_categories;

CREATE POLICY "Admins can manage quiz categories" ON public.quiz_categories
    FOR ALL
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- Quizzes
DROP POLICY IF EXISTS "Admins can read all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can create quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin can view all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin can create quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin can delete quizzes" ON public.quizzes;

CREATE POLICY "Admins can read all quizzes" ON public.quizzes
    FOR SELECT
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can create quizzes" ON public.quizzes
    FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can update quizzes" ON public.quizzes
    FOR UPDATE
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'))
    WITH CHECK ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can delete quizzes" ON public.quizzes
    FOR DELETE
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- Questions
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
DROP POLICY IF EXISTS "Admin can manage quiz questions" ON public.questions;

CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- Responses
DROP POLICY IF EXISTS "Admins can read all responses" ON public.responses;

CREATE POLICY "Admins can read all responses" ON public.responses
    FOR SELECT
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- ============================================================================
-- 3. UPDATE RLS POLICIES FOR BLOG TABLES
-- ============================================================================

-- Blog Posts
DROP POLICY IF EXISTS "Admins can read all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can create blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;

CREATE POLICY "Admins can read all blog posts" ON public.blog_posts
    FOR SELECT
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can create blog posts" ON public.blog_posts
    FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
    FOR UPDATE
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'))
    WITH CHECK ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
    FOR DELETE
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- Blog Tags
DROP POLICY IF EXISTS "Admins can manage tags" ON public.blog_tags;

CREATE POLICY "Admins can manage tags" ON public.blog_tags
    FOR ALL
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- Blog Post Tags
DROP POLICY IF EXISTS "Admins can manage post tags" ON public.blog_post_tags;

CREATE POLICY "Admins can manage post tags" ON public.blog_post_tags
    FOR ALL
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- ============================================================================
-- 4. UPDATE RLS POLICIES FOR PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

-- Recreate with superadmin support
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'))
    WITH CHECK ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

CREATE POLICY "Admins can delete any profile" ON public.profiles
    FOR DELETE TO authenticated
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- ============================================================================
-- 5. UPDATE STORAGE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins have full access to storage" ON storage.objects;

CREATE POLICY "Admins have full access to storage" ON storage.objects
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'))
    WITH CHECK ((auth.jwt() ->> 'user_role') IN ('admin', 'superadmin'));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS
'User profiles table with RLS policies.
- All users can view all profiles
- Users can update their own profile (except role/email)
- Admins and superadmins can update any profile including changing roles
- First user to sign up automatically gets admin role
- Service role has unrestricted access';