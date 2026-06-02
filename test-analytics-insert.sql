-- اختبار إدخال بيانات تجريبية في نظام الإحصائيات

-- 1. إنشاء بعض جلسات تجريبية
INSERT INTO user_sessions (session_id, device_type, browser, pages_visited, duration_seconds, is_active)
VALUES
  ('test-session-1', 'desktop', 'Chrome', 5, 320, false),
  ('test-session-2', 'mobile', 'Safari', 3, 180, false),
  ('test-session-3', 'tablet', 'Firefox', 7, 450, false),
  ('test-session-4', 'desktop', 'Edge', 4, 280, true);

-- 2. إضافة مشاهدات للقصص (نحتاج IDs حقيقية من جدول stories)
-- هذا مثال، استبدل بـ IDs الحقيقية
DO $$
DECLARE
  story_ids uuid[];
  pioneer_ids uuid[];
  gallery_ids uuid[];
  i integer;
BEGIN
  -- الحصول على بعض IDs من القصص
  SELECT array_agg(id) INTO story_ids FROM stories LIMIT 5;
  SELECT array_agg(id) INTO pioneer_ids FROM pioneers LIMIT 3;
  SELECT array_agg(id) INTO gallery_ids FROM gallery_items LIMIT 4;

  -- إضافة مشاهدات للقصص
  IF array_length(story_ids, 1) > 0 THEN
    FOR i IN 1..50 LOOP
      INSERT INTO content_views (
        content_type,
        content_id,
        interaction_type,
        session_id,
        duration_seconds,
        completed,
        device_type,
        created_at
      ) VALUES (
        'story',
        story_ids[1 + (i % array_length(story_ids, 1))],
        CASE WHEN random() < 0.7 THEN 'read' ELSE 'listen' END,
        'test-session-' || (1 + (i % 4)),
        60 + floor(random() * 300)::integer,
        random() < 0.6,
        CASE floor(random() * 3)
          WHEN 0 THEN 'desktop'
          WHEN 1 THEN 'mobile'
          ELSE 'tablet'
        END,
        now() - (floor(random() * 30) || ' days')::interval
      );
    END LOOP;
  END IF;

  -- إضافة مشاهدات للرواد
  IF array_length(pioneer_ids, 1) > 0 THEN
    FOR i IN 1..30 LOOP
      INSERT INTO content_views (
        content_type,
        content_id,
        interaction_type,
        session_id,
        duration_seconds,
        completed,
        device_type,
        created_at
      ) VALUES (
        'pioneer',
        pioneer_ids[1 + (i % array_length(pioneer_ids, 1))],
        'view',
        'test-session-' || (1 + (i % 4)),
        30 + floor(random() * 180)::integer,
        random() < 0.7,
        CASE floor(random() * 3)
          WHEN 0 THEN 'desktop'
          WHEN 1 THEN 'mobile'
          ELSE 'tablet'
        END,
        now() - (floor(random() * 30) || ' days')::interval
      );
    END LOOP;
  END IF;

  -- إضافة مشاهدات للمعرض
  IF array_length(gallery_ids, 1) > 0 THEN
    FOR i IN 1..40 LOOP
      INSERT INTO content_views (
        content_type,
        content_id,
        interaction_type,
        session_id,
        duration_seconds,
        completed,
        device_type,
        created_at
      ) VALUES (
        'gallery',
        gallery_ids[1 + (i % array_length(gallery_ids, 1))],
        CASE WHEN random() < 0.5 THEN 'view' ELSE 'watch' END,
        'test-session-' || (1 + (i % 4)),
        20 + floor(random() * 120)::integer,
        random() < 0.5,
        CASE floor(random() * 3)
          WHEN 0 THEN 'desktop'
          WHEN 1 THEN 'mobile'
          ELSE 'tablet'
        END,
        now() - (floor(random() * 30) || ' days')::interval
      );
    END LOOP;
  END IF;
END $$;

-- 3. تحديث الإحصائيات اليومية
SELECT update_daily_stats();

-- عرض النتائج
SELECT 'إجمالي المشاهدات' as metric, COUNT(*)::text as value FROM content_views
UNION ALL
SELECT 'القراءات', COUNT(*)::text FROM content_views WHERE interaction_type = 'read'
UNION ALL
SELECT 'الاستماع', COUNT(*)::text FROM content_views WHERE interaction_type = 'listen'
UNION ALL
SELECT 'المشاهدات المرئية', COUNT(*)::text FROM content_views WHERE interaction_type = 'watch'
UNION ALL
SELECT 'الزوار الفريدون', COUNT(DISTINCT session_id)::text FROM content_views
UNION ALL
SELECT 'الجلسات', COUNT(*)::text FROM user_sessions;
