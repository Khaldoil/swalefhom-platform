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

-- Make sure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

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