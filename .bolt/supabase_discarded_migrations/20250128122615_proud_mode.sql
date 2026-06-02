-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;

-- Recreate stories table with all required columns
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  region text NOT NULL DEFAULT 'riyadh',
  date text NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  category text NOT NULL DEFAULT 'daily',
  story_type text NOT NULL DEFAULT 'real',
  image_url text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_story_type CHECK (story_type IN ('real', 'fiction')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'rejected')),
  CONSTRAINT valid_category CHECK (category IN ('daily', 'trade', 'agriculture', 'social'))
);

-- Make sure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Create new policies with proper permissions
DO $$ BEGIN
  -- Create policy for public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stories' 
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON stories
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Create policy for public submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stories' 
    AND policyname = 'Public submit access'
  ) THEN
    CREATE POLICY "Public submit access"
      ON stories
      FOR INSERT
      TO public
      WITH CHECK (
        status = 'draft' AND
        metadata IS NOT NULL AND
        metadata ? 'teller_name' AND
        metadata ? 'teller_mobile' AND
        metadata ? 'teller_email'
      );
  END IF;
END $$;

-- Add updated_at function and trigger with existence checks
DO $$ BEGIN
  -- Create or replace the function
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_stories_updated_at'
  ) THEN
    CREATE TRIGGER update_stories_updated_at
      BEFORE UPDATE ON stories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;