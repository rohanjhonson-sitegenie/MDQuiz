-- Create blog_posts table
CREATE TABLE blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    content_hash TEXT,
    author TEXT NOT NULL,
    featured_image TEXT,
    reading_time INTEGER,
    draft BOOLEAN DEFAULT false,
    seo JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE blog_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_post_tags junction table
CREATE TABLE blog_post_tags (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author ON blog_posts(author);
CREATE INDEX idx_blog_posts_draft ON blog_posts(draft);
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for published blog posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
    FOR SELECT
    USING (published_at <= NOW() AND draft = false);

-- Public read access for tags
CREATE POLICY "Public can read tags" ON blog_tags
    FOR SELECT
    USING (true);

-- Public read access for post-tag relationships
CREATE POLICY "Public can read post tags" ON blog_post_tags
    FOR SELECT
    USING (true);

-- Admin policies for blog posts
CREATE POLICY "Admins can read all blog posts" ON blog_posts
    FOR SELECT
    USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can create blog posts" ON blog_posts
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can update blog posts" ON blog_posts
    FOR UPDATE
    USING (auth.jwt() ->> 'user_role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can delete blog posts" ON blog_posts
    FOR DELETE
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- Admins can manage tags
CREATE POLICY "Admins can manage tags" ON blog_tags
    FOR ALL
    USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admins can manage post tags" ON blog_post_tags
    FOR ALL
    USING (auth.jwt() ->> 'user_role' = 'admin');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for public blog posts
CREATE OR REPLACE VIEW public_blog_posts AS
SELECT 
    id,
    slug,
    title,
    excerpt,
    content,
    author,
    featured_image,
    reading_time,
    seo,
    published_at,
    updated_at,
    created_at
FROM blog_posts
WHERE published_at <= NOW() 
    AND draft = false;