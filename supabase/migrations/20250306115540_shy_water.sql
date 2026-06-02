/*
  # Comprehensive Categories Management Schema Update

  1. Changes
    - Add content_type and parent_id columns to categories table
    - Update foreign key relationships
    - Add necessary indexes and constraints
    - Create triggers for content counting
    - Insert default categories for all content types
  
  2. Security
    - Maintain existing RLS policies
    - Add data validation constraints
*/

-- Step 1: Add new columns with safe defaults
DO $$ BEGIN
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS content_type text;
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id uuid;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Step 2: Set default value for content_type
UPDATE categories SET content_type = 'story' WHERE content_type IS NULL;
ALTER TABLE categories ALTER COLUMN content_type SET DEFAULT 'story';
ALTER TABLE categories ALTER COLUMN content_type SET NOT NULL;

-- Step 3: Add foreign key for parent_id
ALTER TABLE categories 
  ADD CONSTRAINT categories_parent_id_fkey 
  FOREIGN KEY (parent_id) 
  REFERENCES categories(id) 
  ON DELETE SET NULL;

-- Step 4: Add content type constraint
DO $$ BEGIN
  ALTER TABLE categories 
    ADD CONSTRAINT valid_content_type 
    CHECK (content_type = ANY (ARRAY['story', 'blog', 'gallery', 'glossary']));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_content_type ON categories(content_type);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Step 6: Update stories table foreign key
DO $$ BEGIN
  ALTER TABLE stories 
    DROP CONSTRAINT IF EXISTS stories_category_id_fkey;
  
  ALTER TABLE stories 
    ADD CONSTRAINT stories_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Step 7: Update blog posts table
DO $$ BEGIN
  ALTER TABLE blog_posts DROP COLUMN IF EXISTS category;
  ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category_id uuid;
  
  ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Step 8: Create content count function
CREATE OR REPLACE FUNCTION update_category_content_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET stories_count = COALESCE(stories_count, 0) + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET stories_count = GREATEST(COALESCE(stories_count, 0) - 1, 0)
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create triggers
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_stories_count_trigger ON stories;
  CREATE TRIGGER update_stories_count_trigger
    AFTER INSERT OR DELETE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_content_count();
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_blog_posts_count_trigger ON blog_posts;
  CREATE TRIGGER update_blog_posts_count_trigger
    AFTER INSERT OR DELETE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_category_content_count();
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Step 10: Insert default categories
INSERT INTO categories (
  name, 
  description, 
  icon, 
  content_type, 
  display_order
)
SELECT * FROM (VALUES
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
) AS new_categories(name, description, icon, content_type, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM categories 
  WHERE categories.name = new_categories.name 
  AND categories.content_type = new_categories.content_type
);