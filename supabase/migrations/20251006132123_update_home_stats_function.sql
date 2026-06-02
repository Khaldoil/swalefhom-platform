/*
  # تحديث دالة إحصائيات الصفحة الرئيسية
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
    'pioneers_count', (SELECT COUNT(*) FROM pioneers WHERE status = 'published'),
    'gallery_count', (SELECT COUNT(*) FROM gallery_items WHERE status = 'published'),
    'blog_count', (SELECT COUNT(*) FROM blog_posts WHERE status = 'published'),
    'total_views', COALESCE((SELECT SUM(total_views) FROM daily_stats), 0),
    'active_ambassadors', (SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = 'ambassador')
  ) INTO result;
  
  RETURN result;
END;
$$;
