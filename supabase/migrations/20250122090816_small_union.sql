-- Add unique constraint to prevent duplicate type/item_id combinations
ALTER TABLE analytics 
ADD CONSTRAINT analytics_type_item_id_unique UNIQUE (type, item_id);

-- Add index for faster lookups if not already exists
CREATE INDEX IF NOT EXISTS analytics_type_item_id_idx 
ON analytics(type, item_id);