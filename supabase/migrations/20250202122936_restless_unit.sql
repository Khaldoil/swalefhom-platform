-- Create function to send story submission notifications
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new story submissions
DROP TRIGGER IF EXISTS on_story_submission ON stories;
CREATE TRIGGER on_story_submission
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION notify_story_submission();