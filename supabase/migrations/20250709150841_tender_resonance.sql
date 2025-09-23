/*
  # Add custom_price column to package_activity_items table

  1. Schema Changes
    - Add `custom_price` column to `package_activity_items` table
    - Numeric type to store monetary values with precision
    
  2. Data Migration
    - No data migration needed as this is a new column
    
  3. Comments
    - Add descriptive comment to explain the purpose of the column
*/

-- Add custom_price column to package_activity_items table
ALTER TABLE package_activity_items ADD COLUMN IF NOT EXISTS custom_price numeric;

-- Add comment to document the column
COMMENT ON COLUMN package_activity_items.custom_price IS 'Custom price override for this activity within the package. If null, the activity default price is used.';