-- Drop all existing policies
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public insert access" ON stories;
DROP POLICY IF EXISTS "Admin full access" ON stories;

-- Create a single policy for public access
CREATE POLICY "Public access"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Make sure user_id is nullable
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Make sure required fields have defaults
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'daily',
  ALTER COLUMN status SET DEFAULT 'draft';