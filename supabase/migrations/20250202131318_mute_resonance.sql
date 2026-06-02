-- Drop existing triggers and policies
DROP TRIGGER IF EXISTS update_ambassador_applications_updated_at ON ambassador_applications;
DROP TRIGGER IF EXISTS on_new_ambassador_application ON ambassador_applications;
DROP POLICY IF EXISTS "Public access" ON ambassador_applications;

-- Recreate table with proper structure and no age restriction
DROP TABLE IF EXISTS ambassador_applications;
CREATE TABLE ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  age text,
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

-- Create simplified policies
CREATE POLICY "Public access"
  ON ambassador_applications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_ambassador_applications_updated_at
  BEFORE UPDATE ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();