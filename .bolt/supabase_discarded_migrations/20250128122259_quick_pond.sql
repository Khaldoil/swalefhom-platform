-- Add story_type column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'story_type'
  ) THEN
    ALTER TABLE stories ADD COLUMN story_type text NOT NULL DEFAULT 'real';
  END IF;
END $$;

-- Add check constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_story_type'
  ) THEN
    ALTER TABLE stories 
    ADD CONSTRAINT valid_story_type CHECK (story_type IN ('real', 'fiction'));
  END IF;
END $$;

-- Update existing stories to have 'real' as default type
UPDATE stories SET story_type = 'real' WHERE story_type IS NULL;