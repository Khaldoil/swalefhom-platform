/*
  # Add category_id to Stories Table

  1. Changes
    - Add `category_id` (uuid) column to `stories` table
    - Add foreign key constraint to `categories` table
    - Add index for performance

  2. Notes
    - column is nullable since existing stories don't have categories yet
    - ON DELETE SET NULL so deleting a category doesn't delete stories
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE stories ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stories_category_id ON stories(category_id);
