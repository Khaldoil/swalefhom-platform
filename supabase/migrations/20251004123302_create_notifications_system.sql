/*
  # إنشاء نظام الإشعارات

  ## الجداول الجديدة
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - المستخدم المستلم
      - `type` (text) - نوع الإشعار (story_published, ambassador_status_update, etc.)
      - `title` (text) - عنوان الإشعار
      - `message` (text) - نص الإشعار
      - `data` (jsonb) - بيانات إضافية (story_id, application_id, etc.)
      - `read` (boolean) - حالة القراءة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ## الأمان
    - تفعيل RLS على جدول notifications
    - السياسات:
      - المستخدمون يمكنهم قراءة إشعاراتهم فقط
      - المستخدمون يمكنهم تحديث حالة قراءة إشعاراتهم
      - المدراء يمكنهم إنشاء إشعارات
*/

-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'story_published',
    'story_rejected',
    'ambassador_approved',
    'ambassador_rejected',
    'general'
  )),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- تفعيل RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسة: المستخدمون يمكنهم قراءة إشعاراتهم فقط
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- سياسة: المستخدمون يمكنهم تحديث حالة قراءة إشعاراتهم
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- سياسة: المدراء يمكنهم إنشاء إشعارات
CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN (
        SELECT email FROM auth.users WHERE email LIKE '%@admin%'
      )
    )
  );

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON notifications;
CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();
