/*
  # دوال الإحصائيات - Analytics Functions

  ## الدوال الجديدة

  ### 1. get_dashboard_stats
  - إحصائيات شاملة للوحة التحكم
  - إحصائيات حسب نوع المحتوى
  - الاتجاهات اليومية
  - المحتوى الأكثر مشاهدة

  ### 2. update_daily_stats
  - تحديث الإحصائيات اليومية
  - يتم تشغيلها تلقائياً

  ### 3. get_content_stats
  - إحصائيات محتوى معين
*/

-- دالة لتحديث الإحصائيات اليومية
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO daily_stats (
    date,
    content_type,
    content_id,
    total_views,
    total_reads,
    total_listens,
    total_watches,
    unique_visitors,
    avg_duration_seconds,
    completion_rate
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

-- دالة للحصول على إحصائيات Dashboard الشاملة
CREATE OR REPLACE FUNCTION get_dashboard_stats(days_back integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
        'active_sessions', COALESCE(COUNT(*), 0),
        'recent_views', COALESCE(COUNT(*), 0)
      )
      FROM (
        SELECT 1 FROM user_sessions WHERE is_active = true
        UNION ALL
        SELECT 1 FROM content_views WHERE created_at >= now() - INTERVAL '5 minutes'
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- دالة للحصول على إحصائيات محتوى معين
CREATE OR REPLACE FUNCTION get_content_stats(
  p_content_type text,
  p_content_id uuid,
  days_back integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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

-- دالة لتسجيل مشاهدة جديدة
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
AS $$
DECLARE
  v_view_id uuid;
  v_session_id text;
BEGIN
  -- إنشاء session_id إذا لم يكن موجوداً
  v_session_id := COALESCE(p_session_id, gen_random_uuid()::text);
  
  INSERT INTO content_views (
    content_type,
    content_id,
    interaction_type,
    user_id,
    session_id,
    duration_seconds,
    completed
  ) VALUES (
    p_content_type,
    p_content_id,
    p_interaction_type,
    auth.uid(),
    v_session_id,
    p_duration_seconds,
    p_completed
  ) RETURNING id INTO v_view_id;
  
  RETURN v_view_id;
END;
$$;

-- دالة للحصول على إحصائيات حسب الفترة
CREATE OR REPLACE FUNCTION get_stats_by_period(
  period_type text DEFAULT 'day', -- day, week, month
  periods_count integer DEFAULT 7
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
  ELSE -- month
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
