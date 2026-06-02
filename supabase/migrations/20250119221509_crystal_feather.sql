-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;

-- Create new policies with proper public access
CREATE POLICY "Anyone can read published stories"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Anyone can submit stories"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage all stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;