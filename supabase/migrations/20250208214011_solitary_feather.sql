-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'tag',
  stories_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Public read access"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add format and media_url columns to stories
ALTER TABLE stories ADD COLUMN format text DEFAULT 'written';
UPDATE stories SET format = 'written' WHERE format IS NULL;
ALTER TABLE stories ALTER COLUMN format SET NOT NULL;
ALTER TABLE stories ADD CONSTRAINT valid_format CHECK (format IN ('written', 'voice', 'video'));
ALTER TABLE stories ADD COLUMN media_url text;

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
  ('الحياة اليومية', 'قصص عن الحياة اليومية والعادات والتقاليد', 'users'),
  ('التجارة', 'قصص عن الأسواق والتجارة والمهن القديمة', 'book'),
  ('الزراعة', 'قصص عن الزراعة والحياة في المزارع', 'calendar'),
  ('العادات والتقاليد', 'قصص عن المناسبات والاحتفالات والتقاليد', 'tag');

-- Create function to update stories count
CREATE OR REPLACE FUNCTION update_category_stories_count() RETURNS TRIGGER AS $$ 
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

-- Create trigger for stories count
CREATE TRIGGER update_stories_count_trigger
  AFTER INSERT OR DELETE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_stories_count();

-- Add updated_at trigger for categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add category_id column to stories
ALTER TABLE stories ADD COLUMN category_id uuid REFERENCES categories(id);

-- Update existing stories to use category IDs
UPDATE stories SET category_id = (
  SELECT id FROM categories WHERE name = 
    CASE 
      WHEN stories.category = 'daily' THEN 'الحياة اليومية'
      WHEN stories.category = 'trade' THEN 'التجارة'
      WHEN stories.category = 'agriculture' THEN 'الزراعة'
      WHEN stories.category = 'social' THEN 'العادات والتقاليد'
    END
  LIMIT 1
);