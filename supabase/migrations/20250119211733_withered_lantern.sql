-- Drop existing policies
DROP POLICY IF EXISTS "Public can read published stories" ON stories;
DROP POLICY IF EXISTS "Public can submit stories" ON stories;
DROP POLICY IF EXISTS "Admins can manage all stories" ON stories;

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
    user_id IS NULL
  );

CREATE POLICY "Authenticated users can manage all stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);