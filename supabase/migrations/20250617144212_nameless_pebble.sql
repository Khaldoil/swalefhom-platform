-- Create books table
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

-- Create policies
CREATE POLICY "Public can view published books"
  ON books
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage books"
  ON books
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to update book count in categories
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

-- Create trigger for books count
CREATE TRIGGER update_books_count_trigger
  AFTER INSERT OR DELETE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_category_books_count();

-- First check if 'book' is a valid content type, if not, alter the constraint
DO $$ 
BEGIN
  -- Check if we need to modify the constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'content_type_enum' 
    AND 'book' = ANY(enum_range(NULL::content_type_enum)::text[])
  ) THEN
    -- For enum type
    IF EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'content_type_enum'
    ) THEN
      ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'book';
    END IF;
    
    -- For check constraint
    IF EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'valid_content_type'
    ) THEN
      ALTER TABLE categories DROP CONSTRAINT valid_content_type;
      ALTER TABLE categories ADD CONSTRAINT valid_content_type 
        CHECK (content_type = ANY (ARRAY['story', 'blog', 'gallery', 'glossary', 'book']));
    END IF;
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