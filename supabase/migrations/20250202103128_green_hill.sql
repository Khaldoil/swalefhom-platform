-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_ambassador_applications_updated_at ON ambassador_applications;

-- Drop existing policies
DROP POLICY IF EXISTS "Public insert access" ON ambassador_applications;
DROP POLICY IF EXISTS "Public read own application" ON ambassador_applications;
DROP POLICY IF EXISTS "Authenticated users can manage all applications" ON ambassador_applications;

-- Create ambassador_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  age integer NOT NULL CHECK (age >= 18),
  city text NOT NULL,
  education text NOT NULL,
  motivation text NOT NULL,
  contribution text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public insert access"
  ON ambassador_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public read own application"
  ON ambassador_applications
  FOR SELECT
  TO public
  USING (email = current_setting('request.jwt.claims')::json->>'email');

CREATE POLICY "Authenticated users can manage all applications"
  ON ambassador_applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_ambassador_applications_updated_at'
  ) THEN
    CREATE TRIGGER update_ambassador_applications_updated_at
      BEFORE UPDATE ON ambassador_applications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;