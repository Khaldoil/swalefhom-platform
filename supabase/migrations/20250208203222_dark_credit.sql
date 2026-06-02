-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;

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

CREATE POLICY "Public update access"
  ON stories
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access"
  ON stories
  FOR DELETE
  TO public
  USING (true);

-- Make sure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;