-- Create ambassador_applications table
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  age integer NOT NULL CHECK (age >= 18),
  city text NOT NULL,
  education text NOT NULL,
  experience text NOT NULL,
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

-- Add updated_at trigger
CREATE TRIGGER update_ambassador_applications_updated_at
  BEFORE UPDATE ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();