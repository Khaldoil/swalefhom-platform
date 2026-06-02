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
  WITH CHECK (
    -- Allow public submissions without requiring user_id
    user_id IS NULL AND
    -- Ensure required fields are present
    title IS NOT NULL AND
    content IS NOT NULL AND
    region IS NOT NULL AND
    date IS NOT NULL AND
    category IS NOT NULL AND
    status = 'draft'
  );

CREATE POLICY "Authenticated users can manage all stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;