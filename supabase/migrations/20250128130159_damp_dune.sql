-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can manage gallery items" ON gallery_items;

-- Create new policies with proper permissions
CREATE POLICY "Public read access"
  ON gallery_items
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Public insert access"
  ON gallery_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON gallery_items
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access"
  ON gallery_items
  FOR DELETE
  TO public
  USING (true);

-- Make sure user_id is nullable for public submissions
ALTER TABLE gallery_items ALTER COLUMN user_id DROP NOT NULL;

-- Set default values
ALTER TABLE gallery_items 
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN copyright SET DEFAULT '© سواليفهم - جميع الحقوق محفوظة';

-- Ensure RLS is enabled
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;