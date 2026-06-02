/*
  # Add Storytellers Table and Leaderboard Views

  1. New Tables
    - `storytellers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `stories_count` (integer)
      - `region` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `storytellers` table
    - Add policies for public read access
    - Add policies for authenticated users to manage their profiles
*/

-- Create storytellers table
CREATE TABLE IF NOT EXISTS storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  avatar_url text,
  stories_count integer DEFAULT 0,
  region text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view storytellers"
  ON storytellers
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON storytellers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update stories count
CREATE OR REPLACE FUNCTION update_storyteller_stories_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE storytellers
    SET stories_count = stories_count + 1
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storytellers
    SET stories_count = stories_count - 1
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stories count
CREATE TRIGGER update_stories_count
  AFTER INSERT OR DELETE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_storyteller_stories_count();