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

-- Ensure the format column accepts audio files
ALTER TABLE stories DROP CONSTRAINT IF EXISTS valid_format;
ALTER TABLE stories ADD CONSTRAINT valid_format CHECK (format IN ('written', 'audio', 'video'));

-- Update any existing voice format entries to audio
UPDATE stories SET format = 'audio' WHERE format = 'voice';

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Stories public access" ON stories;

CREATE POLICY "Stories public access"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;