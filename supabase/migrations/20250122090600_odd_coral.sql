-- Create function to increment counter
CREATE OR REPLACE FUNCTION increment_counter()
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(count, 0) + 1
  FROM analytics
  WHERE id = current_setting('analytics.id')::uuid;
$$;

-- Add trigger to set analytics.id setting
CREATE OR REPLACE FUNCTION set_analytics_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('analytics.id', OLD.id::text, true);
  RETURN OLD;
END;
$$;

CREATE TRIGGER set_analytics_id_trigger
  BEFORE UPDATE ON analytics
  FOR EACH ROW
  EXECUTE FUNCTION set_analytics_id();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS analytics_type_item_id_idx 
ON analytics(type, item_id);