-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Public update access" ON stories;
DROP POLICY IF EXISTS "Public delete access" ON stories;

-- Create new policies with proper access control
CREATE POLICY "Public read access"
ON stories FOR SELECT
TO public
USING (true);

CREATE POLICY "Public submit access"
ON stories FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public update access"
ON stories FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete access"
ON stories FOR DELETE
TO public
USING (true);

-- Make sure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Set default values for required fields
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'daily',
  ALTER COLUMN status SET DEFAULT 'draft';

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;