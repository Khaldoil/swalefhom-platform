-- Ensure stories table exists with correct structure
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  region text NOT NULL DEFAULT 'riyadh',
  date text NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  category text NOT NULL DEFAULT 'daily',
  image_url text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Make user_id nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Drop existing stories policies
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Public update access" ON stories;
DROP POLICY IF EXISTS "Public delete access" ON stories;
DROP POLICY IF EXISTS "Authenticated full access" ON stories;

-- Create storage bucket with configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  20971520, -- 20MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'stories')
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'stories');

-- Create stories policies
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
    user_id IS NULL
  );

CREATE POLICY "Authenticated full access"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;