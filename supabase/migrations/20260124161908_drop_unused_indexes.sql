/*
  # Drop unused indexes

  1. Purpose
    - Remove indexes that have not been used
    - Reduces database size and maintenance overhead
    - Improves write performance by reducing index updates

  2. Indexes Dropped
    - Daily stats: date, content
    - Stories and blog posts: created_at
    - Gallery items: status, media_type
    - User sessions, glossary terms, pioneers
    - User roles, notifications
    - Content views
    - Story annotations
*/

DROP INDEX IF EXISTS idx_daily_stats_date;
DROP INDEX IF EXISTS idx_daily_stats_content;
DROP INDEX IF EXISTS idx_stories_created_at;
DROP INDEX IF EXISTS idx_blog_posts_created_at;
DROP INDEX IF EXISTS idx_gallery_items_status;
DROP INDEX IF EXISTS idx_gallery_items_media_type;
DROP INDEX IF EXISTS idx_user_sessions_user;
DROP INDEX IF EXISTS idx_glossary_terms_category;
DROP INDEX IF EXISTS idx_glossary_terms_word;
DROP INDEX IF EXISTS idx_pioneers_user_id;
DROP INDEX IF EXISTS idx_user_roles_user;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_content_views_user;
DROP INDEX IF EXISTS idx_content_views_session;
DROP INDEX IF EXISTS idx_content_views_type;
DROP INDEX IF EXISTS idx_story_annotations_story_id;
