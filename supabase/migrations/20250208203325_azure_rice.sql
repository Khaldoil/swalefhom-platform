-- First drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Public update access" ON stories;
DROP POLICY IF EXISTS "Public delete access" ON stories;
DROP POLICY IF EXISTS "Public access" ON stories;

-- Create a single, simple policy with a unique name
CREATE POLICY "Full public access v2"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled but with full public access
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;