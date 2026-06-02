/*
  # Add region column to stories table

  1. Changes
    - Add `region` column to `stories` table
    - Set default value to 'riyadh'
    - Make it NOT NULL with default

  2. Notes
    - This allows storing the story's region directly instead of in metadata
    - Existing stories will get 'riyadh' as default region
*/

-- Add region column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'region'
  ) THEN
    ALTER TABLE stories ADD COLUMN region text NOT NULL DEFAULT 'riyadh';
  END IF;
END $$;
