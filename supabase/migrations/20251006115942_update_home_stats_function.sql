/*
  # تحديث دالة الإحصائيات لحساب المشاركين بدقة

  1. التحديثات
    - حساب المشاركين الفعليين من المستخدمين الذين ساهموا بمحتوى
    - جمع المستخدمين من جميع الجداول (stories, gallery_items, blog_posts, إلخ)
*/

-- تحديث دالة لجلب الإحصائيات مع حساب دقيق للمشاركين
CREATE OR REPLACE FUNCTION get_home_stats()
RETURNS TABLE (
  storytellers_count bigint,
  published_stories_count bigint,
  regions_count bigint,
  ambassadors_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- حساب المشاركين الفعليين من المستخدمين الذين ساهموا بأي محتوى
    (
      SELECT COUNT(DISTINCT user_id) 
      FROM (
        SELECT user_id FROM stories WHERE user_id IS NOT NULL AND status = 'published'
        UNION
        SELECT user_id FROM gallery_items WHERE user_id IS NOT NULL AND status = 'published'
        UNION
        SELECT user_id FROM blog_posts WHERE user_id IS NOT NULL AND status = 'published'
        UNION
        SELECT user_id FROM pioneers WHERE user_id IS NOT NULL
        UNION
        SELECT user_id FROM storytellers WHERE user_id IS NOT NULL
      ) AS active_users
    )::bigint as storytellers_count,
    
    -- عدد القصص المنشورة
    (SELECT COUNT(*) FROM stories WHERE status = 'published')::bigint as published_stories_count,
    
    -- عدد المناطق (ثابت 13)
    13::bigint as regions_count,
    
    -- عدد السفراء المعتمدين
    (SELECT COUNT(*) FROM ambassador_applications WHERE status = 'approved')::bigint as ambassadors_count;
END;
$$;
