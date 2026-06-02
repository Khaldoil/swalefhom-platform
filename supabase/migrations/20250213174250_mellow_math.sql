-- First update existing stories to have a default category
UPDATE stories 
SET category = 'folk_tales' 
WHERE category NOT IN ('lullabies', 'bedtime', 'folk_tales', 'historical', 'traditional_games', 'proverbs');

-- Then add format column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'format'
  ) THEN
    ALTER TABLE stories ADD COLUMN format text DEFAULT 'written';
    ALTER TABLE stories ADD CONSTRAINT valid_format CHECK (format IN ('written', 'audio', 'video'));
  END IF;
END $$;

-- Now we can safely update the category constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE stories ADD CONSTRAINT valid_category CHECK (
  category IN (
    'lullabies',      -- أهازيج الأمهات
    'bedtime',        -- حكايات ما قبل النوم
    'folk_tales',     -- الحكايات الشعبية
    'historical',     -- قصص تاريخية
    'traditional_games', -- الألعاب الشعبية
    'proverbs'        -- الأمثال والحكم
  )
);

-- Insert sample stories for new categories
INSERT INTO stories (
  title,
  content,
  excerpt,
  region,
  date,
  category,
  status,
  story_type,
  metadata,
  format
) VALUES 
(
  'أهزوجة النوم القديمة',
  'كانت جدتي تغني لنا هذه الأهزوجة قبل النوم: "نام نام يا صغيري، نامت عيون الطيور..."',
  'أهزوجة تراثية كانت تغنيها الجدات للأطفال قبل النوم',
  'riyadh',
  '1950',
  'lullabies',
  'published',
  'real',
  '{"teller_name": "نورة محمد", "teller_mobile": "0512345678", "teller_email": "test@example.com", "teller_age": "65", "teller_city": "الرياض", "story_source": "الجدة", "source_age": "90"}'::jsonb,
  'audio'
),
(
  'حكاية الصياد الشجاع',
  'كان جدي يحكي لنا قبل النوم قصة الصياد الشجاع الذي واجه المخاطر لإنقاذ قريته...',
  'حكاية شعبية عن الشجاعة والتضحية',
  'eastern',
  '1955',
  'bedtime',
  'published',
  'real',
  '{"teller_name": "أحمد علي", "teller_mobile": "0523456789", "teller_email": "test2@example.com", "teller_age": "70", "teller_city": "الدمام", "story_source": "الجد", "source_age": "85"}'::jsonb,
  'written'
),
(
  'لعبة الخشيشة',
  'كنا نلعب الخشيشة في أيام الطفولة، وهي لعبة تعتمد على المهارة والخفة...',
  'توثيق للعبة شعبية قديمة كان يمارسها الأطفال',
  'qassim',
  '1960',
  'traditional_games',
  'published',
  'real',
  '{"teller_name": "سعد محمد", "teller_mobile": "0534567890", "teller_email": "test3@example.com", "teller_age": "75", "teller_city": "بريدة", "story_source": "ذكريات شخصية", "source_age": "75"}'::jsonb,
  'video'
),
(
  'من قال: المكتوب على الجبين',
  'يروى أن أصل هذا المثل يعود إلى قصة حدثت في إحدى القرى القديمة...',
  'قصة عن أصل المثل الشعبي المشهور',
  'makkah',
  '1940',
  'proverbs',
  'published',
  'real',
  '{"teller_name": "عبدالله سعيد", "teller_mobile": "0545678901", "teller_email": "test4@example.com", "teller_age": "80", "teller_city": "مكة المكرمة", "story_source": "الوالد", "source_age": "95"}'::jsonb,
  'written'
);