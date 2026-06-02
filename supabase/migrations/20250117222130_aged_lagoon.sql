/*
  # Create Storage Bucket for Stories

  1. New Storage Bucket
    - Creates a new public bucket called 'stories' for storing story images
  2. Security
    - Enables public access for reading images
    - Restricts upload/delete operations to authenticated users only
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Authenticated users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'stories' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Authenticated users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'stories' AND auth.uid() = owner);