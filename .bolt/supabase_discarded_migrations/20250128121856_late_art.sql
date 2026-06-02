-- Drop existing storytellers table if it exists
DROP TABLE IF EXISTS storytellers CASCADE;

-- Create storytellers table with proper structure
CREATE TABLE storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text,
  email text UNIQUE NOT NULL,
  phone text,
  region text,
  bio text,
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

  -- User management policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storytellers' 
    AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile"
      ON storytellers
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add updated_at trigger with existence check
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