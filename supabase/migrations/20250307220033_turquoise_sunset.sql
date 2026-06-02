/*
  # Fix Category Relationship

  1. Changes
    - Add category_id column to stories table
    - Migrate existing category data to new category_id relationship
    - Add foreign key constraint to categories table

  2. Security
    - No data loss - existing category data is preserved
    - Safe migration with checks for existing column
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

-- Migrate existing category data to new structure
DO $$
DECLARE
  story_rec RECORD;
  matching_category_id uuid;
BEGIN
  FOR story_rec IN SELECT s.id, s.category FROM stories s WHERE s.category_id IS NULL AND s.category IS NOT NULL
  LOOP
    -- Find matching category
    SELECT id INTO matching_category_id FROM categories 
    WHERE content_type = 'story' 
    AND (
      (story_rec.category = 'lullabies' AND name = 'أهازيج الأمهات') OR
      (story_rec.category = 'bedtime' AND name = 'حكايات ما قبل النوم') OR
      (story_rec.category = 'folk_tales' AND name = 'الحكايات الشعبية') OR
      (story_rec.category = 'historical' AND name = 'قصص تاريخية') OR
      (story_rec.category = 'traditional_games' AND name = 'الألعاب الشعبية') OR
      (story_rec.category = 'proverbs' AND name = 'الأمثال والحكم') OR
      (story_rec.category = 'foundation_day' AND name = 'قصص التأسيس') OR
      (story_rec.category = 'national_day' AND name = 'ذكريات اليوم الوطني')
    )
    LIMIT 1;

    -- Update story with new category_id if found
    IF matching_category_id IS NOT NULL THEN
      UPDATE stories 
      SET category_id = matching_category_id
      WHERE id = story_rec.id;
    END IF;
  END LOOP;
END $$;