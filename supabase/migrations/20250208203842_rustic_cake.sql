-- First drop ALL existing policies
DROP POLICY IF EXISTS "Stories public access v2" ON stories;

-- Create proper policies for stories
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
  'في خمسينيات القرن الماضي، كان سوق القيصرية في الأحساء مركزاً تجارياً مهماً. كان التجار يعرضون بضائعهم بفخر، من الأقمشة الفاخرة إلى التوابل النادرة. وكان الناس يتبادلون الأخبار والقصص في المقاهي المحيطة بالسوق. حدثني جدي قائلاً: كنا نذهب إلى السوق باكراً، حيث رائحة البخور والعود تملأ المكان. كان التجار يتنافسون في عرض أجود البضائع، وكانت المساومة فناً يتقنه الجميع.',
  'قصة تروي ذكريات سوق القيصرية في الأحساء وأهميته كمركز تجاري واجتماعي',
  'eastern',
  '1950',
  'trade',
  'published',
  'real',
  '{"teller_name": "محمد عبدالله", "teller_mobile": "0512345678", "teller_email": "test@example.com", "teller_age": "35", "teller_city": "الأحساء", "story_source": "الجد", "source_age": "85"}'::jsonb
),
(
  'حكايات المقيل',
  'كان المقيل في الماضي أكثر من مجرد استراحة. كان مجلساً يجتمع فيه كبار السن لتبادل الحكايات والخبرات. وفي أحد الأيام، حكى لنا جدي عن رحلات القوافل التجارية وكيف كانت تشق طريقها عبر الصحراء. كان يصف لنا كيف كانوا يهتدون بالنجوم ليلاً، ويتحدث عن الصداقات التي تشكلت في تلك الرحلات الطويلة.',
  'ذكريات عن مجالس المقيل وما كان يدور فيها من حكايات وقصص',
  'riyadh',
  '1960',
  'social',
  'published',
  'real',
  '{"teller_name": "أحمد محمد", "teller_mobile": "0523456789", "teller_email": "test2@example.com", "teller_age": "40", "teller_city": "الرياض", "story_source": "الوالد", "source_age": "75"}'::jsonb
),
(
  'موسم الحصاد',
  'في مواسم الحصاد، كان أهل القرية يجتمعون كعائلة واحدة. النساء يحضرن الطعام، والرجال يعملون في الحقول، والأطفال يساعدون في حمل المحصول. كانت تلك الأيام مليئة بالتعاون والفرح رغم صعوبة العمل. كانت الأغاني الشعبية تصدح في الحقول، والجميع يعمل بتناغم تام. وفي المساء، كان الجميع يجتمع لتناول وجبة مشتركة احتفالاً بنهاية يوم حافل.',
  'قصة تصور حياة المزارعين وتقاليد موسم الحصاد في الماضي',
  'qassim',
  '1955',
  'agriculture',
  'published',
  'real',
  '{"teller_name": "عبدالرحمن سعد", "teller_mobile": "0534567890", "teller_email": "test3@example.com", "teller_age": "45", "teller_city": "بريدة", "story_source": "الجدة", "source_age": "80"}'::jsonb
);