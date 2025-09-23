-- Add Quiz Sections Support - Database Migration
-- This migration adds section-based quiz functionality while maintaining backward compatibility

-- Create quiz_sections table
CREATE TABLE quiz_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add section_id reference to questions table (nullable for backward compatibility)
ALTER TABLE questions ADD COLUMN section_id UUID REFERENCES quiz_sections(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_quiz_sections_quiz_id ON quiz_sections(quiz_id);
CREATE INDEX idx_quiz_sections_order ON quiz_sections(quiz_id, order_index);
CREATE INDEX idx_questions_section_id ON questions(section_id);
CREATE INDEX idx_questions_section_order ON questions(section_id, order_index);

-- Add trigger for updated_at on quiz_sections
CREATE TRIGGER update_quiz_sections_updated_at BEFORE UPDATE ON quiz_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on quiz_sections
ALTER TABLE quiz_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_sections (following quiz pattern)
CREATE POLICY "Public can read sections from published quizzes" ON quiz_sections
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM quizzes
        WHERE quizzes.id = quiz_sections.quiz_id
        AND quizzes.published = true
    ));

CREATE POLICY "Admins can read all quiz sections" ON quiz_sections
    FOR SELECT
    USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can create quiz sections" ON quiz_sections
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can update quiz sections" ON quiz_sections
    FOR UPDATE
    USING (auth.jwt() ->> 'user_role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can delete quiz sections" ON quiz_sections
    FOR DELETE
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- Grant permissions
GRANT SELECT ON quiz_sections TO anon, authenticated, service_role;
GRANT ALL ON quiz_sections TO postgres, service_role;

-- Add helpful comments
COMMENT ON TABLE quiz_sections IS
'Quiz sections for organizing questions into groups with specific settings.
Supports both sectioned and mixed quiz structures through optional section_id in questions.';

COMMENT ON COLUMN quiz_sections.settings IS
'JSONB field containing section-specific settings:
- allowed_question_types: Array of question types allowed in this section
- time_limit_minutes: Time limit for this section
- question_count_limit: Maximum questions allowed
- allow_backward_navigation: Whether users can go back
- require_completion_before_next: Must complete before moving to next section
- points_per_question: Default points for questions in this section
- show_section_feedback: Whether to show feedback at section completion
- shuffle_questions: Whether to randomize question order in this section';

COMMENT ON COLUMN questions.section_id IS
'Optional reference to quiz_sections. NULL indicates question belongs to main quiz (legacy/mixed mode).
When not NULL, question is part of a structured section with specific settings and ordering.';

-- Create helper function to get quiz structure type
CREATE OR REPLACE FUNCTION get_quiz_structure_type(quiz_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    -- Check if quiz has any sections
    IF EXISTS (SELECT 1 FROM quiz_sections WHERE quiz_id = quiz_uuid) THEN
        RETURN 'sectioned';
    ELSE
        RETURN 'mixed';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to auto-migrate quiz to sections
CREATE OR REPLACE FUNCTION create_default_section_for_quiz(quiz_uuid UUID, section_title TEXT DEFAULT 'Main Section')
RETURNS UUID AS $$
DECLARE
    new_section_id UUID;
BEGIN
    -- Create a default section
    INSERT INTO quiz_sections (quiz_id, title, description, order_index, settings)
    VALUES (
        quiz_uuid,
        section_title,
        'Default section containing all questions',
        0,
        jsonb_build_object(
            'allowed_question_types', '["multiple_choice", "true_false", "text_input"]'::jsonb,
            'show_section_feedback', true,
            'shuffle_questions', false
        )
    )
    RETURNING id INTO new_section_id;

    -- Move all existing questions to this section
    UPDATE questions
    SET section_id = new_section_id
    WHERE quiz_id = quiz_uuid AND section_id IS NULL;

    RETURN new_section_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_quiz_structure_type(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_default_section_for_quiz(UUID, TEXT) TO authenticated, service_role;