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

-- Create policies
CREATE POLICY "Public read access"
  ON glossary_terms
  FOR SELECT
  TO public
  USING (true);

-- Insert new glossary term
INSERT INTO glossary_terms (word, definition, category, example)
VALUES (
  'حذفة عصا',
  'كناية عن قرب المسافة',
  'daily',
  'كأن تقول له عسى ماهو بعيد المكان الفلاني؟ فالرد يكون قريب حذفة عصا.'
);