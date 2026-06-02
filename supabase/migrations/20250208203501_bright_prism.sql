-- First drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can manage all stories" ON stories;
DROP POLICY IF EXISTS "Public read access" ON stories;
DROP POLICY IF EXISTS "Public submit access" ON stories;
DROP POLICY IF EXISTS "Public update access" ON stories;
DROP POLICY IF EXISTS "Public delete access" ON stories;
DROP POLICY IF EXISTS "Public access" ON stories;
DROP POLICY IF EXISTS "Full public access v2" ON stories;
DROP POLICY IF EXISTS "Stories public read v1" ON stories;
DROP POLICY IF EXISTS "Stories public write v1" ON stories;

-- Create a single, simple policy for full public access
CREATE POLICY "Stories full access"
  ON stories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Insert test stories
INSERT INTO stories (
  title,
  content,
  excerpt,
  region,
  date,
  category,
  status,
  story_type
) VALUES 
(
  'ذكريات من سوق القيصرية',
  'في خمسينيات القرن الماضي، كان سوق القيصرية في الأحساء مركزاً تجارياً مهماً. كان التجار يعرضون بضائعهم بفخر، من الأقمشة الفاخرة إلى التوابل النادرة. وكان الناس يتبادلون الأخبار والقصص في المقاهي المحيطة بالسوق.',
  'قصة تروي ذكريات سوق القيصرية في الأحساء وأهميته كمركز تجاري واجتماعي',
  'eastern',
  '1950',
  'trade',
  'published',
  'real'
),
(
  'حكايات المقيل',
  'كان المقيل في الماضي أكثر من مجرد استراحة. كان مجلساً يجتمع فيه كبار السن لتبادل الحكايات والخبرات. وفي أحد الأيام، حكى لنا جدي عن رحلات القوافل التجارية وكيف كانت تشق طريقها عبر الصحراء.',
  'ذكريات عن مجالس المقيل وما كان يدور فيها من حكايات وقصص',
  'riyadh',
  '1960',
  'social',
  'published',
  'real'
),
(
  'موسم الحصاد',
  'في مواسم الحصاد، كان أهل القرية يجتمعون كعائلة واحدة. النساء يحضرن الطعام، والرجال يعملون في الحقول، والأطفال يساعدون في حمل المحصول. كانت تلك الأيام مليئة بالتعاون والفرح رغم صعوبة العمل.',
  'قصة تصور حياة المزارعين وتقاليد موسم الحصاد في الماضي',
  'qassim',
  '1955',
  'agriculture',
  'published',
  'real'
);