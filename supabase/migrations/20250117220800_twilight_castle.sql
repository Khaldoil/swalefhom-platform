/*
  # Initial Schema Setup

  1. New Tables
    - `stories`
    - `training_courses`
    - `events`
    - `glossary_terms`

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  region text NOT NULL,
  date text NOT NULL,
  category text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can read all published stories'
  ) THEN
    CREATE POLICY "Users can read all published stories"
      ON stories
      FOR SELECT
      USING (status = 'published');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Authenticated users can CRUD their own stories'
  ) THEN
    CREATE POLICY "Authenticated users can CRUD their own stories"
      ON stories
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Training Courses Table
CREATE TABLE IF NOT EXISTS training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  trainer text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  max_participants integer NOT NULL,
  requirements text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_courses' AND policyname = 'Users can read all published training courses'
  ) THEN
    CREATE POLICY "Users can read all published training courses"
      ON training_courses
      FOR SELECT
      USING (status = 'published');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_courses' AND policyname = 'Authenticated users can CRUD training courses'
  ) THEN
    CREATE POLICY "Authenticated users can CRUD training courses"
      ON training_courses
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  city text NOT NULL,
  location text NOT NULL,
  max_participants integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can read all published events'
  ) THEN
    CREATE POLICY "Users can read all published events"
      ON events
      FOR SELECT
      USING (status = 'published');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Authenticated users can CRUD events'
  ) THEN
    CREATE POLICY "Authenticated users can CRUD events"
      ON events
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Glossary Terms Table
CREATE TABLE IF NOT EXISTS glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  definition text NOT NULL,
  category text NOT NULL,
  example text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'glossary_terms' AND policyname = 'Users can read all glossary terms'
  ) THEN
    CREATE POLICY "Users can read all glossary terms"
      ON glossary_terms
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'glossary_terms' AND policyname = 'Authenticated users can CRUD glossary terms'
  ) THEN
    CREATE POLICY "Authenticated users can CRUD glossary terms"
      ON glossary_terms
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_stories_updated_at'
  ) THEN
    CREATE TRIGGER update_stories_updated_at
      BEFORE UPDATE ON stories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_training_courses_updated_at'
  ) THEN
    CREATE TRIGGER update_training_courses_updated_at
      BEFORE UPDATE ON training_courses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at'
  ) THEN
    CREATE TRIGGER update_events_updated_at
      BEFORE UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_glossary_terms_updated_at'
  ) THEN
    CREATE TRIGGER update_glossary_terms_updated_at
      BEFORE UPDATE ON glossary_terms
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;