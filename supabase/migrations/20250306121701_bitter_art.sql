/*
  # Fix Categories Schema and Relationships

  1. Changes
    - Add content_type and parent_id columns to categories table
    - Add proper foreign key relationships
    - Add indexes for performance
    - Add constraints for content types
    - Update related tables to use category_id

  2. Security
    - Enable RLS
    - Add policies for authenticated users

  3. Triggers
    - Add trigger for updating content counts
*/

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'tag',
  stories_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0,
  content_type text DEFAULT 'story',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL
);

-- Add content type constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_content_type'
  ) THEN
    ALTER TABLE categories 
    ADD CONSTRAINT valid_content_type 
      CHECK (content_type = ANY (ARRAY['story', 'blog', 'gallery', 'glossary']));
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_categories_content_type ON categories(content_type);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Update stories table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE stories ADD COLUMN category_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stories_category_id_fkey'
  ) THEN
    ALTER TABLE stories DROP CONSTRAINT stories_category_id_fkey;
  END IF;
  
  ALTER TABLE stories 
    ADD CONSTRAINT stories_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id)
    ON DELETE SET NULL;
END $$;

-- Update blog posts table
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'category'
  ) THEN
    ALTER TABLE blog_posts DROP COLUMN category;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN category_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_category_id_fkey'
  ) THEN
    ALTER TABLE blog_posts 
      ADD CONSTRAINT blog_posts_category_id_fkey
      FOREIGN KEY (category_id) 
      REFERENCES categories(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Create function to update category content count
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

-- Create triggers
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

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage categories'
  ) THEN
    CREATE POLICY "Authenticated users can manage categories"
      ON categories
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON categories
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Insert default categories
INSERT INTO categories (name, description, icon, content_type, display_order)
VALUES 
  -- Story Categories
  ('الحكايات الشعبية', 'قصص متوارثة تحمل العبر والحكم', 'book', 'story', 1),
  ('قصص تاريخية', 'أحداث وقصص من التاريخ المحلي', 'landmark', 'story', 2),
  ('أهازيج الأمهات', 'أغاني وأهازيج كانت تغنيها الأمهات لأطفالهن', 'heart', 'story', 3),
  ('حكايات ما قبل النوم', 'قصص كان يرويها الآباء والأمهات لأطفالهم قبل النوم', 'moon', 'story', 4),
  ('الألعاب الشعبية', 'قصص عن الألعاب التقليدية وكيف كان يلعبها الأطفال قديماً', 'gamepad2', 'story', 5),
  ('الأمثال والحكم', 'قصص عن أصول الأمثال الشعبية ومناسباتها', 'quote', 'story', 6),
  
  -- Blog Categories
  ('التراث والثقافة', 'مقالات عن التراث والثقافة السعودية', 'bookmark', 'blog', 1),
  ('لقاءات', 'لقاءات مع الشخصيات التراثية', 'users', 'blog', 2),
  ('دراسات وأبحاث', 'دراسات وأبحاث في التراث السعودي', 'fileText', 'blog', 3),
  
  -- Gallery Categories
  ('صور تاريخية', 'صور نادرة من الماضي', 'image', 'gallery', 1),
  ('وثائق', 'وثائق ومخطوطات تاريخية', 'file', 'gallery', 2),
  ('فيديوهات', 'مقاطع فيديو توثيقية', 'video', 'gallery', 3),
  
  -- Glossary Categories
  ('الحياة اليومية', 'مصطلحات من الحياة اليومية', 'coffee', 'glossary', 1),
  ('التجارة والأسواق', 'مصطلحات تجارية وأسواق قديمة', 'shopping-bag', 'glossary', 2),
  ('الزراعة', 'مصطلحات زراعية', 'leaf', 'glossary', 3),
  ('الطقس والمناخ', 'مصطلحات عن الطقس والمناخ', 'cloud', 'glossary', 4),
  ('الطعام والشراب', 'مصطلحات الطعام والشراب', 'utensils', 'glossary', 5),
  ('الملابس والأزياء', 'مصطلحات الملابس والأزياء التقليدية', 'shirt', 'glossary', 6)
ON CONFLICT (id) DO 
  UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    content_type = EXCLUDED.content_type,
    display_order = EXCLUDED.display_order;