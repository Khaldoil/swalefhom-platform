/*
  # Create Analytics Table

  1. New Tables
    - `analytics`
      - `id` (uuid, primary key)
      - `type` (text) - Type of analytics (page_view, story_view, media_view)
      - `item_id` (text, nullable) - ID of the related item (story, media)
      - `count` (integer) - Number of views/interactions
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `analytics` table
    - Add policies for public read access and authenticated write access
*/

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  item_id text,
  count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON analytics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage analytics"
  ON analytics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();