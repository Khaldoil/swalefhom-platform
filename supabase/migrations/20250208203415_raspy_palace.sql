-- First drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Public update access" ON stories;
DROP POLICY IF EXISTS "Public delete access" ON stories;
DROP POLICY IF EXISTS "Public access" ON stories;
DROP POLICY IF EXISTS "Full public access v2" ON stories;

-- Create a new policy for public read access
CREATE POLICY "Stories public read v1"
  ON stories
  FOR SELECT
  TO public
  USING (true);

-- Create a new policy for public write access
CREATE POLICY "Stories public write v1"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Insert some test stories if none exist
INSERT INTO stories (title, content, region, date, category, status)
SELECT 
  'قصة من الماضي الجميل',
  'في خمسينيات القرن الماضي، كان الناس يجتمعون في المقيل لتبادل القصص والحكايات...',
  'riyadh',
  '1950',
  'daily',
  'published'
WHERE NOT EXISTS (SELECT 1 FROM stories LIMIT 1);