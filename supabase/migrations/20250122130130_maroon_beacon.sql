-- Drop existing table and recreate with proper constraints
DROP TABLE IF EXISTS analytics CASCADE;

CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  item_id text NOT NULL DEFAULT '',
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT analytics_type_item_id_unique UNIQUE (type, item_id)
);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON analytics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access"
  ON analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON analytics
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX analytics_type_item_id_idx ON analytics(type, item_id);