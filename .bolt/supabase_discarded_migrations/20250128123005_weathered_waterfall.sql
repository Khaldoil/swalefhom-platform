-- Drop existing policies with existence check
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access" ON pioneers;
  DROP POLICY IF EXISTS "Authenticated users can manage pioneers" ON pioneers;
END $$;

-- Create pioneers table if it doesn't exist
CREATE TABLE IF NOT EXISTS pioneers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  image_url text,
  years text NOT NULL,
  bio text NOT NULL,
  achievements jsonb DEFAULT '[]'::jsonb,
  books jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE pioneers ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ BEGIN
  -- Create policy for public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pioneers' 
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
      ON pioneers
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Create policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pioneers' 
    AND policyname = 'Authenticated users can manage pioneers'
  ) THEN
    CREATE POLICY "Authenticated users can manage pioneers"
      ON pioneers
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger with existence check
DO $$ BEGIN
  -- Create or replace the function
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create trigger if it doesn't exist
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

-- Insert initial pioneers data
INSERT INTO pioneers (name, title, image_url, years, bio, achievements, books)
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
    ]'::jsonb
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
    ]'::jsonb
  )
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  years = EXCLUDED.years,
  bio = EXCLUDED.bio,
  achievements = EXCLUDED.achievements,
  books = EXCLUDED.books,
  updated_at = now();