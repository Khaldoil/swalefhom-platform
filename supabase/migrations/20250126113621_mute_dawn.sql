-- Drop existing data first to avoid conflicts
DELETE FROM pioneers WHERE name = 'محمد بن عبد العزيز القويعي';

-- Insert Al-Quwaie pioneer data
INSERT INTO pioneers (name, title, image_url, years, bio, achievements, books)
VALUES
  (
    'محمد بن عبد العزيز القويعي',
    'الباحث والمؤرخ في التراث السعودي',
    'https://www.alriyadh.com/media/article/2021/02/11/img/9897170774.jpg',
    '1950 - حتى الآن',
    'باحث ومؤرخ سعودي متخصص في التراث والتاريخ السعودي. له إسهامات كبيرة في توثيق التراث الشعبي والتاريخ الاجتماعي للمملكة العربية السعودية. عمل على جمع وتوثيق العديد من المقتنيات التراثية والصور التاريخية.',
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