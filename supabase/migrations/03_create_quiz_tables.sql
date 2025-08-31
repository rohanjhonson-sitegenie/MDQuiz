-- Create quiz_categories table (extending blog_tags pattern)
CREATE TABLE quiz_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quizzes table (extending blog_posts pattern)
CREATE TABLE quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES quiz_categories(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table with multimedia support
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'text_input')),
    question_content JSONB DEFAULT '{}'::jsonb,
    options JSONB DEFAULT '{}'::jsonb,
    answer_data JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create responses table for anonymous quiz responses (simplified)
CREATE TABLE responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- Simple client-generated identifier
    answers JSONB NOT NULL, -- All answers for the quiz attempt
    respondent_name TEXT, -- Optional name of quiz respondent
    respondent_email TEXT, -- Optional email of quiz respondent
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_quiz_categories_slug ON quiz_categories(slug);
CREATE INDEX idx_quizzes_published ON quizzes(published);
CREATE INDEX idx_quizzes_category ON quizzes(category_id);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);
CREATE INDEX idx_responses_quiz ON responses(quiz_id);
CREATE INDEX idx_responses_session ON responses(session_id);

-- Add triggers for updated_at columns (reusing existing function)
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_categories (following blog_tags pattern)
CREATE POLICY "Public can read quiz categories" ON quiz_categories
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage quiz categories" ON quiz_categories
    FOR ALL
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- RLS Policies for quizzes (following blog_posts pattern)
CREATE POLICY "Public can read published quizzes" ON quizzes
    FOR SELECT
    USING (published = true);

CREATE POLICY "Admins can read all quizzes" ON quizzes
    FOR SELECT
    USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can create quizzes" ON quizzes
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can update quizzes" ON quizzes
    FOR UPDATE
    USING (auth.jwt() ->> 'user_role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can delete quizzes" ON quizzes
    FOR DELETE
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- RLS Policies for questions
CREATE POLICY "Public can read questions from published quizzes" ON questions
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM quizzes 
        WHERE quizzes.id = questions.quiz_id 
        AND quizzes.published = true
    ));

CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- RLS Policies for responses (anonymous submission)
CREATE POLICY "Anyone can submit responses" ON responses
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can read all responses" ON responses
    FOR SELECT
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON quiz_categories TO anon, authenticated, service_role;
GRANT SELECT ON quizzes TO anon, authenticated, service_role;
GRANT SELECT ON questions TO anon, authenticated, service_role;
GRANT INSERT ON responses TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- Comments explaining the schema
COMMENT ON TABLE quiz_categories IS 
'Quiz categories for organization and filtering. Extends blog_tags pattern.';

COMMENT ON TABLE quizzes IS 
'Main quiz table. Extends blog_posts pattern with JSONB settings for flexibility.
Settings can include: time_limit, randomize_questions, show_feedback, etc.';

COMMENT ON TABLE questions IS 
'Quiz questions with multimedia support via JSONB fields.
question_content: structured content including media references
options: flexible option definitions for multiple choice, etc.
answer_data: validation rules and correct answers';

COMMENT ON TABLE responses IS 
'Anonymous quiz responses. Simple storage of quiz attempts with session_id for grouping.
answers JSONB contains all question responses for a complete quiz attempt.';