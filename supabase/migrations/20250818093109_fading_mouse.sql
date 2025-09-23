/*
  # Create Garden Room Entry

  1. New Room Entry
    - Creates a dedicated "Garden" room entry for garden checklist submissions
    - Uses the first available property as the parent property
    - Sets appropriate defaults for garden area (no beds, no furniture)

  2. Purpose
    - Provides a distinct room_id for garden checklist submissions
    - Prevents garden checklists from being mixed with regular room checklists
    - Enables proper filtering and display in admin dashboard
*/

-- Insert a Garden room entry using the first available property
INSERT INTO rooms (
  room_name,
  property_id,
  number_of_beds,
  bed_type,
  has_cabinet,
  has_sofas,
  has_balcony,
  has_stairs
)
SELECT 
  'Garden',
  (SELECT id FROM properties LIMIT 1), -- Use first available property
  0, -- No beds in garden
  NULL, -- No bed type
  false, -- No cabinet
  false, -- No sofas  
  false, -- No balcony
  false  -- No stairs
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE room_name = 'Garden'
);