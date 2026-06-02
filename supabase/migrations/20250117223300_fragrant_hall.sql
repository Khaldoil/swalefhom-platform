/*
  # Set up storage bucket and policies

  1. Storage Setup
    - Create 'stories' bucket for storing images
    - Enable public access for viewing images
    - Set up policies for:
      - Public read access
      - Authenticated users upload/update/delete

  2. Security
    - Check for existing policies before creating new ones
    - Ensure idempotent operations
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies with existence checks
DO $$ 
BEGIN
  -- Public Access Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'stories');
  END IF;

  -- Upload Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'stories');
  END IF;

  -- Update Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can update their own images'
  ) THEN
    CREATE POLICY "Authenticated users can update their own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'stories' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'stories');
  END IF;

  -- Delete Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can delete their own images'
  ) THEN
    CREATE POLICY "Authenticated users can delete their own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'stories' AND auth.uid() = owner);
  END IF;
END $$;