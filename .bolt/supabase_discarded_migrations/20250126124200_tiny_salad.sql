-- Update pioneers display order based on birth years
UPDATE pioneers 
SET display_order = CASE name
  WHEN 'عبد الكريم بن عبد العزيز الجهيمان' THEN 1  -- 1914
  WHEN 'عبد الله بن محمد بن خميس' THEN 2           -- 1919
  WHEN 'محمد بن عبد العزيز القويعي' THEN 3         -- 1950
  WHEN 'سعد عبد الله الصويان' THEN 4                -- 1959
  WHEN 'لمياء باعشن' THEN 5                         -- 1965
  ELSE display_order
END;

-- Add comment to explain the ordering
COMMENT ON COLUMN pioneers.display_order IS 'Order based on birth year, from oldest to newest';