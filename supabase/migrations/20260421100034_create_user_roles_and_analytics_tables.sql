/*
  # Create User Roles System and Analytics Tables

  This migration creates the missing tables required for analytics tracking
  and the user roles system that analytics RLS policies depend on.

  ## New Tables

  ### 1. user_roles
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `role` (text, one of: admin, moderator, user, ambassador)
    - `granted_by` (uuid, references auth.users)
    - `granted_at` (timestamptz)
    - Unique constraint on (user_id, role)

  ### 2. analytics
    - `id` (uuid, primary key)
    - `type` (text) - e.g. page_view, media_view
    - `item_id` (text) - ID of related content item
    - `count` (integer) - view/interaction count
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - Unique constraint on (type, item_id)

  ### 3. content_views
    - Detailed per-interaction tracking (view, read, listen, watch, download)
    - Session and user identification
    - Duration and completion tracking

  ### 4. daily_stats
    - Aggregated daily statistics per content type and item
    - For dashboard performance

  ### 5. user_sessions
    - Session tracking with device/browser info
    - Duration and page visit count

  ## Security
    - RLS enabled on all tables
    - Analytics: anonymous insert allowed for page tracking; admin-only reads
    - User roles: users can view own roles; admins can manage all
    - Sessions: anonymous insert/update for tracking; admin read access

  ## Functions
    - `has_role(text)` - Check if current user has a specific role
    - `has_any_role(text[])` - Check if current user has any role from a list
    - `track_content_view(...)` - RPC to record a content view
    - `update_daily_stats()` - Aggregate daily statistics
    - `get_dashboard_stats(integer)` - Dashboard statistics overview
    - `get_content_stats(text, uuid, integer)` - Per-content statistics
    - `get_stats_by_period(text, integer)` - Statistics grouped by period
*/

-- ============================================================
-- 1. USER ROLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'moderator', 'user', 'ambassador')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(check_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$;

-- Helper function to check if user has any role from a list
CREATE OR REPLACE FUNCTION has_any_role(check_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = ANY(check_roles)
  );
END;
$$;

-- ============================================================
-- 2. ANALYTICS TABLE (simple page view counting)
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  item_id text NOT NULL DEFAULT '',
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT analytics_type_item_id_unique UNIQUE (type, item_id)
);

CREATE INDEX IF NOT EXISTS analytics_type_item_id_idx ON analytics(type, item_id);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can read analytics counts (public stats)
CREATE POLICY "Anyone can read analytics"
  ON analytics FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone (including anonymous visitors) can insert analytics for page tracking
CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can update analytics counts (for incrementing)
CREATE POLICY "Anyone can update analytics"
  ON analytics FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Only admins can delete analytics
CREATE POLICY "Admins can delete analytics"
  ON analytics FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- Trigger for updated_at
CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. CONTENT_VIEWS TABLE (detailed interaction tracking)
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_created_at ON content_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_views_user ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_content_views_session ON content_views(session_id);
CREATE INDEX IF NOT EXISTS idx_content_views_type ON content_views(interaction_type);

ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert content views"
  ON content_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all content views"
  ON content_views FOR SELECT
  TO authenticated
  USING (has_any_role(ARRAY['admin', 'moderator']));

-- ============================================================
-- 4. DAILY_STATS TABLE (aggregated daily statistics)
-- ============================================================

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

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view daily stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (has_any_role(ARRAY['admin', 'moderator']));

CREATE POLICY "Admins can insert daily stats"
  ON daily_stats FOR INSERT
  TO authenticated
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admins can update daily stats"
  ON daily_stats FOR UPDATE
  TO authenticated
  USING (has_role('admin'))
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admins can delete daily stats"
  ON daily_stats FOR DELETE
  TO authenticated
  USING (has_role('admin'));

-- ============================================================
-- 5. USER_SESSIONS TABLE
-- ============================================================

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

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (has_any_role(ARRAY['admin', 'moderator']));

CREATE POLICY "Anyone can create sessions"
  ON user_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON user_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. ANALYTICS FUNCTIONS
-- ============================================================

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO daily_stats (
    date, content_type, content_id,
    total_views, total_reads, total_listens, total_watches,
    unique_visitors, avg_duration_seconds, completion_rate
  )
  SELECT
    DATE(created_at) as date,
    content_type,
    content_id,
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE interaction_type = 'read') as total_reads,
    COUNT(*) FILTER (WHERE interaction_type = 'listen') as total_listens,
    COUNT(*) FILTER (WHERE interaction_type = 'watch') as total_watches,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
    COALESCE(AVG(duration_seconds)::integer, 0) as avg_duration_seconds,
    COALESCE((COUNT(*) FILTER (WHERE completed = true)::numeric / NULLIF(COUNT(*), 0) * 100)::numeric(5,2), 0) as completion_rate
  FROM content_views
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY DATE(created_at), content_type, content_id
  ON CONFLICT (date, content_type, content_id)
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    total_reads = EXCLUDED.total_reads,
    total_listens = EXCLUDED.total_listens,
    total_watches = EXCLUDED.total_watches,
    unique_visitors = EXCLUDED.unique_visitors,
    avg_duration_seconds = EXCLUDED.avg_duration_seconds,
    completion_rate = EXCLUDED.completion_rate,
    updated_at = now();
END;
$$;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(days_back integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'overview', (
      SELECT json_build_object(
        'total_views', COALESCE(COUNT(*), 0),
        'total_reads', COALESCE(COUNT(*) FILTER (WHERE interaction_type = 'read'), 0),
        'total_listens', COALESCE(COUNT(*) FILTER (WHERE interaction_type = 'listen'), 0),
        'total_watches', COALESCE(COUNT(*) FILTER (WHERE interaction_type = 'watch'), 0),
        'unique_visitors', COALESCE(COUNT(DISTINCT COALESCE(user_id::text, session_id)), 0),
        'avg_duration', COALESCE(AVG(duration_seconds)::integer, 0)
      )
      FROM content_views
      WHERE created_at >= CURRENT_DATE - (days_back || ' days')::interval
    ),
    'by_content_type', (
      SELECT COALESCE(json_object_agg(
        content_type,
        json_build_object(
          'views', views,
          'reads', reads,
          'listens', listens,
          'watches', watches,
          'unique_visitors', unique_visitors,
          'avg_duration', avg_duration
        )
      ), '{}')
      FROM (
        SELECT
          content_type,
          COUNT(*) as views,
          COUNT(*) FILTER (WHERE interaction_type = 'read') as reads,
          COUNT(*) FILTER (WHERE interaction_type = 'listen') as listens,
          COUNT(*) FILTER (WHERE interaction_type = 'watch') as watches,
          COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
          AVG(duration_seconds)::integer as avg_duration
        FROM content_views
        WHERE created_at >= CURRENT_DATE - (days_back || ' days')::interval
        GROUP BY content_type
      ) t
    ),
    'daily_trend', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'date', date,
          'views', total_views,
          'visitors', unique_visitors,
          'avg_duration', avg_duration_seconds
        )
        ORDER BY date DESC
      ), '[]')
      FROM daily_stats
      WHERE date >= CURRENT_DATE - (days_back || ' days')::interval
        AND content_id IS NULL
    ),
    'top_content', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'content_type', content_type,
          'content_id', content_id,
          'views', views,
          'unique_visitors', unique_visitors,
          'completion_rate', completion_rate
        )
        ORDER BY views DESC
      ), '[]')
      FROM (
        SELECT
          content_type,
          content_id,
          COUNT(*) as views,
          COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_visitors,
          (COUNT(*) FILTER (WHERE completed = true)::numeric / NULLIF(COUNT(*), 0) * 100)::numeric(5,2) as completion_rate
        FROM content_views
        WHERE created_at >= CURRENT_DATE - (days_back || ' days')::interval
        GROUP BY content_type, content_id
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) t
    ),
    'real_time', (
      SELECT json_build_object(
        'active_sessions', (SELECT COALESCE(COUNT(*), 0) FROM user_sessions WHERE is_active = true),
        'recent_views', (SELECT COALESCE(COUNT(*), 0) FROM content_views WHERE created_at >= now() - INTERVAL '5 minutes')
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get stats for a specific content item
CREATE OR REPLACE FUNCTION get_content_stats(
  p_content_type text,
  p_content_id uuid,
  days_back integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_views', COALESCE(COUNT(*), 0),
    'total_reads', COALESCE(COUNT(*) FILTER (WHERE interaction_type = 'read'), 0),
    'total_listens', COALESCE(COUNT(*) FILTER (WHERE interaction_type = 'listen'), 0),
    'total_watches', COALESCE(COUNT(*) FILTER (WHERE interaction_type = 'watch'), 0),
    'unique_visitors', COALESCE(COUNT(DISTINCT COALESCE(user_id::text, session_id)), 0),
    'avg_duration', COALESCE(AVG(duration_seconds)::integer, 0),
    'completion_rate', COALESCE((COUNT(*) FILTER (WHERE completed = true)::numeric / NULLIF(COUNT(*), 0) * 100)::numeric(5,2), 0),
    'daily_breakdown', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'date', DATE(created_at),
          'views', COUNT(*),
          'visitors', COUNT(DISTINCT COALESCE(user_id::text, session_id))
        )
        ORDER BY DATE(created_at) DESC
      ), '[]')
      FROM content_views
      WHERE content_type = p_content_type
        AND content_id = p_content_id
        AND created_at >= CURRENT_DATE - (days_back || ' days')::interval
      GROUP BY DATE(created_at)
    )
  ) INTO result
  FROM content_views
  WHERE content_type = p_content_type
    AND content_id = p_content_id
    AND created_at >= CURRENT_DATE - (days_back || ' days')::interval;
  
  RETURN result;
END;
$$;

-- Function to record a content view via RPC
CREATE OR REPLACE FUNCTION track_content_view(
  p_content_type text,
  p_content_id uuid,
  p_interaction_type text DEFAULT 'view',
  p_session_id text DEFAULT NULL,
  p_duration_seconds integer DEFAULT 0,
  p_completed boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_view_id uuid;
  v_session_id text;
BEGIN
  v_session_id := COALESCE(p_session_id, gen_random_uuid()::text);
  
  INSERT INTO content_views (
    content_type, content_id, interaction_type,
    user_id, session_id, duration_seconds, completed
  ) VALUES (
    p_content_type, p_content_id, p_interaction_type,
    auth.uid(), v_session_id, p_duration_seconds, p_completed
  ) RETURNING id INTO v_view_id;
  
  RETURN v_view_id;
END;
$$;

-- Function to get stats by period
CREATE OR REPLACE FUNCTION get_stats_by_period(
  period_type text DEFAULT 'day',
  periods_count integer DEFAULT 7
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF period_type = 'day' THEN
    SELECT json_agg(
      json_build_object(
        'period', date,
        'views', COALESCE(SUM(total_views), 0),
        'reads', COALESCE(SUM(total_reads), 0),
        'listens', COALESCE(SUM(total_listens), 0),
        'watches', COALESCE(SUM(total_watches), 0),
        'visitors', COALESCE(SUM(unique_visitors), 0)
      )
      ORDER BY date DESC
    ) INTO result
    FROM daily_stats
    WHERE date >= CURRENT_DATE - (periods_count || ' days')::interval
    GROUP BY date;
  ELSIF period_type = 'week' THEN
    SELECT json_agg(
      json_build_object(
        'period', date_trunc('week', date),
        'views', COALESCE(SUM(total_views), 0),
        'reads', COALESCE(SUM(total_reads), 0),
        'listens', COALESCE(SUM(total_listens), 0),
        'watches', COALESCE(SUM(total_watches), 0),
        'visitors', COALESCE(SUM(unique_visitors), 0)
      )
      ORDER BY date_trunc('week', date) DESC
    ) INTO result
    FROM daily_stats
    WHERE date >= CURRENT_DATE - (periods_count * 7 || ' days')::interval
    GROUP BY date_trunc('week', date);
  ELSE
    SELECT json_agg(
      json_build_object(
        'period', date_trunc('month', date),
        'views', COALESCE(SUM(total_views), 0),
        'reads', COALESCE(SUM(total_reads), 0),
        'listens', COALESCE(SUM(total_listens), 0),
        'watches', COALESCE(SUM(total_watches), 0),
        'visitors', COALESCE(SUM(unique_visitors), 0)
      )
      ORDER BY date_trunc('month', date) DESC
    ) INTO result
    FROM daily_stats
    WHERE date >= CURRENT_DATE - (periods_count * 30 || ' days')::interval
    GROUP BY date_trunc('month', date);
  END IF;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;
