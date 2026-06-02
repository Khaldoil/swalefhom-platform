-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Anyone can update their submitted stories" ON stories;

-- Create simplified policies for public access
CREATE POLICY "Public read access"
  ON stories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public submit access"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Make sure user_id is nullable
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Ensure story_type column exists with proper constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'story_type'
  ) THEN
    ALTER TABLE stories ADD COLUMN story_type text NOT NULL DEFAULT 'real';
    ALTER TABLE stories ADD CONSTRAINT valid_story_type CHECK (story_type IN ('real', 'fiction'));
  END IF;
END $$;

-- Set default values for required fields
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'daily',
  ALTER COLUMN status SET DEFAULT 'draft';

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;