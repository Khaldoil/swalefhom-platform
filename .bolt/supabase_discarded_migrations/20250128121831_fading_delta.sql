-- Create storytellers table if it doesn't exist
CREATE TABLE IF NOT EXISTS storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text,
  bio text,
  region text,
  phone text,
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