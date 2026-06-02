-- Drop all existing policies first
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access" ON storytellers;
  DROP POLICY IF EXISTS "Public insert access" ON storytellers;
  DROP POLICY IF EXISTS "Authenticated users can update own profile" ON storytellers;
  DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON storytellers;
  DROP POLICY IF EXISTS "Public access" ON storytellers;
END $$;

-- Recreate storytellers table with proper structure
CREATE TABLE IF NOT EXISTS storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  stories_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ BEGIN
  -- Public read access policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storytellers' 
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON storytellers
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Public insert access policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storytellers' 
    AND policyname = 'Public insert access'
  ) THEN
    CREATE POLICY "Public insert access"
      ON storytellers
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  -- Update profile policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storytellers' 
    AND policyname = 'Authenticated users can update own profile'
  ) THEN
    CREATE POLICY "Authenticated users can update own profile"
      ON storytellers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Delete profile policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storytellers' 
    AND policyname = 'Authenticated users can delete own profile'
  ) THEN
    CREATE POLICY "Authenticated users can delete own profile"
      ON storytellers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger with existence check
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_storytellers_updated_at'
  ) THEN
    CREATE TRIGGER update_storytellers_updated_at
      BEFORE UPDATE ON storytellers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Create function to update stories count
CREATE OR REPLACE FUNCTION update_storyteller_stories_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE storytellers
    SET stories_count = stories_count + 1
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storytellers
    SET stories_count = stories_count - 1
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stories count with existence check
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_stories_count'
  ) THEN
    CREATE TRIGGER update_stories_count
      AFTER INSERT OR DELETE ON stories
      FOR EACH ROW
      EXECUTE FUNCTION update_storyteller_stories_count();
  END IF;
END $$;