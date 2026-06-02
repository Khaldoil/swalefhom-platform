/*
  # Fix function search paths

  1. Purpose
    - Set secure search_path on all functions to prevent injection attacks
    - Functions should have an immutable search_path
    - Improves security by preventing malicious schema poisoning

  2. Functions Updated
    - Category count functions
    - Notification functions
    - Role checking functions
    - Analytics and stats functions
    - Story and storyteller functions
*/

-- Category functions
ALTER FUNCTION update_category_content_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_category_stories_count() SET search_path = public, pg_temp;
ALTER FUNCTION update_category_books_count() SET search_path = public, pg_temp;

-- Notification functions
ALTER FUNCTION update_notifications_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION notify_ambassador_status_change() SET search_path = public, pg_temp;
ALTER FUNCTION notify_new_ambassador_application() SET search_path = public, pg_temp;
ALTER FUNCTION notify_story_submission() SET search_path = public, pg_temp;

-- Role functions
ALTER FUNCTION has_role(text) SET search_path = public, pg_temp;
ALTER FUNCTION has_any_role(text[]) SET search_path = public, pg_temp;

-- Stats and analytics functions
ALTER FUNCTION update_daily_stats() SET search_path = public, pg_temp;
ALTER FUNCTION get_dashboard_stats(integer) SET search_path = public, pg_temp;
ALTER FUNCTION get_content_stats(text, uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION track_content_view(text, uuid, text, text, integer, boolean) SET search_path = public, pg_temp;
ALTER FUNCTION get_stats_by_period(text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION get_home_stats() SET search_path = public, pg_temp;

-- Story and storyteller functions
ALTER FUNCTION update_stories_metadata() SET search_path = public, pg_temp;
ALTER FUNCTION update_storyteller_stories_count() SET search_path = public, pg_temp;

-- General update function
ALTER FUNCTION update_updated_at() SET search_path = public, pg_temp;
