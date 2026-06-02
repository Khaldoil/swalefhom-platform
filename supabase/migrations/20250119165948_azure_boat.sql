-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Users can read all published stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can CRUD their own stories" ON stories;

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
    user_id IS NULL AND
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