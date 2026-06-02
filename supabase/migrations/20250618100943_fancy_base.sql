-- Update existing book categories to have the correct content_type
UPDATE categories
SET content_type = 'book'
WHERE name IN ('كتب التراث', 'الدراسات التاريخية', 'الفنون الشعبية', 'المعاجم والقواميس')
  AND content_type = 'story';

-- Insert book categories if they don't exist
INSERT INTO categories (name, description, icon, content_type, display_order)
VALUES 
  ('كتب التراث', 'كتب متخصصة في التراث السعودي', 'book', 'book', 1),
  ('الدراسات التاريخية', 'كتب ودراسات في تاريخ المملكة', 'bookmark', 'book', 2),
  ('الفنون الشعبية', 'كتب عن الفنون والحرف التقليدية', 'book-open', 'book', 3),
  ('المعاجم والقواميس', 'معاجم وقواميس للألفاظ التراثية', 'book', 'book', 4)
ON CONFLICT DO NOTHING;

-- Update books to use the correct category_id
UPDATE books b
SET category_id = c.id
FROM categories c
WHERE b.category_id IN (
  SELECT id FROM categories WHERE content_type = 'story' AND name IN ('كتب التراث', 'الدراسات التاريخية', 'الفنون الشعبية', 'المعاجم والقواميس')
)
AND c.content_type = 'book' 
AND c.name = (
  SELECT name FROM categories WHERE id = b.category_id
);