-- Update storage bucket configuration to properly handle audio files
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg'
]::text[]
WHERE id = 'stories';

-- Update gallery_items table to support audio files
ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS gallery_items_media_type_check;
ALTER TABLE gallery_items ADD CONSTRAINT gallery_items_media_type_check 
  CHECK (media_type IN ('image', 'video', 'audio'));

-- Drop existing policies
DROP POLICY IF EXISTS "Public access" ON gallery_items;

-- Create simplified policy for gallery items
CREATE POLICY "Gallery items public access"
  ON gallery_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;