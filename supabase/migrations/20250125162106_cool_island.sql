-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Public update access" ON stories;
DROP POLICY IF EXISTS "Public delete access" ON stories;

-- Create new policies
CREATE POLICY "Anyone can read published stories"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Anyone can submit stories"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'draft' AND
    title IS NOT NULL AND
    content IS NOT NULL AND
    region IS NOT NULL AND
    date IS NOT NULL AND
    category IS NOT NULL AND
    metadata IS NOT NULL AND
    metadata ? 'teller_name' AND
    metadata ? 'teller_mobile' AND
    metadata ? 'teller_email'
  );

CREATE POLICY "Anyone can update their submitted stories"
  ON stories
  FOR UPDATE
  TO public
  USING (
    status = 'draft' AND
    metadata->>'teller_email' = current_setting('request.jwt.claims')::json->>'email'
  )
  WITH CHECK (
    status = 'draft'
  );

-- Make sure user_id is nullable
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;