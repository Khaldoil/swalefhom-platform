-- Drop existing policies temporarily
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;

-- Ensure story_type column exists with proper constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS valid_story_type;
ALTER TABLE stories DROP COLUMN IF EXISTS story_type;
ALTER TABLE stories ADD COLUMN story_type text NOT NULL DEFAULT 'real';
ALTER TABLE stories ADD CONSTRAINT valid_story_type CHECK (story_type IN ('real', 'fiction'));

-- Create new policies with proper permissions
CREATE POLICY "Public read access"
  ON stories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public submit access"
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

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;