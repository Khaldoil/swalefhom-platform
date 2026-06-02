-- Add story_type column to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS story_type text NOT NULL DEFAULT 'real';

-- Add check constraint to ensure valid story types
ALTER TABLE stories 
ADD CONSTRAINT valid_story_type CHECK (story_type IN ('real', 'fiction'));

-- Update existing stories to have 'real' as default type
UPDATE stories SET story_type = 'real' WHERE story_type IS NULL;