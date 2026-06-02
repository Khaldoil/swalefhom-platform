-- Add source column to glossary_terms table
ALTER TABLE glossary_terms 
ADD COLUMN IF NOT EXISTS source text;

-- Update existing terms to have empty source if null
UPDATE glossary_terms 
SET source = ''
WHERE source IS NULL;