-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON storytellers;
DROP POLICY IF EXISTS "Public insert access" ON storytellers;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON storytellers;
DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON storytellers;

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

-- Create policies for storytellers
CREATE POLICY "Public read access"
  ON storytellers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access"
  ON storytellers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own profile"
  ON storytellers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own profile"
  ON storytellers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for stories
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;

-- Create new policies for stories
CREATE POLICY "Anyone can read published stories"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Storytellers can read their own stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Storytellers can create stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Storytellers can update their own stories"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Storytellers can delete their own stories"
  ON stories
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add updated_at trigger
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

-- Create trigger to update stories count
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