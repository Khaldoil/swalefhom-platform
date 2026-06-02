-- Drop existing policies
DROP POLICY IF EXISTS "Stories read published" ON stories;
DROP POLICY IF EXISTS "Stories submit" ON stories;
DROP POLICY IF EXISTS "Stories admin access" ON stories;

-- Create a single, simple policy for public access
CREATE POLICY "Stories public access"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Make sure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Set default values for required fields
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'daily',
  ALTER COLUMN status SET DEFAULT 'draft';

-- Update existing stories to be published
UPDATE stories SET status = 'published' WHERE status != 'published';