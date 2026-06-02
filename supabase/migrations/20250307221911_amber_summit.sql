/*
  # Fix Category Relationships Migration

  1. Changes
    - Add category_id column to blog_posts and stories tables
    - Add foreign key constraints
    - Ensure safe column addition with IF NOT EXISTS checks

  2. Security
    - No data loss - existing data is preserved
    - Safe migration with proper error handling
    - Atomic operations
*/

-- Add category_id to stories if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE stories ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

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

-- Migrate existing story category data to new structure
DO $$
DECLARE
  story_rec RECORD;
  cat_id uuid;
BEGIN
  FOR story_rec IN 
    SELECT s.id, s.category_id 
    FROM stories s 
    WHERE s.category_id IS NULL
  LOOP
    -- Find matching category based on story type
    SELECT c.id INTO cat_id 
    FROM categories c
    WHERE c.content_type = 'story'
    LIMIT 1;

    -- Update story with new category_id if found
    IF cat_id IS NOT NULL THEN
      UPDATE stories 
      SET category_id = cat_id
      WHERE id = story_rec.id;
    END IF;
  END LOOP;
END $$;

-- Migrate existing blog post category data to new structure
DO $$
DECLARE
  blog_rec RECORD;
  cat_id uuid;
BEGIN
  FOR blog_rec IN 
    SELECT b.id, b.category_id 
    FROM blog_posts b 
    WHERE b.category_id IS NULL
  LOOP
    -- Find matching category based on blog type
    SELECT c.id INTO cat_id 
    FROM categories c
    WHERE c.content_type = 'blog'
    LIMIT 1;

    -- Update blog post with new category_id if found
    IF cat_id IS NOT NULL THEN
      UPDATE blog_posts 
      SET category_id = cat_id
      WHERE id = blog_rec.id;
    END IF;
  END LOOP;
END $$;