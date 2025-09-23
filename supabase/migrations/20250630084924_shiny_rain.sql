/*
  # Add display_order column to properties table

  1. Schema Changes
    - Add `display_order` column to `properties` table
    - Make it nullable integer
    - Add index for better query performance
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add display_order column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS display_order int;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_display_order ON properties(display_order);

-- Comment on column
COMMENT ON COLUMN properties.display_order IS 'Determines the order in which properties are displayed. Lower values appear first.';