-- Drop existing policies
DROP POLICY IF EXISTS "Stories access v1" ON stories;
DROP POLICY IF EXISTS "Stories public access" ON stories;
DROP POLICY IF EXISTS "Stories public access v1" ON stories;
DROP POLICY IF EXISTS "Stories public access v2" ON stories;

-- Create simplified policies for story submission
CREATE POLICY "Stories read access"
  ON stories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Stories submit access"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    metadata IS NOT NULL AND
    metadata ? 'teller_name' AND
    metadata ? 'teller_mobile' AND
    metadata ? 'teller_email'
  );

-- Make sure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Set default values for required fields
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'folk_tales',
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN story_type SET DEFAULT 'real',
  ALTER COLUMN format SET DEFAULT 'written';

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;