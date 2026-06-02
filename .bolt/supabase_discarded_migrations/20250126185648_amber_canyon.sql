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

-- Ensure RLS is enabled
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- Delete existing term if it exists to avoid duplicates
DELETE FROM glossary_terms WHERE word = 'حذفة عصا';

-- Insert the term again
INSERT INTO glossary_terms (word, definition, category, example)
VALUES (
  'حذفة عصا',
  'كناية عن قرب المسافة',
  'daily',
  'كأن تقول له عسى ماهو بعيد المكان الفلاني؟ فالرد يكون قريب حذفة عصا.'
);