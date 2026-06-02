-- Create pioneers table if it doesn't exist
CREATE TABLE IF NOT EXISTS pioneers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  image_url text,
  years text NOT NULL,
  bio text NOT NULL,
  achievements jsonb DEFAULT '[]'::jsonb,
  books jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE pioneers ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ BEGIN
  -- Create policy for public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pioneers' 
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON pioneers
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Create policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pioneers' 
    AND policyname = 'Authenticated users can manage pioneers'
  ) THEN
    CREATE POLICY "Authenticated users can manage pioneers"
      ON pioneers
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger with existence check
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
    WHERE tgname = 'update_pioneers_updated_at'
  ) THEN
    CREATE TRIGGER update_pioneers_updated_at
      BEFORE UPDATE ON pioneers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;