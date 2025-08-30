-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  given_name TEXT,
  family_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate profile updates (prevent unauthorized role/email changes)
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation for service role (table editor) and postgres role
  IF auth.role() IN ('service_role', 'postgres') THEN
    RETURN NEW;
  END IF;

  -- Check if current user is admin
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    -- Admins cannot change their own role
    IF auth.uid() = OLD.id AND OLD.role IS DISTINCT FROM NEW.role THEN
      RAISE EXCEPTION 'Unauthorized: Admins cannot change their own role';
    END IF;
    -- Admins can update any other profile
    RETURN NEW;
  END IF;
  
  -- Regular users can only update their own profile
  IF auth.uid() != OLD.id THEN
    RAISE EXCEPTION 'Unauthorized: You can only update your own profile';
  END IF;
  
  -- Regular users cannot change protected fields on their own profile
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Unauthorized: You cannot change your own role';
  END IF;
  
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    RAISE EXCEPTION 'Unauthorized: You cannot change your email address';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the validation trigger
CREATE TRIGGER validate_profile_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_update();

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Use a direct query with SECURITY DEFINER to avoid RLS recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- RLS Policies for profiles table

-- 1. Enable read access for all users (anon, authenticated, service_role)
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT TO public USING (true);

-- 2. Enable insert for authenticated users only
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5. Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- 6. Admins can delete any profile
CREATE POLICY "Admins can delete any profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (is_admin());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT DEFAULT 'user';
BEGIN
  -- Check if profiles table is empty (this is the first user)
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If this is the first user, make them admin
  IF user_count = 0 THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, given_name, family_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'given_name',
      NEW.raw_user_meta_data->>'first_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL THEN
          -- Take everything except the last word as firstname
          CASE 
            WHEN array_length(string_to_array(NEW.raw_user_meta_data->>'name', ' '), 1) > 1 THEN
              trim(substring(NEW.raw_user_meta_data->>'name' FROM 1 FOR length(NEW.raw_user_meta_data->>'name') - length(split_part(NEW.raw_user_meta_data->>'name', ' ', array_length(string_to_array(NEW.raw_user_meta_data->>'name', ' '), 1))) - 1))
            ELSE NEW.raw_user_meta_data->>'name'
          END
        ELSE NULL
      END
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'family_name',
      NEW.raw_user_meta_data->>'last_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL AND 
             array_length(string_to_array(NEW.raw_user_meta_data->>'name', ' '), 1) > 1 THEN
          -- Take the last word as lastname
          split_part(NEW.raw_user_meta_data->>'name', ' ', array_length(string_to_array(NEW.raw_user_meta_data->>'name', ' '), 1))
        ELSE NULL
      END
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync email updates from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync email updates
CREATE TRIGGER sync_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();

-- Create the custom access token hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Extract the current claims
  claims := event->'claims';
  
  -- Get the user's role from the profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;
  
  -- Add custom claims
  claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(user_role, 'user')));
  
  -- Return the modified claims
  RETURN jsonb_build_object('claims', claims);
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO postgres;

-- Add an index on role for better performance when checking admin status
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Add comment explaining the security model
COMMENT ON TABLE public.profiles IS 
'User profiles table with RLS policies. 
- All users can view all profiles
- Users can update their own profile (except role/email)
- Admins can update any profile including changing roles
- First user to sign up automatically gets admin role
- Service role has unrestricted access';

-- Note: Admin role management is handled through direct updates by admin users
-- The validation trigger and RLS policies ensure only admins can change roles
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

-- Storage bucket policies for the 'files' bucket
-- These policies control who can upload, update, and delete files

-- Allow authenticated users to upload files to the 'files' bucket
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner)
    WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner);

-- Allow public read access to files in the 'files' bucket
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'files');

-- Optional: Admin policies for full access
CREATE POLICY "Admins have full access to storage" ON storage.objects
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'user_role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');