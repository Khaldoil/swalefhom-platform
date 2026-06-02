/*
  # Fix function search paths (Corrected)

  1. Purpose
    - Set explicit search_path for all functions to prevent security issues
    - Prevents schema injection attacks

  2. Functions Updated
    - All 18 functions with correct signatures
*/

-- Set search_path for functions with no parameters
ALTER FUNCTION update_category_content_count() SET search_path = public;
ALTER FUNCTION update_category_stories_count() SET search_path = public;
ALTER FUNCTION update_notifications_updated_at() SET search_path = public;
ALTER FUNCTION update_category_books_count() SET search_path = public;
ALTER FUNCTION update_daily_stats() SET search_path = public;
ALTER FUNCTION get_home_stats() SET search_path = public;
ALTER FUNCTION notify_ambassador_status_change() SET search_path = public;
ALTER FUNCTION notify_new_ambassador_application() SET search_path = public;
ALTER FUNCTION notify_story_submission() SET search_path = public;
ALTER FUNCTION update_stories_metadata() SET search_path = public;
ALTER FUNCTION update_storyteller_stories_count() SET search_path = public;
ALTER FUNCTION update_updated_at() SET search_path = public;

-- Set search_path for functions with parameters
ALTER FUNCTION has_role(check_role text) SET search_path = public;
ALTER FUNCTION has_any_role(check_roles text[]) SET search_path = public;
ALTER FUNCTION get_dashboard_stats(days_back integer) SET search_path = public;
ALTER FUNCTION get_content_stats(p_content_type text, p_content_id uuid, days_back integer) SET search_path = public;
ALTER FUNCTION track_content_view(p_content_type text, p_content_id uuid, p_interaction_type text, p_session_id text, p_duration_seconds integer, p_completed boolean) SET search_path = public;
ALTER FUNCTION get_stats_by_period(period_type text, periods_count integer) SET search_path = public;
