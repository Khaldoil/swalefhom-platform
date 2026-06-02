-- Create blog_posts table
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

-- Create policies
CREATE POLICY "Public read access"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert some sample blog posts
INSERT INTO blog_posts (title, content, excerpt, category, author, status)
VALUES 
(
  'التراث الشفهي: أهميته وطرق توثيقه',
  'يعد التراث الشفهي جزءاً أساسياً من هويتنا الثقافية. في هذا المقال، نستكشف أهمية توثيق القصص والحكايات التي تناقلتها الأجيال عبر السنين، ونقدم منهجية علمية لتوثيق هذا التراث الثمين.',
  'نظرة عميقة في أهمية التراث الشفهي وأفضل الممارسات لتوثيقه',
  'heritage',
  'د. سعد الصويان',
  'published'
),
(
  'حكايات من الماضي: قصص الرحالة والتجار',
  'في هذا المقال، نستعرض مجموعة من القصص المشوقة التي رواها التجار والرحالة عن رحلاتهم عبر طرق التجارة القديمة في الجزيرة العربية.',
  'قصص مثيرة من ذكريات التجار والرحالة في الجزيرة العربية',
  'stories',
  'محمد القويعي',
  'published'
),
(
  'مقابلة خاصة: مع حافظ التراث',
  'حوار شيق مع أحد أبرز حفاظ التراث في المملكة، يروي فيه تجربته في جمع وتوثيق القصص والحكايات الشعبية.',
  'حوار خاص مع أحد رواد حفظ التراث في المملكة',
  'interviews',
  'عبدالله السليم',
  'published'
);