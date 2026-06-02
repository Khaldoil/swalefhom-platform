-- Add display_order column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pioneers' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE pioneers ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- Update existing pioneers with order
UPDATE pioneers 
SET display_order = CASE name
  WHEN 'عبد الكريم بن عبد العزيز الجهيمان' THEN 1
  WHEN 'سعد عبد الله الصويان' THEN 2
  WHEN 'محمد بن عبد العزيز القويعي' THEN 3
  WHEN 'لمياء باعشن' THEN 4
  ELSE display_order
END;

-- Create index for faster ordering if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'pioneers' AND indexname = 'pioneers_display_order_idx'
  ) THEN
    CREATE INDEX pioneers_display_order_idx ON pioneers(display_order);
  END IF;
END $$;