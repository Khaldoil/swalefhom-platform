/*
  # إنشاء جدول التفسيرات والتوضيحات للقصص

  ## الوصف
  يتيح هذا الجدول إضافة تفسيرات وتوضيحات لكلمات محددة في القصص التراثية،
  مما يساعد القراء على فهم المصطلحات والكلمات الصعبة.

  ## الجداول الجديدة
  - `story_annotations`
    - `id` (uuid): المعرف الفريد
    - `story_id` (uuid): معرف القصة (مرتبط بجدول stories)
    - `selected_text` (text): النص المحدد الذي سيتم تفسيره
    - `annotation` (text): التفسير أو التوضيح
    - `start_position` (integer): موقع بداية النص المحدد
    - `end_position` (integer): موقع نهاية النص المحدد
    - `color` (text): لون التمييز (اختياري)
    - `created_by` (uuid): المستخدم الذي أضاف التفسير
    - `created_at` (timestamptz): تاريخ الإنشاء
    - `updated_at` (timestamptz): تاريخ آخر تحديث

  ## الأمان
  - تفعيل RLS
  - سياسة قراءة عامة للجميع
  - سياسة إضافة/تعديل/حذف للمشرفين المصادق عليهم فقط

  ## الفهارس
  - فهرس على story_id لتحسين أداء الاستعلامات
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS story_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  selected_text text NOT NULL,
  annotation text NOT NULL,
  start_position integer NOT NULL,
  end_position integer NOT NULL,
  color text DEFAULT '#FAC39B',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_story_annotations_story_id 
  ON story_annotations(story_id);

-- إضافة فهرس على المواقع لتحسين البحث
CREATE INDEX IF NOT EXISTS idx_story_annotations_positions 
  ON story_annotations(story_id, start_position, end_position);

-- تفعيل RLS
ALTER TABLE story_annotations ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنهم القراءة
CREATE POLICY "Anyone can view annotations"
  ON story_annotations
  FOR SELECT
  TO public
  USING (true);

-- سياسة الإضافة: المستخدمون المصادق عليهم فقط
CREATE POLICY "Authenticated users can create annotations"
  ON story_annotations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة التحديث: المستخدمون المصادق عليهم فقط
CREATE POLICY "Authenticated users can update annotations"
  ON story_annotations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف: المستخدمون المصادق عليهم فقط
CREATE POLICY "Authenticated users can delete annotations"
  ON story_annotations
  FOR DELETE
  TO authenticated
  USING (true);

-- إضافة trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_story_annotations_updated_at
  BEFORE UPDATE ON story_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- إضافة تعليق على الجدول
COMMENT ON TABLE story_annotations IS 'جدول التفسيرات والتوضيحات للكلمات والعبارات في القصص التراثية';
