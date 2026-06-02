/*
  # Add indexes on foreign key columns

  1. Purpose
    - Create indexes on all foreign key columns to improve query performance
    - Fixes unindexed foreign key warnings from security audit

  2. Indexes Added
    - blog_posts(user_id)
    - books(category_id, user_id)
    - gallery_items(user_id)
    - stories(user_id)
    - story_annotations(created_by)
    - story_media(story_id, user_id)
    - storytellers(user_id)
    - user_roles(granted_by)
*/

CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_user_id ON gallery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_story_annotations_created_by ON story_annotations(created_by);
CREATE INDEX IF NOT EXISTS idx_story_media_story_id ON story_media(story_id);
CREATE INDEX IF NOT EXISTS idx_story_media_user_id ON story_media(user_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_user_id ON storytellers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON user_roles(granted_by);
