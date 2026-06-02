/*
  # Add storyteller information to stories table

  1. Changes
    - Add metadata JSONB column to stories table to store storyteller information
      - teller_name
      - teller_mobile 
      - teller_email
      - teller_age
      - teller_city
      - story_source
      - source_age

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update the updated_at timestamp when metadata is modified
CREATE OR REPLACE FUNCTION update_stories_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_stories_metadata_trigger'
  ) THEN
    CREATE TRIGGER update_stories_metadata_trigger
      BEFORE UPDATE OF metadata
      ON stories
      FOR EACH ROW
      EXECUTE FUNCTION update_stories_metadata();
  END IF;
END $$;