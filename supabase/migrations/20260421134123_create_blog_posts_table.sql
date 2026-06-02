/*
  # Create Blog Posts Table

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, not null) - Post title
      - `content` (text, not null) - Post body content
      - `excerpt` (text) - Short summary
      - `image_url` (text) - Cover image URL
      - `category` (text, not null) - Category name string
      - `category_id` (uuid) - FK to categories table
      - `author` (text, not null) - Author name
      - `status` (text, draft/published) - Publication status
      - `user_id` (uuid) - FK to auth.users
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `blog_posts` table
    - Public can read published posts
    - Authenticated users can manage all posts

  3. Sample Data
    - 3 sample blog posts about heritage documentation
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  category text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

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
