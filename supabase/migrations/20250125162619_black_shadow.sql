-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;

-- Ensure story_type column exists with proper constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'story_type'
  ) THEN
    ALTER TABLE stories ADD COLUMN story_type text NOT NULL DEFAULT 'real';
  END IF;
END $$;

-- Add check constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_story_type'
  ) THEN
    ALTER TABLE stories ADD CONSTRAINT valid_story_type CHECK (story_type IN ('real', 'fiction'));
  END IF;
END $$;

-- Make sure user_id is nullable
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Set default values for required fields
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'daily',
  ALTER COLUMN status SET DEFAULT 'draft';

-- Create new policies with proper permissions
CREATE POLICY "Public read access"
  ON stories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public submit access"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'draft' AND
    metadata IS NOT NULL AND
    metadata ? 'teller_name' AND
    metadata ? 'teller_mobile' AND
    metadata ? 'teller_email'
  );

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;