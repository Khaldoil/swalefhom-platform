-- Drop the experience column requirement
ALTER TABLE ambassador_applications 
ALTER COLUMN experience DROP NOT NULL;

-- Set default value for experience
ALTER TABLE ambassador_applications 
ALTER COLUMN experience SET DEFAULT '';

-- Update existing rows
UPDATE ambassador_applications 
SET experience = ''
WHERE experience IS NULL;