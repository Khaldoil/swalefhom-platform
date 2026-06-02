/*
  # Blog Categories Schema Update

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `content_type` (text)
      - `display_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add category_id to blog_posts table
    - Add foreign key constraint
    - Add RLS policies

  3. Security
    - Enable RLS on categories table
    - Add policies for authenticated and public access
*/

-- Create categories table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type_enum') THEN
    CREATE TYPE content_type_enum AS ENUM ('story', 'blog', 'gallery', 'glossary');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'tag',
  content_type content_type_enum NOT NULL DEFAULT 'blog',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add category_id to blog_posts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'categories' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
  DROP POLICY IF EXISTS "Public read access" ON categories;
END $$;

-- Create new policies
CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read access"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Insert default blog categories if they don't exist
INSERT INTO categories (name, description, icon, content_type)
SELECT 
  unnest(ARRAY['التراث والثقافة', 'لقاءات', 'دراسات وأبحاث']),
  unnest(ARRAY[
    'مقالات عن التراث والثقافة السعودية',
    'لقاءات وحوارات مع شخصيات تراثية',
    'دراسات وأبحاث في التراث السعودي'
  ]),
  unnest(ARRAY['book', 'users', 'file-text']),
  'blog'::content_type_enum
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE content_type = 'blog'
);

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;

-- Create new trigger
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_content_type ON categories(content_type);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Add constraint for valid content types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'categories' AND constraint_name = 'valid_content_type'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT valid_content_type 
      CHECK (content_type IN ('story', 'blog', 'gallery', 'glossary'));
  END IF;
END $$;