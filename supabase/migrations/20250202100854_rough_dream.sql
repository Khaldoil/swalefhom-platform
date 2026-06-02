-- Create function to send email notifications via Resend
CREATE OR REPLACE FUNCTION notify_new_ambassador_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Resend API via Edge Function
  PERFORM net.http_post(
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

-- Create trigger for new applications
DROP TRIGGER IF EXISTS on_new_ambassador_application ON ambassador_applications;
CREATE TRIGGER on_new_ambassador_application
  AFTER INSERT ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_ambassador_application();