-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_story_submission ON stories;
DROP FUNCTION IF EXISTS notify_story_submission();

-- Recreate function with proper error handling
CREATE OR REPLACE FUNCTION notify_story_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function
  PERFORM extensions.http_post(
    url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/notify-story'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', current_setting('app.settings.anon_key'))
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )::text
  );
  
  -- Log the notification attempt
  INSERT INTO analytics (type, item_id, count)
  VALUES ('story_notification', NEW.id::text, 1)
  ON CONFLICT (type, item_id) DO UPDATE
  SET count = analytics.count + 1,
      updated_at = now();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent story submission
  RAISE WARNING 'Failed to send notification for story %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER on_story_submission
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION notify_story_submission();