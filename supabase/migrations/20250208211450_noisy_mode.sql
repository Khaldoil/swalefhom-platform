-- First ensure policies are correct
DROP POLICY IF EXISTS "Stories read published" ON stories;
DROP POLICY IF EXISTS "Stories submit" ON stories;
DROP POLICY IF EXISTS "Stories admin access" ON stories;

-- Recreate policies
CREATE POLICY "Stories read published"
  ON stories
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Stories submit"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'draft' AND
    metadata IS NOT NULL AND
    metadata ? 'teller_name' AND
    metadata ? 'teller_mobile' AND
    metadata ? 'teller_email'
  );

CREATE POLICY "Stories admin access"
  ON stories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Update existing stories to be published
UPDATE stories 
SET status = 'published' 
WHERE status != 'published';

-- Insert a new test story if none exist
INSERT INTO stories (
  title,
  content,
  excerpt,
  region,
  date,
  category,
  status,
  story_type,
  metadata
)
SELECT
  'حكايات من الماضي الجميل',
  'في زمن مضى، كانت الحياة بسيطة وجميلة. كان الناس يجتمعون في المساء لتبادل القصص والحكايات. وفي إحدى الليالي، حكى لنا جدي قصة عن كيف كانت الحياة في القرية قديماً.',
  'قصة تروي ذكريات الحياة البسيطة في الماضي',
  'riyadh',
  '1955',
  'social',
  'published',
  'real',
  '{"teller_name": "سعد محمد", "teller_mobile": "0512345678", "teller_email": "test@example.com", "teller_age": "40", "teller_city": "الرياض", "story_source": "الجد", "source_age": "85"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM stories 
  WHERE status = 'published'
  LIMIT 1
);