/*
  # Create Categories Table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Category display name
      - `description` (text, not null) - Category description
      - `icon` (text, default 'tag') - Lucide icon name
      - `content_type` (text, not null) - Type: story, blog, gallery, glossary, book
      - `display_order` (integer, default 0) - Sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `categories` table
    - Public can read all categories
    - Authenticated users can manage categories

  3. Default Data
    - Blog categories: التراث والثقافة, لقاءات, دراسات وأبحاث
    - Story categories: قصص يومية, ذكريات, حكايات شعبية

  4. Indexes
    - content_type index for filtering
    - display_order index for sorting
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'tag',
  content_type text NOT NULL DEFAULT 'blog' CHECK (content_type IN ('story', 'blog', 'gallery', 'glossary', 'book')),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_categories_content_type ON categories(content_type);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

INSERT INTO categories (name, description, icon, content_type, display_order)
VALUES
  ('التراث والثقافة', 'مقالات عن التراث والثقافة السعودية', 'book', 'blog', 1),
  ('لقاءات', 'لقاءات وحوارات مع شخصيات تراثية', 'users', 'blog', 2),
  ('دراسات وأبحاث', 'دراسات وأبحاث في التراث السعودي', 'file-text', 'blog', 3),
  ('قصص يومية', 'قصص من الحياة اليومية في الماضي', 'book-open', 'story', 1),
  ('ذكريات', 'ذكريات وتجارب شخصية', 'heart', 'story', 2),
  ('حكايات شعبية', 'حكايات وأساطير شعبية متوارثة', 'sparkles', 'story', 3),
  ('كتب التراث', 'كتب متخصصة في التراث السعودي', 'book', 'book', 1),
  ('الدراسات التاريخية', 'كتب ودراسات في تاريخ المملكة', 'bookmark', 'book', 2),
  ('الفنون الشعبية', 'كتب عن الفنون والحرف التقليدية', 'book-open', 'book', 3),
  ('المعاجم والقواميس', 'معاجم وقواميس للألفاظ التراثية', 'book', 'book', 4)
ON CONFLICT DO NOTHING;
