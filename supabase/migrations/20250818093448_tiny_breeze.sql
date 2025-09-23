/*
  # Create Garden Room Entry

  1. New Room Entry
    - Creates a dedicated "Garden" room entry in the rooms table
    - This will be used specifically for garden checklist submissions
    - Ensures proper separation between room checklists and garden checklists

  2. Purpose
    - Provides a distinct room_id for garden checklist submissions
    - Prevents garden checklists from being mixed with regular room checklists
    - Enables proper filtering and display in admin dashboards
*/

-- First, get a property_id to associate with the Garden room
-- We'll use the first available property, or you can specify a particular one
DO $$
DECLARE
    garden_property_id uuid;
BEGIN
    -- Get the first available property ID
    SELECT id INTO garden_property_id 
    FROM properties 
    LIMIT 1;
    
    -- If no properties exist, we'll need to handle this case
    IF garden_property_id IS NULL THEN
        RAISE EXCEPTION 'No properties found. Please create at least one property before adding the Garden room.';
    END IF;
    
    -- Insert the Garden room entry if it doesn't already exist
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
        garden_property_id,
        0,
        'N/A',
        false,
        false,
        false,
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM rooms WHERE room_name = 'Garden'
    );
    
    -- Log the result
    IF FOUND THEN
        RAISE NOTICE 'Garden room created successfully with property_id: %', garden_property_id;
    ELSE
        RAISE NOTICE 'Garden room already exists, skipping creation';
    END IF;
END $$;