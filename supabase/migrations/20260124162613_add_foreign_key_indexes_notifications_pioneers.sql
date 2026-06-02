/*
  # Add foreign key indexes for notifications and pioneers

  1. Purpose
    - Create indexes on foreign key columns to improve query performance
    - These indexes are essential for foreign key constraint checks

  2. Indexes Added
    - notifications(user_id)
    - pioneers(user_id)
*/

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pioneers_user_id ON pioneers(user_id);
