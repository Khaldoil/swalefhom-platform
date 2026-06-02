-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access" ON blog_posts;
  DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  category text NOT NULL,
  author text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "blog_posts_read_published_v1"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "blog_posts_manage_authenticated_v1"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_blog_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Insert some sample blog posts
INSERT INTO blog_posts (title, content, excerpt, category, author, status)
VALUES 
(
  'التراث الشفهي: أهميته وطرق توثيقه',
  'يعد التراث الشفهي جزءاً أساسياً من هويتنا الثقافية. في هذا المقال، نستكشف أهمية توثيق القصص والحكايات التي تناقلتها الأجيال عبر السنين، ونقدم منهجية علمية لتوثيق هذا التراث الثمين.

  أولاً: أهمية التراث الشفهي
  يمثل التراث الشفهي ذاكرة المجتمع الحية، فهو يحمل في طياته تجارب الأجيال السابقة وحكمتهم وتجاربهم. من خلال هذا التراث، نستطيع فهم كيف عاش أجدادنا، وكيف تعاملوا مع تحديات حياتهم، وما هي القيم والمبادئ التي حكمت مجتمعاتهم.

  ثانياً: طرق التوثيق العلمي
  1. التسجيل الصوتي والمرئي
  2. التدوين الكتابي الدقيق
  3. توثيق السياق الاجتماعي والتاريخي
  4. حفظ المعلومات عن الراوي ومصادره

  ثالثاً: تحديات التوثيق
  يواجه توثيق التراث الشفهي عدة تحديات، منها:
  - صعوبة الوصول إلى الرواة
  - اختلاف الروايات وتعددها
  - الحاجة إلى التحقق من صحة المعلومات
  - الحفاظ على أصالة القصص مع نقلها للأجيال الجديدة

  رابعاً: التوصيات والحلول
  1. إنشاء قاعدة بيانات رقمية للتراث الشفهي
  2. تدريب فرق متخصصة في التوثيق
  3. التعاون مع المؤسسات الأكاديمية والثقافية
  4. إشراك المجتمع في عملية التوثيق',
  'نظرة عميقة في أهمية التراث الشفهي وأفضل الممارسات لتوثيقه',
  'heritage',
  'د. سعد الصويان',
  'published'
),
(
  'حكايات من الماضي: قصص الرحالة والتجار',
  'في هذا المقال، نستعرض مجموعة من القصص المشوقة التي رواها التجار والرحالة عن رحلاتهم عبر طرق التجارة القديمة في الجزيرة العربية.

  رحلة القوافل
  كانت القوافل التجارية تمثل شريان الحياة الاقتصادية في الجزيرة العربية. يروي لنا التجار القدامى كيف كانوا يستعدون لرحلاتهم الطويلة، وكيف كانوا يتعاملون مع تحديات الطريق.

  الأسواق القديمة
  كانت الأسواق قديماً أكثر من مجرد أماكن للبيع والشراء. كانت ملتقى للثقافات والحضارات، حيث يتبادل الناس القصص والأخبار مع البضائع.

  العلاقات الاجتماعية
  من خلال هذه الرحلات، تشكلت علاقات اجتماعية قوية بين سكان المدن المختلفة. كان التجار يحملون معهم ليس فقط البضائع، بل أيضاً الثقافات والعادات والتقاليد.',
  'قصص مثيرة من ذكريات التجار والرحالة في الجزيرة العربية',
  'stories',
  'محمد القويعي',
  'published'
),
(
  'مقابلة خاصة: مع حافظ التراث',
  'حوار شيق مع أحد أبرز حفاظ التراث في المملكة، يروي فيه تجربته في جمع وتوثيق القصص والحكايات الشعبية.

  بداية الرحلة
  بدأت رحلتي مع التراث منذ أكثر من أربعين عاماً. كنت أجلس مع كبار السن في المجالس، أستمع إلى حكاياتهم وقصصهم. كل قصة كانت تفتح لي نافذة جديدة على الماضي.

  منهجية التوثيق
  تعلمت مع الوقت أن التوثيق يحتاج إلى صبر ومنهجية. كنت أسجل كل شيء: القصة، واللهجة، والمصطلحات القديمة، وحتى تعابير الوجه وحركات اليدين.

  أهم الدروس المستفادة
  1. أهمية الاستماع بإنصات وتقدير
  2. توثيق السياق الاجتماعي للقصص
  3. الحفاظ على أصالة الرواية
  4. بناء الثقة مع الرواة

  نصائح للجيل الجديد
  أنصح الشباب المهتمين بالتراث أن يبدأوا من عائلاتهم. كل بيت فيه قصة تستحق التوثيق، وكل جد وجدة هما كنز من المعرفة والحكمة.',
  'حوار خاص مع أحد رواد حفظ التراث في المملكة',
  'interviews',
  'عبدالله السليم',
  'published'
);