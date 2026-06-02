/*
  # Drop unused indexes

  1. Purpose
    - Remove indexes that are not being used to reduce database maintenance overhead
    - Improves write performance and reduces storage

  2. Indexes Removed
    - idx_blog_posts_user_id
    - idx_books_category_id
    - idx_books_user_id
    - idx_gallery_items_user_id
    - idx_story_annotations_created_by
    - idx_story_media_story_id
    - idx_story_media_user_id
    - idx_storytellers_user_id
    - idx_user_roles_granted_by
    - idx_content_views_user_id
    - idx_user_sessions_user_id
*/

DROP INDEX IF EXISTS idx_blog_posts_user_id;
DROP INDEX IF EXISTS idx_books_category_id;
DROP INDEX IF EXISTS idx_books_user_id;
DROP INDEX IF EXISTS idx_gallery_items_user_id;
DROP INDEX IF EXISTS idx_story_annotations_created_by;
DROP INDEX IF EXISTS idx_story_media_story_id;
DROP INDEX IF EXISTS idx_story_media_user_id;
DROP INDEX IF EXISTS idx_storytellers_user_id;
DROP INDEX IF EXISTS idx_user_roles_granted_by;
DROP INDEX IF EXISTS idx_content_views_user_id;
DROP INDEX IF EXISTS idx_user_sessions_user_id;
