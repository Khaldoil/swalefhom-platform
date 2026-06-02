/*
  # Categories Management Schema

  1. New Tables
    - None (using existing categories table)
  
  2. Changes
    - Add stories_count column to categories table if not exists
    - Add icon column to categories table if not exists
    - Add display_order column to categories table if not exists
    - Add description column to categories table if not exists
    - Add RLS policies for categories table
  
  3. Security
    - Enable RLS on categories table
    - Add policies for authenticated and public users
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'stories_count'
  ) THEN
    ALTER TABLE categories ADD COLUMN stories_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE categories ADD COLUMN icon text DEFAULT 'book';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN display_order integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'description'
  ) THEN
    ALTER TABLE categories ADD COLUMN description text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Public read access" ON categories;

-- Create policies
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

-- Create function to update stories count
CREATE OR REPLACE FUNCTION update_category_stories_count()
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

-- Create trigger for stories table
DROP TRIGGER IF EXISTS update_stories_count_trigger ON stories;
CREATE TRIGGER update_stories_count_trigger
AFTER INSERT OR DELETE ON stories
FOR EACH ROW
EXECUTE FUNCTION update_category_stories_count();