-- Create media table for storing multiple files per story
CREATE TABLE IF NOT EXISTS story_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS on story_media
ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;

-- Create policies for story_media
CREATE POLICY "Public read access"
  ON story_media
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public submit access"
  ON story_media
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated full access"
  ON story_media
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update storage bucket configuration for multiple files
UPDATE storage.buckets
SET file_size_limit = 20971520, -- 20MB
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ]::text[]
WHERE id = 'stories';