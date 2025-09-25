-- Responses Table Improvements - Database Migration
-- Consolidates all responses-related fixes and improvements

-- 1. Fix RLS policy for responses table to allow SELECT after INSERT
-- This allows anonymous users to get the response ID after submitting
DROP POLICY IF EXISTS "Users can read their own responses" ON public.responses;

-- Create new policy that allows users to read responses with their session_id
CREATE POLICY "Users can read their own responses" ON public.responses
    FOR SELECT
    USING (true); -- Allow all reads for now since responses are anonymous

-- 2. Add unique constraint to prevent duplicate session submissions
-- First, remove any existing duplicate sessions (keeping the most recent one)
DELETE FROM responses r1
WHERE EXISTS (
  SELECT 1 FROM responses r2
  WHERE r1.session_id = r2.session_id
  AND r1.quiz_id = r2.quiz_id
  AND r1.submitted_at < r2.submitted_at
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE responses
ADD CONSTRAINT responses_session_quiz_unique
UNIQUE (session_id, quiz_id);

-- 3. Grant necessary permissions
GRANT SELECT ON responses TO anon, authenticated;
GRANT ALL ON responses TO postgres, service_role;

-- 4. Add helpful comments
COMMENT ON POLICY "Users can read their own responses" ON public.responses IS
'Allows anonymous and authenticated users to read response records after insertion.
This is needed to get the response ID after submitting a quiz and for analytics.';

COMMENT ON CONSTRAINT responses_session_quiz_unique ON responses IS
'Prevents duplicate responses from the same session for the same quiz';

-- 5. Create index for performance on session lookups
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_quiz_session ON responses(quiz_id, session_id);

-- 6. Add function to safely insert response and return ID
CREATE OR REPLACE FUNCTION insert_quiz_response(
    p_quiz_id UUID,
    p_session_id TEXT,
    p_question_id UUID,
    p_selected_option TEXT DEFAULT NULL,
    p_text_answer TEXT DEFAULT NULL,
    p_contact_info JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    response_id UUID;
BEGIN
    -- Insert the response, handling potential duplicates gracefully
    INSERT INTO responses (quiz_id, session_id, question_id, selected_option, text_answer, contact_info)
    VALUES (p_quiz_id, p_session_id, p_question_id, p_selected_option, p_text_answer, p_contact_info)
    ON CONFLICT (session_id, quiz_id)
    DO UPDATE SET
        selected_option = EXCLUDED.selected_option,
        text_answer = EXCLUDED.text_answer,
        contact_info = EXCLUDED.contact_info,
        submitted_at = NOW()
    RETURNING id INTO response_id;

    RETURN response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION insert_quiz_response(UUID, TEXT, UUID, TEXT, TEXT, JSONB) TO anon, authenticated, service_role;

COMMENT ON FUNCTION insert_quiz_response IS
'Safely inserts a quiz response, handling duplicates by updating existing records.
Returns the response ID for frontend use.';