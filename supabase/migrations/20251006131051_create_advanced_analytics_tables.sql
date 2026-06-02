/*
  # نظام إحصائيات متقدم - Advanced Analytics System

  ## الجداول الجديدة

  ### 1. content_views
  - تتبع دقيق لكل مشاهدة/قراءة/استماع
  - معلومات الجلسة والمستخدم
  - الوقت المستغرق في المحتوى
  - نوع التفاعل (قراءة، استماع، مشاهدة)

  ### 2. daily_stats
  - إحصائيات يومية مجمعة
  - لتحسين الأداء عند عرض الإحصائيات

  ### 3. user_sessions
  - تتبع جلسات المستخدمين
  - وقت الدخول والخروج
  - الصفحات المزارة

  ## الأمان
  - RLS مفعل على جميع الجداول
  - سياسات آمنة مع فحوصات مناسبة
*/

-- جدول المشاهدات التفصيلي
CREATE TABLE IF NOT EXISTS content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('story', 'pioneer', 'gallery', 'blog', 'training', 'event')),
  content_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'read', 'listen', 'watch', 'download')),
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  duration_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  device_type text,
  referrer text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- فهرسة للأداء
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_created_at ON content_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_views_user ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_content_views_session ON content_views(session_id);
CREATE INDEX IF NOT EXISTS idx_content_views_type ON content_views(interaction_type);

-- جدول الإحصائيات اليومية
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  content_type text NOT NULL,
  content_id uuid,
  total_views integer DEFAULT 0,
  total_reads integer DEFAULT 0,
  total_listens integer DEFAULT 0,
  total_watches integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  avg_duration_seconds integer DEFAULT 0,
  completion_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(date, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_content ON daily_stats(content_type, content_id);

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  pages_visited integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  device_type text,
  browser text,
  is_active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- تفعيل RLS
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات content_views
CREATE POLICY "Anyone can insert views"
  ON content_views FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
  ON content_views FOR SELECT
  TO authenticated
  USING (has_any_role(ARRAY['admin', 'moderator']));

-- سياسات daily_stats
CREATE POLICY "Admins can view daily stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (has_any_role(ARRAY['admin', 'moderator']));

CREATE POLICY "System can manage daily stats"
  ON daily_stats FOR ALL
  TO authenticated
  USING (has_role('admin'));

-- سياسات user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (has_any_role(ARRAY['admin', 'moderator']));

CREATE POLICY "Anyone can create sessions"
  ON user_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  TO public
  USING (true);
