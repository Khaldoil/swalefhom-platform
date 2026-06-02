-- Add order column to pioneers table
ALTER TABLE pioneers
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Update existing pioneers with order
UPDATE pioneers 
SET display_order = CASE name
  WHEN 'عبد الكريم بن عبد العزيز الجهيمان' THEN 1
  WHEN 'سعد عبد الله الصويان' THEN 2
  WHEN 'محمد بن عبد العزيز القويعي' THEN 3
  WHEN 'لمياء باعشن' THEN 4
  ELSE display_order
END;

-- Create index for faster ordering
CREATE INDEX IF NOT EXISTS pioneers_display_order_idx ON pioneers(display_order);