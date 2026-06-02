-- Update storage bucket configuration to include MP3 format
UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'audio/mpeg')
WHERE id = 'stories';

-- Ensure the format column accepts audio files
ALTER TABLE stories DROP CONSTRAINT IF EXISTS valid_format;
ALTER TABLE stories ADD CONSTRAINT valid_format CHECK (format IN ('written', 'voice', 'video', 'audio'));

-- Update any existing voice format entries to audio
UPDATE stories SET format = 'audio' WHERE format = 'voice';