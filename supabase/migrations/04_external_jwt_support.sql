-- Support for external JWT tokens (CTID) in RLS policies
-- This migration adds functions to extract and validate external JWT tokens

-- Function to decode JWT payload without signature verification
-- NOTE: This is for development/testing only - in production you should verify the signature
CREATE OR REPLACE FUNCTION public.decode_jwt_payload(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  parts text[];
  payload text;
  decoded_payload jsonb;
BEGIN
  -- Validate token format (should have 3 parts separated by '.')
  parts := string_to_array(token, '.');
  IF array_length(parts, 1) != 3 THEN
    RETURN NULL;
  END IF;
  
  -- Get the payload part (second part)
  payload := parts[2];
  
  -- Add padding if needed for base64 decoding
  WHILE length(payload) % 4 != 0 LOOP
    payload := payload || '=';
  END LOOP;
  
  -- Decode base64 and parse JSON
  BEGIN
    SELECT convert_from(decode(payload, 'base64'), 'utf8')::jsonb INTO decoded_payload;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
  
  -- Check if token is expired
  IF decoded_payload ? 'exp' AND 
     (decoded_payload->>'exp')::bigint < extract(epoch from now()) THEN
    RETURN NULL;
  END IF;
  
  RETURN decoded_payload;
END;
$$;

-- Function to extract JWT from Authorization header
CREATE OR REPLACE FUNCTION public.get_external_jwt()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  auth_header text;
  token text;
  jwt_payload jsonb;
BEGIN
  -- Try to get Authorization header from current request
  -- Note: This works differently in different contexts
  BEGIN
    auth_header := current_setting('request.headers', true)::jsonb ->> 'authorization';
  EXCEPTION
    WHEN OTHERS THEN
      -- Fallback: try to get from request context
      BEGIN
        auth_header := current_setting('request.jwt.claims', true);
        IF auth_header IS NOT NULL AND auth_header != '' THEN
          RETURN auth_header::jsonb;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN NULL;
      END;
  END;
  
  -- Extract Bearer token
  IF auth_header IS NULL OR NOT auth_header LIKE 'Bearer %' THEN
    RETURN NULL;
  END IF;
  
  token := substring(auth_header from 8); -- Remove 'Bearer ' prefix
  
  -- Decode JWT payload
  jwt_payload := public.decode_jwt_payload(token);
  
  RETURN jwt_payload;
END;
$$;

-- Function to get user role from external JWT
CREATE OR REPLACE FUNCTION public.get_external_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  jwt_payload jsonb;
  user_role text;
BEGIN
  jwt_payload := public.get_external_jwt();
  
  IF jwt_payload IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try different possible role claim names
  user_role := COALESCE(
    jwt_payload ->> 'user_role',
    jwt_payload ->> 'role',
    jwt_payload ->> 'user_profile',
    -- Check if roles array contains admin
    CASE 
      WHEN jwt_payload ? 'role' AND jwt_payload->'role' @> '["admin"]'::jsonb THEN 'admin'
      WHEN jwt_payload ? 'roles' AND jwt_payload->'roles' @> '["admin"]'::jsonb THEN 'admin'
      ELSE NULL
    END
  );
  
  RETURN user_role;
END;
$$;

-- Function to check if current user is admin via external JWT
CREATE OR REPLACE FUNCTION public.is_external_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN COALESCE(public.get_external_user_role() = 'admin', false);
END;
$$;

-- Update quiz RLS policies to support external JWT tokens

-- Drop existing admin policy for quizzes
DROP POLICY IF EXISTS "Admins can read all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can create quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON public.quizzes;

-- Create new policies that check both internal and external auth
CREATE POLICY "Admins can read all quizzes" ON public.quizzes
  FOR SELECT TO public 
  USING (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  );

CREATE POLICY "Admins can create quizzes" ON public.quizzes
  FOR INSERT TO public
  WITH CHECK (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  );

CREATE POLICY "Admins can update quizzes" ON public.quizzes
  FOR UPDATE TO public
  USING (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  )
  WITH CHECK (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  );

CREATE POLICY "Admins can delete quizzes" ON public.quizzes
  FOR DELETE TO public
  USING (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  );

-- Update quiz categories policies
DROP POLICY IF EXISTS "Admins can manage quiz categories" ON public.quiz_categories;

CREATE POLICY "Admins can manage quiz categories" ON public.quiz_categories
  FOR ALL TO public
  USING (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  );

-- Update questions policies
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;

CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL TO public
  USING (
    -- Internal Supabase auth
    ((auth.jwt() ->> 'user_role') = 'admin') OR
    -- External JWT auth
    public.is_external_admin()
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.decode_jwt_payload TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_external_jwt TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_external_user_role TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_external_admin TO anon, authenticated, service_role;

-- Add helpful comments
COMMENT ON FUNCTION public.decode_jwt_payload IS 'Decodes JWT payload without signature verification - for development only';
COMMENT ON FUNCTION public.get_external_jwt IS 'Extracts JWT payload from Authorization header';
COMMENT ON FUNCTION public.get_external_user_role IS 'Gets user role from external JWT token';
COMMENT ON FUNCTION public.is_external_admin IS 'Checks if current user is admin via external JWT';