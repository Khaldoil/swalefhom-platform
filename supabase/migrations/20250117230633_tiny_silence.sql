/*
  # Configure storage for media uploads
  
  1. Updates
    - Configure storage bucket for media files
    - Set file size limits and allowed MIME types
    - Add appropriate security policies
  
  2. Security
    - Enable public read access
    - Restrict uploads to authenticated users
    - Add file size and type validation
*/

-- Ensure the bucket exists with proper configuration
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'stories'
  ) THEN
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
    );
  ELSE
    UPDATE storage.buckets
    SET 
      file_size_limit = 20971520,
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
  END IF;
END $$;

-- Create storage policies
DO $$ 
BEGIN
  -- Public read access policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'stories');
  END IF;

  -- Upload policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Authenticated users can upload media'
  ) THEN
    CREATE POLICY "Authenticated users can upload media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'stories');
  END IF;

  -- Update policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Authenticated users can update their own media'
  ) THEN
    CREATE POLICY "Authenticated users can update their own media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'stories' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'stories');
  END IF;

  -- Delete policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Authenticated users can delete their own media'
  ) THEN
    CREATE POLICY "Authenticated users can delete their own media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'stories' AND auth.uid() = owner);
  END IF;
END $$;