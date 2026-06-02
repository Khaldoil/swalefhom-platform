-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;

-- Create simplified policies
CREATE POLICY "Public read access"
  ON stories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin full access"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Make sure user_id is nullable
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;