/*
  # Update story schema

  1. Changes
    - Remove region column from stories table
    - Update valid_category constraint with new categories
    - Add format column with check constraint
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update valid_category constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE stories ADD CONSTRAINT valid_category CHECK (
  category = ANY (ARRAY[
    'lullabies',
    'bedtime', 
    'folk_tales',
    'historical',
    'traditional_games',
    'proverbs',
    'foundation_day',
    'national_day'
  ])
);

-- Add format column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'format'
  ) THEN
    ALTER TABLE stories ADD COLUMN format text DEFAULT 'written'::text;
    ALTER TABLE stories ADD CONSTRAINT valid_format CHECK (
      format = ANY (ARRAY['written', 'audio', 'video'])
    );
  END IF;
END $$;

-- Remove region column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'region'
  ) THEN
    ALTER TABLE stories DROP COLUMN region;
  END IF;
END $$;