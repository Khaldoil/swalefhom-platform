-- Drop the previous functions and triggers
DROP FUNCTION IF EXISTS increment_counter CASCADE;
DROP FUNCTION IF EXISTS set_analytics_id CASCADE;
DROP TRIGGER IF EXISTS set_analytics_id_trigger ON analytics;

-- Modify analytics table to ensure count is an integer
ALTER TABLE analytics 
ALTER COLUMN count SET DEFAULT 1,
ALTER COLUMN count SET NOT NULL,
ALTER COLUMN count SET DATA TYPE integer;