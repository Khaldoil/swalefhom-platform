-- Drop existing policies
DROP POLICY IF EXISTS "Public can read published stories" ON stories;
DROP POLICY IF EXISTS "Public can submit stories" ON stories;
DROP POLICY IF EXISTS "Admins can manage all stories" ON stories;

-- Create comprehensive RLS policies for stories table
CREATE POLICY "Public can read published stories"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Public can submit stories"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'draft' AND
    metadata IS NOT NULL AND
    metadata ? 'teller_name' AND
    metadata ? 'teller_mobile' AND
    metadata ? 'teller_email'
  );

CREATE POLICY "Admins can manage all stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;