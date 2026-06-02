-- Enable the HTTP extension
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_new_ambassador_application ON ambassador_applications;
DROP FUNCTION IF EXISTS notify_new_ambassador_application();

-- Recreate function using the correct schema
CREATE OR REPLACE FUNCTION notify_new_ambassador_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Resend API via Edge Function
  PERFORM extensions.http_post(
    url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/notify-ambassador'),
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

-- Recreate trigger
CREATE TRIGGER on_new_ambassador_application
  AFTER INSERT ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_ambassador_application();