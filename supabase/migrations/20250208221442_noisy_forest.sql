-- Drop existing format constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS valid_format;

-- Add format column with proper constraint
ALTER TABLE stories DROP COLUMN IF EXISTS format;
ALTER TABLE stories ADD COLUMN format text DEFAULT 'written';
ALTER TABLE stories ADD CONSTRAINT valid_format CHECK (format IN ('written', 'audio', 'video'));

-- Update existing stories to have written format
UPDATE stories SET format = 'written' WHERE format IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Stories public access" ON stories;

-- Create proper policies
CREATE POLICY "Stories public access"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;