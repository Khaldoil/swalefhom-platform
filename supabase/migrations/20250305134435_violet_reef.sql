/*
  # Remove region field from stories table

  1. Changes
    - Remove region column from stories table
    - Remove region-related constraints
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'region'
  ) THEN
    ALTER TABLE stories DROP COLUMN region;
  END IF;
END $$;