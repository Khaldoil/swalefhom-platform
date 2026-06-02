/*
  # Add remaining foreign key indexes

  1. Purpose
    - Create indexes on remaining foreign key columns to improve query performance
    - Fixes unindexed foreign key warnings

  2. Indexes Added
    - content_views(user_id)
    - notifications(user_id)
    - pioneers(user_id)
    - user_sessions(user_id)
*/

CREATE INDEX IF NOT EXISTS idx_content_views_user_id ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pioneers_user_id ON pioneers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
