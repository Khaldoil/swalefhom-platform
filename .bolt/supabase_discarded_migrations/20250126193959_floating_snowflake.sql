-- Create glossary_terms table if it doesn't exist
CREATE TABLE IF NOT EXISTS glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  definition text NOT NULL,
  category text NOT NULL,
  example text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access" ON glossary_terms;
DROP POLICY IF EXISTS "Authenticated users can manage glossary" ON glossary_terms;

-- Create comprehensive policies
CREATE POLICY "Public read access"
  ON glossary_terms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage glossary"
  ON glossary_terms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Delete existing term if it exists to avoid duplicates
DELETE FROM glossary_terms WHERE word = 'حذفة عصا';

-- Insert the term
INSERT INTO glossary_terms (word, definition, category, example)
VALUES (
  'حذفة عصا',
  'كناية عن قرب المسافة',
  'daily',
  'كأن تقول له عسى ماهو بعيد المكان الفلاني؟ فالرد يكون قريب حذفة عصا.'
);