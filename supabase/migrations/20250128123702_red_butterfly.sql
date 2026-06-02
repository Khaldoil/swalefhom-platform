-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON pioneers;
DROP POLICY IF EXISTS "Authenticated users can manage pioneers" ON pioneers;
DROP POLICY IF EXISTS "Public access" ON pioneers;

-- Recreate pioneers table with all required columns
CREATE TABLE IF NOT EXISTS pioneers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  image_url text,
  years text NOT NULL,
  bio text NOT NULL,
  achievements jsonb DEFAULT '[]'::jsonb,
  books jsonb DEFAULT '[]'::jsonb,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE pioneers ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public read access"
  ON pioneers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage pioneers"
  ON pioneers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_pioneers_updated_at'
  ) THEN
    CREATE TRIGGER update_pioneers_updated_at
      BEFORE UPDATE ON pioneers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Create index for faster ordering if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'pioneers_display_order_idx'
  ) THEN
    CREATE INDEX pioneers_display_order_idx ON pioneers(display_order);
  END IF;
END $$;

-- Clear existing data to avoid duplicates
TRUNCATE pioneers;

-- Insert all pioneers data with proper ordering
INSERT INTO pioneers (name, title, image_url, years, bio, achievements, books, display_order)
VALUES
  (
    'عبد الكريم بن عبد العزيز الجهيمان',
    'الأديب والباحث في التراث الشعبي',
    'https://www.arabicmagazine.net/Images/LibVideos/2021102621332185.jpg',
    '1914 - 2011',
    'من أبرز رواد جمع وتوثيق التراث الشعبي في المملكة العربية السعودية. عُرف بجهوده الكبيرة في جمع وتدوين الأساطير والحكايات الشعبية والأمثال والألغاز.',
    '[
      "مؤلف موسوعة \"الأمثال الشعبية في قلب الجزيرة العربية\" في 8 مجلدات",
      "جمع وتوثيق أكثر من 4000 مثل شعبي",
      "مؤلف كتاب \"الأساطير الشعبية\" في جزأين",
      "حاصل على جائزة الدولة التقديرية في الأدب عام 1983"
    ]'::jsonb,
    '[
      "الأمثال الشعبية في قلب الجزيرة العربية",
      "الأساطير الشعبية",
      "من أساطيرنا الشعبية",
      "حكايات وأساطير من الجزيرة العربية"
    ]'::jsonb,
    1
  ),
  (
    'عبد الله بن محمد بن خميس',
    'المؤرخ والأديب وباحث التراث',
    'https://www.alyaum.com/uploads/imported_images/media/files/2011/04/sg14_153880605.jpg',
    '1919 - 2011',
    'مؤرخ وأديب سعودي، يعد من أبرز المؤرخين السعوديين في القرن العشرين. اشتهر بتوثيق تاريخ وتراث المملكة العربية السعودية، وخاصة منطقة نجد.',
    '[
      "عضو مجمع اللغة العربية بالقاهرة",
      "مؤسس مكتبة الجزيرة العربية في الرياض",
      "حاصل على جائزة الدولة التقديرية في الأدب",
      "له أكثر من 130 مؤلفاً في التاريخ والتراث والأدب",
      "رائد في توثيق تاريخ المدن والقرى السعودية"
    ]'::jsonb,
    '[
      "المجمل في تاريخ نجد",
      "معجم اليمامة",
      "من تراث الصحراء",
      "المعجم الجغرافي للبلاد العربية السعودية - منطقة القصيم",
      "عيون الأخبار عن نجد والحجاز واليمن"
    ]'::jsonb,
    2
  ),
  (
    'محمد بن ناصر العبودي',
    'الرحالة والمؤرخ وباحث التراث',
    'https://www.aljazeera.net/wp-content/uploads/2022/07/%D8%A7%D9%84%D8%B9%D8%A8%D9%88%D8%AF%D9%8A-2.jpg?resize=574%2C513&quality=80',
    '1930 - 2022',
    'رحالة ومؤرخ سعودي، يعد من أبرز الرحالة العرب في العصر الحديث. زار أكثر من 150 دولة ووثق رحلاته في مئات الكتب.',
    '[
      "زار أكثر من 150 دولة ووثق رحلاتها",
      "عضو مجمع اللغة العربية بالقاهرة",
      "حاصل على جائزة الملك فيصل العالمية",
      "له أكثر من 400 مؤلف في الرحلات والتراث",
      "رائد في توثيق أحوال المسلمين حول العالم"
    ]'::jsonb,
    '[
      "كلمات عربية لم تسجلها المعاجم",
      "كلمات قضت: معجم بألفاظ اختفت من لغتنا الدارجة أو كادت",
      "الكناية والمجاز في اللغة العامية",
      "الأصول الفصيحة للألفاظ الدارجة",
      "معجم وجه الأرض في المأثور الشعبي"
    ]'::jsonb,
    3
  ),
  (
    'محمد بن عبد العزيز القويعي',
    'الباحث والمؤرخ في التراث السعودي',
    'https://www.alriyadh.com/media/article/2021/02/11/img/9897170774.jpg',
    '1950 - حتى الآن',
    'باحث ومؤرخ سعودي متخصص في التراث والتاريخ السعودي. له إسهامات كبيرة في توثيق التراث الشعبي والتاريخ الاجتماعي للمملكة العربية السعودية.',
    '[
      "مؤسس متحف القويعي للتراث الشعبي",
      "جمع وتوثيق آلاف القطع التراثية والصور التاريخية",
      "مؤلف العديد من الكتب والأبحاث في التراث السعودي",
      "حاصل على العديد من الجوائز في مجال حفظ التراث"
    ]'::jsonb,
    '[
      "الحياة الاجتماعية في المملكة العربية السعودية",
      "التراث الشعبي في المنطقة الوسطى",
      "صور من الماضي: توثيق الحياة في نجد",
      "المقتنيات التراثية: دراسة وتوثيق"
    ]'::jsonb,
    4
  ),
  (
    'سعد عبد الله الصويان',
    'الباحث والأكاديمي في التراث الشفهي',
    'https://sowayansaad.com/wp-content/uploads/2021/11/SS_icon.png',
    '1959 - حتى الآن',
    'باحث وأكاديمي متخصص في التراث الشفهي والثقافة الشعبية. أسهم في توثيق وتحليل الشعر النبطي والتراث الشفهي في الجزيرة العربية.',
    '[
      "حاصل على الدكتوراه في الأنثروبولوجيا من جامعة كاليفورنيا، بيركلي",
      "مؤسس مشروع توثيق التراث الشفهي في المملكة",
      "عضو مجلس إدارة الجمعية السعودية للمحافظة على التراث",
      "حاصل على جائزة الملك فيصل العالمية للدراسات الإسلامية"
    ]'::jsonb,
    '[
      "الشعر النبطي: ذائقة الشعب وسلطة النص",
      "الصحراء العربية: ثقافتها وشعرها عبر العصور",
      "أبحاث في الشعر النبطي والتراث الشفهي",
      "التراث الشفهي في المملكة العربية السعودية"
    ]'::jsonb,
    5
  ),
  (
    'لمياء باعشن',
    'الباحثة والأكاديمية في التراث الشعبي',
    'https://www.spa.gov.sa/media/uploads/2023/05/1684673400_1.jpg',
    '1965 - حتى الآن',
    'باحثة وأكاديمية سعودية متخصصة في التراث الشعبي والثقافة المادية. لها إسهامات بارزة في توثيق التراث الشعبي النسائي في المملكة العربية السعودية.',
    '[
      "حاصلة على الدكتوراه في التراث الشعبي من جامعة الملك عبد العزيز",
      "مؤسسة مشروع توثيق التراث النسائي في مكة المكرمة",
      "عضو في الجمعية السعودية للمحافظة على التراث",
      "حاصلة على جائزة التميز في البحث العلمي في مجال التراث الشعبي",
      "مشرفة على العديد من مشاريع توثيق الحرف اليدوية التقليدية"
    ]'::jsonb,
    '[
      "المرأة والتراث الشعبي في مكة المكرمة",
      "الحرف اليدوية النسائية التقليدية في المملكة العربية السعودية",
      "عادات وتقاليد الزواج في مكة المكرمة",
      "توثيق التراث الشعبي النسائي: منهجية وتطبيقات"
    ]'::jsonb,
    6
  );