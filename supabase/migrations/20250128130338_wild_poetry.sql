-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Create storage policies with public access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'stories')
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'stories');

-- Drop existing gallery policies
DROP POLICY IF EXISTS "Public read access" ON gallery_items;
DROP POLICY IF EXISTS "Public insert access" ON gallery_items;
DROP POLICY IF EXISTS "Public update access" ON gallery_items;
DROP POLICY IF EXISTS "Public delete access" ON gallery_items;

-- Create simplified gallery policies
CREATE POLICY "Public access"
  ON gallery_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Make sure user_id is nullable
ALTER TABLE gallery_items ALTER COLUMN user_id DROP NOT NULL;

-- Set default values
ALTER TABLE gallery_items 
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN copyright SET DEFAULT '© سواليفهم - جميع الحقوق محفوظة';

-- Ensure RLS is enabled
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;