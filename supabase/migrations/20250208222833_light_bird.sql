-- Drop ALL existing policies first
DO $$ 
BEGIN
  -- Drop all policies from stories table
  DROP POLICY IF EXISTS "Public access" ON stories;
  DROP POLICY IF EXISTS "Stories read published" ON stories;
  DROP POLICY IF EXISTS "Stories submit" ON stories;
  DROP POLICY IF EXISTS "Stories admin access" ON stories;
  DROP POLICY IF EXISTS "Stories public access" ON stories;
  DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
  DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
  DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;
  DROP POLICY IF EXISTS "Public read access" ON stories;
  DROP POLICY IF EXISTS "Public submit access" ON stories;
  DROP POLICY IF EXISTS "Public update access" ON stories;
  DROP POLICY IF EXISTS "Public delete access" ON stories;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create a new policy with a unique name
CREATE POLICY "Stories access v1"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Delete existing test stories to avoid duplicates
DELETE FROM stories;

-- Insert test stories
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
) VALUES 
(
  'ذكريات من سوق القيصرية',
  'في خمسينيات القرن الماضي، كان سوق القيصرية في الأحساء مركزاً تجارياً مهماً. كان التجار يعرضون بضائعهم بفخر، من الأقمشة الفاخرة إلى التوابل النادرة. وكان الناس يتبادلون الأخبار والقصص في المقاهي المحيطة بالسوق.',
  'قصة تروي ذكريات سوق القيصرية في الأحساء وأهميته كمركز تجاري واجتماعي',
  'eastern',
  '1950',
  'trade',
  'draft',
  'real',
  '{"teller_name": "محمد عبدالله", "teller_mobile": "0512345678", "teller_email": "test@example.com", "teller_age": "35", "teller_city": "الأحساء", "story_source": "الجد", "source_age": "85"}'::jsonb
);

-- Update story status to published
UPDATE stories SET status = 'published';