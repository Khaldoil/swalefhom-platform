/*
  # Fix Features Migration

  1. Add Indexes
    - Add indexes for frequently queried columns
    - Add indexes for foreign keys
    - Add indexes for sorting columns

  2. Add Constraints
    - Add missing constraints for data integrity
    - Add check constraints for enums

  3. Update Policies
    - Fix RLS policies for better security
    - Add missing policies
*/

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_category_id ON stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_gallery_items_status ON gallery_items(status);
CREATE INDEX IF NOT EXISTS idx_gallery_items_media_type ON gallery_items(media_type);

CREATE INDEX IF NOT EXISTS idx_glossary_terms_category ON glossary_terms(category);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_word ON glossary_terms(word);

-- Add missing constraints
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_format_check;
ALTER TABLE stories ADD CONSTRAINT stories_format_check 
  CHECK (format IN ('written', 'audio', 'video'));

ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_status_check;
ALTER TABLE stories ADD CONSTRAINT stories_status_check 
  CHECK (status IN ('draft', 'published', 'rejected'));

ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check 
  CHECK (status IN ('draft', 'published'));

ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS gallery_items_status_check;
ALTER TABLE gallery_items ADD CONSTRAINT gallery_items_status_check 
  CHECK (status IN ('draft', 'published'));

-- Fix RLS policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published stories" ON stories;
CREATE POLICY "Public can view published stories" 
  ON stories FOR SELECT 
  TO public 
  USING (status = 'published');

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
CREATE POLICY "Public can view published posts" 
  ON blog_posts FOR SELECT 
  TO public 
  USING (status = 'published');

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published items" ON gallery_items;
CREATE POLICY "Public can view published items" 
  ON gallery_items FOR SELECT 
  TO public 
  USING (status = 'published');

-- Add trigger for updating categories content count
CREATE OR REPLACE FUNCTION update_category_content_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET stories_count = stories_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET stories_count = stories_count - 1
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stories_count_trigger ON stories;
CREATE TRIGGER update_stories_count_trigger
  AFTER INSERT OR DELETE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_content_count();

DROP TRIGGER IF EXISTS update_blog_posts_count_trigger ON blog_posts;
CREATE TRIGGER update_blog_posts_count_trigger
  AFTER INSERT OR DELETE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_category_content_count();