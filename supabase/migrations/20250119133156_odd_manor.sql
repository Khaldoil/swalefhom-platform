/*
  # Gallery Items Schema Update

  1. New Tables
    - `gallery_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `media_url` (text)
      - `media_type` (text, check constraint: 'image' or 'video')
      - `status` (text, check constraint: 'draft' or 'published')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `gallery_items` table
    - Add policy for public to view published items
    - Add policy for authenticated users to manage items
*/

-- Create gallery_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  -- Public read access to published items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_items' 
    AND policyname = 'Public can view published gallery items'
  ) THEN
    CREATE POLICY "Public can view published gallery items"
      ON gallery_items
      FOR SELECT
      USING (status = 'published');
  END IF;

  -- Authenticated users can manage gallery items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_items' 
    AND policyname = 'Authenticated users can manage gallery items'
  ) THEN
    CREATE POLICY "Authenticated users can manage gallery items"
      ON gallery_items
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_gallery_items_updated_at'
  ) THEN
    CREATE TRIGGER update_gallery_items_updated_at
      BEFORE UPDATE ON gallery_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;