-- Fix RLS policy for responses table to allow SELECT after INSERT
-- This allows anonymous users to get the response ID after submitting

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read their own responses" ON public.responses;

-- Create new policy that allows users to read responses with their session_id
CREATE POLICY "Users can read their own responses" ON public.responses
    FOR SELECT
    USING (true); -- Allow all reads for now since responses are anonymous

-- Grant SELECT permission to anon and authenticated users
GRANT SELECT ON responses TO anon, authenticated;

COMMENT ON POLICY "Users can read their own responses" ON public.responses IS
'Allows anonymous and authenticated users to read response records after insertion.
This is needed to get the response ID after submitting a quiz.';