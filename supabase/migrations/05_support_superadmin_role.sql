-- Support for superadmin role in external JWT tokens
-- This migration updates the role checking functions to support both admin and superadmin

-- Update the get_external_user_role function to check for superadmin
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

  -- Try different possible role claim names, including superadmin
  user_role := COALESCE(
    jwt_payload ->> 'user_role',
    jwt_payload ->> 'role',
    jwt_payload ->> 'user_profile',
    -- Check if roles array contains admin or superadmin
    CASE
      WHEN jwt_payload ? 'role' AND jwt_payload->'role' @> '["admin"]'::jsonb THEN 'admin'
      WHEN jwt_payload ? 'role' AND jwt_payload->'role' @> '["superadmin"]'::jsonb THEN 'superadmin'
      WHEN jwt_payload ? 'roles' AND jwt_payload->'roles' @> '["admin"]'::jsonb THEN 'admin'
      WHEN jwt_payload ? 'roles' AND jwt_payload->'roles' @> '["superadmin"]'::jsonb THEN 'superadmin'
      ELSE NULL
    END
  );

  RETURN user_role;
END;
$$;

-- Update the is_external_admin function to accept both admin and superadmin
CREATE OR REPLACE FUNCTION public.is_external_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  user_role := public.get_external_user_role();
  -- Accept both 'admin' and 'superadmin' roles
  RETURN COALESCE(user_role = 'admin' OR user_role = 'superadmin', false);
END;
$$;

-- Create a specific function to check for superadmin
CREATE OR REPLACE FUNCTION public.is_external_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN COALESCE(public.get_external_user_role() = 'superadmin', false);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_external_superadmin TO anon, authenticated, service_role;

-- Add helpful comments
COMMENT ON FUNCTION public.is_external_superadmin IS 'Checks if current user is superadmin via external JWT';

-- Test function to debug JWT content (for development only)
CREATE OR REPLACE FUNCTION public.debug_jwt_content()
RETURNS TABLE(
  jwt_payload jsonb,
  user_role_field text,
  role_field text,
  user_profile_field text,
  computed_role text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := public.get_external_jwt();

  RETURN QUERY SELECT
    payload,
    payload ->> 'user_role',
    payload ->> 'role',
    payload ->> 'user_profile',
    public.get_external_user_role();
END;
$$;

GRANT EXECUTE ON FUNCTION public.debug_jwt_content TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.debug_jwt_content IS 'Debug function to see JWT content - for development only';