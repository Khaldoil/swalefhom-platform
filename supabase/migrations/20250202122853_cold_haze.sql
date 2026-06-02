-- Create function to send status update notifications
CREATE OR REPLACE FUNCTION notify_ambassador_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Call Edge Function
    PERFORM extensions.http_post(
      url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/notify-ambassador-status'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.anon_key'))
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS on_ambassador_status_change ON ambassador_applications;
CREATE TRIGGER on_ambassador_status_change
  AFTER UPDATE ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_ambassador_status_change();