-- Drop all existing policies first
DO $$ BEGIN
  -- Drop storytellers policies
  DROP POLICY IF EXISTS "Public read access" ON storytellers;
  DROP POLICY IF EXISTS "Public insert access" ON storytellers;
  DROP POLICY IF EXISTS "Authenticated users can update own profile" ON storytellers;
  DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON storytellers;
  DROP POLICY IF EXISTS "Public access" ON storytellers;

  -- Drop stories policies
  DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
  DROP POLICY IF EXISTS "Storytellers can read their own stories" ON stories;
  DROP POLICY IF EXISTS "Storytellers can create stories" ON stories;
  DROP POLICY IF EXISTS "Storytellers can update their own stories" ON stories;
  DROP POLICY IF EXISTS "Storytellers can delete their own stories" ON stories;
  DROP POLICY IF EXISTS "Public access" ON stories;
END $$;

-- Create new simplified policies with existence checks
DO $$ BEGIN
  -- Create storytellers policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storytellers' 
    AND policyname = 'Public access'
  ) THEN
    CREATE POLICY "Public access"
      ON storytellers
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Create stories policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stories' 
    AND policyname = 'Public access'
  ) THEN
    CREATE POLICY "Public access"
      ON stories
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Make sure user_id is nullable for public submissions
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Make sure required fields have defaults
ALTER TABLE stories 
  ALTER COLUMN region SET DEFAULT 'riyadh',
  ALTER COLUMN date SET DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  ALTER COLUMN category SET DEFAULT 'daily',
  ALTER COLUMN status SET DEFAULT 'draft';

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;