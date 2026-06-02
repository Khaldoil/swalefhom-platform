/*
  # إنشاء دالة لجلب إحصائيات الصفحة الرئيسية

  1. دالة جديدة
    - `get_home_stats()` - تجلب الإحصائيات الحقيقية من قاعدة البيانات
      - عدد الرواة
      - عدد القصص المنشورة
      - عدد المناطق المختلفة
      - عدد السفراء المعتمدين

  2. الوصول
    - متاحة للجميع (بدون مصادقة)
*/

-- إنشاء دالة لجلب الإحصائيات
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
    (SELECT COUNT(*) FROM storytellers)::bigint as storytellers_count,
    (SELECT COUNT(*) FROM stories WHERE status = 'published')::bigint as published_stories_count,
    (SELECT COUNT(DISTINCT region) FROM storytellers WHERE region IS NOT NULL AND region != '')::bigint as regions_count,
    (SELECT COUNT(*) FROM ambassador_applications WHERE status = 'approved')::bigint as ambassadors_count;
END;
$$;

-- السماح لجميع المستخدمين باستخدام هذه الدالة
GRANT EXECUTE ON FUNCTION get_home_stats() TO anon, authenticated;
