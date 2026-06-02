-- Create books table if it doesn't exist
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text NOT NULL,
  cover_url text,
  download_url text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies with checks to avoid duplicates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' AND policyname = 'Public can view published books'
  ) THEN
    CREATE POLICY "Public can view published books"
      ON books
      FOR SELECT
      TO public
      USING (status = 'published');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' AND policyname = 'Authenticated users can manage books'
  ) THEN
    CREATE POLICY "Authenticated users can manage books"
      ON books
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add updated_at trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_books_updated_at'
  ) THEN
    CREATE TRIGGER update_books_updated_at
      BEFORE UPDATE ON books
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Create function to update book count in categories if it doesn't exist
CREATE OR REPLACE FUNCTION update_category_books_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET stories_count = stories_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET stories_count = stories_count - 1
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for books count if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_books_count_trigger'
  ) THEN
    CREATE TRIGGER update_books_count_trigger
      AFTER INSERT OR DELETE ON books
      FOR EACH ROW
      EXECUTE FUNCTION update_category_books_count();
  END IF;
END $$;

-- Insert book categories
INSERT INTO categories (name, description, icon, content_type, display_order)
VALUES 
  ('كتب التراث', 'كتب متخصصة في التراث السعودي', 'book', 'book', 1),
  ('الدراسات التاريخية', 'كتب ودراسات في تاريخ المملكة', 'bookmark', 'book', 2),
  ('الفنون الشعبية', 'كتب عن الفنون والحرف التقليدية', 'book-open', 'book', 3),
  ('المعاجم والقواميس', 'معاجم وقواميس للألفاظ التراثية', 'book', 'book', 4)
ON CONFLICT DO NOTHING;