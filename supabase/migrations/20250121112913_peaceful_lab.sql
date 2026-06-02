-- Update copyright for all existing gallery items
UPDATE gallery_items
SET copyright = 'Digital asset copyright: Pitt Rivers Museum, University of Oxford'
WHERE media_type = 'image';