/*
  # إصلاح دالة إحصائيات الصفحة الرئيسية
  
  إصلاح المشكلة: جدول pioneers ليس له عمود status
*/

DROP FUNCTION IF EXISTS get_home_stats();

CREATE FUNCTION get_home_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'stories_count', (SELECT COUNT(*) FROM stories WHERE status = 'published'),
    'storytellers_count', (SELECT COUNT(DISTINCT user_id) FROM stories WHERE status = 'published' AND user_id IS NOT NULL),
    'published_stories_count', (SELECT COUNT(*) FROM stories WHERE status = 'published'),
    'pioneers_count', (SELECT COUNT(*) FROM pioneers),
    'gallery_count', (SELECT COUNT(*) FROM gallery_items WHERE status = 'published'),
    'blog_count', (SELECT COUNT(*) FROM blog_posts WHERE status = 'published'),
    'regions_count', 13,
    'ambassadors_count', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'ambassador'),
    'total_views', COALESCE((SELECT SUM(total_views) FROM daily_stats), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;
